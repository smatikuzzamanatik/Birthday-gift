/* -------------------------------------------------------------
 * Premium Birthday Celebration JavaScript Logic
 * Handles slide-by-slide navigation, Web Audio synthesis, & canvas animations.
 * ------------------------------------------------------------- */

// State Management
const appState = {
    isMusicMuted: false,
    audioCtx: null,
    ambientSynthInterval: null,
    birthdaySongPlaying: false,
    birthdaySongTimeouts: [],
    balloonsActive: false,
    balloonIntervals: [], // Track running balloon timeout processes
    activeSlide: 0,
    ambientNodes: [], // Track running ambient synthesizers to mute/unmute
    currentPageIndex: 1,
    quizPassed: false
};

// Romantic Love & Birthday Wishes Database
const birthdayWishes = [
    { sender: "Your Loving Husband 💕", text: "Happy Birthday, Fatema! You are the most special person in my life and my greatest blessing.", avatar: "💖" },
    { sender: "Forever Yours 👩‍❤️‍👨", text: "I honestly cannot imagine even a single day of my life without you. I love you so much!", avatar: "🥰" },
    { sender: "My Safe Haven 🌸", text: "Thank you for always standing by my side through every joy and every sorrow. You are my true strength.", avatar: "🌸" },
    { sender: "My Dearest Wifey 💓", text: "Your smile is my favorite view in the whole world. Keep smiling always, my queen!", avatar: "💓" },
    { sender: "With All My Heart 💘", text: "To the most beautiful soul who makes our home so warm and peaceful — Happy Birthday, Fatema!", avatar: "💘" },
    { sender: "Your Partner in Everything 💌", text: "Wishing you a lifetime of good health, endless smiles, and all the love in the universe!", avatar: "💌" }
];

// -------------------------------------------------------------
// Web Audio API Synthesizer - 100% Offline & Reliable Audio
// -------------------------------------------------------------

function getAudioContext() {
    if (!appState.audioCtx) {
        appState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (appState.audioCtx.state === 'suspended') {
        appState.audioCtx.resume();
    }
    return appState.audioCtx;
}

// 1. Synthesize Pop Sound (when balloon pops)
function playPopSound() {
    if (appState.isMusicMuted) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

        osc.start();
        osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

// 2. Synthesize Wind/Blow Sound (when candle is blown out)
function playBlowSound() {
    if (appState.isMusicMuted) return;
    try {
        const ctx = getAudioContext();
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noiseNode.start();
        noiseNode.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

// 3. Synthesize Magic Chimes (for celebratory moments)
function playMagicChime() {
    if (appState.isMusicMuted) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.5);
        });
    } catch (e) {
        console.error("Audio error:", e);
    }
}

// 4. Synthesize Soft Ambient Chords (Loops in background)
function startAmbientSoundscape() {
    const ctx = getAudioContext();
    const delayNode = ctx.createDelay();
    delayNode.delayTime.value = 0.4;
    const feedbackNode = ctx.createGain();
    feedbackNode.gain.value = 0.3;

    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);
    delayNode.connect(ctx.destination);

    function playSoftPluck(freq, time) {
        if (appState.isMusicMuted || appState.birthdaySongPlaying) return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(delayNode);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.04, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
        
        osc.start(time);
        osc.stop(time + 1.5);
        
        appState.ambientNodes.push({ osc, gain });
        setTimeout(() => {
            appState.ambientNodes = appState.ambientNodes.filter(n => n.osc !== osc);
        }, 2000);
    }

    const notesProgression = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [349.23, 440.00, 523.25, 659.25], // Fmaj7
        [293.66, 349.23, 440.00, 587.33], // Dm7
        [392.00, 493.88, 587.33, 783.99]  // G7
    ];

    let count = 0;
    function triggerNextChord() {
        if (appState.birthdaySongPlaying) return;
        const now = ctx.currentTime;
        const chord = notesProgression[count % notesProgression.length];
        
        chord.forEach((freq, i) => {
            playSoftPluck(freq, now + i * 0.15);
        });
        count++;
    }

    triggerNextChord();
    appState.ambientSynthInterval = setInterval(triggerNextChord, 4800);
}

