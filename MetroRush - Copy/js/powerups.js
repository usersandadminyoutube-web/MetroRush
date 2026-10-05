// --- POWER-UPS SYSTEM ---

const activePowerups = {
    magnet: 0,
    shield: 0,
    multiplier: 0
};

let powerups = [];

function spawnPowerup() {
    const lanes = [-laneWidth, 0, laneWidth];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const types = ['magnet', 'shield', 'multiplier'];
    const pType = types[Math.floor(Math.random() * types.length)];

    let pColor = 0x06b6d4;
    if (pType === 'shield') pColor = 0xf97316;
    if (pType === 'multiplier') pColor = 0xa855f7;

    const geo = new THREE.OctahedronGeometry(0.5);
    const mat = new THREE.MeshStandardMaterial({ color: pColor, metalness: 0.8, roughness: 0.2 });
    const pMesh = new THREE.Mesh(geo, mat);

    pMesh.position.set(lane, 1.0, -90);
    pMesh.userData = { type: pType };

    scene.add(pMesh);
    powerups.push(pMesh);
}

function updatePowerupHUD() {
    const hudMag = document.getElementById('hud-magnet');
    const hudShield = document.getElementById('hud-shield');
    const hudMulti = document.getElementById('hud-multiplier');

    if (hudMag) hudMag.style.display = activePowerups.magnet > 0 ? 'flex' : 'none';
    if (hudShield) hudShield.style.display = activePowerups.shield > 0 ? 'flex' : 'none';
    if (hudMulti) hudMulti.style.display = activePowerups.multiplier > 0 ? 'flex' : 'none';

    if (typeof shieldBubble !== 'undefined' && shieldBubble) {
        shieldBubble.visible = activePowerups.shield > 0;
    }
}

function updatePowerupsLogic() {
    if (activePowerups.magnet > 0) activePowerups.magnet--;
    if (activePowerups.shield > 0) activePowerups.shield--;
    if (activePowerups.multiplier > 0) activePowerups.multiplier--;
    updatePowerupHUD();

    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.position.z += currentSpeed;
        p.rotation.y += 0.05;

        if (Math.abs(p.position.z - player.position.z) < 1.0 &&
            Math.abs(p.position.x - player.position.x) < 0.9 &&
            Math.abs(p.position.y - player.position.y) < 1.2) {
            
            const pType = p.userData.type;
            if (pType === 'magnet') activePowerups.magnet = (10 + gameState.magnetLvl * 3) * 60;
            if (pType === 'shield') activePowerups.shield = (8 + gameState.shieldLvl * 3) * 60;
            if (pType === 'multiplier') activePowerups.multiplier = (10 + gameState.dragonLvl * 3) * 60;

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
    powerups = [];
    updatePowerupHUD();
}