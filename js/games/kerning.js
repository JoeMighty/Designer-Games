const words = [
    { text: 'WAVE', ideal: -15, font: 'Playfair Display' },
    { text: 'TYPE', ideal: 5, font: 'Bebas Neue' },
    { text: 'KERN', ideal: -8, font: 'Merriweather' },
    { text: 'AWAY', ideal: -12, font: 'Playfair Display' },
    { text: 'PLAY', ideal: 3, font: 'Bebas Neue' }
];

let currentWordIndex = 0;

const wordDisplay = document.getElementById('wordDisplay');
const slider = document.getElementById('kerningSlider');
const valueDisplay = document.getElementById('valueDisplay');
const checkButton = document.getElementById('checkButton');
const nextButton = document.getElementById('nextButton');
const result = document.getElementById('result');

Scoring.init('kerning', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

function loadWord() {
    const word = words[currentWordIndex];
    wordDisplay.textContent = word.text;
    wordDisplay.style.fontFamily = word.font;
    slider.value = 0;
    updateLetterSpacing();
    UI.clearElement(result);
    UI.showElement(checkButton);
    UI.hideElement(nextButton);
}

function updateLetterSpacing() {
    const value = slider.value;
    wordDisplay.style.setProperty('--letter-spacing', `${value}px`);
    valueDisplay.textContent = `${value}px`;
}

function checkAnswer() {
    const word = words[currentWordIndex];
    const userValue = parseInt(slider.value);
    const difference = Math.abs(userValue - word.ideal);

    let message = '';
    let type = '';
    let points = 0;

    if (difference <= 2) {
        message = `Perfect! You were only ${difference}px off.`;
        type = 'success';
        points = 100;
    } else if (difference <= 5) {
        message = `Very close! You were ${difference}px off.`;
        type = 'close';
        points = 75;
    } else if (difference <= 10) {
        message = `Not bad! You were ${difference}px off.`;
        type = 'close';
        points = 50;
    } else {
        message = `Try again! You were ${difference}px off.`;
        type = 'far';
        points = 25;
    }

    Scoring.add(points);
    UI.showResult(result, message, type);
    UI.hideElement(checkButton);
    UI.showElement(nextButton);
}

function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    loadWord();
}

slider.addEventListener('input', updateLetterSpacing);
checkButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', nextWord);

loadWord();