// 5. Synthesize "Happy Birthday" Melody (Music Box Style with Echo)
function playHappyBirthdaySong() {
    if (appState.birthdaySongPlaying) return;
    appState.birthdaySongPlaying = true;
    
    const ctx = getAudioContext();
    
    const delayNode = ctx.createDelay();
    delayNode.delayTime.value = 0.3;
    const feedbackNode = ctx.createGain();
    feedbackNode.gain.value = 0.45;
    
    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);
    delayNode.connect(ctx.destination);

    // Frequencies
    const G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
    
    const melody = [
        { freq: G4, dur: 0.35, delay: 0.4 },
        { freq: G4, dur: 0.12, delay: 0.15 },
        { freq: A4, dur: 0.45, delay: 0.5 },
        { freq: G4, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 0.45, delay: 0.5 },
        { freq: B4, dur: 0.9, delay: 1.0 },

        { freq: G4, dur: 0.35, delay: 0.4 },
        { freq: G4, dur: 0.12, delay: 0.15 },
        { freq: A4, dur: 0.45, delay: 0.5 },
        { freq: G4, dur: 0.45, delay: 0.5 },
        { freq: D5, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 0.9, delay: 1.0 },

        { freq: G4, dur: 0.35, delay: 0.4 },
        { freq: G4, dur: 0.12, delay: 0.15 },
        { freq: G5, dur: 0.45, delay: 0.5 },
        { freq: E5, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 0.45, delay: 0.5 },
        { freq: B4, dur: 0.45, delay: 0.5 },
        { freq: A4, dur: 0.7, delay: 0.8 },

        { freq: F5, dur: 0.35, delay: 0.4 },
        { freq: F5, dur: 0.12, delay: 0.15 },
        { freq: E5, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 0.45, delay: 0.5 },
        { freq: D5, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 1.0, delay: 1.2 }
    ];

    let accumTime = ctx.currentTime + 0.5;

    melody.forEach((note, idx) => {
        const playTime = accumTime;
        accumTime += note.delay;

        const timer = setTimeout(() => {
            if (appState.isMusicMuted) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.connect(delayNode);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, playTime);
            
            gain.gain.setValueAtTime(0, playTime);
            gain.gain.linearRampToValueAtTime(0.18, playTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, playTime + note.dur * 1.5);

            osc.start(playTime);
            osc.stop(playTime + note.dur * 1.8);
        }, (playTime - ctx.currentTime) * 1000);

        appState.birthdaySongTimeouts.push(timer);
    });

    const totalDuration = (accumTime - ctx.currentTime) * 1000;
    const finalTimer = setTimeout(() => {
        appState.birthdaySongPlaying = false;
        appState.birthdaySongTimeouts = [];
    }, totalDuration);
    
    appState.birthdaySongTimeouts.push(finalTimer);
}

function stopBirthdaySong() {
    appState.birthdaySongTimeouts.forEach(t => clearTimeout(t));
    appState.birthdaySongTimeouts = [];
    appState.birthdaySongPlaying = false;
}

