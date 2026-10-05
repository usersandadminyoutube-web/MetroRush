// --- ADVANCED POWER-UPS SYSTEM ---

const activePowerups = {
    magnet: 0,
    shield: 0,
    multiplier: 0,
    speedBoost: 0,
    ghostMode: 0
};

let powerups = [];
let powerupParticles = [];

function spawnPowerup() {
    const lanes = [-laneWidth, 0, laneWidth];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const types = ['magnet', 'shield', 'multiplier', 'speedBoost', 'ghostMode'];
    const pType = types[Math.floor(Math.random() * types.length)];

    let pColor = 0x06b6d4; // Default Magnet Cyan
    if (pType === 'shield') pColor = 0xf97316;       // Orange Shield
    else if (pType === 'multiplier') pColor = 0xa855f7; // Purple Multiplier[cite: 16]
    else if (pType === 'speedBoost') pColor = 0x22c55e; // Green Speed Boost
    else if (pType === 'ghostMode') pColor = 0x38bdf8;  // Light Blue Ghost

    // Advanced Octahedron Geometry with detailed material
    const geo = new THREE.OctahedronGeometry(0.6);
    const mat = new THREE.MeshStandardMaterial({ 
        color: pColor, 
        metalness: 0.9, 
        roughness: 0.1,
        emissive: pColor,
        emissiveIntensity: 0.5
    });
    const pMesh = new THREE.Mesh(geo, mat);

    pMesh.position.set(lane, 1.2, -90);
    pMesh.userData = { type: pType, initialY: 1.2, angle: Math.random() * Math.PI };

    scene.add(pMesh);
    powerups.push(pMesh);
}

function updatePowerupHUD() {
    const hudMag = document.getElementById('hud-magnet');
    const hudShield = document.getElementById('hud-shield');
    const hudMulti = document.getElementById('hud-multiplier');
    const hudSpeed = document.getElementById('hud-speed');
    const hudGhost = document.getElementById('hud-ghost');

    if (hudMag) hudMag.style.display = activePowerups.magnet > 0 ? 'flex' : 'none';
    if (hudShield) hudShield.style.display = activePowerups.shield > 0 ? 'flex' : 'none';
    if (hudMulti) hudMulti.style.display = activePowerups.multiplier > 0 ? 'flex' : 'none';
    if (hudSpeed) hudSpeed.style.display = activePowerups.speedBoost > 0 ? 'flex' : 'none';
    if (hudGhost) hudGhost.style.display = activePowerups.ghostMode > 0 ? 'flex' : 'none';

    // Update Shield Bubble Visibility in 3D Scene[cite: 16]
    if (typeof shieldBubble !== 'undefined' && shieldBubble) {
        shieldBubble.visible = activePowerups.shield > 0;
    }
}

function spawnPowerupParticles(pos, colorHex) {
    for (let i = 0; i < 12; i++) {
        const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const pMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1.0 });
        const particle = new THREE.Mesh(pGeo, pMat);
        
        particle.position.copy(pos);
        scene.add(particle);

        powerupParticles.push({
            mesh: particle,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.3
            ),
            life: 25
        });
    }
}

function updatePowerupParticles() {
    for (let i = powerupParticles.length - 1; i >= 0; i--) {
        let pt = powerupParticles[i];
        pt.mesh.position.add(pt.velocity);
        pt.mesh.scale.multiplyScalar(0.9);
        pt.life--;

        if (pt.life <= 0) {
            scene.remove(pt.mesh);
            powerupParticles.splice(i, 1);
        }
    }
}

function updatePowerupsLogic() {
    // Decrement active power-up timers
    if (activePowerups.magnet > 0) activePowerups.magnet--;
    if (activePowerups.shield > 0) activePowerups.shield--;
    if (activePowerups.multiplier > 0) activePowerups.multiplier--;
    if (activePowerups.speedBoost > 0) activePowerups.speedBoost--;
    if (activePowerups.ghostMode > 0) activePowerups.ghostMode--;

    updatePowerupHUD();
    updatePowerupParticles();

    // Handle Powerups Movement and Collision
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.position.z += currentSpeed;
        p.rotation.y += 0.06;
        
        // Floating bobbing animation
        p.userData.angle += 0.08;
        p.position.y = p.userData.initialY + Math.sin(p.userData.angle) * 0.25;

        // Check distance collision with player[cite: 16]
        if (Math.abs(p.position.z - player.position.z) < 1.2 &&
            Math.abs(p.position.x - player.position.x) < 1.0 &&
            Math.abs(p.position.y - player.position.y) < 1.5) {
            
            const pType = p.userData.type;
            let colorHex = 0x06b6d4;

            if (pType === 'magnet') {
                activePowerups.magnet = (10 + gameState.magnetLvl * 3) * 60;
                colorHex = 0x06b6d4;
            } else if (pType === 'shield') {
                activePowerups.shield = (8 + gameState.shieldLvl * 3) * 60;
                colorHex = 0xf97316;
            } else if (pType === 'multiplier') {
                activePowerups.multiplier = (10 + gameState.dragonLvl * 3) * 60;
                colorHex = 0xa855f7;
            } else if (pType === 'speedBoost') {
                activePowerups.speedBoost = 8 * 60;
                colorHex = 0x22c55e;
            } else if (pType === 'ghostMode') {
                activePowerups.ghostMode = 6 * 60;
                colorHex = 0x38bdf8;
            }

            // Play Sound and Spawn Collection Particles[cite: 16]
            if (typeof sounds !== 'undefined') sounds.playPowerupSound();
            spawnPowerupParticles(p.position, colorHex);

            scene.remove(p);
            powerups.splice(i, 1);
        } else if (p.position.z > 10) {
            scene.remove(p);
            powerups.splice(i, 1);
        }
    }
}

function resetPowerups() {
    activePowerups.magnet = 0;
    activePowerups.shield = 0;
    activePowerups.multiplier = 0;
    activePowerups.speedBoost = 0;
    activePowerups.ghostMode = 0;
    
    // Clear existing powerup meshes from scene
    powerups.forEach(p => scene.remove(p));
    powerups = [];

    powerupParticles.forEach(pt => scene.remove(pt.mesh));
    powerupParticles = [];

    updatePowerupHUD();
}