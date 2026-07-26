// ============================================================
// 🛡️ ANTI-THEFT DOMAIN LOCK PROTECTION (Protection 2)
// Prevents unauthorized pirate websites from stealing & re-hosting game files.
// Allowed: Localhost/Files, Itch.io, Itch CDN (hwcdn.net), CrazyGames, Poki, GitHub Pages, Vercel, Netlify.
// ============================================================
(function checkDomainAuthorization() {
    const host = window.location.hostname.toLowerCase();
    const isLocal = !host || host === "localhost" || host === "127.0.0.1" || window.location.protocol === "file:";
    const allowedDomains = [
        "itch.io", "itch.zone", "hwcdn.net",
        "crazygames.com", "crazygames-content.com",
        "poki.com", "poki-gdn.com",
        "github.io", "vercel.app", "netlify.app"
    ];

    const isAllowed = isLocal || allowedDomains.some(domain => host === domain || host.endsWith("." + domain));

    if (!isAllowed) {
        window.addEventListener("DOMContentLoaded", () => {
            document.body.innerHTML = `
                <div style="position:fixed; inset:0; background:#0a0a16; color:#00f0ff; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center; padding:20px; z-index:999999;">
                    <h1 style="color:#ff0055; font-size:2.2rem; margin-bottom:10px;">⛔ UNAUTHORIZED COPY DETECTED</h1>
                    <p style="font-size:1.1rem; max-width:600px; color:#cccccc; line-height:1.6;">
                        This game (<strong>Cyber-Ninja Astronaut</strong>) is licensed exclusively for official game portals.
                    </p>
                    <p style="margin-top:20px; font-weight:bold; color:#00f0ff;">
                        Please play the official version on Itch.io or CrazyGames!
                    </p>
                    <div style="margin-top:30px; font-size:0.85rem; color:#888;">Created by RMZ Games • Anti-Theft Guard Active</div>
                </div>
            `;
        });
        console.warn("Unauthorized domain hosting blocked by Anti-Theft Guard.");
    }
})();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize to fit the window

let gameOver = false;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let playerName = localStorage.getItem("playerName") || "";
let lastDeathType = ""; // "spikes", "fall_void", "boss_laser", "enemy_contact", "enemy_shot", "bomb_blast"

// ============================================================
// 🔐 SECRET DEVELOPER MODE UNLOCK SYSTEM
// Step 1: Click HIGH SCORE 5 times
// Step 2: Type DOOMGOD + Enter
// → Triggers cyan cyber-glitch effect and unlocks all dev keys
// ============================================================
let isDevModeUnlocked = false;
let secretClickCount = 0;
let secretClickTimer = null;
let secretTypedBuffer = "";
const SECRET_CODE = "DOOMGOD";

window.onHighScoreClick = function() {
    // Secret unlock only works from the Main Menu screen
    if (gameState !== "menu") return;

    secretClickCount++;
    // Reset click count if too slow (3 second window)
    clearTimeout(secretClickTimer);
    secretClickTimer = setTimeout(() => { secretClickCount = 0; }, 3000);

    if (secretClickCount >= 5) {
        secretClickCount = 0;
        secretTypedBuffer = "";
        // Subtle visual hint: highscore panel briefly flickers cyan
        const panels = [document.getElementById("menu-highscore"), document.getElementById("hud-highscore")];
        panels.forEach(p => {
            if (p) {
                p.style.transition = "color 0.15s";
                p.style.color = "#00f0ff";
                setTimeout(() => { p.style.color = ""; }, 400);
            }
        });
        // Now start listening for DOOMGOD typed (menu only)
        document.addEventListener("keydown", onSecretCodeKeydown);
    }
};

function onSecretCodeKeydown(e) {
    // Only process when still on the main menu — not during gameplay
    if (gameState !== "menu") {
        document.removeEventListener("keydown", onSecretCodeKeydown);
        secretTypedBuffer = "";
        return;
    }

    // Block the key from being processed by anything else
    e.stopPropagation();

    if (e.key === "Enter") {
        if (secretTypedBuffer === SECRET_CODE) {
            document.removeEventListener("keydown", onSecretCodeKeydown);
            secretTypedBuffer = "";
            triggerDevUnlockGlitch();
        } else {
            // Wrong code — reset silently
            secretTypedBuffer = "";
            document.removeEventListener("keydown", onSecretCodeKeydown);
        }
        return;
    }
    // Only capture letters
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        secretTypedBuffer += e.key.toUpperCase();
        // Prevent buffer growing past code length
        if (secretTypedBuffer.length > SECRET_CODE.length) {
            secretTypedBuffer = secretTypedBuffer.slice(-SECRET_CODE.length);
        }
    }
}

function triggerDevUnlockGlitch() {
    isDevModeUnlocked = true;

    // Create full-screen cyan glitch flash overlay
    const glitch = document.createElement("div");
    glitch.id = "devGlitchOverlay";
    glitch.style.cssText = `
        position: fixed; inset: 0; z-index: 99999; pointer-events: none;
        background: rgba(0,240,255,0.18);
        animation: devGlitchAnim 0.9s forwards;
    `;
    document.body.appendChild(glitch);

    // Inject keyframe animation if not already present
    if (!document.getElementById("devGlitchStyle")) {
        const style = document.createElement("style");
        style.id = "devGlitchStyle";
        style.textContent = `
            @keyframes devGlitchAnim {
                0%   { opacity:1; transform: skewX(0deg); filter: brightness(2); }
                10%  { opacity:0.9; transform: skewX(-6deg); filter: brightness(3) hue-rotate(20deg); }
                20%  { opacity:1; transform: skewX(4deg) translateX(-8px); }
                30%  { opacity:0.7; transform: skewX(-3deg) translateX(6px); filter: brightness(2); }
                50%  { opacity:0.4; transform: skewX(1deg); }
                80%  { opacity:0.15; transform: skewX(0deg); }
                100% { opacity:0; transform: skewX(0deg); }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => { glitch.remove(); }, 950);

    // Show unlock achievement toast
    unlockAchievement("devUnlock", "🛠️ DEVELOPER MODE UNLOCKED!");
}

function triggerBossDefeatGlitchEffect() {
    // 1. Heavy & Violent Screen Shake on Boss Defeat (3 Seconds = 180 frames @ 60fps, Intensity 35)
    triggerScreenShake(180, 35);

    // 2. Full-screen Cyber Glitch Flash & Distortion Overlay (3 Seconds, matching shake duration)
    const glitch = document.createElement("div");
    glitch.id = "bossDefeatGlitchOverlay";
    glitch.style.cssText = `
        position: fixed; inset: 0; z-index: 99999; pointer-events: none;
        background: radial-gradient(circle, rgba(0, 240, 255, 0.35) 0%, rgba(255, 0, 85, 0.3) 50%, rgba(0, 0, 0, 0.6) 100%);
        mix-blend-mode: color-dodge;
        animation: bossDefeatGlitchAnim 3s forwards;
    `;
    document.body.appendChild(glitch);

    // Inject CSS keyframe animation for cyber glitch effect if not present
    if (!document.getElementById("bossDefeatGlitchStyle")) {
        const style = document.createElement("style");
        style.id = "bossDefeatGlitchStyle";
        style.textContent = `
            @keyframes bossDefeatGlitchAnim {
                0%   { opacity: 1; transform: scale(1) skewX(0deg); filter: brightness(2.8) contrast(2.2) hue-rotate(0deg); }
                10%  { opacity: 0.95; transform: scale(1.04) skewX(-12deg) translateX(18px); filter: brightness(3.5) contrast(2.8) hue-rotate(90deg); }
                20%  { opacity: 0.85; transform: scale(0.96) skewX(10deg) translateX(-20px); filter: brightness(2.2) contrast(2) hue-rotate(180deg); }
                30%  { opacity: 0.9; transform: scale(1.03) skewY(-5deg) translateY(-12px); filter: brightness(3.8) contrast(3.2) hue-rotate(270deg); }
                45%  { opacity: 0.8; transform: scale(0.97) skewX(-8deg) translateX(14px); filter: brightness(2.5) contrast(2.2); }
                60%  { opacity: 0.85; transform: scale(1.02) skewX(8deg) translateX(-10px); filter: brightness(3) contrast(2.5) hue-rotate(45deg); }
                75%  { opacity: 0.6; transform: scale(1.01) skewX(-4deg) translateX(6px); filter: brightness(2) contrast(1.6); }
                90%  { opacity: 0.3; transform: scale(1) skewX(0deg); filter: brightness(1.3) contrast(1.2); }
                100% { opacity: 0; transform: scale(1) skewX(0deg); filter: brightness(1) contrast(1); }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => { glitch.remove(); }, 3050);

    // 3. Heavy cyber spark burst particles around player
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    spawnParticles(px, py, "#00f0ff", 45, 14);
    spawnParticles(px, py, "#ff0055", 40, 12);
    spawnParticles(px, py, "#ffdd00", 35, 10);
    spawnParticles(px, py, "#aa00ff", 30, 9);
}


const DEATH_DICTIONARY = {
    enemy_contact: [
        (name) => `Oof ${name}! You collided head-on with an enemy patrol!`,
        (name) => `Watch out ${name}! An enemy robot crushed your line of defense!`,
        (name) => `Tough luck, ${name}! You got ambushed by an enemy ground unit!`,
        (name) => `Close one, ${name}! An enemy unit ran you right over!`
    ],
    enemy_shot: [
        (name) => `Downed in action, ${name}! An enemy drone shot you down!`,
        (name) => `Stay sharp, ${name}! You got picked off by enemy plasma fire!`,
        (name) => `Target locked, ${name}! An enemy sniper caught you off guard!`,
        (name) => `Nice try ${name}, but enemy laser fire took you out!`
    ],
    bomb_blast: [
        (name) => `Kaboom, ${name}! You were caught in a massive bomb detonation!`,
        (name) => `Watch the explosives, ${name}! A heavy bomb blast took you down!`,
        (name) => `Blown away, ${name}! That bomb splash damage was lethal!`,
        (name) => `Heavy impact, ${name}! An explosive bomb blast finished the run!`
    ],
    spikes: [
        (name) => `Watch your step, ${name}! You landed straight onto razor spikes!`,
        (name) => `Ouch ${name}! Those sharp laser spikes ended your jump!`,
        (name) => `Mind the floor, ${name}! Impaled on hazardous platform spikes!`,
        (name) => `Tough drop, ${name}! Those deadly spikes caught you slipping!`
    ],
    fall_void: [
        (name) => `Mistimed jump, ${name}! You plunged deep into the infinite void!`,
        (name) => `Watch the gap, ${name}! You missed the platform landing!`,
        (name) => `Gravity wins, ${name}! You fell straight through the sector floor!`,
        (name) => `Unlucky leap, ${name}! You dropped into the endless abyss!`
    ],
    boss_laser: [
        (name) => `Obliterated, ${name}! The Boss's orbital laser beam vaporized you!`,
        (name) => `Dodge higher, ${name}! The Mega Mech's quad-laser swept you away!`,
        (name) => `Total annihilation, ${name}! You were caught directly in the Boss laser blast!`,
        (name) => `Epic fight, ${name}! But the Dreadnought's laser beam was too powerful!`
    ],
    default: [
        (name) => `Great effort, ${name}! You gave it everything you had!`,
        (name) => `Valiant attempt, ${name}! Next time you'll crush it!`,
        (name) => `Solid battle, ${name}! Gear up for another run!`
    ]
};

function getRandomDeathMessage(type, name) {
    const list = DEATH_DICTIONARY[type] || DEATH_DICTIONARY.default;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex](name);
}
let gameState = "menu"; // Possible values: "menu", "playing", "gameOver", "settings", "howToPlay"
let globalVolume = parseFloat(localStorage.getItem("globalVolume"));
if (isNaN(globalVolume)) globalVolume = 0.5;

// Track whether the player has played at least one session
let hasPlayedOnce = false;

// Screen Shake variables
let screenShakeTimer = 0;
let screenShakeIntensity = 0;

function triggerScreenShake(duration, intensity) {
    screenShakeTimer = duration;
    screenShakeIntensity = intensity;
}

// Load images relative to root
// ============================================================
// ⌛ ASSET PRELOADER & LOADING SCREEN SYSTEM
// ============================================================
let totalAssetsToLoad = 16;
let loadedAssetsCount = 0;
let loadingScreenFinished = false;

function trackAssetLoad(name) {
    loadedAssetsCount++;
    const percent = Math.min(100, Math.floor((loadedAssetsCount / totalAssetsToLoad) * 100));

    const fillEl = document.getElementById("loadingBarFill");
    const percentEl = document.getElementById("loadingPercentText");
    const statusEl = document.getElementById("loadingStatusText");

    if (fillEl) fillEl.style.width = percent + "%";
    if (percentEl) percentEl.innerText = percent + "%";
    if (statusEl && name) statusEl.innerText = "LOADING: " + name.toUpperCase();

    if (loadedAssetsCount >= totalAssetsToLoad) {
        finishLoadingScreen();
    }
}

window.showNameEntryScreen = function() {
    const nameScreen = document.getElementById("nameEntryScreen");
    const inputStep = document.getElementById("nameInputStep");
    const introStep = document.getElementById("introBriefingStep");

    if (nameScreen) {
        nameScreen.classList.add("active");
        nameScreen.style.display = "flex";
    }
    if (inputStep) inputStep.style.display = "block";
    if (introStep) introStep.style.display = "none";
};

function finishLoadingScreen() {
    if (loadingScreenFinished) return;
    loadingScreenFinished = true;

    const fillEl = document.getElementById("loadingBarFill");
    const percentEl = document.getElementById("loadingPercentText");
    const statusEl = document.getElementById("loadingStatusText");
    const btnEl = document.getElementById("enterGameBtn");

    if (fillEl) fillEl.style.width = "100%";
    if (percentEl) percentEl.innerText = "100%";
    if (statusEl) statusEl.innerText = "CYBER CORE READY!";
    if (btnEl) btnEl.style.display = "inline-block";
}

