import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a15); // Dark night-club background

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, 12); // Adjusted to view the full avocado on stage

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Orbit controls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting - Night club vibe with dramatic spotlight
const ambientLight = new THREE.AmbientLight(0x2a2a4e, 0.3); // Dimmer ambient for contrast
scene.add(ambientLight);

// Background accent lights
const accentLight1 = new THREE.PointLight(0x5522dd, 0.8, 25);
accentLight1.position.set(5, 3, -3);
scene.add(accentLight1);

const accentLight2 = new THREE.PointLight(0xdd2266, 0.8, 25);
accentLight2.position.set(-5, 3, -3);
scene.add(accentLight2);

// MAIN SPOTLIGHT on the avocado (starts white, turns yellow on catch) - VERY BRIGHT!
const mainSpotlight = new THREE.SpotLight(0xffffff, 10.0); // Even brighter!
mainSpotlight.position.set(0, 14, 2);
mainSpotlight.angle = Math.PI / 6;
mainSpotlight.penumbra = 0.1; // Very sharp edge
mainSpotlight.decay = 1.0;
mainSpotlight.distance = 50;
mainSpotlight.castShadow = true;
mainSpotlight.shadow.mapSize.width = 2048;
mainSpotlight.shadow.mapSize.height = 2048;
scene.add(mainSpotlight);
mainSpotlight.target.position.set(0, 0, 0); // Aimed at center stage
scene.add(mainSpotlight.target);

// Create a visible cone of light beam shining down on the whole stage
const coneGeometry = new THREE.ConeGeometry(5, 14, 32, 1, false); // Wide radius to cover stage
const coneMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
});
const lightCone = new THREE.Mesh(coneGeometry, coneMaterial);
lightCone.position.set(0, 7, 2); // Halfway between light source and ground
lightCone.rotation.x = 0; // Point cone tip downward, wide base at top (reversed)
scene.add(lightCone);

// Store reference to cone for color changes
let spotlightCone = lightCone;

// Side stage lights (dimmer for contrast)
const sideLight1 = new THREE.SpotLight(0x6633cc, 1.5);
sideLight1.position.set(4, 6, 2);
sideLight1.angle = Math.PI / 4;
sideLight1.penumbra = 0.5;
scene.add(sideLight1);
sideLight1.target.position.set(0, 0, 0);
scene.add(sideLight1.target);

const sideLight2 = new THREE.SpotLight(0xcc3366, 1.5);
sideLight2.position.set(-4, 6, 2);
sideLight2.angle = Math.PI / 4;
sideLight2.penumbra = 0.5;
scene.add(sideLight2);
sideLight2.target.position.set(0, 0, 0);
scene.add(sideLight2.target);

// Karaoke Stage
function createKaraokeStage() {
    const stageGroup = new THREE.Group();

    // Main stage platform
    const stageGeometry = new THREE.BoxGeometry(8, 0.5, 6);
    const stageMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.3,
        roughness: 0.7
    });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.y = -0.25;
    stage.receiveShadow = true;
    stage.castShadow = true;
    stageGroup.add(stage);

    // Stage edge trim (gold)
    const trimGeometry = new THREE.BoxGeometry(8.2, 0.1, 6.2);
    const trimMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2
    });
    const trim = new THREE.Mesh(trimGeometry, trimMaterial);
    trim.position.y = 0.05;
    stageGroup.add(trim);

    // Stage steps
    for (let i = 0; i < 3; i++) {
        const stepGeometry = new THREE.BoxGeometry(2, 0.2, 1);
        const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
        const step = new THREE.Mesh(stepGeometry, stepMaterial);
        step.position.set(0, -0.5 - (i * 0.2), 3.5 + (i * 0.3));
        step.receiveShadow = true;
        stageGroup.add(step);
    }

    return stageGroup;
}

const karaokeStage = createKaraokeStage();
scene.add(karaokeStage);

// Create microphone
function createMicrophone() {
    const micGroup = new THREE.Group();

    // Microphone head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.15;
    head.castShadow = true;
    micGroup.add(head);

    // Microphone handle
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16);
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.7,
        roughness: 0.3
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = -0.15;
    handle.castShadow = true;
    micGroup.add(handle);

    // Position microphone in avocado's hand position
    micGroup.position.set(0.8, 1.5, 0.5);
    micGroup.rotation.z = Math.PI / 6; // Slight angle

    return micGroup;
}

// Microphone will be created and attached to avocado after it loads

// Game state
let avocadoModel = null;
let microphone = null;
let avocadoBaseY = 0; // Ground position for avocado
let avocadoCurrentY = 0;
let avocadoCurrentX = 0;
let avocadoVelocityY = 0;
let isJumping = false;
const JUMP_FORCE = 0.8;
const GRAVITY = 0.03;
const MOVE_SPEED = 0.15;
const STAGE_LIMIT_X = 3.5; // Keep avocado on stage

// Movement keys
let keys = {
    left: false,
    right: false,
    shift: false
};

// Rotation state
let targetRotation = 0;
let currentRotation = 0;
const ROTATION_SPEED = 0.1;

// Microphone state - HORIZONTAL movement
let microphoneX = 0; // Starting X position
let microphoneY = 5; // Fixed height
let microphoneDirection = 1; // 1 for right, -1 for left
const MIC_SPEED = 0.05;
const MIC_MIN_X = -3;
const MIC_MAX_X = 3;

// Game score
let score = 0;
let hasMicrophone = false;
let shouldSpawnNext = false;

// Spotlight state
let spotlightColor = 0xffffff; // White by default
let spotlightTransition = 0;
const SPOTLIGHT_YELLOW = 0xffff00;
const SPOTLIGHT_WHITE = 0xffffff;

