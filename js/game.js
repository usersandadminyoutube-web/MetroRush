// --- ADVANCED 3D CYBER RUNNER - GAME ENGINE (game.js) ---

// Game State Management
const gameState = {
    isPlaying: false,
    score: 0,
    coins: 0,
    speed: 0.15,
    equippedSkin: 'default',
    equippedPet: 'dragon',
    lane: 0,
    targetX: 0,
    magnetLvl: 1,
    shieldLvl: 1,
    dragonLvl: 1,
    speedLvl: 1,
    unlockedSkins: ['default'],
    unlockedPets: []
};

// Save Progress Helper Function
function saveProgress() {
    localStorage.setItem('mr_coins', gameState.coins);
    localStorage.setItem('mr_equipped_skin', gameState.equippedSkin);
    localStorage.setItem('mr_equipped_pet', gameState.equippedPet);
    localStorage.setItem('mr_unlocked_skins', JSON.stringify(gameState.unlockedSkins));
    localStorage.setItem('mr_unlocked_pets', JSON.stringify(gameState.unlockedPets));
}

// Load Progress on startup
function loadProgress() {
    if (localStorage.getItem('mr_coins')) gameState.coins = parseInt(localStorage.getItem('mr_coins'));
    if (localStorage.getItem('mr_equipped_skin')) gameState.equippedSkin = localStorage.getItem('mr_equipped_skin');
    if (localStorage.getItem('mr_equipped_pet')) gameState.equippedPet = localStorage.getItem('mr_equipped_pet');
    if (localStorage.getItem('mr_unlocked_skins')) gameState.unlockedSkins = JSON.parse(localStorage.getItem('mr_unlocked_skins'));
    if (localStorage.getItem('mr_unlocked_pets')) gameState.unlockedPets = JSON.parse(localStorage.getItem('mr_unlocked_pets'));
}

// Global variables for Three.js components
let scene, camera, renderer, player, pet;

// 1. Game Initialization
function initGame() {
    // Load saved progress first
    loadProgress();

    // Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); 
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3.5, 6.5);
    camera.lookAt(0, 1, 0);

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const container = document.getElementById('game-container') || document.body;
    container.appendChild(renderer.domElement);

    // Environment Lighting
    if (typeof setupEnvironmentLighting === 'function') {
        setupEnvironmentLighting(scene);
    } else {
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
    }

    // Create Ground Track & Entities
    createTrack();
    spawnEntities();

    // Event Listeners for Controls & Resize
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', handleKeyDown);

    // Play Game Button Event Listener Setup
    const startBtn = document.getElementById('btn-start');
    const startOverlay = document.getElementById('start-overlay');
    
    if (startBtn && startOverlay) {
        startBtn.addEventListener('click', () => {
            startOverlay.classList.add('hidden'); // Menu hide karein
            gameState.isPlaying = true;           // Game chalu karein
            animate();                            // Loop start karein
            if (typeof sounds !== 'undefined' && sounds.playClickSound) sounds.playClickSound();
        });
    }
}

// 2. Track / Environment Generator
function createTrack() {
    const gridHelper = new THREE.GridHelper(100, 50, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const planeGeo = new THREE.PlaneGeometry(30, 200);
    const planeMat = new THREE.MeshStandardMaterial({ 
        color: 0x090d16, 
        roughness: 0.9, 
        metalness: 0.1 
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.z = -50;
    plane.receiveShadow = true;
    scene.add(plane);
}

// 3. Spawn Player & Companion Pet safely
function spawnEntities() {
    if (typeof createPlayerMesh === 'function') {
        player = createPlayerMesh(gameState.equippedSkin);
    } else {
        const geo = new THREE.BoxGeometry(0.8, 1.4, 0.8);
        const mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4 });
        player = new THREE.Mesh(geo, mat);
        player.position.y = 0.7;
    }
    player.position.set(0, 0, 0);
    scene.add(player);

    if (typeof createPetMesh === 'function') {
        pet = createPetMesh(gameState.equippedPet);
        pet.position.set(1.2, 1.8, -0.5);
        scene.add(pet);
    }
}

// 4. Controls Handling (Keyboard)
function handleKeyDown(event) {
    if (!gameState.isPlaying) return;

    if (event.key === 'ArrowLeft' || event.key === 'a') {
        if (gameState.lane > -1) {
            gameState.lane--;
        }
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        if (gameState.lane < 1) {
            gameState.lane++;
        }
    }
    
    gameState.targetX = gameState.lane * 1.8;
}

// 5. Main Animation & Game Loop
function animate() {
    if (!gameState.isPlaying) return;

    requestAnimationFrame(animate);

    player.position.x += (gameState.targetX - player.position.x) * 0.15;

    if (pet) {
        pet.position.x = player.position.x + 1.2;
        pet.position.y = 1.8 + Math.sin(Date.now() * 0.005) * 0.15;
        pet.rotation.y += 0.02;
    }

    gameState.score += 0.1;
    updateScoreUI();

    renderer.render(scene, camera);
}

// 6. UI Updates
function updateScoreUI() {
    const scoreEl = document.getElementById('score-count');
    if (scoreEl) {
        scoreEl.innerText = Math.floor(gameState.score);
    }
}

// 7. Window Resize Handling
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Auto-initialize when window loads
window.addEventListener('load', () => {
    initGame();
});