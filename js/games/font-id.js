const fonts = [
    { name: 'Playfair Display', category: 'Serif', hints: ['High contrast strokes', 'Elegant serif', 'Decorative'] },
    { name: 'Bebas Neue', category: 'Display', hints: ['All-caps display', 'Condensed geometric', 'Bold industrial'] },
    { name: 'Merriweather', category: 'Serif', hints: ['Readable body serif', 'Sturdy slab-like', 'Comfortable x-height'] },
    { name: 'Oswald', category: 'Sans-Serif', hints: ['Condensed sans-serif', 'Reworked gothic', 'Strong verticals'] },
    { name: 'Lora', category: 'Serif', hints: ['Brushed serif', 'Literary feel', 'Moderate contrast'] },
    { name: 'Raleway', category: 'Sans-Serif', hints: ['Elegant thin weights', 'Art Deco influence', 'Unique "W"'] },
    { name: 'Josefin Sans', category: 'Sans-Serif', hints: ['Geometric sans', 'Vintage 1920s feel', 'Uniform strokes'] },
    { name: 'Nunito', category: 'Sans-Serif', hints: ['Rounded terminals', 'Friendly sans', 'Even weight'] },
    { name: 'Crimson Text', category: 'Serif', hints: ['Old-style serif', 'Book typography', 'Classical proportions'] },
    { name: 'Abril Fatface', category: 'Display', hints: ['Ultra bold display', 'High contrast', 'Poster-style'] },
];

const samples = [
    'The quick brown fox',
    'DESIGN IS THINKING',
    'Typography matters',
    'Hello World',
    'A B C D E F G',
    'Form follows function',
    'Less is more',
    'Grid & Layout',
];

let currentRound = 0;
let currentFont = null;
let answered = false;
const ROUNDS = 10;

const sampleDisplay = document.getElementById('sampleDisplay');
const choicesGrid = document.getElementById('choicesGrid');
const roundInfo = document.getElementById('roundInfo');
const hint = document.getElementById('hint');
const nextButton = document.getElementById('nextButton');

Scoring.init('fontId', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function pickWrongFonts(correct, count) {
    const others = fonts.filter(f => f.name !== correct.name);
    return shuffle(others).slice(0, count);
}

function loadRound() {
    answered = false;
    currentRound++;

    roundInfo.textContent = `Round ${currentRound} of ${ROUNDS}`;
    hint.textContent = '';
    UI.hideElement(nextButton);

    currentFont = fonts[Math.floor(Math.random() * fonts.length)];
    const sample = samples[Math.floor(Math.random() * samples.length)];

    sampleDisplay.textContent = sample;
    sampleDisplay.style.fontFamily = `'${currentFont.name}', serif`;

    const wrongFonts = pickWrongFonts(currentFont, 3);
    const allChoices = shuffle([currentFont, ...wrongFonts]);

    choicesGrid.innerHTML = '';
    allChoices.forEach(font => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = font.name;
        btn.dataset.font = font.name;
        btn.addEventListener('click', () => handleChoice(btn, font));
        choicesGrid.appendChild(btn);
    });
}

function handleChoice(btn, font) {
    if (answered) return;
    answered = true;

    const isCorrect = font.name === currentFont.name;

    // Mark all buttons
    Array.from(choicesGrid.children).forEach(b => {
        b.disabled = true;
        if (b.dataset.font === currentFont.name) {
            b.classList.add('correct');
        } else if (b === btn && !isCorrect) {
            b.classList.add('wrong');
        }
    });

    if (isCorrect) {
        Scoring.add(100);
        hint.textContent = `✓ Correct! ${currentFont.category} typeface. ${currentFont.hints[0]}.`;
        hint.style.color = '#155724';
    } else {
        Scoring.add(0);
        hint.textContent = `✗ It was ${currentFont.name}. ${currentFont.hints[0]}.`;
        hint.style.color = '#721c24';
    }

    if (currentRound < ROUNDS) {
        UI.showElement(nextButton);
    } else {
        const finalBtn = document.createElement('button');
        finalBtn.className = 'button';
        finalBtn.textContent = 'Play Again';
        finalBtn.addEventListener('click', () => {
            currentRound = 0;
            loadRound();
        });
        document.querySelector('.button-group').innerHTML = '';
        document.querySelector('.button-group').appendChild(finalBtn);
        UI.showElement(finalBtn, 'inline-block');
    }
}

nextButton.addEventListener('click', loadRound);

loadRound();
