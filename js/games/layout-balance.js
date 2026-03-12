const stage = document.getElementById('balanceStage');
const needle = document.getElementById('balanceNeedle');
const balancePct = document.getElementById('balancePct');
const checkButton = document.getElementById('checkButton');
const nextButton = document.getElementById('nextButton');
const resultEl = document.getElementById('result');

Scoring.init('layoutBalance', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

let elements = [];
let dragging = null;
let dragOffsetX = 0, dragOffsetY = 0;

const elementSets = [
    [
        { label: 'Hero', w: 220, h: 80, weight: 8, color: '#FF6B35' },
        { label: 'Nav', w: 160, h: 35, weight: 3, color: '#4A4A4A' },
        { label: 'Card', w: 100, h: 90, weight: 4, color: '#FF8C42' },
        { label: 'Sidebar', w: 70, h: 130, weight: 5, color: '#D94F30' },
        { label: 'Footer', w: 200, h: 30, weight: 2, color: '#1A1A1A' },
    ],
    [
        { label: 'Image', w: 130, h: 130, weight: 9, color: '#FF6B35' },
        { label: 'Title', w: 160, h: 40, weight: 4, color: '#1A1A1A' },
        { label: 'Body', w: 140, h: 70, weight: 3, color: '#4A4A4A' },
        { label: 'Button', w: 80, h: 36, weight: 2, color: '#D94F30' },
        { label: 'Icon', w: 50, h: 50, weight: 2, color: '#FFB627' },
    ],
    [
        { label: 'Banner', w: 240, h: 60, weight: 7, color: '#D94F30' },
        { label: 'Col A', w: 90, h: 100, weight: 4, color: '#FF8C42' },
        { label: 'Col B', w: 90, h: 100, weight: 4, color: '#FF8C42' },
        { label: 'Tag', w: 60, h: 28, weight: 1, color: '#FFB627' },
        { label: 'Avatar', w: 55, h: 55, weight: 3, color: '#FF6B35' },
    ],
];

function getStageRect() {
    return stage.getBoundingClientRect();
}

function getStageSize() {
    return { w: stage.offsetWidth, h: stage.offsetHeight };
}

function calcBalance() {
    const { w, h } = getStageSize();
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    elements.forEach(el => {
        const cx = el.x + el.w / 2;
        const cy = el.y + el.h / 2;
        weightedX += cx * el.weight;
        weightedY += cy * el.weight;
        totalWeight += el.weight;
    });

    if (totalWeight === 0) return { cx: 0.5, cy: 0.5, dist: 1 };

    const massCx = weightedX / totalWeight;
    const massCy = weightedY / totalWeight;
    const normX = massCx / w;
    const normY = massCy / h;

    const distX = Math.abs(normX - 0.5);
    const distY = Math.abs(normY - 0.5);
    const dist = Math.sqrt(distX * distX + distY * distY);

    return { cx: normX, cy: normY, dist };
}

function updateBalanceUI() {
    const { cx, dist } = calcBalance();
    needle.style.left = (cx * 100) + '%';
    const pct = Math.round(dist * 200);
    balancePct.textContent = `${pct}%`;
}

function createElements() {
    stage.querySelectorAll('.balance-element').forEach(e => e.remove());
    elements = [];

    const set = elementSets[Math.floor(Math.random() * elementSets.length)];
    const { w: sw, h: sh } = getStageSize();

    set.forEach((cfg, i) => {
        const el = {
            ...cfg,
            x: 15 + (i % 3) * (sw / 3.2),
            y: 30 + Math.floor(i / 3) * (sh / 2.2),
        };

        const dom = document.createElement('div');
        dom.className = 'balance-element';
        dom.textContent = cfg.label;
        dom.style.cssText = `
            width: ${cfg.w}px;
            height: ${cfg.h}px;
            background: ${cfg.color};
            left: ${el.x}px;
            top: ${el.y}px;
        `;

        // Weight label
        const weightDot = document.createElement('span');
        weightDot.style.cssText = 'position:absolute; bottom:3px; right:5px; font-size:9px; opacity:0.7;';
        weightDot.textContent = `w:${cfg.weight}`;
        dom.appendChild(weightDot);

        el.dom = dom;

        const onStart = (e) => {
            e.preventDefault();
            dragging = el;
            const rect = stage.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            dragOffsetX = clientX - rect.left - el.x;
            dragOffsetY = clientY - rect.top - el.y;
            dom.style.zIndex = 100;
        };

        dom.addEventListener('mousedown', onStart);
        dom.addEventListener('touchstart', onStart, { passive: false });

        stage.appendChild(dom);
        elements.push(el);
    });

    updateBalanceUI();
}

function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const rect = stage.getBoundingClientRect();
    const { w: sw, h: sh } = getStageSize();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragging.x = Math.max(0, Math.min(sw - dragging.w, clientX - rect.left - dragOffsetX));
    dragging.y = Math.max(30, Math.min(sh - dragging.h, clientY - rect.top - dragOffsetY));

    dragging.dom.style.left = dragging.x + 'px';
    dragging.dom.style.top = dragging.y + 'px';

    updateBalanceUI();
}

function onEnd() {
    if (dragging) {
        dragging.dom.style.zIndex = '';
        dragging = null;
    }
}

document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onEnd);
document.addEventListener('touchmove', onMove, { passive: false });
document.addEventListener('touchend', onEnd);

checkButton.addEventListener('click', () => {
    const { dist } = calcBalance();
    const pct = dist * 200;
    let points, msg, type;

    if (pct <= 5) {
        points = 100; type = 'success';
        msg = 'Perfect balance! The visual center is almost exactly in the middle.';
    } else if (pct <= 15) {
        points = 75; type = 'close';
        msg = `Great balance! Off-center by ${pct.toFixed(1)}%.`;
    } else if (pct <= 30) {
        points = 40; type = 'close';
        msg = `Decent balance. Off-center by ${pct.toFixed(1)}%.`;
    } else {
        points = 10; type = 'far';
        msg = `Unbalanced layout — off by ${pct.toFixed(0)}%. Try moving heavier elements toward the center.`;
    }

    Scoring.add(points);
    UI.showResult(resultEl, msg, type);
    checkButton.disabled = true;
    UI.showElement(nextButton);
});

nextButton.addEventListener('click', () => {
    UI.clearElement(resultEl);
    checkButton.disabled = false;
    UI.hideElement(nextButton);
    createElements();
});

createElements();
