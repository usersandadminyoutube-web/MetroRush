// --- PLAYER CLASS MODULE (Three.js) ---
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class Player {
    constructor(scene) {
        this.scene = scene;
        
        // प्लेयर के साइज (Dimensions)
        this.width = 1.2;
        this.height = 2.2;
        this.depth = 1.2;
        
        // लेन सिस्टम (3 Lanes: -2.5 (Left), 0 (Center), 2.5 (Right))
        this.lanes = [-2.5, 0, 2.5];
        this.currentLaneIndex = 1; // शुरुआत सेंटर लेन से होगी
        
        // पोजीशन और फिजिक्स वेरिएबल्स
        this.targetX = this.lanes[this.currentLaneIndex];
        this.x = this.targetX;
        this.y = 0;
        this.z = 0;
        
        this.yVelocity = 0;
        this.gravity = 0.018;
        this.jumpForce = 0.32;
        this.isJumping = false;
        this.isSliding = false;
        
        this.isAlive = true;
        
        // 3D मेश बनाएं और सीन में जोड़ें
        this.mesh = this.createPlayerMesh();
        this.scene.add(this.mesh);
        
        // कोलिजन बाउंडिंग बॉक्स
        this.boundingMesh = new THREE.Box3();
        this.updateBoundingBox();
    }

    // एडवांस 3D प्लेयर डिजाइन (Cyberpunk Look)
    createPlayerMesh() {
        const playerGroup = new THREE.Group();

        // मटेरियल सेटअप (नियॉन कलर्स)
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x06b6d4, 
            roughness: 0.3,
            metalness: 0.8 
        });
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1e293b, 
            roughness: 0.2 
        });
        const limbMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0f172a, 
            roughness: 0.4 
        });

        // 1. धड़ (Torso)
        const torsoGeo = new THREE.BoxGeometry(0.9, 1.4, 0.7);
        const torso = new THREE.Mesh(torsoGeo, bodyMaterial);
        torso.position.y = 0.7;
        torso.castShadow = true;
        playerGroup.add(torso);

        // 2. सिर (Head)
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const head = new THREE.Mesh(headGeo, headMaterial);
        head.position.y = 1.55;
        playerGroup.add(head);

        // सिर पर चमकता हुआ वाइजर (Visor)
        const visorGeo = new THREE.BoxGeometry(0.45, 0.15, 0.2);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.6, 0.2);
        playerGroup.add(visor);

        // 3. पैर (Left & Right Legs)
        const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        
        this.leftLeg = new THREE.Mesh(legGeo, limbMaterial);
        this.leftLeg.position.set(-0.22, -0.2, 0);
        playerGroup.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, limbMaterial);
        this.rightLeg.position.set(0.22, -0.2, 0);
        playerGroup.add(this.rightLeg);

        // शुरुआती पोजीशन सेट करें
        playerGroup.position.set(this.x, this.y, this.z);
        return playerGroup;
    }

    // बाएं लेन में जाना
    moveLeft() {
        if (this.currentLaneIndex > 0) {
            this.currentLaneIndex--;
            this.targetX = this.lanes[this.currentLaneIndex];
        }
    }

    // दाएं लेन में जाना
    moveRight() {
        if (this.currentLaneIndex < this.lanes.length - 1) {
            this.currentLaneIndex++;
            this.targetX = this.lanes[this.currentLaneIndex];
        }
    }

    // कूदना (Jump)
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.yVelocity = this.jumpForce;
            this.isJumping = true;
        }
    }

    // स्लाइड करना (Slide)
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.mesh.scale.y = 0.4;
            this.mesh.position.y = -0.4;
            
            setTimeout(() => {
                this.isSliding = false;
                this.mesh.scale.y = 1.0;
                this.mesh.position.y = 0;
            }, 600); // 0.6 सेकंड बाद नॉर्मल हो जाएगा
        }
    }

    // हर फ्रेम पर चलने वाला अपडेट लॉजिक
    update() {
        if (!this.isAlive) return;

        // लेन बदलने के लिए स्मूथ ट्रांजिशन (Lerp)
        this.x += (this.targetX - this.x) * 0.25;

        // ग्रेविटी और जंपिंग फिजिक्स
        if (this.isJumping) {
            this.y += this.yVelocity;
            this.yVelocity -= this.gravity;
            
            if (this.y <= 0) {
                this.y = 0;
                this.yVelocity = 0;
                this.isJumping = false;
            }
        }

        // 3D मेश की पोजीशन अपडेट करें
        this.mesh.position.set(this.x, this.y, this.z);

        // दौड़ते वक्त पैरों का एनिमेशन
        if (!this.isJumping && !this.isSliding) {
            const time = Date.now() * 0.02;
            this.leftLeg.rotation.x = Math.sin(time) * 0.7;
            this.rightLeg.rotation.x = -Math.sin(time) * 0.7;
        } else {
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
        }

        this.updateBoundingBox();
    }

    // कोलिजन बॉक्स अपडेट करना
    updateBoundingBox() {
        this.boundingMesh.setFromObject(this.mesh);
    }

    // गेम रीसेट करने के लिए
    reset() {
        this.currentLaneIndex = 1;
        this.targetX = this.lanes[this.currentLaneIndex];
        this.x = this.targetX;
        this.y = 0;
        this.yVelocity = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.isAlive = true;
        this.mesh.scale.set(1, 1, 1);
        this.mesh.position.set(this.x, this.y, this.z);
    }
}