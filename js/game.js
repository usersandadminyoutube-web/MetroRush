// Game State & LocalStorage
const gameState = {
    playerName: localStorage.getItem('mr_player_name') || 'CYBER_RUNNER',
    coins: parseInt(localStorage.getItem('mr_coins')) || 100,
    magnetLvl: parseInt(localStorage.getItem('mr_magnet_lvl')) || 1,
    shieldLvl: parseInt(localStorage.getItem('mr_shield_lvl')) || 1,
    dragonLvl: parseInt(localStorage.getItem('mr_dragon_lvl')) || 1,
    speedLvl: parseInt(localStorage.getItem('mr_speed_lvl')) || 1,
    
    equippedSkin: localStorage.getItem('mr_equipped_skin') || 'default',
    unlockedSkins: JSON.parse(localStorage.getItem('mr_unlocked_skins')) || ['default'],
    equippedPet: localStorage.getItem('mr_equipped_pet') || null,
    unlockedPets: JSON.parse(localStorage.getItem('mr_unlocked_pets')) || []
};

// Gameplay variables
let scene, camera, renderer;
let player, shieldBubble;
let trackMesh;
let obstacles = [];
let coins = [];
let trailParticles = [];
let isRunning = false;
let currentLane = 0;
const laneWidth = 2.5;
let targetX = 0;

let runScore = 0;
let runCoins = 0;
let baseSpeed = 0.35;
let currentSpeed = baseSpeed;

let isJumping = false;
let jumpVelocity = 0;
const gravity = -0.018;

let isSliding = false;
let slideTimer = 0;

// Touch control variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function saveProgress() {
    localStorage.setItem('mr_player_name', gameState.playerName);
    localStorage.setItem('mr_coins', gameState.coins);
    localStorage.setItem('mr_magnet_lvl', gameState.magnetLvl);
    localStorage.setItem('mr_shield_lvl', gameState.shieldLvl);
    localStorage.setItem('mr_dragon_lvl', gameState.dragonLvl);
    localStorage.setItem('mr_speed_lvl', gameState.speedLvl);
    
    localStorage.setItem('mr_equipped_skin', gameState.equippedSkin);
    localStorage.setItem('mr_unlocked_skins', JSON.stringify(gameState.unlockedSkins));
    localStorage.setItem('mr_equipped_pet', gameState.equippedPet || '');
    localStorage.setItem('mr_unlocked_pets', JSON.stringify(gameState.unlockedPets));
    
    updateUI();
}

function updateUI() {
    const currentUser = localStorage.getItem('metro_current_user');
    if (currentUser === '@ruhi_pro') {
        gameState.coins = 999999;
    }

    if (document.getElementById('player-name')) document.getElementById('player-name').innerText = gameState.playerName;
    if (document.getElementById('coin-count')) document.getElementById('coin-count').innerText = gameState.coins;
    
    if (document.getElementById('power-wallet')) document.getElementById('power-wallet').innerText = gameState.coins;
    if (document.getElementById('shop-wallet')) document.getElementById('shop-wallet').innerText = gameState.coins;

    if (document.getElementById('lvl-magnet')) document.getElementById('lvl-magnet').innerText = gameState.magnetLvl;
    if (document.getElementById('cost-magnet')) document.getElementById('cost-magnet').innerText = gameState.magnetLvl * 50;

    if (document.getElementById('lvl-shield')) document.getElementById('lvl-shield').innerText = gameState.shieldLvl;
    if (document.getElementById('cost-shield')) document.getElementById('cost-shield').innerText = gameState.shieldLvl * 50;

    if (document.getElementById('lvl-dragon')) document.getElementById('lvl-dragon').innerText = gameState.dragonLvl;
    if (document.getElementById('cost-dragon')) document.getElementById('cost-dragon').innerText = gameState.dragonLvl * 50;

    if (document.getElementById('lvl-speed')) document.getElementById('lvl-speed').innerText = gameState.speedLvl;
    if (document.getElementById('cost-speed')) document.getElementById('cost-speed').innerText = gameState.speedLvl * 50;

    if (typeof missions !== 'undefined') missions.updateUI();
    if (typeof updateShopButtons === 'function') updateShopButtons();
}

