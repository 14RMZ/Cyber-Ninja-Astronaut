document.addEventListener("DOMContentLoaded", () => {
    // Get modal elements for the welcome screen
    const welcomeModal = document.getElementById("welcomeModal");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const howToPlayMessage = document.getElementById("howToPlayMessage");
    const startGameButton = document.getElementById("startGameButton");

    // Check if modal elements exist
    if (!welcomeModal || !welcomeMessage || !howToPlayMessage || !startGameButton) {
        return; // Exit if any modal element is missing
    }

    // Get or prompt for the player's name
    let playerName = localStorage.getItem("playerName"); // Retrieve player name from localStorage
    if (!playerName) {
        playerName = prompt("Hello! What is your name?"); // Prompt for player name if not set
        if (playerName) {
            // Capitalize the first letter of the player's name
            playerName = playerName.charAt(0).toUpperCase() + playerName.slice(1).toLowerCase();
            localStorage.setItem("playerName", playerName); // Save the name to localStorage
        } else {
            playerName = "Player"; // Default name if the user cancels the prompt
        }
    }

    // Initialize high score from localStorage or set to 0
    let highScore = localStorage.getItem("highScore") || 0;
    highScore = parseInt(highScore); // Ensure highScore is a number

    // Check if the player is new (highScore is 0 or doesn't exist)
    const isNewPlayer = highScore === 0;

    // Show the "How to Play" message only for new players
    if (isNewPlayer) {
        showWelcomeModal(playerName); // Display the welcome modal
    }

    // Function to show the welcome modal
    function showWelcomeModal(name) {
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
        howToPlayMessage.style.whiteSpace = "pre-line"; // Preserve newlines in the text
        welcomeModal.style.display = "flex"; // Show the modal
    }

    // Function to hide the welcome modal
    function hideWelcomeModal() {
        welcomeModal.style.display = "none"; // Hide the modal
    }

    // STAGE 1: Initial minimal load - just show a start screen
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Function to resize the canvas to fit the window
    function resizeCanvas() {
        canvas.width = window.innerWidth; // Set canvas width to window width
        canvas.height = window.innerHeight; // Set canvas height to window height
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial resize

    // Game state variables
    let gameState = "loading"; // New initial state: "loading", "menu", "playing", "gameOver"
    let settingsState = false;
    let howToPlayState = false;
    let currentGameOverMessage = "";
    let loadingProgress = 0;
    let totalAssetsToLoad = 0;
    let loadedAssets = 0;
    let assetsLoaded = false;

    // Animation variables for the start button
    let buttonPulse = 0;
    let buttonPulseDirection = 1;
    let buttonGlow = 0;
    let buttonGlowDirection = 1;
    let buttonScale = 1;
    let buttonScaleDirection = 1;
    let buttonYOffset = 0;

    // Player object (initialize with defaults, will be used later)
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

    // Game over messages (kept for later use)
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

    // Function to get a random game over message
    function getRandomGameOverMessage() {
        const randomIndex = Math.floor(Math.random() * gameOverMessages.length);
        return gameOverMessages[randomIndex].replace("${playerName}", playerName);
    }

    // STAGE 2: Game assets (will be loaded on demand)
    let backgroundImage, playerSpriteSheet, nonShootingEnemySpriteSheet, shootingEnemySpriteSheet;
    let platformImage, movingPlatformImage, spikeImage, facebookLogo, instagramLogo;
    let gameMusic, jumpSound, shootSound, fallSound, spikeDeathSound, playerDeathSound;
    let enemyShootSound, enemyDeathSound, powerUpSound, newHighScoreSound;
    let playerAnimations, nonShootingEnemyAnimations, shootingEnemyAnimations;
    let currentAnimation, isDying, isJumping, isJumpStarting, isJumpLanding;
    let camera, platforms, enemies, bullets, enemyBullets, shieldPowerUps;
    let keys = {};
    let gameOver = false;
    let menuItems = ["Start Game", "Settings", "How To Play", "Highest Score"];
    let menuPositions = [];
    let hoveredIndex = -1;
    let hoverAnimation = { opacity: 1, scale: 1 };
    let hoveredFacebook = false, hoveredInstagram = false, hoveredPrivacyPolicy = false;
    let facebookX, facebookY, instagramX, instagramY, privacyPolicyX, privacyPolicyY;
    let logoSize = 40;
    let logoPadding = 20;
    let privacyPolicyText = "How We Use Your Info & Privacy";

    // Audio variables - FIXED: Create menuMusic immediately
    let menuMusic = null;
    let menuImage = null;
    let isMenuMusicLoaded = false;
    let isMenuImageLoaded = false;
    let currentMusic = null; // Track which music is currently playing
    let audioContextInitialized = false; // Track if audio context is initialized
    let hasUserInteracted = false; // Track if user has interacted for audio

    // Define all classes at the top to avoid reference errors
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
            const platformImg = this.isMoving ? movingPlatformImage : platformImage;
            if (platformImg && platformImg.complete && platformImg.naturalWidth !== 0) {
                ctx.drawImage(
                    platformImg,
                    this.x - camera.x, this.y, this.width, this.height
                );
            } else {
                ctx.fillStyle = this.isMoving ? "purple" : "#654321";
                ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
            }

            if (this.hasSpikes && spikeImage && spikeImage.complete && spikeImage.naturalWidth !== 0) {
                for (let i = 0; i < this.spikeWidth; i += 20) {
                    ctx.drawImage(
                        spikeImage,
                        this.spikeX + i - camera.x, this.y - 15, 20, 15
                    );
                }
            }
        }
    }

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

    // Function to initialize audio with user interaction
    function initializeAudio() {
        // Create a simple function that will be called on user interaction
        function startAudioOnInteraction() {
            if (!hasUserInteracted) {
                hasUserInteracted = true;
                console.log("User interacted, audio can now play");
                
                // Create menu music on first interaction
                if (!menuMusic) {
                    createMenuMusic();
                } else {
                    // Try to play if already created
                    tryPlayMenuMusic();
                }
            }
        }

        // Add event listeners for user interaction
        document.addEventListener('click', startAudioOnInteraction);
        document.addEventListener('keydown', startAudioOnInteraction);
        document.addEventListener('touchstart', startAudioOnInteraction);
        
        // Also trigger on welcome modal close
        startGameButton.addEventListener('click', startAudioOnInteraction);
    }

    // Function to create menu music
    function createMenuMusic() {
        menuMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuSound.wav");
        menuMusic.loop = true;
        menuMusic.volume = 0.3;
        menuMusic.preload = "auto";
        
        menuMusic.addEventListener('canplaythrough', function() {
            isMenuMusicLoaded = true;
            console.log("Menu music loaded and ready");
            // Try to play if user has already interacted
            if (hasUserInteracted) {
                tryPlayMenuMusic();
            }
        });
        
        menuMusic.addEventListener('error', function(e) {
            console.error("Error loading menu music:", e);
            isMenuMusicLoaded = false;
        });
        
        // Load the audio
        menuMusic.load();
    }

    // Function to try playing menu music
    function tryPlayMenuMusic() {
        if (menuMusic && isMenuMusicLoaded && hasUserInteracted) {
            try {
                menuMusic.currentTime = 0;
                const playPromise = menuMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log("Menu music started playing");
                        currentMusic = menuMusic;
                    }).catch(error => {
                        console.log("Menu music play was prevented:", error.name);
                        // Retry after a short delay
                        setTimeout(() => {
                            if (gameState === "menu") {
                                tryPlayMenuMusic();
                            }
                        }, 1000);
                    });
                }
            } catch (error) {
                console.log("Error playing menu music:", error);
            }
        }
    }

    // Initialize audio system
    initializeAudio();

    // Function to safely play audio
    function playSound(audioElement) {
        if (!audioElement) return;
        
        try {
            // Reset to start and play
            audioElement.currentTime = 0;
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Don't show error to user
                    console.log("Audio play failed:", error.name);
                });
            }
        } catch (error) {
            console.log("Error playing sound:", error);
        }
    }

    // Function to load initial menu assets
    function loadInitialMenuAssets() {
        // Load menu image
        menuImage = new Image();
        menuImage.onload = function() {
            isMenuImageLoaded = true;
        };
        menuImage.onerror = function() {
            isMenuImageLoaded = false;
        };
        menuImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuBackground.webp";
    }

    // Call this function immediately to start loading menu assets
    loadInitialMenuAssets();

    // Function to update button animations
    function updateButtonAnimations() {
        // Pulse animation (size)
        buttonPulse += 0.02 * buttonPulseDirection;
        if (buttonPulse >= 1 || buttonPulse <= 0) {
            buttonPulseDirection *= -1;
        }
        
        // Glow animation (opacity)
        buttonGlow += 0.03 * buttonGlowDirection;
        if (buttonGlow >= 1 || buttonGlow <= 0.3) {
            buttonGlowDirection *= -1;
        }
        
        // Scale animation
        buttonScale += 0.002 * buttonScaleDirection;
        if (buttonScale >= 1.05 || buttonScale <= 0.95) {
            buttonScaleDirection *= -1;
        }
        
        // Floating animation
        buttonYOffset = Math.sin(Date.now() / 500) * 5;
    }

    // Function to draw the initial loading/start screen
    function drawStartScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw menu background if loaded
        if (isMenuImageLoaded && menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw dark overlay for better contrast
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw title with glowing effect
        ctx.fillStyle = "cyan";
        ctx.font = "bold 70px Arial";
        ctx.shadowColor = "blue";
        ctx.shadowBlur = 30;
        ctx.textAlign = "center";
        ctx.fillText("CYBER NINJA ASTRONAUT", canvas.width / 2, canvas.height / 2 - 150);
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";

        // Draw subtitle
        ctx.fillStyle = "#00ffff";
        ctx.font = "30px Arial";
        ctx.fillText("Ready for Adventure?", canvas.width / 2, canvas.height / 2 - 70);

        // Update button animations
        updateButtonAnimations();

        // Draw animated start button
        const buttonWidth = 400;
        const buttonHeight = 80;
        const buttonX = canvas.width / 2 - buttonWidth / 2;
        const buttonY = canvas.height / 2 + buttonYOffset; // Add floating effect

        // Save canvas state for transformations
        ctx.save();
        
        // Apply scale transformation at the button's center
        ctx.translate(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        ctx.scale(buttonScale, buttonScale);
        ctx.translate(-(buttonX + buttonWidth / 2), -(buttonY + buttonHeight / 2));

        // Draw button background with gradient
        const gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
        gradient.addColorStop(0, "rgba(0, 150, 255, 0.8)");
        gradient.addColorStop(1, "rgba(0, 50, 150, 0.8)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 20);
        ctx.fill();

        // Draw button border with animated glow
        ctx.strokeStyle = `rgba(0, 255, 255, ${buttonGlow})`;
        ctx.lineWidth = 4 + (buttonPulse * 2); // Pulsing border
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 20);
        ctx.stroke();

        // Draw outer glow effect
        ctx.shadowColor = "cyan";
        ctx.shadowBlur = 20 + (buttonPulse * 10);
        ctx.strokeStyle = `rgba(0, 255, 255, ${buttonGlow * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(buttonX - 5, buttonY - 5, buttonWidth + 10, buttonHeight + 10, 25);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw button text with glow effect
        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.shadowColor = "blue";
        ctx.shadowBlur = 15;
        ctx.textAlign = "center";
        ctx.fillText("PRESS ENTER TO START GAME", canvas.width / 2, buttonY + buttonHeight / 2 + 15);
        
        ctx.shadowBlur = 0;
        ctx.restore();

        // Draw instruction text below button
        ctx.fillStyle = "yellow";
        ctx.font = "20px Arial";
        ctx.fillText("Press Enter or click the button to begin", canvas.width / 2, buttonY + buttonHeight + 40);

        // Draw loading indicator (small)
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(canvas.width / 2 - 100, buttonY + buttonHeight + 70, 200, 10);
        
        const menuLoadProgress = isMenuImageLoaded ? 1 : 0.5;
        ctx.fillStyle = "cyan";
        ctx.fillRect(canvas.width / 2 - 100, buttonY + buttonHeight + 70, 200 * menuLoadProgress, 10);

        // Draw game info
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game by RMZ", canvas.width / 2, canvas.height - 50);
        ctx.fillText(`Welcome, ${playerName}!`, canvas.width / 2, canvas.height - 25);
    }

    // Function to draw the loading screen
    function drawLoadingScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw loading title with animation
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.font = "bold 60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("LOADING GAME...", canvas.width / 2, canvas.height / 2 - 100);

        // Draw animated loading dots
        const dotSize = 10;
        const dotSpacing = 30;
        const baseX = canvas.width / 2 - dotSpacing;
        const dotY = canvas.height / 2 - 30;
        
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(Date.now() / 300 + i * 1) * 5;
            const alpha = 0.3 + Math.abs(Math.sin(Date.now() / 300 + i * 1)) * 0.7;
            
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(baseX + i * dotSpacing, dotY + offset, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw progress bar background
        const barWidth = 400;
        const barHeight = 30;
        const barX = canvas.width / 2 - barWidth / 2;
        const barY = canvas.height / 2;

        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 15);
        ctx.fill();

        // Draw animated progress bar fill
        const progressWidth = (loadingProgress / 100) * barWidth;
        const gradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
        gradient.addColorStop(0, "#00ffff");
        gradient.addColorStop(1, "#0088ff");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(barX, barY, progressWidth, barHeight, 15);
        ctx.fill();

        // Draw progress bar border with glow
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 15);
        ctx.stroke();

        // Draw percentage text with animation
        const textPulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${textPulse})`;
        ctx.font = "bold 25px Arial";
        ctx.fillText(`${Math.round(loadingProgress)}%`, canvas.width / 2, barY + barHeight + 30);

        // Draw loading assets count
        ctx.font = "18px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillText(`Loading assets: ${loadedAssets}/${totalAssetsToLoad}`, canvas.width / 2, barY + barHeight + 60);

        // Draw loading message with changing text
        const messages = [
            "Preparing cyber-ninja gear...",
            "Calibrating alien detection...",
            "Loading power-ups...",
            "Initializing shield systems...",
            "Almost ready for battle..."
        ];
        const messageIndex = Math.floor((Date.now() / 2000) % messages.length);
        
        ctx.font = "20px Arial";
        ctx.fillStyle = "yellow";
        ctx.fillText(messages[messageIndex], canvas.width / 2, barY + barHeight + 100);

        // Draw spinning loader icon
        const loaderX = canvas.width / 2;
        const loaderY = barY + barHeight + 150;
        const loaderRadius = 20;
        const loaderAngle = (Date.now() / 20) % 360;
        
        ctx.save();
        ctx.translate(loaderX, loaderY);
        ctx.rotate(loaderAngle * Math.PI / 180);
        
        for (let i = 0; i < 8; i++) {
            const angle = (i * 45) * Math.PI / 180;
            const x = Math.cos(angle) * loaderRadius;
            const y = Math.sin(angle) * loaderRadius;
            const alpha = 0.1 + (i / 8) * 0.9;
            
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Function to update loading progress
    function updateLoadingProgress() {
        if (totalAssetsToLoad > 0) {
            loadingProgress = (loadedAssets / totalAssetsToLoad) * 100;
        }
    }

    // Function to load all game assets (Stage 2)
    function loadGameAssets() {
        // Count total assets to load
        totalAssetsToLoad = 17; // Total number of assets to load
        loadedAssets = 0;
        loadingProgress = 0;

        // Load images
        backgroundImage = new Image();
        backgroundImage.src = "GameBackground.jpg";
        backgroundImage.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        backgroundImage.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        playerSpriteSheet = new Image();
        playerSpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/NewPlayermovement.png";
        playerSpriteSheet.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        playerSpriteSheet.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        nonShootingEnemySpriteSheet = new Image();
        nonShootingEnemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AlienRoboticEnemyMovement.png";
        nonShootingEnemySpriteSheet.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        nonShootingEnemySpriteSheet.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        shootingEnemySpriteSheet = new Image();
        shootingEnemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AIDroneEnemyMovement.png";
        shootingEnemySpriteSheet.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        shootingEnemySpriteSheet.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        platformImage = new Image();
        platformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/platform.jpg";
        platformImage.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        platformImage.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        movingPlatformImage = new Image();
        movingPlatformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/moving-platform.jpg";
        movingPlatformImage.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        movingPlatformImage.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        spikeImage = new Image();
        spikeImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/testingspike.png";
        spikeImage.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        spikeImage.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        facebookLogo = new Image();
        facebookLogo.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/facebook.png";
        facebookLogo.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        facebookLogo.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        instagramLogo = new Image();
        instagramLogo.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/instagram.png";
        instagramLogo.onload = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        instagramLogo.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        // Load audio files - simplified approach
        gameMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playingthegamesound.wav");
        gameMusic.loop = true;
        gameMusic.volume = 0.3;
        gameMusic.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        gameMusic.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        jumpSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/jumping_sound.wav");
        jumpSound.volume = 0.3;
        jumpSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        jumpSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        shootSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playershooting.mp3");
        shootSound.volume = 0.3;
        shootSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        shootSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        fallSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerfallingdown.mp3");
        fallSound.volume = 0.5;
        fallSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        fallSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        spikeDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerkilledbyspikes.wav");
        spikeDeathSound.volume = 0.5;
        spikeDeathSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        spikeDeathSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        playerDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playergetsshootbyenemy.mp3");
        playerDeathSound.volume = 0.3;
        playerDeathSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        playerDeathSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        enemyShootSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Droneshooting.mp3");
        enemyShootSound.volume = 0.3;
        enemyShootSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        enemyShootSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        enemyDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Enemydying.wav");
        enemyDeathSound.volume = 0.3;
        enemyDeathSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        enemyDeathSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        powerUpSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/playerpowerup.wav");
        powerUpSound.volume = 0.3;
        powerUpSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        powerUpSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };

        newHighScoreSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/highscore.wav");
        newHighScoreSound.volume = 0.3;
        newHighScoreSound.oncanplaythrough = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
        newHighScoreSound.onerror = () => {
            loadedAssets++;
            updateLoadingProgress();
        };
    }

    // Function to initialize game systems after assets are loaded
    function initializeGameSystems() {
        // Initialize animations instances
        playerAnimations = {
            idle: new Animation([{ x: 0, y: 0, width: 32, height: 48 }], 1),
            walk: new Animation([{ x: 32, y: 0, width: 32, height: 48 }, { x: 64, y: 0, width: 32, height: 48 }], 10),
            jumpStart: new Animation([{ x: 96, y: 0, width: 32, height: 48 }], 1),
            jump: new Animation([{ x: 128, y: 0, width: 32, height: 48 }], 1),
            jumpLand: new Animation([{ x: 160, y: 0, width: 32, height: 48 }], 1),
            dieLie: new Animation([{ x: 224, y: 0, width: 32, height: 48 }], 1)
        };

        nonShootingEnemyAnimations = {
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

        shootingEnemyAnimations = {
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

        currentAnimation = playerAnimations.idle;
        isDying = false;
        isJumping = false;
        isJumpStarting = false;
        isJumpLanding = false;

        // Initialize camera
        camera = {
            x: 0,
            update: function() {
                this.x = player.x - canvas.width / 3;
                if (this.x < 0) this.x = 0;
            }
        };

        // Initialize game arrays with the Platform class (now defined at top)
        platforms = [new Platform(50, canvas.height - 100, 200, 20)];
        enemies = [];
        bullets = [];
        enemyBullets = [];
        shieldPowerUps = [];

        // Define enemy classes that depend on loaded assets
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
                        nonShootingEnemySpriteSheet,
                        frame.x, frame.y, frame.width, frame.height,
                        -this.x + camera.x - frame.width, this.y, frame.width, frame.height
                    );
                } else {
                    ctx.drawImage(
                        nonShootingEnemySpriteSheet,
                        frame.x, frame.y, frame.width, frame.height,
                        this.x - camera.x, this.y, frame.width, frame.height
                    );
                }
                ctx.restore();
            }

            explode() {
                this.isExploding = true;
                this.currentAnimation = nonShootingEnemyAnimations.explode;
                playSound(enemyDeathSound);
            }
        }

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
                const direction = player.x > this.x ? 1 : -1;
                const bulletX = this.x + this.width / 2;
                const bulletY = this.y + this.height / 2;
                enemyBullets.push(new EnemyBullet(bulletX, bulletY, direction));
                playSound(enemyShootSound);
            }

            explode() {
                this.isExploding = true;
                this.currentAnimation = shootingEnemyAnimations.explode;
                playSound(enemyDeathSound);
            }
        }

        // Store enemy classes globally so they can be used elsewhere
        window.NonShootingEnemy = NonShootingEnemy;
        window.ShootingEnemy = ShootingEnemy;

        // Mark assets as loaded
        assetsLoaded = true;
        gameState = "menu";
        player.y = canvas.height - 150;
        
        // Start menu music if available
        playMenuMusic();
    }

    // Function to set the game state - FIXED: Added proper music handling
    function setGameState(newState) {
        // Handle music transition BEFORE changing state
        if (newState === "menu") {
            // Coming back to menu - stop game music, play menu music
            if (gameMusic && !gameMusic.paused) {
                gameMusic.pause();
                gameMusic.currentTime = 0;
            }
            playMenuMusic();
        } else if (newState === "playing") {
            // Starting game - stop menu music, play game music
            resetGame();
        } else if (newState === "gameOver") {
            currentGameOverMessage = getRandomGameOverMessage();
            // Stop all music for game over
            if (gameMusic && !gameMusic.paused) {
                gameMusic.pause();
                gameMusic.currentTime = 0;
            }
            if (menuMusic && !menuMusic.paused) {
                menuMusic.pause();
                menuMusic.currentTime = 0;
            }
        }
        
        // Set the new state
        gameState = newState;
    }

    // Music control functions
    function playMenuMusic() {
        // Stop game music if playing
        if (gameMusic && !gameMusic.paused) {
            gameMusic.pause();
            gameMusic.currentTime = 0;
        }
        
        // Play menu music if available
        if (menuMusic && isMenuMusicLoaded) {
            currentMusic = menuMusic;
            // Try to play menu music
            tryPlayMenuMusic();
        } else if (!menuMusic && hasUserInteracted) {
            // Create menu music if not created yet
            createMenuMusic();
        }
    }

    function playGameMusic() {
        // Stop menu music if playing
        if (menuMusic && !menuMusic.paused) {
            menuMusic.pause();
            menuMusic.currentTime = 0;
        }
        
        // Play game music if available
        if (gameMusic) {
            currentMusic = gameMusic;
            gameMusic.currentTime = 0;
            playSound(gameMusic);
        }
    }

    function stopAllMusic() {
        if (menuMusic) {
            menuMusic.pause();
            menuMusic.currentTime = 0;
        }
        if (gameMusic) {
            gameMusic.pause();
            gameMusic.currentTime = 0;
        }
        currentMusic = null;
    }

    // Function to generate new platforms
    function generatePlatforms() {
        if (!platforms || platforms.length === 0) return;
        
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
                enemies.push(new window.NonShootingEnemy(platform));
            }

            if (hasShootingEnemy) {
                enemies.push(new window.ShootingEnemy(platform));
            }

            if (hasShieldPowerUp) {
                shieldPowerUps.push(new ShieldPowerUp(x + platform.width / 2, y - 30));
            }
        }
    }

    // Track key presses
    window.addEventListener('keydown', (event) => {
        keys[event.code] = true;
        
        // Handle Enter key press on start screen
        if (gameState === "loading" && event.code === "Enter") {
            startLoadingGameAssets();
        }
        
        if (gameState === "gameOver" || gameState === "playing") {
            if (event.code === "KeyR" && gameOver) {
                setGameState("playing");
            }
            if (event.code === "KeyM" && gameOver) {
                setGameState("menu");
            }
            if ((event.code === "KeyF" || event.code === "KeyJ") && bullets) {
                bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, player.direction));
                playSound(shootSound);
            }
        }
        
        // FIX: Added Enter key support for menu navigation
        if (gameState === "menu" && event.code === "Enter") {
            if (settingsState) {
                settingsState = false;
            } else if (howToPlayState) {
                howToPlayState = false;
            }
        }
    });

    window.addEventListener('keyup', (event) => keys[event.code] = false);

    // Function to start loading game assets
    function startLoadingGameAssets() {
        // Start loading game assets
        gameState = "loadingAssets";
        loadGameAssets();
        
        // Check loading progress periodically
        const checkLoading = setInterval(() => {
            if (loadedAssets === totalAssetsToLoad) {
                clearInterval(checkLoading);
                initializeGameSystems();
            }
        }, 100);
    }

    // Function to handle player movement
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
                        playSound(spikeDeathSound);
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
            playSound(jumpSound);
        }

        if (player.y > canvas.height) {
            gameOver = true;
            setGameState("gameOver");
            playSound(fallSound);
            updateHighScore();
        }
    }

    // Function to update the high score
    function updateHighScore() {
        if (player.score > highScore) {
            highScore = player.score;
            localStorage.setItem("highScore", highScore);
            playSound(newHighScoreSound);
        }
    }

    // Function to activate the shield
    function activateShield(duration) {
        player.isShieldActive = true;
        player.shieldTimer = duration * 60;
    }

    // Function to update the shield timer
    function updateShield() {
        if (player.isShieldActive) {
            player.shieldTimer--;
            if (player.shieldTimer <= 0) {
                player.isShieldActive = false;
            }
        }
    }

    // Function to reset the game
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

        playGameMusic();
    }

    // Function to draw the game over screen
    function drawGameOverScreen() {
        if (isMenuImageLoaded && menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 150);

        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(`${playerName}, your score is: ${player.score}`, canvas.width / 2, canvas.height / 2 - 50);

        ctx.fillStyle = "gold";
        ctx.font = "30px Arial";
        ctx.fillText(`Your High Score: ${highScore}`, canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "cyan";
        ctx.font = "25px Arial";
        ctx.textAlign = "center";
        ctx.fillText(currentGameOverMessage, canvas.width / 2, canvas.height / 2 + 50);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 140);
        ctx.fillText("Press M to Return to Menu", canvas.width / 2, canvas.height / 2 + 180);
    }

    // Function to draw the main menu
    function drawMainMenu() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        if (isMenuImageLoaded && menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    
        ctx.fillStyle = "cyan";
        ctx.font = "bold 80px Arial";
        ctx.shadowColor = "blue";
        ctx.shadowBlur = 50;
        ctx.textAlign = "left";
        ctx.fillText("Cyber Ninja Astronaut", 100, 80);
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
    
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
    
        // Draw the credits background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, canvas.height - 75, canvas.width, 75);
    
        // Draw Facebook and Instagram logos
        facebookX = 20;
        facebookY = canvas.height - logoSize - 20;
        ctx.globalAlpha = hoveredFacebook ? 0.5 : 1;
        if (facebookLogo) ctx.drawImage(facebookLogo, facebookX, facebookY, logoSize, logoSize);
        ctx.globalAlpha = 1;
    
        instagramX = facebookX + logoSize + logoPadding;
        instagramY = canvas.height - logoSize - 20;
        ctx.globalAlpha = hoveredInstagram ? 0.5 : 1;
        if (instagramLogo) ctx.drawImage(instagramLogo, instagramX, instagramY, logoSize, logoSize);
        ctx.globalAlpha = 1;
    
        privacyPolicyX = instagramX + logoSize + logoPadding;
        privacyPolicyY = canvas.height - 32;
        ctx.fillStyle = hoveredPrivacyPolicy ? "yellow" : "cyan";
        ctx.font = "20px Arial";
        ctx.fillText(privacyPolicyText, privacyPolicyX, privacyPolicyY);
    
        // Draw credits text
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

    // Event listener for mouse movement on the canvas
    canvas.addEventListener("mousemove", (e) => {
        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;
    
        // Reset hover states for links
        hoveredFacebook = false;
        hoveredInstagram = false;
        hoveredPrivacyPolicy = false;
    
        // Check if mouse is over Facebook logo
        if (facebookLogo &&
            mouseX >= facebookX &&
            mouseX <= facebookX + logoSize &&
            mouseY >= facebookY &&
            mouseY <= facebookY + logoSize
        ) {
            hoveredFacebook = true;
        }
    
        // Check if mouse is over Instagram logo
        if (instagramLogo &&
            mouseX >= instagramX &&
            mouseX <= instagramX + logoSize &&
            mouseY >= instagramY &&
            mouseY <= instagramY + logoSize
        ) {
            hoveredInstagram = true;
        }
    
        // Check if mouse is over Privacy Policy text
        const privacyPolicyTextWidth = ctx.measureText(privacyPolicyText).width;
        if (
            mouseX >= privacyPolicyX &&
            mouseX <= privacyPolicyX + privacyPolicyTextWidth &&
            mouseY >= privacyPolicyY - 20 &&
            mouseY <= privacyPolicyY
        ) {
            hoveredPrivacyPolicy = true;
        }
    
        // Existing hover logic for menu items
        hoveredIndex = -1;
        for (let i = 0; i < menuPositions.length; i++) {
            let pos = menuPositions[i];
            if (
                mouseX >= pos.x &&
                mouseX <= pos.x + pos.width &&
                mouseY >= pos.y &&
                mouseY <= pos.y + pos.height
            ) {
                hoveredIndex = i;
                break;
            }
        }
    });
    
    canvas.addEventListener("click", (e) => {
        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        // Handle click on start screen button
        if (gameState === "loading") {
            const buttonWidth = 400;
            const buttonHeight = 80;
            const buttonX = canvas.width / 2 - buttonWidth / 2;
            const buttonY = canvas.height / 2;
            
            if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
                mouseY >= buttonY - 20 && mouseY <= buttonY + buttonHeight + 20) {
                startLoadingGameAssets();
            }
            return;
        }
    
        // Check if Facebook logo is clicked
        if (facebookLogo &&
            mouseX >= facebookX &&
            mouseX <= facebookX + logoSize &&
            mouseY >= facebookY &&
            mouseY <= facebookY + logoSize
        ) {
            window.open("https://www.facebook.com/profile.php?id=61573991140874", "_blank");
        }
    
        // Check if Instagram logo is clicked
        if (instagramLogo &&
            mouseX >= instagramX &&
            mouseX <= instagramX + logoSize &&
            mouseY >= instagramY &&
            mouseY <= instagramY + logoSize
        ) {
            window.open("https://www.instagram.com/cyberninjaastronaut/", "_blank");
        }
    
        // Check if Privacy Policy text is clicked
        const privacyPolicyTextWidth = ctx.measureText(privacyPolicyText).width;
        if (
            mouseX >= privacyPolicyX &&
            mouseX <= privacyPolicyX + privacyPolicyTextWidth &&
            mouseY >= privacyPolicyY - 20 &&
            mouseY <= privacyPolicyY
        ) {
            window.open("https://www.yourwebsite.com/privacy-policy", "_blank");
        }
        
        // FIX: Added click handler for menu items to properly handle menu navigation
        if (gameState === "menu" && !settingsState && !howToPlayState) {
            for (let i = 0; i < menuPositions.length; i++) {
                const pos = menuPositions[i];
                if (mouseX >= pos.x && mouseX <= pos.x + pos.width &&
                    mouseY >= pos.y && mouseY <= pos.y + pos.height) {
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
        }
    });

    // Function to draw the settings menu
    function drawSettingsMenu() {
        if (isMenuImageLoaded && menuImage.complete && menuImage.naturalWidth !== 0) {
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
        const volume = menuMusic ? Math.round(menuMusic.volume * 100) : 30;
        ctx.fillText("1. Sound Volume: " + volume + "%", canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText("2. Back to Main Menu", canvas.width / 2, canvas.height / 2);

        ctx.font = "20px Arial";
        ctx.fillText("Use Arrow Keys to adjust volume. Press Enter to go back.", canvas.width / 2, canvas.height / 2 + 100);
    }

    // Function to draw the "How to Play" screen
    function drawHowToPlayScreen() {
        if (isMenuImageLoaded && menuImage.complete && menuImage.naturalWidth !== 0) {
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

    // Function to update game logic
    function update() {
        if (!gameOver && assetsLoaded) {
            updateShield();
            handleMovement();
            generatePlatforms();
            camera.update();
    
            // Update player bullets
            bullets.forEach((bullet, bulletIndex) => {
                bullet.update();
    
                // Check for collisions with enemies
                enemies.forEach((enemy, enemyIndex) => {
                    if (bullet.hitEnemy(enemy)) {
                        bullets.splice(bulletIndex, 1);
                        enemy.explode();
    
                        // Update score based on enemy type
                        if (enemy instanceof window.ShootingEnemy) {
                            player.score += 5;
                        } else if (enemy instanceof window.NonShootingEnemy) {
                            player.score += 3;
                        }
                    }
                });
    
                // Remove bullets that go off-screen
                if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                    bullets.splice(bulletIndex, 1);
                }
            });
    
            // Update enemies
            enemies.forEach(enemy => {
                enemy.update();
    
                // Check for collisions with the player
                if (
                    player.x + player.width > enemy.x &&
                    player.x < enemy.x + enemy.width &&
                    player.y + player.height > enemy.y &&
                    player.y < enemy.y + enemy.height
                ) {
                    if (!player.isShieldActive) {
                        gameOver = true;
                        playSound(playerDeathSound);
                        updateHighScore();
                    }
                }
            });
    
            // Update enemy bullets
            enemyBullets.forEach((bullet, bulletIndex) => {
                bullet.update();
    
                // Check for collisions with the player
                if (
                    bullet.x + bullet.width > player.x &&
                    bullet.x < player.x + player.width &&
                    bullet.y + bullet.height > player.y &&
                    bullet.y < player.y + player.height
                ) {
                    if (!player.isShieldActive) {
                        gameOver = true;
                        playSound(playerDeathSound);
                        updateHighScore();
                    }
                }
    
                // Remove enemy bullets that go off-screen
                if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                    enemyBullets.splice(bulletIndex, 1);
                }
            });
    
            // Update shield power-ups
            shieldPowerUps.forEach((powerUp, index) => {
                if (powerUp.isCollected()) {
                    activateShield(powerUp.duration);
                    shieldPowerUps.splice(index, 1);
                    playSound(powerUpSound);
                }
            });
        }
    }

    // Function to draw the player's score
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

    // Function to draw the player
    function drawPlayer() {
        if (!assetsLoaded) return;
        
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
            ctx.drawImage(
                playerSpriteSheet,
                frame.x, frame.y, frame.width, frame.height,
                -player.x + camera.x - player.width, player.y, player.width, player.height
            );
        } else {
            ctx.drawImage(
                playerSpriteSheet,
                frame.x, frame.y, frame.width, frame.height,
                player.x - camera.x, player.y, player.width, player.height
            );
        }
        ctx.restore();

        if (player.isShieldActive) {
            ctx.strokeStyle = "cyan";
            ctx.lineWidth = 3;
            ctx.strokeRect(player.x - camera.x - 5, player.y - 5, player.width + 10, player.height + 10);
        }
    }

    // Function to render the game
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Draw the background
        if (backgroundImage && backgroundImage.complete) {
            const imageWidth = backgroundImage.width;
            const imageHeight = backgroundImage.height;
            const scale = canvas.height / imageHeight;
            const scaledWidth = imageWidth * scale;
            const numTiles = Math.ceil(canvas.width / scaledWidth) + 1;
            const offset = (camera.x * 0.5) % scaledWidth;
    
            for (let i = -1; i < numTiles; i++) {
                ctx.drawImage(
                    backgroundImage,
                    i * scaledWidth - offset,
                    0,
                    scaledWidth,
                    canvas.height
                );
            }
        }
    
        // Draw platforms
        if (platforms) platforms.forEach(platform => platform.draw());
    
        // Draw enemies
        if (enemies) enemies.forEach(enemy => enemy.draw());
    
        // Draw player bullets
        if (bullets) bullets.forEach(bullet => bullet.draw());
    
        // Draw enemy bullets
        if (enemyBullets) enemyBullets.forEach(bullet => bullet.draw());
    
        // Draw shield power-ups
        if (shieldPowerUps) shieldPowerUps.forEach(powerUp => powerUp.draw());
    
        // Draw the player
        drawPlayer();
    
        // Draw the score
        drawScore();
    
        // Draw the game over screen if the game is over
        if (gameOver) {
            drawGameOverScreen();
        }
    }

    // Game loop function
    function gameLoop() {
        if (gameState === "loading") {
            drawStartScreen();
        } else if (gameState === "loadingAssets") {
            drawLoadingScreen();
        } else if (gameState === "menu") {
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
        } else if (gameState === "playing") {
            update();
            render();
        } else if (gameState === "gameOver") {
            drawGameOverScreen();
        }

        requestAnimationFrame(gameLoop);
    }

    // Event listener for mouse clicks on the canvas
    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Existing game state click detection
        if (gameState === "menu") {
            for (let i = 0; i < menuPositions.length; i++) {
                const pos = menuPositions[i];
                if (
                    mouseX >= pos.x &&
                    mouseX <= pos.x + pos.width &&
                    mouseY >= pos.y &&
                    mouseY <= pos.y + pos.height
                ) {
                    switch (i) {
                        case 0: // Start Game
                            setGameState("playing");
                            break;
                        case 1: // Settings
                            settingsState = true;
                            break;
                        case 2: // How to Play
                            drawHowToPlayScreen();
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

    // Event listener for key presses
    window.addEventListener('keydown', (event) => {
        if (gameState === "menu") {
            if (settingsState) {
                if (event.code === "ArrowUp") {
                    if (gameMusic) gameMusic.volume = Math.min(1, gameMusic.volume + 0.1);
                    if (menuMusic) menuMusic.volume = Math.min(1, menuMusic.volume + 0.1);
                } else if (event.code === "ArrowDown") {
                    if (gameMusic) gameMusic.volume = Math.max(0, gameMusic.volume - 0.1);
                    if (menuMusic) menuMusic.volume = Math.max(0, menuMusic.volume - 0.1);
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

    // Event listener for the "Let's Play!" button in the welcome modal
    startGameButton.addEventListener("click", () => {
        hideWelcomeModal();
        // Start with the loading screen
        gameState = "loading";
    });

    // Start the game loop immediately
    gameLoop();
});
