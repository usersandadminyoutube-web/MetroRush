// --- ADVANCED PLAYER CLASS MODULE (Three.js) ---
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class Player {
    constructor(scene, skinName = 'default') {
        this.scene = scene;
        this.skinName = skinName;
        
        // Player Dimensions & Hitbox Settings
        this.width = 1.2;
        this.height = 2.2;
        this.depth = 1.2;
        
        // Lane System Configuration (3 Lanes: -2.5, 0, 2.5)
        this.lanes = [-2.5, 0, 2.5];
        this.currentLaneIndex = 1; // Starts at Center Lane
        
        // Position & Physics Variables
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
        
        // Tilt/Leaning effect variables for smooth lane turning
        this.rollAngle = 0;

        // Create 3D Mesh based on Selected Skin
        this.mesh = this.createPlayerMesh(this.skinName);
        this.scene.add(this.mesh);
        
        // Collision Bounding Box
        this.boundingMesh = new THREE.Box3();
        this.updateBoundingBox();
    }

    // Advanced Multi-Skin 3D Mesh Generator System
    createPlayerMesh(skin) {
        const playerGroup = new THREE.Group();

        let bodyColor = 0x06b6d4; // Default Cyan
        let headColor = 0x1e293b;
        let limbColor = 0x0f172a;
        let visorColor = 0x3b82f6;

        // Custom Skin Color Configurations
        if (skin === 'ninja') {
            bodyColor = 0xa855f7; // Purple Neon
            headColor = 0x2e1065;
            limbColor = 0x1e1b4b;
            visorColor = 0xec4899;
        } else if (skin === 'gold') {
            bodyColor = 0xf59e0b; // Gold Bot
            headColor = 0xb45309;
            limbColor = 0x78350f;
            visorColor = 0xfef08a;
        } else if (skin === 'shadow') {
            bodyColor = 0xef4444; // Shadow Runner Red
            headColor = 0x450a0a;
            limbColor = 0x18181b;
            visorColor = 0xf87171;
        }

        // Materials Setup
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: bodyColor, 
            roughness: 0.2,
            metalness: 0.9,
            emissive: bodyColor,
            emissiveIntensity: 0.2
        });
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: headColor, 
            roughness: 0.3 
        });
        const limbMaterial = new THREE.MeshStandardMaterial({ 
            color: limbColor, 
            roughness: 0.4 
        });

        // 1. Torso Construction
        const torsoGeo = new THREE.BoxGeometry(0.9, 1.4, 0.7);
        const torso = new THREE.Mesh(torsoGeo, bodyMaterial);
        torso.position.y = 0.7;
        torso.castShadow = true;
        playerGroup.add(torso);

        // 2. Head Construction
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const head = new THREE.Mesh(headGeo, headMaterial);
        head.position.y = 1.55;
        playerGroup.add(head);

        // Glowing Visor/Mask
        const visorGeo = new THREE.BoxGeometry(0.45, 0.15, 0.2);
        const visorMat = new THREE.MeshBasicMaterial({ color: visorColor });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.6, 0.2);
        playerGroup.add(visor);

        // 3. Limbs (Left & Right Legs)
        const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        
        this.leftLeg = new THREE.Mesh(legGeo, limbMaterial);
        this.leftLeg.position.set(-0.22, -0.2, 0);
        playerGroup.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, limbMaterial);
        this.rightLeg.position.set(0.22, -0.2, 0);
        playerGroup.add(this.rightLeg);

        // Set Initial Position
        playerGroup.position.set(this.x, this.y, this.z);
        return playerGroup;
    }

    // Move to Left Lane
    moveLeft() {
        if (this.currentLaneIndex > 0) {
            this.currentLaneIndex--;
            this.targetX = this.lanes[this.currentLaneIndex];
        }
    }

    // Move to Right Lane
    moveRight() {
        if (this.currentLaneIndex < this.lanes.length - 1) {
            this.currentLaneIndex++;
            this.targetX = this.lanes[this.currentLaneIndex];
        }
    }

    // Jump Execution
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.yVelocity = this.jumpForce;
            this.isJumping = true;
        }
    }

    // Slide Execution
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.mesh.scale.y = 0.4;
            this.mesh.position.y = -0.4;
            
            setTimeout(() => {
                this.isSliding = false;
                this.mesh.scale.y = 1.0;
                this.mesh.position.y = 0;
            }, 600);
        }
    }

    // Main Update Loop (Called every frame)
    update() {
        if (!this.isAlive) return;

        // Smooth Lane Transition (Lerp) with banking/leaning effect
        const diffX = this.targetX - this.x;
        this.x += diffX * 0.25;
        
        // Calculate banking rotation based on movement direction
        let targetRoll = -diffX * 0.15;
        this.rollAngle += (targetRoll - this.rollAngle) * 0.2;
        this.mesh.rotation.z = this.rollAngle;

        // Gravity and Jumping Physics
        if (this.isJumping) {
            this.y += this.yVelocity;
            this.yVelocity -= this.gravity;
            
            if (this.y <= 0) {
                this.y = 0;
                this.yVelocity = 0;
                this.isJumping = false;
            }
        }

        // Update 3D Mesh Position
        this.mesh.position.set(this.x, this.y, this.z);

        // Running Leg Animation Cycle
        if (!this.isJumping && !this.isSliding) {
            const time = Date.now() * 0.025;
            this.leftLeg.rotation.x = Math.sin(time) * 0.8;
            this.rightLeg.rotation.x = -Math.sin(time) * 0.8;
        } else {
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
        }

        this.updateBoundingBox();
    }

    // Refresh Bounding Box for Hit Detection
    updateBoundingBox() {
        this.boundingMesh.setFromObject(this.mesh);
    }

    // Change Player Skin Dynamically
    setSkin(newSkin) {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        this.skinName = newSkin;
        this.mesh = this.createPlayerMesh(this.skinName);
        this.scene.add(this.mesh);
    }

    // Reset Player State for New Game
    reset() {
        this.currentLaneIndex = 1;
        this.targetX = this.lanes[this.currentLaneIndex];
        this.x = this.targetX;
        this.y = 0;
        this.yVelocity = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.isAlive = true;
        this.rollAngle = 0;
        this.mesh.scale.set(1, 1, 1);
        this.mesh.rotation.set(0, 0, 0);
        this.mesh.position.set(this.x, this.y, this.z);
    }
}