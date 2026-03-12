// DOM references
const scoreDisplay = document.getElementById("score");
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
const playAgainButton = document.getElementById("play-again");
const startButton = document.getElementById("start-button");
const cakeStack = document.getElementById("cake-stack");


const cakeSpeed = 3;
const spawnRate = 1000;
let stackedCakes = 0;
let activeItem = null;
let candleMode = false;


// Player position
let playerX = 250;
const playerSpeed = 20;

// Move player
function movePlayer(event) {

    const gameWidth = gameArea.offsetWidth;
    const playerWidth = player.offsetWidth;

    if (event.key === "ArrowLeft") {
        playerX -= playerSpeed;
    }

    if (event.key === "ArrowRight") {
        playerX += playerSpeed;
    }

    if (playerX < 0) playerX = 0;

    if (playerX > gameWidth - playerWidth) {
        playerX = gameWidth - playerWidth;
    }

    player.style.left = playerX + "px";
}

// Start game
let spawnInterval = null;

function initGame() {

    console.log("Game started");

    document.getElementById("bg-music").play().catch(() => {});

    if (spawnInterval) clearInterval(spawnInterval);

    candleMode = false;
    activeItem = null;

    spawnInterval = setInterval(() => {

        if (!candleMode) {
            spawnCake();
        }
        else if (activeItem === null) {
            spawnCake();
        }

    }, spawnRate);

    startButton.style.display = "none";
}

function checkCollision(item) {

    const itemRect = item.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    const stackTop = getStackTop();

    const horizontalHit =
        itemRect.right > playerRect.left &&
        itemRect.left < playerRect.right;

    const verticalHit =
        itemRect.bottom >= stackTop &&
        itemRect.bottom <= stackTop + 10;

    return horizontalHit && verticalHit;
}

// Restart game
function restartGame() {

    // Stop spawning
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
    }

    // Remove any falling items
    document.querySelectorAll(".cake, .candle").forEach(el => el.remove());

    // Reset game state
    score = 0;
    stackedCakes = 0;
    candleMode = false;
    activeItem = null;

    // Clear stack container
    cakeStack.innerHTML = "";

    // Show game again
    document.getElementById("card-section").classList.add("hidden");
    document.getElementById("game-section").classList.remove("hidden");
    document.getElementById("celebration")?.remove();

    // Restart game loop
    initGame();
}

// Spawn cakes or candles
function spawnCake() {

    // Prevent multiple items at once in candle mode
    if (candleMode && activeItem !== null) {
        return;
    }

    const item = document.createElement("div");

    if (candleMode) {
        item.classList.add("candle");
    } else {
        item.classList.add("cake");
    }

    activeItem = item;

    const gameWidth = gameArea.offsetWidth;
    const randomX = Math.random() * (gameWidth - 40);

    item.style.left = randomX + "px";

    gameArea.appendChild(item);

    let itemY = 0;

    const fallInterval = setInterval(() => {

        itemY += cakeSpeed;
        item.style.top = itemY + "px";

        if (checkCollision(item)) {

            if (item.classList.contains("cake")) {
                catchCake();
            }

            if (item.classList.contains("candle")) {
                placeCandle();
            }

            item.remove();
            clearInterval(fallInterval);

            activeItem = null;
            return;
        }

        if (itemY > gameArea.offsetHeight) {
            item.remove();
            clearInterval(fallInterval);

            activeItem = null;
        }

    }, 20);
}

function catchCake() {

    stackedCakes++;

    const stack = document.createElement("div");
    stack.classList.add("stacked-cake", "snap-land");

    cakeStack.appendChild(stack);

    // Remove animation class after it plays once
    setTimeout(() => {
        stack.classList.remove("snap-land");
    }, 200);

    if (stackedCakes >= 3) {
        candleMode = true;
    }
}

function getStackTop() {

    const playerRect = player.getBoundingClientRect();

    const cakeHeight = 25;
    const stackHeight = stackedCakes * cakeHeight;

    return playerRect.top - stackHeight;
}

function placeCandle() {

    clearInterval(spawnInterval);

    const candle = document.createElement("div");
    candle.classList.add("candle");

    cakeStack.appendChild(candle);

    showCelebration();
}

function showCelebration() {

    const message = document.createElement("div");
    message.id = "celebration";
    message.textContent = "You did it! 🎉";

    gameArea.appendChild(message);

    setTimeout(() => {
        showBirthdayCard();
    }, 2000);
}

function showBirthdayCard() {

    clearInterval(spawnInterval);

    document.getElementById("game-section").classList.add("hidden");
    document.getElementById("card-section").classList.remove("hidden");
}

// Event listeners
document.addEventListener("keydown", movePlayer);
playAgainButton.addEventListener("click", restartGame);
startButton.addEventListener("click", initGame);