// Load avocado model
const loader = new GLTFLoader();
loader.load(
    'AVOCADO.glb',
    (gltf) => {
        avocadoModel = gltf.scene;

        // Scale up the avocado to make it bigger (2x larger)
        avocadoModel.scale.set(10, 10, 10);

        // Calculate avocado's bounding box AFTER scaling to position it properly on the stage
        const box = new THREE.Box3().setFromObject(avocadoModel);
        const height = box.max.y - box.min.y;

        // Position avocado so its bottom sits on the stage surface (y = 0)
        avocadoBaseY = -box.min.y;
        avocadoCurrentY = avocadoBaseY;
        avocadoModel.position.y = avocadoBaseY;

        // Enable shadows
        avocadoModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        scene.add(avocadoModel);

        // Create microphone separately (not attached to avocado)
        microphone = createMicrophone();
        microphone.position.set(microphoneX, microphoneY, 0);
        scene.add(microphone);

        console.log('Avocado model loaded successfully!');
    },
    (progress) => {
        console.log('Loading: ' + (progress.loaded / progress.total * 100) + '%');
    },
    (error) => {
        console.error('Error loading model:', error);
    }
);

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isJumping && avocadoModel) {
        event.preventDefault();
        isJumping = true;
        avocadoVelocityY = JUMP_FORCE;
    }
    if (event.code === 'ArrowLeft') {
        event.preventDefault();
        keys.left = true;
    }
    if (event.code === 'ArrowRight') {
        event.preventDefault();
        keys.right = true;
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        event.preventDefault();
        if (!keys.shift) {
            keys.shift = true;
            targetRotation += Math.PI / 2; // Rotate 90 degrees
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft') {
        keys.left = false;
    }
    if (event.code === 'ArrowRight') {
        keys.right = false;
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        keys.shift = false;
    }
});

// Spawn a new microphone
function spawnNewMicrophone() {
    // Random starting position and direction
    microphoneX = (Math.random() - 0.5) * 4; // Random X between -2 and 2
    microphoneDirection = Math.random() > 0.5 ? 1 : -1;

    microphone = createMicrophone();
    microphone.position.set(microphoneX, microphoneY, 0);
    scene.add(microphone);
    hasMicrophone = false;
}

// Check collision between avocado and microphone
function checkCollision() {
    if (!avocadoModel || !microphone || hasMicrophone) return;

    const avocadoBox = new THREE.Box3().setFromObject(avocadoModel);
    const micBox = new THREE.Box3().setFromObject(microphone);

    if (avocadoBox.intersectsBox(micBox)) {
        hasMicrophone = true;
        score++;
        updateScore();

        // Remove old microphone from scene
        scene.remove(microphone);

        // Turn spotlight yellow!
        spotlightColor = SPOTLIGHT_YELLOW;
        mainSpotlight.color.setHex(SPOTLIGHT_YELLOW);
        spotlightCone.material.color.setHex(SPOTLIGHT_YELLOW);

        // Mark that we should spawn next mic when landed
        shouldSpawnNext = true;
    }
}

// Update score display
function updateScore() {
    document.getElementById('count').textContent = score;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update avocado movement and jumping physics
    if (avocadoModel) {
        // Horizontal movement (left/right)
        if (keys.left) {
            avocadoCurrentX -= MOVE_SPEED;
            if (avocadoCurrentX < -STAGE_LIMIT_X) {
                avocadoCurrentX = -STAGE_LIMIT_X;
            }
        }
        if (keys.right) {
            avocadoCurrentX += MOVE_SPEED;
            if (avocadoCurrentX > STAGE_LIMIT_X) {
                avocadoCurrentX = STAGE_LIMIT_X;
            }
        }

        // Vertical movement (jumping)
        if (isJumping) {
            avocadoVelocityY -= GRAVITY;
            avocadoCurrentY += avocadoVelocityY;

            // Check if landed
            if (avocadoCurrentY <= avocadoBaseY) {
                avocadoCurrentY = avocadoBaseY;
                avocadoVelocityY = 0;
                isJumping = false;

                // Spawn new microphone when avocado lands after catching one
                if (shouldSpawnNext) {
                    shouldSpawnNext = false;
                    spawnNewMicrophone();

                    // Turn spotlight back to white
                    spotlightColor = SPOTLIGHT_WHITE;
                    mainSpotlight.color.setHex(SPOTLIGHT_WHITE);
                    spotlightCone.material.color.setHex(SPOTLIGHT_WHITE);
                }
            }
        }

        // Smooth rotation animation
        const rotationDiff = targetRotation - currentRotation;
        if (Math.abs(rotationDiff) > 0.01) {
            currentRotation += rotationDiff * ROTATION_SPEED;
        } else {
            currentRotation = targetRotation;
        }

        // Update avocado position and rotation
        avocadoModel.position.x = avocadoCurrentX;
        avocadoModel.position.y = avocadoCurrentY;
        avocadoModel.rotation.y = currentRotation;
    }

    // Update microphone HORIZONTAL movement (only if not caught)
    if (microphone && !hasMicrophone) {
        microphoneX += MIC_SPEED * microphoneDirection;

        // Reverse direction at bounds
        if (microphoneX >= MIC_MAX_X) {
            microphoneX = MIC_MAX_X;
            microphoneDirection = -1;
        } else if (microphoneX <= MIC_MIN_X) {
            microphoneX = MIC_MIN_X;
            microphoneDirection = 1;
        }

        microphone.position.x = microphoneX;
    }

    // Check for collision
    checkCollision();

    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
