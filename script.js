// 8-Bit Retro Sound Synthesizer (Web Audio API)
let audioCtx = null;
let bgMusicInterval = null;
let bgMusicEnabled = false;

// Happy 8-bit chip-tune melody notes (frequencies in Hz)
const melody = [
    261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
    440.00, 349.23, 440.00, 523.25, // A4, F4, A4, C5
    392.00, 329.63, 392.00, 493.88, // G4, E4, G4, B4
    523.25, 523.25, 0,      0        // C5, C5, rest, rest
];
let melodyIndex = 0;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function startBackgroundMusic() {
    if (bgMusicInterval) return;
    initAudio();
    if (!audioCtx) return;

    let tempo = 220; // ms per note
    bgMusicInterval = setInterval(() => {
        if (!bgMusicEnabled) return;
        if (audioCtx.state === 'suspended') return;
        
        let freq = melody[melodyIndex];
        melodyIndex = (melodyIndex + 1) % melody.length;
        
        if (freq > 0) {
            playMelodyNote(freq, tempo / 1000);
        }
    }, tempo);
}

function playMelodyNote(freq, duration) {
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle'; // Soft triangle wave for friendly background tune
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, now);
        
        gainNode.gain.setValueAtTime(0.04, now); // Low volume
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration - 0.02);
        
        osc.start(now);
        osc.stop(now + duration);
    } catch(e) {
        console.warn("Melody play failed:", e);
    }
}

function toggleMusic() {
    bgMusicEnabled = !bgMusicEnabled;
    const btn = document.getElementById('music-toggle-btn');
    if (btn) {
        btn.textContent = bgMusicEnabled ? "🔊 MUSIC ON" : "🔇 MUSIC OFF";
    }
    if (bgMusicEnabled) {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        startBackgroundMusic();
    }
}

// Retro NES Coin Sound
function playCorrectSound() {
    try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square'; // Classic retro square wave
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        // Two-tone rising ding
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.25);
    } catch (e) {
        console.warn('Audio synthesis failed:', e);
    }
}

// Retro NES Hit/Failure Sound
function playIncorrectSound() {
    try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sawtooth'; // Retro buzz wave
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        // Sliding down frequency (buzz explosion)
        osc.frequency.setValueAtTime(150.00, now);
        osc.frequency.linearRampToValueAtTime(40.00, now + 0.35);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.35);
    } catch (e) {
        console.warn('Audio synthesis failed:', e);
    }
}

// Scenarios data - Short, punchy, and emoji-rich for 10-year-olds
const scenarios = [
    {
        id: 1,
        text: "🍽️ Dinner is ready! Your family is calling, but you're in the middle of a match. What do you do?",
        image: "images/scenario1_dinner.png",
        choices: [
            { text: "Keep playing to finish the match.", isCorrect: false, feedback: "❌ Oh no! Missing dinner makes your family sad. Save the game and join them!" },
            { text: "Pause and join your family for dinner.", isCorrect: true, feedback: "🎮 Great! Respecting family time is a healthy habit. The game can wait!" }
        ]
    },
    {
        id: 2,
        text: "⏰ You've been gaming for 3 hours straight. Your eyes hurt and your head is spinning!",
        image: "images/scenario2_tired.png",
        choices: [
            { text: "Keep playing to get that high score!", isCorrect: false, feedback: "❌ Ouch! Gaming with a headache hurts your health. High scores aren't worth eye strain!" },
            { text: "Take a break, stretch, and drink water.", isCorrect: true, feedback: "💧 Awesome! Stretching and drinking water keeps you healthy and focused." }
        ]
    },
    {
        id: 3,
        text: "🌙 It's 10 PM and you have a big test tomorrow. A friend invites you to play a game now.",
        image: "images/scenario3_homework.png",
        choices: [
            { text: "Play 'just one game' and study late.", isCorrect: false, feedback: "❌ Sleepy alert! Late gaming ruins sleep and test grades. Balance is key!" },
            { text: "Say you need sleep and will play tomorrow.", isCorrect: true, feedback: "📝 Smart move! Good sleep = good grades. Play together tomorrow instead!" }
        ]
    },
    {
        id: 4,
        text: "😡 You keep losing and feel super angry. You want to throw the controller!",
        image: "images/scenario4_frustrated.png",
        choices: [
            { text: "Keep playing until you win, even if angry.", isCorrect: false, feedback: "❌ Tilt! Playing angry makes you lose more. Don't let the game control you!" },
            { text: "Step away, take deep breaths, and play later.", isCorrect: true, feedback: "🧘 Excellent! Control your emotions. Fresh minds win games!" }
        ]
    },
    {
        id: 5,
        text: "💬 An online teammate starts calling you mean names in chat. What do you do?",
        image: "images/scenario5_chat.png",
        choices: [
            { text: "Type mean names back to defend yourself.", isCorrect: false, feedback: "❌ Fighting makes things worse. Ignore the toxicity and block them!" },
            { text: "Mute the player and report their behavior.", isCorrect: true, feedback: "🛡️ Nice shield! Muting blocks bad vibes so you can stay safe and happy." }
        ]
    },
    {
        id: 6,
        text: "💰 A rare skin is on sale, but you don't have enough money. What do you do?",
        svgMarkup: `<svg viewBox="0 0 32 32" width="120" height="120"><circle cx="16" cy="16" r="12" fill="#ffd8a8" stroke="#8c420e" stroke-width="2"/><circle cx="16" cy="16" r="8" fill="#ffec99" stroke="#d87324" stroke-width="2"/><polygon points="16,10 18,14 22,14 19,17 20,21 16,19 12,21 13,17 10,14 14,14" fill="#ffd8a8"/></svg>`,
        choices: [
            { text: "Secretly use a parent's credit card to buy it.", isCorrect: false, feedback: "❌ Danger! Sneaking credit cards is dishonest and costs real money. Talk to parents!" },
            { text: "Skip it or save up your own pocket money.", isCorrect: true, feedback: "🐷 Awesome! Saving up for gaming rewards is smart and responsible!" }
        ]
    },
    {
        id: 7,
        text: "☀️ It's a sunny weekend. Friends invite you to play soccer, but you want to quest.",
        svgMarkup: `<svg viewBox="0 0 32 32" width="120" height="120"><circle cx="16" cy="16" r="12" fill="#ffffff" stroke="#000000" stroke-width="2"/><polygon points="16,12 19,15 17,19 15,19 13,15" fill="#000000"/><polygon points="16,4 18,6 14,6" fill="#000000"/><polygon points="28,16 26,14 26,18" fill="#000000"/><polygon points="4,16 6,14 6,18" fill="#000000"/><polygon points="23,24 20,22 24,21" fill="#000000"/><polygon points="9,24 12,22 8,21" fill="#000000"/></svg>`,
        choices: [
            { text: "Stay inside to play games all day long.", isCorrect: false, feedback: "❌ Couch potato alert! Playing sports outside keeps you strong and healthy." },
            { text: "Go play soccer outside and quest later.", isCorrect: true, feedback: "⚽ Perfect! Balancing active sports and gaming keeps you feeling great!" }
        ]
    }
];