window.addEventListener('DOMContentLoaded', () => {
    updateUI();

    document.getElementById('btn-start')?.addEventListener('click', startGame);
    document.getElementById('btn-restart')?.addEventListener('click', startGame);
    document.getElementById('btn-menu')?.addEventListener('click', goToMainMenu);
    
    document.getElementById('btn-claim-mission')?.addEventListener('click', () => {
        if (typeof missions !== 'undefined') missions.claimReward();
    });

    const startOverlay = document.getElementById('start-overlay');
    const powersOverlay = document.getElementById('powers-overlay');
    const shopOverlay = document.getElementById('shop-overlay');

    document.getElementById('btn-powers-menu')?.addEventListener('click', () => {
        startOverlay?.classList.add('hidden');
        powersOverlay?.classList.remove('hidden');
    });

    document.getElementById('btn-powers-back')?.addEventListener('click', () => {
        powersOverlay?.classList.add('hidden');
        startOverlay?.classList.remove('hidden');
    });

    document.getElementById('btn-shop-menu')?.addEventListener('click', () => {
        startOverlay?.classList.add('hidden');
        if (shopOverlay) {
            shopOverlay.classList.remove('hidden');
            if (typeof updateShopButtons === 'function') updateShopButtons();
        }
    });

    document.getElementById('btn-shop-back')?.addEventListener('click', () => {
        shopOverlay?.classList.add('hidden');
        startOverlay?.classList.remove('hidden');
    });

    document.getElementById('upg-magnet')?.addEventListener('click', () => buyUpgrade('magnetLvl'));
    document.getElementById('upg-shield')?.addEventListener('click', () => buyUpgrade('shieldLvl'));
    document.getElementById('upg-dragon')?.addEventListener('click', () => buyUpgrade('dragonLvl'));
    document.getElementById('upg-speed')?.addEventListener('click', () => buyUpgrade('speedLvl'));

    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
        if (!isRunning) return;

        if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && currentLane > -1) {
            currentLane--;
        } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && currentLane < 1) {
            currentLane++;
        } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') && !isJumping && !isSliding) {
            isJumping = true;
            jumpVelocity = 0.32;
            if (typeof sounds !== 'undefined') sounds.playJumpSound();
        } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && !isJumping && !isSliding) {
            isSliding = true;
            slideTimer = 35;
            player.scale.y = 0.4;
            player.position.y = -0.4;
        }
    });

    // Touch / Swipe Controls
    window.addEventListener('touchstart', (e) => {
        if (!isRunning) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!isRunning) return;
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleGesture();
    }, { passive: true });
});

function handleGesture() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const threshold = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0 && currentLane < 1) {
                currentLane++;
            } else if (diffX < 0 && currentLane > -1) {
                currentLane--;
            }
        }
    } else {
        if (Math.abs(diffY) > threshold) {
            if (diffY < 0 && !isJumping && !isSliding) {
                isJumping = true;
                jumpVelocity = 0.32;
                if (typeof sounds !== 'undefined') sounds.playJumpSound();
            } else if (diffY > 0 && !isJumping && !isSliding) {
                isSliding = true;
                slideTimer = 35;
                player.scale.y = 0.4;
                player.position.y = -0.4;
            }
        }
    }
}

function goToMainMenu() {
    document.getElementById('game-over-overlay')?.classList.add('hidden');
    document.getElementById('powers-overlay')?.classList.add('hidden');
    document.getElementById('shop-overlay')?.classList.add('hidden');
    document.getElementById('start-overlay')?.classList.remove('hidden');
}

function buyUpgrade(type) {
    let cost = gameState[type] * 50;
    if (localStorage.getItem('metro_current_user') === '@ruhi_pro' || gameState.coins >= cost) {
        if (localStorage.getItem('metro_current_user') !== '@ruhi_pro') {
            gameState.coins -= cost;
        }
        gameState[type]++;
        saveProgress();
    }
}

