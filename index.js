const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Alapértelmezett háttérszín
let backgroundColor = 'green';

// Állítsuk be a vászon méretét
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Az ablak méretének változásakor frissítjük a vászon méretét
window.addEventListener('resize', resizeCanvas);

// Kezdetben állítsuk be a méretet
resizeCanvas();

// Játékos kép betöltése
let playerImage = new Image();

let tombImage = new Image();
tombImage.src = 'pictures/Tomb.png';

// Karakter képek és életszakaszok
const characterImages = { // Módosítva: karakterKépek -> characterImages
    Patrik: {
        0: 'pictures/Patrik_child.png',
        1: 'pictures/Patrik_young.png',
        2: 'pictures/Patrik_pix.png',
        3: 'pictures/Patrik_old.png',
    },
    Barbara: {
        0: 'pictures/Barbara_child.png',
        1: 'pictures/Barbara_young.png',
        2: 'pictures/Barbara_pix.png',
        3: 'pictures/Barbara_old.png'
    },
    Viliam: {
        0: 'pictures/Viliam_child.png',
        1: 'pictures/Viliam_young.png',
        2: 'pictures/Viliam_pix.png',
        3: 'pictures/Viliam_old.png'
    }
};

let currentCharacter = 'Patrik'; // Módosítva: jelenlegiKarakter -> currentCharacter

const player = {
    x: 50,
    y: canvas.height -150,
    width: 80,
    height: 80,
    dx: 1.5,
    dy: 0,
    gravity: 0.7,
    jumpPower: -15,
    onGround: false
};

// Kezdőképernyő és karakterválasztás kezelése
const header = document.getElementById('header');
const characterSelection = document.getElementById('characterSelection');
const characters = document.querySelectorAll('.character');

characters.forEach(character => {
    character.addEventListener('click', function() {
        // Kiválasztott karakter neve
        currentCharacter = this.getAttribute('data-character'); // Módosítva: data-character

        // Kiválasztott pixeles kép betöltése
        const selectedPixelImage = this.getAttribute('data-pixel-image');
        playerImage.src = selectedPixelImage;
        startGame();
    });
});

function resetPlayer() {
    player.x = 50;
    player.y = canvas.height - 150;
    player.dx = 1.5;
    player.dy = 0;
    player.onGround = false;
}

// Nyomon követjük az időhurkok számát
let loopCount = 0;

let isGameRunning = false; // Nyomon követi, hogy fut-e a játék

function startGame() {
    // Rejtsük el a karakterválasztó képernyőt és a feliratot, mutassuk meg a játékterületet
    header.style.display = 'none';
    characterSelection.style.display = 'none';
    canvas.style.display = 'block';

    // Állítsd vissza a játékos kezdeti állapotát
    resetPlayer();
    updateCharacterImage(); // Módosítva: karakter kép frissítése a startGame-ben

    // Ha a játék nem fut, kezdjük el a gameLoop-ot
    if (!isGameRunning) {
        isGameRunning = true;
        // Győződj meg arról, hogy a kép betöltődött, mielőtt a játék elindul
        playerImage.onload = function() {
            gameLoop();
        };

        // Hiba esetén kezeljük a képből származó problémákat
        playerImage.onerror = function() {
            alert('Hiba történt a kép betöltésekor.');
        };
    }
}

const youMadeIt = new Audio('sound/YouMadeIt.mp3');

function updateCharacterImage() { // Módosítva: új függvény a karakterkép frissítésére
    if (loopCount > 3) {
        // Replace the player image with the tomb image when loopCount exceeds 3
        playerImage.src = tombImage.src;
        youMadeIt.play();

    } else if (loopCount < 0) {
        playerImage.src = characterImages[currentCharacter][0]; // Gyermekkor
    } else {
        playerImage.src = characterImages[currentCharacter][loopCount];
    }
}