// Game State Variables
let currentScenarioIndex = 0;
let score = 0;
let health = 5; // Start with 5 hearts

// Screen Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameEndScreen = document.getElementById('game-end-screen');

// Interactive Modal
const howToModal = document.getElementById('how-to-modal');
const startBtn = document.getElementById('start-btn');
const howToBtn = document.getElementById('how-to-btn');
const aboutBtn = document.getElementById('about-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

// HUD Elements
const currentStepEl = document.getElementById('current-step');
const totalStepsEl = document.getElementById('total-steps');
const scoreValEl = document.getElementById('score-val');
const heartsContainer = document.getElementById('hearts-container');

// Scenario & Question Elements
const scenarioImage = document.getElementById('scenario-image');
const scenarioText = document.getElementById('scenario-text');
const choicesContainer = document.getElementById('choices-container');

// Feedback elements
const feedbackDisplay = document.getElementById('feedback-display');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackText = document.getElementById('feedback-text');
const feedbackIcon = document.getElementById('feedback-icon');
const nextButton = document.getElementById('next-button');

// End Screen Elements
const endAvatar = document.getElementById('end-avatar');
const endTitle = document.getElementById('end-title');
const congratsText = document.getElementById('congrats-text');
const finalScoreVal = document.getElementById('final-score-val');
const finalScoreText = document.getElementById('final-score-text');
const restartButton = document.getElementById('restart-button');
const conclusionScreen = document.getElementById('conclusion-screen');
const goToConclusionBtn = document.getElementById('go-to-conclusion-btn');
const conclusionReplayBtn = document.getElementById('conclusion-replay-btn');
const conclusionHomeBtn = document.getElementById('conclusion-home-btn');
const hudHomeBtn = document.getElementById('hud-home-btn');

// Helper to pad scores: 500 -> "0500"
function padScore(num) {
    return String(num).padStart(4, '0');
}

// Render heart lives in the top HUD bar
function renderHearts() {
    heartsContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart-pixel';
        if (i < health) {
            heart.textContent = '❤️';
            heart.classList.add('filled');
        } else {
            heart.textContent = '🖤';
            heart.classList.add('empty');
        }
        heartsContainer.appendChild(heart);
    }
}

// Initialize and Start Game
function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameEndScreen.classList.add('hidden');
    
    currentScenarioIndex = 0;
    score = 0;
    health = 5;

    renderHearts();
    loadScenario(currentScenarioIndex);
}

