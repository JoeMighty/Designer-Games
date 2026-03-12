const targetCanvas = document.getElementById('targetCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const tCtx = targetCanvas.getContext('2d');
const dCtx = drawCanvas.getContext('2d', { willReadFrequently: true });

Scoring.init('iconDesign', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

let activeTool = 'pen';
let activeColor = '#1A1A1A';
let strokeSize = 3;
let isDrawing = false;
let startPt = null;
let snapshot = null;

const SIZE = 200;

// Target icon definitions
const targetIcons = [
    {
        name: 'Home',
        draw(ctx) {
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            // Roof
            ctx.beginPath();
            ctx.moveTo(100, 30);
            ctx.lineTo(170, 90);
            ctx.lineTo(30, 90);
            ctx.closePath();
            ctx.stroke();
            // Door
            ctx.beginPath();
            ctx.rect(80, 110, 40, 60);
            ctx.stroke();
            // Walls
            ctx.beginPath();
            ctx.moveTo(40, 90);
            ctx.lineTo(40, 170);
            ctx.lineTo(160, 170);
            ctx.lineTo(160, 90);
            ctx.stroke();
        }
    },
    {
        name: 'Star',
        draw(ctx) {
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const innerAngle = outerAngle + (2 * Math.PI) / 10;
                const ox = 100 + Math.cos(outerAngle) * 75;
                const oy = 100 + Math.sin(outerAngle) * 75;
                const ix = 100 + Math.cos(innerAngle) * 32;
                const iy = 100 + Math.sin(innerAngle) * 32;
                if (i === 0) ctx.moveTo(ox, oy);
                else ctx.lineTo(ox, oy);
                ctx.lineTo(ix, iy);
            }
            ctx.closePath();
            ctx.stroke();
        }
    },
    {
        name: 'Message',
        draw(ctx) {
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            // Bubble
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(25, 30, 150, 110, 12) :
                ctx.rect(25, 30, 150, 110);
            ctx.stroke();
            // Tail
            ctx.beginPath();
            ctx.moveTo(50, 140);
            ctx.lineTo(40, 170);
            ctx.lineTo(80, 140);
            ctx.stroke();
            // Lines inside
            ctx.lineWidth = 3;
            [[50, 70, 150], [50, 90, 130], [50, 110, 110]].forEach(([x, y, x2]) => {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x2, y);
                ctx.stroke();
            });
        }
    },
    {
        name: 'Magnifier',
        draw(ctx) {
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            // Circle
            ctx.beginPath();
            ctx.arc(85, 85, 50, 0, Math.PI * 2);
            ctx.stroke();
            // Handle
            ctx.beginPath();
            ctx.moveTo(122, 122);
            ctx.lineTo(165, 165);
            ctx.stroke();
        }
    },
    {
        name: 'Heart',
        draw(ctx) {
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 5;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(100, 160);
            ctx.bezierCurveTo(30, 110, 20, 50, 60, 40);
            ctx.bezierCurveTo(80, 35, 95, 50, 100, 65);
            ctx.bezierCurveTo(105, 50, 120, 35, 140, 40);
            ctx.bezierCurveTo(180, 50, 170, 110, 100, 160);
            ctx.closePath();
            ctx.stroke();
        }
    },
    {
        name: 'Lightning',
        draw(ctx) {
            ctx.strokeStyle = '#1A1A1A';
            ctx.lineWidth = 5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(120, 20);
            ctx.lineTo(70, 105);
            ctx.lineTo(100, 105);
            ctx.lineTo(80, 180);
            ctx.lineTo(130, 90);
            ctx.lineTo(100, 90);
            ctx.closePath();
            ctx.stroke();
        }
    },
];

let currentIcon = null;

function getCanvasPt(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
    };
}

function drawTarget() {
    tCtx.clearRect(0, 0, SIZE, SIZE);
    tCtx.fillStyle = '#FFFBF7';
    tCtx.fillRect(0, 0, SIZE, SIZE);
    currentIcon.draw(tCtx);
}

function clearDraw() {
    dCtx.clearRect(0, 0, SIZE, SIZE);
    dCtx.fillStyle = '#FFFBF7';
    dCtx.fillRect(0, 0, SIZE, SIZE);
}

function calcSimilarity() {
    const td = tCtx.getImageData(0, 0, SIZE, SIZE).data;
    const ud = dCtx.getImageData(0, 0, SIZE, SIZE).data;
    let matches = 0;
    const total = SIZE * SIZE;

    for (let i = 0; i < td.length; i += 4) {
        const tDark = td[i] < 200 || td[i + 1] < 200 || td[i + 2] < 200;
        const uDark = ud[i] < 200 || ud[i + 1] < 200 || ud[i + 2] < 200;
        if (tDark === uDark) matches++;
    }

    const rawSim = matches / total;
    // Bias correction: naive score is high due to mostly white backgrounds matching
    // Penalize if user drew nothing (all white)
    const userDarkPixels = [...ud].filter((v, i) => i % 4 === 0 && v < 200).length;
    if (userDarkPixels < 20) return 0;

    // Better similarity: overlap of dark pixels
    let tp = 0, up = 0, overlap = 0;
    for (let i = 0; i < td.length; i += 4) {
        const tDark = td[i] < 200;
        const uDark = ud[i] < 200;
        if (tDark) tp++;
        if (uDark) up++;
        if (tDark && uDark) overlap++;
    }

    if (tp === 0 || up === 0) return 0;
    // Dice coefficient
    const dice = (2 * overlap) / (tp + up);
    return Math.min(100, Math.round(dice * 100));
}

