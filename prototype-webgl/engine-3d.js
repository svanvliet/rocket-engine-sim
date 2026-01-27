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
        
        // Particle system
        this.particles = [];
        this.particleSystem = null;
        this.maxParticles = 500;
        
        // Engine parts for glow effect
        this.nozzleInner = null;
        this.chamberInner = null;
        this.flameLight = null;
        
        // Build scene
        this.setupLights();
        this.buildEngine();
        this.setupParticleSystem();
        this.setupControls();
        
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
    
    buildEngine() {
        const engineGroup = new THREE.Group();
        
        // Materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x8899aa,
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
        
        // === TURBOPUMP (top) ===
        const turbopumpBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.3, 32),
            metalMaterial
        );
        turbopumpBody.position.y = 1.4;
        engineGroup.add(turbopumpBody);
        
        // Turbopump cap
        const turbopumpCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            darkMetalMaterial
        );
        turbopumpCap.position.y = 1.55;
        engineGroup.add(turbopumpCap);
        
        // Turbopump bands
        for (let i = 0; i < 2; i++) {
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(0.26, 0.02, 8, 32),
                darkMetalMaterial
            );
            band.rotation.x = Math.PI / 2;
            band.position.y = 1.32 + i * 0.15;
            engineGroup.add(band);
        }
        
        // === PROPELLANT LINES ===
        const pipeRadius = 0.04;
        
        // Left pipe (fuel - slightly reddish tint)
        const fuelPipeMaterial = new THREE.MeshStandardMaterial({
            color: 0x998888,
            metalness: 0.7,
            roughness: 0.3
        });
        
        // Create curved pipe using TubeGeometry
        const leftPipePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.25, 1.35, 0),
            new THREE.Vector3(-0.5, 1.35, 0),
            new THREE.Vector3(-0.5, 0.9, 0),
            new THREE.Vector3(-0.35, 0.7, 0)
        ]);
        const leftPipe = new THREE.Mesh(
            new THREE.TubeGeometry(leftPipePath, 20, pipeRadius, 8, false),
            fuelPipeMaterial
        );
        engineGroup.add(leftPipe);
        
        // Right pipe (oxidizer - slightly bluish tint)
        const oxPipeMaterial = new THREE.MeshStandardMaterial({
            color: 0x8888aa,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const rightPipePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.25, 1.35, 0),
            new THREE.Vector3(0.5, 1.35, 0),
            new THREE.Vector3(0.5, 0.9, 0),
            new THREE.Vector3(0.35, 0.7, 0)
        ]);
        const rightPipe = new THREE.Mesh(
            new THREE.TubeGeometry(rightPipePath, 20, pipeRadius, 8, false),
            oxPipeMaterial
        );
        engineGroup.add(rightPipe);
        
        // Valves on pipes
        const valveGeom = new THREE.BoxGeometry(0.1, 0.12, 0.08);
        const leftValve = new THREE.Mesh(valveGeom, darkMetalMaterial);
        leftValve.position.set(-0.5, 1.1, 0);
        engineGroup.add(leftValve);
        
        const rightValve = new THREE.Mesh(valveGeom, darkMetalMaterial);
        rightValve.position.set(0.5, 1.1, 0);
        engineGroup.add(rightValve);
        
        // === INJECTOR PLATE ===
        const injector = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32),
            copperMaterial
        );
        injector.position.y = 0.6;
        engineGroup.add(injector);
        
        // Injector holes
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const hole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8),
                darkMetalMaterial
            );
            hole.position.set(
                Math.cos(angle) * 0.25,
                0.6,
                Math.sin(angle) * 0.25
            );
            engineGroup.add(hole);
        }
        
        // === COMBUSTION CHAMBER ===
        const chamberGeom = new THREE.CylinderGeometry(0.35, 0.4, 0.8, 32);
        const chamber = new THREE.Mesh(chamberGeom, metalMaterial);
        chamber.position.y = 0.15;
        engineGroup.add(chamber);
        
        // Chamber cooling bands
        for (let i = 0; i < 4; i++) {
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(0.36 + i * 0.01, 0.015, 8, 32),
                darkMetalMaterial
            );
            band.rotation.x = Math.PI / 2;
            band.position.y = 0.4 - i * 0.2;
            engineGroup.add(band);
        }
        
        // Chamber inner glow surface (for emission during firing)
        const chamberInnerGeom = new THREE.CylinderGeometry(0.32, 0.37, 0.75, 32);
        this.chamberInner = new THREE.Mesh(
            chamberInnerGeom,
            new THREE.MeshBasicMaterial({ 
                color: 0xff6600, 
                transparent: true, 
                opacity: 0 
            })
        );
        this.chamberInner.position.y = 0.15;
        engineGroup.add(this.chamberInner);
        
        // === THROAT ===
        const throatGeom = new THREE.CylinderGeometry(0.4, 0.2, 0.2, 32);
        const throat = new THREE.Mesh(throatGeom, metalMaterial);
        throat.position.y = -0.35;
        engineGroup.add(throat);
        
        // === NOZZLE (bell curve) ===
        // Create nozzle profile for lathe geometry
        const nozzlePoints = [];
        const nozzleSegments = 30;
        for (let i = 0; i <= nozzleSegments; i++) {
            const t = i / nozzleSegments;
            // Bell curve expansion
            const y = -0.45 - t * 1.2;
            const r = 0.2 + Math.pow(t, 0.7) * 0.55;
            nozzlePoints.push(new THREE.Vector2(r, y));
        }
        
        const nozzleGeom = new THREE.LatheGeometry(nozzlePoints, 48);
        const nozzle = new THREE.Mesh(nozzleGeom, metalMaterial);
        engineGroup.add(nozzle);
        
        // Nozzle inner surface (for glow)
        const nozzleInnerPoints = [];
        for (let i = 0; i <= nozzleSegments; i++) {
            const t = i / nozzleSegments;
            const y = -0.45 - t * 1.2;
            const r = 0.18 + Math.pow(t, 0.7) * 0.52;
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
        const rimGeom = new THREE.TorusGeometry(0.73, 0.025, 8, 48);
        const rim = new THREE.Mesh(rimGeom, darkMetalMaterial);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = -1.65;
        engineGroup.add(rim);
        
        // Nozzle bands
        for (let i = 0; i < 4; i++) {
            const t = i / 4;
            const y = -0.6 - t * 0.9;
            const r = 0.25 + Math.pow(t * 0.85, 0.7) * 0.55;
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(r, 0.012, 8, 48),
                darkMetalMaterial
            );
            band.rotation.x = Math.PI / 2;
            band.position.y = y;
            engineGroup.add(band);
        }
        
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
                active: false
            });
        }
        this.nextParticle = 0;
    }
    
    emitParticle() {
        const idx = this.nextParticle;
        this.nextParticle = (this.nextParticle + 1) % this.maxParticles;
        
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        const sizes = this.particleSystem.geometry.attributes.size.array;
        
        // Start at nozzle exit
        const spread = 0.3;
        positions[idx * 3] = (Math.random() - 0.5) * spread;
        positions[idx * 3 + 1] = -1.7;
        positions[idx * 3 + 2] = (Math.random() - 0.5) * spread;
        
        // Random velocity in cone shape
        const speed = 2 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        const spread2 = 0.3 + Math.random() * 0.2;
        
        this.particleData[idx].velocity.set(
            Math.cos(angle) * spread2,
            -speed,
            Math.sin(angle) * spread2
        );
        this.particleData[idx].life = 1;
        this.particleData[idx].active = true;
        
        // Color - mix of yellow, orange, and white core
        const colorChoice = Math.random();
        if (colorChoice < 0.2) {
            // White/yellow core
            colors[idx * 3] = 1;
            colors[idx * 3 + 1] = 1;
            colors[idx * 3 + 2] = 0.8;
        } else if (colorChoice < 0.6) {
            // Yellow
            colors[idx * 3] = 1;
            colors[idx * 3 + 1] = 0.8;
            colors[idx * 3 + 2] = 0.2;
        } else {
            // Orange
            colors[idx * 3] = 1;
            colors[idx * 3 + 1] = 0.4;
            colors[idx * 3 + 2] = 0.1;
        }
        
        sizes[idx] = 0.3 + Math.random() * 0.3;
    }
    
    updateParticles(deltaTime) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const sizes = this.particleSystem.geometry.attributes.size.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        
        for (let i = 0; i < this.maxParticles; i++) {
            if (!this.particleData[i].active) continue;
            
            const p = this.particleData[i];
            p.life -= deltaTime * 1.2;
            
            if (p.life <= 0) {
                p.active = false;
                positions[i * 3 + 1] = -10;
                sizes[i] = 0;
                continue;
            }
            
            // Update position
            positions[i * 3] += p.velocity.x * deltaTime;
            positions[i * 3 + 1] += p.velocity.y * deltaTime;
            positions[i * 3 + 2] += p.velocity.z * deltaTime;
            
            // Expand outward as it falls
            p.velocity.x *= 1.015;
            p.velocity.z *= 1.015;
            
            // Size grows then fades
            const lifeFactor = p.life > 0.7 ? (1 - p.life) * 3.33 + 0.5 : p.life * 1.43;
            sizes[i] = (0.3 + Math.random() * 0.2) * lifeFactor;
            
            // Fade color to red/dark as particle ages
            const fadePoint = 0.4;
            if (p.life < fadePoint) {
                const fade = p.life / fadePoint;
                colors[i * 3 + 1] *= 0.95; // Reduce green
                colors[i * 3 + 2] *= 0.9;  // Reduce blue
            }
        }
        
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
            
            // Emit particles
            const particlesToEmit = Math.floor(easedProgress * 15);
            for (let i = 0; i < particlesToEmit; i++) {
                this.emitParticle();
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
        
        // Update engine glow
        if (this.nozzleInner) {
            this.nozzleInner.material.opacity = this.flameIntensity * 0.6;
        }
        if (this.chamberInner) {
            this.chamberInner.material.opacity = this.flameIntensity * 0.4;
        }
        if (this.flameLight) {
            this.flameLight.intensity = this.flameIntensity * 3;
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update graphs
        this.updateGraphs();
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
