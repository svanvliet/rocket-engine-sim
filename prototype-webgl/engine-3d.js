// Rocket Engine Test Fire - 3D WebGL Prototype
// Three.js based rendering with orbit controls and particle effects

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class RocketEngineSimulator3D {
    constructor() {
        this.canvas = document.getElementById('engine-canvas');
        
        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 400 / 600, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(400, 600);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Orbit controls
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 15;
        this.controls.target.set(0, -0.5, 0);
        
        // Camera position
        this.camera.position.set(4, 1, 4);
        this.camera.lookAt(0, -0.5, 0);
        
        // State
        this.state = 'idle';
        this.countdownValue = 3;
        this.firingTime = 0;
        this.maxFiringTime = 8000;
        
        // Current readings
        this.currentThrust = 0;
        this.currentIsp = 0;
        this.currentPressure = 0;
        
        // Target values
        this.targetThrust = 102;
        this.targetIsp = 290;
        this.targetPressure = 25;
        
        // Propellant system
        this.fuelCapacity = 850;
        this.oxidizerCapacity = 2125;
        this.fuelRemaining = this.fuelCapacity;
        this.oxidizerRemaining = this.oxidizerCapacity;
        this.fuelFlowRate = 35;
        this.oxidizerFlowRate = 87.5;
        
        // Graph data
        this.thrustData = [];
        this.pressureData = [];
        this.tempData = [];
        this.maxDataPoints = 100;
        
        // Animation
        this.clock = new THREE.Clock();
        this.flameIntensity = 0;
        
        // Exhaust visualization mode
        this.exhaustMode = 'rp1-lox';
        this.exhaustModes = {
            'stylized': {
                desc: 'Colorful arcade-style particles for visual impact',
                coreColor: [1, 0.9, 0.3],
                midColor: [1, 0.5, 0.1],
                outerColor: [1, 0.2, 0],
                particleSize: 0.35,
                particleCount: 80,
                speed: 4,
                spread: 0.4,
                showShockDiamonds: false,
                glowIntensity: 1.0
            },
            'rp1-lox': {
                desc: 'Kerosene fuel - orange flame with soot particles, visible shock structures',
                coreColor: [1, 0.95, 0.8],
                midColor: [1, 0.6, 0.2],
                outerColor: [0.8, 0.3, 0.1],
                sootColor: [0.2, 0.15, 0.1],
                particleSize: 0.2,
                particleCount: 100,
                speed: 6,
                spread: 0.25,
                showShockDiamonds: true,
                hasSoot: true,
                glowIntensity: 0.8
            },
            'lh2-lox': {
                desc: 'Hydrogen fuel - nearly invisible in daylight, faint blue shimmer',
                coreColor: [0.9, 0.95, 1],
                midColor: [0.7, 0.85, 1],
                outerColor: [0.5, 0.7, 0.9],
                particleSize: 0.12,
                particleCount: 50,
                speed: 8,
                spread: 0.15,
                showShockDiamonds: true,
                opacity: 0.3,
                glowIntensity: 0.3
            },
            'methane-lox': {
                desc: 'Methane fuel - blue-tinged flame, cleaner burn than kerosene',
                coreColor: [0.9, 0.95, 1],
                midColor: [0.6, 0.7, 1],
                outerColor: [0.3, 0.5, 0.9],
                particleSize: 0.25,
                particleCount: 80,
                speed: 5,
                spread: 0.2,
                showShockDiamonds: true,
                glowIntensity: 0.7
            },
            'shock-diamonds': {
                desc: 'Emphasizes Mach disk shock structures in supersonic exhaust',
                coreColor: [1, 1, 0.9],
                midColor: [1, 0.8, 0.4],
                outerColor: [0.8, 0.4, 0.2],
                particleSize: 0.18,
                particleCount: 70,
                speed: 7,
                spread: 0.15,
                showShockDiamonds: true,
                prominentShocks: true,
                glowIntensity: 0.9
            }
        };
        
        // Engine model definitions with real-world proportions
        this.engineModel = 'generic';
        this.engineModels = {
            'generic': {
                name: 'Generic Engine',
                desc: 'Simple engine for learning fundamentals',
                // Proportions (normalized, will be scaled)
                chamberRadius: 0.35,
                chamberLength: 0.8,
                throatRadius: 0.18,
                nozzleExitRadius: 0.70,
                nozzleLength: 1.2,
                totalLength: 2.5,
                expansionRatio: 15,
                hasTurbopump: true,
                hasGimbal: false,
                color: 0x8899aa
            },
            'merlin': {
                name: 'SpaceX Merlin 1D',
                desc: 'Falcon 9 first stage - RP-1/LOX, 845 kN thrust',
                chamberRadius: 0.28,
                chamberLength: 0.6,
                throatRadius: 0.15,
                nozzleExitRadius: 0.46,  // 0.92m / 2 scaled
                nozzleLength: 0.9,
                totalLength: 2.0,
                expansionRatio: 16,
                hasTurbopump: true,
                hasGimbal: true,
                color: 0x666666,  // Dark gray/black
                propellant: 'rp1-lox'
            },
            'raptor': {
                name: 'SpaceX Raptor 2',
                desc: 'Starship - Methane/LOX, 2,260 kN thrust, full-flow staged',
                chamberRadius: 0.40,
                chamberLength: 1.0,
                throatRadius: 0.20,
                nozzleExitRadius: 0.65,  // 1.3m / 2 scaled
                nozzleLength: 1.4,
                totalLength: 3.1,
                expansionRatio: 34,
                hasTurbopump: true,
                hasGimbal: true,
                hasPreburners: true,
                color: 0x444444,
                propellant: 'methane-lox'
            },
            'rs25': {
                name: 'RS-25 (SSME)',
                desc: 'Space Shuttle Main Engine - LH2/LOX, 2,279 kN, reusable',
                chamberRadius: 0.35,
                chamberLength: 0.9,
                throatRadius: 0.18,
                nozzleExitRadius: 1.20,  // 2.4m / 2 scaled
                nozzleLength: 2.0,
                totalLength: 4.3,
                expansionRatio: 69,
                hasTurbopump: true,
                hasGimbal: true,
                hasPreburners: true,
                color: 0xaa8866,  // Copper/bronze color
                propellant: 'lh2-lox'
            },
            'f1': {
                name: 'Rocketdyne F-1',
                desc: 'Saturn V first stage - RP-1/LOX, 6,770 kN, largest single-chamber',
                chamberRadius: 0.55,
                chamberLength: 1.2,
                throatRadius: 0.30,
                nozzleExitRadius: 1.85,  // 3.7m / 2 scaled
                nozzleLength: 2.8,
                totalLength: 5.6,
                expansionRatio: 16,
                hasTurbopump: true,
                hasGimbal: true,
                color: 0x888888,
                propellant: 'rp1-lox'
            }
        };
        
        // Current engine geometry (updated when model changes)
        this.engineGeometry = { ...this.engineModels['generic'] };
        
        // Particle system
        this.particles = [];
        this.particleSystem = null;
        this.maxParticles = 3000;
        
        // Shock diamond meshes
        this.shockDiamonds = [];
        
        // Engine group (for swapping models)
        this.engine = null;
        
        // Engine parts for glow effect
        this.nozzleInner = null;
        this.chamberInner = null;
        this.flameLight = null;
        
        // Build scene
        this.setupLights();
        this.buildEngine();
        this.setupParticleSystem();
        this.setupShockDiamonds();
        this.setupControls();
        this.setupModeSelectors();
        
        // Start animation
        this.animate = this.animate.bind(this);
        this.animate();
    }
    
    setupLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambient);
        
        // Main directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 5, 5);
        this.scene.add(dirLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4080ff, 0.3);
        fillLight.position.set(-3, 0, -3);
        this.scene.add(fillLight);
        
        // Flame light (dynamic)
        this.flameLight = new THREE.PointLight(0xff6600, 0, 5);
        this.flameLight.position.set(0, -2.5, 0);
        this.scene.add(this.flameLight);
    }
    
    buildEngine(modelName = null) {
        // Remove existing engine if rebuilding
        if (this.engine) {
            this.scene.remove(this.engine);
        }
        
        // Get engine geometry parameters
        const model = modelName || this.engineModel;
        const geo = this.engineModels[model];
        this.engineGeometry = { ...geo };
        
        const engineGroup = new THREE.Group();
        
        // Scale factor to normalize different engine sizes for display
        const scale = 1.0 / (geo.totalLength / 2.5);
        
        // Materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: geo.color || 0x8899aa,
            metalness: 0.8,
            roughness: 0.3
        });
        
        const darkMetalMaterial = new THREE.MeshStandardMaterial({
            color: 0x556677,
            metalness: 0.7,
            roughness: 0.4
        });
        
        const copperMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc8855,
            metalness: 0.9,
            roughness: 0.2
        });
        
        // Scaled dimensions
        const chamberRadius = geo.chamberRadius * scale;
        const chamberLength = geo.chamberLength * scale;
        const throatRadius = geo.throatRadius * scale;
        const nozzleExitRadius = geo.nozzleExitRadius * scale;
        const nozzleLength = geo.nozzleLength * scale;
        
        // Calculate Y positions
        const chamberTop = 0.6;
        const chamberBottom = chamberTop - chamberLength;
        const throatY = chamberBottom - 0.1;
        const nozzleStartY = throatY - 0.1;
        const nozzleEndY = nozzleStartY - nozzleLength;
        
        // Store for plume calculations (unscaled for emission)
        this.nozzleExitY = nozzleEndY;
        this.nozzleExitRadius = nozzleExitRadius;
        
        // === TURBOPUMP (top) ===
        if (geo.hasTurbopump) {
            const turbopumpRadius = chamberRadius * 0.7;
            const turbopumpBody = new THREE.Mesh(
                new THREE.CylinderGeometry(turbopumpRadius, turbopumpRadius, 0.3, 32),
                metalMaterial
            );
            turbopumpBody.position.y = chamberTop + 0.5;
            engineGroup.add(turbopumpBody);
            
            // Turbopump cap
            const turbopumpCap = new THREE.Mesh(
                new THREE.SphereGeometry(turbopumpRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
                darkMetalMaterial
            );
            turbopumpCap.position.y = chamberTop + 0.65;
            engineGroup.add(turbopumpCap);
            
            // Turbopump bands
            for (let i = 0; i < 2; i++) {
                const band = new THREE.Mesh(
                    new THREE.TorusGeometry(turbopumpRadius + 0.01, 0.02, 8, 32),
                    darkMetalMaterial
                );
                band.rotation.x = Math.PI / 2;
                band.position.y = chamberTop + 0.42 + i * 0.15;
                engineGroup.add(band);
            }
            
            // Pre-burners for staged combustion engines
            if (geo.hasPreburners) {
                const preburnerMat = new THREE.MeshStandardMaterial({
                    color: 0x997755,
                    metalness: 0.8,
                    roughness: 0.3
                });
                for (let side = -1; side <= 1; side += 2) {
                    const preburner = new THREE.Mesh(
                        new THREE.CylinderGeometry(turbopumpRadius * 0.4, turbopumpRadius * 0.5, 0.25, 16),
                        preburnerMat
                    );
                    preburner.position.set(side * (turbopumpRadius + 0.15), chamberTop + 0.45, 0);
                    engineGroup.add(preburner);
                }
            }
        }
        
        // === PROPELLANT LINES ===
        const pipeRadius = 0.04;
        const fuelPipeMaterial = new THREE.MeshStandardMaterial({
            color: 0x998888,
            metalness: 0.7,
            roughness: 0.3
        });
        const oxPipeMaterial = new THREE.MeshStandardMaterial({
            color: 0x8888aa,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const pipeOffset = chamberRadius + 0.15;
        const leftPipePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-chamberRadius * 0.7, chamberTop + 0.45, 0),
            new THREE.Vector3(-pipeOffset, chamberTop + 0.45, 0),
            new THREE.Vector3(-pipeOffset, chamberTop - 0.2, 0),
            new THREE.Vector3(-chamberRadius - 0.05, chamberTop - 0.4, 0)
        ]);
        const leftPipe = new THREE.Mesh(
            new THREE.TubeGeometry(leftPipePath, 20, pipeRadius, 8, false),
            fuelPipeMaterial
        );
        engineGroup.add(leftPipe);
        
        const rightPipePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(chamberRadius * 0.7, chamberTop + 0.45, 0),
            new THREE.Vector3(pipeOffset, chamberTop + 0.45, 0),
            new THREE.Vector3(pipeOffset, chamberTop - 0.2, 0),
            new THREE.Vector3(chamberRadius + 0.05, chamberTop - 0.4, 0)
        ]);
        const rightPipe = new THREE.Mesh(
            new THREE.TubeGeometry(rightPipePath, 20, pipeRadius, 8, false),
            oxPipeMaterial
        );
        engineGroup.add(rightPipe);
        
        // Valves
        const valveGeom = new THREE.BoxGeometry(0.1, 0.12, 0.08);
        const leftValve = new THREE.Mesh(valveGeom, darkMetalMaterial);
        leftValve.position.set(-pipeOffset, chamberTop + 0.1, 0);
        engineGroup.add(leftValve);
        const rightValve = new THREE.Mesh(valveGeom, darkMetalMaterial);
        rightValve.position.set(pipeOffset, chamberTop + 0.1, 0);
        engineGroup.add(rightValve);
        
        // === INJECTOR PLATE ===
        const injector = new THREE.Mesh(
            new THREE.CylinderGeometry(chamberRadius + 0.03, chamberRadius + 0.03, 0.08, 32),
            copperMaterial
        );
        injector.position.y = chamberTop;
        engineGroup.add(injector);
        
        // Injector holes
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const hole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8),
                darkMetalMaterial
            );
            hole.position.set(
                Math.cos(angle) * chamberRadius * 0.7,
                chamberTop,
                Math.sin(angle) * chamberRadius * 0.7
            );
            engineGroup.add(hole);
        }
        
        // === COMBUSTION CHAMBER ===
        const chamberGeom = new THREE.CylinderGeometry(chamberRadius * 0.95, chamberRadius, chamberLength, 32);
        const chamber = new THREE.Mesh(chamberGeom, metalMaterial);
        chamber.position.y = chamberTop - chamberLength / 2;
        engineGroup.add(chamber);
        
        // Chamber cooling bands
        const numBands = Math.max(2, Math.floor(chamberLength / 0.2));
        for (let i = 0; i < numBands; i++) {
            const t = i / (numBands - 1);
            const bandRadius = chamberRadius * (0.95 + t * 0.05);
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(bandRadius + 0.01, 0.015, 8, 32),
                darkMetalMaterial
            );
            band.rotation.x = Math.PI / 2;
            band.position.y = chamberTop - t * chamberLength;
            engineGroup.add(band);
        }
        
        // Chamber inner glow
        const chamberInnerGeom = new THREE.CylinderGeometry(chamberRadius * 0.85, chamberRadius * 0.9, chamberLength * 0.9, 32);
        this.chamberInner = new THREE.Mesh(
            chamberInnerGeom,
            new THREE.MeshBasicMaterial({ 
                color: 0xff6600, 
                transparent: true, 
                opacity: 0 
            })
        );
        this.chamberInner.position.y = chamberTop - chamberLength / 2;
        engineGroup.add(this.chamberInner);
        
        // === THROAT ===
        const throatGeom = new THREE.CylinderGeometry(chamberRadius, throatRadius, 0.15, 32);
        const throat = new THREE.Mesh(throatGeom, metalMaterial);
        throat.position.y = throatY;
        engineGroup.add(throat);
        
        // === NOZZLE (bell curve) ===
        const nozzlePoints = [];
        const nozzleSegments = 40;
        for (let i = 0; i <= nozzleSegments; i++) {
            const t = i / nozzleSegments;
            const y = nozzleStartY - t * nozzleLength;
            // Bell curve: starts at throat radius, expands to exit radius
            const r = throatRadius + Math.pow(t, 0.6) * (nozzleExitRadius - throatRadius);
            nozzlePoints.push(new THREE.Vector2(r, y));
        }
        
        const nozzleGeom = new THREE.LatheGeometry(nozzlePoints, 48);
        const nozzle = new THREE.Mesh(nozzleGeom, metalMaterial);
        engineGroup.add(nozzle);
        
        // Nozzle inner surface (for glow)
        const nozzleInnerPoints = [];
        for (let i = 0; i <= nozzleSegments; i++) {
            const t = i / nozzleSegments;
            const y = nozzleStartY - t * nozzleLength;
            const r = (throatRadius * 0.95) + Math.pow(t, 0.6) * (nozzleExitRadius * 0.95 - throatRadius * 0.95);
            nozzleInnerPoints.push(new THREE.Vector2(r, y));
        }
        
        const nozzleInnerGeom = new THREE.LatheGeometry(nozzleInnerPoints, 48);
        this.nozzleInner = new THREE.Mesh(
            nozzleInnerGeom,
            new THREE.MeshBasicMaterial({ 
                color: 0xff8844, 
                transparent: true, 
                opacity: 0,
                side: THREE.BackSide
            })
        );
        engineGroup.add(this.nozzleInner);
        
        // Nozzle exit rim
        const rimGeom = new THREE.TorusGeometry(nozzleExitRadius + 0.02, 0.025, 8, 48);
        const rim = new THREE.Mesh(rimGeom, darkMetalMaterial);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = nozzleEndY;
        engineGroup.add(rim);
        
        // Nozzle bands
        const numNozzleBands = Math.max(3, Math.floor(nozzleLength / 0.3));
        for (let i = 0; i < numNozzleBands; i++) {
            const t = i / numNozzleBands;
            const y = nozzleStartY - t * nozzleLength;
            const r = throatRadius + Math.pow(t, 0.6) * (nozzleExitRadius - throatRadius);
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(r + 0.01, 0.012, 8, 48),
                darkMetalMaterial
            );
            band.rotation.x = Math.PI / 2;
            band.position.y = y;
            engineGroup.add(band);
        }
        
        // === GIMBAL MOUNT ===
        if (geo.hasGimbal) {
            const gimbalRing = new THREE.Mesh(
                new THREE.TorusGeometry(chamberRadius + 0.1, 0.05, 16, 32),
                darkMetalMaterial
            );
            gimbalRing.rotation.x = Math.PI / 2;
            gimbalRing.position.y = chamberBottom + 0.05;
            engineGroup.add(gimbalRing);
            
            // Gimbal actuator mounts
            for (let i = 0; i < 2; i++) {
                const angle = i * Math.PI;
                const mount = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.15, 0.08),
                    darkMetalMaterial
                );
                mount.position.set(
                    Math.cos(angle) * (chamberRadius + 0.15),
                    chamberBottom,
                    Math.sin(angle) * (chamberRadius + 0.15)
                );
                engineGroup.add(mount);
            }
        }
        
        // Update flame light position
        this.flameLight.position.y = nozzleEndY - 0.5;
        
        this.engine = engineGroup;
        this.scene.add(engineGroup);
    }
    
    setupParticleSystem() {
        // Create particle geometry
        const geometry = new THREE.BufferGeometry();
        
        // Initialize particle positions, colors, and sizes
        const positions = new Float32Array(this.maxParticles * 3);
        const colors = new Float32Array(this.maxParticles * 3);
        const sizes = new Float32Array(this.maxParticles);
        const lifetimes = new Float32Array(this.maxParticles);
        
        for (let i = 0; i < this.maxParticles; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = -10; // Start off-screen
            positions[i * 3 + 2] = 0;
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 0.5;
            colors[i * 3 + 2] = 0;
            sizes[i] = 0;
            lifetimes[i] = 0;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create a circular gradient texture for particles
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 100, 50, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        // Particle material with proper depth settings
        const material = new THREE.PointsMaterial({
            size: 0.4,
            map: texture,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false,  // Don't write to depth buffer - fixes visibility from all angles
            depthTest: true
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.frustumCulled = false; // Always render particles
        this.scene.add(this.particleSystem);
        
        // Initialize particle data
        this.particleData = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particleData.push({
                life: 0,
                velocity: new THREE.Vector3(),
                active: false,
                isSoot: false,
                normalizedRadius: 0,
                angle: 0
            });
        }
        this.nextParticle = 0;
    }
    
    emitParticle(isSoot = false) {
        const idx = this.nextParticle;
        this.nextParticle = (this.nextParticle + 1) % this.maxParticles;
        
        const mode = this.exhaustModes[this.exhaustMode];
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        const sizes = this.particleSystem.geometry.attributes.size.array;
        
        // Use dynamic nozzle geometry from current engine model
        const nozzleExitY = this.nozzleExitY || -1.65;
        const nozzleExitRadius = this.nozzleExitRadius || 0.70;
        
        // Start particles at the nozzle exit, distributed across the full exit area
        const angle = Math.random() * Math.PI * 2;
        // Use sqrt for uniform disk distribution - fills the entire exit
        const r = Math.sqrt(Math.random()) * nozzleExitRadius;
        
        positions[idx * 3] = Math.cos(angle) * r;
        positions[idx * 3 + 1] = nozzleExitY;
        positions[idx * 3 + 2] = Math.sin(angle) * r;
        
        // Velocity - primarily downward with slight outward expansion
        const speed = mode.speed * (0.8 + Math.random() * 0.4);
        
        // Particles near edge expand outward more than center particles
        const normalizedR = r / nozzleExitRadius;
        const outwardVel = normalizedR * mode.spread * 0.8;
        
        this.particleData[idx].velocity.set(
            Math.cos(angle) * outwardVel,
            -speed,
            Math.sin(angle) * outwardVel
        );
        this.particleData[idx].life = 1;
        this.particleData[idx].active = true;
        this.particleData[idx].isSoot = isSoot;
        this.particleData[idx].normalizedRadius = normalizedR;
        this.particleData[idx].angle = angle;
        
        // Color based on exhaust mode - center is hotter (brighter)
        if (isSoot && mode.sootColor) {
            colors[idx * 3] = mode.sootColor[0];
            colors[idx * 3 + 1] = mode.sootColor[1];
            colors[idx * 3 + 2] = mode.sootColor[2];
            sizes[idx] = 0.1 + Math.random() * 0.15;
        } else {
            // Center particles use core color, edge particles use outer color
            let color;
            if (normalizedR < 0.3) {
                color = mode.coreColor;
            } else if (normalizedR < 0.6) {
                color = mode.midColor;
            } else {
                color = mode.outerColor;
            }
            colors[idx * 3] = color[0];
            colors[idx * 3 + 1] = color[1];
            colors[idx * 3 + 2] = color[2];
            sizes[idx] = mode.particleSize * (0.8 + Math.random() * 0.4);
        }
    }
    
    // Get plume radius at a given Y position below nozzle exit
    getPlumeRadius(y) {
        const nozzleExitY = this.nozzleExitY || -1.65;
        const nozzleExitRadius = this.nozzleExitRadius || 0.70;
        
        if (y > nozzleExitY) {
            return nozzleExitRadius;
        }
        
        // Plume expands slightly after exit
        const distance = nozzleExitY - y;
        const expansionRate = 0.12; // How fast plume expands
        return nozzleExitRadius + distance * expansionRate;
    }
    
    setupShockDiamonds() {
        // Shock diamonds disabled - they looked like distracting white disks
        // Could be reimplemented with better visuals (e.g., brightness variations in particle colors)
        this.shockDiamonds = [];
        this.shockGroup = new THREE.Group();
        // Not adding to scene - keeping method for potential future use
    }
    
    setupModeSelectors() {
        // Engine model selector
        const engineSelector = document.getElementById('engine-model');
        const engineDesc = document.getElementById('engine-desc');
        
        engineSelector.addEventListener('change', (e) => {
            this.engineModel = e.target.value;
            const model = this.engineModels[this.engineModel];
            engineDesc.textContent = model.desc;
            
            // Rebuild engine with new model
            this.buildEngine(this.engineModel);
            
            // Auto-switch exhaust mode to match propellant if defined
            if (model.propellant) {
                const exhaustSelector = document.getElementById('exhaust-mode');
                exhaustSelector.value = model.propellant;
                this.exhaustMode = model.propellant;
                document.getElementById('exhaust-desc').textContent = 
                    this.exhaustModes[model.propellant].desc;
                
                // Update flame light color
                const exhaustMode = this.exhaustModes[model.propellant];
                const avgColor = [
                    (exhaustMode.coreColor[0] + exhaustMode.midColor[0]) / 2,
                    (exhaustMode.coreColor[1] + exhaustMode.midColor[1]) / 2,
                    (exhaustMode.coreColor[2] + exhaustMode.midColor[2]) / 2
                ];
                this.flameLight.color.setRGB(avgColor[0], avgColor[1], avgColor[2]);
            }
        });
        
        // Exhaust visualization selector
        const exhaustSelector = document.getElementById('exhaust-mode');
        const exhaustDesc = document.getElementById('exhaust-desc');
        
        exhaustSelector.addEventListener('change', (e) => {
            this.exhaustMode = e.target.value;
            exhaustDesc.textContent = this.exhaustModes[this.exhaustMode].desc;
            
            // Update flame light color based on mode
            const mode = this.exhaustModes[this.exhaustMode];
            const avgColor = [
                (mode.coreColor[0] + mode.midColor[0]) / 2,
                (mode.coreColor[1] + mode.midColor[1]) / 2,
                (mode.coreColor[2] + mode.midColor[2]) / 2
            ];
            this.flameLight.color.setRGB(avgColor[0], avgColor[1], avgColor[2]);
        });
    }
    
    updateParticles(deltaTime) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const sizes = this.particleSystem.geometry.attributes.size.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        const mode = this.exhaustModes[this.exhaustMode];
        
        for (let i = 0; i < this.maxParticles; i++) {
            if (!this.particleData[i].active) continue;
            
            const p = this.particleData[i];
            p.life -= deltaTime * 0.6; // Slower decay for longer plume
            
            if (p.life <= 0) {
                p.active = false;
                positions[i * 3 + 1] = -10;
                sizes[i] = 0;
                continue;
            }
            
            // Simple physics - particles flow down and expand outward slightly
            const expandRate = 1 + (mode.spread * 0.012);
            p.velocity.x *= expandRate;
            p.velocity.z *= expandRate;
            
            // Update position
            positions[i * 3] += p.velocity.x * deltaTime;
            positions[i * 3 + 1] += p.velocity.y * deltaTime;
            positions[i * 3 + 2] += p.velocity.z * deltaTime;
            
            // Size - larger particles that fade over lifetime
            const baseSize = p.isSoot ? 0.15 : mode.particleSize * 1.5;
            const lifeFactor = p.life > 0.85 ? 0.7 : Math.min(1.0, p.life * 1.2);
            sizes[i] = baseSize * lifeFactor;
            
            // Fade color as particle ages (soot stays dark)
            if (!p.isSoot && p.life < 0.4) {
                colors[i * 3 + 1] *= 0.97;
                colors[i * 3 + 2] *= 0.94;
            }
        }
        
        // Update particle opacity for modes like LH2 that are nearly invisible
        this.particleSystem.material.opacity = mode.opacity || 1.0;
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.size.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true;
    }
    
    setupControls() {
        document.getElementById('fire-btn').addEventListener('click', () => this.startTest());
        document.getElementById('abort-btn').addEventListener('click', () => this.abortTest());
    }
    
    startTest() {
        if (this.state !== 'idle') return;
        
        this.state = 'countdown';
        this.countdownValue = 3;
        
        document.getElementById('fire-btn').disabled = true;
        document.getElementById('abort-btn').disabled = false;
        document.getElementById('status').textContent = 'COUNTDOWN';
        document.getElementById('status').className = 'status-indicator';
        
        this.runCountdown();
    }
    
    runCountdown() {
        if (this.state !== 'countdown') return;
        
        document.getElementById('countdown').textContent = `${this.countdownValue}...`;
        
        if (this.countdownValue > 0) {
            this.countdownValue--;
            setTimeout(() => this.runCountdown(), 1000);
        } else {
            document.getElementById('countdown').textContent = 'IGNITION!';
            this.startFiring();
        }
    }
    
    startFiring() {
        this.state = 'firing';
        this.firingTime = 0;
        
        document.getElementById('status').textContent = 'ENGINE FIRING';
        document.getElementById('status').className = 'status-indicator running';
        
        this.currentThrust = 0;
        this.currentIsp = 0;
        this.currentPressure = 0;
        
        this.fuelRemaining = this.fuelCapacity;
        this.oxidizerRemaining = this.oxidizerCapacity;
        this.updatePropellantUI();
        
        this.thrustData = [];
        this.pressureData = [];
        this.tempData = [];
    }
    
    abortTest() {
        this.state = 'shutdown';
        document.getElementById('countdown').textContent = 'ABORTED';
        document.getElementById('status').textContent = 'TEST ABORTED';
        document.getElementById('status').className = 'status-indicator';
        
        setTimeout(() => this.resetTest(), 2000);
    }
    
    completeTest() {
        this.state = 'shutdown';
        document.getElementById('countdown').textContent = 'TEST COMPLETE';
        document.getElementById('status').textContent = 'TEST COMPLETE';
        
        if (this.currentThrust >= this.targetThrust) {
            document.getElementById('goal-thrust').classList.add('success');
            document.getElementById('thrust-check').style.display = 'inline';
        }
        
        setTimeout(() => this.resetTest(), 3000);
    }
    
    resetTest() {
        this.state = 'idle';
        document.getElementById('fire-btn').disabled = false;
        document.getElementById('abort-btn').disabled = true;
        document.getElementById('countdown').textContent = 'Ready';
        document.getElementById('status').textContent = 'STANDBY';
        document.getElementById('status').className = 'status-indicator';
        
        this.fuelRemaining = this.fuelCapacity;
        this.oxidizerRemaining = this.oxidizerCapacity;
        this.updatePropellantUI();
    }
    
    animate() {
        requestAnimationFrame(this.animate);
        
        const deltaTime = this.clock.getDelta();
        
        this.update(deltaTime);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    update(deltaTime) {
        if (this.state === 'firing') {
            this.firingTime += deltaTime * 1000;
            
            const rampUpTime = 1500;
            const progress = Math.min(this.firingTime / rampUpTime, 1);
            const easedProgress = this.easeOutCubic(progress);
            
            // Consume propellant
            this.fuelRemaining -= this.fuelFlowRate * easedProgress * deltaTime;
            this.oxidizerRemaining -= this.oxidizerFlowRate * easedProgress * deltaTime;
            this.fuelRemaining = Math.max(0, this.fuelRemaining);
            this.oxidizerRemaining = Math.max(0, this.oxidizerRemaining);
            this.updatePropellantUI();
            
            if (this.fuelRemaining <= 0 || this.oxidizerRemaining <= 0) {
                document.getElementById('countdown').textContent = 'PROPELLANT DEPLETED';
                this.completeTest();
                return;
            }
            
            const fluctuation = 1 + (Math.sin(this.firingTime * 0.01) * 0.02 + Math.random() * 0.02);
            
            this.currentThrust = Math.round(this.targetThrust * easedProgress * fluctuation);
            this.currentIsp = Math.round(this.targetIsp * easedProgress * fluctuation);
            this.currentPressure = Math.round(this.targetPressure * easedProgress * fluctuation * 10) / 10;
            
            document.getElementById('current-thrust').textContent = `${this.currentThrust} kN`;
            document.getElementById('current-isp').textContent = `${this.currentIsp} s`;
            document.getElementById('current-pressure').textContent = `${this.currentPressure} MPa`;
            
            document.getElementById('current-thrust').className = 
                this.currentThrust >= this.targetThrust ? 'stat-value success' : 'stat-value warning';
            document.getElementById('current-isp').className = 
                this.currentIsp >= this.targetIsp ? 'stat-value success' : 'stat-value warning';
            document.getElementById('current-pressure').className = 
                this.currentPressure >= this.targetPressure ? 'stat-value success' : 'stat-value warning';
            
            if (this.thrustData.length < this.maxDataPoints) {
                this.thrustData.push(easedProgress);
                this.pressureData.push(easedProgress * (0.95 + Math.random() * 0.1));
                this.tempData.push(Math.min(1, easedProgress * 1.2) * (0.9 + Math.random() * 0.1));
            }
            
            this.flameIntensity = easedProgress;
            
            // Emit particles based on current exhaust mode
            const mode = this.exhaustModes[this.exhaustMode];
            const particlesToEmit = Math.floor(easedProgress * mode.particleCount);
            for (let i = 0; i < particlesToEmit; i++) {
                this.emitParticle(false);
            }
            
            // Emit soot particles for RP-1
            if (mode.hasSoot && Math.random() < 0.3) {
                this.emitParticle(true);
            }
            
            if (this.firingTime >= this.maxFiringTime) {
                this.completeTest();
            }
        } else if (this.state === 'shutdown') {
            this.flameIntensity *= 0.92;
            this.currentThrust = Math.round(this.currentThrust * 0.95);
            this.currentPressure = Math.round(this.currentPressure * 0.95 * 10) / 10;
            
            document.getElementById('current-thrust').textContent = `${this.currentThrust} kN`;
            document.getElementById('current-pressure').textContent = `${this.currentPressure} MPa`;
        } else {
            this.flameIntensity *= 0.92;
        }
        
        // Update engine glow based on mode
        const mode = this.exhaustModes[this.exhaustMode];
        const glowMult = mode.glowIntensity || 1.0;
        
        if (this.nozzleInner) {
            this.nozzleInner.material.opacity = this.flameIntensity * 0.6 * glowMult;
            // Update glow color based on mode
            const midColor = mode.midColor;
            this.nozzleInner.material.color.setRGB(midColor[0], midColor[1], midColor[2]);
        }
        if (this.chamberInner) {
            this.chamberInner.material.opacity = this.flameIntensity * 0.4 * glowMult;
        }
        if (this.flameLight) {
            this.flameLight.intensity = this.flameIntensity * 3 * glowMult;
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update graphs
        this.updateGraphs();
    }
    
    updateShockDiamonds() {
        // Disabled - shock diamonds removed
    }
    
    updatePropellantUI() {
        const fuelPercent = (this.fuelRemaining / this.fuelCapacity) * 100;
        const oxidizerPercent = (this.oxidizerRemaining / this.oxidizerCapacity) * 100;
        
        document.getElementById('fuel-fill').style.height = `${fuelPercent}%`;
        document.getElementById('oxidizer-fill').style.height = `${oxidizerPercent}%`;
        
        document.getElementById('fuel-level').textContent = `${Math.round(fuelPercent)}%`;
        document.getElementById('oxidizer-level').textContent = `${Math.round(oxidizerPercent)}%`;
        
        document.getElementById('fuel-amount').textContent = `${Math.round(this.fuelRemaining)} kg`;
        document.getElementById('oxidizer-amount').textContent = `${Math.round(this.oxidizerRemaining)} kg`;
        
        const fuelFill = document.getElementById('fuel-fill');
        const oxidizerFill = document.getElementById('oxidizer-fill');
        
        if (fuelPercent < 20) {
            fuelFill.classList.add('low');
        } else {
            fuelFill.classList.remove('low');
        }
        
        if (oxidizerPercent < 20) {
            oxidizerFill.classList.add('low');
        } else {
            oxidizerFill.classList.remove('low');
        }
    }
    
    updateGraphs() {
        this.drawGraph('thrust-graph', this.thrustData, '#ffa500');
        this.drawGraph('pressure-graph', this.pressureData, '#ffc107');
        this.drawGraph('temp-graph', this.tempData, '#ff6b6b');
    }
    
    drawGraph(canvasId, data, color) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        ctx.fillStyle = 'rgba(10, 30, 50, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        for (let i = 0; i <= 5; i++) {
            const x = (width / 5) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        if (data.length > 1) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < data.length; i++) {
                const x = (i / this.maxDataPoints) * width;
                const y = height - (data[i] * (height - 20)) - 10;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 5);
        ctx.lineTo(30, height - 5);
        ctx.lineTo(width - 5, height - 5);
        ctx.stroke();
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RocketEngineSimulator3D();
});