window.enterGameFromLoading = function() {
    const loadingScreen = document.getElementById("loadingScreen");
    
    // Unlock Audio instantly on this user click
    safePlay(menuSound);

    if (loadingScreen) {
        loadingScreen.classList.remove("active");
        setTimeout(() => { loadingScreen.style.display = "none"; }, 300);
    }

    // Proceed to saved state
    const storedName = localStorage.getItem("ninjaPlayerName");
    if (storedName) {
        playerName = storedName;
        if (typeof window.showMainMenu === "function") {
            window.showMainMenu();
        } else {
            setGameState("menu");
        }
    } else {
        if (typeof window.showNameEntryScreen === "function") {
            window.showNameEntryScreen();
        }
    }
};

// Global Audio Unlocker on any user interaction (clicks, keys, touches)
function tryUnlockAudio() {
    if (gameState === "menu" && menuSound.paused) {
        safePlay(menuSound);
    }
}
["click", "keydown", "touchstart", "pointerdown"].forEach(evt => {
    window.addEventListener(evt, tryUnlockAudio, { passive: true });
});

// Fallback safety: show enter button after max 1.8 seconds
setTimeout(() => {
    finishLoadingScreen();
}, 1800);

function loadImg(src, name) {
    const img = new Image();
    img.onload = () => trackAssetLoad(name || "Image");
    img.onerror = () => {
        console.error("Failed to load: " + src);
        trackAssetLoad(name || "Image");
    };
    img.src = src;
    return img;
}

const backgroundImage = loadImg("Images/GameBackground.jpg", "Background");
const playerSpriteSheet = loadImg("Images/NewPlayermovement.png", "Player Sprite");

// Walking RIGHT (left-to-right) — 3 frames
const robotFramesLTR = [
    loadImg("Images/robot_ltr1.png", "Robot LTR 1"),
    loadImg("Images/robot_ltr2.png", "Robot LTR 2"),
    loadImg("Images/robot_ltr3.png", "Robot LTR 3"),
];

// Walking LEFT (right-to-left) — 4 frames
const robotFramesRTL = [
    loadImg("Images/robot_rtl1.png", "Robot RTL 1"),
    loadImg("Images/robot_rtl2.png", "Robot RTL 2"),
    loadImg("Images/robot_rtl3.png", "Robot RTL 3"),
    loadImg("Images/robot_rtl4.png", "Robot RTL 4"),
];

// Death explosion image
const robotDestroyImg = loadImg("Images/robot_destroy.png", "Robot Destroy");

// Sentry Orb Drone image
const sentryDroneImg = loadImg("Images/sentry_drone.png", "Sentry Drone");

// Jetpack image
const jetpackImg = loadImg("Images/jetpack.png", "Jetpack");

// Boss at Score 500 image
const boss500Img = loadImg("Images/boss_500.png", "Boss Sprite");

const shootingEnemySpriteSheet = loadImg("Images/AIDroneEnemyMovement.png", "AI Drone Sheet");
const platformImage = loadImg("Images/platform.jpg", "Platform");
const movingPlatformImage = loadImg("Images/moving-platform.jpg", "Moving Platform");
const spikeImage = loadImg("Images/testingspike.png", "Spike Hazard");
const menuImage = loadImg("Images/GameMenuBackground.webp", "Menu Background");


// Load sounds relative to root
const backgroundSound = new Audio();
backgroundSound.src = "Sounds/Playingthegamesound.wav";
backgroundSound.loop = true;
backgroundSound.preload = "auto";
backgroundSound.load();

const jumpSound = new Audio("Sounds/jumping_sound.wav");
const shootSound = new Audio("Sounds/Playershooting.mp3");
const fallSound = new Audio("Sounds/Playerfallingdown.mp3");
const spikeDeathSound = new Audio("Sounds/Playerkilledbyspikes.wav");
const playerDeathSound = new Audio("Sounds/Playergetsshootbyenemy.mp3");
const enemyShootSound = new Audio("Sounds/Droneshooting.mp3");
const enemyDeathSound = new Audio("Sounds/Enemydying.wav");
const powerUpSound = new Audio("Sounds/playerpowerup.wav");
const newHighScoreSound = new Audio("Sounds/highscore.wav");

const menuSound = new Audio();
menuSound.src = "Sounds/GameMenuSound.wav";
menuSound.loop = true;
menuSound.preload = "auto";
menuSound.load();

// Helper: safely play a sound — waits for it if not ready
function safePlay(audio) {
    if (!audio || !audio.src) return;
    audio.currentTime = 0;
    const doPlay = () => audio.play().catch(() => {});
    if (audio.readyState >= 2) {
        doPlay();
    } else {
        audio.addEventListener("canplay", function onReady() {
            audio.removeEventListener("canplay", onReady);
            doPlay();
        });
    }
}

const allSounds = [
    backgroundSound, jumpSound, shootSound, fallSound,
    spikeDeathSound, playerDeathSound, enemyShootSound,
    enemyDeathSound, powerUpSound, newHighScoreSound, menuSound
];


// Global Volume control
function setVolume(volume) {
    globalVolume = volume;
    localStorage.setItem("globalVolume", volume);
    allSounds.forEach(sound => {
        if (sound) sound.volume = volume;
    });
}
setVolume(globalVolume); // Apply initial volume

// Particle class for dynamic particle effects
class Particle {
    constructor(x, y, color, size, speedX, speedY, life) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.maxLife = life;
        this.life = life;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }
    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillRect(this.x - camera.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

const particles = [];

function spawnParticles(x, y, color, count, speedMax) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * speedMax + 1;
        const speedX = Math.cos(angle) * speed;
        const speedY = Math.sin(angle) * speed;
        const size = Math.random() * 4 + 2;
        const life = Math.random() * 15 + 15; // 15 to 30 frames
        particles.push(new Particle(x, y, color, size, speedX, speedY, life));
    }
}

// Animation class to handle sprite animations
class Animation {
    constructor(frames, frameRate) {
        this.frames = frames;
        this.frameRate = frameRate;
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
    }

    update() {
        this.frameTimer++;
        if (this.frameTimer >= this.frameRate) {
            this.frameTimer = 0;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentFrameIndex];
    }
}

// Player animation frames
const playerAnimations = {
    idle: new Animation([{ x: 0, y: 0, width: 32, height: 48 }], 1),
    walk: new Animation([{ x: 32, y: 0, width: 32, height: 48 }, { x: 64, y: 0, width: 32, height: 48 }], 10),
    jumpStart: new Animation([{ x: 96, y: 0, width: 32, height: 48 }], 1),
    jump: new Animation([{ x: 128, y: 0, width: 32, height: 48 }], 1),
    jumpLand: new Animation([{ x: 160, y: 0, width: 32, height: 48 }], 1),
    dieLie: new Animation([{ x: 224, y: 0, width: 32, height: 48 }], 1)
};


// Shooting enemy (drone) animation frames
const shootingEnemyAnimations = {
    fly: new Animation(
        [
            { x: 0, y: 0, width: 30, height: 40 },
            { x: 30, y: 0, width: 28, height: 40 },
            { x: 60, y: 0, width: 30, height: 40 }
        ],
        10
    ),
    explode: new Animation(
        [
            { x: 60, y: 0, width: 30, height: 40 }
        ],
        1
    )
};

let currentAnimation = playerAnimations.idle;
let isDying = false;
let isJumping = false;
let isJumpStarting = false;
let isJumpLanding = false;

const player = {
    x: 100,
    y: canvas.height - 150,
    width: 40,
    height: 58,
    velocityX: 0,
    velocityY: 0,
    speed: 6,
    jumpHeight: 14,
    isJumping: false,
    direction: 1,
    score: 0,
    lives: 1,
    earnedLifeMilestones: [],
    invincibleTimer: 0,
    lastPlatform: null,
    isShieldActive: false,
    shieldTimer: 0,
    shieldMaxTimer: 300,
    isRocketActive: false,
    rocketTimer: 0,
    rocketMaxTimer: 360,
    jumpsLeft: 2,           // Track jumps left (Double Jump support)
    isDoubleJumping: false, // Track if currently doing double-jump backflip
    rotation: 0             // Visual rotation angle
};

const camera = {
    x: 0,
    lockedX: null,   // set when boss fight starts, cleared when boss is defeated
    update: function() {
        if (this.lockedX !== null) {
            this.x = this.lockedX;  // Camera frozen during boss fight!
            return;
        }
        this.x = player.x - canvas.width / 3;
        if (this.x < 0) this.x = 0;
    }
};

class Platform {
    constructor(x, y, width, height, isMoving = false, hasSpikes = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isMoving = isMoving;
        this.originalX = x;
        this.moveRange = 65;
        this.direction = 1;
        // DIFFICULTY SCALING: Moving platform speed increases slightly with score
        const baseSpeed = isMoving ? 2 : 0;
        this.speed = isMoving ? (baseSpeed + Math.min(3, player.score / 200)) : 0;
        this.hasSpikes = hasSpikes;
        this.hasScored = false; // Ensures platform awards +50 points ONLY ONCE on first landing

        this.deltaX = 0;

        if (hasSpikes) {
            let positionChance = Math.random();
            if (positionChance < 0.33) {
                this.spikeX = this.x;
            } else if (positionChance < 0.66) {
                this.spikeX = this.x + this.width / 2 - 30;
            } else {
                this.spikeX = this.x + this.width - 60;
            }
            this.spikeWidth = this.width / 3;
        }
    }

    update() {
        this.deltaX = 0;
        if (this.isMoving) {
            // Apply scale speed — boosted by smooth global speed multiplier
            const speedScale = (1 + Math.min(1.5, player.score / 200) * 0.5) * gameSpeedMult;
            this.deltaX = this.direction * this.speed * speedScale;
            this.x += this.deltaX;
            if (this.x > this.originalX + this.moveRange || this.x < this.originalX - this.moveRange) {
                this.direction *= -1;
            }
            if (this.hasSpikes) {
                this.spikeX += this.deltaX;
            }
        }
    }

    draw() {
        ctx.save();
        const drawX = this.x - camera.x;

        // Subtle neon glow — gentle, not eye-straining
        if (this.isMoving) {
            ctx.shadowColor = "#6600cc";  // soft purple for moving
            ctx.shadowBlur = 6;
        } else {
            ctx.shadowColor = "#0055aa";  // soft blue for static
            ctx.shadowBlur = 6;
        }

        const platformImg = this.isMoving ? movingPlatformImage : platformImage;
        if (platformImg.complete && platformImg.naturalWidth !== 0) {
            ctx.drawImage(platformImg, drawX, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.isMoving ? "#110022" : "#0a1a3a";
            ctx.fillRect(drawX, this.y, this.width, this.height);
        }

        // Thin neon top border — 2px only, not overpowering
        ctx.shadowBlur = 0;
        if (this.isMoving) {
            // Moving: subtle violet line
            ctx.fillStyle = "rgba(100, 0, 200, 0.65)";
            ctx.fillRect(drawX, this.y, this.width, 2);
        } else {
            // Static: calm steel-blue line
            ctx.fillStyle = "rgba(60, 140, 255, 0.75)";
            ctx.fillRect(drawX, this.y, this.width, 2);
        }

        if (this.hasSpikes && spikeImage.complete && spikeImage.naturalWidth !== 0) {
            for (let i = 0; i < this.spikeWidth; i += 20) {
                ctx.drawImage(
                    spikeImage,
                    this.spikeX + i - camera.x, this.y - 15, 20, 15
                );
            }
        }
        ctx.restore();
    }
}

class NonShootingEnemy {
    constructor(platform) {
        this.platform = platform;
        this.width = 72;
        this.height = 100;
        this.x = platform.x + platform.width / 4;
        this.y = platform.y - this.height + 10;
        // DIFFICULTY SCALING: Robot speed increases with score
        this.speed = 1.8 + Math.min(3, player.score / 150) * 0.5;
        this.direction = 1;  // 1 = walking right, -1 = walking left
        this.minX = platform.x + 5;
        this.maxX = platform.x + platform.width - this.width - 5;
        this.isExploding = false;
        this.explodeTimer = 0;
        // Per-direction frame state
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameRate  = 5;  // ticks per frame (~12fps for smooth walk)
    }

    update() {
        if (this.isExploding) {
            this.explodeTimer++;
            if (this.explodeTimer >= 30) {
                this.isExploding = false;
                const index = enemies.indexOf(this);
                if (index !== -1) enemies.splice(index, 1);
            }
        } else {
            // Keep enemy snapped to platform Y and update horizontal bounds for moving platforms
            this.y = this.platform.y - this.height + 10;
            this.minX = this.platform.x + 5;
            this.maxX = this.platform.x + this.platform.width - this.width - 5;

            this.x += this.direction * this.speed * gameSpeedMult;
            if (this.x <= this.minX || this.x >= this.maxX) {
                this.direction *= -1;
                this.frameIndex = 0;   // reset frame on direction change
                this.frameTimer = 0;
            }

            // Advance frame
            this.frameTimer++;
            if (this.frameTimer >= this.frameRate) {
                this.frameTimer = 0;
                const frames = this.direction === 1 ? robotFramesLTR : robotFramesRTL;
                this.frameIndex = (this.frameIndex + 1) % frames.length;
            }


        }
    }

    draw() {
        ctx.save();
        const drawX = this.x - camera.x;

        if (this.isExploding) {
            // Normal-size explosion — same footprint as the robot, just fading
            if (robotDestroyImg.complete && robotDestroyImg.naturalWidth) {
                ctx.globalAlpha = Math.max(0, 1 - this.explodeTimer / 30);
                ctx.shadowColor = "#ff5500";
                ctx.shadowBlur  = 20;
                ctx.drawImage(robotDestroyImg, drawX - 10, this.y - 10, this.width + 20, this.height + 20);
            }
        } else {
            // Pick correct directional frame array
            const frames = this.direction === 1 ? robotFramesLTR : robotFramesRTL;
            const frameImg = frames[this.frameIndex % frames.length];
            if (!frameImg || !frameImg.complete || !frameImg.naturalWidth) {
                ctx.restore();
                return;
            }

            ctx.drawImage(frameImg, drawX, this.y, this.width, this.height);
        }
        ctx.restore();
    }

