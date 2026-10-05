// --- VISUALS & PLAYER SKINS SYSTEM ---

function createPlayerMesh(skinType) {
    const playerGroup = new THREE.Group();

    let primaryColor = 0x06b6d4; // Cyan
    let secondaryColor = 0x3b82f6;
    let accentColor = 0xffffff;

    if (skinType === 'ninja') {
        primaryColor = 0xec4899; // Pink
        secondaryColor = 0x831843;
    } else if (skinType === 'gold') {
        primaryColor = 0xf59e0b; // Gold
        secondaryColor = 0xb45309;
    } else if (skinType === 'shadow') {
        primaryColor = 0xef4444; // Red
        secondaryColor = 0x7f1d1d;
    }

    const matBody = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.3, metalness: 0.8 });
    const matLimbs = new THREE.MeshStandardMaterial({ color: secondaryColor, roughness: 0.5 });
    const matHead = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.2 });

    const torsoGeo = new THREE.BoxGeometry(0.6, 0.9, 0.35);
    const torso = new THREE.Mesh(torsoGeo, matBody);
    torso.position.y = 0.9;
    playerGroup.add(torso);

    const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const head = new THREE.Mesh(headGeo, matHead);
    head.position.y = 1.5;
    playerGroup.add(head);

    const armGeo = new THREE.BoxGeometry(0.18, 0.75, 0.18);
    const leftArm = new THREE.Mesh(armGeo, matLimbs);
    leftArm.position.set(-0.42, 0.9, 0);
    playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, matLimbs);
    rightArm.position.set(0.42, 0.9, 0);
    playerGroup.add(rightArm);

    const legGeo = new THREE.BoxGeometry(0.2, 0.75, 0.2);
    const leftLeg = new THREE.Mesh(legGeo, matLimbs);
    leftLeg.position.set(-0.18, 0.375, 0);
    playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, matLimbs);
    rightLeg.position.set(0.18, 0.375, 0);
    playerGroup.add(rightLeg);

    return playerGroup;
}