function init3D() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4.5, 9);
    camera.lookAt(0, 1.5, -5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 1.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const trackGeo = new THREE.PlaneGeometry(9, 300);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.z = -100;
    scene.add(trackMesh);

    if (typeof createPlayerMesh === 'function') {
        player = createPlayerMesh(gameState.equippedSkin);
    } else {
        player = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.9, 1.4, 0.7);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4 });
        player.add(new THREE.Mesh(bodyGeo, bodyMat));
    }

    const bubbleGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.35, wireframe: true });
    shieldBubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    shieldBubble.position.y = 0.9;
    shieldBubble.visible = false;
    player.add(shieldBubble);

    player.position.set(0, 0, 0);
    scene.add(player);

    window.addEventListener('resize', onWindowResize);
}

function updateDynamicEnvironment(score) {
    if (!scene || !trackMesh) return;

    if (score < 100) {
        scene.background.setHex(0x030712);
        scene.fog.color.setHex(0x030712);
        trackMesh.material.color.setHex(0x0f172a);
    } else if (score >= 100 && score < 250) {
        scene.background.setHex(0x18052b);
        scene.fog.color.setHex(0x18052b);
        trackMesh.material.color.setHex(0x2d1b4e);
    } else if (score >= 250 && score < 400) {
        scene.background.setHex(0x021a10);
        scene.fog.color.setHex(0x021a10);
        trackMesh.material.color.setHex(0x063f28);
    } else {
        scene.background.setHex(0x200404);
        scene.fog.color.setHex(0x200404);
        trackMesh.material.color.setHex(0x4a0e0e);
    }
}

function spawnTrailParticle() {
    if (!player) return;
    const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 });
    const particle = new THREE.Mesh(geo, mat);

    particle.position.copy(player.position);
    particle.position.y += 0.5;
    scene.add(particle);

    trailParticles.push({ mesh: particle, life: 15 });
}

function updateTrailParticles() {
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        let p = trailParticles[i];
        p.life--;
        p.mesh.scale.multiplyScalar(0.9);

        if (p.life <= 0) {
            scene.remove(p.mesh);
            trailParticles.splice(i, 1);
        }
    }
}

function startGame() {
    document.getElementById('start-overlay')?.classList.add('hidden');
    document.getElementById('powers-overlay')?.classList.add('hidden');
    document.getElementById('shop-overlay')?.classList.add('hidden');
    document.getElementById('game-over-overlay')?.classList.add('hidden');

    init3D();
    
    runScore = 0;
    runCoins = 0;
    currentLane = 0;
    targetX = 0;
    obstacles = [];
    coins = [];
    trailParticles = [];
    isSliding = false;
    isJumping = false;

    if (typeof resetPowerups === 'function') resetPowerups();

    currentSpeed = baseSpeed + (gameState.speedLvl - 1) * 0.03;
    isRunning = true;

    animate();
}

function spawnObstacle() {
    const lanes = [-laneWidth, 0, laneWidth];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const isLaser = Math.random() > 0.5;

    let obs;
    if (isLaser) {
        const group = new THREE.Group();
        const beamGeo = new THREE.BoxGeometry(2.5, 0.2, 0.2);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = 1.2;
        group.add(beam);

        const pGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const p1 = new THREE.Mesh(pGeo, pMat); p1.position.set(-1.25, 0.6, 0);
        const p2 = new THREE.Mesh(pGeo, pMat); p2.position.set(1.25, 0.6, 0);
        group.add(p1); group.add(p2);

        group.position.set(lane, 0, -90);
        group.userData = { type: 'laser' };
        obs = group;
    } else {
        const geo = new THREE.BoxGeometry(1.5, 1.4, 1.4);
        const mat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
        obs = new THREE.Mesh(geo, mat);
        obs.position.set(lane, 0.7, -90);
        obs.userData = { type: 'box' };
    }

    scene.add(obs);
    obstacles.push(obs);
}

function spawnCoin() {
    const lanes = [-laneWidth, 0, laneWidth];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const coin = new THREE.Mesh(geo, mat);

    coin.rotation.x = Math.PI / 2;
    coin.position.set(lane, 0.8, -90);
    scene.add(coin);
    coins.push(coin);
}

