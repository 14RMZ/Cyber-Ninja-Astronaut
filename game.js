const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let gameOver = false;
let highScore = localStorage.getItem("highScore") || 0;
highScore = parseInt(highScore);

// Load the background image
const backgroundImage = new Image();
backgroundImage.src = "GameBackground.jpg";

// Load the player sprite sheet
const playerSpriteSheet = new Image();
playerSpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/sprite_sheet.png"; // Replace with your sprite sheet path


// Player animation frames
const playerAnimations = {
    idle: { frames: [{ x: 0, y: 0, width: 32, height: 48 }], frameRate: 1 }, // Idle animation
    walk: { frames: [{ x: 32, y: 0, width: 32, height: 48 }, { x: 64, y: 0, width: 32, height: 48 }], frameRate: 10 }, // Walking animation
    jump: { frames: [{ x: 96, y: 0, width: 32, height: 48 }], frameRate: 1 }, // Jumping animation
    die: { frames: [{ x: 128, y: 0, width: 32, height: 48 }], frameRate: 1 } // Dying animation
};

let currentAnimation = playerAnimations.idle; // Current animation
let currentFrameIndex = 0; // Current frame index
let frameTimer = 0; // Timer for frame switching

const player = {
    x: 100,
    y: canvas.height - 150,
    width: 32, // Width of the player sprite
    height: 48, // Height of the player sprite
    velocityX: 0,
    velocityY: 0,
    speed: 6,
    jumpHeight: 14,
    isJumping: false,
    direction: 1, // 1 for right, -1 for left
    score: 0,
    lastPlatform: null,
    isShieldActive: false, // Track if the shield is active
    shieldTimer: 0 // Track the remaining shield duration
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
        ctx.fillStyle = this.isMoving ? "purple" : "#654321";
        ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);

        if (this.hasSpikes) {
            ctx.fillStyle = "red";
            for (let i = 0; i < this.spikeWidth; i += 20) {
                ctx.beginPath();
                ctx.moveTo(this.spikeX + i - camera.x, this.y);
                ctx.lineTo(this.spikeX + i + 10 - camera.x, this.y - 15);
                ctx.lineTo(this.spikeX + i + 20 - camera.x, this.y);
                ctx.fill();
            }
        }
    }
}

class Enemy {
    constructor(platform, color = "green") {
        this.platform = platform;
        this.x = platform.x + platform.width / 4;
        this.y = platform.y - 30;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.direction = 1;
        this.minX = platform.x + 10;
        this.maxX = platform.x + platform.width - this.width - 10;
        this.color = color; // Set the color of the enemy
    }

    update() {
        this.x += this.direction * this.speed;
        if (this.x <= this.minX || this.x >= this.maxX) {
            this.direction *= -1;
        }
    }

    draw() {
        ctx.fillStyle = this.color; // Use the enemy's color
        ctx.fillRect(this.x - camera.x, this.y, this.width, this.height);
    }
}

class ShootingEnemy extends Enemy {
    constructor(platform) {
        super(platform, "red"); // Set color to red
        this.shootCooldown = 100; // Cooldown between shots (in frames)
        this.shootTimer = 0; // Timer to track cooldown
    }

    update() {
        super.update(); // Call the parent class's update method

        // Shoot bullets at the player
        if (this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = this.shootCooldown;
        } else {
            this.shootTimer--;
        }
    }

