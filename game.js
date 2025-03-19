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

    // Event listener for the "Let's Play!" button
    startGameButton.addEventListener("click", () => {
        hideWelcomeModal(); // Hide the modal
        setGameState("menu"); // Start the game
    });

    // Player object with properties like position, size, speed, etc.
    const player = {
        x: 100, // Initial X position
        y: 0, // Initial Y position (will be set after canvas initialization)
        width: 32, // Player width
        height: 48, // Player height
        velocityX: 0, // Horizontal velocity
        velocityY: 0, // Vertical velocity
        speed: 6, // Movement speed (can be adjusted)
        jumpHeight: 14, // Jump strength (can be adjusted)
        isJumping: false, // Track if the player is jumping
        direction: 1, // Facing direction (1 for right, -1 for left)
        score: 0, // Player's current score
        lastPlatform: null, // Track the last platform the player was on
        isShieldActive: false, // Track if the shield is active
        shieldTimer: 0 // Timer for the shield duration
    };

    // Array of game over messages
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
        `Even legends have setbacks, ${playerName}. Get back in there! ${highScore} isn’t your limit!`,
        `${playerName}, your cyber-ninja training isn’t over yet! You reached ${highScore}, now go further!`,
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

    // Global variables for Facebook, Instagram, and Privacy Policy positions
    let facebookX, facebookY, instagramX, instagramY, privacyPolicyX, privacyPolicyY;
    let logoSize = 40; // Size of the logos
    let logoPadding = 20; // Padding between logos and text
    let privacyPolicyText = "Privacy Policy"; // Privacy Policy text

    // Game state variables
    let gameState = "menu"; // Possible values: "menu", "playing", "gameOver"
    let settingsState = false; // Track if the settings menu is open
    let howToPlayState = false; // Track if the "How to Play" screen is open
    let currentGameOverMessage = ""; // Store the current game over message

    // Function to set the game state
    function setGameState(newState) {
        if (newState === "playing") {
            resetGame(); // Reset the game before starting
        } else if (newState === "gameOver") {
            currentGameOverMessage = getRandomGameOverMessage(); // Set a random game over message
        }
        gameState = newState; // Update the game state
    }

    // Get the canvas and its context
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Function to resize the canvas to fit the window
    function resizeCanvas() {
        canvas.width = window.innerWidth; // Set canvas width to window width
        canvas.height = window.innerHeight; // Set canvas height to window height
        player.y = canvas.height - 150; // Set player's initial Y position
    }
    window.addEventListener('resize', resizeCanvas); // Resize canvas when the window is resized
    resizeCanvas(); // Initial resize

    let gameOver = false; // Track if the game is over

    // Load the background image
    const backgroundImage = new Image();
    backgroundImage.src = "GameBackground.jpg"; // Path to the background image

    // Load the player sprite sheet
    const playerSpriteSheet = new Image();
    playerSpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/NewPlayermovement.png"; // Path to the player sprite sheet

    // Load the non-shooting enemy sprite sheet
    const nonShootingEnemySpriteSheet = new Image();
    nonShootingEnemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AlienRoboticEnemyMovement.png"; // Path to the non-shooting enemy sprite sheet

    // Load the shooting enemy (drone) sprite sheet
    const shootingEnemySpriteSheet = new Image();
    shootingEnemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AIDroneEnemyMovement.png"; // Path to the shooting enemy sprite sheet

    // Load platform images
    const platformImage = new Image();
    platformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/platform.jpg"; // Path to the platform image

    const movingPlatformImage = new Image();
    movingPlatformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/moving-platform.jpg"; // Path to the moving platform image

    // Load the spike image
    const spikeImage = new Image();
    spikeImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/testingspike.png"; // Path to the spike image

    // Load the background sounds
    const gameMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playingthegamesound.wav"); // Game music
    gameMusic.loop = true; // Loop the music
    gameMusic.volume = 0.5; // Set volume (0 to 1)

    const menuMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuSound.wav"); // Menu music
    menuMusic.loop = true; // Loop the music
    menuMusic.volume = 0.5; // Set volume (0 to 1)

    // Load player sound effects
    const jumpSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/jumping_sound.wav"); // Jump sound
    jumpSound.volume = 0.5; // Set volume (0 to 1)

    const shootSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playershooting.mp3"); // Shoot sound
    shootSound.volume = 0.5; // Set volume (0 to 1)

    const fallSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerfallingdown.mp3"); // Fall sound
    fallSound.volume = 1; // Set volume (0 to 1)

    const spikeDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerkilledbyspikes.wav"); // Spike death sound
    spikeDeathSound.volume = 1; // Set volume (0 to 1)

    const playerDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playergetsshootbyenemy.mp3"); // Player death sound
    playerDeathSound.volume = 0.5; // Set volume (0 to 1)

    // Load enemy sound effects
    const enemyShootSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Droneshooting.mp3"); // Enemy shoot sound
    enemyShootSound.volume = 0.5; // Set volume (0 to 1)

    const enemyDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Enemydying.wav"); // Enemy death sound
    enemyDeathSound.volume = 0.5; // Set volume (0 to 1)

    // Load the power-up sound
    const powerUpSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/playerpowerup.wav"); // Power-up sound
    powerUpSound.volume = 0.5; // Set volume (0 to 1)

    // Load the new high score sound
    const newHighScoreSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/highscore.wav"); // New high score sound
    newHighScoreSound.volume = 0.5; // Set volume (0 to 1)

    // Load the menu image
    const menuImage = new Image();
    menuImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuBackground.webp"; // Path to the menu background image

    // Load Facebook and Instagram logos
    const facebookLogo = new Image();
    facebookLogo.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/facebook.png"; // Path to the Facebook logo

    const instagramLogo = new Image();
    instagramLogo.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/instagram.png"; // Path to the Instagram logo

    // Music control functions
    function playMenuMusic() {
        gameMusic.pause(); // Pause game music
        gameMusic.currentTime = 0; // Reset game music
        menuMusic.play(); // Play menu music
    }

    function playGameMusic() {
        menuMusic.pause(); // Pause menu music
        menuMusic.currentTime = 0; // Reset menu music
        gameMusic.play(); // Play game music
    }

    function stopAllMusic() {
        menuMusic.pause(); // Pause menu music
        gameMusic.pause(); // Pause game music
    }

    // Animation class to handle animations
    class Animation {
        constructor(frames, frameRate) {
            this.frames = frames; // Array of frames (each frame is an object with x, y, width, height)
            this.frameRate = frameRate; // How many frames to wait before switching to the next frame
            this.currentFrameIndex = 0; // Current frame index
            this.frameTimer = 0; // Timer for frame switching
        }

        // Update the animation
        update() {
            this.frameTimer++;
            if (this.frameTimer >= this.frameRate) {
                this.frameTimer = 0;
                this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length; // Loop through frames
            }
        }

        // Get the current frame
        getCurrentFrame() {
            return this.frames[this.currentFrameIndex];
        }
    }

    // Player animation frames
    const playerAnimations = {
        idle: new Animation([{ x: 0, y: 0, width: 32, height: 48 }], 1), // Idle animation
        walk: new Animation([{ x: 32, y: 0, width: 32, height: 48 }, { x: 64, y: 0, width: 32, height: 48 }], 10), // Walk animation
        jumpStart: new Animation([{ x: 96, y: 0, width: 32, height: 48 }], 1), // Jump start animation
        jump: new Animation([{ x: 128, y: 0, width: 32, height: 48 }], 1), // Jump animation
        jumpLand: new Animation([{ x: 160, y: 0, width: 32, height: 48 }], 1), // Jump landing animation
        dieLie: new Animation([{ x: 224, y: 0, width: 32, height: 48 }], 1) // Death animation
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

    let currentAnimation = playerAnimations.idle; // Current animation for the player
    let isDying = false; // Track if the player is dying
    let isJumping = false; // Track if the player is jumping
    let isJumpStarting = false; // Track if the player is starting a jump
    let isJumpLanding = false; // Track if the player is landing from a jump

    // Camera object to follow the player
    const camera = {
        x: 0, // Camera X position
        update: function() {
            this.x = player.x - canvas.width / 3; // Center the camera on the player
            if (this.x < 0) this.x = 0; // Prevent camera from going left of the canvas
        }
    };

    // Platform class
    class Platform {
        constructor(x, y, width, height, isMoving = false, hasSpikes = false) {
            this.x = x; // X position
            this.y = y; // Y position
            this.width = width; // Platform width
            this.height = height; // Platform height
            this.isMoving = isMoving; // Whether the platform moves
            this.originalX = x; // Original X position for moving platforms
            this.moveRange = 100; // Range of movement for moving platforms
            this.direction = 1; // Direction of movement (1 for right, -1 for left)
            this.speed = isMoving ? 2 : 0; // Speed of movement (0 for static platforms)
            this.hasSpikes = hasSpikes; // Whether the platform has spikes

            if (hasSpikes) {
                let positionChance = Math.random();
                if (positionChance < 0.33) {
                    this.spikeX = this.x; // Spikes on the left
                } else if (positionChance < 0.66) {
                    this.spikeX = this.x + this.width / 2 - 30; // Spikes in the middle
                } else {
                    this.spikeX = this.x + this.width - 60; // Spikes on the right
                }
                this.spikeWidth = this.width / 3; // Width of the spike area
            }
        }

        // Update the platform's position
        update() {
            if (this.isMoving) {
                this.x += this.direction * this.speed; // Move the platform
                if (this.x > this.originalX + this.moveRange || this.x < this.originalX - this.moveRange) {
                    this.direction *= -1; // Reverse direction at the edges
                }
                if (this.hasSpikes) {
                    this.spikeX += this.direction * this.speed; // Move spikes with the platform
                }
            }
        }

        // Draw the platform
        draw() {
            const platformImg = this.isMoving ? movingPlatformImage : platformImage;
            if (platformImg.complete && platformImg.naturalWidth !== 0) {
                ctx.drawImage(
                    platformImg,
                    this.x - camera.x, this.y, this.width, this.height
                );
            } else {
                ctx.fillStyle = this.isMoving ? "purple" : "#654321"; // Fallback color if image fails to load
                ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
            }

            if (this.hasSpikes && spikeImage.complete && spikeImage.naturalWidth !== 0) {
                for (let i = 0; i < this.spikeWidth; i += 20) {
                    ctx.drawImage(
                        spikeImage,
                        this.spikeX + i - camera.x, this.y - 15, 20, 15 // Draw spikes
                    );
                }
            }
        }
    }

    // Non-shooting enemy class
    class NonShootingEnemy {
        constructor(platform) {
            this.platform = platform; // Platform the enemy is on
            this.x = platform.x + platform.width / 4; // X position
            this.y = platform.y - 64; // Y position (adjust for enemy height)
            this.width = 48; // Enemy width
            this.height = 64; // Enemy height
            this.speed = 2; // Movement speed
            this.direction = 1; // Movement direction (1 for right, -1 for left)
            this.minX = platform.x + 10; // Minimum X position
            this.maxX = platform.x + platform.width - this.width - 10; // Maximum X position
            this.currentAnimation = nonShootingEnemyAnimations.walk; // Current animation
            this.isExploding = false; // Track if the enemy is exploding
            this.explodeTimer = 0; // Timer for explosion animation
        }

        // Update the enemy's position and state
        update() {
            if (this.isExploding) {
                this.explodeTimer++;
                if (this.explodeTimer >= 30) { // Explosion lasts for 0.5 seconds (30 frames)
                    this.isExploding = false;
                    const index = enemies.indexOf(this);
                    if (index !== -1) {
                        enemies.splice(index, 1); // Remove the enemy after explosion
                    }
                }
            } else {
                this.x += this.direction * this.speed; // Move the enemy
                if (this.x <= this.minX || this.x >= this.maxX) {
                    this.direction *= -1; // Reverse direction at the edges
                }
                this.currentAnimation.update(); // Update animation
            }
        }

        // Draw the enemy
        draw() {
            const frame = this.currentAnimation.getCurrentFrame();
            ctx.save();
            if (this.direction === -1 && !this.isExploding) {
                ctx.scale(-1, 1); // Flip the enemy if moving left
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

        // Trigger enemy explosion
        explode() {
            this.isExploding = true;
            this.currentAnimation = nonShootingEnemyAnimations.explode; // Switch to explosion animation
            enemyDeathSound.play(); // Play enemy death sound
        }
    }

    // Update the ShootingEnemy class to use EnemyBullet
    class ShootingEnemy {
        constructor(platform) {
            this.platform = platform; // Platform the drone is on
            this.x = platform.x + platform.width / 4; // X position
            this.y = platform.y - 40; // Y position (adjust for drone height)
            this.width = 30; // Drone width
            this.height = 40; // Drone height
            this.speed = 2; // Movement speed
            this.direction = 1; // Movement direction (1 for right, -1 for left)
            this.minX = platform.x + 10; // Minimum X position
            this.maxX = platform.x + platform.width - this.width - 10; // Maximum X position
            this.currentAnimation = shootingEnemyAnimations.fly; // Current animation
            this.isExploding = false; // Track if the drone is exploding
            this.explodeTimer = 0; // Timer for explosion animation
            this.shootCooldown = 100; // Cooldown for shooting
            this.shootTimer = 0; // Timer for shooting
        }

        // Update the drone's position and state
        update() {
            if (this.isExploding) {
                this.explodeTimer++;
                if (this.explodeTimer >= 30) { // Explosion lasts for 0.5 seconds (30 frames)
                    this.isExploding = false;
                    const index = enemies.indexOf(this);
                    if (index !== -1) {
                        enemies.splice(index, 1); // Remove the drone after explosion
                    }
                }
            } else {
                this.x += this.direction * this.speed; // Move the drone
                if (this.x <= this.minX || this.x >= this.maxX) {
                    this.direction *= -1; // Reverse direction at the edges
                }
                this.currentAnimation.update(); // Update animation

                if (this.shootTimer <= 0) {
                    this.shoot(); // Shoot if cooldown is over
                    this.shootTimer = this.shootCooldown; // Reset cooldown
                } else {
                    this.shootTimer--; // Decrease cooldown timer
                }
            }
        }

        // Draw the drone
        draw() {
            const frame = this.currentAnimation.getCurrentFrame();
            ctx.save();

            const offsetX = (this.width - frame.width) / 2; // Center the frame horizontally
            const offsetY = (this.height - frame.height) / 2; // Center the frame vertically

            if (this.direction === -1 && !this.isExploding) {
                ctx.scale(-1, 1); // Flip the drone if moving left
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

        // Shoot a bullet
        shoot() {
            const direction = player.x > this.x ? 1 : -1; // Shoot towards the player
            const bulletX = this.x + this.width / 2; // Bullet X position
            const bulletY = this.y + this.height / 2; // Bullet Y position
            enemyBullets.push(new EnemyBullet(bulletX, bulletY, direction)); // Add enemy bullet to the array
            enemyShootSound.play(); // Play shoot sound
        }

        // Trigger drone explosion
        explode() {
            this.isExploding = true;
            this.currentAnimation = shootingEnemyAnimations.explode; // Switch to explosion animation
            enemyDeathSound.play(); // Play death sound
        }
    }

    // Bullet class
    class Bullet {
        constructor(x, y, direction) {
            this.x = x; // X position
            this.y = y; // Y position
            this.width = 10; // Bullet width
            this.height = 5; // Bullet height
            this.speed = 8; // Bullet speed
            this.direction = direction; // Bullet direction (1 for right, -1 for left)
        }

        // Update the bullet's position
        update() {
            this.x += this.speed * this.direction; // Move the bullet
        }

        // Draw the bullet
        draw() {
            ctx.fillStyle = "yellow"; // Bullet color (can be changed)
            ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
        }

        // Check if the bullet hits an enemy
        hitEnemy(enemy) {
            return (
                this.x + this.width > enemy.x &&
                this.x < enemy.x + enemy.width &&
                this.y + this.height > enemy.y &&
                this.y < enemy.y + enemy.height
            );
        }
    }

    // EnemyBullet class for enemy bullets
    class EnemyBullet {
        constructor(x, y, direction) {
            this.x = x; // X position
            this.y = y; // Y position
            this.width = 10; // Bullet width
            this.height = 5; // Bullet height
            this.speed = 8; // Bullet speed
            this.direction = direction; // Bullet direction (1 for right, -1 for left)
        }

        // Update the bullet's position
        update() {
            this.x += this.speed * this.direction; // Move the bullet
        }

        // Draw the bullet
        draw() {
            ctx.fillStyle = "red"; // Enemy bullet color (red)
            ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
        }
    }

    // Shield power-up class
    class ShieldPowerUp {
        constructor(x, y) {
            this.x = x; // X position
            this.y = y; // Y position
            this.width = 20; // Power-up width
            this.height = 20; // Power-up height
            this.duration = 5; // Shield duration in seconds
            this.isActive = false; // Track if the power-up is active
        }

        // Draw the power-up
        draw() {
            ctx.fillStyle = "cyan"; // Power-up color (can be changed)
            ctx.beginPath();
            ctx.arc(this.x - camera.x, this.y, this.width / 2, 0, Math.PI * 2); // Draw a circle
            ctx.fill();
        }

        // Check if the player collects the power-up
        isCollected() {
            return (
                player.x + player.width > this.x &&
                player.x < this.x + this.width &&
                player.y + player.height > this.y &&
                player.y < this.y + this.height
            );
        }
    }

    // Arrays to store platforms, enemies, bullets, and power-ups
    const platforms = [new Platform(50, canvas.height - 100, 200, 20)]; // Initial platform
    const enemies = []; // Array for enemies
    const bullets = []; // Array for player bullets
    const enemyBullets = []; // Array for enemy bullets
    const shieldPowerUps = []; // Array for shield power-ups

    // Function to generate new platforms
    function generatePlatforms() {
        let lastPlatform = platforms[platforms.length - 1];
        if (lastPlatform.x - camera.x < canvas.width - 250) {
            let x = lastPlatform.x + lastPlatform.width + Math.random() * 120 + 80; // Random X position
            let y = Math.min(lastPlatform.y + (Math.random() * 60 - 30), canvas.height - 120); // Random Y position
            let isMoving = Math.random() > 0.6; // Randomly decide if the platform moves
            let hasSpikes = player.score >= 50 && Math.random() > 0.7; // Randomly add spikes
            let hasNonShootingEnemy = player.score >= 50 && !isMoving && !hasSpikes && Math.random() > 0.5; // Randomly add non-shooting enemy
            let hasShootingEnemy = player.score >= 50 && !isMoving && !hasSpikes && Math.random() > 0.5; // Randomly add shooting enemy
            let hasShieldPowerUp = player.score >= 150 && Math.random() > 0.8; // Randomly add shield power-up

            let platform = new Platform(x, y, 180, 20, isMoving, hasSpikes); // Create a new platform
            platforms.push(platform); // Add the platform to the array

            if (hasNonShootingEnemy) {
                enemies.push(new NonShootingEnemy(platform)); // Add a non-shooting enemy
            }

            if (hasShootingEnemy) {
                enemies.push(new ShootingEnemy(platform)); // Add a shooting enemy
            }

            if (hasShieldPowerUp) {
                shieldPowerUps.push(new ShieldPowerUp(x + platform.width / 2, y - 30)); // Add a shield power-up
            }
        }
    }

    // Track key presses
    const keys = {};
    window.addEventListener('keydown', (event) => {
        keys[event.code] = true; // Mark the key as pressed
        if (event.code === "KeyR" && gameOver) {
            setGameState("playing"); // Restart the game
        }
        if (event.code === "KeyM" && gameOver) {
            setGameState("menu"); // Return to the menu
        }
        if (event.code === "KeyF" || event.code === "KeyJ") {
            bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, player.direction)); // Shoot a bullet
            shootSound.play(); // Play shoot sound
        }
    });

    window.addEventListener('keyup', (event) => keys[event.code] = false); // Mark the key as released

    // Function to handle player movement
    function handleMovement() {
        if (keys['ArrowLeft'] || keys['KeyA']) {
            player.x -= player.speed; // Move left
            player.direction = -1; // Face left
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            player.x += player.speed; // Move right
            player.direction = 1; // Face right
        }

        player.velocityY += 0.5; // Apply gravity
        player.y += player.velocityY; // Update Y position

        let onPlatform = false; // Track if the player is on a platform
        platforms.forEach(platform => {
            platform.update(); // Update the platform

            if (
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height >= platform.y &&
                player.y + player.height - player.velocityY <= platform.y
            ) {
                if (platform.hasSpikes && player.x + player.width > platform.spikeX && player.x < platform.spikeX + platform.spikeWidth) {
                    if (!player.isShieldActive) {
                        gameOver = true; // Game over if the player hits spikes
                        spikeDeathSound.play(); // Play spike death sound
                        updateHighScore(); // Update high score
                    } else {
                        player.y = platform.y - player.height; // Land on the platform
                        player.velocityY = 0;
                        onPlatform = true;
                    }
                } else {
                    player.y = platform.y - player.height; // Land on the platform
                    player.velocityY = 0;
                    onPlatform = true;

                    if (platform.isMoving) {
                        player.x += platform.direction * platform.speed; // Move the player with the platform
                    }

                    if (player.lastPlatform !== platform) {
                        player.score += 10; // Increase score for landing on a new platform
                        player.lastPlatform = platform;
                    }
                }
            }
        });

        if (!onPlatform) {
            player.isJumping = true; // Player is in the air
        } else {
            if (player.isJumping) {
                isJumpLanding = true; // Player is landing
                setTimeout(() => {
                    isJumpLanding = false; // Reset landing state
                    isJumping = false; // Reset jumping state
                }, 100);
            }
            player.isJumping = false; // Player is on a platform
        }

        if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && !player.isJumping) {
            isJumpStarting = true; // Player is starting a jump
            setTimeout(() => {
                isJumpStarting = false;
                isJumping = true;
            }, 100);
            player.velocityY = -player.jumpHeight; // Apply jump force
            player.isJumping = true;
            jumpSound.play(); // Play jump sound
        }

        if (player.y > canvas.height) {
            gameOver = true; // Game over if the player falls off the screen
            setGameState("gameOver"); // Set game state to "gameOver"
            fallSound.play(); // Play fall sound
            updateHighScore(); // Update high score
        }
    }

    // Function to update the high score
    function updateHighScore() {
        if (player.score > highScore) {
            highScore = player.score; // Update high score
            localStorage.setItem("highScore", highScore); // Save high score to localStorage
            newHighScoreSound.play(); // Play new high score sound
        }
    }

    // Function to activate the shield
    function activateShield(duration) {
        player.isShieldActive = true; // Activate shield
        player.shieldTimer = duration * 60; // Set shield timer
    }

    // Function to update the shield timer
    function updateShield() {
        if (player.isShieldActive) {
            player.shieldTimer--;
            if (player.shieldTimer <= 0) {
                player.isShieldActive = false; // Deactivate shield when timer runs out
            }
        }
    }

    // Function to reset the game
    function resetGame() {
        stopAllMusic(); // Stop all music

        resizeCanvas(); // Resize the canvas

        gameOver = false; // Reset game over state
        isDying = false; // Reset dying state
        isJumping = false; // Reset jumping state
        isJumpStarting = false; // Reset jump start state
        isJumpLanding = false; // Reset jump landing state

        player.x = 100; // Reset player X position
        player.y = canvas.height - 150; // Reset player Y position
        player.velocityX = 0; // Reset horizontal velocity
        player.velocityY = 0; // Reset vertical velocity
        player.score = 0; // Reset score
        player.lastPlatform = null; // Reset last platform
        player.isShieldActive = false; // Deactivate shield
        player.shieldTimer = 0; // Reset shield timer

        camera.x = 0; // Reset camera position

        platforms.length = 1; // Reset platforms (keep the initial platform)
        enemies.length = 0; // Reset enemies
        bullets.length = 0; // Reset bullets
        enemyBullets.length = 0; // Reset enemy bullets
        shieldPowerUps.length = 0; // Reset power-ups

        generatePlatforms(); // Generate new platforms

        playerDeathSound.volume = 0.5; // Reset player death sound volume
        spikeDeathSound.volume = 0.5; // Reset spike death sound volume
        fallSound.volume = 0.5; // Reset fall sound volume

        playGameMusic(); // Start game music
    }

    // Function to draw the game over screen
    function drawGameOverScreen() {
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height); // Draw menu background
        } else {
            ctx.fillStyle = "black"; // Fallback background color
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "red"; // Title color
        ctx.font = "60px Arial"; // Title font
        ctx.textAlign = "center"; // Center align text
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 150); // Draw title

        ctx.fillStyle = "white"; // Score text color
        ctx.font = "30px Arial"; // Score font
        ctx.fillText(`${playerName}, your score is: ${player.score}`, canvas.width / 2, canvas.height / 2 - 50); // Draw score

        ctx.fillStyle = "gold"; // High score text color
        ctx.font = "30px Arial"; // High score font
        ctx.fillText(`Your High Score: ${highScore}`, canvas.width / 2, canvas.height / 2); // Draw high score

        ctx.fillStyle = "cyan"; // Game over message color
        ctx.font = "25px Arial"; // Message font
        ctx.textAlign = "center"; // Center align text
        ctx.fillText(currentGameOverMessage, canvas.width / 2, canvas.height / 2 + 50); // Draw game over message

        ctx.fillStyle = "white"; // Instruction text color
        ctx.font = "20px Arial"; // Instruction font
        ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 140); // Draw restart instruction
        ctx.fillText("Press M to Return to Menu", canvas.width / 2, canvas.height / 2 + 180); // Draw menu instruction
    }

    // Array of menu items
    let menuItems = ["Start Game", "Settings", "How To Play", "Highest Score"];
    let menuPositions = []; // Store positions of menu items
    let hoveredIndex = -1; // Track hovered menu item
    let hoverAnimation = { opacity: 1, scale: 1 }; // Hover animation properties

    // Track hover states for Facebook, Instagram, and Privacy Policy
    let hoveredFacebook = false;
    let hoveredInstagram = false;
    let hoveredPrivacyPolicy = false;

    // Function to draw the main menu
    function drawMainMenu() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height); // Draw menu background
        } else {
            ctx.fillStyle = "black"; // Fallback background color
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    
        ctx.fillStyle = "cyan"; // Title color
        ctx.font = "bold 80px Arial"; // Title font
        ctx.shadowColor = "blue"; // Title shadow color
        ctx.shadowBlur = 50; // Title shadow blur
        ctx.textAlign = "left"; // Left align text
        ctx.fillText("Cyber Ninja Astronaut", 100, 80); // Draw title
        ctx.shadowBlur = 0; // Reset shadow blur
        ctx.shadowColor = "transparent"; // Reset shadow color
    
        let centerX = canvas.width - 350; // Center X position for menu items
        let centerY = canvas.height / 2; // Center Y position for menu items
        let radius = 180; // Radius for menu item placement
    
        for (let i = 0; i < menuItems.length; i++) {
            let angle = (-Math.PI / 3.5) + (i * (Math.PI / 5)); // Calculate angle for menu item
            let x = centerX + radius * Math.cos(angle); // Calculate X position
            let y = centerY + radius * Math.sin(angle); // Calculate Y position
    
            ctx.font = "30px Arial"; // Menu item font
            let textWidth = ctx.measureText(menuItems[i]).width; // Measure text width
            let padding = 10; // Padding around text
            let boxWidth = textWidth + padding * 2; // Box width
            let boxHeight = 40; // Box height
    
            menuPositions[i] = {
                x: x - boxWidth / 2, // Left edge of the button
                y: y - 30, // Top edge of the button
                width: boxWidth, // Button width
                height: boxHeight // Button height
            };
    
            ctx.save(); // Save canvas state
    
            if (hoveredIndex === i) {
                ctx.globalAlpha = hoverAnimation.opacity; // Apply hover opacity
                ctx.translate(x, y); // Translate to menu item position
                ctx.scale(hoverAnimation.scale, hoverAnimation.scale); // Apply hover scale
                ctx.translate(-x, -y); // Translate back
            }
    
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Button background color
            ctx.fillRect(x - boxWidth / 2, y - 30, boxWidth, boxHeight); // Draw button background
    
            ctx.strokeStyle = "white"; // Button border color
            ctx.lineWidth = 3; // Button border width
            ctx.strokeRect(x - boxWidth / 2, y - 30, boxWidth, boxHeight); // Draw button border
    
            ctx.fillStyle = hoveredIndex === i ? "rgba(255, 255, 0, 1)" : "rgba(0, 255, 255, 1)"; // Button text color
            ctx.shadowColor = hoveredIndex === i ? "yellow" : "cyan"; // Button shadow color
            ctx.shadowBlur = 10; // Button shadow blur
            ctx.textAlign = "center"; // Center align text
            ctx.fillText(menuItems[i], x, y); // Draw menu item text
    
            ctx.restore(); // Restore canvas state
        }
    
        // Draw the credits background (transparent overlay)
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Dark overlay for readability
        ctx.fillRect(0, canvas.height - 75, canvas.width, 75); // Background box
    
        // Draw Facebook and Instagram logos with hover effect
        facebookX = 20; // X position for Facebook logo
        facebookY = canvas.height - logoSize - 20; // Y position for Facebook logo
        ctx.globalAlpha = hoveredFacebook ? 0.5 : 1; // Change opacity on hover
        ctx.drawImage(facebookLogo, facebookX, facebookY, logoSize, logoSize); // Draw Facebook logo
        ctx.globalAlpha = 1; // Reset opacity
    
        instagramX = facebookX + logoSize + logoPadding; // X position for Instagram logo
        instagramY = canvas.height - logoSize - 20; // Y position for Instagram logo
        ctx.globalAlpha = hoveredInstagram ? 0.5 : 1; // Change opacity on hover
        ctx.drawImage(instagramLogo, instagramX, instagramY, logoSize, logoSize); // Draw Instagram logo
        ctx.globalAlpha = 1; // Reset opacity
    
        privacyPolicyX = instagramX + logoSize + logoPadding; // X position for Privacy Policy text
        privacyPolicyY = canvas.height - 32; // Y position for Privacy Policy text
        ctx.fillStyle = hoveredPrivacyPolicy ? "yellow" : "cyan"; // Change color on hover
        ctx.font = "20px Arial"; // Text font
        ctx.fillText(privacyPolicyText, privacyPolicyX, privacyPolicyY); // Draw Privacy Policy text
    
        // Draw credits text (on top of the transparent background)
        ctx.font = "15px Arial";
        ctx.textAlign = "right";
    
        ctx.fillStyle = "cyan"; // Neon cyan color
        ctx.shadowColor = "blue"; // Glowing blue shadow
        ctx.shadowBlur = 35; // Soft glow effect
    
        ctx.fillText(`Hope you had fun, ${playerName}!`, canvas.width - 20, canvas.height - 55);
    
        ctx.fillText("Thank you for playing my Game!", canvas.width - 20, canvas.height - 35);
    
        ctx.fillText("Created by RMZ", canvas.width - 20, canvas.height - 15);
    
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
    }

    // Event listener for mouse movement on the canvas
    canvas.addEventListener("mousemove", (e) => {
        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left; // Mouse X position relative to canvas
        let mouseY = e.clientY - rect.top; // Mouse Y position relative to canvas
    
        // Reset hover states for links
        hoveredFacebook = false;
        hoveredInstagram = false;
        hoveredPrivacyPolicy = false;
    
        // Check if mouse is over Facebook logo
        if (
            mouseX >= facebookX &&
            mouseX <= facebookX + logoSize &&
            mouseY >= facebookY &&
            mouseY <= facebookY + logoSize
        ) {
            hoveredFacebook = true;
        }
    
        // Check if mouse is over Instagram logo
        if (
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
        hoveredIndex = -1; // Reset hovered index
        for (let i = 0; i < menuPositions.length; i++) {
            let pos = menuPositions[i];
            if (
                mouseX >= pos.x &&
                mouseX <= pos.x + pos.width &&
                mouseY >= pos.y &&
                mouseY <= pos.y + pos.height
            ) {
                hoveredIndex = i; // Set hovered index if mouse is over a menu item
                break;
            }
        }
    });
    
    canvas.addEventListener("click", (e) => {
        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left; // Mouse X position relative to canvas
        let mouseY = e.clientY - rect.top; // Mouse Y position relative to canvas
    
        // Check if Facebook logo is clicked
        if (
            mouseX >= facebookX &&
            mouseX <= facebookX + logoSize &&
            mouseY >= facebookY &&
            mouseY <= facebookY + logoSize
        ) {
            window.open("https://www.facebook.com", "_blank"); // Open Facebook in a new tab
        }
    
        // Check if Instagram logo is clicked
        if (
            mouseX >= instagramX &&
            mouseX <= instagramX + logoSize &&
            mouseY >= instagramY &&
            mouseY <= instagramY + logoSize
        ) {
            window.open("https://www.instagram.com", "_blank"); // Open Instagram in a new tab
        }
    
        // Check if Privacy Policy text is clicked
        const privacyPolicyTextWidth = ctx.measureText(privacyPolicyText).width;
        if (
            mouseX >= privacyPolicyX &&
            mouseX <= privacyPolicyX + privacyPolicyTextWidth &&
            mouseY >= privacyPolicyY - 20 &&
            mouseY <= privacyPolicyY
        ) {
            window.open("https://www.yourwebsite.com/privacy-policy", "_blank"); // Open Privacy Policy in a new tab
        }
    });

    // Function to draw the settings menu
    function drawSettingsMenu() {
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height); // Draw menu background
        } else {
            ctx.fillStyle = "black"; // Fallback background color
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white"; // Title color
        ctx.font = "60px Arial"; // Title font
        ctx.textAlign = "center"; // Center align text
        ctx.fillText("Settings", canvas.width / 2, canvas.height / 2 - 150); // Draw title

        ctx.font = "30px Arial"; // Settings text font
        ctx.fillText("1. Sound Volume: " + Math.round(gameMusic.volume * 100) + "%", canvas.width / 2, canvas.height / 2 - 50); // Draw volume setting
        ctx.fillText("2. Back to Main Menu", canvas.width / 2, canvas.height / 2); // Draw back option

        ctx.font = "20px Arial"; // Instruction font
        ctx.fillText("Use Arrow Keys to adjust volume. Press Enter to go back.", canvas.width / 2, canvas.height / 2 + 100); // Draw instructions
    }

    // Function to draw the "How to Play" screen
    function drawHowToPlayScreen() {
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height); // Draw menu background
        } else {
            ctx.fillStyle = "black"; // Fallback background color
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white"; // Title color
        ctx.font = "60px Arial"; // Title font
        ctx.textAlign = "center"; // Center align text
        ctx.fillText("How to Play", canvas.width / 2, canvas.height / 2 - 150); // Draw title

        ctx.font = "20px Arial"; // Instruction font
        ctx.textAlign = "left"; // Left align text
        const instructions = [
            "1. Use Arrow Keys or WASD to move.",
            "2. Press Space to jump.",
            "3. Press F or J to shoot.",
            "4. Avoid enemies and spikes.",
            "5. Collect power-ups for shields.",
            "6. Reach the highest score!"
        ];
        instructions.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2 - 200, canvas.height / 2 - 50 + index * 30); // Draw instructions
        });

        ctx.font = "30px Arial"; // Back option font
        ctx.textAlign = "center"; // Center align text
        ctx.fillText("Press Enter to go back", canvas.width / 2, canvas.height / 2 + 150); // Draw back option
    }

    // Function to update game logic
    function update() {
        if (!gameOver) {
            updateShield(); // Update shield timer
            handleMovement(); // Handle player movement
            generatePlatforms(); // Generate new platforms
            camera.update(); // Update camera position

            bullets.forEach(bullet => bullet.update()); // Update player bullets
            bullets.forEach((bullet, bulletIndex) => {
                enemies.forEach((enemy, enemyIndex) => {
                    if (bullet.hitEnemy(enemy)) { // Check if bullet hits an enemy
                        bullets.splice(bulletIndex, 1); // Remove bullet
                        enemy.explode(); // Trigger enemy explosion
                        player.score += 20; // Increase score
                    }
                });

                if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                    bullets.splice(bulletIndex, 1); // Remove bullet if it goes off-screen
                }
            });

            enemies.forEach(enemy => {
                enemy.update(); // Update enemies
                if (
                    player.x + player.width > enemy.x &&
                    player.x < enemy.x + enemy.width &&
                    player.y + player.height > enemy.y &&
                    player.y < enemy.y + enemy.height
                ) {
                    if (!player.isShieldActive) {
                        gameOver = true; // Game over if player collides with an enemy
                        playerDeathSound.play(); // Play death sound
                        updateHighScore(); // Update high score
                    }
                }
            });

            enemyBullets.forEach(bullet => bullet.update()); // Update enemy bullets
            enemyBullets.forEach((bullet, bulletIndex) => {
                if (
                    bullet.x + bullet.width > player.x &&
                    bullet.x < player.x + player.width &&
                    bullet.y + bullet.height > player.y &&
                    bullet.y < player.y + player.height
                ) {
                    if (!player.isShieldActive) {
                        gameOver = true; // Game over if player is hit by an enemy bullet
                        playerDeathSound.play(); // Play death sound
                        updateHighScore(); // Update high score
                    }
                }

                if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                    enemyBullets.splice(bulletIndex, 1); // Remove enemy bullet if it goes off-screen
                }
            });

            shieldPowerUps.forEach((powerUp, index) => {
                if (powerUp.isCollected()) { // Check if player collects a power-up
                    activateShield(powerUp.duration); // Activate shield
                    shieldPowerUps.splice(index, 1); // Remove power-up
                    powerUpSound.play(); // Play power-up sound
                }
            });
        }
    }

    // Function to draw the player's score
    function drawScore() {
        ctx.font = "20px Arial"; // Score font

        const scoreText = `${playerName} your current score is: ${player.score}`; // Score text
        const highScoreText = `Highest Score: ${highScore}`; // High score text
        const scoreWidth = ctx.measureText(scoreText).width; // Score text width
        const highScoreWidth = ctx.measureText(highScoreText).width; // High score text width
        const textHeight = 20; // Text height

        const paddingX = 8; // Horizontal padding
        const paddingY = 3; // Vertical padding

        const boxHeight = textHeight + paddingY * 2 - 4; // Box height

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Background color
        ctx.fillRect(10, 10, scoreWidth + paddingX * 2, boxHeight); // Draw score background
        ctx.fillRect(canvas.width - highScoreWidth - 20, 10, highScoreWidth + paddingX * 2, boxHeight); // Draw high score background

        ctx.fillStyle = "white"; // Score text color
        ctx.fillText(scoreText, 20, 10 + textHeight - 3); // Draw score

        ctx.fillStyle = "gold"; // High score text color
        ctx.fillText(highScoreText, canvas.width - highScoreWidth - 10, 10 + textHeight - 3); // Draw high score
    }

    // Function to draw the player
    function drawPlayer() {
        if (gameOver) {
            currentAnimation = playerAnimations.dieLie; // Use death animation if game is over
        } else if (isJumpStarting) {
            currentAnimation = playerAnimations.jumpStart; // Use jump start animation
        } else if (isJumping) {
            currentAnimation = playerAnimations.jump; // Use jump animation
        } else if (isJumpLanding) {
            currentAnimation = playerAnimations.jumpLand; // Use jump landing animation
        } else if (keys['ArrowLeft'] || keys['ArrowRight'] || keys['KeyA'] || keys['KeyD']) {
            currentAnimation = playerAnimations.walk; // Use walk animation if moving
        } else {
            currentAnimation = playerAnimations.idle; // Use idle animation
        }

        if (!gameOver || (gameOver && currentAnimation !== playerAnimations.dieLie)) {
            currentAnimation.update(); // Update animation
        }

        const frame = currentAnimation.getCurrentFrame(); // Get current frame

        ctx.save(); // Save canvas state
        if (player.direction === -1) {
            ctx.scale(-1, 1); // Flip player if facing left
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
        ctx.restore(); // Restore canvas state

        if (player.isShieldActive) {
            ctx.strokeStyle = "cyan"; // Shield color
            ctx.lineWidth = 3; // Shield border width
            ctx.strokeRect(player.x - camera.x - 5, player.y - 5, player.width + 10, player.height + 10); // Draw shield
        }
    }

    // Function to render the game
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        const imageWidth = backgroundImage.width; // Background image width
        const imageHeight = backgroundImage.height; // Background image height
        const scale = canvas.height / imageHeight; // Scale to fit canvas height
        const scaledWidth = imageWidth * scale; // Scaled background width

        const numTiles = Math.ceil(canvas.width / scaledWidth) + 1; // Number of tiles needed to cover the canvas

        const offset = (camera.x * 0.5) % scaledWidth; // Offset for seamless tiling

        for (let i = -1; i < numTiles; i++) {
            ctx.drawImage(
                backgroundImage,
                i * scaledWidth - offset,
                0,
                scaledWidth,
                canvas.height
            ); // Draw background tiles
        }

        platforms.forEach(platform => platform.draw()); // Draw platforms
        enemies.forEach(enemy => enemy.draw()); // Draw enemies
        bullets.forEach(bullet => bullet.draw()); // Draw player bullets
        enemyBullets.forEach(bullet => bullet.draw()); // Draw enemy bullets
        shieldPowerUps.forEach(powerUp => powerUp.draw()); // Draw power-ups
        drawPlayer(); // Draw the player
        drawScore(); // Draw the score

        if (gameOver) {
            drawGameOverScreen(); // Draw the game over screen
        }
    }

    // Game loop function
    function gameLoop() {
        if (gameState === "menu") {
            if (hoveredIndex !== -1) {
                hoverAnimation.opacity = Math.min(hoverAnimation.opacity + 0.05, 1); // Fade in hover effect
                hoverAnimation.scale = Math.min(hoverAnimation.scale + 0.01, 1.1); // Scale up hover effect
            } else {
                hoverAnimation.opacity = Math.max(hoverAnimation.opacity - 0.05, 0.8); // Fade out hover effect
                hoverAnimation.scale = Math.max(hoverAnimation.scale - 0.01, 1); // Scale down hover effect
            }

            if (settingsState) {
                drawSettingsMenu(); // Draw the settings menu
            } else if (howToPlayState) {
                drawHowToPlayScreen(); // Draw the "How to Play" screen
            } else {
                drawMainMenu(); // Draw the main menu
            }
            playMenuMusic(); // Play menu music
        } else if (gameState === "playing") {
            update(); // Update game logic
            render(); // Render the game
            playGameMusic(); // Play game music
        } else if (gameState === "gameOver") {
            drawGameOverScreen(); // Draw the game over screen
        }

        requestAnimationFrame(gameLoop); // Continue the game loop
    }

    // Event listener for mouse clicks on the canvas
    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left; // Mouse X position relative to canvas
        const mouseY = event.clientY - rect.top; // Mouse Y position relative to canvas

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
                    setGameState("playing"); // Restart the game
                } else if (mouseY > canvas.height / 2 + 120 && mouseY < canvas.height / 2 + 160) {
                    setGameState("menu"); // Return to the menu
                }
            }
        }
    });

    // Event listener for key presses
    window.addEventListener('keydown', (event) => {
        if (gameState === "menu") {
            if (settingsState) {
                if (event.code === "ArrowUp") {
                    gameMusic.volume = Math.min(1, gameMusic.volume + 0.1); // Increase volume
                    menuMusic.volume = Math.min(1, menuMusic.volume + 0.1);
                } else if (event.code === "ArrowDown") {
                    gameMusic.volume = Math.max(0, gameMusic.volume - 0.1); // Decrease volume
                    menuMusic.volume = Math.max(0, menuMusic.volume - 0.1);
                } else if (event.code === "Enter") {
                    settingsState = false; // Go back to the main menu
                }
            } else if (howToPlayState) {
                if (event.code === "Enter") {
                    howToPlayState = false; // Go back to the main menu
                }
            }
        } else if (gameState === "gameOver") {
            if (event.code === "KeyR") {
                setGameState("playing"); // Restart the game
            } else if (event.code === "KeyM") {
                setGameState("menu"); // Return to the menu
            }
        }
    });

    // Ensure all assets are loaded before starting the game
    Promise.all([
        new Promise((resolve) => { backgroundImage.onload = resolve; }),
        new Promise((resolve) => { playerSpriteSheet.onload = resolve; }),
        new Promise((resolve) => { nonShootingEnemySpriteSheet.onload = resolve; }),
        new Promise((resolve) => { shootingEnemySpriteSheet.onload = resolve; }),
        new Promise((resolve) => { platformImage.onload = resolve; }),
        new Promise((resolve) => { movingPlatformImage.onload = resolve; }),
        new Promise((resolve) => { spikeImage.onload = resolve; }),
        new Promise((resolve) => { menuImage.onload = resolve; }),
        new Promise((resolve) => { facebookLogo.onload = resolve; }),
        new Promise((resolve) => { instagramLogo.onload = resolve; }),
        new Promise((resolve) => {
            gameMusic.addEventListener("canplaythrough", resolve);
        }),
        new Promise((resolve) => {
            menuMusic.addEventListener("canplaythrough", resolve);
        }),
        new Promise((resolve) => {
            powerUpSound.addEventListener("canplaythrough", resolve);
        }),
        new Promise((resolve) => {
            newHighScoreSound.addEventListener("canplaythrough", resolve);
        })
    ]).then(() => {
        gameLoop(); // Start the game loop
    });
});