// Load current Scenario
function loadScenario(index) {
    if (index >= scenarios.length) {
        endGame(true); // Complete game victory
        return;
    }

    // Update HUD Stats
    currentStepEl.textContent = index + 1;
    totalStepsEl.textContent = scenarios.length;
    scoreValEl.textContent = padScore(score);

    // Hide Feedback Panel and empty choices
    feedbackDisplay.classList.add('hidden');
    choicesContainer.innerHTML = '';

    const scenario = scenarios[index];
    scenarioText.textContent = scenario.text;
    
    const fallbackSvgEl = document.getElementById('image-fallback-svg');
    if (scenario.svgMarkup) {
        scenarioImage.classList.add('hidden');
        fallbackSvgEl.classList.remove('hidden');
        fallbackSvgEl.innerHTML = scenario.svgMarkup;
    } else {
        scenarioImage.classList.remove('hidden');
        fallbackSvgEl.classList.add('hidden');
        scenarioImage.src = scenario.image;
    }

    // Generate option buttons
    scenario.choices.forEach((choice, choiceIdx) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.innerHTML = `<span style='margin-right: 12px; color: var(--retro-yellow)'>${choiceIdx === 0 ? 'A >' : 'B >'}</span> ${choice.text}`;
        button.addEventListener('click', () => handleChoice(choice, button));
        choicesContainer.appendChild(button);
    });
}

// Handle Answer Clicks
function handleChoice(choice, clickedButton) {
    // Disable all options
    const buttons = choicesContainer.querySelectorAll('.choice-button');
    buttons.forEach(btn => btn.disabled = true);

    feedbackText.textContent = choice.feedback;
    feedbackDisplay.classList.remove('hidden');

    if (choice.isCorrect) {
        clickedButton.classList.add('selected-correct');
        feedbackTitle.textContent = '🌟 CHOICE CORRECT!';
        feedbackIcon.textContent = '🥳';
        score += 250;
        scoreValEl.textContent = padScore(score);
        playCorrectSound();
    } else {
        clickedButton.classList.add('selected-incorrect');
        feedbackTitle.textContent = '💡 UNHEALTHY CHOICE!';
        feedbackIcon.textContent = '👾';
        
        // Deduct health
        health--;
        renderHearts();
        playIncorrectSound();

        // Highlight correct answer
        buttons.forEach(btn => {
            const btnText = btn.textContent.substring(4).trim();
            const matchingChoice = scenarios[currentScenarioIndex].choices.find(c => c.text === btnText);
            if (matchingChoice && matchingChoice.isCorrect) {
                btn.classList.add('selected-correct');
            }
        });

        // Trigger Game Over immediately if out of hearts
        if (health <= 0) {
            setTimeout(() => {
                endGame(false);
            }, 1000);
            return;
        }
    }
}

// Final Game State Screen
function endGame(isVictory) {
    gameScreen.classList.add('hidden');
    gameEndScreen.classList.remove('hidden');

    finalScoreVal.textContent = padScore(score);

    if (health === 5) {
        endAvatar.textContent = '👑';
        endTitle.textContent = 'VICTORY!';
        congratsText.textContent = 'HEALTHY HABIT USER!';
        finalScoreText.textContent = `All lives secured! You are a Healthy Gaming Hero!`;
    } else if (health === 4) {
        endAvatar.textContent = '🥳';
        endTitle.textContent = 'GREAT JOB!';
        congratsText.textContent = 'HEALTHY HABIT USER!';
        finalScoreText.textContent = `4 lives secured! Excellent gaming behavior!`;
    } else if (health >= 1 && health <= 3) {
        endAvatar.textContent = '🛡️';
        endTitle.textContent = 'NICE TRY!';
        congratsText.textContent = 'KEEP PRACTICING GUARDIAN!';
        finalScoreText.textContent = `${health} lives secured. Keep learning and growing!`;
    } else {
        endAvatar.textContent = '💀';
        endTitle.textContent = 'GAME OVER!';
        congratsText.textContent = 'YOU RAN OUT OF LIVES!';
        finalScoreText.textContent = `Practice makes perfect. Try again to find the hero!`;
    }
}

const musicToggleBtn = document.getElementById('music-toggle-btn');
musicToggleBtn.addEventListener('click', () => {
    initAudio();
    toggleMusic();
});

// Start screen menu handlers
startBtn.addEventListener('click', () => {
    initAudio(); // Initialize audio context on click
    startGame();
});

howToBtn.addEventListener('click', () => {
    howToModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    howToModal.classList.add('hidden');
});

aboutBtn.addEventListener('click', () => {
    // Continue works like Let's Play for retro menu demo
    startGame();
});

restartButton.addEventListener('click', startGame);

nextButton.addEventListener('click', () => {
    currentScenarioIndex++;
    loadScenario(currentScenarioIndex);
});

goToConclusionBtn.addEventListener('click', () => {
    gameEndScreen.classList.add('hidden');
    conclusionScreen.classList.remove('hidden');
});

conclusionReplayBtn.addEventListener('click', () => {
    conclusionScreen.classList.add('hidden');
    startGame();
});

conclusionHomeBtn.addEventListener('click', () => {
    conclusionScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

hudHomeBtn.addEventListener('click', () => {
    if (confirm("Go back to Main Menu? Your progress will be lost!")) {
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }
});

// Load Audio Context fallback on user keypress
document.addEventListener('keydown', initAudio, { once: true });
