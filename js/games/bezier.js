// ─── Canvas setup ───────────────────────────────────────────────────────────
const canvas = document.getElementById('bezierCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;   // 600
const H = canvas.height;  // 320

// ─── DOM refs ────────────────────────────────────────────────────────────────
const checkButton     = document.getElementById('checkButton');
const resetButton     = document.getElementById('resetButton');
const nextButton      = document.getElementById('nextButton');
const similarityEl    = document.getElementById('similarityDisplay');
const statusIcon      = document.getElementById('statusIcon');
const statusText      = document.getElementById('statusText');
const pills           = [0, 1, 2].map(i => document.getElementById(`pill${i}`));

Scoring.init('bezier', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

// ─── Target curves (relative 0–1, scaled to canvas) ─────────────────────────
const targetCurves = [
    { p0: [0.1, 0.82], cp1: [0.1, 0.18], cp2: [0.9, 0.18], p3: [0.9, 0.82] }, // arch
    { p0: [0.1, 0.5],  cp1: [0.3, 0.08], cp2: [0.7, 0.92], p3: [0.9, 0.5]  }, // S-curve
    { p0: [0.1, 0.82], cp1: [0.45, 0.08], cp2: [0.55, 0.08], p3: [0.9, 0.82] }, // V-arch
    { p0: [0.1, 0.25], cp1: [0.5, 0.92], cp2: [0.5, 0.08], p3: [0.9, 0.75] }, // twist
    { p0: [0.1, 0.5],  cp1: [0.35, 0.5], cp2: [0.65, 0.5], p3: [0.9, 0.5]  }, // straight
    { p0: [0.2, 0.9],  cp1: [0.1, 0.1],  cp2: [0.9, 0.9],  p3: [0.8, 0.1]  }, // diagonal S
    { p0: [0.1, 0.5],  cp1: [0.1, 0.1],  cp2: [0.9, 0.9],  p3: [0.9, 0.5]  }, // gentle S
    { p0: [0.15, 0.15], cp1: [0.85, 0.15], cp2: [0.15, 0.85], p3: [0.85, 0.85] }, // wave cross
];

// ─── State ───────────────────────────────────────────────────────────────────
// Phases: 'idle' → 'drag_start' → 'preview' → 'drag_end' → 'done'
let phase       = 'idle';
let P0          = null;   // start anchor
let CP1         = null;   // start handle (direction: curve leaves P0 toward CP1)
let P3          = null;   // end anchor
let CP2         = null;   // end handle   (direction: curve arrives at P3 from CP2)
let adjusting   = null;   // 'p0'|'cp1'|'p3'|'cp2' — which point is being dragged in 'done'
let mouse       = { x: W / 2, y: H / 2 };
let currentCurve = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getCanvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
        x: (src.clientX - rect.left) * scaleX,
        y: (src.clientY - rect.top)  * scaleY,
    };
}

function scalePoint(rel) {
    const pad = 40;
    return {
        x: pad + rel[0] * (W - 2 * pad),
        y: pad + rel[1] * (H - 2 * pad),
    };
}