    explode() {
        this.isExploding = true;
        enemyDeathSound.play();
        // Particle burst
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        spawnParticles(cx, cy, "#ff5500", 12, 5);
        spawnParticles(cx, cy, "#ff0055", 8,  4);
        spawnParticles(cx, cy, "#ffdd00", 6,  6);
        spawnParticles(cx, cy, "#00ccff", 5,  3);
        triggerScreenShake(10, 4);
    }
}

class ShootingEnemy {
    constructor(platform) {
        this.platform = platform;
        this.x = platform.x + platform.width / 4;
        this.y = platform.y - 40;
        this.width = 30;
        this.height = 40;
        // DIFFICULTY SCALING: Drone movement speed increases with score
        this.speed = 2 + Math.min(3, player.score / 150) * 0.5;
        this.direction = 1;
        this.minX = platform.x + 10;
        this.maxX = platform.x + platform.width - this.width - 10;
        this.currentAnimation = shootingEnemyAnimations.fly;
        this.isExploding = false;
        this.explodeTimer = 0;
        // DIFFICULTY SCALING: Drone shoots more frequently as score goes up
        this.shootCooldown = Math.max(50, 100 - Math.floor(player.score / 100) * 10);
        this.shootTimer = 0;
    }

    update() {
        if (this.isExploding) {
            this.explodeTimer++;
            if (this.explodeTimer >= 30) {
                this.isExploding = false;
                const index = enemies.indexOf(this);
                if (index !== -1) {
                    enemies.splice(index, 1);
                }
            }
        } else {
            this.x += this.direction * this.speed * gameSpeedMult;
            if (this.x <= this.minX || this.x >= this.maxX) {
                this.direction *= -1;
            }
            this.currentAnimation.update();

            if (this.shootTimer <= 0) {
                this.shoot();
                // Dynamically fetch cooldown
                this.shootTimer = Math.max(50, 100 - Math.floor(player.score / 100) * 10);
            } else {
                this.shootTimer--;
            }
        }
    }

    draw() {
        const frame = this.currentAnimation.getCurrentFrame();
        ctx.save();
        const offsetX = (this.width - frame.width) / 2;
        const offsetY = (this.height - frame.height) / 2;

        if (this.direction === -1 && !this.isExploding) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                shootingEnemySpriteSheet,
                frame.x, frame.y, frame.width, frame.height,
                -this.x + camera.x - this.width + offsetX, this.y + offsetY, frame.width, frame.height
            );
        } else {
            ctx.drawImage(
                shootingEnemySpriteSheet,
                frame.x, frame.y, frame.width, frame.height,
                this.x - camera.x + offsetX, this.y + offsetY, frame.width, frame.height
            );
        }
        ctx.restore();
    }

    shoot() {
        // Only shoot if drone is within viewport or nearby to avoid offscreen bullet buildup
        if (this.x - camera.x > -100 && this.x - camera.x < canvas.width + 100) {
            const direction = player.x > this.x ? 1 : -1;
            const bulletX = this.x + this.width / 2;
            const bulletY = this.y + this.height / 2;
            enemyBullets.push(new Bullet(bulletX, bulletY, direction, "#ff0000")); // Red enemy bullet
            enemyShootSound.play();
        }
    }

    explode() {
        this.isExploding = true;
        this.currentAnimation = shootingEnemyAnimations.explode;
        enemyDeathSound.play();
        
        // Spawn electric cyan sparks and drone debris particles
        spawnParticles(this.x + this.width / 2, this.y + this.height / 2, "#00f0ff", 12, 5);
        spawnParticles(this.x + this.width / 2, this.y + this.height / 2, "#ff0055", 10, 4);
        triggerScreenShake(15, 6);
    }
}

// Sentry Orb Drone (Unlocked at Score 250+ — 3-Bomb Directional Spread + Splash Damage)
class SentryOrbDrone {
    constructor(platform) {
        this.platform = platform;
        this.width  = 60;
        this.height = 72;

        // Start position — floating above the platform
        this.x = platform.x + platform.width / 2 - this.width / 2;
        this.y = platform.y - 160;

        // Zig-zag flight angles (two independent sine waves)
        this.angleX = Math.random() * Math.PI * 2; // horizontal drift
        this.angleY = Math.random() * Math.PI * 2; // vertical drift

        // Horizontal patrol bounds (wider than the platform)
        this.minX = platform.x - 60;
        this.maxX = platform.x + platform.width + 60 - this.width;
        this.patrolDir = 1; // walking direction for patrol
        this.patrolSpeed = 1.4;

        this.isExploding = false;
        this.explodeTimer = 0;

        // Attack state
        this.shootCooldown = 90; // initial delay before first shot
    }

    update() {
        if (this.isExploding) {
            this.explodeTimer++;
            if (this.explodeTimer >= 30) {
                this.isExploding = false;
                const index = enemies.indexOf(this);
                if (index !== -1) enemies.splice(index, 1);
            }
            return;
        }

        // --- Zig-zag movement: horizontal patrol + vertical sine ---
        this.angleX += 0.03;
        this.angleY += 0.045;

        // Horizontal: patrol left/right + sine wobble
        this.x += (this.patrolDir * this.patrolSpeed + Math.sin(this.angleX) * 0.8) * gameSpeedMult;
        if (this.x <= this.minX) { this.x = this.minX; this.patrolDir = 1; }
        if (this.x >= this.maxX) { this.x = this.maxX; this.patrolDir = -1; }

        // Vertical: gentle up-down wave
        this.y = this.platform.y - 160 + Math.sin(this.angleY) * 28;

        // --- Shooting ---
        const screenX = this.x - camera.x;
        if (screenX > -100 && screenX < canvas.width + 100) {
            if (this.shootCooldown > 0) {
                this.shootCooldown--;
            } else {
                this.shootBombs();
                this.shootCooldown = 160; // ~2.7s between volleys
            }
        }
    }

    shootBombs() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Direction toward the player
        const dx = (player.x + player.width / 2) - cx;
        const dy = (player.y + player.height / 2) - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Normalized direction
        const nx = dx / dist;
        const ny = dy / dist;
        const speed = 5;

        // 3 bombs: center, and two slightly spread (fan toward player)
        const spreadAngles = [-0.28, 0, 0.28]; // radians spread
        spreadAngles.forEach(spread => {
            const cos = Math.cos(spread);
            const sin = Math.sin(spread);
            // Rotate direction vector by spread angle
            const vx = nx * cos - ny * sin;
            const vy = nx * sin + ny * cos;
            const bomb = new Bullet(cx, cy, 1, "#cc0000", vx * speed, vy * speed);
            bomb.isBomb = true;
            enemyBullets.push(bomb);
        });

        enemyShootSound.currentTime = 0;
        enemyShootSound.play().catch(() => {});
        spawnParticles(cx, cy, "#cc0000", 10, 4);
        triggerScreenShake(4, 2);
    }

    draw() {
        if (this.isExploding) {
            // Explosion flash
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - this.explodeTimer / 30);
            const cx = this.x + this.width / 2 - camera.x;
            const cy = this.y + this.height / 2;
            ctx.fillStyle = "#ff4400";
            ctx.beginPath();
            ctx.arc(cx, cy, 28 + this.explodeTimer * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        const drawX = this.x - camera.x;
        ctx.save();
        if (sentryDroneImg.complete && sentryDroneImg.naturalWidth) {
            ctx.drawImage(sentryDroneImg, drawX, this.y, this.width, this.height);
        }
        ctx.restore();
    }

    explode() {
        this.isExploding = true;
        enemyDeathSound.play();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        spawnParticles(cx, cy, "#ff4400", 18, 7);
        spawnParticles(cx, cy, "#ffdd00", 12, 5);
        spawnParticles(cx, cy, "#ffffff", 8,  4);
        triggerScreenShake(14, 6);
    }
}

// Bomb Explosion — called when a bomb hits player, platform, or enemy
// Deals splash damage to ALL enemies within radius
function detonateBomb(bx, by) {
    const SPLASH_RADIUS = 80;
    spawnParticles(bx, by, "#ff4400", 20, 8);
    spawnParticles(bx, by, "#ffdd00", 14, 6);
    spawnParticles(bx, by, "#ff0055", 10, 5);
    triggerScreenShake(12, 5);

    // Kill any enemies caught in the splash
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.isExploding) continue;
        const ex = e.x + e.width / 2;
        const ey = e.y + e.height / 2;
        const dist = Math.sqrt((ex - bx) ** 2 + (ey - by) ** 2);
        if (dist <= SPLASH_RADIUS) {
            e.explode();
            player.score += 15;
        }
    }
}


class Bullet {
    constructor(x, y, direction, color = "#ffdd00", vx = null, vy = null) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = vy !== null ? 10 : 5;
        this.speed = 8;
        this.direction = direction;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
    }

    update() {
        if (this.vx !== null && this.vy !== null) {
            this.x += this.vx;
            this.y += this.vy;
        } else {
            this.x += this.speed * this.direction;
        }
    }

    draw() {
        ctx.save();
        if (this.isBomb) {
            // Bomb: red circle with black center dot
            const bx = this.x - camera.x;
            ctx.fillStyle = "#cc0000";
            ctx.beginPath();
            ctx.arc(bx, this.y, 9, 0, Math.PI * 2);
            ctx.fill();
            // Black dot in center
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            ctx.arc(bx, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            if (this.vx !== null && this.vy !== null) {
                ctx.beginPath();
                ctx.arc(this.x - camera.x, this.y, 6, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
            }
        }
        ctx.restore();
    }

    hitEnemy(enemy) {
        if (enemy.isExploding) return false;
        return (
            this.x + this.width > enemy.x &&
            this.x < enemy.x + enemy.width &&
            this.y + this.height > enemy.y &&
            this.y < enemy.y + enemy.height
        );
    }
}

class ShieldPowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.duration = 5;
    }

    draw() {
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    isCollected() {
        return (
            player.x + player.width > this.x - this.width / 2 &&
            player.x < this.x + this.width / 2 &&
            player.y + player.height > this.y - this.height / 2 &&
            player.y < this.y + this.height / 2
        );
    }
}

class RocketPowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 26;
        this.height = 26;
        this.duration = 6; // 6 seconds backend duration
        this.floatOffset = Math.random() * Math.PI * 2;
    }

    draw() {
        this.floatOffset += 0.05;
        const drawX = this.x - camera.x;
        const drawY = this.y + Math.sin(this.floatOffset) * 5;

        ctx.save();
        // Pulsating cyan neon aura glow so player identifies floating Jetpack item!
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 14 + Math.sin(this.floatOffset * 2) * 6;

        if (jetpackImg.complete && jetpackImg.naturalWidth) {
            ctx.drawImage(jetpackImg, drawX - 12, drawY - 20, 24, 40);
        } else {
            // Fallback orb
            ctx.strokeStyle = "#ff5500";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX, drawY, 13, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    isCollected() {
        return (
            player.x + player.width > this.x - this.width / 2 &&
            player.x < this.x + this.width / 2 &&
            player.y + player.height > this.y - this.height / 2 &&
            player.y < this.y + this.height / 2
        );
    }
}

class LifePowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;
        this.floatOffset = Math.random() * Math.PI * 2;
    }

    draw() {
        this.floatOffset += 0.06;
        const drawX = this.x - camera.x;
        const drawY = this.y + Math.sin(this.floatOffset) * 6;

        ctx.save();

        // Vertical glowing pink light beam beacon so player spots heart from far away
        ctx.strokeStyle = "rgba(255, 0, 85, 0.25)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(drawX, 0);
        ctx.lineTo(drawX, drawY - 20);
        ctx.stroke();

        // Pulsating neon red/pink heart glow
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 18 + Math.sin(this.floatOffset * 2) * 8;

        ctx.fillStyle = "#ff0055";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("❤️", drawX, drawY);

        // Indicator Label above heart: "▼ EXTRA LIFE"
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 4;
        ctx.fillStyle = "#ffdd00";
        ctx.font = "bold 11px 'Share Tech Mono', monospace";
        ctx.fillText("▼ EXTRA LIFE", drawX, drawY - 22);

        ctx.restore();
    }

    isCollected() {
        return (
            player.x + player.width > this.x - 14 &&
            player.x < this.x + 14 &&
            player.y + player.height > this.y - 14 &&
            player.y < this.y + 14
        );
    }
}

const platforms = [];
const enemies = [];
const bullets = [];
const enemyBullets = [];
const shieldPowerUps = [];
const rocketPowerUps = [];
const lifePowerUps = [];

let platformsSinceLastEnemy = 2;
let isDevGodMode = false;

