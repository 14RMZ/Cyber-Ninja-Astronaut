document.addEventListener("DOMContentLoaded", () => {
    // ============================================
    // STAGE 1: INITIAL FAST LOAD
    // ============================================
    
    // Loading tracking variables
    let assetsLoaded = false;
    let loadingProgress = 0;
    let totalAssetsToLoad = 0;
    let assetsLoadedCount = 0;
    let initialScreenActive = true;
    
    // Get modal elements
    const welcomeModal = document.getElementById("welcomeModal");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const howToPlayMessage = document.getElementById("howToPlayMessage");
    const startGameButton = document.getElementById("startGameButton");
    
    // Create loading screen
    const loadingScreen = document.createElement("div");
    loadingScreen.id = "loadingScreen";
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        color: white;
        font-family: 'Arial', sans-serif;
    `;
    
    // Create loading content
    const loadingContent = document.createElement("div");
    loadingContent.style.cssText = `
        text-align: center;
        max-width: 600px;
        padding: 40px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 20px;
        box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
        border: 2px solid cyan;
    `;
    
    const loadingTitle = document.createElement("h1");
    loadingTitle.textContent = "CYBER NINJA ASTRONAUT";
    loadingTitle.style.cssText = `
        color: cyan;
        font-size: 2.5em;
        margin-bottom: 30px;
        text-shadow: 0 0 20px blue, 0 0 40px cyan;
        letter-spacing: 2px;
    `;
    
    const loadingText = document.createElement("p");
    loadingText.textContent = "INITIALIZING GAME ASSETS...";
    loadingText.style.cssText = `
        font-size: 1.2em;
        margin-bottom: 40px;
        color: #00ffcc;
        letter-spacing: 1px;
    `;
    
    const progressBarContainer = document.createElement("div");
    progressBarContainer.style.cssText = `
        width: 100%;
        height: 25px;
        background: #222244;
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: hidden;
        border: 2px solid #333366;
    `;
    
    const progressBar = document.createElement("div");
    progressBar.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #00ffff, #0088ff, #00ffff);
        transition: width 0.3s ease;
        background-size: 200% 100%;
        animation: loadingPulse 2s infinite linear;
    `;
    
    const progressText = document.createElement("p");
    progressText.style.cssText = `
        font-size: 1.3em;
        color: cyan;
        margin-bottom: 30px;
        font-weight: bold;
    `;
    
    const loadingSpinner = document.createElement("div");
    loadingSpinner.style.cssText = `
        width: 60px;
        height: 60px;
        border: 5px solid rgba(0, 255, 255, 0.3);
        border-top: 5px solid cyan;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 30px auto;
    `;
    
    const loadingHint = document.createElement("p");
    loadingHint.textContent = "Preparing your cyber-ninja adventure...";
    loadingHint.style.cssText = `
        font-size: 1em;
        color: #88ffff;
        margin-top: 30px;
        opacity: 0.8;
    `;
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes loadingPulse {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
        }
        @keyframes glow {
            0%, 100% { text-shadow: 0 0 10px cyan, 0 0 20px blue; }
            50% { text-shadow: 0 0 20px cyan, 0 0 40px blue; }
        }
    `;
    document.head.appendChild(style);
    
    // Assemble loading screen
    progressBarContainer.appendChild(progressBar);
    loadingContent.appendChild(loadingTitle);
    loadingContent.appendChild(loadingText);
    loadingContent.appendChild(progressBarContainer);
    loadingContent.appendChild(progressText);
    loadingContent.appendChild(loadingSpinner);
    loadingContent.appendChild(loadingHint);
    loadingScreen.appendChild(loadingContent);
    
    // Function to update loading progress
    function updateLoadingProgress() {
        loadingProgress = Math.floor((assetsLoadedCount / totalAssetsToLoad) * 100);
        progressBar.style.width = `${loadingProgress}%`;
        progressText.textContent = `LOADING... ${loadingProgress}%`;
        
        // Add some dynamic text
        const loadingPhrases = [
            "Loading sprites...",
            "Loading sounds...",
            "Initializing enemies...",
            "Preparing platforms...",
            "Setting up cyber-ninja...",
            "Loading power-ups...",
            "Almost ready..."
        ];
        const phraseIndex = Math.min(Math.floor(loadingProgress / 15), loadingPhrases.length - 1);
        loadingText.textContent = loadingPhrases[phraseIndex];
    }
    
    function showLoadingScreen() {
        document.body.appendChild(loadingScreen);
    }
    
    function hideLoadingScreen() {
        if (loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
        }
    }
    
    // ============================================
    // PLAYER NAME AND HIGH SCORE SETUP
    // ============================================
    
    let playerName = localStorage.getItem("playerName");
    if (!playerName) {
        playerName = prompt("Hello! What is your name?");
        if (playerName) {
            playerName = playerName.charAt(0).toUpperCase() + playerName.slice(1).toLowerCase();
            localStorage.setItem("playerName", playerName);
        } else {
            playerName = "Player";
        }
    }
    
    let highScore = localStorage.getItem("highScore") || 0;
    highScore = parseInt(highScore);
    const isNewPlayer = highScore === 0;
    
    // ============================================
    // LOAD MINIMAL ASSETS FOR INITIAL SCREEN
    // ============================================
    
    const menuImage = new Image();
    const menuMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuSound.wav");
    menuMusic.loop = true;
    menuMusic.volume = 0.5;
    
    let minimalAssetsLoaded = 0;
    const minimalAssetsToLoad = 2;
    
    function checkMinimalAssetsLoaded() {
        minimalAssetsLoaded++;
        if (minimalAssetsLoaded === minimalAssetsToLoad) {
            if (isNewPlayer && welcomeModal) {
                showWelcomeModal(playerName);
            }
            showInitialScreen();
        }
    }
    
    menuImage.onload = checkMinimalAssetsLoaded;
    menuImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuBackground.webp";
    
    menuMusic.addEventListener("canplaythrough", checkMinimalAssetsLoaded);
    menuMusic.load();
    
    // ============================================
    // INITIAL SCREEN FUNCTIONS
    // ============================================
    
    function showInitialScreen() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        let initialStartButton = null;
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        function drawInitialScreen() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            if (menuImage.complete && menuImage.naturalWidth !== 0) {
                ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = "#0a0a2a";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw stars
                ctx.fillStyle = "white";
                for (let i = 0; i < 50; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const size = Math.random() * 2 + 1;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Draw title with glow effect
            ctx.save();
            ctx.fillStyle = "cyan";
            ctx.font = "bold 5em 'Arial', sans-serif";
            ctx.shadowColor = "blue";
            ctx.shadowBlur = 20;
            ctx.textAlign = "center";
            
            const titleY = canvas.height * 0.2;
            ctx.fillText("CYBER NINJA", canvas.width / 2, titleY);
            ctx.fillText("ASTRONAUT", canvas.width / 2, titleY + 80);
            
            ctx.shadowBlur = 0;
            ctx.restore();
            
            // Draw start button
            const buttonX = canvas.width / 2;
            const buttonY = canvas.height / 2;
            const buttonWidth = 300;
            const buttonHeight = 80;
            
            // Button glow effect
            ctx.save();
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 20;
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
            ctx.restore();
            
            // Button border with gradient
            const gradient = ctx.createLinearGradient(
                buttonX - buttonWidth/2, buttonY - buttonHeight/2,
                buttonX + buttonWidth/2, buttonY + buttonHeight/2
            );
            gradient.addColorStop(0, "cyan");
            gradient.addColorStop(1, "blue");
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 4;
            ctx.strokeRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);
            
            // Button text
            ctx.fillStyle = "cyan";
            ctx.font = "bold 2em Arial";
            ctx.textAlign = "center";
            ctx.fillText("START GAME", buttonX, buttonY + 15);
            
            // Subtitle
            ctx.fillStyle = "#88ffff";
            ctx.font = "1.2em Arial";
            ctx.fillText("Click to begin loading", buttonX, buttonY + 100);
            
            // Welcome message
            ctx.fillStyle = "white";
            ctx.font = "1.5em Arial";
            ctx.fillText(`Welcome, ${playerName}!`, canvas.width / 2, canvas.height * 0.8);
            
            // Store button position
            initialStartButton = {
                x: buttonX - buttonWidth/2,
                y: buttonY - buttonHeight/2,
                width: buttonWidth,
                height: buttonHeight
            };
            
            // Draw high score if exists
            if (highScore > 0) {
                ctx.fillStyle = "gold";
                ctx.font = "1.3em Arial";
                ctx.fillText(`Highest Score: ${highScore}`, canvas.width / 2, canvas.height * 0.85);
            }
        }
        
        // Handle initial screen clicks
        function handleInitialClick(event) {
            if (!initialScreenActive) return;
            
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            if (initialStartButton && 
                mouseX >= initialStartButton.x && 
                mouseX <= initialStartButton.x + initialStartButton.width &&
                mouseY >= initialStartButton.y && 
                mouseY <= initialStartButton.y + initialStartButton.height) {
                
                initialScreenActive = false;
                canvas.removeEventListener("click", handleInitialClick);
                
                // Stop menu music
                menuMusic.pause();
                menuMusic.currentTime = 0;
                
                // Show loading screen and load all game assets
                showLoadingScreen();
                loadAllGameAssets();
            }
        }
        
        canvas.addEventListener("click", handleInitialClick);
        
        // Initial render loop
        function initialRenderLoop() {
            if (initialScreenActive && !assetsLoaded) {
                drawInitialScreen();
                requestAnimationFrame(initialRenderLoop);
            }
        }
        
        // Try to play menu music
        menuMusic.play().catch(e => {
            console.log("Autoplay prevented, will play after user interaction");
        });
        
        // Start initial screen render loop
        initialRenderLoop();
    }
    
    // ============================================
    // STAGE 2: LOAD ALL GAME ASSETS
    // ============================================
    
    function loadAllGameAssets() {
        // Game state variables
        let gameState = "menu";
        let settingsState = false;
        let howToPlayState = false;
        let currentGameOverMessage = "";
        let gameOver = false;
        
        // Player object
        const player = {
            x: 100,
            y: 0,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            speed: 6,
            jumpHeight: 14,
            isJumping: false,
            direction: 1,
            score: 0,
            lastPlatform: null,
            isShieldActive: false,
            shieldTimer: 0
        };
        
        // Game over messages
        const gameOverMessages = [
            `${playerName}, your highest score is ${highScore}... but I know you can do better!`,
            `${playerName}, you scored! But I know you can make it higher!`,
            `Don't give up, ${playerName}! You are reaching closer, try again!`,
            `${playerName}, you're getting better with every try!`,
            `Keep going, ${playerName}! the next run will be even better!`,
            `${playerName}, you're so close to beating your high score of ${highScore}! Don't give up!`,
            `Practice makes perfect, ${playerName}!, give it another shot!`,
            `${playerName}, you're a star! —Just one more try!`,
            `${playerName}, you're unstoppable! Keep pushing fast points!`,
            `Every failure is a step closer to success, ${playerName}! You reached ${highScore}, now aim higher!`,
            `The AI got lucky this time, ${playerName}… but not next time! is just a warm-up!`,
            `You're learning the patterns, ${playerName}. Victory is near!`,
            `Even legends have setbacks, ${playerName}. Get back in there! ${highScore} isn't your limit!`,
            `${playerName}, your cyber-ninja training isn't over yet! You reached ${highScore}, now go further!`,
            `Every attempt makes you stronger, ${playerName}. Try again!`,
            `${playerName}, you dodged lasers, jumped spikes… and scored ${highScore}! Now do it again!`,
            `${playerName}, the cyber-ninjas believe in you! ${highScore} is great, but you can do better!`,
            `Almost there, ${playerName}! You are getting it! Just a little more practice and you'll be unstoppable!`,
            `Even the greatest warriors fall, ${playerName}. You reached ${highScore}, now rise again!`,
            `Your reflexes are improving, ${playerName}! Keep going!`
        ];
        
        // Global variables
        let facebookX, facebookY, instagramX, instagramY, privacyPolicyX, privacyPolicyY;
        let logoSize = 40;
        let logoPadding = 20;
        let privacyPolicyText = "How We Use Your Info & Privacy";
        
        // Define all assets to load
        const assets = [
            // Images
            { type: 'image', src: "GameBackground.jpg", name: 'backgroundImage' },
            { type: 'image', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/NewPlayermovement.png", name: 'playerSpriteSheet' },
            { type: 'image', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/AlienRoboticEnemyMovement.png", name: 'nonShootingEnemySpriteSheet' },
            { type: 'image', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/AIDroneEnemyMovement.png", name: 'shootingEnemySpriteSheet' },
            { type: 'image', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/platform.jpg", name: 'platformImage' },
            { type: 'image', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/moving-platform.jpg", name: 'movingPlatformImage' },
            { type: 'image', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/testingspike.png", name: 'spikeImage' },
            { type: 'image', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/facebook.png", name: 'facebookLogo' },
            { type: 'image', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/instagram.png", name: 'instagramLogo' },
            
            // Audio files
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/Playingthegamesound.wav", name: 'gameMusic' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/jumping_sound.wav", name: 'jumpSound' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/Playershooting.mp3", name: 'shootSound' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerfallingdown.mp3", name: 'fallSound' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerkilledbyspikes.wav", name: 'spikeDeathSound' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/Playergetsshootbyenemy.mp3", name: 'playerDeathSound' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/Droneshooting.mp3", name: 'enemyShootSound' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/Enemydying.wav", name: 'enemyDeathSound' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/playerpowerup.wav", name: 'powerUpSound' },
            { type: 'audio', src: "https://14rmz.github.io/Cyber-Ninja-Astronaut/highscore.wav", name: 'newHighScoreSound' }
        ];
        
        totalAssetsToLoad = assets.length;
        assetsLoadedCount = 0;
        
        // Object to store all loaded assets
        const gameAssets = {};
        
        // Load each asset
        assets.forEach(asset => {
            if (asset.type === 'image') {
                const img = new Image();
                img.onload = () => {
                    gameAssets[asset.name] = img;
                    assetsLoadedCount++;
                    updateLoadingProgress();
                    checkAllAssetsLoaded();
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${asset.src}`);
                    gameAssets[asset.name] = null;
                    assetsLoadedCount++;
                    updateLoadingProgress();
                    checkAllAssetsLoaded();
                };
                img.src = asset.src;
            } else if (asset.type === 'audio') {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => {
                    gameAssets[asset.name] = audio;
                    
                    // Set audio properties
                    if (asset.name === 'gameMusic') {
                        audio.loop = true;
                        audio.volume = 0.5;
                    } else {
                        audio.volume = 0.5;
                    }
                    
                    assetsLoadedCount++;
                    updateLoadingProgress();
                    checkAllAssetsLoaded();
                }, { once: true });
                
                audio.onerror = () => {
                    console.warn(`Failed to load audio: ${asset.src}`);
                    gameAssets[asset.name] = null;
                    assetsLoadedCount++;
                    updateLoadingProgress();
                    checkAllAssetsLoaded();
                };
                
                audio.src = asset.src;
                audio.load();
            }
        });
        
        function checkAllAssetsLoaded() {
            if (assetsLoadedCount === totalAssetsToLoad) {
                setTimeout(() => {
                    hideLoadingScreen();
                    assetsLoaded = true;
                    initializeFullGame(gameAssets);
                }, 500); // Small delay for smooth transition
            }
        }
        
        // ============================================
        // INITIALIZE FULL GAME WITH LOADED ASSETS
        // ============================================
        
        function initializeFullGame(gameAssets) {
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            
            // Resize canvas
            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                player.y = canvas.height - 150;
            }
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();
            
            // ============================================
            // HELPER FUNCTIONS
            // ============================================
            
            function getRandomGameOverMessage() {
                const randomIndex = Math.floor(Math.random() * gameOverMessages.length);
                return gameOverMessages[randomIndex].replace("${playerName}", playerName);
            }
            
            function setGameState(newState) {
                if (newState === "playing") {
                    resetGame();
                } else if (newState === "gameOver") {
                    currentGameOverMessage = getRandomGameOverMessage();
                }
                gameState = newState;
            }
            
            function updateHighScore() {
                if (player.score > highScore) {
                    highScore = player.score;
                    localStorage.setItem("highScore", highScore);
                    if (gameAssets.newHighScoreSound) {
                        gameAssets.newHighScoreSound.currentTime = 0;
                        gameAssets.newHighScoreSound.play();
                    }
                }
            }
            
            function activateShield(duration) {
                player.isShieldActive = true;
                player.shieldTimer = duration * 60;
            }
            
            function updateShield() {
                if (player.isShieldActive) {
                    player.shieldTimer--;
                    if (player.shieldTimer <= 0) {
                        player.isShieldActive = false;
                    }
                }
            }
            
            // Music control functions
            function playMenuMusic() {
                if (gameAssets.gameMusic) {
                    gameAssets.gameMusic.pause();
                    gameAssets.gameMusic.currentTime = 0;
                }
                menuMusic.play();
            }
            
            function playGameMusic() {
                menuMusic.pause();
                menuMusic.currentTime = 0;
                if (gameAssets.gameMusic) {
                    gameAssets.gameMusic.play();
                }
            }
            
            function stopAllMusic() {
                menuMusic.pause();
                if (gameAssets.gameMusic) {
                    gameAssets.gameMusic.pause();
                }
            }
            
            // ============================================
            // ANIMATION CLASS
            // ============================================
            
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
            
            // Player animations
            const playerAnimations = {
                idle: new Animation([{ x: 0, y: 0, width: 32, height: 48 }], 1),
                walk: new Animation([{ x: 32, y: 0, width: 32, height: 48 }, { x: 64, y: 0, width: 32, height: 48 }], 10),
                jumpStart: new Animation([{ x: 96, y: 0, width: 32, height: 48 }], 1),
                jump: new Animation([{ x: 128, y: 0, width: 32, height: 48 }], 1),
                jumpLand: new Animation([{ x: 160, y: 0, width: 32, height: 48 }], 1),
                dieLie: new Animation([{ x: 224, y: 0, width: 32, height: 48 }], 1)
            };
            
            // Enemy animations
            const nonShootingEnemyAnimations = {
                walk: new Animation(
                    [
                        { x: 0, y: 0, width: 48, height: 64 },
                        { x: 48, y: 0, width: 48, height: 64 },
                        { x: 96, y: 0, width: 53, height: 64 }
                    ],
                    10
                ),
                explode: new Animation(
                    [
                        { x: 149, y: 0, width: 48, height: 64 }
                    ],
                    1
                )
            };
            
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
            
            // ============================================
            // GAME OBJECTS CLASSES
            // ============================================
            
            // Camera
            const camera = {
                x: 0,
                update: function() {
                    this.x = player.x - canvas.width / 3;
                    if (this.x < 0) this.x = 0;
                }
            };
            
            // Platform class
            class Platform {
                constructor(x, y, width, height, isMoving = false, hasSpikes = false) {
                    this.x = x;
                    this.y = y;
                    this.width = width;
                    this.height = height;
                    this.isMoving = isMoving;
                    this.originalX = x;
                    this.moveRange = 100;
                    this.direction = 1;
                    this.speed = isMoving ? 2 : 0;
                    this.hasSpikes = hasSpikes;
                    
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
                    if (this.isMoving) {
                        this.x += this.direction * this.speed;
                        if (this.x > this.originalX + this.moveRange || this.x < this.originalX - this.moveRange) {
                            this.direction *= -1;
                        }
                        if (this.hasSpikes) {
                            this.spikeX += this.direction * this.speed;
                        }
                    }
                }
                
                draw() {
                    const platformImg = this.isMoving ? gameAssets.movingPlatformImage : gameAssets.platformImage;
                    if (platformImg && platformImg.complete && platformImg.naturalWidth !== 0) {
                        ctx.drawImage(
                            platformImg,
                            this.x - camera.x, this.y, this.width, this.height
                        );
                    } else {
                        ctx.fillStyle = this.isMoving ? "purple" : "#654321";
                        ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
                    }
                    
                    if (this.hasSpikes && gameAssets.spikeImage && gameAssets.spikeImage.complete && gameAssets.spikeImage.naturalWidth !== 0) {
                        for (let i = 0; i < this.spikeWidth; i += 20) {
                            ctx.drawImage(
                                gameAssets.spikeImage,
                                this.spikeX + i - camera.x, this.y - 15, 20, 15
                            );
                        }
                    }
                }
            }
            
            // Non-shooting enemy class
            class NonShootingEnemy {
                constructor(platform) {
                    this.platform = platform;
                    this.x = platform.x + platform.width / 4;
                    this.y = platform.y - 64;
                    this.width = 48;
                    this.height = 64;
                    this.speed = 2;
                    this.direction = 1;
                    this.minX = platform.x + 10;
                    this.maxX = platform.x + platform.width - this.width - 10;
                    this.currentAnimation = nonShootingEnemyAnimations.walk;
                    this.isExploding = false;
                    this.explodeTimer = 0;
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
                        this.x += this.direction * this.speed;
                        if (this.x <= this.minX || this.x >= this.maxX) {
                            this.direction *= -1;
                        }
                        this.currentAnimation.update();
                    }
                }
                
                draw() {
                    const frame = this.currentAnimation.getCurrentFrame();
                    ctx.save();
                    if (this.direction === -1 && !this.isExploding) {
                        ctx.scale(-1, 1);
                        ctx.drawImage(
                            gameAssets.nonShootingEnemySpriteSheet,
                            frame.x, frame.y, frame.width, frame.height,
                            -this.x + camera.x - frame.width, this.y, frame.width, frame.height
                        );
                    } else {
                        ctx.drawImage(
                            gameAssets.nonShootingEnemySpriteSheet,
                            frame.x, frame.y, frame.width, frame.height,
                            this.x - camera.x, this.y, frame.width, frame.height
                        );
                    }
                    ctx.restore();
                }
                
                explode() {
                    this.isExploding = true;
                    this.currentAnimation = nonShootingEnemyAnimations.explode;
                    if (gameAssets.enemyDeathSound) {
                        gameAssets.enemyDeathSound.currentTime = 0;
                        gameAssets.enemyDeathSound.play();
                    }
                }
            }
            
            // Shooting enemy class
            class ShootingEnemy {
                constructor(platform) {
                    this.platform = platform;
                    this.x = platform.x + platform.width / 4;
                    this.y = platform.y - 40;
                    this.width = 30;
                    this.height = 40;
                    this.speed = 2;
                    this.direction = 1;
                    this.minX = platform.x + 10;
                    this.maxX = platform.x + platform.width - this.width - 10;
                    this.currentAnimation = shootingEnemyAnimations.fly;
                    this.isExploding = false;
                    this.explodeTimer = 0;
                    this.shootCooldown = 100;
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
                        this.x += this.direction * this.speed;
                        if (this.x <= this.minX || this.x >= this.maxX) {
                            this.direction *= -1;
                        }
                        this.currentAnimation.update();
                        
                        if (this.shootTimer <= 0) {
                            this.shoot();
                            this.shootTimer = this.shootCooldown;
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
                            gameAssets.shootingEnemySpriteSheet,
                            frame.x, frame.y, frame.width, frame.height,
                            -this.x + camera.x - this.width + offsetX, this.y + offsetY, frame.width, frame.height
                        );
                    } else {
                        ctx.drawImage(
                            gameAssets.shootingEnemySpriteSheet,
                            frame.x, frame.y, frame.width, frame.height,
                            this.x - camera.x + offsetX, this.y + offsetY, frame.width, frame.height
                        );
                    }
                    ctx.restore();
                }
                
                shoot() {
                    const direction = player.x > this.x ? 1 : -1;
                    const bulletX = this.x + this.width / 2;
                    const bulletY = this.y + this.height / 2;
                    enemyBullets.push(new EnemyBullet(bulletX, bulletY, direction));
                    if (gameAssets.enemyShootSound) {
                        gameAssets.enemyShootSound.currentTime = 0;
                        gameAssets.enemyShootSound.play();
                    }
                }
                
                explode() {
                    this.isExploding = true;
                    this.currentAnimation = shootingEnemyAnimations.explode;
                    if (gameAssets.enemyDeathSound) {
                        gameAssets.enemyDeathSound.currentTime = 0;
                        gameAssets.enemyDeathSound.play();
                    }
                }
            }
            
            // Bullet class
            class Bullet {
                constructor(x, y, direction) {
                    this.x = x;
                    this.y = y;
                    this.width = 10;
                    this.height = 5;
                    this.speed = 8;
                    this.direction = direction;
                }
                
                update() {
                    this.x += this.speed * this.direction;
                }
                
                draw() {
                    ctx.fillStyle = "yellow";
                    ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
                }
                
                hitEnemy(enemy) {
                    return (
                        this.x + this.width > enemy.x &&
                        this.x < enemy.x + enemy.width &&
                        this.y + this.height > enemy.y &&
                        this.y < enemy.y + enemy.height
                    );
                }
            }
            
            // Enemy bullet class
            class EnemyBullet {
                constructor(x, y, direction) {
                    this.x = x;
                    this.y = y;
                    this.width = 10;
                    this.height = 5;
                    this.speed = 8;
                    this.direction = direction;
                }
                
                update() {
                    this.x += this.speed * this.direction;
                }
                
                draw() {
                    ctx.fillStyle = "red";
                    ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
                }
            }
            
            // Shield power-up class
            class ShieldPowerUp {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.width = 20;
                    this.height = 20;
                    this.duration = 5;
                    this.isActive = false;
                }
                
                draw() {
                    ctx.fillStyle = "cyan";
                    ctx.beginPath();
                    ctx.arc(this.x - camera.x, this.y, this.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add glow effect
                    ctx.shadowColor = "cyan";
                    ctx.shadowBlur = 10;
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
                
                isCollected() {
                    return (
                        player.x + player.width > this.x &&
                        player.x < this.x + this.width &&
                        player.y + player.height > this.y &&
                        player.y < this.y + this.height
                    );
                }
            }
            
            // ============================================
            // GAME ARRAYS
            // ============================================
            
            const platforms = [new Platform(50, canvas.height - 100, 200, 20)];
            const enemies = [];
            const bullets = [];
            const enemyBullets = [];
            const shieldPowerUps = [];
            
            // ============================================
            // GAME FUNCTIONS
            // ============================================
            
            function generatePlatforms() {
                let lastPlatform = platforms[platforms.length - 1];
                if (lastPlatform.x - camera.x < canvas.width - 250) {
                    let x = lastPlatform.x + lastPlatform.width + Math.random() * 120 + 80;
                    let y = Math.min(lastPlatform.y + (Math.random() * 60 - 30), canvas.height - 120);
                    let isMoving = Math.random() > 0.6;
                    let hasSpikes = player.score >= 10 && Math.random() > 0.7;
                    let hasNonShootingEnemy = player.score >= 12 && !isMoving && !hasSpikes && Math.random() > 0.5;
                    let hasShootingEnemy = player.score >= 15 && !isMoving && !hasSpikes && Math.random() > 0.3;
                    let hasShieldPowerUp = player.score >= 30 && Math.random() > 0.8;
                    
                    let platform = new Platform(x, y, 180, 20, isMoving, hasSpikes);
                    platforms.push(platform);
                    
                    if (hasNonShootingEnemy) {
                        enemies.push(new NonShootingEnemy(platform));
                    }
                    
                    if (hasShootingEnemy) {
                        enemies.push(new ShootingEnemy(platform));
                    }
                    
                    if (hasShieldPowerUp) {
                        shieldPowerUps.push(new ShieldPowerUp(x + platform.width / 2, y - 30));
                    }
                }
            }
            
            // Key handling
            const keys = {};
            window.addEventListener('keydown', (event) => {
                keys[event.code] = true;
                if (event.code === "KeyR" && gameOver) {
                    setGameState("playing");
                }
                if (event.code === "KeyM" && gameOver) {
                    setGameState("menu");
                }
                if ((event.code === "KeyF" || event.code === "KeyJ") && gameState === "playing") {
                    bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, player.direction));
                    if (gameAssets.shootSound) {
                        gameAssets.shootSound.currentTime = 0;
                        gameAssets.shootSound.play();
                    }
                }
            });
            
            window.addEventListener('keyup', (event) => keys[event.code] = false);
            
            function handleMovement() {
                if (keys['ArrowLeft'] || keys['KeyA']) {
                    player.x -= player.speed;
                    player.direction = -1;
                }
                if (keys['ArrowRight'] || keys['KeyD']) {
                    player.x += player.speed;
                    player.direction = 1;
                }
                
                player.velocityY += 0.5;
                player.y += player.velocityY;
                
                let onPlatform = false;
                platforms.forEach(platform => {
                    platform.update();
                    
                    if (
                        player.x + player.width > platform.x &&
                        player.x < platform.x + platform.width &&
                        player.y + player.height >= platform.y &&
                        player.y + player.height - player.velocityY <= platform.y
                    ) {
                        if (platform.hasSpikes && player.x + player.width > platform.spikeX && player.x < platform.spikeX + platform.spikeWidth) {
                            if (!player.isShieldActive) {
                                gameOver = true;
                                if (gameAssets.spikeDeathSound) {
                                    gameAssets.spikeDeathSound.currentTime = 0;
                                    gameAssets.spikeDeathSound.play();
                                }
                                updateHighScore();
                            } else {
                                player.y = platform.y - player.height;
                                player.velocityY = 0;
                                onPlatform = true;
                            }
                        } else {
                            player.y = platform.y - player.height;
                            player.velocityY = 0;
                            onPlatform = true;
                            
                            if (platform.isMoving) {
                                player.x += platform.direction * platform.speed;
                            }
                            
                            if (player.lastPlatform !== platform) {
                                player.score += 2;
                                player.lastPlatform = platform;
                            }
                        }
                    }
                });
                
                if (!onPlatform) {
                    player.isJumping = true;
                } else {
                    if (player.isJumping) {
                        isJumpLanding = true;
                        setTimeout(() => {
                            isJumpLanding = false;
                            isJumping = false;
                        }, 100);
                    }
                    player.isJumping = false;
                }
                
                if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && !player.isJumping) {
                    isJumpStarting = true;
                    setTimeout(() => {
                        isJumpStarting = false;
                        isJumping = true;
                    }, 100);
                    player.velocityY = -player.jumpHeight;
                    player.isJumping = true;
                    if (gameAssets.jumpSound) {
                        gameAssets.jumpSound.currentTime = 0;
                        gameAssets.jumpSound.play();
                    }
                }
                
                if (player.y > canvas.height) {
                    gameOver = true;
                    setGameState("gameOver");
                    if (gameAssets.fallSound) {
                        gameAssets.fallSound.currentTime = 0;
                        gameAssets.fallSound.play();
                    }
                    updateHighScore();
                }
            }
            
            function resetGame() {
                stopAllMusic();
                resizeCanvas();
                
                gameOver = false;
                isDying = false;
                isJumping = false;
                isJumpStarting = false;
                isJumpLanding = false;
                
                player.x = 100;
                player.y = canvas.height - 150;
                player.velocityX = 0;
                player.velocityY = 0;
                player.score = 0;
                player.lastPlatform = null;
                player.isShieldActive = false;
                player.shieldTimer = 0;
                
                camera.x = 0;
                
                platforms.length = 1;
                enemies.length = 0;
                bullets.length = 0;
                enemyBullets.length = 0;
                shieldPowerUps.length = 0;
                
                generatePlatforms();
                
                if (gameAssets.playerDeathSound) gameAssets.playerDeathSound.volume = 0.5;
                if (gameAssets.spikeDeathSound) gameAssets.spikeDeathSound.volume = 0.5;
                if (gameAssets.fallSound) gameAssets.fallSound.volume = 0.5;
                
                playGameMusic();
            }
            
            // ============================================
            // DRAWING FUNCTIONS
            // ============================================
            
            function drawGameOverScreen() {
                if (menuImage.complete && menuImage.naturalWidth !== 0) {
                    ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = "red";
                ctx.font = "bold 60px Arial";
                ctx.textAlign = "center";
                ctx.shadowColor = "darkred";
                ctx.shadowBlur = 20;
                ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 150);
                ctx.shadowBlur = 0;
                
                ctx.fillStyle = "white";
                ctx.font = "30px Arial";
                ctx.fillText(`${playerName}, your score is: ${player.score}`, canvas.width / 2, canvas.height / 2 - 50);
                
                ctx.fillStyle = "gold";
                ctx.font = "bold 30px Arial";
                ctx.fillText(`Your High Score: ${highScore}`, canvas.width / 2, canvas.height / 2);
                
                ctx.fillStyle = "cyan";
                ctx.font = "25px Arial";
                ctx.fillText(currentGameOverMessage, canvas.width / 2, canvas.height / 2 + 50);
                
                ctx.fillStyle = "white";
                ctx.font = "20px Arial";
                ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 140);
                ctx.fillText("Press M to Return to Menu", canvas.width / 2, canvas.height / 2 + 180);
            }
            
            // Menu variables
            let menuItems = ["Start Game", "Settings", "How To Play", "Highest Score"];
            let menuPositions = [];
            let hoveredIndex = -1;
            let hoverAnimation = { opacity: 1, scale: 1 };
            let hoveredFacebook = false;
            let hoveredInstagram = false;
            let hoveredPrivacyPolicy = false;
            
            function drawMainMenu() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                if (menuImage.complete && menuImage.naturalWidth !== 0) {
                    ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = "#0a0a2a";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                // Draw title
                ctx.fillStyle = "cyan";
                ctx.font = "bold 80px Arial";
                ctx.shadowColor = "blue";
                ctx.shadowBlur = 50;
                ctx.textAlign = "left";
                ctx.fillText("Cyber Ninja Astronaut", 100, 80);
                ctx.shadowBlur = 0;
                ctx.shadowColor = "transparent";
                
                // Draw menu items in arc
                let centerX = canvas.width - 350;
                let centerY = canvas.height / 2;
                let radius = 180;
                
                for (let i = 0; i < menuItems.length; i++) {
                    let angle = (-Math.PI / 3.5) + (i * (Math.PI / 5));
                    let x = centerX + radius * Math.cos(angle);
                    let y = centerY + radius * Math.sin(angle);
                    
                    ctx.font = "30px Arial";
                    let textWidth = ctx.measureText(menuItems[i]).width;
                    let padding = 10;
                    let boxWidth = textWidth + padding * 2;
                    let boxHeight = 40;
                    
                    menuPositions[i] = {
                        x: x - boxWidth / 2,
                        y: y - 30,
                        width: boxWidth,
                        height: boxHeight
                    };
                    
                    ctx.save();
                    
                    if (hoveredIndex === i) {
                        ctx.globalAlpha = hoverAnimation.opacity;
                        ctx.translate(x, y);
                        ctx.scale(hoverAnimation.scale, hoverAnimation.scale);
                        ctx.translate(-x, -y);
                    }
                    
                    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                    ctx.fillRect(x - boxWidth / 2, y - 30, boxWidth, boxHeight);
                    
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x - boxWidth / 2, y - 30, boxWidth, boxHeight);
                    
                    ctx.fillStyle = hoveredIndex === i ? "rgba(255, 255, 0, 1)" : "rgba(0, 255, 255, 1)";
                    ctx.shadowColor = hoveredIndex === i ? "yellow" : "cyan";
                    ctx.shadowBlur = 10;
                    ctx.textAlign = "center";
                    ctx.fillText(menuItems[i], x, y);
                    
                    ctx.restore();
                }
                
                // Draw social media section
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(0, canvas.height - 75, canvas.width, 75);
                
                // Draw Facebook and Instagram logos
                facebookX = 20;
                facebookY = canvas.height - logoSize - 20;
                ctx.globalAlpha = hoveredFacebook ? 0.5 : 1;
                if (gameAssets.facebookLogo && gameAssets.facebookLogo.complete) {
                    ctx.drawImage(gameAssets.facebookLogo, facebookX, facebookY, logoSize, logoSize);
                }
                ctx.globalAlpha = 1;
                
                instagramX = facebookX + logoSize + logoPadding;
                instagramY = canvas.height - logoSize - 20;
                ctx.globalAlpha = hoveredInstagram ? 0.5 : 1;
                if (gameAssets.instagramLogo && gameAssets.instagramLogo.complete) {
                    ctx.drawImage(gameAssets.instagramLogo, instagramX, instagramY, logoSize, logoSize);
                }
                ctx.globalAlpha = 1;
                
                privacyPolicyX = instagramX + logoSize + logoPadding;
                privacyPolicyY = canvas.height - 32;
                ctx.fillStyle = hoveredPrivacyPolicy ? "yellow" : "cyan";
                ctx.font = "20px Arial";
                ctx.fillText(privacyPolicyText, privacyPolicyX, privacyPolicyY);
                
                // Draw credits
                ctx.font = "15px Arial";
                ctx.textAlign = "right";
                ctx.fillStyle = "cyan";
                ctx.shadowColor = "blue";
                ctx.shadowBlur = 35;
                ctx.fillText(`Hope you had fun, ${playerName}!`, canvas.width - 20, canvas.height - 55);
                ctx.fillText("Thank you for playing my Game!", canvas.width - 20, canvas.height - 35);
                ctx.fillText("Created by RMZ", canvas.width - 20, canvas.height - 15);
                ctx.shadowBlur = 0;
                ctx.shadowColor = "transparent";
            }
            
            function drawSettingsMenu() {
                if (menuImage.complete && menuImage.naturalWidth !== 0) {
                    ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = "cyan";
                ctx.font = "60px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Settings", canvas.width / 2, canvas.height / 2 - 150);
                
                ctx.font = "30px Arial";
                ctx.fillText("1. Sound Volume: " + Math.round(menuMusic.volume * 100) + "%", canvas.width / 2, canvas.height / 2 - 50);
                ctx.fillText("2. Back to Main Menu", canvas.width / 2, canvas.height / 2);
                
                ctx.font = "20px Arial";
                ctx.fillText("Use Arrow Keys to adjust volume. Press Enter to go back.", canvas.width / 2, canvas.height / 2 + 100);
            }
            
            function drawHowToPlayScreen() {
                if (menuImage.complete && menuImage.naturalWidth !== 0) {
                    ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = "cyan";
                ctx.font = "60px Arial";
                ctx.textAlign = "center";
                ctx.fillText("How to Play", canvas.width / 2, canvas.height / 2 - 150);
                
                ctx.font = "20px Arial";
                ctx.textAlign = "left";
                const instructions = [
                    "1. Use Arrow Keys or WASD to move.",
                    "2. Press Space to jump.",
                    "3. Press F or J to shoot.",
                    "4. Avoid enemies and spikes.",
                    "5. Collect power-ups for shields.",
                    "6. Reach the highest score!"
                ];
                instructions.forEach((line, index) => {
                    ctx.fillText(line, canvas.width / 2 - 200, canvas.height / 2 - 50 + index * 30);
                });
                
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Press Enter to go back", canvas.width / 2, canvas.height / 2 + 150);
            }
            
            function drawScore() {
                ctx.font = "20px Arial";
                
                const scoreText = `${playerName} your current score is: ${player.score}`;
                const highScoreText = `Highest Score: ${highScore}`;
                const scoreWidth = ctx.measureText(scoreText).width;
                const highScoreWidth = ctx.measureText(highScoreText).width;
                const textHeight = 20;
                const paddingX = 8;
                const paddingY = 3;
                const boxHeight = textHeight + paddingY * 2 - 4;
                
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(10, 10, scoreWidth + paddingX * 2, boxHeight);
                ctx.fillRect(canvas.width - highScoreWidth - 20, 10, highScoreWidth + paddingX * 2, boxHeight);
                
                ctx.fillStyle = "white";
                ctx.fillText(scoreText, 20, 10 + textHeight - 3);
                
                ctx.fillStyle = "gold";
                ctx.fillText(highScoreText, canvas.width - highScoreWidth - 10, 10 + textHeight - 3);
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
                if (player.direction === -1) {
                    ctx.scale(-1, 1);
                    if (gameAssets.playerSpriteSheet && gameAssets.playerSpriteSheet.complete) {
                        ctx.drawImage(
                            gameAssets.playerSpriteSheet,
                            frame.x, frame.y, frame.width, frame.height,
                            -player.x + camera.x - player.width, player.y, player.width, player.height
                        );
                    }
                } else {
                    if (gameAssets.playerSpriteSheet && gameAssets.playerSpriteSheet.complete) {
                        ctx.drawImage(
                            gameAssets.playerSpriteSheet,
                            frame.x, frame.y, frame.width, frame.height,
                            player.x - camera.x, player.y, player.width, player.height
                        );
                    }
                }
                ctx.restore();
                
                if (player.isShieldActive) {
                    ctx.strokeStyle = "cyan";
                    ctx.lineWidth = 3;
                    ctx.shadowColor = "cyan";
                    ctx.shadowBlur = 10;
                    ctx.strokeRect(player.x - camera.x - 5, player.y - 5, player.width + 10, player.height + 10);
                    ctx.shadowBlur = 0;
                }
            }
            
            function render() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw background
                if (gameAssets.backgroundImage && gameAssets.backgroundImage.complete) {
                    const imageWidth = gameAssets.backgroundImage.width;
                    const imageHeight = gameAssets.backgroundImage.height;
                    const scale = canvas.height / imageHeight;
                    const scaledWidth = imageWidth * scale;
                    const numTiles = Math.ceil(canvas.width / scaledWidth) + 1;
                    const offset = (camera.x * 0.5) % scaledWidth;
                    
                    for (let i = -1; i < numTiles; i++) {
                        ctx.drawImage(
                            gameAssets.backgroundImage,
                            i * scaledWidth - offset,
                            0,
                            scaledWidth,
                            canvas.height
                        );
                    }
                } else {
                    // Fallback background
                    ctx.fillStyle = "#0a0a2a";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw stars
                    ctx.fillStyle = "white";
                    for (let i = 0; i < 100; i++) {
                        const x = (Math.random() * canvas.width + camera.x * 0.2) % canvas.width;
                        const y = Math.random() * canvas.height;
                        const size = Math.random() * 2 + 0.5;
                        ctx.beginPath();
                        ctx.arc(x, y, size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                
                // Draw game objects
                platforms.forEach(platform => platform.draw());
                enemies.forEach(enemy => enemy.draw());
                bullets.forEach(bullet => bullet.draw());
                enemyBullets.forEach(bullet => bullet.draw());
                shieldPowerUps.forEach(powerUp => powerUp.draw());
                drawPlayer();
                drawScore();
                
                if (gameOver) {
                    drawGameOverScreen();
                }
            }
            
            function update() {
                if (!gameOver) {
                    updateShield();
                    handleMovement();
                    generatePlatforms();
                    camera.update();
                    
                    // Update bullets
                    bullets.forEach((bullet, bulletIndex) => {
                        bullet.update();
                        
                        enemies.forEach((enemy, enemyIndex) => {
                            if (bullet.hitEnemy(enemy)) {
                                bullets.splice(bulletIndex, 1);
                                enemy.explode();
                                
                                if (enemy instanceof ShootingEnemy) {
                                    player.score += 5;
                                } else if (enemy instanceof NonShootingEnemy) {
                                    player.score += 3;
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
                            if (!player.isShieldActive) {
                                gameOver = true;
                                if (gameAssets.playerDeathSound) {
                                    gameAssets.playerDeathSound.currentTime = 0;
                                    gameAssets.playerDeathSound.play();
                                }
                                updateHighScore();
                            }
                        }
                    });
                    
                    // Update enemy bullets
                    enemyBullets.forEach((bullet, bulletIndex) => {
                        bullet.update();
                        
                        if (
                            bullet.x + bullet.width > player.x &&
                            bullet.x < player.x + player.width &&
                            bullet.y + bullet.height > player.y &&
                            bullet.y < player.y + player.height
                        ) {
                            if (!player.isShieldActive) {
                                gameOver = true;
                                if (gameAssets.playerDeathSound) {
                                    gameAssets.playerDeathSound.currentTime = 0;
                                    gameAssets.playerDeathSound.play();
                                }
                                updateHighScore();
                            }
                        }
                        
                        if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                            enemyBullets.splice(bulletIndex, 1);
                        }
                    });
                    
                    // Update shield power-ups
                    shieldPowerUps.forEach((powerUp, index) => {
                        if (powerUp.isCollected()) {
                            activateShield(powerUp.duration);
                            shieldPowerUps.splice(index, 1);
                            if (gameAssets.powerUpSound) {
                                gameAssets.powerUpSound.currentTime = 0;
                                gameAssets.powerUpSound.play();
                            }
                        }
                    });
                }
            }
            
            // ============================================
            // EVENT LISTENERS
            // ============================================
            
            // Mouse movement for menu
            canvas.addEventListener("mousemove", (e) => {
                if (gameState !== "menu") return;
                
                let rect = canvas.getBoundingClientRect();
                let mouseX = e.clientX - rect.left;
                let mouseY = e.clientY - rect.top;
                
                hoveredFacebook = false;
                hoveredInstagram = false;
                hoveredPrivacyPolicy = false;
                
                // Check Facebook logo
                if (facebookX && 
                    mouseX >= facebookX && 
                    mouseX <= facebookX + logoSize &&
                    mouseY >= facebookY && 
                    mouseY <= facebookY + logoSize) {
                    hoveredFacebook = true;
                }
                
                // Check Instagram logo
                if (instagramX && 
                    mouseX >= instagramX && 
                    mouseX <= instagramX + logoSize &&
                    mouseY >= instagramY && 
                    mouseY <= instagramY + logoSize) {
                    hoveredInstagram = true;
                }
                
                // Check Privacy Policy text
                if (privacyPolicyX && privacyPolicyY) {
                    const privacyPolicyTextWidth = ctx.measureText(privacyPolicyText).width;
                    if (mouseX >= privacyPolicyX && 
                        mouseX <= privacyPolicyX + privacyPolicyTextWidth &&
                        mouseY >= privacyPolicyY - 20 && 
                        mouseY <= privacyPolicyY) {
                        hoveredPrivacyPolicy = true;
                    }
                }
                
                hoveredIndex = -1;
                for (let i = 0; i < menuPositions.length; i++) {
                    let pos = menuPositions[i];
                    if (mouseX >= pos.x && 
                        mouseX <= pos.x + pos.width &&
                        mouseY >= pos.y && 
                        mouseY <= pos.y + pos.height) {
                        hoveredIndex = i;
                        break;
                    }
                }
            });
            
            // Mouse click handling
            canvas.addEventListener("click", (event) => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                
                // Check social media clicks
                if (facebookX && 
                    mouseX >= facebookX && 
                    mouseX <= facebookX + logoSize &&
                    mouseY >= facebookY && 
                    mouseY <= facebookY + logoSize) {
                    window.open("https://www.facebook.com/profile.php?id=61573991140874", "_blank");
                }
                
                if (instagramX && 
                    mouseX >= instagramX && 
                    mouseX <= instagramX + logoSize &&
                    mouseY >= instagramY && 
                    mouseY <= instagramY + logoSize) {
                    window.open("https://www.instagram.com/cyberninjaastronaut/", "_blank");
                }
                
                if (privacyPolicyX && privacyPolicyY) {
                    const privacyPolicyTextWidth = ctx.measureText(privacyPolicyText).width;
                    if (mouseX >= privacyPolicyX && 
                        mouseX <= privacyPolicyX + privacyPolicyTextWidth &&
                        mouseY >= privacyPolicyY - 20 && 
                        mouseY <= privacyPolicyY) {
                        window.open("https://www.yourwebsite.com/privacy-policy", "_blank");
                    }
                }
                
                // Game state click detection
                if (gameState === "menu") {
                    for (let i = 0; i < menuPositions.length; i++) {
                        const pos = menuPositions[i];
                        if (mouseX >= pos.x && 
                            mouseX <= pos.x + pos.width &&
                            mouseY >= pos.y && 
                            mouseY <= pos.y + pos.height) {
                            switch (i) {
                                case 0: // Start Game
                                    setGameState("playing");
                                    break;
                                case 1: // Settings
                                    settingsState = true;
                                    break;
                                case 2: // How to Play
                                    howToPlayState = true;
                                    break;
                                case 3: // Highest Score
                                    alert(`Your Highest Score is: ${highScore}`);
                                    break;
                            }
                            break;
                        }
                    }
                } else if (gameState === "gameOver") {
                    if (mouseX > canvas.width / 2 - 100 && mouseX < canvas.width / 2 + 100) {
                        if (mouseY > canvas.height / 2 + 80 && mouseY < canvas.height / 2 + 120) {
                            setGameState("playing");
                        } else if (mouseY > canvas.height / 2 + 120 && mouseY < canvas.height / 2 + 160) {
                            setGameState("menu");
                        }
                    }
                }
            });
            
            // Keyboard handling
            window.addEventListener('keydown', (event) => {
                if (gameState === "menu") {
                    if (settingsState) {
                        if (event.code === "ArrowUp") {
                            menuMusic.volume = Math.min(1, menuMusic.volume + 0.1);
                            if (gameAssets.gameMusic) {
                                gameAssets.gameMusic.volume = menuMusic.volume;
                            }
                        } else if (event.code === "ArrowDown") {
                            menuMusic.volume = Math.max(0, menuMusic.volume - 0.1);
                            if (gameAssets.gameMusic) {
                                gameAssets.gameMusic.volume = menuMusic.volume;
                            }
                        } else if (event.code === "Enter") {
                            settingsState = false;
                        }
                    } else if (howToPlayState) {
                        if (event.code === "Enter") {
                            howToPlayState = false;
                        }
                    }
                } else if (gameState === "gameOver") {
                    if (event.code === "KeyR") {
                        setGameState("playing");
                    } else if (event.code === "KeyM") {
                        setGameState("menu");
                    }
                }
            });
            
            // ============================================
            // GAME LOOP
            // ============================================
            
            function gameLoop() {
                if (gameState === "menu") {
                    if (hoveredIndex !== -1) {
                        hoverAnimation.opacity = Math.min(hoverAnimation.opacity + 0.05, 1);
                        hoverAnimation.scale = Math.min(hoverAnimation.scale + 0.01, 1.1);
                    } else {
                        hoverAnimation.opacity = Math.max(hoverAnimation.opacity - 0.05, 0.8);
                        hoverAnimation.scale = Math.max(hoverAnimation.scale - 0.01, 1);
                    }
                    
                    if (settingsState) {
                        drawSettingsMenu();
                    } else if (howToPlayState) {
                        drawHowToPlayScreen();
                    } else {
                        drawMainMenu();
                    }
                    playMenuMusic();
                } else if (gameState === "playing") {
                    update();
                    render();
                    playGameMusic();
                } else if (gameState === "gameOver") {
                    drawGameOverScreen();
                }
                
                requestAnimationFrame(gameLoop);
            }
            
            // Start the game loop
            setGameState("menu");
            gameLoop();
        }
    }
    
    // ============================================
    // WELCOME MODAL FUNCTIONS
    // ============================================
    
    function showWelcomeModal(name) {
        if (!welcomeModal || !welcomeMessage || !howToPlayMessage) return;
        
        welcomeMessage.textContent = `How are you doing, ${name}? Let's have some fun together and fight some aliens!`;
        howToPlayMessage.textContent = `
            How to Play:
            1. Use Arrow Keys or WASD to move.
            2. Press Space, W or Up key to jump.
            3. Press F or J to shoot.
            4. Avoid enemies and spikes.
            5. Collect power-ups for shields.
            6. Reach the highest score!
        `;
        howToPlayMessage.style.whiteSpace = "pre-line";
        welcomeModal.style.display = "flex";
    }
    
    function hideWelcomeModal() {
        if (welcomeModal) {
            welcomeModal.style.display = "none";
        }
    }
    
    if (startGameButton) {
        startGameButton.addEventListener("click", hideWelcomeModal);
    }
});
