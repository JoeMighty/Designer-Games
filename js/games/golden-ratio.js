const PHI = 1.6180339887;

const challenges = [
    {
        target: PHI,
        label: '1 : 1.618',
        desc: 'The Golden Ratio (φ ≈ 1.618) — drag the handle to resize the width',
        fixedHeight: 180,
    },
    {
        target: PHI * PHI,
        label: '1 : 2.618',
        desc: 'φ² = φ + 1 ≈ 2.618 — a rectangle containing two golden ratio sections',
        fixedHeight: 150,
    },
    {
        target: 1 / PHI,
        label: '1 : 0.618',
        desc: '1/φ ≈ 0.618 — the reciprocal golden ratio (taller than wide)',
        fixedHeight: 200,
    },
    {
        target: 1,
        label: '1 : 1',
        desc: 'A perfect square — equal width and height',
        fixedHeight: 180,
    },
    {
        target: Math.sqrt(2),
        label: '1 : 1.414',
        desc: '√2 ≈ 1.414 — the A-paper ratio (A4, A3, A5)',
        fixedHeight: 180,
    },
];

let currentChallenge = null;
let currentWidth = 200;
let isDragging = false;
let startX = 0;
let startWidth = 0;

const ratioRect = document.getElementById('ratioRect');
const resizeHandle = document.getElementById('resizeHandle');
const widthDisplay = document.getElementById('widthDisplay');
const heightDisplay = document.getElementById('heightDisplay');
const ratioDisplay = document.getElementById('ratioDisplay');
const challengeTarget = document.getElementById('challengeTarget');
const challengeDesc = document.getElementById('challengeDesc');
const checkButton = document.getElementById('checkButton');
const nextButton = document.getElementById('nextButton');
const resultEl = document.getElementById('result');

Scoring.init('goldenRatio', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

function updateRect() {
    const height = currentChallenge.fixedHeight;
    const clampedWidth = Math.max(40, Math.min(500, currentWidth));
    currentWidth = clampedWidth;

    ratioRect.style.width = clampedWidth + 'px';
    ratioRect.style.height = height + 'px';

    const ratio = clampedWidth / height;
    widthDisplay.textContent = clampedWidth;
    heightDisplay.textContent = height;
    ratioDisplay.textContent = `1 : ${ratio.toFixed(3)}`;
}

function loadChallenge() {
    const idx = Math.floor(Math.random() * challenges.length);
    currentChallenge = challenges[idx];

    challengeTarget.textContent = currentChallenge.label;
    challengeDesc.textContent = currentChallenge.desc;
    heightDisplay.textContent = currentChallenge.fixedHeight;

    // Start at a random width far from target
    const targetW = Math.round(currentChallenge.target * currentChallenge.fixedHeight);
    const offsets = [-80, -60, 60, 80, 100, -100];
    currentWidth = Math.max(60, targetW + offsets[Math.floor(Math.random() * offsets.length)]);

    UI.clearElement(resultEl);
    UI.showElement(checkButton);
    UI.hideElement(nextButton);
    checkButton.disabled = false;

    updateRect();
}

function checkRatio() {
    const height = currentChallenge.fixedHeight;
    const userRatio = currentWidth / height;
    const targetRatio = currentChallenge.target;
    const pctError = Math.abs(userRatio - targetRatio) / targetRatio * 100;

    let points, msg, type;

    if (pctError <= 1) {
        points = 100; type = 'success';
        msg = `Perfect! Your ratio ${(userRatio).toFixed(3)} vs target ${targetRatio.toFixed(3)} — error: ${pctError.toFixed(1)}%`;
    } else if (pctError <= 5) {
        points = 75; type = 'close';
        msg = `Very close! Ratio ${(userRatio).toFixed(3)} vs target ${targetRatio.toFixed(3)} — error: ${pctError.toFixed(1)}%`;
    } else if (pctError <= 15) {
        points = 40; type = 'close';
        msg = `Getting there! Error: ${pctError.toFixed(1)}%. Target was ${targetRatio.toFixed(3)}.`;
    } else {
        points = 10; type = 'far';
        msg = `Off by ${pctError.toFixed(0)}%. The target ratio was ${targetRatio.toFixed(3)}.`;
    }

    Scoring.add(points);
    UI.showResult(resultEl, msg, type);
    checkButton.disabled = true;
    UI.showElement(nextButton);
}

// Drag handling
resizeHandle.addEventListener('mousedown', e => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startWidth = currentWidth;
    document.body.style.cursor = 'ew-resize';
});

resizeHandle.addEventListener('touchstart', e => {
    e.preventDefault();
    isDragging = true;
    startX = e.touches[0].clientX;
    startWidth = currentWidth;
}, { passive: false });

document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    currentWidth = startWidth + (e.clientX - startX);
    updateRect();
});

document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    currentWidth = startWidth + (e.touches[0].clientX - startX);
    updateRect();
}, { passive: false });

document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.cursor = '';
});
document.addEventListener('touchend', () => { isDragging = false; });

checkButton.addEventListener('click', checkRatio);
nextButton.addEventListener('click', loadChallenge);

loadChallenge();
