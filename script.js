// DOM references
const scoreDisplay = document.getElementById("score");
const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
const playAgainButton = document.getElementById("play-again");
const startButton = document.getElementById("start-button");
const cakeStack = document.getElementById("cake-stack");


const itemSpeed = 3;
const spawnRate = 1000;
let activeItem = null;
let licenses = 0;
let gameOver = false;


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
    scoreDisplay.textContent = "Licenses: 0";
    gameOver = false;
    document.getElementById("bg-music").play().catch(() => {});

    if (spawnInterval) clearInterval(spawnInterval);

    candleMode = false;
    activeItem = null;

    spawnInterval = setInterval(() => {

        if (!candleMode) {
            spawnItem();
        }
        else if (activeItem === null) {
            spawnItem();
        }

    }, spawnRate);

    startButton.style.display = "none";
}

function checkCollision(item) {

    if (gameOver) return false;

    const itemRect = item.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    const horizontalHit =
        itemRect.right > playerRect.left &&
        itemRect.left < playerRect.right;

    const verticalHit =
        itemRect.bottom >= playerRect.top &&
        itemRect.bottom <= playerRect.bottom;

    return horizontalHit && verticalHit;
}

function catchLicense() {

    if (gameOver) return;

    licenses++;

    scoreDisplay.textContent = "Licenses: " + licenses;

    if (licenses >= 3) {
        gameOver = true;
        showCelebration();
    }
}

function crash() {

    if (gameOver) return;

    gameOver = true;

    const message = document.createElement("div");
    message.id = "celebration";
    message.textContent = "You crashed! Try again 🚧";

    gameArea.appendChild(message);

    setTimeout(() => {
        restartGame();
    }, 2000);
}

// Restart game
function restartGame() {

    // Stop spawning
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
    }

    // Remove any falling items
    document.querySelectorAll(".license, .cone").forEach(el => el.remove());

    // Reset game state
    licenses = 0;
    activeItem = null;

    // Clear stack container
    cakeStack.innerHTML = "";

    // Show game again
    document.getElementById("card-section").classList.add("hidden");
    document.getElementById("game-section").classList.remove("hidden");
    document.getElementById("celebration")?.remove();

    playerX = 250;
    player.style.left = playerX + "px";

    // Restart game loop
    initGame();
}

function spawnItem() {

    const item = document.createElement("div");

    const isCone = Math.random() < 0.4;

    if (isCone) {
        item.classList.add("cone");
    } else {
        item.classList.add("license");
    }

    const gameWidth = gameArea.offsetWidth;
    const randomX = Math.random() * (gameWidth - 40);
    item.style.left = randomX + "px";

    gameArea.appendChild(item);

    let itemY = 0;

    const fallInterval = setInterval(() => {

        itemY += itemSpeed;
        item.style.top = itemY + "px";

        if (checkCollision(item)) {

            if (item.classList.contains("license")) {
                catchLicense();
            }

            if (item.classList.contains("cone")) {
                crash();
            }

            item.remove();
            clearInterval(fallInterval);
        }

        if (itemY > gameArea.offsetHeight) {
            item.remove();
            clearInterval(fallInterval);
        }

    }, 20);
}

function getStackTop() {

    const playerRect = player.getBoundingClientRect();

    const cakeHeight = 25;
    const stackHeight = stackedCakes * cakeHeight;

    return playerRect.top - stackHeight;
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