// Platforms generation
function generatePlatforms() {
    if (platforms.length === 0) {
        let startPlat = new Platform(50, canvas.height - 100, 200, 20);
        startPlat.hasScored = true; // Starting platform gives no bonus
        platforms.push(startPlat);
        platformsSinceLastEnemy = 2;
    }

    // While in ANY boss state (highway, intro_banner, boss_entering, active, victory):
    // DO NOT generate regular procedural jumping platforms!
    if (bossTransitionState !== "none") {
        let hasHighway = platforms.some(p => p.isBossHighway);
        if (!hasHighway && (bossTransitionState === "highway" || bossTransitionState === "active" || bossTransitionState === "intro_banner" || bossTransitionState === "boss_entering")) {
            // Clear all old floating platforms, enemies & items so arena is completely clean!
            platforms.length = 0;
            enemies.length = 0;
            shieldPowerUps.length = 0;
            rocketPowerUps.length = 0;

            // Single clean long arena highway platform under & ahead of player
            let highway = new Platform(player.x - 400, canvas.height - 100, 3500, 20, false, false);
            highway.isBossHighway = true;
            platforms.push(highway);

            // Set player safely on top of highway
            player.y = canvas.height - 100 - player.height;
            player.velocityY = 0;
        }
        return; // STOP! Do NOT generate procedural platforms while boss mode is active!
    }

    let lastPlatform = platforms[platforms.length - 1];
    if (lastPlatform.x - camera.x < canvas.width - 250) {
        let platformWidth = 160;
        let isMoving = Math.random() > 0.6;
        let hasSpikes = player.score >= 5 && Math.random() > 0.7;

        // ZERO-OVERLAP GAP FORMULA:
        // Accounts for the travel range (65px) of both previous and current platforms
        // Guaranteeing a minimum physical gap of 70px at maximum travel extension!
        let lastMoveOffset = (lastPlatform.isMoving ? (lastPlatform.moveRange || 65) : 0);
        let newMoveOffset = (isMoving ? 65 : 0);
        let baseGap = 70 + lastMoveOffset + newMoveOffset;
        let extraGap = Math.random() * (40 + Math.min(30, player.score / 20));

        let lastRefX = lastPlatform.originalX || lastPlatform.x;
        let x = lastRefX + lastPlatform.width + baseGap + extraGap;

        // Vertical stagger (-55 to +55) with min 35px shift so platforms don't sit on exact same height
        let lastY = lastPlatform.y;
        let yShift = (Math.random() * 110 - 55);
        if (Math.abs(yShift) < 30) yShift = yShift < 0 ? -35 : 35;
        let y = Math.min(canvas.height - 110, Math.max(150, lastY + yShift));

        let platform = new Platform(x, y, platformWidth, 20, isMoving, hasSpikes);
        platforms.push(platform);

        platformsSinceLastEnemy++;

        // --- ENEMY SPAWNING LAWS ---
        // 1. Minimum score requirement (>= 10 for Robot, >= 20 for Drone, >= 50 for Sentry Orb)
        // 2. Must have at least 2 safe platforms since last enemy (prevents crowding)
        // 3. Spiked platforms never spawn enemies
        // 4. STRICT MAX 1 ENEMY per platform (exclusive choice pool)
        if (player.score >= 10 && platformsSinceLastEnemy >= 2 && !hasSpikes && Math.random() > 0.4) {
            let possibleEnemies = [];

            // Ground walking robot (score >= 10, stationary platforms only)
            if (!isMoving && player.score >= 10) {
                possibleEnemies.push("robot");
            }

            // Flying Shooting Drone (unlocked at score 20+)
            if (player.score >= 20) {
                possibleEnemies.push("drone");
            }

            // Sentry Orb Drone (unlocked at score 50+)
            if (player.score >= 50) {
                possibleEnemies.push("sentry_drone");
            }

            if (possibleEnemies.length > 0) {
                // Select EXACTLY ONE enemy type randomly
                let chosenEnemy = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];

                if (chosenEnemy === "robot") {
                    enemies.push(new NonShootingEnemy(platform));
                } else if (chosenEnemy === "drone") {
                    enemies.push(new ShootingEnemy(platform));
                } else if (chosenEnemy === "sentry_drone") {
                    enemies.push(new SentryOrbDrone(platform));
                }

                // Reset platform spacing buffer
                platformsSinceLastEnemy = 0;
            }
        }

        // Power-Up Spawning (Shield or Jetpack unlocked at score 25+)
        if (player.score >= 25 && !hasSpikes && Math.random() > 0.65) {
            const chance = Math.random();
            if (chance < 0.5) {
                rocketPowerUps.push(new RocketPowerUp(x + platform.width / 2, y - 30));
            } else {
                shieldPowerUps.push(new ShieldPowerUp(x + platform.width / 2, y - 30));
            }
        }
    }
}

// Boss Mode State & Class
let isBossMode = false;
let currentBosses = [];   // array — can hold 1 or 2 bosses
let bossSpawned = false;
let bossLevel   = 0;
let bossTransitionState = "none";
let bossIntroTimer = 0;

// ============================================================
// 🏃 SMOOTH GLOBAL SPEED MULTIPLIER SYSTEM
// Platforms and enemies gradually get faster as the player
// progresses through boss stages. Feels completely natural —
// speed creeps up using lerp (no sudden jumps).
//
// Targets (bosses themselves are NOT affected):
//  bossLevel 0 → 1.00x  (normal)
//  bossLevel 1 (score 250+) → 1.18x  (a bit faster)
//  score 500+  → 1.30x  (noticeably faster)
//  bossLevel 2 (score 700+) → 1.45x  (clearly faster)
//  bossLevel 3 (score 1200+) → 1.65x  (challenging pace)
// ============================================================
let gameSpeedMult = 1.0;

function updateGameSpeedMult() {
    // Pick target based on current bossLevel + score
    let target = 1.0;
    if (bossLevel >= 3) {
        target = 1.65;
    } else if (bossLevel >= 2) {
        // Boss 2 defeated — between 1.45 and 1.65 depending on score
        target = 1.45 + Math.min(0.20, (player.score - 700) / 2500);
    } else if (player.score >= 500) {
        // Crosses 500 — ramp toward 1.30, stops at 1.45 (reserved for boss 2)
        target = 1.30 + Math.min(0.15, (player.score - 500) / 1333);
    } else if (bossLevel >= 1) {
        // Boss 1 defeated — between 1.18 and 1.30 depending on score
        target = 1.18 + Math.min(0.12, (player.score - 250) / 2083);
    } else {
        target = 1.0;
    }

    // Lerp current toward target — 0.0008 per frame = very gradual (~1250 frames / ~21s to reach target)
    if (gameSpeedMult < target) {
        gameSpeedMult = Math.min(target, gameSpeedMult + 0.0008);
    } else if (gameSpeedMult > target) {
        gameSpeedMult = Math.max(target, gameSpeedMult - 0.0008);
    }
}


// Life milestone spawn tracking — hearts appear as pickups at these score thresholds
const LIFE_PICKUP_MILESTONES = [100, 250, 500, 750, 1000];
let lifePickupMilestonesSpawned = [];
let lifeWarningsTriggered = [];

function checkAndSpawnLifePickup() {
    // Distance Estimation Heads-up Toast (triggered 30 pts before milestone)
    for (const milestone of LIFE_PICKUP_MILESTONES) {
        if (player.score >= milestone - 30 && player.score < milestone && !lifeWarningsTriggered.includes(milestone)) {
            lifeWarningsTriggered.push(milestone);
            const remaining = milestone - player.score;
            unlockAchievement("lifeWarning", `❤️ EXTRA LIFE AHEAD! (In ~${remaining} pts)`);
        }
    }

    for (const milestone of LIFE_PICKUP_MILESTONES) {
        if (player.score >= milestone && !lifePickupMilestonesSpawned.includes(milestone)) {
            lifePickupMilestonesSpawned.push(milestone);

            // Find non-spiked platforms 1 to 2 platforms ahead of the player
            const upcoming = platforms.filter(p => p.x > player.x + 250 && !p.hasSpikes && !p.isBossHighway);

            if (upcoming.length > 0) {
                // Pick 1st or 2nd upcoming platform ahead so player sees it approaching
                const targetPlat = upcoming[Math.min(1, upcoming.length - 1)];
                const spawnX = targetPlat.x + targetPlat.width / 2;
                const spawnY = targetPlat.y - 30;
                lifePowerUps.push(new LifePowerUp(spawnX, spawnY));
            } else {
                // Fallback spawn position ahead off-screen
                const spawnX = player.x + 550;
                const spawnY = canvas.height - 180;
                lifePowerUps.push(new LifePowerUp(spawnX, spawnY));
            }
        }
    }
}

// Score thresholds and config per level
const BOSS_TIERS = [
    null, // index 0 unused
    { score: 250,  bosses: ["right"],         reward: 100, name: "DREADNOUGHT OMEGA",  sub: "COLOSSUS MECH ENTERING THE SECTOR",          hpTitle: "⚡ DREADNOUGHT OMEGA ⚡" },
    { score: 700,  bosses: ["right", "right"], reward: 150, name: "TWIN DREADNOUGHTS",  sub: "DUAL COLOSSUS MECHS INBOUND FROM THE RIGHT",  hpTitle: "⚡ TWIN DREADNOUGHTS ⚡" },
    { score: 1200, bosses: ["left",  "right"], reward: 300, name: "OMEGA SIEGE",        sub: "FLANKING MECHS — LEFT & RIGHT ASSAULT!!",      hpTitle: "⚡ OMEGA SIEGE PROTOCOL ⚡" },
];


function updateLivesHUD() {
    const el = document.getElementById("hud-lives");
    if (el) el.innerText = `❤️ LIVES: ${player.lives}`;
}

function handlePlayerDamage(deathSound) {
    if (player.invincibleTimer > 0 || isDevGodMode) return true; // Immune during 3s invincibility

    if (player.lives > 1) {
        player.lives--;
        updateLivesHUD();
        // 3 SECONDS OF INVINCIBILITY (180 frames @ 60fps)
        player.invincibleTimer = 180;
        activateShield(3);

        // PLAY HIT DAMAGE SOUND
        playerDeathSound.currentTime = 0;
        playerDeathSound.play().catch(() => {});
        if (deathSound && deathSound !== playerDeathSound) deathSound.play().catch(() => {});

        triggerScreenShake(22, 12);

        // HEAVY SPARK EXPLOSION (Red, Orange, Yellow, White sparks)
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        spawnParticles(px, py, "#ff0055", 30, 10);
        spawnParticles(px, py, "#ff4400", 25, 8);
        spawnParticles(px, py, "#ffdd00", 20, 7);
        spawnParticles(px, py, "#ffffff", 15, 6);

        unlockAchievement("lifeLost", "⚠️ -1 LIFE LOST!");
        return true;
    } else {
        triggerScreenShake(25, 14);
        spawnParticles(player.x + player.width / 2, player.y + player.height / 2, "#ff0000", 35, 10);
        triggerGameOver(deathSound || playerDeathSound);
        return false;
    }
}



function updateCombinedBossHpBar() {
    const hpBar = document.getElementById("bossHpBarInner");
    if (!hpBar || currentBosses.length === 0) return;

    let totalHp = 0;
    let totalMaxHp = 0;
    currentBosses.forEach(b => {
        if (!b.isDefeated) {
            totalHp += b.hp;
        }
        totalMaxHp += b.maxHp;
    });

    const pct = totalMaxHp > 0 ? Math.max(0, (totalHp / totalMaxHp) * 100) : 0;
    hpBar.style.width = `${pct}%`;
}

class BossEnemy {
    // side: "right" | "left"
    // index: index in currentBosses array (0 or 1)
    // totalBosses: total number of bosses in this fight (1 or 2)
    constructor(side = "right", index = 0, totalBosses = 1) {
        this.side        = side;
        this.index       = index;
        this.totalBosses = totalBosses;
        this.width       = 200;
        this.height      = 200;

        // Positional offsets so multiple bosses on the same side don't overlap!
        let xOffset = 0;
        let yOffset = 0;
        if (totalBosses > 1 && side === "right") {
            if (index === 0) {
                yOffset = -110; // Top Right Boss
                xOffset = 0;
            } else {
                yOffset = 110;  // Bottom Right Boss
                xOffset = -40;  // Staggered slightly left
            }
        }
        this.xOffset = xOffset;
        this.yOffset = yOffset;

        // Start OFF-SCREEN far enough
        if (side === "right") {
            this.x = (camera.lockedX || camera.x) + canvas.width + 350 + xOffset;
        } else {
            this.x = (camera.lockedX || camera.x) - this.width - 350 + xOffset;
        }

        this.baseY = canvas.height / 2 - 100 + yOffset;
        this.y     = this.baseY;

        this.maxHp = 200;
        this.hp    = 200;
        // Alternate hover direction so multi-bosses move in opposite rhythm
        this.velocityY = (side === "left" || index === 1) ? -2.2 : 2.2;
        this.isHitFlash = 0;
        this.isDefeated = false;
        this.isEntering = true;

        // Attack cycle
        this.attackPhase   = "bombs";
        this.bombVolleysFired = 0;
        this.maxBombVolleys = 3;
        this.bombTimer  = 0;

        // Laser parameters
        this.laserTimer   = 0;
        this.laserCharge  = 210;
        this.laserDuration = 45;
        this.laserAngles  = [0, 0, 0, 0];
        this.cooloffTimer = 0;
        this.pulseT = 0;
    }

    // ---------- helpers ----------
    getPhase() {
        if (this.hp > 130) return 1;
        if (this.hp > 70)  return 2;
        return 3;
    }

    cx() { return this.x + this.width  / 2; }
    cy() { return this.y + this.height / 2; }