// -------------------------------------------------------------
// Canvas Particle & Confetti Engine
// -------------------------------------------------------------
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let stars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, colorType) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 10 - 5;
        this.speedY = Math.random() * -12 - 5;
        this.gravity = 0.25;
        this.drag = 0.98;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        
        if (colorType === 'confetti') {
            // Romantic pink palette: deep rose, hot pink, blush, champagne gold, rose gold
            const pinkPalette = [
                `hsl(${Math.random() * 30 + 320}, 90%, ${Math.random() * 20 + 65}%)`, // hot pink / rose
                `hsl(${Math.random() * 20 + 340}, 85%, ${Math.random() * 20 + 70}%)`, // blush pink
                `hsl(${Math.random() * 20},       88%, ${Math.random() * 15 + 70}%)`, // coral pink
                `hsl(45, ${Math.random() * 20 + 80}%, ${Math.random() * 20 + 65}%)`,  // champagne gold
                `hsl(350, 70%, ${Math.random() * 20 + 75}%)`,                         // soft rose
            ];
            this.color = pinkPalette[Math.floor(Math.random() * pinkPalette.length)];
            this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
        } else {
            // Sparkles: warm gold / champagne tones
            this.color = `hsl(${Math.random() * 20 + 35}, 100%, ${Math.random() * 25 + 65}%)`;
            this.shape = 'circle';
            this.size = Math.random() * 5 + 2;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -6 - 2;
        }
        
        this.opacity = 1;
        this.fade = Math.random() * 0.015 + 0.01;
    }

    update() {
        this.speedX *= this.drag;
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.fade;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        }
        ctx.restore();
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.alpha = Math.random();
        this.speed = Math.random() * 0.02 + 0.005;
        this.increasing = Math.random() > 0.5;
    }

    update() {
        if (this.increasing) {
            this.alpha += this.speed;
            if (this.alpha >= 1) this.increasing = false;
        } else {
            this.alpha -= this.speed;
            if (this.alpha <= 0.1) this.increasing = true;
        }
        
        this.y -= 0.05;
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class HeartTrailParticle {
    constructor(x, y) {
        this.x = x + (Math.random() * 12 - 6);
        this.y = y + (Math.random() * 12 - 6);
        this.size = Math.random() * 14 + 10;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * -2 - 1; // Float gently upwards
        this.opacity = 1;
        this.fade = Math.random() * 0.02 + 0.015;
        this.rotation = Math.random() * 40 - 20;
        const colors = ['#f472b6', '#fb7fd4', '#fda4af', '#f9c55a', '#ff9abf'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.fade;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💖', 0, 0);
        ctx.restore();
    }
}

// Track mouse/touch for romantic trail
let lastTrailTime = 0;
function handlePointerTrail(e) {
    const now = Date.now();
    if (now - lastTrailTime < 40) return; // Throttle slightly
    lastTrailTime = now;

    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    if (x !== undefined && y !== undefined) {
        particles.push(new HeartTrailParticle(x, y));
    }
}

window.addEventListener('mousemove', handlePointerTrail);
window.addEventListener('touchmove', handlePointerTrail);

function initStars() {
    stars = [];
    const count = Math.min(window.innerWidth / 12, 100);
    for (let i = 0; i < count; i++) {
        stars.push(new Star());
    }
}

function spawnConfetti(x, y, count = 120) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, 'confetti'));
    }
}

const loveEmojisList = ["💖", "🥰", "💕", "💘", "💓", "💗", "💌", "❤️", "🌹", "✨", "🌸", "💋", "😍", "💝"];

class LoveEmojiParticle {
    constructor(x, y, emoji) {
        this.x = x + (Math.random() * 24 - 12);
        this.y = y + (Math.random() * 24 - 12);
        this.size = Math.random() * 18 + 18;
        this.speedX = Math.random() * 8 - 4;
        this.speedY = Math.random() * -7 - 2;
        this.opacity = 1;
        this.fade = Math.random() * 0.018 + 0.012;
        this.rotation = Math.random() * 40 - 20;
        this.emoji = emoji || loveEmojisList[Math.floor(Math.random() * loveEmojisList.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedX *= 0.97;
        this.opacity -= this.fade;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}

function spawnLoveEmojiBurst(x, y, count = 14) {
    const chosenEmoji = loveEmojisList[Math.floor(Math.random() * loveEmojisList.length)];
    for (let i = 0; i < count; i++) {
        particles.push(new LoveEmojiParticle(x, y, chosenEmoji));
    }
    return chosenEmoji;
}

function spawnSparkles(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, 'sparkle'));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateParticles);
}

// -------------------------------------------------------------
// Slide Navigation Engine
// -------------------------------------------------------------

function updateProgressBar(pageIndex) {
    const bar = document.getElementById('storyProgressBar');
    if (!bar) return;
    if (pageIndex === 1) {
        bar.classList.add('hidden');
    } else {
        bar.classList.remove('hidden');
    }
    const steps = bar.querySelectorAll('.progress-step');
    steps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        if (stepNum < pageIndex) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === pageIndex) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function navigateToPage(pageIndex) {
    const pageIds = ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7'];
    if (pageIndex < 1 || pageIndex > pageIds.length) return;

    // Find the current active page
    const activePage = document.querySelector('.celebration-page.active');
    
    if (activePage) {
        // Exit animation
        activePage.classList.remove('active');
        activePage.classList.add('exit');
        
        setTimeout(() => {
            activePage.classList.add('hidden');
            activePage.classList.remove('exit');
            
            // Enter new page
            const targetPage = document.getElementById(pageIds[pageIndex - 1]);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                setTimeout(() => {
                    targetPage.classList.add('active');
                }, 50);
            }
        }, 800); // sync with style.css transition speed
    } else {
        const targetPage = document.getElementById(pageIds[pageIndex - 1]);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('active');
        }
    }
    appState.currentPageIndex = pageIndex;
    updateProgressBar(pageIndex);

    // Special page actions
    if (pageIndex === 2) {
        // If entering greeting page, start stars if not started
        if (stars.length === 0) initStars();
    }
    if (pageIndex !== 5) {
        // Stop spawning balloons if leaving page 5
        appState.balloonsActive = false;
        appState.balloonIntervals.forEach(clearInterval);
        appState.balloonIntervals = [];
    }
    if (pageIndex === 7) {
        // Grand finale celebration trigger
        playMagicChime();
        spawnConfetti(window.innerWidth / 2, window.innerHeight / 3, 200);
        setTimeout(() => {
            spawnConfetti(window.innerWidth / 4, window.innerHeight / 2, 120);
            spawnConfetti((window.innerWidth * 3) / 4, window.innerHeight / 2, 120);
        }, 800);
    }
}