function gameLoop() {
    // Háttérszín beállítása a loopCount alapján
    if (loopCount > 3) {
        backgroundColor = 'darkgray'; // Sötétszürke háttér
    } else if (loopCount < 0) {
        backgroundColor = 'white'; // Fehér háttér
    } else {
        backgroundColor = 'green'; // Alapértelmezett zöld háttér
    }

    // Rajzoljuk meg a hátteret a kiválasztott színnel
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Töltse ki a vásznat a háttérszínnel

    updatePlayer();
    drawPlayer();
    drawStageMessage();
    if (isGameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function updatePlayer() {
    // Ha a loopCount eléri a 4-et és a karakter jobbra mozog, a játékos megáll
    if ((loopCount >= 4 && player.dx > 0) || (loopCount < 0 && player.dx < 0)) {
        player.dx = 0; // Állítsuk meg a játékost
    } else {
        // Mozgás jobbra vagy balra
        player.x += player.dx;

        // Ha a karakter eléri a vászon jobb oldalát, visszatér a bal oldalra
        if (player.x + player.width > canvas.width) {
            player.x = 0; 
            loopCount++;
            updateCharacterImage(); // Karakterkép frissítése a loopCount növekedése után
        }

        // Ha a karakter eléri a vászon bal oldalát, visszatér a jobb oldalra, és csökkentjük a loopCount-ot
        if (player.x < 0) {
            player.x = canvas.width - player.width;
            loopCount--;
            updateCharacterImage(); // Karakterkép frissítése a loopCount csökkentése után
        }
    }

    // Gravitáció és ugrás kezelése
    player.y += player.dy;
    player.dy += player.gravity;

    // Ellenőrizzük, hogy a játékos talajon van-e
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.onGround = true;
    } else {
        player.onGround = false;
    }
    
}

const jumpSound = new Audio('sound/sfx_jump.mp3');


function jump() {
    if (player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
        jumpSound.play();
    }
}

let specialMessage = '';

function drawStageMessage() {
    let message = '';

    // Az életszakaszok feliratainak meghatározása a loopCount alapján
    if (loopCount === 0) {
        message = 'Childhood';
        ctx.fillStyle = 'black'; 
    } else if (loopCount === 1) {
        message = 'Young';
        ctx.fillStyle = 'black'; 
    } else if (loopCount === 2) {
        message = 'Adult';
        ctx.fillStyle = 'black';
    } else if (loopCount === 3) {
        message = 'Old';
        ctx.fillStyle = 'black'; 
    } else if (loopCount > 3) {
        message = 'We have no idea what happens after this.';
        ctx.fillStyle = 'white';
        ctx.font = '50px Constantia'; // Kisebb betűméret, ha loopCount > 3
    } else if (loopCount < 0) {
        message = 'We have no idea what happens here with Benjamin Button.';
        ctx.fillStyle = 'black';
        specialMessage = '';
        ctx.font = '50px Constantia'; // Kisebb betűméret, ha loopCount < 0
    }

    // A fő üzenet (életszakasz) megjelenítése a vászon tetején
    if (message) {
        if (loopCount >= 0 && loopCount <= 3) {
            ctx.font = '80px Constantia'; // Alapértelmezett betűméret
        }
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width / 2, 200);
    }

    // A speciális üzenet megjelenítése a fő üzenet alatt, nagyobb betűmérettel
    if (specialMessage) {
        ctx.font = '40px Constantia';
        ctx.fillStyle = 'blue'; // Külön szín a speciális üzenethez
        ctx.textAlign = 'center';
        ctx.fillText(specialMessage, canvas.width / 2, 400); // A speciális üzenet lejjebb helyezése
    }
}

function showCharacterSelection() {
    // Állítsuk le a játékot, amikor a karakterválasztó képernyőre lépünk
    isGameRunning = false;

    // Eredeti képernyő
    header.style.display = 'block';
    characterSelection.style.display = 'flex';
    canvas.style.display = 'none';

    // Állítsuk vissza a játékos állapotát, ha kiléptünk a karakterválasztásra
    resetPlayer();
    loopCount = 0; // Az időhurok számának visszaállítása
    message = '';
    specialMessage = '';
}

// Az eseményfigyelők beállítása
window.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        jump();
    }

    // Példa a balra-jobbra nyilak használatára
    if (event.code === 'ArrowRight') {
        player.dx = 1.5; // Jobbra mozgás
        specialMessage = ''; // Töröld a speciális üzenetet
    }

    if (event.code === 'ArrowLeft') {
        player.dx = -1.5; // Balra mozgás
        specialMessage = 'Benjamin Button mode on!'; // Speciális üzenet beállítása
    }
});

window.addEventListener('keydown', function(event) {
    if (event.code === 'Escape') {
        showCharacterSelection();
    }
});