    // ---------- update ----------
    update() {
        if (this.isDefeated) return;

        this.pulseT += 0.06;
        this.phase = this.getPhase();

        // Target hover position depends on side + offset
        const targetX = this.side === "right"
            ? (camera.lockedX || camera.x) + canvas.width - this.width - 20 + this.xOffset
            : (camera.lockedX || camera.x) + 20 + this.xOffset;

        // --- ENTRANCE FLY-IN ANIMATION ---
        if (this.isEntering) {
            this.x += (targetX - this.x) * 0.04;
            const trailX = this.side === "right" ? this.x + this.width : this.x;
            spawnParticles(trailX, this.y + this.height / 2, "#ff0055", 3, 4);

            if (Math.abs(this.x - targetX) < 15) {
                this.x = targetX;
                this.isEntering = false;
                player.bossActive = true;
                triggerScreenShake(15, 8);
            }
            return;
        }

        // Hover smoothly up/down relative to baseY
        this.y += this.velocityY;
        const topLimit    = Math.max(30, this.baseY - 60);
        const platformTop = canvas.height - 120;
        const bottomLimit = Math.min(platformTop - this.height - 10, this.baseY + 60);
        if (this.y < topLimit || this.y > bottomLimit) this.velocityY *= -1;
        if (this.y > bottomLimit) this.y = bottomLimit;

        this.x += (targetX - this.x) * 0.06;

        // ---------- RHYTHMIC ATTACK STATE MACHINE ----------
        if (this.attackPhase === "bombs") {
            // Bomb Barrage Phase: Fire 3 volleys spaced 2.0s apart
            const bombInterval = this.phase === 3 ? 90 : 120;
            this.bombTimer++;
            if (this.bombTimer >= bombInterval) {
                this.bombTimer = 0;
                this.fireBombs();
                this.bombVolleysFired++;

                const maxVolleys = this.phase === 3 ? 4 : 3;
                if (this.bombVolleysFired >= maxVolleys) {
                    // Transition to Laser Phase!
                    this.attackPhase = "laser_charging";
                    this.laserTimer  = 0;
                    this.bombVolleysFired = 0;
                    triggerScreenShake(4, 3);
                }
            }

        } else if (this.attackPhase === "laser_charging") {
            // Laser Charge Phase: 3.5 seconds with 1.5s lock-on
            this.laserTimer++;

            const lockFrame = this.phase === 3 ? 120 : 120; // Lock 1.5s before fire
            if (this.laserTimer < lockFrame) {
                const dx = player.x + player.width  / 2 - this.cx();
                const dy = player.y + player.height / 2 - this.cy();
                const baseAngle = Math.atan2(dy, dx);
                const offsets = [-0.36, -0.12, 0.12, 0.36];
                this.laserAngles = offsets.map(off => baseAngle + off);
            }

            if (this.laserTimer >= this.laserCharge) {
                this.attackPhase = "laser_firing";
                this.laserTimer  = 0;
                enemyShootSound.currentTime = 0;
                enemyShootSound.play().catch(() => {});
                triggerScreenShake(16, 10);
            }

        } else if (this.attackPhase === "laser_firing") {
            // Laser Firing Phase: Beams active across screen
            this.laserTimer++;
            this.fireLaserHit();

            if (this.laserTimer >= this.laserDuration) {
                // Transition to Cool-off Phase! (2.0s rest time)
                this.attackPhase  = "cooloff";
                this.cooloffTimer = this.phase === 3 ? 90 : 120; // 2.0s rest time
            }

        } else if (this.attackPhase === "cooloff") {
            // Cool-off Phase: Boss rests while player attacks
            this.cooloffTimer--;
            if (this.cooloffTimer <= 0) {
                // Return to Bomb Phase!
                this.attackPhase = "bombs";
                this.bombTimer   = 0;
            }
        }

        if (this.isHitFlash > 0) this.isHitFlash--;
    }

    // ---------- BOMB: 3 directional bombs toward player ----------
    fireBombs() {
        const cx = this.cx();
        const cy = this.cy();
        const dx = player.x + player.width  / 2 - cx;
        const dy = player.y + player.height / 2 - cy;
        const baseAngle = Math.atan2(dy, dx);
        const speed = bossLevel >= 3 ? 5.5 : 4.5; // Boss 3: slightly faster bombs
        const spread = 0.25;

        enemyShootSound.currentTime = 0;
        enemyShootSound.play().catch(() => {});

        [-spread, 0, spread].forEach(offset => {
            const angle = baseAngle + offset;
            const b = new Bullet(cx, cy, -1, "#cc0000");
            b.isBomb   = true;
            b.vx = Math.cos(angle) * speed;
            b.vy = Math.sin(angle) * speed;
            b.update = function() {
                this.x += this.vx;
                this.y += this.vy;
            };
            enemyBullets.push(b);
        });
    }

    // ---------- 4 LASERS HIT DETECTION ----------
    fireLaserHit() {
        const ox = this.x;
        const oy = this.cy();
        const len = canvas.width * 2;

        const px1 = player.x, py1 = player.y;
        const px2 = player.x + player.width, py2 = player.y + player.height;

        function segIntersectsRect(x1,y1,x2,y2,rx,ry,rw,rh) {
            const dx = x2 - x1, dy = y2 - y1;
            const cx2 = rx + rw/2, cy2 = ry + rh/2;
            const dotLen = Math.sqrt(dx*dx + dy*dy);
            if (dotLen < 1) return false;
            const t = ((cx2 - x1)*dx + (cy2 - y1)*dy) / (dotLen*dotLen);
            const nearX = x1 + t*dx - cx2;
            const nearY = y1 + t*dy - cy2;
            const dist = Math.sqrt(nearX*nearX + nearY*nearY);
            // Increased hit margin to 38px to accurately cover full player bounding box
            return t >= 0 && t <= 1 && dist < 38;
        }

        let isPlayerHit = false;
        this.laserAngles.forEach(angle => {
            const lx = ox + Math.cos(angle) * len;
            const ly = oy + Math.sin(angle) * len;
            if (segIntersectsRect(ox, oy, lx, ly, px1, py1, px2-px1, py2-py1)) {
                isPlayerHit = true;
            }
        });

        if (isPlayerHit && !player.isShieldActive && player.invincibleTimer <= 0) {
            lastDeathType = "boss_laser";
            handlePlayerDamage(playerDeathSound);
        } else if (isPlayerHit && player.isShieldActive) {
            spawnParticles(player.x+player.width/2, player.y+player.height/2, "#00f0ff", 14, 5);
            triggerScreenShake(8, 4);
        }
    }

    // ---------- take damage ----------
    takeDamage(amount) {
        if (this.isDefeated) return;
        this.hp -= amount;
        this.isHitFlash = 10;
        triggerScreenShake(7, 4);
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDefeated = true;
            this.explode();
        }
        updateCombinedBossHpBar();
    }

    explode() {
        enemyDeathSound.currentTime = 0;
        enemyDeathSound.play().catch(() => {});
        triggerScreenShake(40, 18);

        const cx = this.cx(), cy = this.cy();
        spawnParticles(cx, cy, "#ff0055", 60, 14);
        spawnParticles(cx, cy, "#ffdd00", 50, 12);
        spawnParticles(cx, cy, "#00f0ff", 50, 12);
        spawnParticles(cx, cy, "#ffffff", 30, 10);
        // Score reward applied in state machine when ALL bosses are gone
    }

    // ---------- draw ----------
    draw() {
        if (this.isDefeated) return;

        const drawX = this.x - camera.x;
        ctx.save();

        if (this.isHitFlash > 0) {
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur  = 30;
        } else {
            const pulse = 10 + Math.sin(this.pulseT) * 5;
            ctx.shadowColor = this.phase === 3 ? "#ff0055" :
                              this.phase === 2 ? "#ff4400" : "#990000";
            ctx.shadowBlur  = pulse;
        }

        if (this.side === "left") {
            // Mirror horizontally so left-side boss faces RIGHT (toward player)
            ctx.translate(drawX + this.width, this.y);
            ctx.scale(-1, 1);
            if (boss500Img.complete && boss500Img.naturalWidth) {
                ctx.drawImage(boss500Img, 0, 0, this.width, this.height);
            } else {
                ctx.fillStyle = "#003300";
                ctx.fillRect(0, 0, this.width, this.height);
            }
            ctx.restore();
            ctx.save();
        } else {
            if (boss500Img.complete && boss500Img.naturalWidth) {
                ctx.drawImage(boss500Img, drawX, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = "#330000";
                ctx.fillRect(drawX, this.y, this.width, this.height);
            }
        }

        const ox = drawX + 10;
        const oy = this.y + this.height / 2;

        // ---- 4 LASERS CHARGE AIM LINES (Dotted Warning Grid) ----
        if (this.attackPhase === "laser_charging") {
            const progress = this.laserTimer / this.laserCharge;
            
            ctx.shadowBlur = 0;
            this.laserAngles.forEach((angle, idx) => {
                ctx.setLineDash([8, 8]);
                ctx.strokeStyle = `rgba(255, ${idx * 40}, 0, ${0.35 + progress * 0.55})`;
                ctx.lineWidth   = 2 + progress * 2;
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(ox + Math.cos(angle) * canvas.width * 1.5,
                           oy + Math.sin(angle) * canvas.width * 1.5);
                ctx.stroke();
                ctx.setLineDash([]);
            });

        } else if (this.attackPhase === "laser_firing") {
            // ---- 4 LASER BEAMS FIRE SIMULTANEOUSLY ----
            const alpha = 1 - this.laserTimer / this.laserDuration;
            const len = canvas.width * 2;

            this.laserAngles.forEach(angle => {
                const ex = ox + Math.cos(angle) * len;
                const ey = oy + Math.sin(angle) * len;

                // Outer red beam
                ctx.shadowColor = "#ff0055";
                ctx.shadowBlur  = 24;
                ctx.strokeStyle = `rgba(255, 30, 0, ${alpha * 0.6})`;
                ctx.lineWidth   = 16;
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(ex, ey);
                ctx.stroke();

                // Inner bright white core
                ctx.strokeStyle = `rgba(255, 240, 220, ${alpha})`;
                ctx.lineWidth   = 4;
                ctx.shadowBlur  = 12;
                ctx.shadowColor = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
            });
        }

        ctx.restore();
    }
}

// Clean up entities scrolled off screen to optimize memory
function cleanUpOffscreenEntities() {
    const threshold = camera.x - 600;
    
    // Shift old platforms off the front of array
    while (platforms.length > 5 && platforms[0].x + platforms[0].width < threshold) {
        platforms.shift();
    }
    
    // Clean up enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].x + enemies[i].width < threshold) {
            enemies.splice(i, 1);
        }
    }
    
    // Clean up shield rings
    for (let i = shieldPowerUps.length - 1; i >= 0; i--) {
        if (shieldPowerUps[i].x + shieldPowerUps[i].width < threshold) {
            shieldPowerUps.splice(i, 1);
        }
    }
}

// Katana Slash & Cyber Dash State
let isSlashing = false;
let slashTimer = 0;
let slashCooldown = 0;

let isDashing = false;
let dashTimer = 0;
let dashCooldown = 0;

// Achievement System
const unlockedAchievements = {};
function unlockAchievement(id, title) {
    if (!unlockedAchievements[id]) {
        unlockedAchievements[id] = true;
        const toast = document.getElementById("achievementToast");
        const desc = document.getElementById("toastDesc");
        if (toast && desc) {
            desc.innerText = title;
            toast.style.display = "flex";
            powerUpSound.currentTime = 0;
            powerUpSound.play().catch(() => {});
            setTimeout(() => {
                toast.style.display = "none";
            }, 3200);
        }
    }
}

const keys = {};
window.addEventListener('keyup', (event) => keys[event.code] = false);

window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
    
    if (gameState === "playing" && !gameOver) {
        // Shoot — F or J key (+20 pts)
        if (event.code === "KeyF" || event.code === "KeyJ") {
            bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, player.direction, "#ffdd00")); // Yellow player bullet
            shootSound.currentTime = 0;
            shootSound.play();
            triggerScreenShake(5, 3);
            
            // Spawn shooting muzzle particles
            const bulletStartX = player.direction === 1 ? player.x + player.width : player.x;
            spawnParticles(bulletStartX, player.y + player.height / 2, "#ffdd00", 6, 4);
        }

        // Katana Melee Slash — Key E (+25 pts)
        if (event.code === "KeyE") {
            if (slashCooldown <= 0) {
                isSlashing = true;
                slashTimer = 10;
                slashCooldown = 22; // cooldown frames
                shootSound.currentTime = 0;
                shootSound.play();
                triggerScreenShake(6, 4);

                const slashCenterX = player.direction === 1 ? player.x + player.width + 10 : player.x - 30;
                spawnParticles(slashCenterX, player.y + player.height / 2, "#00f0ff", 14, 6);
                spawnParticles(slashCenterX, player.y + player.height / 2, "#ff0055", 8, 6);

                const attackBox = {
                    x: player.direction === 1 ? player.x : player.x - 70,
                    y: player.y - 15,
                    width: player.width + 70,
                    height: player.height + 30
                };

                enemies.forEach(enemy => {
                    if (!enemy.isExploding &&
                        attackBox.x < enemy.x + enemy.width &&
                        attackBox.x + attackBox.width > enemy.x &&
                        attackBox.y < enemy.y + enemy.height &&
                        attackBox.y + attackBox.height > enemy.y
                    ) {
                        enemy.explode();
                        player.score += 15;
                        unlockAchievement("katana", "Katana Slayer! (+15 pts)");
                        unlockAchievement("firstblood", "First Blood!");
                        if (player.score >= 500) unlockAchievement("score500", "500 Score Legend!");
                    }
                });

                // Katana Slash destroys incoming enemy bullets on key press!
                for (let i = enemyBullets.length - 1; i >= 0; i--) {
                    const b = enemyBullets[i];
                    if (
                        b.x + b.width > attackBox.x &&
                        b.x < attackBox.x + attackBox.width &&
                        b.y + b.height > attackBox.y &&
                        b.y < attackBox.y + attackBox.height
                    ) {
                        enemyBullets.splice(i, 1);
                        spawnParticles(b.x, b.y, "#00f0ff", 12, 5);
                        spawnParticles(b.x, b.y, "#ffdd00", 8, 6);
                        triggerScreenShake(6, 3);
                        player.score += 5;
                        unlockAchievement("bulletParry", "Bullet Slashed! (+5 pts)");
                    }
                }

                // Katana hit on Boss (using currentBosses array)
                for (const boss of currentBosses) {
                    if (!boss.isDefeated &&
                        attackBox.x < boss.x + boss.width &&
                        attackBox.x + attackBox.width > boss.x &&
                        attackBox.y < boss.y + boss.height &&
                        attackBox.y + attackBox.height > boss.y
                    ) {
                        boss.takeDamage(20); // Katana deals massive -20 damage to Boss!
                    }
                }
            }
        }

        // Cyber-Dash Boost — Key Shift
        if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
            if (dashCooldown <= 0) {
                isDashing = true;
                dashTimer = 8;
                dashCooldown = 50; // ~0.8s cooldown
                triggerScreenShake(4, 3);
                spawnParticles(player.x + player.width / 2, player.y + player.height / 2, "#00f0ff", 16, 7);
                unlockAchievement("dash", "Cyber-Dash Boost!");
            }
        }
        
        // Jump / Double Jump / Rocket Flight
        if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
            if (player.isRocketActive) {
                player.velocityY = -8;
                player.isJumping = true;
                jumpSound.currentTime = 0;
                jumpSound.play().catch(() => {});
                const feetX = player.x + player.width / 2;
                spawnParticles(feetX, player.y + player.height, "#ff5500", 6, 5);
                spawnParticles(feetX, player.y + player.height, "#ffdd00", 4, 4);
            } else if (player.jumpsLeft > 0) {
                if (player.jumpsLeft === 2) {
                    isJumpStarting = true;
                    setTimeout(() => {
                        isJumpStarting = false;
                        isJumping = true;
                    }, 100);
                } else {
                    // Double Jump backflip spin
                    player.isDoubleJumping = true;
                    player.rotation = 0;
                    // Cyan double jump particles
                    spawnParticles(player.x + player.width / 2, player.y + player.height, "#00f0ff", 12, 5);
                    unlockAchievement("doubleflip", "Double Flip Master!");
                }

                player.velocityY = -player.jumpHeight;
                player.isJumping = true;
                player.jumpsLeft--;
                
                jumpSound.currentTime = 0;
                jumpSound.play();
                
                if (player.jumpsLeft === 1) {
                    // Normal jump particles
                    spawnParticles(player.x + player.width / 2, player.y + player.height, "#ffffff", 8, 3);
                }
            }
        }

        // Secret Developer Cheat Keys — only work AFTER secret unlock (5x HighScore click + DOOMGOD + Enter)
        if (isDevModeUnlocked) {
            // [G] Key: Toggle God Mode
            if (event.code === "KeyG") {
                isDevGodMode = !isDevGodMode;
                if (isDevGodMode) {
                    activateShield(99999);
                    unlockAchievement("devGod", "🛠️ GOD MODE ACTIVE! [G]");
                } else {
                    player.isShieldActive = false;
                    player.shieldTimer = 0;
                }
                const devHud = document.getElementById("hud-dev-mode");
                if (devHud) devHud.style.display = isDevGodMode ? "block" : "none";
            }

            // [K] Key: Instantly Activate Rocket Boost
            if (event.code === "KeyK") {
                activateRocket(6);
                unlockAchievement("devRocket", "🛠️ ROCKET BOOST ACTIVATED!");
            }

            // [+] or [=] Key: +100 Score Boost
            if (event.code === "Equal" || event.code === "NumpadAdd") {
                player.score += 100;
                document.getElementById("hud-score").innerText = `SCORE: ${player.score}`;
                unlockAchievement("devScore", "🛠️ +100 SCORE BOOST!");
            }

            // [B] Key: Instantly Spawn Sentry Orb Drone
            if (event.code === "KeyB") {
                let targetPlat = player.lastPlatform || (platforms.length > 0 ? platforms[platforms.length - 1] : { x: player.x, y: player.y + 100, width: 200 });
                enemies.push(new SentryOrbDrone(targetPlat));
                unlockAchievement("devDrone", "🛠️ SENTRY DRONE SPAWNED!");
            }
        }
    } else if (gameState === "gameOver") {
        if (event.code === "KeyR") {
            window.restartGame();
        } else if (event.code === "KeyM") {
            window.showMainMenu();
        }
    } else if (gameState === "settings" || gameState === "howToPlay") {
        if (event.code === "Enter") {
            window.showMainMenu();
        }
    }
});