// -------------------------------------------------------------
// Interactive Element Logic
// -------------------------------------------------------------

// Check for dynamic name in URL parameters (e.g. index.html?name=Rita)
const urlParams = new URLSearchParams(window.location.search);
const nameParam = urlParams.get('name');
if (nameParam) {
    const cleanName = nameParam.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const nameEl = document.getElementById('birthdayName');
    if (nameEl) nameEl.innerHTML = `${cleanName} 💖`;
    document.title = `Happy Birthday, ${cleanName}! ✨`;
}

// 1. Entrance Transition & Cute Couple Quiz Gate
const enterBtn = document.getElementById('enterBtn');
const mainContent = document.getElementById('mainContent');

// Quiz DOM Elements
const quizModal = document.getElementById('quizModal');
const quizCard = document.getElementById('quizCard');
const quizProgressFill = document.getElementById('quizProgressFill');
const quizStepText = document.getElementById('quizStepText');
const quizQIcon = document.getElementById('quizQIcon');
const quizQText = document.getElementById('quizQText');
const quizInput = document.getElementById('quizInput');
const quizForm = document.getElementById('quizForm');
const quizFeedback = document.getElementById('quizFeedback');
const quizHintBtn = document.getElementById('quizHintBtn');
const quizHintText = document.getElementById('quizHintText');

let quizCurrentIndex = 0;

