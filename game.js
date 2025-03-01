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
backgroundImage.onerror = () => {
    console.error("Failed to load background image.");
    backgroundImage.onload = () => {};
    backgroundImage.src = "";
};

// Load the player sprite sheet
const playerSpriteSheet = new Image();
playerSpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/NewPlayermovement.png";
playerSpriteSheet.onerror = () => {
    console.error("Failed to load player sprite sheet.");
    playerSpriteSheet.onload = () => {};
    playerSpriteSheet.src = "";
};

// Load the enemy sprite sheet
const enemySpriteSheet = new Image();
enemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AlienRoboticEnemyMovement.png"; // Your enemy sprite sheet
enemySpriteSheet.onerror = () => {
    console.error("Failed to load enemy sprite sheet.");
    enemySpriteSheet.onload = () => {};
    enemySpriteSheet.src = "";
};

// Load platform images
const platformImage = new Image();
platformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/platform.jpg"; // Non-moving platform image
platformImage.onerror = () => {
    console.error("Failed to load platform image.");
    platformImage.onload = () => {};
    platformImage.src = "";
};

const movingPlatformImage = new Image();
movingPlatformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/moving-platform.jpg"; // Moving platform image
movingPlatformImage.onerror = () => {
    console.error("Failed to load moving platform image.");
    movingPlatformImage.onload = () => {};
    movingPlatformImage.src = "";
};

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

// Enemy animation frames
const enemyAnimations = {
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
        // Draw the platform image or a fallback rectangle
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

        // Draw spikes if the platform has them
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
        this.currentAnimation = enemyAnimations.walk;
        this.isExploding = false; // Track if the enemy is exploding
        this.explodeTimer = 0; // Timer for explosion animation
    }

    update() {
        if (this.isExploding) {
            // Handle explosion
            this.explodeTimer++;
            if (this.explodeTimer >= 5) { // Explosion lasts for 1 second (60 frames)
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
                enemySpriteSheet,
                frame.x, frame.y, frame.width, frame.height,
                -this.x + camera.x - frame.width, this.y, frame.width, frame.height
            );
        } else {
            ctx.drawImage(
                enemySpriteSheet,
                frame.x, frame.y, frame.width, frame.height,
                this.x - camera.x, this.y, frame.width, frame.height
            );
        }
        ctx.restore();
    }

    explode() {
        this.isExploding = true;
        this.currentAnimation = enemyAnimations.explode; // Switch to explosion animation
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
        let hasGreenEnemy = player.score >= 100 && !isMoving && !hasSpikes && Math.random() > 0.5;
        let hasRedEnemy = player.score >= 250 && !isMoving && !hasSpikes && Math.random() > 0.5;
        let hasShieldPowerUp = player.score >= 150 && Math.random() > 0.8;

        let platform = new Platform(x, y, 180, 20, isMoving, hasSpikes);
        platforms.push(platform);

        if (hasGreenEnemy) {
            enemies.push(new Enemy(platform));
        }

        if (hasRedEnemy) {
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
        resetGame();
    }
    if (event.code === "KeyF") {
        // Player shoots a bullet
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
                    gameOver = true;
                } else {
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
    gameOver = false;
    isDying = false;
    isJumping = false;
    isJumpStarting = false;
    isJumpLanding = false;
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
        updateShield();
        handleMovement();
        generatePlatforms();
        camera.update();

        // Update bullets
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

// Ensure all images are loaded before starting the game
Promise.all([
    new Promise((resolve) => { backgroundImage.onload = resolve; }),
    new Promise((resolve) => { playerSpriteSheet.onload = resolve; }),
    new Promise((resolve) => { enemySpriteSheet.onload = resolve; }),
    new Promise((resolve) => { platformImage.onload = resolve; }),
    new Promise((resolve) => { movingPlatformImage.onload = resolve; })
]).then(() => {
    gameLoop();
});