function handleMovement() {
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= player.speed;
        player.direction = -1;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += player.speed;
        player.direction = 1;
    }

    // Rocket Jetpack Flight (Holding Space / ArrowUp / KeyW)
    if (player.isRocketActive && (keys['Space'] || keys['ArrowUp'] || keys['KeyW'])) {
        player.velocityY = -7.5;
        player.isJumping = true;
        const feetX = player.x + player.width / 2;
        if (Math.random() > 0.3) {
            spawnParticles(feetX, player.y + player.height, "#ff5500", 3, 4);
            spawnParticles(feetX, player.y + player.height, "#00f0ff", 2, 3);
        }
    }

    player.velocityY += 0.5;
    player.y += player.velocityY;

    let onPlatform = false;
    platforms.forEach(platform => {
        platform.update();

        if (
            player.x + player.width * 0.75 > platform.x &&
            player.x + player.width * 0.25 < platform.x + platform.width &&
            player.y + player.height >= platform.y - 2 &&
            player.y + player.height - player.velocityY <= platform.y + 16 &&
            player.velocityY >= 0
        ) {
            if (platform.hasSpikes && player.x + player.width > platform.spikeX && player.x < platform.spikeX + platform.spikeWidth) {
                if (!player.isShieldActive && player.invincibleTimer <= 0) {
                    lastDeathType = "spikes";
                    const survived = handlePlayerDamage(spikeDeathSound);
                    if (survived) {
                        // Bounce player up off spikes so they don't keep getting hit repeatedly
                        player.y = platform.y - player.height - 5;
                        player.velocityY = -10;
                    }
                } else {
                    // Shield or invincible — land safely on platform
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    onPlatform = true;
                }
            } else {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                onPlatform = true;

                if (platform.isMoving) {
                    player.x += platform.deltaX;
                }

                if (player.lastPlatform !== platform) {
                    if (player.lastPlatform !== null && !platform.hasScored && !platform.isBossHighway) {
                        platform.hasScored = true;
                        player.score += 2;
                        if (player.score >= 500) unlockAchievement("score500", "500 Score Legend!");
                    }
                    player.lastPlatform = platform;
                }
            }
        }
    });

    if (onPlatform) {
        player.jumpsLeft = 2; // Reset double jump
        player.isDoubleJumping = false;
        player.rotation = 0;
        
        if (player.isJumping) {
            isJumpLanding = true;
            setTimeout(() => {
                isJumpLanding = false;
                isJumping = false;
            }, 100);
            
            // Spawn jump landing dust particles
            spawnParticles(player.x + player.width / 2, player.y + player.height, "rgba(255,255,255,0.4)", 6, 2);
        }
        player.isJumping = false;
    } else {
        player.isJumping = true;
    }

    if (player.y > canvas.height) {
        if (player.isRocketActive) {
            // Emergency Rocket Auto Fall-Save!
            player.y = canvas.height - 220;
            player.velocityY = -18;
            triggerScreenShake(16, 7);
            spawnParticles(player.x + player.width / 2, player.y + player.height, "#ff4400", 25, 9);
        } else if (isDevGodMode) {
            player.y = canvas.height - 200;
            player.velocityY = -12;
        } else {
            lastDeathType = "fall_void";
            const survived = handlePlayerDamage(fallSound);
            if (survived) {
                // Player had lives — bounce them back up safely
                player.y = canvas.height - 220;
                player.velocityY = -16;
                spawnParticles(player.x + player.width / 2, player.y + player.height, "#00f0ff", 25, 9);
            }
        }
    }
}

function triggerGameOver(deathSound) {
    gameOver = true;
    if (deathSound) deathSound.play();
    updateHighScore();
    setGameState("gameOver");
}

function updateHighScore() {
    if (player.score > highScore) {
        highScore = player.score;
        localStorage.setItem("highScore", highScore);
        newHighScoreSound.play();
        document.getElementById("hud-highscore").innerText = `HIGH SCORE: ${highScore}`;
    }
}

function activateShield(duration = 5) {
    player.isShieldActive = true;
    player.shieldMaxTimer = duration * 60;
    player.shieldTimer = duration * 60; // 60 fps
    const hud = document.getElementById("hud-shield");
    if (hud) hud.style.display = "block";
}

function updateShield() {
    const hud = document.getElementById("hud-shield");
    if (isDevGodMode) {
        player.isShieldActive = true;
        player.shieldTimer = 300;
        if (hud) {
            hud.innerText = `🛡️ SHIELD ACTIVE (100%)`;
            hud.style.display = "block";
        }
        return;
    }
    if (player.invincibleTimer > 0) {
        player.invincibleTimer--;
        player.isShieldActive = true;
        const pct = Math.max(0, Math.ceil((player.invincibleTimer / 180) * 100));
        if (hud) {
            hud.innerText = `🛡️ 3S INVINCIBILITY (${pct}%)`;
            hud.style.display = "block";
        }
        if (player.invincibleTimer <= 0) {
            player.isShieldActive = false;
            if (hud) hud.style.display = "none";
        }
        return;
    }
    if (player.isShieldActive) {
        player.shieldTimer--;
        const pct = Math.max(0, Math.ceil((player.shieldTimer / (player.shieldMaxTimer || 300)) * 100));
        if (hud) {
            hud.innerText = `🛡️ SHIELD ACTIVE (${pct}%)`;
            hud.style.display = "block";
        }
        if (player.shieldTimer <= 0) {
            player.isShieldActive = false;
            if (hud) hud.style.display = "none";
        }
    } else {
        if (hud) hud.style.display = "none";
    }
}

function activateRocket(duration = 6) {
    player.isRocketActive = true;
    player.rocketMaxTimer = duration * 60; // 6 seconds = 360 frames
    player.rocketTimer = duration * 60;
    const hud = document.getElementById("hud-rocket");
    if (hud) hud.style.display = "block";
    unlockAchievement("rocketActive", "🚀 ROCKET BOOST ACTIVE!");
}

function updateRocket() {
    const hud = document.getElementById("hud-rocket");

    // During boss fight: keep jetpack perpetually active (infinite fuel)
    if (player.bossActive) {
        player.isRocketActive = true;
        player.rocketTimer = 999; // always on
        player.rocketMaxTimer = 999;
        if (hud) {
            hud.innerText = `🚀 ROCKET BOOST (ACTIVE)`;
            hud.style.display = "block";
        }
        return;
    }
    if (player.isRocketActive) {
        player.rocketTimer--;
        const pct = Math.max(0, Math.ceil((player.rocketTimer / (player.rocketMaxTimer || 360)) * 100));
        if (hud) {
            hud.innerText = `🚀 ROCKET BOOST (${pct}%)`;
            hud.style.display = "block";
        }

        // Spawn rocket thruster flame particles continuously at player's back
        if (player.rocketTimer % 2 === 0) {
            const backX = player.direction === 1 ? player.x - 5 : player.x + player.width + 5;
            const backY = player.y + player.height * 0.55;
            spawnParticles(backX, backY, "#ff5500", 2, 4);
            spawnParticles(backX, backY, "#ffdd00", 1, 3);
            spawnParticles(backX, backY, "#00f0ff", 1, 2);
        }

        if (player.rocketTimer <= 0) {
            player.isRocketActive = false;
            if (hud) hud.style.display = "none";
        }
    } else {
        if (hud) hud.style.display = "none";
    }
}

function resetGame() {
    resizeCanvas();

    gameOver = false;
    isDying = false;
    isJumping = false;
    isJumpStarting = false;
    isJumpLanding = false;

    // Reset player position and state
    player.x = 100;
    player.y = canvas.height - 150;
    player.velocityX = 0;
    player.velocityY = 0;
    player.score = 0;
    player.lives = 1;
    player.earnedLifeMilestones = [];
    player.invincibleTimer = 0;
    player.lastPlatform = null;
    lifePickupMilestonesSpawned = [];
    lifeWarningsTriggered = [];
    updateLivesHUD();
    player.isShieldActive = false;
    player.shieldTimer = 0;
    player.isRocketActive = false;
    player.rocketTimer = 0;
    player.bossActive = false;
    player.jumpsLeft = 2;
    player.isDoubleJumping = false;
    player.rotation = 0;

    // Reset camera
    camera.x = 0;

    // Reset lists
    platforms.length = 0;
    enemies.length = 0;
    bullets.length = 0;
    enemyBullets.length = 0;
    shieldPowerUps.length = 0;
    rocketPowerUps.length = 0;
    lifePowerUps.length = 0;
    particles.length = 0;
    platformsSinceLastEnemy = 2;

    if (!isBossMode) {
        currentBosses = [];
        bossSpawned = false;  // reset so boss can re-trigger in a new run
        bossLevel   = 0;
        gameSpeedMult = 1.0;  // reset smooth speed multiplier on new game
        bossTransitionState = "none";
        bossIntroTimer = 0;
        camera.lockedX = null;
        document.getElementById("bossHpContainer").style.display = "none";
        const introB = document.getElementById("bossIntroBanner");
        if (introB) introB.style.display = "none";
        const vicB = document.getElementById("bossVictoryBanner");
        if (vicB) vicB.style.display = "none";
        generatePlatforms();
    } else {
        // Spawn stable Boss Battle Arena
        platforms.push(new Platform(50, canvas.height - 100, canvas.width * 2, 20));
        const spawnedBoss = new BossEnemy();
        currentBosses = [spawnedBoss];
        document.getElementById("bossHpContainer").style.display = "block";
        spawnedBoss.updateHpBar();
    }

    // Set spawn platform as lastPlatform so score starts cleanly at 0!
    if (platforms.length > 0) {
        player.lastPlatform = platforms[0];
    }

    // Reset HUD view
    document.getElementById("hud-score").innerText = `SCORE: 0`;
    document.getElementById("hud-highscore").innerText = `HIGH SCORE: ${highScore}`;
    const shieldEl = document.getElementById("hud-shield");
    if (shieldEl) shieldEl.style.display = "none";
    const rocketEl = document.getElementById("hud-rocket");
    if (rocketEl) rocketEl.style.display = "none";

    backgroundSound.currentTime = 0;
    safePlay(backgroundSound);
}

