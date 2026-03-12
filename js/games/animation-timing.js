const easingOptions = [
    { label: 'Linear', value: 'linear' },
    { label: 'Ease', value: 'ease' },
    { label: 'Ease In', value: 'ease-in' },
    { label: 'Ease Out', value: 'ease-out' },
    { label: 'Ease In-Out', value: 'ease-in-out' },
    { label: 'Bounce', value: 'cubic-bezier(0.68,-0.55,0.27,1.55)' },
];

const challenges = [
    { easing: 'linear', duration: 1000, hint: 'Constant speed throughout' },
    { easing: 'ease-in', duration: 1500, hint: 'Starts slow, ends fast' },
    { easing: 'ease-out', duration: 800, hint: 'Starts fast, ends slow' },
    { easing: 'ease-in-out', duration: 1200, hint: 'Slow → Fast → Slow' },
    { easing: 'ease', duration: 600, hint: 'Standard browser ease' },
    { easing: 'cubic-bezier(0.68,-0.55,0.27,1.55)', duration: 1000, hint: 'Overshoots the target' },
    { easing: 'ease-in', duration: 2000, hint: 'Long, slow start' },
    { easing: 'ease-out', duration: 400, hint: 'Quick deceleration' },
];

const targetBall = document.getElementById('targetBall');
const userBall = document.getElementById('userBall');
const targetTrack = document.getElementById('targetTrack');
const playButton = document.getElementById('playButton');
const checkButton = document.getElementById('checkButton');
const nextButton = document.getElementById('nextButton');
const durationSlider = document.getElementById('durationSlider');
const durationVal = document.getElementById('durationVal');
const easingSelector = document.getElementById('easingSelector');
const roundInfo = document.getElementById('roundInfo');
const resultEl = document.getElementById('result');

Scoring.init('animTiming', document.getElementById('scoreDisplay'), document.getElementById('resetScore'));

let currentChallenge = null;
let selectedEasing = 'linear';
let selectedDuration = 1000;
let currentRound = 0;
const ROUNDS = 8;
let isPlaying = false;

function getTrackWidth() {
    return targetTrack.offsetWidth - 80;
}

function animateBall(ball, easing, duration) {
    const trackW = getTrackWidth();
    ball.style.transition = 'none';
    ball.style.left = '40px';

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            ball.style.transition = `left ${duration}ms ${easing}`;
            ball.style.left = (40 + trackW) + 'px';
        });
    });
}

function playAnimations() {
    if (isPlaying) return;
    isPlaying = true;
    playButton.disabled = true;

    animateBall(targetBall, currentChallenge.easing, currentChallenge.duration);
    animateBall(userBall, selectedEasing, selectedDuration);

    const maxDuration = Math.max(currentChallenge.duration, selectedDuration);
    setTimeout(() => {
        // Reset
        targetBall.style.transition = 'none';
        userBall.style.transition = 'none';
        targetBall.style.left = '40px';
        userBall.style.left = '40px';
        playButton.disabled = false;
        isPlaying = false;
    }, maxDuration + 600);
}

function loadRound() {
    currentRound++;
    roundInfo.textContent = `Round ${currentRound} of ${ROUNDS}`;

    const idx = Math.floor(Math.random() * challenges.length);
    currentChallenge = challenges[idx];

    // Reset balls
    targetBall.style.transition = 'none';
    userBall.style.transition = 'none';
    targetBall.style.left = '40px';
    userBall.style.left = '40px';

    // Reset controls
    selectedEasing = 'linear';
    selectedDuration = 1000;
    durationSlider.value = 1000;
    durationVal.textContent = '1.0';

    document.querySelectorAll('.easing-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.easing === 'linear');
    });

    UI.clearElement(resultEl);
    UI.showElement(checkButton);
    UI.hideElement(nextButton);
    checkButton.disabled = false;
}

function checkAnswer() {
    const easingMatch = selectedEasing === currentChallenge.easing;
    const durationDiff = Math.abs(selectedDuration - currentChallenge.duration);
    const durationPct = durationDiff / currentChallenge.duration * 100;

    let easingScore = easingMatch ? 60 : 0;
    let durationScore = Math.max(0, 40 - Math.round(durationPct * 0.8));
    const totalScore = easingScore + durationScore;

    Scoring.add(totalScore);

    const correctEasingLabel = easingOptions.find(e => e.value === currentChallenge.easing)?.label || currentChallenge.easing;
    const selectedLabel = easingOptions.find(e => e.value === selectedEasing)?.label || selectedEasing;

    let msg = `Easing: ${easingMatch ? '✓ Correct' : `✗ Was "${correctEasingLabel}"`} · `;
    msg += `Duration: ${durationPct <= 10 ? '✓' : '✗'} ${currentChallenge.duration}ms (you: ${selectedDuration}ms) · `;
    msg += `Score: ${totalScore}/100`;

    const type = totalScore >= 80 ? 'success' : totalScore >= 40 ? 'close' : 'far';
    UI.showResult(resultEl, msg + `<br><small style="opacity:0.8; font-weight:normal;">${currentChallenge.hint}</small>`, type);

    checkButton.disabled = true;
    UI.showElement(nextButton);

    if (currentRound >= ROUNDS) {
        nextButton.textContent = 'Play Again';
        nextButton.addEventListener('click', () => {
            currentRound = 0;
            nextButton.textContent = 'Next Round →';
        }, { once: true });
    }
}

// Event listeners
playButton.addEventListener('click', playAnimations);
checkButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', loadRound);

easingSelector.addEventListener('click', e => {
    const btn = e.target.closest('.easing-btn');
    if (!btn) return;
    document.querySelectorAll('.easing-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedEasing = btn.dataset.easing;
});

durationSlider.addEventListener('input', () => {
    selectedDuration = parseInt(durationSlider.value);
    durationVal.textContent = (selectedDuration / 1000).toFixed(1);
});

loadRound();