const quizQuestions = [
    {
        num: 1,
        icon: "💌",
        question: "What's your name? (The one Atik likes most)",
        hint: "Think of the sweet nicknames Atik always calls you with love! 😉",
        wrongMsg: "Oops! Atik is making a cute pouting face 🥺 Think of what he lovingly calls you!",
        correctMsg: "Yay! That's my sweetest baby! 🥰❤️",
        validate: (str) => {
            const clean = str.toLowerCase().trim();
            return clean.includes('baby') || clean.includes('wifey') || clean.includes('babu') || clean.includes('fatema');
        }
    },
    {
        num: 2,
        icon: "🏫",
        question: "Where did we first meet?",
        hint: "Remember our student days? Where did we both used to go? 🎒",
        wrongMsg: "Aww, did you forget our special meeting place? 😜 Think back to our student life!",
        correctMsg: "Spot on! Our college, where our story started! 💖",
        validate: (str) => {
            const clean = str.toLowerCase().trim();
            return clean.includes('college');
        }
    },
    {
        num: 3,
        icon: "⚖️",
        question: "Who loves whom more?",
        hint: "Think carefully... do we love the same, or who loves more? 🥰",
        wrongMsg: "Nope! Don't you dare say you love more! 😜 Atik loves you infinity or equally!",
        correctMsg: "Aww, so true! Either equal or Atik loves you endlessly! 💕",
        validate: (str) => {
            const clean = str.toLowerCase().trim();
            return clean.includes('both') || clean.includes('equal') || clean.includes('atik') || clean.includes('me more');
        }
    },
    {
        num: 4,
        icon: "😜",
        question: "What does Atik love doing with you the most?",
        hint: "Think about what Atik does all the time to playfully trouble you! 🤭",
        wrongMsg: "Haha nope! Think about what he does 24/7 to make you smile or annoyed! 😝",
        correctMsg: "Spot on! Teasing you is Atik's favorite thing in the universe! 😆❤️",
        validate: (str) => {
            const clean = str.toLowerCase().trim();
            return clean.includes('teas') || clean.includes('disturb') || clean.includes('jalat') || clean.includes('bother') || clean.includes('ragano');
        }
    },
    {
        num: 5,
        icon: "💋",
        question: "Which part of your body does Atik like the most?",
        hint: "The sweetest part you smile and talk with! 💄",
        wrongMsg: "Wrong guess! Think about where Atik always looks and loves to kiss! 😉💋",
        correctMsg: "Mmhmm, exactly! Your beautiful, sweet lips! 💋🔥",
        validate: (str) => {
            const clean = str.toLowerCase().trim();
            return clean.includes('lip') || clean.includes('thot');
        }
    },
    {
        num: 6,
        icon: "💖",
        question: "How much do you love Atik?",
        hint: "Express how much you love your hubby from the bottom of your heart! ❤️",
        wrongMsg: "Hey! That sounds too little! Express your love with all your heart! 🥺❤️",
        correctMsg: "Awww, my heart melted! I love you even more, Fatema! 🥹💕",
        validate: (str) => {
            const clean = str.toLowerCase().trim();
            if (clean.includes('little') || clean.includes('kom') || clean.length < 2) return false;
            return clean.includes('much') || clean.includes('lot') || clean.includes('infinity') || clean.includes('infinite') || clean.includes('everything') || clean.includes('world') || clean.includes('universe') || clean.includes('onek') || clean.includes('shob') || clean.includes('more') || clean.includes('love') || clean.length >= 3;
        }
    },
    {
        num: 7,
        icon: "🌸",
        question: "If Atik wants to kiss your cheeks, would you let him?",
        hint: "What would a loving wifey say to her husband? 😉",
        wrongMsg: "Excuse me?! You have to say yes of course! Try again, madam! 😤❤️",
        correctMsg: "Yay! Cheek kisses reserved exclusively for hubby! 😘✨",
        validate: (str) => {
            const clean = str.toLowerCase().trim();
            return clean.includes('yes') || clean.includes('course') || clean.includes('sure') || clean.includes('ha') || clean.includes('obossoi') || clean.includes('alway');
        }
    },
    {
        num: 8,
        icon: "🔥",
        question: "What if he wants to kiss your lips?",
        hint: "Don't be shy! What's your answer for your hubby? 🙈💋",
        wrongMsg: "Aww, are you blushing? Say yes! 🙈💋",
        correctMsg: "Access Granted! Welcome to your magical birthday world, My Queen! 👑💖🎉",
        validate: (str) => {
            const clean = str.toLowerCase().trim();
            return clean.includes('yes') || clean.includes('sure') || clean.includes('course') || clean.includes('ha') || clean.includes('obossoi') || clean.includes('definitely');
        }
    }
];

function renderCurrentQuizQuestion() {
    const q = quizQuestions[quizCurrentIndex];
    if (!q) return;

    quizQIcon.textContent = q.icon;
    quizQText.textContent = q.question;
    quizInput.value = '';
    quizInput.placeholder = "Type your answer here...";
    quizStepText.textContent = `Question ${q.num} of ${quizQuestions.length}`;
    quizProgressFill.style.width = `${((q.num) / quizQuestions.length) * 100}%`;
    
    quizFeedback.className = 'quiz-feedback hidden';
    quizFeedback.textContent = '';
    quizHintText.className = 'quiz-hint-text hidden';
    quizHintText.textContent = '';
    
    quizInput.disabled = false;
    setTimeout(() => quizInput.focus(), 150);
}

function handleQuizSubmit() {
    const userAns = quizInput.value.trim();
    if (!userAns) {
        showQuizWrong("Please type your sweet answer first! 💕");
        return;
    }

    const q = quizQuestions[quizCurrentIndex];
    if (q.validate(userAns)) {
        // Correct answer!
        playMagicChime();
        const rect = quizCard.getBoundingClientRect();
        spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);

        quizFeedback.className = 'quiz-feedback correct';
        quizFeedback.textContent = q.correctMsg;
        quizInput.disabled = true;

        if (quizCurrentIndex < quizQuestions.length - 1) {
            quizCurrentIndex++;
            setTimeout(() => {
                renderCurrentQuizQuestion();
            }, 900);
        } else {
            // All 8 questions completed!
            appState.quizPassed = true;
            setTimeout(() => {
                quizModal.classList.add('hidden');
                enterCelebration();
            }, 1300);
        }
    } else {
        // Wrong answer!
        showQuizWrong(q.wrongMsg);
    }
}