function drawPlayer() {
    if (gameOver) {
        currentAnimation = playerAnimations.dieLie;
    } else if (isJumpStarting) {
        currentAnimation = playerAnimations.jumpStart;
    } else if (isJumping) {
        currentAnimation = playerAnimations.jump;
    } else if (isJumpLanding) {
        currentAnimation = playerAnimations.jumpLand;
    } else if (keys['ArrowLeft'] || keys['ArrowRight'] || keys['KeyA'] || keys['KeyD']) {
        currentAnimation = playerAnimations.walk;
    } else {
        currentAnimation = playerAnimations.idle;
    }

    if (!gameOver || (gameOver && currentAnimation !== playerAnimations.dieLie)) {
        currentAnimation.update();
    }

    const frame = currentAnimation.getCurrentFrame();

    ctx.save();

    // Position rendering relative to camera viewport
    const drawX = player.x - camera.x;
    const drawY = player.y;
    
    // Render equipped Jetpack on player's back (naturally attached, no glow when equipped)
    if (player.isRocketActive && jetpackImg.complete && jetpackImg.naturalWidth) {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
        const jpW = 20;
        const jpH = 36;

        if (player.rotation !== 0) {
            const centerX = drawX + player.width / 2;
            const centerY = drawY + player.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(player.rotation);
            if (player.direction === -1) {
                ctx.scale(-1, 1);
            }
            ctx.drawImage(jetpackImg, -player.width / 2 + 2, -player.height / 2 + 10, jpW, jpH);
        } else {
            if (player.direction === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(jetpackImg, -drawX - player.width + 2, drawY + 10, jpW, jpH);
            } else {
                ctx.drawImage(jetpackImg, drawX + 2, drawY + 10, jpW, jpH);
            }
        }
        ctx.restore();
    }

    // Rotate the player if they are double-jumping
    if (player.rotation !== 0) {
        const centerX = drawX + player.width / 2;
        const centerY = drawY + player.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(player.rotation);
        
        if (player.direction === -1) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(
            playerSpriteSheet,
            frame.x, frame.y, frame.width, frame.height,
            -player.width / 2, -player.height / 2, player.width, player.height
        );
    } else {
        // Normal rendering
        if (player.direction === -1) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                playerSpriteSheet,
                frame.x, frame.y, frame.width, frame.height,
                -drawX - player.width, drawY, player.width, player.height
            );
        } else {
            ctx.drawImage(
                playerSpriteSheet,
                frame.x, frame.y, frame.width, frame.height,
                drawX, drawY, player.width, player.height
            );
        }
    }
    ctx.restore();

    // Draw Katana Slash visual arc
    if (slashTimer > 0) {
        ctx.save();
        ctx.strokeStyle = "#00f0ff";
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4;

        const arcX = player.direction === 1 ? drawX + player.width : drawX;
        const arcY = drawY + player.height / 2;

        ctx.beginPath();
        if (player.direction === 1) {
            ctx.arc(arcX, arcY, 55, -Math.PI / 3, Math.PI / 3);
        } else {
            ctx.arc(arcX, arcY, 55, Math.PI * 2 / 3, Math.PI * 4 / 3);
        }
        ctx.stroke();
        ctx.restore();
    }

    // Draw shield ring — shown during normal shield pickup AND 3s invincibility
    if (player.isShieldActive) {
        ctx.save();
        ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00f0ff";

        const centerX = player.x - camera.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        const radius = Math.max(player.width, player.height) * 0.75;

        let remainingFraction;
        if (player.invincibleTimer > 0) {
            // 3s invincibility arc — drains over 180 frames
            remainingFraction = Math.max(0, Math.min(1, player.invincibleTimer / 180));
        } else {
            // Normal shield pickup arc — drains over shield duration
            const maxShieldDuration = 5 * 60;
            remainingFraction = Math.max(0, Math.min(1, player.shieldTimer / maxShieldDuration));
        }

        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + remainingFraction * Math.PI * 2;

        // Active ring segment
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.stroke();

        // Faint background ring
        ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply Screen Shake
    if (screenShakeTimer > 0) {
        const dx = (Math.random() - 0.5) * screenShakeIntensity;
        const dy = (Math.random() - 0.5) * screenShakeIntensity;
        ctx.translate(dx, dy);
    }

    const imageWidth = backgroundImage.width;
    const imageHeight = backgroundImage.height;
    
    if (imageWidth > 0 && imageHeight > 0) {
        const scale = canvas.height / imageHeight;
        const scaledWidth = imageWidth * scale;

        const numTiles = Math.ceil(canvas.width / scaledWidth) + 1;
        // PARALLAX EFFECT: Stars background scrolls slower (15% camera speed)
        const offset = (camera.x * 0.15) % scaledWidth;

        for (let i = -1; i < numTiles; i++) {
            ctx.drawImage(
                backgroundImage,
                i * scaledWidth - offset,
                0,
                scaledWidth,
                canvas.height
            );
        }
    } else {
        ctx.fillStyle = "#030307";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    platforms.forEach(platform => platform.draw());
    enemies.forEach(enemy => enemy.draw());
    currentBosses.forEach(boss => boss.draw());
    bullets.forEach(bullet => bullet.draw());
    enemyBullets.forEach(bullet => bullet.draw());
    shieldPowerUps.forEach(powerUp => powerUp.draw());
    rocketPowerUps.forEach(powerUp => powerUp.draw());
    lifePowerUps.forEach(powerUp => powerUp.draw());
    particles.forEach(particle => particle.draw()); // Draw all active particles
    drawPlayer();
    
    ctx.restore(); // Restore after drawing shakes
}

function gameLoop() {
    if (gameState === "playing") {
        update();
        render();
    }
    requestAnimationFrame(gameLoop);
}

function setGameState(state) {
    gameState = state;
    
    // Toggle overlay screens
    document.getElementById("mainMenu").classList.remove("active");
    document.getElementById("settingsMenu").classList.remove("active");
    document.getElementById("howToPlayMenu").classList.remove("active");
    document.getElementById("gameOverMenu").classList.remove("active");
    document.getElementById("hud").style.display = "none";

    if (state === "menu") {
        document.getElementById("mainMenu").classList.add("active");
        
        // Dynamic personalized menu elements
        const nameUpper = (playerName || "NINJA").toUpperCase();
        const welcomeBadge = document.getElementById("menuWelcomeBadge");
        if (welcomeBadge) {
            welcomeBadge.innerHTML = `WELCOME, <span class="player-name-tag">${nameUpper}</span>!`;
        }

        const menuHs = document.getElementById("menu-highscore");
        if (menuHs) {
            menuHs.innerText = `${nameUpper}'S BEST: ${highScore}`;
        }
        
        // Show thank-you message only after the player has played at least once
        if (hasPlayedOnce) {
            const ty = document.getElementById("thankyou-msg");
            const cr = document.getElementById("credits-label");
            const nameSpan = document.getElementById("thankyou-player-name");
            if (nameSpan) nameSpan.innerText = playerName || "Soldier";
            if (ty) ty.style.display = "block";
            if (cr) cr.style.display = "none";
        }
        
        backgroundSound.pause();
        backgroundSound.currentTime = 0;
        if (menuSound.paused) {
            safePlay(menuSound);
        }
    } else if (state === "settings") {
        document.getElementById("settingsMenu").classList.add("active");
        document.getElementById("volumeSlider").value = globalVolume;
        document.getElementById("volumeValue").innerText = `${Math.round(globalVolume * 100)}%`;
    } else if (state === "howToPlay") {
        document.getElementById("howToPlayMenu").classList.add("active");
    } else if (state === "playing") {
        hasPlayedOnce = true; // Mark that the player has played at least once
        document.getElementById("hud").style.display = "block";
        menuSound.pause();
        menuSound.currentTime = 0;
        safePlay(backgroundSound);
    } else if (state === "gameOver") {
        document.getElementById("gameOverMenu").classList.add("active");
        document.getElementById("finalScore").innerText = player.score;
        document.getElementById("gameOverHighScore").innerText = highScore;

        const goHsLabel = document.getElementById("gameOverHighScoreLabel");
        if (goHsLabel) {
            goHsLabel.innerText = `${(playerName || "Ninja").toUpperCase()}'S BEST:`;
        }

        // Show merged personalized cause-of-death note in blue/cyan text
        const noteEl = document.getElementById("gameOverNote");
        if (noteEl) {
            const name = playerName || "Ninja";
            noteEl.innerText = getRandomDeathMessage(lastDeathType, name);
        }

        backgroundSound.pause();
    }
}

// Expose actions to Window click triggers
window.startGame = function() {
    isBossMode = false;
    setGameState("playing");
    resetGame();
};

window.startBossFight = function() {
    isBossMode = true;
    setGameState("playing");
    resetGame();
};

window.showSettings = function() {
    setGameState("settings");
};

window.showHowToPlay = function() {
    setGameState("howToPlay");
};

window.showMainMenu = function() {
    setGameState("menu");
};

window.restartGame = function() {
    resetGame();
    setGameState("playing");
};

window.submitPlayerName = function() {
    const input = document.getElementById("playerNameInput");
    const errorEl = document.getElementById("name-error");
    const name = input ? input.value.trim() : "";

    if (!name) {
        if (errorEl) errorEl.style.display = "block";
        if (input) input.focus();
        return;
    }

    playerName = name;
    localStorage.setItem("playerName", playerName);

    // Update intro screen with name
    const introName = document.getElementById("introPlayerName");
    if (introName) introName.innerText = playerName;

    // Transition from name input step to intro briefing step
    const inputStep = document.getElementById("nameInputStep");
    const introStep = document.getElementById("introBriefingStep");
    if (inputStep) inputStep.style.display = "none";
    if (introStep) introStep.style.display = "flex";
};

window.finishIntroAndStartMenu = function() {
    const nameScreen = document.getElementById("nameEntryScreen");
    if (nameScreen) nameScreen.classList.remove("active");
    setGameState("menu");
};

window.onVolumeSliderChange = function(val) {
    const vol = parseFloat(val);
    setVolume(vol);
    document.getElementById("volumeValue").innerText = `${Math.round(vol * 100)}%`;
};

// Update loop runner
function update() {
    if (!gameOver && gameState === "playing") {
        updateGameSpeedMult(); // Smooth speed progression
        updateShield();
        updateRocket();
        handleMovement();
        generatePlatforms();
        camera.update();
        cleanUpOffscreenEntities();

        // Rotate the player if they are double-jumping
        if (player.isDoubleJumping) {
            player.rotation += player.direction * 0.18; // double jump flip speed
        }

        // Update screen shake
        if (screenShakeTimer > 0) {
            screenShakeTimer--;
        }

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }

        // Handle Cyber-Dash movement & cooldowns
        if (dashTimer > 0) {
            dashTimer--;
            player.x += player.direction * 18;
            spawnParticles(player.x + (player.direction === 1 ? 0 : player.width), player.y + player.height / 2, "rgba(0, 240, 255, 0.6)", 3, 2);
        }
        if (dashCooldown > 0) dashCooldown--;
        if (slashTimer > 0) slashTimer--;
        if (slashCooldown > 0) slashCooldown--;

        // ============================================================
        // MULTI-TIER BOSS BATTLE STATE MACHINE
        // Level 1 (500 pts):  1 Right Boss   -> +100 pts
        // Level 2 (1000 pts): 2 Right Bosses -> +150 pts
        // Level 3 (1500 pts): 1 Left + 1 Right Boss -> +200 pts
        // ============================================================

        // STEP 1: Strict level progression trigger checks
        if (!isBossMode && bossTransitionState === "none") {
            let nextLvl = 0;
            if (bossLevel === 0 && player.score >= 250) nextLvl = 1;
            else if (bossLevel === 1 && player.score >= 700) nextLvl = 2;
            else if (bossLevel === 2 && player.score >= 1200) nextLvl = 3;

            if (nextLvl > 0) {
                bossLevel = nextLvl;
                const tier = BOSS_TIERS[bossLevel];
                bossTransitionState = "highway";
                triggerScreenShake(20, 10);
                generatePlatforms(); // spawns clean highway under player

                // Update UI text for intro banner and HP bar title
                const nameEl = document.getElementById("bossIntroBannerName");
                const subEl = document.getElementById("bossIntroBannerSub");
                const hpTitleEl = document.getElementById("bossHpTitle");
                if (nameEl) nameEl.textContent = tier.name;
                if (subEl) subEl.textContent = tier.sub;
                if (hpTitleEl) hpTitleEl.textContent = tier.hpTitle;
            }
        }

        // STEP 2: Player walks onto highway -> lock camera -> show full screen banner
        if (bossTransitionState === "highway") {
            const highwayPlat = platforms.find(p => p.isBossHighway);
            if (highwayPlat && player.x >= highwayPlat.x + 120) {
                bossTransitionState = "intro_banner";
                bossIntroTimer = 210; // 3.5 seconds
                camera.lockedX = camera.x;

                const banner = document.getElementById("bossIntroBanner");
                if (banner) banner.style.display = "flex";
                triggerScreenShake(15, 8);
                enemyShootSound.currentTime = 0;
                enemyShootSound.play().catch(() => {});
            }
        }

        // STEP 3: Countdown banner -> hide -> spawn bosses off-screen
        if (bossTransitionState === "intro_banner") {
            bossIntroTimer--;
            if (bossIntroTimer <= 0) {
                const banner = document.getElementById("bossIntroBanner");
                if (banner) {
                    banner.style.transition = "opacity 0.5s";
                    banner.style.opacity = "0";
                    setTimeout(() => { banner.style.display = "none"; banner.style.opacity = "1"; banner.style.transition = ""; }, 500);
                }

                bossTransitionState = "boss_entering";
                currentBosses = [];
                const tier = BOSS_TIERS[bossLevel];
                const total = tier.bosses.length;
                tier.bosses.forEach((side, idx) => {
                    currentBosses.push(new BossEnemy(side, idx, total));
                });

                document.getElementById("bossHpContainer").style.display = "block";
            }
        }

        // STEP 4: Bosses fly in from their sides
        if (bossTransitionState === "boss_entering") {
            let allArrived = true;
            currentBosses.forEach(b => {
                b.update();
                if (b.isEntering) allArrived = false;
            });
            if (allArrived) {
                bossTransitionState = "active";
            }
        }

        // STEP 5: Active fight
        if (bossTransitionState === "active") {
            // Update bosses and update combined HP bar
            currentBosses.forEach(b => b.update());
            updateCombinedBossHpBar();

            // Check if ALL bosses defeated
            const allDefeated = currentBosses.every(b => b.isDefeated);
            if (allDefeated) {
                // Trigger Cyber Glitch & Screen Shake Effect on Boss Defeat
                triggerBossDefeatGlitchEffect();

                document.getElementById("bossHpContainer").style.display = "none";
                currentBosses = [];
                bossTransitionState = "victory";

                // Reward points based on tier
                const tier = BOSS_TIERS[bossLevel];
                player.score += tier.reward;
                unlockAchievement("bossKill", `⚡ ${tier.name} SLAIN! (+${tier.reward} pts)`);

                // Dynamic victory text
                const vicTitle = document.getElementById("victoryTitle");
                const vicSub   = document.getElementById("victorySub");
                if (vicTitle) vicTitle.textContent = `⚡ ${tier.name} SLAIN! ⚡`;
                if (vicSub)   vicSub.textContent   = `+${tier.reward} POINTS • MISSION RESUMED`;

                // Remove jetpack
                player.bossActive = false;
                player.isRocketActive = false;
                const rHud = document.getElementById("hud-rocket");
                if (rHud) rHud.style.display = "none";

                camera.lockedX = null;

                const vicBanner = document.getElementById("bossVictoryBanner");
                if (vicBanner) vicBanner.style.display = "flex";

                // Clean up enemies & hazards in arena
                enemies.length = 0;
                enemyBullets.length = 0;
                shieldPowerUps.length = 0;
                rocketPowerUps.length = 0;

                // ---- IMMEDIATE SEAMLESS HIGHWAY FINISH TRANSITION ----
                const highway = platforms.find(p => p.isBossHighway);
                let nextX = player.x + 500;
                if (highway) {
                    highway.width = Math.max(300, (player.x - highway.x) + 450);
                    platforms.length = 0;
                    platforms.push(highway);
                    nextX = highway.x + highway.width + 120;
                } else {
                    platforms.length = 0;
                    const newH = new Platform(player.x - 50, canvas.height - 100, 450, 20);
                    newH.isBossHighway = true;
                    platforms.push(newH);
                    nextX = player.x + 520;
                }

                // IMMEDIATELY spawn procedural short platforms right after highway ends
                for (let i = 0; i < 5; i++) {
                    const pw = 160;
                    const py = Math.min(canvas.height - 110, Math.max(150, (canvas.height - 100) + (Math.random() * 80 - 60)));
                    platforms.push(new Platform(nextX, py, pw, 20));
                    nextX += pw + 120 + Math.random() * 80;
                }

                // Immediately unlock state machine so generatePlatforms() runs without delay
                bossTransitionState = "none";

                // Non-blocking victory banner handles fadeout after 2.5s
                setTimeout(() => {
                    const vb = document.getElementById("bossVictoryBanner");
                    if (vb) {
                        vb.style.transition = "opacity 0.6s";
                        vb.style.opacity = "0";
                        setTimeout(() => { vb.style.display = "none"; vb.style.opacity = "1"; vb.style.transition = ""; }, 600);
                    }
                }, 2500);
            }
        }

        // Update bullets
        bullets.forEach((bullet, bulletIndex) => {
            bullet.update();
            
            enemies.forEach((enemy) => {
                if (bullet.hitEnemy(enemy)) {
                    bullets.splice(bulletIndex, 1);
                    enemy.explode();

                    let pts = 5;
                    if (enemy instanceof ShootingEnemy) pts = 7;
                    else if (enemy instanceof SentryOrbDrone) pts = 10;

                    player.score += pts;
                    unlockAchievement("firstblood", "First Blood!");
                    if (player.score >= 500) unlockAchievement("score500", "500 Score Legend!");
                }
            });

            // Check hit on Bosses
            currentBosses.forEach(boss => {
                if (!boss.isDefeated) {
                    if (
                        bullet.x + bullet.width > boss.x &&
                        bullet.x < boss.x + boss.width &&
                        bullet.y + bullet.height > boss.y &&
                        bullet.y < boss.y + boss.height
                    ) {
                        bullets.splice(bulletIndex, 1);
                        boss.takeDamage(8);
                    }
                }
            });

            if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                bullets.splice(bulletIndex, 1);
            }
        });

        // Update enemies
        enemies.forEach(enemy => {
            enemy.update();
            if (
                player.x + player.width > enemy.x &&
                player.x < enemy.x + enemy.width &&
                player.y + player.height > enemy.y &&
                player.y < enemy.y + enemy.height
            ) {
                if (!player.isShieldActive && player.invincibleTimer <= 0 && !enemy.isExploding) {
                    lastDeathType = "enemy_contact";
                    handlePlayerDamage(playerDeathSound);
                } else if (player.isShieldActive && !enemy.isExploding) {
                    // Destroy enemy on shield contact (+10 pts)
                    enemy.explode();
                    player.score += 10;
                    enemyDeathSound.currentTime = 0;
                    enemyDeathSound.play().catch(() => {});
                    spawnParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#00f0ff", 15, 6);
                    unlockAchievement("shield", "Shield Titan! (+10 pts)");
                    if (player.score >= 500) unlockAchievement("score500", "500 Score Legend!");
                }
            }
        });

        // Update enemy bullets
        enemyBullets.forEach((bullet, bulletIndex) => {
            bullet.update();

            // Katana Slash Deflection / Destruction during active slash animation
            if (slashTimer > 0) {
                const attackBox = {
                    x: player.direction === 1 ? player.x : player.x - 70,
                    y: player.y - 15,
                    width: player.width + 70,
                    height: player.height + 30
                };

                if (
                    bullet.x + bullet.width > attackBox.x &&
                    bullet.x < attackBox.x + attackBox.width &&
                    bullet.y + bullet.height > attackBox.y &&
                    bullet.y < attackBox.y + attackBox.height
                ) {
                    enemyBullets.splice(bulletIndex, 1);
                    spawnParticles(bullet.x, bullet.y, "#00f0ff", 12, 5);
                    spawnParticles(bullet.x, bullet.y, "#ffdd00", 8, 6);
                    triggerScreenShake(6, 3);
                    player.score += 5;
                    unlockAchievement("bulletParry", "Bullet Slashed! (+5 pts)");
                    return;
                }
            }

            // Shield protection
            if (player.isShieldActive) {
                if (
                    bullet.x + bullet.width > player.x - 10 &&
                    bullet.x < player.x + player.width + 10 &&
                    bullet.y + bullet.height > player.y - 10 &&
                    bullet.y < player.y + player.height + 10
                ) {
                    enemyBullets.splice(bulletIndex, 1);
                    spawnParticles(bullet.x, bullet.y, "#00f0ff", 10, 4);
                    triggerScreenShake(4, 2);
                    return;
                }
            }

            // Player hit check
            if (
                bullet.x + (bullet.isBomb ? 9 : bullet.width) > player.x &&
                bullet.x - (bullet.isBomb ? 9 : 0) < player.x + player.width &&
                bullet.y + (bullet.isBomb ? 9 : bullet.height) > player.y &&
                bullet.y - (bullet.isBomb ? 9 : 0) < player.y + player.height
            ) {
                if (!player.isShieldActive && player.invincibleTimer <= 0) {
                    enemyBullets.splice(bulletIndex, 1);
                    if (bullet.isBomb) {
                        lastDeathType = "bomb_blast";
                        detonateBomb(bullet.x, bullet.y);
                    } else {
                        lastDeathType = "enemy_shot";
                    }
                    handlePlayerDamage(playerDeathSound);
                }
            }

            // Bomb hits platform (collides with top surface)
            if (bullet.isBomb) {
                let hitPlatform = false;
                for (const platform of platforms) {
                    if (
                        bullet.x > platform.x &&
                        bullet.x < platform.x + platform.width &&
                        bullet.y + 9 >= platform.y &&
                        bullet.y - 9 < platform.y
                    ) {
                        hitPlatform = true;
                        // If platform has spikes — bomb DESTROYS the spikes!
                        if (platform.hasSpikes) {
                            platform.hasSpikes = false;
                            spawnParticles(platform.spikeX + platform.spikeWidth / 2, platform.y - 10, "#ff6600", 16, 6);
                            spawnParticles(platform.spikeX + platform.spikeWidth / 2, platform.y - 10, "#ffdd00", 10, 5);
                            triggerScreenShake(8, 4);
                        }
                        break;
                    }
                }
                if (hitPlatform) {
                    const idx = enemyBullets.indexOf(bullet);
                    if (idx !== -1) enemyBullets.splice(idx, 1);
                    detonateBomb(bullet.x, bullet.y);
                    return;
                }
            }

            if (bullet.x < camera.x - 150 || bullet.x > camera.x + canvas.width + 150 || bullet.y < -150 || bullet.y > canvas.height + 150) {
                if (bullet.isBomb) detonateBomb(bullet.x, bullet.y);
                enemyBullets.splice(bulletIndex, 1);
            }
        });

        // Update Shield Power-Ups
        shieldPowerUps.forEach((powerUp, index) => {
            if (powerUp.isCollected()) {
                activateShield(powerUp.duration);
                shieldPowerUps.splice(index, 1);
                powerUpSound.play().catch(() => {});
                spawnParticles(powerUp.x, powerUp.y, "#00f0ff", 15, 4);
                triggerScreenShake(8, 2);
            }
        });

        // Update Rocket Power-Ups
        rocketPowerUps.forEach((powerUp, index) => {
            if (powerUp.isCollected()) {
                activateRocket(powerUp.duration);
                rocketPowerUps.splice(index, 1);
                powerUpSound.play().catch(() => {});
                spawnParticles(powerUp.x, powerUp.y, "#ff5500", 18, 6);
                spawnParticles(powerUp.x, powerUp.y, "#ffdd00", 12, 5);
                triggerScreenShake(8, 3);
            }
        });

        // Update Life Power-Ups (Heart Pick-Up)
        lifePowerUps.forEach((powerUp, index) => {
            if (powerUp.isCollected()) {
                player.lives++;
                updateLivesHUD();
                lifePowerUps.splice(index, 1);
                powerUpSound.play().catch(() => {});
                spawnParticles(powerUp.x, powerUp.y, "#ff0055", 25, 8);
                spawnParticles(powerUp.x, powerUp.y, "#ffffff", 15, 6);
                triggerScreenShake(8, 3);
                unlockAchievement("extraLife", "❤️ EXTRA LIFE COLLECTED! (+1 LIFE)");
            }
        });

        // Check if any score milestone heart should be spawned
        checkAndSpawnLifePickup();

        // HUD Score Update
        document.getElementById("hud-score").innerText = `SCORE: ${player.score}`;
    }
}