function loadIcon() {
    currentIcon = targetIcons[Math.floor(Math.random() * targetIcons.length)];
    drawTarget();
    clearDraw();
    document.getElementById('similarityText').textContent = '';
    UI.showElement(document.getElementById('checkButton'));
    UI.hideElement(document.getElementById('nextButton'));
}

// Drawing logic
drawCanvas.addEventListener('mousedown', e => {
    e.preventDefault();
    isDrawing = true;
    startPt = getCanvasPt(e, drawCanvas);
    snapshot = dCtx.getImageData(0, 0, SIZE, SIZE);

    if (activeTool === 'pen' || activeTool === 'eraser') {
        dCtx.beginPath();
        dCtx.moveTo(startPt.x, startPt.y);
    }
});

drawCanvas.addEventListener('touchstart', e => {
    e.preventDefault();
    isDrawing = true;
    startPt = getCanvasPt(e, drawCanvas);
    snapshot = dCtx.getImageData(0, 0, SIZE, SIZE);

    if (activeTool === 'pen' || activeTool === 'eraser') {
        dCtx.beginPath();
        dCtx.moveTo(startPt.x, startPt.y);
    }
}, { passive: false });

function drawMove(e) {
    if (!isDrawing) return;
    const pt = getCanvasPt(e, drawCanvas);

    if (activeTool === 'pen') {
        dCtx.strokeStyle = activeColor;
        dCtx.lineWidth = strokeSize;
        dCtx.lineCap = 'round';
        dCtx.lineJoin = 'round';
        dCtx.lineTo(pt.x, pt.y);
        dCtx.stroke();
    } else if (activeTool === 'eraser') {
        dCtx.strokeStyle = '#FFFBF7';
        dCtx.lineWidth = strokeSize * 3;
        dCtx.lineCap = 'round';
        dCtx.lineJoin = 'round';
        dCtx.lineTo(pt.x, pt.y);
        dCtx.stroke();
    } else {
        // Shape preview
        dCtx.putImageData(snapshot, 0, 0);
        dCtx.strokeStyle = activeColor;
        dCtx.lineWidth = strokeSize;
        dCtx.lineCap = 'round';
        dCtx.lineJoin = 'round';
        dCtx.beginPath();

        if (activeTool === 'line') {
            dCtx.moveTo(startPt.x, startPt.y);
            dCtx.lineTo(pt.x, pt.y);
            dCtx.stroke();
        } else if (activeTool === 'rect') {
            dCtx.strokeRect(startPt.x, startPt.y, pt.x - startPt.x, pt.y - startPt.y);
        } else if (activeTool === 'circle') {
            const rx = Math.abs(pt.x - startPt.x) / 2;
            const ry = Math.abs(pt.y - startPt.y) / 2;
            const cx = startPt.x + (pt.x - startPt.x) / 2;
            const cy = startPt.y + (pt.y - startPt.y) / 2;
            dCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            dCtx.stroke();
        }
    }
}

drawCanvas.addEventListener('mousemove', drawMove);
drawCanvas.addEventListener('touchmove', e => { e.preventDefault(); drawMove(e); }, { passive: false });

function endDraw() { isDrawing = false; }
drawCanvas.addEventListener('mouseup', endDraw);
drawCanvas.addEventListener('mouseleave', endDraw);
drawCanvas.addEventListener('touchend', endDraw);

// Tool selection
document.getElementById('toolsRow').addEventListener('click', e => {
    const btn = e.target.closest('.tool-btn');
    if (!btn) return;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTool = btn.dataset.tool;
    drawCanvas.style.cursor = activeTool === 'eraser' ? 'cell' : 'crosshair';
});

// Color selection
document.getElementById('colorRow').addEventListener('click', e => {
    const swatch = e.target.closest('.color-swatch-btn');
    if (!swatch) return;
    document.querySelectorAll('.color-swatch-btn').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    activeColor = swatch.dataset.color;
});

// Stroke size
const strokeInput = document.getElementById('strokeSize');
strokeInput.addEventListener('input', () => {
    strokeSize = parseInt(strokeInput.value);
    document.getElementById('strokeSizeVal').textContent = strokeSize;
});

document.getElementById('clearDraw').addEventListener('click', clearDraw);

document.getElementById('checkButton').addEventListener('click', () => {
    const score = calcSimilarity();
    Scoring.add(score);
    const msgEl = document.getElementById('similarityText');
    if (score >= 60) {
        msgEl.style.color = '#155724';
        msgEl.textContent = `Great job! ${score}% similarity with the target`;
    } else if (score >= 30) {
        msgEl.style.color = 'var(--golden-yellow)';
        msgEl.textContent = `${score}% similarity — keep practicing!`;
    } else {
        msgEl.style.color = '#721c24';
        msgEl.textContent = `${score}% similarity — try tracing the outline more carefully`;
    }
    UI.hideElement(document.getElementById('checkButton'));
    UI.showElement(document.getElementById('nextButton'));
});

document.getElementById('nextButton').addEventListener('click', loadIcon);

loadIcon();