function showQuizWrong(msg) {
    playPopSound();
    quizCard.classList.remove('shake');
    void quizCard.offsetWidth; // trigger reflow
    quizCard.classList.add('shake');
    
    quizFeedback.className = 'quiz-feedback wrong';
    quizFeedback.textContent = msg;
    quizInput.focus();
}

if (quizHintBtn) {
    quizHintBtn.addEventListener('click', () => {
        const q = quizQuestions[quizCurrentIndex];
        if (q && q.hint) {
            quizHintText.textContent = q.hint;
            quizHintText.classList.remove('hidden');
        }
    });
}

if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleQuizSubmit();
    });
}

function openQuizGate() {
    getAudioContext();
    playMagicChime();
    if (appState.quizPassed) {
        enterCelebration();
        return;
    }
    quizCurrentIndex = 0;
    renderCurrentQuizQuestion();
    quizModal.classList.remove('hidden');
    playBackgroundMusic();
}

function enterCelebration() {
    getAudioContext();
    playMagicChime();
    
    // Show main layout wrapper
    mainContent.classList.remove('hidden');
    
    // Switch page
    navigateToPage(2);
    
    // Start background music / audio loops
    setTimeout(() => {
        playBackgroundMusic();
    }, 400);
}

enterBtn.addEventListener('click', openQuizGate);

// 2. Go to Cake Page (Page 2 -> Page 3)
const goToCakeBtn = document.getElementById('goToCakeBtn');
goToCakeBtn.addEventListener('click', () => {
    playMagicChime();
    navigateToPage(3);
});

// 2. Candle Blowing & Cake Page Logic
const candle = document.getElementById('candle');
const flame = document.getElementById('flame');
const smoke = document.getElementById('smoke');
const wishInstructions = document.getElementById('wishInstructions');
const cakeNavContainer = document.getElementById('cakeNavContainer');
const goToGiftBtn = document.getElementById('goToGiftBtn');
const cakeWrapper = document.querySelector('.cake-wrapper');

function blowCandle(e) {
    if (e) {
        e.stopPropagation();
    }
    // Only allow blowing if candle is lit
    if (flame && !flame.classList.contains('hidden')) {
        flame.classList.add('hidden');
        if (smoke) smoke.classList.remove('hidden');
        
        // Synthesize sound effects
        playBlowSound();
        playMagicChime();
        
        // Trigger massive confetti blast
        const targetRect = candle ? candle.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;
        spawnConfetti(centerX, centerY, 150);
        
        if (wishInstructions) {
            wishInstructions.innerHTML = `<span class="animate-fade-in" style="color: var(--color-gold); font-size: 1.1rem;">May all your secret wishes come true, my sweet Fatema! 🌟💖</span>`;
        }
        
        // Show "Open Gift" navigation control
        setTimeout(() => {
            if (cakeNavContainer) cakeNavContainer.classList.remove('hidden');
        }, 1200);
        
        // Play birthday song
        setTimeout(() => {
            playHappyBirthdaySong();
        }, 1000);
    }
}

if (candle) {
    candle.addEventListener('click', blowCandle);
}
if (cakeWrapper) {
    cakeWrapper.addEventListener('click', blowCandle);
}

goToGiftBtn.addEventListener('click', () => {
    playMagicChime();
    navigateToPage(4);
});

// 4. Gift Box Page Logic (Page 4 -> Page 5)
const giftBox = document.getElementById('giftBox');
const giftPanel = document.getElementById('giftPanel');
const secretCard = document.getElementById('secretCard');
const closeCardBtn = document.getElementById('closeCardBtn');
const goToBalloonsBtn = document.getElementById('goToBalloonsBtn');

giftBox.addEventListener('click', function() {
    if (!giftBox.classList.contains('open')) {
        giftBox.classList.add('open');
        playMagicChime();
        
        const rect = giftBox.getBoundingClientRect();
        spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
        
        setTimeout(() => {
            secretCard.classList.remove('hidden');
            giftPanel.classList.remove('hidden');
            setTimeout(() => {
                secretCard.classList.add('show');
            }, 50);
        }, 600);
    }
});

closeCardBtn.addEventListener('click', function() {
    secretCard.classList.remove('show');
    setTimeout(() => {
        secretCard.classList.add('hidden');
        giftPanel.classList.add('hidden');
        giftBox.classList.remove('open');
    }, 700);
});

goToBalloonsBtn.addEventListener('click', () => {
    playMagicChime();
    navigateToPage(5);
});

