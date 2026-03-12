// WCAG contrast calculation
function luminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const linearize = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(fg, bg) {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

function getLevel(ratio) {
    if (ratio >= 7) return 'aaa';
    if (ratio >= 4.5) return 'aa';
    if (ratio >= 3) return 'aa-large';
    return 'fail';
}

// Color pairs to test
const colorPairs = [
    // AAA
    { fg: '#000000', bg: '#FFFFFF', label: 'Black on White' },
    { fg: '#FFFFFF', bg: '#000000', label: 'White on Black' },
    { fg: '#1A1A1A', bg: '#F5F1ED', label: 'Near-black on Sand' },
    { fg: '#003366', bg: '#FFFFFF', label: 'Navy on White' },
    { fg: '#FFFFFF', bg: '#1A237E', label: 'White on Deep Blue' },
    // AA
    { fg: '#595959', bg: '#FFFFFF', label: 'Gray on White' },
    { fg: '#FFFFFF', bg: '#4A4A4A', label: 'White on Dark Gray' },
    { fg: '#0A5C0A', bg: '#F0FFF0', label: 'Dark Green on Light Green' },
    { fg: '#6B1A1A', bg: '#FFF0F0', label: 'Dark Red on Light Pink' },
    // AA-Large
    { fg: '#767676', bg: '#FFFFFF', label: 'Medium Gray on White' },
    { fg: '#FF6B35', bg: '#FFFFFF', label: 'Orange on White' },
    { fg: '#FFFFFF', bg: '#FF8C42', label: 'White on Coral' },
    { fg: '#4CAF50', bg: '#FFFFFF', label: 'Green on White' },
    // Fail
    { fg: '#FFD700', bg: '#FFFFFF', label: 'Yellow on White' },
    { fg: '#FF6B35', bg: '#FF8C42', label: 'Orange on Coral' },
    { fg: '#CCCCCC', bg: '#FFFFFF', label: 'Light Gray on White' },
    { fg: '#87CEEB', bg: '#FFFFFF', label: 'Sky Blue on White' },
    { fg: '#FFB627', bg: '#FFF8E1', label: 'Gold on Cream' },
];

let currentRound = 0;
const ROUNDS = 10;
let currentPair = null;

const colorPreview = document.getElementById('colorPreview');
const previewHeading = document.getElementById('previewHeading');
const previewBody = document.getElementById('previewBody');
const previewSmall = document.getElementById('previewSmall');
const roundInfo = document.getElementById('roundInfo');
const choicesGrid = document.getElementById('choicesGrid');
const ratioReveal = document.getElementById('ratioReveal');
const nextButton = document.getElementById('nextButton');

Scoring.init('contrastCheck', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function loadRound() {
    currentRound++;
    roundInfo.textContent = `Round ${currentRound} of ${ROUNDS}`;
    UI.hideElement(nextButton);
    ratioReveal.innerHTML = 'Make your selection to see the contrast ratio';
    ratioReveal.style.cssText = '';

    // Ensure variety: pick from shuffled pool
    const shuffled = shuffle(colorPairs);
    currentPair = shuffled[currentRound % shuffled.length] || shuffled[0];

    colorPreview.style.background = currentPair.bg;
    colorPreview.style.color = currentPair.fg;

    // Enable all buttons
    choicesGrid.querySelectorAll('.contrast-choice').forEach(btn => {
        btn.disabled = false;
        btn.className = 'contrast-choice';
    });
}

choicesGrid.addEventListener('click', e => {
    const btn = e.target.closest('.contrast-choice');
    if (!btn || btn.disabled) return;

    const userLevel = btn.dataset.level;
    const ratio = contrastRatio(currentPair.fg, currentPair.bg);
    const correctLevel = getLevel(ratio);
    const isCorrect = userLevel === correctLevel;

    // Mark choices
    choicesGrid.querySelectorAll('.contrast-choice').forEach(b => {
        b.disabled = true;
        if (b.dataset.level === correctLevel) {
            b.classList.add('reveal-correct');
        }
    });

    if (isCorrect) {
        btn.classList.add('selected-correct');
        Scoring.add(100);
    } else {
        btn.classList.add('selected-wrong');
        Scoring.add(0);
    }

    // Show ratio
    const ratioFixed = ratio.toFixed(2);
    const levelNames = { aaa: 'AAA (Enhanced)', aa: 'AA (Normal)', 'aa-large': 'AA Large Only', fail: 'Fail' };
    const correct = isCorrect ? '✓ Correct!' : `✗ Incorrect — it was ${levelNames[correctLevel]}`;
    ratioReveal.innerHTML = `
        <div style="font-size:0.85rem; color:var(--warm-gray); margin-bottom:4px;">${currentPair.label}</div>
        <div class="ratio-number">${ratioFixed}:1</div>
        <div style="font-size:0.9rem; margin-top:4px; font-weight:600; color:${isCorrect ? '#155724' : '#721c24'}">${correct}</div>
    `;

    if (currentRound < ROUNDS) {
        UI.showElement(nextButton);
    } else {
        nextButton.textContent = 'Play Again';
        UI.showElement(nextButton);
        nextButton.addEventListener('click', () => {
            currentRound = 0;
            nextButton.textContent = 'Next Pair →';
        }, { once: true });
    }
});

nextButton.addEventListener('click', loadRound);

loadRound();
