document.addEventListener("DOMContentLoaded", () => {
    // Get modal elements
    const welcomeModal = document.getElementById("welcomeModal");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const howToPlayMessage = document.getElementById("howToPlayMessage");
    const startGameButton = document.getElementById("startGameButton");

    // Check if elements exist
    if (!welcomeModal || !welcomeMessage || !howToPlayMessage || !startGameButton) {
        console.error("One or more modal elements are missing in the DOM.");
        return;
    }

    // Function to show the welcome modal
    function showWelcomeModal(name) {
        welcomeMessage.textContent = `How are you doing, ${name}? Let's have some fun together and fight some aliens!`;
        howToPlayMessage.textContent = "How to Play:\n1. Use Arrow Keys or WASD to move.\n2. Press Space to jump.\n3. Press F or J to shoot.\n4. Avoid enemies and spikes.\n5. Collect power-ups for shields.\n6. Reach the highest score!";
        welcomeModal.style.display = "flex"; // Show the modal
    }

    // Function to hide the welcome modal
    function hideWelcomeModal() {
        welcomeModal.style.display = "none"; // Hide the modal
    }

    // Event listener for the "Let's Play!" button
    startGameButton.addEventListener("click", () => {
        hideWelcomeModal();
        setGameState("playing"); // Start the game
    });

    // Prompt the user for their name and show the modal
    let playerName = localStorage.getItem("playerName");

    if (!playerName) {
        playerName = prompt("Hello! What is your name?");
        if (playerName) {
            localStorage.setItem("playerName", playerName);
            showWelcomeModal(playerName); // Show the welcome modal
        }
    } else {
        showWelcomeModal(playerName); // Show the welcome modal if the name is already stored
    }

    // Rest of your game code...
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
    let highScore = localStorage.getItem("highScore") || 0;
    highScore = parseInt(highScore);

    // Game state
    let gameState = "menu"; // Possible values: "menu", "playing", "gameOver"
    let settingsState = false; // Tracks if the settings menu is open
    let howToPlayState = false; // Tracks if the "How to Play" screen is active

    // Load the background image
    const backgroundImage = new Image();
    backgroundImage.src = "GameBackground.jpg";
    backgroundImage.onerror = () => {
        console.error("Failed to load background image.");
    };

    // Load the player sprite sheet
    const playerSpriteSheet = new Image();
    playerSpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/NewPlayermovement.png";
    playerSpriteSheet.onerror = () => {
        console.error("Failed to load player sprite sheet.");
    };

    // Load the non-shooting enemy sprite sheet
    const nonShootingEnemySpriteSheet = new Image();
    nonShootingEnemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AlienRoboticEnemyMovement.png";
    nonShootingEnemySpriteSheet.onerror = () => {
        console.error("Failed to load non-shooting enemy sprite sheet.");
    };

    // Load the shooting enemy (drone) sprite sheet
    const shootingEnemySpriteSheet = new Image();
    shootingEnemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AIDroneEnemyMovement.png";
    shootingEnemySpriteSheet.onerror = () => {
        console.error("Failed to load shooting enemy sprite sheet.");
    };

    // Load platform images
    const platformImage = new Image();
    platformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/platform.jpg";
    platformImage.onerror = () => {
        console.error("Failed to load platform image.");
    };

    const movingPlatformImage = new Image();
    movingPlatformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/moving-platform.jpg";
    movingPlatformImage.onerror = () => {
        console.error("Failed to load moving platform image.");
    };

    // Load the spike image
    const spikeImage = new Image();
    spikeImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/testingspike.png";
    spikeImage.onerror = () => {
        console.error("Failed to load spike image.");
    };

    // Load the background sounds
    const gameMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playingthegamesound.wav");
    gameMusic.loop = true;
    gameMusic.volume = 0.5;
    gameMusic.onerror = () => {
        console.error("Failed to load game music.");
    };

    const menuMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuSound.wav");
    menuMusic.loop = true;
    menuMusic.volume = 0.5;
    menuMusic.onerror = () => {
        console.error("Failed to load menu music.");
    };

    // Load player sound effects
    const jumpSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/jumping_sound.wav");
    jumpSound.volume = 0.5;
    jumpSound.onerror = () => {
        console.error("Failed to load jump sound.");
    };

    const shootSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playershooting.mp3");
    shootSound.volume = 0.5;
    shootSound.onerror = () => {
        console.error("Failed to load shoot sound.");
    };

    const fallSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerfallingdown.mp3");
    fallSound.volume = 0.5;
    fallSound.onerror = () => {
        console.error("Failed to load fall sound.");
    };

    const spikeDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerkilledbyspikes.wav");
    spikeDeathSound.volume = 0.5;
    spikeDeathSound.onerror = () => {
        console.error("Failed to load spike death sound.");
    };

    const playerDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playergetsshootbyenemy.mp3");
    playerDeathSound.volume = 0.5;
    playerDeathSound.onerror = () => {
        console.error("Failed to load player death sound.");
    };

    // Load enemy sound effects
    const enemyShootSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Droneshooting.mp3");
    enemyShootSound.volume = 0.5;
    enemyShootSound.onerror = () => {
        console.error("Failed to load enemy shoot sound.");
    };

    const enemyDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Enemydying.wav");
    enemyDeathSound.volume = 0.5;
    enemyDeathSound.onerror = () => {
        console.error("Failed to load enemy death sound.");
    };

    // Load the power-up sound
    const powerUpSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/playerpowerup.wav");
    powerUpSound.volume = 0.5;
    powerUpSound.onerror = () => {
        console.error("Failed to load power-up sound.");
    };

    // Load the new high score sound
    const newHighScoreSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/highscore.wav");
    newHighScoreSound.volume = 0.5;
    newHighScoreSound.onerror = () => {
        console.error("Failed to load new high score sound.");
    };

    // Load the menu image
    const menuImage = new Image();
    menuImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuBackground.webp";
    menuImage.onerror = () => {
        console.error("Failed to load menu image.");
    };

    // Music control functions
    function playMenuMusic() {
        gameMusic.pause();
        gameMusic.currentTime = 0; // Reset game music
        menuMusic.play();
    }

    function playGameMusic() {
        menuMusic.pause();
        menuMusic.currentTime = 0; // Reset menu music
        gameMusic.play();
    }

    function stopAllMusic() {
        menuMusic.pause();
        gameMusic.pause();
    }

    // Game state management
    function setGameState(newState) {
        gameState = newState;
        if (newState === "playing") {
            resetGame();
            playGameMusic(); // Play game music when starting the game
        } else if (newState === "menu") {
            gameOver = false;
            playMenuMusic(); // Play menu music when returning to the menu
        } else if (newState === "gameOver") {
            stopAllMusic(); // Stop all music during game over
        }
    }

    // Animation class to handle animations
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

    // Non-shooting enemy animation frames
    const nonShootingEnemyAnimations = {
        walk: new Animation(
            [
                { x: 0, y: 0, width: 48, height: 64 },  // Frame 1 (walking)
                { x: 48, y: 0, width: 48, height: 64 }, // Frame 2 (walking)
                { x: 96, y: 0, width: 53, height: 64 }  // Frame 3 (walking)
            ],
            10 // Frame rate for walking
        ),
        explode: new Animation(
            [
                { x: 149, y: 0, width: 48, height: 64 } // Frame 4 (explosion)
            ],
            1 // Frame rate for explosion (single frame)
        )
    };

    // Shooting enemy (drone) animation frames
    const shootingEnemyAnimations = {
        fly: new Animation(
            [
                { x: 0, y: 0, width: 30, height: 40 },  // Frame 1 (flying)
                { x: 30, y: 0, width: 28, height: 40 }, // Frame 2 (flying)
                { x: 60, y: 0, width: 30, height: 40 }  // Frame 3 (explosion)
            ],
            10 // Frame rate for flying
        ),
        explode: new Animation(
            [
                { x: 60, y: 0, width: 30, height: 40 } // Frame 3 (explosion)
            ],
            1 // Frame rate for explosion (single frame)
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

    const camera = {
        x: 0,
        update: function() {
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
            if (platformImg.complete && platformImg.naturalWidth !== 0) {
                ctx.drawImage(
                    platformImg,
                    this.x - camera.x, this.y, this.width, this.height
                );
            } else {
                ctx.fillStyle = this.isMoving ? "purple" : "#654321";
                ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
            }

            if (this.hasSpikes && spikeImage.complete && spikeImage.naturalWidth !== 0) {
                for (let i = 0; i < this.spikeWidth; i += 20) {
                    ctx.drawImage(
                        spikeImage,
                        this.spikeX + i - camera.x, this.y - 15, 20, 15 // Match the size of the old spikes
                    );
                }
            }
        }
    }

    class NonShootingEnemy {
        constructor(platform) {
            this.platform = platform;
            this.x = platform.x + platform.width / 4;
            this.y = platform.y - 64; // Adjust for enemy height
            this.width = 48; // Default width
            this.height = 64; // Default height
            this.speed = 2;
            this.direction = 1;
            this.minX = platform.x + 10;
            this.maxX = platform.x + platform.width - this.width - 10;
            this.currentAnimation = nonShootingEnemyAnimations.walk;
            this.isExploding = false; // Track if the enemy is exploding
            this.explodeTimer = 0; // Timer for explosion animation
        }

        update() {
            if (this.isExploding) {
                // Handle explosion
                this.explodeTimer++;
                if (this.explodeTimer >= 30) { // Explosion lasts for 0.5 seconds (30 frames)
                    this.isExploding = false;
                    // Remove the enemy after explosion
                    const index = enemies.indexOf(this);
                    if (index !== -1) {
                        enemies.splice(index, 1);
                    }
                }
            } else {
                // Handle walking
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
            this.currentAnimation = nonShootingEnemyAnimations.explode; // Switch to explosion animation
            enemyDeathSound.play(); // Play enemy death sound
        }
    }

    class ShootingEnemy {
        constructor(platform) {
            this.platform = platform;
            this.x = platform.x + platform.width / 4;
            this.y = platform.y - 40; // Adjust for drone height
            this.width = 30; // Default width
            this.height = 40; // Default height
            this.speed = 2;
            this.direction = 1;
            this.minX = platform.x + 10;
            this.maxX = platform.x + platform.width - this.width - 10;
            this.currentAnimation = shootingEnemyAnimations.fly;
            this.isExploding = false; // Track if the drone is exploding
            this.explodeTimer = 0; // Timer for explosion animation
            this.shootCooldown = 100; // Cooldown for shooting
            this.shootTimer = 0; // Timer for shooting
        }

        update() {
            if (this.isExploding) {
                // Handle explosion
                this.explodeTimer++;
                if (this.explodeTimer >= 30) { // Explosion lasts for 0.5 seconds (30 frames)
                    this.isExploding = false;
                    // Remove the drone after explosion
                    const index = enemies.indexOf(this);
                    if (index !== -1) {
                        enemies.splice(index, 1);
                    }
                }
            } else {
                // Handle flying
                this.x += this.direction * this.speed;
                if (this.x <= this.minX || this.x >= this.maxX) {
                    this.direction *= -1;
                }
                this.currentAnimation.update();

                // Handle shooting
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

            // Center the frame if it's smaller than the default size
            const offsetX = (this.width - frame.width) / 2; // Center horizontally
            const offsetY = (this.height - frame.height) / 2; // Center vertically

            if (this.direction === -1 && !this.isExploding) {
                ctx.scale(-1, 1); // Flip horizontally if moving left
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
            enemyBullets.push(new Bullet(bulletX, bulletY, direction));
            enemyShootSound.play(); // Play enemy shoot sound
        }

        explode() {
            this.isExploding = true;
            this.currentAnimation = shootingEnemyAnimations.explode; // Switch to explosion animation
            enemyDeathSound.play(); // Play enemy death sound
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

    const platforms = [new Platform(50, canvas.height - 100, 200, 20)];
    const enemies = [];
    const bullets = [];
    const enemyBullets = [];
    const shieldPowerUps = [];

    function generatePlatforms() {
        let lastPlatform = platforms[platforms.length - 1];
        if (lastPlatform.x - camera.x < canvas.width - 250) {
            let x = lastPlatform.x + lastPlatform.width + Math.random() * 120 + 80;
            let y = Math.min(lastPlatform.y + (Math.random() * 60 - 30), canvas.height - 120);
            let isMoving = Math.random() > 0.6;
            let hasSpikes = player.score >= 50 && Math.random() > 0.7;
            let hasNonShootingEnemy = player.score >= 50 && !isMoving && !hasSpikes && Math.random() > 0.5;
            let hasShootingEnemy = player.score >= 50 && !isMoving && !hasSpikes && Math.random() > 0.5;
            let hasShieldPowerUp = player.score >= 150 && Math.random() > 0.8;

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

    const keys = {};
    window.addEventListener('keydown', (event) => {
        keys[event.code] = true;
        if (event.code === "KeyR" && gameOver) {
            setGameState("playing");
        }
        if (event.code === "KeyM" && gameOver) {
            setGameState("menu");
        }
        if (event.code === "KeyF" || event.code === "KeyJ") {
            bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, player.direction));
            shootSound.play(); // Play shoot sound
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
                        spikeDeathSound.play(); // Play spike death sound
                        updateHighScore(); // Update high score when the player dies
                    } else {
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        onPlatform = true;
                    }
                } else {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    onPlatform = true;

                    // Track the moving platform
                    if (platform.isMoving) {
                        player.x += platform.direction * platform.speed; // Move the player with the platform
                    }

                    if (player.lastPlatform !== platform) {
                        player.score += 10;
                        player.lastPlatform = platform;
                    }
                }
            }
        });

        if (!onPlatform) {
            player.isJumping = true;
        } else {
            if (player.isJumping) {
                isJumpLanding = true; // Player is landing
                setTimeout(() => {
                    isJumpLanding = false; // Reset landing state after a short delay
                    isJumping = false; // Reset jumping state
                }, 100); // Adjust the delay as needed
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
            jumpSound.play(); // Play jump sound
        }

        if (player.y > canvas.height) {
            gameOver = true;
            fallSound.play(); // Play fall sound
            updateHighScore(); // Update high score when the player falls
        }
    }

    function updateHighScore() {
        if (player.score > highScore) {
            highScore = player.score; // Update the high score
            localStorage.setItem("highScore", highScore); // Save the new high score to localStorage
            newHighScoreSound.play(); // Play new high score sound
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

    function resetGame() {
        stopAllMusic(); // Stop all music

        // Resize the canvas to fit the window
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
        player.lastPlatform = null;
        player.isShieldActive = false;
        player.shieldTimer = 0;

        // Reset camera
        camera.x = 0;

        // Reset platforms, enemies, bullets, and power-ups
        platforms.length = 1;
        enemies.length = 0;
        bullets.length = 0;
        enemyBullets.length = 0;
        shieldPowerUps.length = 0;

        // Regenerate platforms
        generatePlatforms();

        // Reset sound volumes
        playerDeathSound.volume = 0.5;
        spikeDeathSound.volume = 0.5;
        fallSound.volume = 0.5;

        // Start the game music
        playGameMusic();
    }

    function drawGameOverScreen() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 60);

        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(`${playerName}'s Score: ${player.score}`, canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "gold"; // High score color matches the gameplay screen
        ctx.font = "30px Arial";
        ctx.fillText(`${playerName}'s High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 100);
        ctx.fillText("Press M to Return to Menu", canvas.width / 2, canvas.height / 2 + 140);
    }

    // Store menu items and positions
    let menuItems = ["Start Game", "Settings", "How To Play", "Highest Score"];
    let menuPositions = [];
    let hoveredIndex = -1; // Track hovered item
    let hoverAnimation = { opacity: 1, scale: 1 }; // Store opacity & scale for smooth effect

    function drawMainMenu() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the menu background image
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw the title at the top-left
        ctx.fillStyle = "white";
        ctx.font = "80px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Cyber Ninja Astronaut", 100, 80);

        // Draw the player's name
        ctx.font = "30px Arial";
        ctx.fillText(`Welcome, ${playerName}!`, 100, 130);

        // Move menu slightly to the left to keep it on-screen
        let centerX = canvas.width - 350;
        let centerY = canvas.height / 2;
        let radius = 180;

        // Draw curved menu items with dark background and borders
        for (let i = 0; i < menuItems.length; i++) {
            let angle = (-Math.PI / 3.5) + (i * (Math.PI / 5));
            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);

            // Store menu item positions for hover and click detection
            ctx.font = "30px Arial";
            let textWidth = ctx.measureText(menuItems[i]).width;
            let padding = 10;
            let boxWidth = textWidth + padding * 2;
            let boxHeight = 40;

            // Update menuPositions with the new button positions
            menuPositions[i] = {
                x: x - boxWidth / 2, // Left edge of the button
                y: y - 30, // Top edge of the button
                width: boxWidth, // Width of the button
                height: boxHeight, // Height of the button
            };

            // Save the current canvas state
            ctx.save();

            // Check if the mouse is hovering over this item
            if (hoveredIndex === i) {
                // Apply hover animation (scale and opacity)
                ctx.globalAlpha = hoverAnimation.opacity;
                ctx.translate(x, y);
                ctx.scale(hoverAnimation.scale, hoverAnimation.scale);
                ctx.translate(-x, -y);
            }

            // Draw dark semi-transparent background behind text
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Dark semi-transparent layer
            ctx.fillRect(x - boxWidth / 2, y - 30, boxWidth, boxHeight);

            // Draw white border around the menu option
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;
            ctx.strokeRect(x - boxWidth / 2, y - 30, boxWidth, boxHeight);

            // Draw menu text
            ctx.fillStyle = hoveredIndex === i ? "rgba(255, 255, 0, 1)" : "rgba(0, 255, 255, 1)"; // Change color on hover
            ctx.shadowColor = hoveredIndex === i ? "yellow" : "cyan"; // Change shadow color on hover
            ctx.shadowBlur = 10;
            ctx.textAlign = "center";
            ctx.fillText(menuItems[i], x, y);

            // Restore the canvas state to isolate hover effects
            ctx.restore();
        }

        // Draw credits in the bottom-right
        ctx.font = "20px Arial";
        ctx.textAlign = "right";
        ctx.fillText("Created by [Your Name]", canvas.width - 20, canvas.height - 20);
    }

    // Add event listeners for hover detection
    canvas.addEventListener("mousemove", (e) => {
        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        // Check if the mouse is over any menu item
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

    canvas.addEventListener("mouseleave", () => {
        hoveredIndex = -1; // Reset hover state when mouse leaves canvas
    });

    function drawSettingsMenu() {
        // Draw the menu background image
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the title
        ctx.fillStyle = "white";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Settings", canvas.width / 2, canvas.height / 2 - 150);

        // Draw settings options
        ctx.font = "30px Arial";
        ctx.fillText("1. Sound Volume: " + Math.round(gameMusic.volume * 100) + "%", canvas.width / 2, canvas.height / 2 - 50); // Display volume as percentage
        ctx.fillText("2. Back to Main Menu", canvas.width / 2, canvas.height / 2);

        // Draw instructions
        ctx.font = "20px Arial";
        ctx.fillText("Use Arrow Keys to adjust volume. Press Enter to go back.", canvas.width / 2, canvas.height / 2 + 100);
    }

    function drawHowToPlayScreen() {
        // Draw the menu background image
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the title
        ctx.fillStyle = "white";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("How to Play", canvas.width / 2, canvas.height / 2 - 150);

        // Draw instructions
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

        // Draw back option
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Press Enter to go back", canvas.width / 2, canvas.height / 2 + 150);
    }

    function update() {
        if (!gameOver) {
            updateShield();
            handleMovement();
            generatePlatforms();
            camera.update();

            bullets.forEach(bullet => bullet.update());
            bullets.forEach((bullet, bulletIndex) => {
                enemies.forEach((enemy, enemyIndex) => {
                    if (bullet.hitEnemy(enemy)) {
                        bullets.splice(bulletIndex, 1);
                        enemy.explode(); // Trigger enemy explosion
                        player.score += 20;
                    }
                });

                // Remove bullets that go off-screen
                if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                    bullets.splice(bulletIndex, 1);
                }
            });

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
                        playerDeathSound.play(); // Play player death sound
                        updateHighScore(); // Update high score when the player dies
                    }
                }
            });

            enemyBullets.forEach(bullet => bullet.update());
            enemyBullets.forEach((bullet, bulletIndex) => {
                if (
                    bullet.x + bullet.width > player.x &&
                    bullet.x < player.x + player.width &&
                    bullet.y + bullet.height > player.y &&
                    bullet.y < player.y + player.height
                ) {
                    if (!player.isShieldActive) {
                        gameOver = true;
                        playerDeathSound.play(); // Play player death sound
                        updateHighScore(); // Update high score when the player dies
                    }
                }

                if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                    enemyBullets.splice(bulletIndex, 1);
                }
            });

            shieldPowerUps.forEach((powerUp, index) => {
                if (powerUp.isCollected()) {
                    activateShield(powerUp.duration);
                    shieldPowerUps.splice(index, 1);
                    powerUpSound.play(); // Play power-up sound
                }
            });
        }
    }

    function drawScore() {
        ctx.fillStyle = "white"; // Default color for the score
        ctx.font = "20px Arial";
        
        // Draw the score on the left side
        ctx.fillText(`${playerName}'your current score is: ${player.score}`, 20, 30);
        
        // Draw the high score on the right side
        const highScoreText = `${playerName}'s Highest Score: ${highScore}`;
        const textWidth = ctx.measureText(highScoreText).width;
        
        ctx.fillStyle = "gold"; // Change high score color to yellow
        ctx.fillText(highScoreText, canvas.width - textWidth - 20, 30);
    }

    function drawPlayer() {
        if (gameOver) {
            currentAnimation = playerAnimations.dieLie; // Directly use the lying down animation
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

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imageWidth = backgroundImage.width;
        const imageHeight = backgroundImage.height;
        const scale = canvas.height / imageHeight;
        const scaledWidth = imageWidth * scale;

        // Calculate the number of tiles needed to cover the canvas width
        const numTiles = Math.ceil(canvas.width / scaledWidth) + 1;

        // Calculate the offset to ensure seamless tiling
        const offset = (camera.x * 0.5) % scaledWidth;

        // Draw the background image tiles
        for (let i = -1; i < numTiles; i++) {
            ctx.drawImage(
                backgroundImage,
                i * scaledWidth - offset,
                0,
                scaledWidth,
                canvas.height
            );
        }

        // Draw platforms, enemies, bullets, power-ups, player, and score
        platforms.forEach(platform => platform.draw());
        enemies.forEach(enemy => enemy.draw());
        bullets.forEach(bullet => bullet.draw());
        enemyBullets.forEach(bullet => bullet.draw());
        shieldPowerUps.forEach(powerUp => powerUp.draw());
        drawPlayer();
        drawScore();

        // Draw the game over screen if the game is over
        if (gameOver) {
            drawGameOverScreen();
        }
    }

    function gameLoop() {
        if (gameState === "menu") {
            // Update hover animation
            if (hoveredIndex !== -1) {
                // Fade in and scale up when hovered
                hoverAnimation.opacity = Math.min(hoverAnimation.opacity + 0.05, 1); // Fade in to 1
                hoverAnimation.scale = Math.min(hoverAnimation.scale + 0.01, 1.1); // Scale up to 1.1
            } else {
                // Fade out and scale down when not hovered
                hoverAnimation.opacity = Math.max(hoverAnimation.opacity - 0.05, 0.8); // Fade out to 0.8
                hoverAnimation.scale = Math.max(hoverAnimation.scale - 0.01, 1); // Scale down to 1
            }

            if (settingsState) {
                drawSettingsMenu(); // Draw the settings menu
            } else if (howToPlayState) {
                drawHowToPlayScreen(); // Draw the "How to Play" screen
            } else {
                drawMainMenu(); // Draw the main menu
            }
            playMenuMusic(); // Ensure menu music is playing
        } else if (gameState === "playing") {
            update(); // Update game logic
            render(); // Render the game
            playGameMusic(); // Ensure game music is playing
        } else if (gameState === "gameOver") {
            drawGameOverScreen(); // Draw the game over screen
        }

        requestAnimationFrame(gameLoop);
    }

    // Handle mouse clicks on the menu
    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // Mouse X coordinate relative to canvas
        const mouseY = event.clientY - rect.top; // Mouse Y coordinate relative to canvas

        if (gameState === "menu") {
            // Check if the user clicked on a menu option
            for (let i = 0; i < menuPositions.length; i++) {
                const pos = menuPositions[i];
                if (
                    mouseX >= pos.x &&
                    mouseX <= pos.x + pos.width &&
                    mouseY >= pos.y &&
                    mouseY <= pos.y + pos.height
                ) {
                    // Handle menu item clicks
                    switch (i) {
                        case 0: // Start Game
                            setGameState("playing");
                            break;
                        case 1: // Settings
                            settingsState = true;
                            break;
                        case 2: // How to Play
                            drawHowToPlayScreen();
                            howToPlayState = true; // Show the "How to Play" screen
                            break;
                        case 3: // Highest Score
                            alert(`Your Highest Score is: ${highScore}`);
                            break;
                    }
                    break; // Exit the loop after handling the click
                }
            }
        } else if (gameState === "gameOver") {
            // Handle mouse clicks on the game over screen
            if (mouseX > canvas.width / 2 - 100 && mouseX < canvas.width / 2 + 100) {
                if (mouseY > canvas.height / 2 + 80 && mouseY < canvas.height / 2 + 120) {
                    // Restart Game
                    setGameState("playing");
                } else if (mouseY > canvas.height / 2 + 120 && mouseY < canvas.height / 2 + 160) {
                    // Return to Main Menu
                    setGameState("menu");
                }
            }
        }
    });

    // Handle key presses for settings and how-to-play screens
    window.addEventListener('keydown', (event) => {
        if (gameState === "menu") {
            if (settingsState) {
                if (event.code === "ArrowUp") {
                    // Increase volume by 10%
                    gameMusic.volume = Math.min(1, gameMusic.volume + 0.1);
                    menuMusic.volume = Math.min(1, menuMusic.volume + 0.1);
                } else if (event.code === "ArrowDown") {
                    // Decrease volume by 5%
                    gameMusic.volume = Math.max(0, gameMusic.volume - 0.1);
                    menuMusic.volume = Math.max(0, menuMusic.volume - 0.1);
                } else if (event.code === "Enter") {
                    // Go back to the main menu
                    settingsState = false;
                }
            } else if (howToPlayState) {
                if (event.code === "Enter") {
                    // Go back to the main menu
                    howToPlayState = false;
                }
            }
        } else if (gameState === "gameOver") {
            if (event.code === "KeyR") {
                // Restart the game
                setGameState("playing");
            } else if (event.code === "KeyM") {
                // Return to the main menu
                setGameState("menu");
            }
        }
    });

    // Ensure all images and sounds are loaded before starting the game
    Promise.all([
        new Promise((resolve) => { backgroundImage.onload = resolve; }),
        new Promise((resolve) => { playerSpriteSheet.onload = resolve; }),
        new Promise((resolve) => { nonShootingEnemySpriteSheet.onload = resolve; }),
        new Promise((resolve) => { shootingEnemySpriteSheet.onload = resolve; }),
        new Promise((resolve) => { platformImage.onload = resolve; }),
        new Promise((resolve) => { movingPlatformImage.onload = resolve; }),
        new Promise((resolve) => { spikeImage.onload = resolve; }),
        new Promise((resolve) => { menuImage.onload = resolve; }), // Wait for the menu image to load
        new Promise((resolve) => {
            gameMusic.addEventListener("canplaythrough", resolve); // Wait for the game music to load
        }),
        new Promise((resolve) => {
            menuMusic.addEventListener("canplaythrough", resolve); // Wait for the menu music to load
        }),
        new Promise((resolve) => {
            powerUpSound.addEventListener("canplaythrough", resolve); // Wait for the power-up sound to load
        }),
        new Promise((resolve) => {
            newHighScoreSound.addEventListener("canplaythrough", resolve); // Wait for the high score sound to load
        })
    ]).then(() => {
        console.log("All assets loaded successfully.");
        gameLoop(); // Start the game loop
    }).catch((error) => {
        console.error("Error loading assets:", error);
    });
});