// 5. Balloon Wishes Page Logic (Page 5 -> Page 6)
const startBalloonsBtn = document.getElementById('startBalloonsBtn');
const balloonStartOverlay = document.getElementById('balloonStartOverlay');
const balloonField = document.getElementById('balloonField');
const wishDisplay = document.getElementById('wishDisplay');
const wishSender = document.getElementById('wishSender');
const wishText = document.getElementById('wishText');
const wishAvatar = document.getElementById('wishAvatar');
const closeWishBtn = document.getElementById('closeWishBtn');
const goToGalleryBtn = document.getElementById('goToGalleryBtn');

startBalloonsBtn.addEventListener('click', () => {
    balloonStartOverlay.classList.add('fade-out');
    appState.balloonsActive = true;
    startSpawningBalloons();
    getAudioContext();
});

closeWishBtn.addEventListener('click', () => {
    wishDisplay.classList.remove('show');
    setTimeout(() => {
        wishDisplay.classList.add('hidden');
    }, 500);
});

goToGalleryBtn.addEventListener('click', () => {
    playMagicChime();
    navigateToPage(6);
});

function startSpawningBalloons() {
    if (!appState.balloonsActive) return;

    function spawnSingleBalloon() {
        if (!appState.balloonsActive) return;
        
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        const hues = [330, 345, 355, 15, 310, 42]; // Romantic pink, rose, magenta, blush, champagne gold
        const hue = hues[Math.floor(Math.random() * hues.length)];
        const balloonColor = `hsl(${hue}, 85%, 68%)`;
        balloon.style.color = balloonColor;
        balloon.style.backgroundColor = balloonColor;
        
        const size = Math.random() * 15 + 40; 
        balloon.style.width = `${size}px`;
        balloon.style.height = `${size * 1.3}px`;
        
        const fieldWidth = balloonField.clientWidth;
        const left = Math.random() * (fieldWidth - 80) + 10;
        balloon.style.left = `${left}px`;
        
        const string = document.createElement('div');
        string.className = 'balloon-string';
        balloon.appendChild(string);
        
        balloonField.appendChild(balloon);
        
        let currentPos = -80;
        const speed = Math.random() * 2 + 1.2;
        const wobbleSpeed = Math.random() * 0.04 + 0.02;
        let wobble = 0;

        const floatInterval = setInterval(() => {
            currentPos += speed;
            wobble += wobbleSpeed;
            const wobbleOffset = Math.sin(wobble) * 15;
            
            balloon.style.bottom = `${currentPos}px`;
            balloon.style.transform = `translateX(${wobbleOffset}px)`;
            
            if (currentPos > balloonField.clientHeight + 100) {
                clearInterval(floatInterval);
                balloon.remove();
            }
        }, 16);
        
        balloon.addEventListener('click', () => {
            clearInterval(floatInterval);
            popBalloon(balloon, balloonColor);
        });

        // Loop spawns
        const timer = setTimeout(spawnSingleBalloon, Math.random() * 1200 + 700);
        appState.balloonIntervals.push(timer);
    }

    spawnSingleBalloon();
    spawnSingleBalloon();
}

function popBalloon(balloonElement, color) {
    playPopSound();
    
    const rect = balloonElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Spawn a burst of love emojis (💖, 🥰, 💕, 💘, 💓, 💗, 💌, ❤️, 🌹, ✨, 🌸, 💋)
    const loveEmoji = spawnLoveEmojiBurst(centerX, centerY, 16);
    spawnSparkles(centerX, centerY, 25);
    
    balloonElement.classList.add('pop');
    
    const wish = birthdayWishes[Math.floor(Math.random() * birthdayWishes.length)];
    
    setTimeout(() => {
        wishAvatar.innerText = loveEmoji; // Set the avatar to the popped love emoji
        wishSender.innerText = wish.sender;
        wishText.innerText = wish.text;
        
        wishDisplay.style.borderColor = color;
        wishDisplay.style.boxShadow = `0 0 30px ${color}`;
        wishDisplay.classList.remove('hidden');
        setTimeout(() => {
            wishDisplay.classList.add('show');
        }, 50);
        
        balloonElement.remove();
    }, 200);
}

// 6. Journey Polaroid Slideshow
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevSlideBtn = document.getElementById('prevSlide');
const nextSlideBtn = document.getElementById('nextSlide');