let frameCount = 0;

function animate() {
    if (!isRunning) return;

    requestAnimationFrame(animate);

    frameCount++;
    if (frameCount % 45 === 0) spawnObstacle();
    if (frameCount % 25 === 0) spawnCoin();
    if (frameCount % 3 === 0) spawnTrailParticle();

    updateTrailParticles();

    if (frameCount % 300 === 0 && typeof spawnPowerup === 'function') spawnPowerup();

    if (typeof updatePowerupsLogic === 'function') updatePowerupsLogic();

    targetX = currentLane * laneWidth;
    player.position.x += (targetX - player.position.x) * 0.25;

    if (isJumping) {
        player.position.y += jumpVelocity;
        jumpVelocity += gravity;
        if (player.position.y <= 0) {
            player.position.y = 0;
            isJumping = false;
        }
    }

    if (isSliding) {
        slideTimer--;
        if (slideTimer <= 0) {
            isSliding = false;
            player.scale.y = 1.0;
            player.position.y = 0;
        }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.position.z += currentSpeed;

        if (Math.abs(obs.position.z - player.position.z) < 1.0 &&
            Math.abs(obs.position.x - player.position.x) < 0.9) {
            
            let hit = true;
            if (obs.userData && obs.userData.type === 'laser') {
                if (isSliding) hit = false;
            } else {
                if (player.position.y > 0.5) hit = false;
            }

            if (hit) {
                if (typeof activePowerups !== 'undefined' && activePowerups.shield > 0) {
                    activePowerups.shield = 0;
                    scene.remove(obs);
                    obstacles.splice(i, 1);
                    continue;
                } else {
                    if (typeof sounds !== 'undefined') sounds.playHitSound();
                    gameOver();
                    return;
                }
            }
        }

        if (obs.position.z > 10) {
            scene.remove(obs);
            obstacles.splice(i, 1);
        }
    }

    const isMagnetActive = typeof activePowerups !== 'undefined' && activePowerups.magnet > 0;
    const magnetRadius = isMagnetActive ? 12 : 2.0;

    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        coin.position.z += currentSpeed;
        coin.rotation.z += 0.08;

        let dist = coin.position.distanceTo(player.position);
        if (dist < magnetRadius) {
            coin.position.x += (player.position.x - coin.position.x) * 0.3;
            coin.position.y += (player.position.y + 0.8 - coin.position.y) * 0.3;
            coin.position.z += (player.position.z - coin.position.z) * 0.3;
        }

        if (Math.abs(coin.position.z - player.position.z) < 1.0 &&
            Math.abs(coin.position.x - player.position.x) < 0.9) {
            scene.remove(coin);
            coins.splice(i, 1);
            
            if (typeof sounds !== 'undefined') sounds.playCoinSound();

            const earned = (typeof activePowerups !== 'undefined' && activePowerups.multiplier > 0) ? 2 : 1;
            runCoins += earned;
            
            if (typeof missions !== 'undefined') {
                missions.addProgress(earned);
            }

            const displayCoins = (localStorage.getItem('metro_current_user') === '@ruhi_pro') ? 999999 : (gameState.coins + runCoins);
            document.getElementById('coin-count').innerText = displayCoins;
        } else if (coin.position.z > 10) {
            scene.remove(coin);
            coins.splice(i, 1);
        }
    }

    const scoreAdd = (typeof activePowerups !== 'undefined' && activePowerups.multiplier > 0) ? 2 : 1;
    runScore += scoreAdd;
    const currentScoreValue = Math.floor(runScore / 5);
    document.getElementById('score-count').innerText = currentScoreValue;

    updateDynamicEnvironment(currentScoreValue);

    renderer.render(scene, camera);
}

function gameOver() {
    isRunning = false;
    if (localStorage.getItem('metro_current_user') !== '@ruhi_pro') {
        gameState.coins += runCoins;
    }
    saveProgress();

    document.getElementById('final-score').innerText = Math.floor(runScore / 5);
    document.getElementById('final-coins').innerText = runCoins;
    
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}