const stage = document.getElementById('gridStage');
const gridCanvas = document.getElementById('gridCanvas');
const gCtx = gridCanvas.getContext('2d');
const snapCountEl = document.getElementById('snapCount');
const totalCountEl = document.getElementById('totalCount');
const checkButton = document.getElementById('checkButton');
const nextButton = document.getElementById('nextButton');
const resultEl = document.getElementById('result');

Scoring.init('gridAlign', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

let gridSize = 8;
let elements = [];
let dragging = null;
let dragOffsetX = 0, dragOffsetY = 0;
const SNAP_TOLERANCE = 4;

const elementConfigs = [
    { label: 'Nav', color: '#FF6B35', w: 0.7, h: 0.08 },
    { label: 'Hero', color: '#D94F30', w: 0.55, h: 0.18 },
    { label: 'Card', color: '#FF8C42', w: 0.3, h: 0.22 },
    { label: 'Btn', color: '#FFB627', w: 0.22, h: 0.08 },
    { label: 'Footer', color: '#4A4A4A', w: 0.65, h: 0.07 },
];

function getStageSize() {
    return stage.getBoundingClientRect().width;
}

function drawGrid() {
    const size = getStageSize();
    gridCanvas.width = size;
    gridCanvas.height = size;

    gCtx.clearRect(0, 0, size, size);
    const scale = size / 560;
    const gs = gridSize * scale * (560 / gridSize < 16 ? 2 : 1);
    const actualStep = Math.round(size / Math.round(size / (gridSize * 2)));

    gCtx.strokeStyle = 'rgba(255, 107, 53, 0.12)';
    gCtx.lineWidth = 1;

    for (let x = 0; x <= size; x += actualStep) {
        gCtx.beginPath();
        gCtx.moveTo(x, 0);
        gCtx.lineTo(x, size);
        gCtx.stroke();
    }
    for (let y = 0; y <= size; y += actualStep) {
        gCtx.beginPath();
        gCtx.moveTo(0, y);
        gCtx.lineTo(size, y);
        gCtx.stroke();
    }
}

function getGridStep() {
    const size = getStageSize();
    const cols = Math.round(size / (gridSize * 2));
    return size / cols;
}

function snapToGrid(val) {
    const step = getGridStep();
    return Math.round(val / step) * step;
}

function isSnapped(el) {
    const step = getGridStep();
    const dx = el.x % step;
    const dy = el.y % step;
    const snappedX = dx < SNAP_TOLERANCE || step - dx < SNAP_TOLERANCE;
    const snappedY = dy < SNAP_TOLERANCE || step - dy < SNAP_TOLERANCE;
    return snappedX && snappedY;
}

function createElements() {
    // Remove old elements
    stage.querySelectorAll('.draggable-element').forEach(e => e.remove());
    elements = [];

    const size = getStageSize();
    elementConfigs.forEach((cfg, i) => {
        const w = Math.round(cfg.w * size);
        const h = Math.round(cfg.h * size);
        const el = {
            dom: document.createElement('div'),
            x: 10 + (i % 3) * (size / 3),
            y: 10 + Math.floor(i / 3) * (size / 4),
            w,
            h,
            color: cfg.color,
            label: cfg.label
        };

        el.dom.className = 'draggable-element';
        el.dom.style.cssText = `
            width: ${w}px;
            height: ${h}px;
            background: ${cfg.color};
        `;
        el.dom.textContent = cfg.label;

        positionElement(el);
        stage.appendChild(el.dom);
        elements.push(el);

        setupDrag(el);
    });

    totalCountEl.textContent = elements.length;
    updateSnapCount();
}

function positionElement(el) {
    el.dom.style.left = el.x + 'px';
    el.dom.style.top = el.y + 'px';
    el.dom.classList.toggle('snapped', isSnapped(el));
}

function updateSnapCount() {
    const count = elements.filter(el => isSnapped(el)).length;
    snapCountEl.textContent = count;
}

function setupDrag(el) {
    const onStart = (e) => {
        e.preventDefault();
        dragging = el;
        const rect = stage.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragOffsetX = clientX - rect.left - el.x;
        dragOffsetY = clientY - rect.top - el.y;
        el.dom.style.zIndex = 100;
    };

    el.dom.addEventListener('mousedown', onStart);
    el.dom.addEventListener('touchstart', onStart, { passive: false });
}

function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const size = getStageSize();

    dragging.x = Math.max(0, Math.min(size - dragging.w, clientX - rect.left - dragOffsetX));
    dragging.y = Math.max(0, Math.min(size - dragging.h, clientY - rect.top - dragOffsetY));

    positionElement(dragging);
    updateSnapCount();
}

function onEnd() {
    if (!dragging) return;
    // Auto-snap on release
    dragging.x = snapToGrid(dragging.x);
    dragging.y = snapToGrid(dragging.y);
    positionElement(dragging);
    updateSnapCount();
    dragging.dom.style.zIndex = '';
    dragging = null;
}

document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onEnd);
document.addEventListener('touchmove', onMove, { passive: false });
document.addEventListener('touchend', onEnd);

function checkAlignment() {
    const snapped = elements.filter(el => isSnapped(el)).length;
    const total = elements.length;
    const pct = Math.round((snapped / total) * 100);
    const points = pct;
    Scoring.add(points);

    let type, msg;
    if (pct === 100) {
        type = 'success'; msg = `Perfect! All ${total} elements are grid-aligned.`;
    } else if (pct >= 60) {
        type = 'close'; msg = `${snapped} of ${total} elements aligned. ${pct}% — good effort!`;
    } else {
        type = 'far'; msg = `${snapped} of ${total} elements aligned. Keep trying!`;
    }

    UI.showResult(resultEl, msg, type);
    checkButton.style.display = 'none';
    UI.showElement(nextButton);
}

function newLayout() {
    UI.clearElement(resultEl);
    checkButton.style.display = '';
    UI.hideElement(nextButton);
    createElements();
    drawGrid();
}

document.querySelectorAll('.grid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gridSize = parseInt(btn.dataset.grid);
        drawGrid();
        updateSnapCount();
    });
});

checkButton.addEventListener('click', checkAlignment);
nextButton.addEventListener('click', newLayout);

window.addEventListener('resize', () => {
    drawGrid();
    createElements();
});

drawGrid();
createElements();