// Interaction Unlock sound trigger
window.addEventListener("click", () => {
    if (gameState === "menu" && menuSound.paused) {
        menuSound.play().catch(e => console.log("Audio unlock failed:", e));
    }
}, { once: true });

// Asset Loading Promises
const assetPromises = [
    new Promise((resolve) => { backgroundImage.complete ? resolve() : backgroundImage.onload = resolve; }),
    new Promise((resolve) => { playerSpriteSheet.complete ? resolve() : playerSpriteSheet.onload = resolve; }),
    // Robot directional walk frames
    ...robotFramesLTR.map(img => new Promise((resolve) => { img.complete ? resolve() : img.addEventListener('load', resolve, { once: true }); })),
    ...robotFramesRTL.map(img => new Promise((resolve) => { img.complete ? resolve() : img.addEventListener('load', resolve, { once: true }); })),
    new Promise((resolve) => { robotDestroyImg.complete ? resolve() : robotDestroyImg.addEventListener('load', resolve, { once: true }); }),
    new Promise((resolve) => { shootingEnemySpriteSheet.complete ? resolve() : shootingEnemySpriteSheet.onload = resolve; }),
    new Promise((resolve) => { platformImage.complete ? resolve() : platformImage.onload = resolve; }),
    new Promise((resolve) => { movingPlatformImage.complete ? resolve() : movingPlatformImage.onload = resolve; }),
    new Promise((resolve) => { spikeImage.complete ? resolve() : spikeImage.onload = resolve; }),
    new Promise((resolve) => { menuImage.complete ? resolve() : menuImage.onload = resolve; }),
    new Promise((resolve) => {
        backgroundSound.readyState >= 3 ? resolve() : backgroundSound.addEventListener("canplaythrough", resolve, { once: true });
    }),
    new Promise((resolve) => {
        menuSound.readyState >= 3 ? resolve() : menuSound.addEventListener("canplaythrough", resolve, { once: true });
    }),
    new Promise((resolve) => {
        powerUpSound.readyState >= 3 ? resolve() : powerUpSound.addEventListener("canplaythrough", resolve, { once: true });
    }),
    new Promise((resolve) => {
        newHighScoreSound.readyState >= 3 ? resolve() : newHighScoreSound.addEventListener("canplaythrough", resolve, { once: true });
    })
];

// Race with a 3s safety timeout to guarantee loading
Promise.all(assetPromises.map(p => Promise.race([p, new Promise(r => setTimeout(r, 3000))])
)).then(() => {
    console.log("All assets loaded. Starting game.");
    
    // Check if name is present AND user has a highscore (>0)
    // If not, trigger name & intro setup prompt
    if (playerName && highScore > 0) {
        const nameScreen = document.getElementById("nameEntryScreen");
        if (nameScreen) nameScreen.classList.remove("active");
        setGameState("menu");
    } else {
        // Show the name entry screen
        const nameScreen = document.getElementById("nameEntryScreen");
        if (nameScreen) nameScreen.classList.add("active");
        setTimeout(() => {
            const input = document.getElementById("playerNameInput");
            if (input) input.focus();
        }, 300);
    }
    
    gameLoop();
}).catch((error) => {
    console.error("Asset loading error, starting loop fallback:", error);
    if (playerName && highScore > 0) {
        const nameScreen = document.getElementById("nameEntryScreen");
        if (nameScreen) nameScreen.classList.remove("active");
        setGameState("menu");
    }
    gameLoop();
});