    shoot() {
        // Calculate direction to shoot at the player
        const direction = player.x > this.x ? 1 : -1;
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y + this.height / 2;

        // Add a new bullet to the enemyBullets array
        enemyBullets.push(new Bullet(bulletX, bulletY, direction));
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
        this.duration = 5; // Shield lasts for 5 seconds
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
const enemyBullets = []; // Array to store bullets fired by enemies
const shieldPowerUps = []; // Array to store shield power-ups

function generatePlatforms() {
    let lastPlatform = platforms[platforms.length - 1];
    if (lastPlatform.x - camera.x < canvas.width - 250) {
        let x = lastPlatform.x + lastPlatform.width + Math.random() * 120 + 80;
        let y = Math.min(lastPlatform.y + (Math.random() * 60 - 30), canvas.height - 120);
        let isMoving = Math.random() > 0.6;

        // Introduce spikes after 50 points
        let hasSpikes = player.score >= 50 && Math.random() > 0.7;

        // Introduce green enemies after 100 points
        let hasGreenEnemy = player.score >= 100 && !isMoving && !hasSpikes && Math.random() > 0.5;

        // Introduce red enemies after 250 points
        let hasRedEnemy = player.score >= 250 && !isMoving && !hasSpikes && Math.random() > 0.5;

        // Introduce shield power-up after 150 points
        let hasShieldPowerUp = player.score >= 150 && Math.random() > 0.8;

        let platform = new Platform(x, y, 180, 20, isMoving, hasSpikes);
        platforms.push(platform);

        if (hasGreenEnemy) {
            enemies.push(new Enemy(platform)); // Green enemy
        }

        if (hasRedEnemy) {
            enemies.push(new ShootingEnemy(platform)); // Red enemy
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
        resetGame();
    }
    if (event.code === "KeyF") {
        bullets.push(new Bullet(player.x + player.width / 2, player.y + player.height / 2, player.direction));
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
                    gameOver = true; // Player dies if not shielded
                } else {
                    // If shielded, treat the platform as a normal platform (no spikes)
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    onPlatform = true;
                }
            } else {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                onPlatform = true;

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
        player.isJumping = false;
    }

    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && !player.isJumping) {
        player.velocityY = -player.jumpHeight;
        player.isJumping = true;
    }

    if (player.y > canvas.height) {
        gameOver = true;
        if (player.score > highScore) {
            highScore = player.score;
            localStorage.setItem("highScore", highScore);
        }
    }
}

function activateShield(duration) {
    player.isShieldActive = true;
    player.shieldTimer = duration * 60; // Convert seconds to frames (assuming 60 FPS)
}

function updateShield() {
    if (player.isShieldActive) {
        player.shieldTimer--;
        if (player.shieldTimer <= 0) {
            player.isShieldActive = false; // Deactivate shield
        }
    }
}

function resetGame() {
    gameOver = false;
    player.x = 100;
    player.y = canvas.height - 150;
    player.score = 0;
    player.lastPlatform = null;
    player.isShieldActive = false;
    player.shieldTimer = 0;
    platforms.length = 1;
    enemies.length = 0;
    bullets.length = 0;
    enemyBullets.length = 0;
    shieldPowerUps.length = 0;
    generatePlatforms();
}

function update() {
    if (!gameOver) {
        updateShield(); // Update shield timer
        handleMovement();
        generatePlatforms();
        camera.update();

        // Update player bullets
        bullets.forEach(bullet => bullet.update());
        bullets.forEach((bullet, bulletIndex) => {
            enemies.forEach((enemy, enemyIndex) => {
                if (bullet.hitEnemy(enemy)) {
                    bullets.splice(bulletIndex, 1);
                    enemies.splice(enemyIndex, 1);
                    player.score += 20;
                }
            });
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
                    gameOver = true; // Player dies if not shielded
                }
            }
        });

        // Update enemy bullets
        enemyBullets.forEach(bullet => bullet.update());
        enemyBullets.forEach((bullet, bulletIndex) => {
            // Check for collision with the player
            if (
                bullet.x + bullet.width > player.x &&
                bullet.x < player.x + player.width &&
                bullet.y + bullet.height > player.y &&
                bullet.y < player.y + player.height
            ) {
                if (!player.isShieldActive) {
                    gameOver = true; // Player dies if not shielded
                }
            }

            // Remove bullets that go off-screen
            if (bullet.x < camera.x || bullet.x > camera.x + canvas.width) {
                enemyBullets.splice(bulletIndex, 1);
            }
        });

        // Check for shield power-up collection
        shieldPowerUps.forEach((powerUp, index) => {
            if (powerUp.isCollected()) {
                activateShield(powerUp.duration);
                shieldPowerUps.splice(index, 1); // Remove the collected power-up
            }
        });
    }
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${player.score}`, 20, 30);
}

function drawPlayer() {
    // Update animation based on player state
    if (gameOver) {
        currentAnimation = playerAnimations.die; // Dying animation
    } else if (player.isJumping) {
        currentAnimation = playerAnimations.jump; // Jumping animation
    } else if (keys['ArrowLeft'] || keys['ArrowRight'] || keys['KeyA'] || keys['KeyD']) {
        currentAnimation = playerAnimations.walk; // Walking animation
    } else {
        currentAnimation = playerAnimations.idle; // Idle animation
    }

    // Update frame index
    frameTimer++;
    if (frameTimer >= currentAnimation.frameRate) {
        frameTimer = 0;
        currentFrameIndex = (currentFrameIndex + 1) % currentAnimation.frames.length;
    }

    // Get the current frame
    const frame = currentAnimation.frames[currentFrameIndex];

    // Draw the player sprite
    ctx.save();
    if (player.direction === -1) {
        // Flip the sprite if facing left
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

    // Draw shield if active
    if (player.isShieldActive) {
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 3;
        ctx.strokeRect(player.x - camera.x - 5, player.y - 5, player.width + 10, player.height + 10);
    }
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
    ctx.fillText(`Your Score: ${player.score}`, canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = "gold";
    ctx.font = "30px Arial";
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 100);
}

function render() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the tiled background image
    const imageWidth = backgroundImage.width; // Width of the background image
    const imageHeight = backgroundImage.height; // Height of the background image
    const scale = canvas.height / imageHeight; // Scale the image to fit the canvas height
    const scaledWidth = imageWidth * scale; // Scaled width of the image

    // Calculate how many times to draw the image
    const numTiles = Math.ceil(canvas.width / scaledWidth) + 1; // +1 to ensure full coverage

    // Calculate the offset based on the camera's x position
    const offset = (camera.x * 0.5) % scaledWidth;

    // Draw the tiled background
    for (let i = -1; i < numTiles; i++) {
        ctx.drawImage(
            backgroundImage,
            i * scaledWidth - offset, // X position
            0, // Y position
            scaledWidth, // Scaled width
            canvas.height // Scaled height
        );
    }

    // Draw platforms, enemies, bullets, etc.
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

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game loop once the background image is loaded
backgroundImage.onload = () => {
    gameLoop();
};
