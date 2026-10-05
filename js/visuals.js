// --- ADVANCED VISUALS, PLAYER SKINS & PETS 3D SYSTEM ---

// 1. Advanced Player 3D Mesh Generator with Cybernetic Aesthetics
function createPlayerMesh(skinType) {
    const playerGroup = new THREE.Group();

    let primaryColor = 0x06b6d4; // Cyan Default[cite: 18]
    let secondaryColor = 0x3b82f6;
    let accentColor = 0xffffff;
    let emissiveColor = 0x00ffff;

    if (skinType === 'ninja') {
        primaryColor = 0xec4899; // Pink / Purple Neon[cite: 18]
        secondaryColor = 0x831843;
        emissiveColor = 0xff007f;
    } else if (skinType === 'gold') {
        primaryColor = 0xf59e0b; // Gold Bot[cite: 18]
        secondaryColor = 0xb45309;
        emissiveColor = 0xffd700;
    } else if (skinType === 'shadow') {
        primaryColor = 0xef4444; // Shadow Red[cite: 18]
        secondaryColor = 0x7f1d1d;
        emissiveColor = 0xff0000;
    }

    // High-Detail Materials with Emissive Glow
    const matBody = new THREE.MeshStandardMaterial({ 
        color: primaryColor, 
        roughness: 0.2, 
        metalness: 0.9,
        emissive: emissiveColor,
        emissiveIntensity: 0.3 
    });
    const matLimbs = new THREE.MeshStandardMaterial({ color: secondaryColor, roughness: 0.5, metalness: 0.5 });
    const matHead = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.1, metalness: 0.8 });
    const matVisor = new THREE.MeshBasicMaterial({ color: emissiveColor });

    // 1. Torso Construction
    const torsoGeo = new THREE.BoxGeometry(0.6, 0.9, 0.35);[cite: 18]
    const torso = new THREE.Mesh(torsoGeo, matBody);
    torso.position.y = 0.9;[cite: 18]
    torso.castShadow = true;
    playerGroup.add(torso);

    // Chest Glowing Core Matrix
    const coreGeo = new THREE.BoxGeometry(0.3, 0.4, 0.4);
    const coreMesh = new THREE.Mesh(coreGeo, matVisor);
    coreMesh.position.set(0, 0.9, 0.05);
    playerGroup.add(coreMesh);

    // 2. Head Construction
    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);[cite: 18]
    const head = new THREE.Mesh(headGeo, matHead);
    head.position.y = 1.5;[cite: 18]
    playerGroup.add(head);

    // Futuristic Cyber Visor
    const visorGeo = new THREE.BoxGeometry(0.35, 0.12, 0.15);
    const visor = new THREE.Mesh(visorGeo, matVisor);
    visor.position.set(0, 1.52, 0.2);
    playerGroup.add(visor);

    // 3. Arms Construction
    const armGeo = new THREE.BoxGeometry(0.18, 0.75, 0.18);[cite: 18]
    
    const leftArm = new THREE.Mesh(armGeo, matLimbs);
    leftArm.position.set(-0.42, 0.9, 0);[cite: 18]
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, matLimbs);
    rightArm.position.set(0.42, 0.9, 0);[cite: 18]
    playerGroup.add(rightArm);

    // 4. Legs Construction
    const legGeo = new THREE.BoxGeometry(0.2, 0.75, 0.2);[cite: 18]
    
    const leftLeg = new THREE.Mesh(legGeo, matLimbs);
    leftLeg.position.set(-0.18, 0.375, 0);[cite: 18]
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, matLimbs);
    rightLeg.position.set(0.18, 0.375, 0);[cite: 18]
    playerGroup.add(rightLeg);

    return playerGroup;
}

// 2. Advanced Companion Pet 3D Mesh Generator (Dragon & Tiger)
function createPetMesh(petType) {
    const petGroup = new THREE.Group();

    if (petType === 'dragon') {
        const dragonMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.3, metalness: 0.8, emissive: 0xa855f7, emissiveIntensity: 0.4 });
        const bodyGeo = new THREE.BoxGeometry(0.4, 0.4, 0.6);
        const body = new THREE.Mesh(bodyGeo, dragonMat);
        petGroup.add(body);

        const wingMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, side: THREE.DoubleSide });
        const wingGeo = new THREE.PlaneGeometry(0.5, 0.3);
        
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.3, 0.2, 0);
        leftWing.rotation.y = Math.PI / 4;
        petGroup.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.3, 0.2, 0);
        rightWing.rotation.y = -Math.PI / 4;
        petGroup.add(rightWing);

    } else if (petType === 'tiger') {
        const tigerMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.5, emissive: 0xea580c, emissiveIntensity: 0.3 });
        const bodyGeo = new THREE.BoxGeometry(0.35, 0.35, 0.7);
        const body = new THREE.Mesh(bodyGeo, tigerMat);
        petGroup.add(body);

        const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const head = new THREE.Mesh(headGeo, tigerMat);
        head.position.set(0, 0.2, 0.4);
        petGroup.add(head);
    }

    return petGroup;
}

// 3. Atmospheric Environment Lighting and Particle Glow Effects
function setupEnvironmentLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x9333ea, 0x06b6d4, 0.6);
    scene.add(hemiLight);
}

// Global scope par attach karna taaki game.js ise easily access kar sake
window.createPlayerMesh = createPlayerMesh;
window.createPetMesh = createPetMesh;
window.setupEnvironmentLighting = setupEnvironmentLighting;