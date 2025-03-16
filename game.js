document.addEventListener("DOMContentLoaded", () => {
    const welcomeModal = document.getElementById("welcomeModal");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const howToPlayMessage = document.getElementById("howToPlayMessage");
    const startGameButton = document.getElementById("startGameButton");

    if (!welcomeModal || !welcomeMessage || !howToPlayMessage || !startGameButton) {
        return;
    }

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

    if (isNewPlayer) {
        showWelcomeModal(playerName);
    }

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
        howToPlayMessage.style.whiteSpace = "pre-line";
        welcomeModal.style.display = "flex";
    }

    function hideWelcomeModal() {
        welcomeModal.style.display = "none";
    }

    startGameButton.addEventListener("click", () => {
        hideWelcomeModal();
        setGameState("menu");
    });

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

    const gameOverMessages = [
        `${playerName}, your highest score is ${highScore}... but I know you can do better!`,
        `${playerName}, you scored ${player.score}! I know you can make it higher!`,
        `Don't give up, ${playerName}! You reached ${player.score}, try again!`,
        `${playerName}, you're getting better with every try! Your score: ${player.score}.`,
        `Keep going, ${playerName}! ${player.score} points this time, but the next run will be even better!`,
        `${playerName}, you're so close to beating your high score of ${highScore}! You got ${player.score} this time!`,
        `Practice makes perfect, ${playerName}! You scored ${player.score}, give it another shot!`,
        `${playerName}, you're a star! Scored ${player.score}—just one more try!`,
        `${playerName}, you're unstoppable! Keep pushing past ${player.score} points!`,
        `Every failure is a step closer to success, ${playerName}! You reached ${player.score}, now aim higher!`,
        `The AI got lucky this time, ${playerName}… but not next time! ${player.score} is just a warm-up!`,
        `You're learning the patterns, ${playerName}. Victory is near! Your score: ${player.score}.`,
        `Even legends have setbacks, ${playerName}. Get back in there! ${player.score} isn’t your limit!`,
        `${playerName}, your cyber-ninja training isn’t over yet! You reached ${player.score}, now go further!`,
        `Every attempt makes you stronger, ${playerName}. You scored ${player.score}, try again!`,
        `${playerName}, you dodged lasers, jumped spikes… and scored ${player.score}! Now do it again!`,
        `${playerName}, the cyber-ninjas believe in you! ${player.score} is great, but you can do better!`,
        `Almost there, ${playerName}! You got ${player.score}, just a little more practice and you'll be unstoppable!`,
        `Even the greatest warriors fall, ${playerName}. You reached ${player.score}, now rise again!`,
        `Your reflexes are improving, ${playerName}! You scored ${player.score}, keep going!`
    ];

    function getRandomGameOverMessage() {
        const randomIndex = Math.floor(Math.random() * gameOverMessages.length);
        return gameOverMessages[randomIndex].replace("${playerName}", playerName);
    }

    let gameState = "menu";
    let settingsState = false;
    let howToPlayState = false;
    let currentGameOverMessage = "";

    function setGameState(newState) {
        if (newState === "playing") {
            resetGame();
        } else if (newState === "gameOver") {
            currentGameOverMessage = getRandomGameOverMessage();
        }
        gameState = newState;
    }

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        player.y = canvas.height - 150;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let gameOver = false;

    const backgroundImage = new Image();
    backgroundImage.src = "GameBackground.jpg";

    const playerSpriteSheet = new Image();
    playerSpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/NewPlayermovement.png";

    const nonShootingEnemySpriteSheet = new Image();
    nonShootingEnemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AlienRoboticEnemyMovement.png";

    const shootingEnemySpriteSheet = new Image();
    shootingEnemySpriteSheet.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/AIDroneEnemyMovement.png";

    const platformImage = new Image();
    platformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/platform.jpg";

    const movingPlatformImage = new Image();
    movingPlatformImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/moving-platform.jpg";

    const spikeImage = new Image();
    spikeImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/testingspike.png";

    const gameMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playingthegamesound.wav");
    gameMusic.loop = true;
    gameMusic.volume = 0.5;

    const menuMusic = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuSound.wav");
    menuMusic.loop = true;
    menuMusic.volume = 0.5;

    const jumpSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/jumping_sound.wav");
    jumpSound.volume = 0.5;

    const shootSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playershooting.mp3");
    shootSound.volume = 0.5;

    const fallSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerfallingdown.mp3");
    fallSound.volume = 0.5;

    const spikeDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playerkilledbyspikes.wav");
    spikeDeathSound.volume = 0.5;

    const playerDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Playergetsshootbyenemy.mp3");
    playerDeathSound.volume = 0.5;

    const enemyShootSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Droneshooting.mp3");
    enemyShootSound.volume = 0.5;

    const enemyDeathSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/Enemydying.wav");
    enemyDeathSound.volume = 0.5;

    const powerUpSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/playerpowerup.wav");
    powerUpSound.volume = 0.5;

    const newHighScoreSound = new Audio("https://14rmz.github.io/Cyber-Ninja-Astronaut/highscore.wav");
    newHighScoreSound.volume = 0.5;

    const menuImage = new Image();
    menuImage.src = "https://14rmz.github.io/Cyber-Ninja-Astronaut/GameMenuBackground.webp";

    function playMenuMusic() {
        gameMusic.pause();
        gameMusic.currentTime = 0;
        menuMusic.play();
    }

    function playGameMusic() {
        menuMusic.pause();
        menuMusic.currentTime = 0;
        gameMusic.play();
    }

    function stopAllMusic() {
        menuMusic.pause();
        gameMusic.pause();
    }

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

    const playerAnimations = {
        idle: new Animation([{ x: 0, y: 0, width: 32, height: 48 }], 1),
        walk: new Animation([{ x: 32, y: 0, width: 32, height: 48 }, { x: 64, y: 0, width: 32, height: 48 }], 10),
        jumpStart: new Animation([{ x: 96, y: 0, width: 32, height: 48 }], 1),
        jump: new Animation([{ x: 128, y: 0, width: 32, height: 48 }], 1),
        jumpLand: new Animation([{ x: 160, y: 0, width: 32, height: 48 }], 1),
        dieLie: new Animation([{ x: 224, y: 0, width: 32, height: 48 }], 1)
    };

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
                        this.spikeX + i - camera.x, this.y - 15, 20, 15
                    );
                }
            }
        }
    }

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
            enemyDeathSound.play();
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
            enemyBullets.push(new Bullet(bulletX, bulletY, direction));
            enemyShootSound.play();
        }

        explode() {
            this.isExploding = true;
            this.currentAnimation = shootingEnemyAnimations.explode;
            enemyDeathSound.play();
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
            shootSound.play();
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
                        spikeDeathSound.play();
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
            jumpSound.play();
        }

        if (player.y > canvas.height) {
            gameOver = true;
            setGameState("gameOver");
            fallSound.play();
            updateHighScore();
        }
    }

    function updateHighScore() {
        if (player.score > highScore) {
            highScore = player.score;
            localStorage.setItem("highScore", highScore);
            newHighScoreSound.play();
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
        playerDeathSound.volume = 0.5;
        spikeDeathSound.volume = 0.5;
        fallSound.volume = 0.5;
        playGameMusic();
    }

    function drawGameOverScreen() {
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
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

    let menuItems = ["Start Game", "Settings", "How To Play", "Highest Score"];
    let menuPositions = [];
    let hoveredIndex = -1;
    let hoverAnimation = { opacity: 1, scale: 1 };

    function drawMainMenu() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = "cyan";
        ctx.font = "bold 80px Arial";
        ctx.shadowColor = "blue";
        ctx.shadowBlur = 40;
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
                height: boxHeight,
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

        ctx.font = "20px Arial";
        ctx.textAlign = "right";
        ctx.fillText("Created by [Your Name]", canvas.width - 20, canvas.height - 20);
    }

    canvas.addEventListener("mousemove", (e) => {
        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

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
        hoveredIndex = -1;
    });

    function drawSettingsMenu() {
        if (menuImage.complete && menuImage.naturalWidth !== 0) {
            ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Settings", canvas.width / 2, canvas.height / 2 - 150);

        ctx.font = "30px Arial";
        ctx.fillText("1. Sound Volume: " + Math.round(gameMusic.volume * 100) + "%", canvas.width / 2, canvas.height / 2 - 50);
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

        ctx.fillStyle = "white";
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
                        enemy.explode();
                        player.score += 20;
                    }
                });

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
                        playerDeathSound.play();
                        updateHighScore();
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
                        playerDeathSound.play();
                        updateHighScore();
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
                    powerUpSound.play();
                }
            });
        }
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

    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

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
                        case 0:
                            setGameState("playing");
                            break;
                        case 1:
                            settingsState = true;
                            break;
                        case 2:
                            drawHowToPlayScreen();
                            howToPlayState = true;
                            break;
                        case 3:
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

    window.addEventListener('keydown', (event) => {
        if (gameState === "menu") {
            if (settingsState) {
                if (event.code === "ArrowUp") {
                    gameMusic.volume = Math.min(1, gameMusic.volume + 0.1);
                    menuMusic.volume = Math.min(1, menuMusic.volume + 0.1);
                } else if (event.code === "ArrowDown") {
                    gameMusic.volume = Math.max(0, gameMusic.volume - 0.1);
                    menuMusic.volume = Math.max(0, menuMusic.volume - 0.1);
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

    Promise.all([
        new Promise((resolve) => { backgroundImage.onload = resolve; }),
        new Promise((resolve) => { playerSpriteSheet.onload = resolve; }),
        new Promise((resolve) => { nonShootingEnemySpriteSheet.onload = resolve; }),
        new Promise((resolve) => { shootingEnemySpriteSheet.onload = resolve; }),
        new Promise((resolve) => { platformImage.onload = resolve; }),
        new Promise((resolve) => { movingPlatformImage.onload = resolve; }),
        new Promise((resolve) => { spikeImage.onload = resolve; }),
        new Promise((resolve) => { menuImage.onload = resolve; }),
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
        gameLoop();
    });
});
