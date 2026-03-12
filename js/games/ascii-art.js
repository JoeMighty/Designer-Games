const charSets = {
    standard:  ' .,:;i1tfLCG08@',
    blocks:    ' ░▒▓█',
    minimal:   ' .:+#',
    detailed:  ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
};

const hiddenCanvas = document.getElementById('hiddenCanvas');
const canvasCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
const asciiOutput = document.getElementById('asciiOutput');
const imageInput = document.getElementById('imageInput');
const widthSlider = document.getElementById('widthSlider');
const widthValue = document.getElementById('widthValue');
const charSetSelect = document.getElementById('charSetSelect');
const contrastSelect = document.getElementById('contrastSelect');
const copyButton = document.getElementById('copyButton');
const downloadButton = document.getElementById('downloadButton');

let currentImage = null;
let asciiText = '';

function generatePresetImage(type) {
    const size = 200;
    hiddenCanvas.width = size;
    hiddenCanvas.height = size;
    canvasCtx.clearRect(0, 0, size, size);

    canvasCtx.fillStyle = '#1A1A1A';
    canvasCtx.fillRect(0, 0, size, size);

    canvasCtx.fillStyle = '#FFFFFF';

    switch (type) {
        case 'circle':
            canvasCtx.beginPath();
            canvasCtx.arc(size / 2, size / 2, 80, 0, Math.PI * 2);
            canvasCtx.fill();
            canvasCtx.fillStyle = '#1A1A1A';
            canvasCtx.beginPath();
            canvasCtx.arc(size / 2, size / 2, 50, 0, Math.PI * 2);
            canvasCtx.fill();
            break;

        case 'star': {
            const cx = size / 2, cy = size / 2;
            canvasCtx.beginPath();
            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                const r = i % 2 === 0 ? 85 : 40;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                i === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
            }
            canvasCtx.closePath();
            canvasCtx.fill();
            break;
        }

        case 'heart': {
            const cx = size / 2, cy = size / 2;
            canvasCtx.beginPath();
            canvasCtx.moveTo(cx, cy + 60);
            canvasCtx.bezierCurveTo(cx - 90, cy + 20, cx - 90, cy - 60, cx, cy - 20);
            canvasCtx.bezierCurveTo(cx + 90, cy - 60, cx + 90, cy + 20, cx, cy + 60);
            canvasCtx.fill();
            break;
        }

        case 'wave':
            canvasCtx.lineWidth = 12;
            canvasCtx.strokeStyle = '#FFFFFF';
            canvasCtx.beginPath();
            for (let x = 0; x <= size; x++) {
                const y = size / 2 + Math.sin((x / size) * Math.PI * 4) * 60;
                x === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
            }
            canvasCtx.stroke();
            canvasCtx.lineWidth = 6;
            canvasCtx.strokeStyle = '#AAAAAA';
            canvasCtx.beginPath();
            for (let x = 0; x <= size; x++) {
                const y = size / 2 + Math.sin((x / size) * Math.PI * 4 + 1) * 30;
                x === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
            }
            canvasCtx.stroke();
            break;

        case 'grid':
            canvasCtx.strokeStyle = '#FFFFFF';
            canvasCtx.lineWidth = 3;
            for (let x = 0; x <= size; x += 25) {
                canvasCtx.beginPath();
                canvasCtx.moveTo(x, 0);
                canvasCtx.lineTo(x, size);
                canvasCtx.stroke();
            }
            for (let y = 0; y <= size; y += 25) {
                canvasCtx.beginPath();
                canvasCtx.moveTo(0, y);
                canvasCtx.lineTo(size, y);
                canvasCtx.stroke();
            }
            break;
    }

    convertToAscii();
}

function loadImageFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            convertToAscii();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function getPixelBrightness(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function convertToAscii() {
    const cols = parseInt(widthSlider.value);
    const charSet = charSets[charSetSelect.value];
    const contrast = contrastSelect.value;

    let sourceWidth, sourceHeight;

    if (currentImage) {
        sourceWidth = currentImage.width;
        sourceHeight = currentImage.height;
        hiddenCanvas.width = sourceWidth;
        hiddenCanvas.height = sourceHeight;
        canvasCtx.drawImage(currentImage, 0, 0);
    } else {
        sourceWidth = hiddenCanvas.width;
        sourceHeight = hiddenCanvas.height;
    }

    const aspectRatio = sourceHeight / sourceWidth;
    // Characters are roughly 2:1 height:width ratio
    const rows = Math.round(cols * aspectRatio * 0.45);

    const cellW = sourceWidth / cols;
    const cellH = sourceHeight / rows;

    let lines = [];

    for (let row = 0; row < rows; row++) {
        let line = '';
        for (let col = 0; col < cols; col++) {
            const x = Math.floor(col * cellW);
            const y = Math.floor(row * cellH);
            const w = Math.max(1, Math.floor(cellW));
            const h = Math.max(1, Math.floor(cellH));

            const imageData = canvasCtx.getImageData(x, y, w, h);
            const data = imageData.data;

            let totalBrightness = 0;
            const pixelCount = data.length / 4;
            for (let i = 0; i < data.length; i += 4) {
                totalBrightness += getPixelBrightness(data[i], data[i + 1], data[i + 2]);
            }
            let brightness = totalBrightness / pixelCount / 255;

            if (contrast === 'high') {
                brightness = Math.pow(brightness, 0.5);
            } else if (contrast === 'inverted') {
                brightness = 1 - brightness;
            }

            const charIndex = Math.floor(brightness * (charSet.length - 1));
            line += charSet[charIndex];
        }
        lines.push(line);
    }

    asciiText = lines.join('\n');

    asciiOutput.innerHTML = '';
    const pre = document.createElement('pre');
    pre.style.cssText = `font-family: 'Courier New', monospace; font-size: ${Math.max(4, Math.round(480 / cols))}px; line-height: 1.1; color: #FFD4B8; margin: 0;`;
    pre.textContent = asciiText;
    asciiOutput.appendChild(pre);

    copyButton.disabled = false;
    downloadButton.disabled = false;
}

function downloadAscii() {
    const blob = new Blob([asciiText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Event listeners
imageInput.addEventListener('change', e => {
    if (e.target.files[0]) {
        currentImage = null;
        loadImageFile(e.target.files[0]);
    }
});

document.getElementById('uploadArea').addEventListener('click', () => {
    imageInput.click();
});

document.getElementById('presetsRow').addEventListener('click', e => {
    if (e.target.classList.contains('preset-btn')) {
        currentImage = null;
        generatePresetImage(e.target.dataset.preset);
    }
});

widthSlider.addEventListener('input', () => {
    widthValue.textContent = widthSlider.value;
    if (asciiText || currentImage) convertToAscii();
});

charSetSelect.addEventListener('change', () => {
    if (asciiText || currentImage) convertToAscii();
});

contrastSelect.addEventListener('change', () => {
    if (asciiText || currentImage) convertToAscii();
});

copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(asciiText).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => { copyButton.textContent = 'Copy Text'; }, 2000);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = asciiText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyButton.textContent = 'Copied!';
        setTimeout(() => { copyButton.textContent = 'Copy Text'; }, 2000);
    });
});

downloadButton.addEventListener('click', downloadAscii);
