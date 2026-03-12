let targetColor = { r: 0, g: 0, b: 0 };

const targetSwatch = document.getElementById('targetSwatch');
const userSwatch = document.getElementById('userSwatch');
const rSlider = document.getElementById('rSlider');
const gSlider = document.getElementById('gSlider');
const bSlider = document.getElementById('bSlider');
const rValue = document.getElementById('rValue');
const gValue = document.getElementById('gValue');
const bValue = document.getElementById('bValue');
const checkButton = document.getElementById('checkButton');
const nextButton = document.getElementById('nextButton');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const accuracyPercent = document.getElementById('accuracyPercent');
const resultFill = document.getElementById('resultFill');

Scoring.init('colorMatch', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

function randomChannel() {
    return Math.floor(Math.random() * 256);
}

function generateTarget() {
    targetColor = {
        r: randomChannel(),
        g: randomChannel(),
        b: randomChannel()
    };
    targetSwatch.style.backgroundColor = `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})`;
}

function getUserColor() {
    return {
        r: parseInt(rSlider.value),
        g: parseInt(gSlider.value),
        b: parseInt(bSlider.value)
    };
}

function updateUserSwatch() {
    const c = getUserColor();
    userSwatch.style.backgroundColor = `rgb(${c.r}, ${c.g}, ${c.b})`;
    rValue.textContent = c.r;
    gValue.textContent = c.g;
    bValue.textContent = c.b;
}

function colorDistance(a, b) {
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

function checkMatch() {
    const userColor = getUserColor();
    const maxDistance = Math.sqrt(3 * 255 * 255); // ~441.67
    const dist = colorDistance(targetColor, userColor);
    const accuracy = Math.round((1 - dist / maxDistance) * 100);

    const points = Math.round(accuracy);
    Scoring.add(points);

    accuracyPercent.textContent = `${accuracy}%`;
    resultFill.style.width = `${accuracy}%`;

    if (accuracy >= 90) {
        accuracyPercent.style.color = '#28a745';
    } else if (accuracy >= 70) {
        accuracyPercent.style.color = 'var(--golden-yellow)';
    } else {
        accuracyPercent.style.color = '#dc3545';
    }

    UI.showElement(accuracyDisplay, 'block');
    UI.hideElement(checkButton);
    UI.showElement(nextButton);

    // Reveal target values
    const targetRgb = document.createElement('div');
    targetRgb.style.cssText = 'text-align:center; margin-top:10px; font-size:0.85rem; color:var(--warm-gray)';
    targetRgb.textContent = `Target: rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b}) · Yours: rgb(${userColor.r}, ${userColor.g}, ${userColor.b})`;
    accuracyDisplay.appendChild(targetRgb);
}

function newRound() {
    // Reset sliders to random position so it's not always 128,128,128
    rSlider.value = randomChannel();
    gSlider.value = randomChannel();
    bSlider.value = randomChannel();
    updateUserSwatch();

    UI.showElement(checkButton);
    UI.hideElement(nextButton);

    // Clear accuracy display
    accuracyDisplay.style.display = 'none';
    // Remove old reveal text if any
    const old = accuracyDisplay.querySelector('div');
    if (old) accuracyDisplay.removeChild(old);
    resultFill.style.width = '0%';

    generateTarget();
}

rSlider.addEventListener('input', updateUserSwatch);
gSlider.addEventListener('input', updateUserSwatch);
bSlider.addEventListener('input', updateUserSwatch);
checkButton.addEventListener('click', checkMatch);
nextButton.addEventListener('click', newRound);

newRound();