// 3D Polaroid Card Flip functionality
const slideCards = document.querySelectorAll('.slide-card');
slideCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('flipped');
        playMagicChime();
        // Pause auto-sliding when user interacts with a card
        clearInterval(autoSlideInterval);
    });
});

function showSlide(index) {
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    // Reset flip on previous card
    if (slideCards[appState.activeSlide]) {
        slideCards[appState.activeSlide].classList.remove('flipped');
    }

    slides[appState.activeSlide].classList.remove('active');
    dots[appState.activeSlide].classList.remove('active');
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    appState.activeSlide = index;
}

prevSlideBtn.addEventListener('click', () => {
    showSlide(appState.activeSlide - 1);
});

nextSlideBtn.addEventListener('click', () => {
    showSlide(appState.activeSlide + 1);
});

dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        showSlide(index);
    });
});

// Forward to Finale from Gallery
const goToFinaleBtn = document.getElementById('goToFinaleBtn');
if (goToFinaleBtn) {
    goToFinaleBtn.addEventListener('click', () => {
        playMagicChime();
        navigateToPage(7);
    });
}

// Finale Read Letter Again
const finaleReadLetterBtn = document.getElementById('finaleReadLetterBtn');
if (finaleReadLetterBtn) {
    finaleReadLetterBtn.addEventListener('click', () => {
        playMagicChime();
        secretCard.classList.remove('hidden');
    });
}

// Interactive Story Progress Stepper click navigation
document.querySelectorAll('#storyProgressBar .progress-step').forEach(step => {
    step.addEventListener('click', () => {
        const targetStep = parseInt(step.getAttribute('data-step'));
        if (targetStep && targetStep !== appState.currentPageIndex) {
            if (!appState.quizPassed && targetStep > 1) {
                openQuizGate();
                return;
            }
            playMagicChime();
            navigateToPage(targetStep);
        }
    });
});

// Replay Surprise / Restart Button
document.querySelectorAll('#restartBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        playMagicChime();
        
        // Stop birthday song
        stopBirthdaySong();
        
        // Reset candle state
        flame.classList.remove('hidden');
        smoke.classList.add('hidden');
        wishInstructions.innerHTML = `<span class="pulse-text">Tap the flame to blow your wish into the stars! ✨</span>`;
        cakeNavContainer.classList.add('hidden');
        
        // Reset gift state
        giftBox.classList.remove('open');
        secretCard.classList.remove('show');
        secretCard.classList.add('hidden');
        
        // Reset balloon game state
        balloonStartOverlay.classList.remove('fade-out');
        wishDisplay.classList.remove('show');
        wishDisplay.classList.add('hidden');
        const spawnedBalloons = balloonField.querySelectorAll('.balloon');
        spawnedBalloons.forEach(b => b.remove());
        
        // Reset slide index
        showSlide(0);

        // Return to Page 1 for fresh journey
        navigateToPage(1);
    });
});

// 8. Sound System Controls (MP3 Song & Soundscape)
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const iconPlaying = musicToggle.querySelector('.music-icon.playing');
const iconMuted = musicToggle.querySelector('.music-icon.muted');

function playBackgroundMusic() {
    if (appState.isMusicMuted) return;
    if (bgMusic) {
        bgMusic.play().then(() => {
            console.log("Playing Aarzu (Asim Azhar)");
        }).catch(err => {
            console.log("Audio notice:", err.message);
            // Fallback to ambient soundscape if mp3 file is not loaded yet
            startAmbientSoundscape();
        });
    } else {
        startAmbientSoundscape();
    }
}

function pauseBackgroundMusic() {
    if (bgMusic) {
        bgMusic.pause();
    }
}

musicToggle.addEventListener('click', () => {
    appState.isMusicMuted = !appState.isMusicMuted;
    
    if (appState.isMusicMuted) {
        iconPlaying.classList.add('hidden');
        iconMuted.classList.remove('hidden');
        pauseBackgroundMusic();
        stopBirthdaySong();
    } else {
        iconPlaying.classList.remove('hidden');
        iconMuted.classList.add('hidden');
        getAudioContext();
        playBackgroundMusic();
        
        // Resume melody if candle was already blown out and no mp3
        if (flame.classList.contains('hidden') && !appState.birthdaySongPlaying && (!bgMusic || bgMusic.paused)) {
            playHappyBirthdaySong();
        }
    }
});

// Start background animations
animateParticles();