function dist(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Return which draggable handle is under pt (in 'done' phase), or null
function hitTest(pt) {
    const targets = [
        { key: 'cp1', p: CP1 },
        { key: 'cp2', p: CP2 },
        { key: 'p0',  p: P0  },
        { key: 'p3',  p: P3  },
    ];
    for (const { key, p } of targets) {
        if (p && dist(pt, p) < 14) return key;
    }
    return null;
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

/** Illustrator-style anchor: filled square, white border */
function drawAnchor(pt, color = '#1A1A1A', size = 6) {
    ctx.fillStyle = color;
    ctx.fillRect(pt.x - size, pt.y - size, size * 2, size * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pt.x - size, pt.y - size, size * 2, size * 2);
}

/** Illustrator-style direction handle: hollow circle */
function drawHandle(pt, color = '#FF6B35', hovered = false) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, hovered ? 7 : 5.5, 0, Math.PI * 2);
    ctx.fillStyle = hovered ? '#FFF0E8' : 'white';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

/** Thin solid line from anchor to handle */
function drawHandleArm(anchor, handle, color = 'rgba(255, 107, 53, 0.6)') {
    ctx.beginPath();
    ctx.moveTo(anchor.x, anchor.y);
    ctx.lineTo(handle.x, handle.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();
}

/** The actual bezier path */
function drawBezier(p0, cp1, cp2, p3, color, width, dash = []) {
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(74,74,74,0.055)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
}

function drawTargetCurve() {
    const t  = currentCurve;
    const tp0 = scalePoint(t.p0);
    const tcp1 = scalePoint(t.cp1);
    const tcp2 = scalePoint(t.cp2);
    const tp3 = scalePoint(t.p3);

    drawBezier(tp0, tcp1, tcp2, tp3, '#FF6B35', 3.5);

    // Target anchors (subtle orange squares)
    drawAnchor(tp0, 'rgba(255,107,53,0.5)', 4);
    drawAnchor(tp3, 'rgba(255,107,53,0.5)', 4);
}

// Which handle is currently under the cursor (for hover effect)
let hovering = null;

// ─── Main render ─────────────────────────────────────────────────────────────
function drawScene() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawTargetCurve();

    if (phase === 'idle') return;

    // ── PHASE: drag_start ──
    if (phase === 'drag_start') {
        drawHandleArm(P0, CP1);
        drawHandle(CP1, '#FF6B35');
        drawAnchor(P0);
        return;
    }

    // ── PHASE: preview ──
    // P0 & CP1 placed; waiting for end anchor (ghost preview follows cursor)
    if (phase === 'preview') {
        // Ghost preview line: P0 → cursor (using CP1 and cursor as the bezier endpoints)
        drawBezier(P0, CP1, mouse, mouse, 'rgba(26,26,26,0.18)', 2, [6, 5]);

        drawHandleArm(P0, CP1);
        drawHandle(CP1, '#FF6B35');
        drawAnchor(P0);
        return;
    }

    // ── PHASE: drag_end ──
    if (phase === 'drag_end') {
        drawBezier(P0, CP1, CP2, P3, '#1A1A1A', 3);

        drawHandleArm(P0, CP1);
        drawHandle(CP1, '#FF6B35');
        drawAnchor(P0);

        drawHandleArm(P3, CP2);
        drawHandle(CP2, '#FF6B35');
        drawAnchor(P3);
        return;
    }

    // ── PHASE: done ──
    if (phase === 'done') {
        drawBezier(P0, CP1, CP2, P3, '#1A1A1A', 3);

        // Arms first (behind handles)
        drawHandleArm(P0, CP1);
        drawHandleArm(P3, CP2);

        // Handles (with hover highlight)
        drawHandle(CP1, '#FF6B35', hovering === 'cp1');
        drawHandle(CP2, '#FF6B35', hovering === 'cp2');

        // Anchors (square, check hover)
        const p0Hov = hovering === 'p0';
        const p3Hov = hovering === 'p3';
        drawAnchor(P0, p0Hov ? '#FF6B35' : '#1A1A1A', p0Hov ? 7 : 6);
        drawAnchor(P3, p3Hov ? '#FF6B35' : '#1A1A1A', p3Hov ? 7 : 6);
    }
}

// ─── Status UI ───────────────────────────────────────────────────────────────
const STEPS = [
    { icon: '1', text: 'Click and drag to place the <strong>start anchor</strong> — drag to pull out its handle' },
    { icon: '2', text: 'Click and drag to place the <strong>end anchor</strong> — drag to shape the arrival' },
    { icon: '✓', text: 'Drag any anchor or handle to fine-tune, then <strong>Check Curve</strong>' },
];

const PILL_STATES = [
    ['active', '', ''],
    ['complete', 'active', ''],
    ['complete', 'complete', 'active'],
];

function setStatus(step) {
    statusIcon.textContent = STEPS[step].icon;
    statusText.innerHTML = STEPS[step].text;
    pills.forEach((p, i) => {
        p.className = 'step-pill ' + (PILL_STATES[step][i] || '');
    });
}

// ─── Sampling & scoring ───────────────────────────────────────────────────────
function sampleBezier(p0, cp1, cp2, p3, t) {
    const mt = 1 - t;
    return {
        x: mt*mt*mt*p0.x + 3*mt*mt*t*cp1.x + 3*mt*t*t*cp2.x + t*t*t*p3.x,
        y: mt*mt*mt*p0.y + 3*mt*mt*t*cp1.y + 3*mt*t*t*cp2.y + t*t*t*p3.y,
    };
}

function curveSimilarity() {
    const SAMPLES = 60;
    const t = currentCurve;
    const tp0 = scalePoint(t.p0), tcp1 = scalePoint(t.cp1);
    const tcp2 = scalePoint(t.cp2), tp3 = scalePoint(t.p3);
    const maxDist = Math.sqrt(W * W + H * H);
    let totalDist = 0;

    for (let i = 0; i <= SAMPLES; i++) {
        const s = i / SAMPLES;
        const tPt = sampleBezier(tp0, tcp1, tcp2, tp3, s);
        const uPt = sampleBezier(P0, CP1, CP2, P3, s);
        totalDist += dist(tPt, uPt);
    }

    const avg = totalDist / (SAMPLES + 1);
    return Math.min(100, Math.max(0, Math.round((1 - avg / (maxDist * 0.22)) * 100)));
}

// ─── Game logic ───────────────────────────────────────────────────────────────
function loadCurve() {
    currentCurve = targetCurves[Math.floor(Math.random() * targetCurves.length)];
    phase = 'idle';
    P0 = CP1 = P3 = CP2 = null;
    adjusting = hovering = null;
    similarityEl.textContent = '';
    checkButton.disabled = true;
    UI.hideElement(nextButton);
    UI.showElement(checkButton);
    canvas.style.cursor = 'crosshair';
    setStatus(0);
    drawScene();
}

function checkCurve() {
    const score = curveSimilarity();
    Scoring.add(score);

    let color;
    if (score >= 85)      { color = '#155724'; }
    else if (score >= 65) { color = '#856404'; }
    else                  { color = '#721c24'; }

    similarityEl.textContent = score >= 85
        ? `Excellent! ${score}% match`
        : score >= 65
        ? `Good effort! ${score}% match`
        : `Keep practicing! ${score}% match`;
    similarityEl.style.color = color;

    checkButton.disabled = true;
    UI.showElement(nextButton);
    canvas.style.cursor = 'default';
    hovering = null;
}

// ─── Mouse / Touch events ─────────────────────────────────────────────────────
canvas.addEventListener('mousedown', e => {
    e.preventDefault();
    const pt = getCanvasPoint(e);

    if (phase === 'idle') {
        P0 = { ...pt };
        CP1 = { ...pt };
        phase = 'drag_start';
        setStatus(0);

    } else if (phase === 'preview') {
        P3 = { ...pt };
        CP2 = { ...pt };
        phase = 'drag_end';
        setStatus(1);

    } else if (phase === 'done') {
        adjusting = hitTest(pt);
    }

    drawScene();
});

canvas.addEventListener('mousemove', e => {
    const pt = getCanvasPoint(e);
    mouse = pt;

    if (phase === 'drag_start') {
        CP1 = { ...pt };
        drawScene();

    } else if (phase === 'preview') {
        drawScene(); // ghost preview follows cursor

    } else if (phase === 'drag_end') {
        CP2 = { ...pt };
        drawScene();

    } else if (phase === 'done') {
        if (adjusting) {
            if      (adjusting === 'p0')  P0  = { ...pt };
            else if (adjusting === 'cp1') CP1 = { ...pt };
            else if (adjusting === 'p3')  P3  = { ...pt };
            else if (adjusting === 'cp2') CP2 = { ...pt };
        }
        const hit = adjusting || hitTest(pt);
        hovering = hit;
        canvas.style.cursor = hit ? 'grab' : 'default';
        drawScene();
    }
});

canvas.addEventListener('mouseup', e => {
    if (phase === 'drag_start') {
        // If user just clicked (no meaningful drag), give a sensible default handle
        if (dist(CP1, P0) < 8) {
            CP1 = { x: P0.x + 60, y: P0.y - 30 };
        }
        phase = 'preview';
        setStatus(1);
        drawScene();

    } else if (phase === 'drag_end') {
        if (dist(CP2, P3) < 8) {
            CP2 = { x: P3.x - 60, y: P3.y - 30 };
        }
        phase = 'done';
        checkButton.disabled = false;
        setStatus(2);
        canvas.style.cursor = 'default';
        drawScene();

    } else if (phase === 'done') {
        adjusting = null;
        const hit = hitTest(getCanvasPoint(e));
        canvas.style.cursor = hit ? 'grab' : 'default';
    }
});

canvas.addEventListener('mouseleave', () => {
    if (phase === 'done') {
        adjusting = null;
        hovering = null;
        canvas.style.cursor = 'default';
        drawScene();
    }
});

// ─── Touch events (mirrors mouse) ────────────────────────────────────────────
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const pt = getCanvasPoint(e);

    if (phase === 'idle') {
        P0 = { ...pt }; CP1 = { ...pt };
        phase = 'drag_start';
    } else if (phase === 'preview') {
        P3 = { ...pt }; CP2 = { ...pt };
        phase = 'drag_end';
    } else if (phase === 'done') {
        adjusting = hitTest(pt);
    }
    drawScene();
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const pt = getCanvasPoint(e);
    mouse = pt;

    if (phase === 'drag_start') {
        CP1 = { ...pt };
    } else if (phase === 'preview') {
        // ghost follows
    } else if (phase === 'drag_end') {
        CP2 = { ...pt };
    } else if (phase === 'done' && adjusting) {
        if      (adjusting === 'p0')  P0  = { ...pt };
        else if (adjusting === 'cp1') CP1 = { ...pt };
        else if (adjusting === 'p3')  P3  = { ...pt };
        else if (adjusting === 'cp2') CP2 = { ...pt };
    }
    drawScene();
}, { passive: false });

canvas.addEventListener('touchend', () => {
    if (phase === 'drag_start') {
        if (dist(CP1, P0) < 8) CP1 = { x: P0.x + 60, y: P0.y - 30 };
        phase = 'preview';
        setStatus(1);
        drawScene();
    } else if (phase === 'drag_end') {
        if (dist(CP2, P3) < 8) CP2 = { x: P3.x - 60, y: P3.y - 30 };
        phase = 'done';
        checkButton.disabled = false;
        setStatus(2);
        drawScene();
    } else if (phase === 'done') {
        adjusting = null;
    }
});

// ─── Buttons ──────────────────────────────────────────────────────────────────
resetButton.addEventListener('click', loadCurve);
checkButton.addEventListener('click', checkCurve);
nextButton.addEventListener('click', loadCurve);

// ─── Init ─────────────────────────────────────────────────────────────────────
loadCurve();
