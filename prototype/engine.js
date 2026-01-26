// Rocket Engine Test Fire Prototype
// Canvas-based rendering with particle effects

class RocketEngineSimulator {
    constructor() {
        this.canvas = document.getElementById('engine-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 650;
        
        // State
        this.state = 'idle'; // idle, countdown, firing, shutdown
        this.countdownValue = 3;
        this.firingTime = 0;
        this.maxFiringTime = 8000; // 8 seconds
        
        // Current readings (animated)
        this.currentThrust = 0;
        this.currentIsp = 0;
        this.currentPressure = 0;
        
        // Target values
        this.targetThrust = 102;
        this.targetIsp = 290;
        this.targetPressure = 25;
        
        // Propellant system (RP-1/LOX with O/F ratio of 2.5:1)
        this.fuelCapacity = 850;      // kg of RP-1
        this.oxidizerCapacity = 2125; // kg of LOX (2.5x fuel for O/F ratio)
        this.fuelRemaining = this.fuelCapacity;
        this.oxidizerRemaining = this.oxidizerCapacity;
        this.fuelFlowRate = 35;       // kg/s at full thrust
        this.oxidizerFlowRate = 87.5; // kg/s at full thrust (2.5x fuel rate)
        
        // Graph data
        this.thrustData = [];
        this.pressureData = [];
        this.tempData = [];
        this.maxDataPoints = 100;
        
        // Particles - with limits to prevent performance issues
        this.particles = [];
        this.smokeParticles = [];
        this.maxParticles = 150;
        this.maxSmokeParticles = 50;
        
        // Animation
        this.lastTime = 0;
        this.flameIntensity = 0;
        
        // Engine glow
        this.engineGlow = 0;
        
        // Bind methods
        this.animate = this.animate.bind(this);
        
        // Setup controls
        this.setupControls();
        
        // Start animation loop
        requestAnimationFrame(this.animate);
    }
    
    setupControls() {
        const fireBtn = document.getElementById('fire-btn');
        const abortBtn = document.getElementById('abort-btn');
        
        fireBtn.addEventListener('click', () => this.startTest());
        abortBtn.addEventListener('click', () => this.abortTest());
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
        
        // Reset readings
        this.currentThrust = 0;
        this.currentIsp = 0;
        this.currentPressure = 0;
        
        // Reset propellant
        this.fuelRemaining = this.fuelCapacity;
        this.oxidizerRemaining = this.oxidizerCapacity;
        this.updatePropellantUI();
        
        // Clear graph data
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
        
        // Show success indicators
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
        
        // Reset propellant display
        this.fuelRemaining = this.fuelCapacity;
        this.oxidizerRemaining = this.oxidizerCapacity;
        this.updatePropellantUI();
    }
    
    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update simulation
        this.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue loop
        requestAnimationFrame(this.animate);
    }
    
    update(deltaTime) {
        if (this.state === 'firing') {
            this.firingTime += deltaTime;
            
            // Ramp up values
            const rampUpTime = 1500;
            const progress = Math.min(this.firingTime / rampUpTime, 1);
            const easedProgress = this.easeOutCubic(progress);
            
            // Consume propellant (deltaTime is in ms, flow rates are kg/s)
            const dtSeconds = deltaTime / 1000;
            this.fuelRemaining -= this.fuelFlowRate * easedProgress * dtSeconds;
            this.oxidizerRemaining -= this.oxidizerFlowRate * easedProgress * dtSeconds;
            
            // Clamp to zero
            this.fuelRemaining = Math.max(0, this.fuelRemaining);
            this.oxidizerRemaining = Math.max(0, this.oxidizerRemaining);
            
            // Update propellant UI
            this.updatePropellantUI();
            
            // Check if propellant depleted - engine cuts off
            if (this.fuelRemaining <= 0 || this.oxidizerRemaining <= 0) {
                document.getElementById('countdown').textContent = 'PROPELLANT DEPLETED';
                this.completeTest();
                return;
            }
            
            // Add some realistic fluctuation
            const fluctuation = 1 + (Math.sin(this.firingTime * 0.01) * 0.02 + Math.random() * 0.02);
            
            this.currentThrust = Math.round(this.targetThrust * easedProgress * fluctuation);
            this.currentIsp = Math.round(this.targetIsp * easedProgress * fluctuation);
            this.currentPressure = Math.round(this.targetPressure * easedProgress * fluctuation * 10) / 10;
            
            // Update UI
            document.getElementById('current-thrust').textContent = `${this.currentThrust} kN`;
            document.getElementById('current-isp').textContent = `${this.currentIsp} s`;
            document.getElementById('current-pressure').textContent = `${this.currentPressure} MPa`;
            
            // Update classes based on progress
            const thrustEl = document.getElementById('current-thrust');
            const ispEl = document.getElementById('current-isp');
            const pressureEl = document.getElementById('current-pressure');
            
            thrustEl.className = this.currentThrust >= this.targetThrust ? 'stat-value success' : 'stat-value warning';
            ispEl.className = this.currentIsp >= this.targetIsp ? 'stat-value success' : 'stat-value warning';
            pressureEl.className = this.currentPressure >= this.targetPressure ? 'stat-value success' : 'stat-value warning';
            
            // Record graph data
            if (this.thrustData.length < this.maxDataPoints) {
                this.thrustData.push(easedProgress);
                this.pressureData.push(easedProgress * (0.95 + Math.random() * 0.1));
                this.tempData.push(Math.min(1, easedProgress * 1.2) * (0.9 + Math.random() * 0.1));
            }
            
            // Flame intensity
            this.flameIntensity = easedProgress;
            this.engineGlow = easedProgress;
            
            // Generate particles
            this.generateParticles(easedProgress);
            
            // Check for completion
            if (this.firingTime >= this.maxFiringTime) {
                this.completeTest();
            }
        } else if (this.state === 'shutdown') {
            // Ramp down
            this.flameIntensity *= 0.95;
            this.engineGlow *= 0.95;
            
            // Fade out readings
            this.currentThrust = Math.round(this.currentThrust * 0.98);
            this.currentPressure = Math.round(this.currentPressure * 0.98 * 10) / 10;
            
            document.getElementById('current-thrust').textContent = `${this.currentThrust} kN`;
            document.getElementById('current-pressure').textContent = `${this.currentPressure} MPa`;
        } else {
            this.flameIntensity *= 0.95;
            this.engineGlow *= 0.95;
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update graphs
        this.updateGraphs();
    }
    
    generateParticles(intensity) {
        const nozzleX = this.canvas.width / 2;
        const nozzleY = 320;
        
        // Fire particles - limit spawn rate and cap total
        if (this.particles.length < this.maxParticles) {
            const fireCount = Math.min(Math.floor(intensity * 5), this.maxParticles - this.particles.length);
            for (let i = 0; i < fireCount; i++) {
                this.particles.push({
                    x: nozzleX + (Math.random() - 0.5) * 40 * intensity,
                    y: nozzleY,
                    vx: (Math.random() - 0.5) * 3,
                    vy: 5 + Math.random() * 8 * intensity,
                    life: 1,
                    decay: 0.04 + Math.random() * 0.03, // Faster decay
                    size: 5 + Math.random() * 15 * intensity,
                    type: 'fire',
                    color: Math.random() > 0.3 ? 'orange' : 'yellow'
                });
            }
        }
        
        // Smoke particles - spawn less frequently
        if (this.smokeParticles.length < this.maxSmokeParticles && Math.random() < 0.3) {
            const smokeCount = Math.min(Math.floor(intensity * 2), this.maxSmokeParticles - this.smokeParticles.length);
            for (let i = 0; i < smokeCount; i++) {
                this.smokeParticles.push({
                    x: nozzleX + (Math.random() - 0.5) * 80,
                    y: 450 + Math.random() * 50,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 2,
                    life: 1,
                    decay: 0.02 + Math.random() * 0.01, // Faster decay
                    size: 20 + Math.random() * 40,
                    type: 'smoke'
                });
            }
        }
        
        // Sparks/hot particles - occasional
        if (this.particles.length < this.maxParticles && Math.random() < intensity * 0.15) {
            this.particles.push({
                x: nozzleX + (Math.random() - 0.5) * 30,
                y: nozzleY + Math.random() * 50,
                vx: (Math.random() - 0.5) * 8,
                vy: 3 + Math.random() * 5,
                life: 1,
                decay: 0.08 + Math.random() * 0.04, // Fast decay for sparks
                size: 2 + Math.random() * 3,
                type: 'spark'
            });
        }
    }
    
    updateParticles(deltaTime) {
        // Update fire particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.size *= 0.98;
            
            // Spread out as particles move down
            if (p.type === 'fire') {
                p.vx += (Math.random() - 0.5) * 0.5;
            }
            
            if (p.life <= 0 || p.y > this.canvas.height) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update smoke particles
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.size *= 1.01;
            p.vx *= 0.99;
            
            if (p.life <= 0) {
                this.smokeParticles.splice(i, 1);
            }
        }
    }
    
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw smoke (behind engine)
        this.drawSmoke();
        
        // Draw engine glow
        if (this.engineGlow > 0.1) {
            this.drawEngineGlow();
        }
        
        // Draw the rocket engine
        this.drawEngine();
        
        // Draw fire particles
        this.drawFireParticles();
    }
    
    drawEngine() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        
        // Colors
        const metalLight = '#c8d4e0';
        const metalMid = '#8a9fb5';
        const metalDark = '#5a7088';
        const metalShadow = '#3a4a58';
        
        ctx.save();
        
        // === TURBOPUMP ASSEMBLY (top) ===
        // Main turbopump body
        ctx.fillStyle = metalMid;
        ctx.beginPath();
        ctx.ellipse(centerX, 60, 35, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = metalDark;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Turbopump cylinder
        ctx.fillStyle = metalLight;
        ctx.fillRect(centerX - 25, 55, 50, 40);
        ctx.strokeStyle = metalDark;
        ctx.strokeRect(centerX - 25, 55, 50, 40);
        
        // Turbopump details (bands)
        ctx.fillStyle = metalDark;
        ctx.fillRect(centerX - 28, 65, 56, 4);
        ctx.fillRect(centerX - 28, 80, 56, 4);
        
        // === PROPELLANT LINES ===
        // Left line (fuel - reddish tint)
        ctx.strokeStyle = metalMid;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(centerX - 30, 70);
        ctx.lineTo(centerX - 60, 70);
        ctx.lineTo(centerX - 60, 130);
        ctx.lineTo(centerX - 40, 150);
        ctx.stroke();
        
        // Right line (oxidizer - bluish tint)
        ctx.beginPath();
        ctx.moveTo(centerX + 30, 70);
        ctx.lineTo(centerX + 60, 70);
        ctx.lineTo(centerX + 60, 130);
        ctx.lineTo(centerX + 40, 150);
        ctx.stroke();
        
        // Line connectors
        ctx.fillStyle = metalDark;
        ctx.beginPath();
        ctx.arc(centerX - 60, 70, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 60, 70, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Valves on lines
        ctx.fillStyle = metalLight;
        ctx.fillRect(centerX - 68, 95, 16, 20);
        ctx.fillRect(centerX + 52, 95, 16, 20);
        ctx.strokeStyle = metalDark;
        ctx.strokeRect(centerX - 68, 95, 16, 20);
        ctx.strokeRect(centerX + 52, 95, 16, 20);
        
        // === INJECTOR PLATE ===
        ctx.fillStyle = metalMid;
        ctx.beginPath();
        ctx.ellipse(centerX, 115, 45, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = metalDark;
        ctx.stroke();
        
        // Injector holes pattern
        ctx.fillStyle = metalShadow;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * 25;
            const y = 115 + Math.sin(angle) * 6;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // === COMBUSTION CHAMBER ===
        // Main chamber body
        const gradient = ctx.createLinearGradient(centerX - 50, 0, centerX + 50, 0);
        gradient.addColorStop(0, metalShadow);
        gradient.addColorStop(0.3, metalLight);
        gradient.addColorStop(0.5, metalMid);
        gradient.addColorStop(0.7, metalLight);
        gradient.addColorStop(1, metalShadow);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX - 45, 120);
        ctx.lineTo(centerX - 50, 200);
        ctx.lineTo(centerX + 50, 200);
        ctx.lineTo(centerX + 45, 120);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = metalDark;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Chamber bands (cooling channels visual)
        ctx.strokeStyle = metalDark;
        ctx.lineWidth = 1;
        for (let y = 130; y < 195; y += 12) {
            ctx.beginPath();
            ctx.moveTo(centerX - 48, y);
            ctx.lineTo(centerX + 48, y);
            ctx.stroke();
        }
        
        // Glow inside chamber when firing
        if (this.flameIntensity > 0.1) {
            const glowGradient = ctx.createRadialGradient(centerX, 160, 0, centerX, 160, 40);
            glowGradient.addColorStop(0, `rgba(255, 200, 100, ${this.flameIntensity * 0.5})`);
            glowGradient.addColorStop(0.5, `rgba(255, 100, 50, ${this.flameIntensity * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(centerX - 45, 120, 90, 80);
        }
        
        // === THROAT ===
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(centerX - 50, 200);
        ctx.quadraticCurveTo(centerX - 50, 220, centerX - 25, 230);
        ctx.lineTo(centerX + 25, 230);
        ctx.quadraticCurveTo(centerX + 50, 220, centerX + 50, 200);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // === NOZZLE ===
        const nozzleGradient = ctx.createLinearGradient(centerX - 80, 0, centerX + 80, 0);
        nozzleGradient.addColorStop(0, metalShadow);
        nozzleGradient.addColorStop(0.2, metalMid);
        nozzleGradient.addColorStop(0.4, metalLight);
        nozzleGradient.addColorStop(0.6, metalMid);
        nozzleGradient.addColorStop(0.8, metalLight);
        nozzleGradient.addColorStop(1, metalShadow);
        
        ctx.fillStyle = nozzleGradient;
        ctx.beginPath();
        ctx.moveTo(centerX - 25, 230);
        ctx.bezierCurveTo(
            centerX - 30, 260,
            centerX - 70, 300,
            centerX - 75, 320
        );
        ctx.lineTo(centerX + 75, 320);
        ctx.bezierCurveTo(
            centerX + 70, 300,
            centerX + 30, 260,
            centerX + 25, 230
        );
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = metalDark;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Nozzle interior glow when firing
        if (this.flameIntensity > 0.1) {
            const nozzleGlow = ctx.createRadialGradient(centerX, 280, 0, centerX, 280, 60);
            nozzleGlow.addColorStop(0, `rgba(255, 220, 150, ${this.flameIntensity * 0.6})`);
            nozzleGlow.addColorStop(0.4, `rgba(255, 150, 50, ${this.flameIntensity * 0.4})`);
            nozzleGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = nozzleGlow;
            ctx.beginPath();
            ctx.moveTo(centerX - 25, 230);
            ctx.bezierCurveTo(
                centerX - 30, 260,
                centerX - 65, 295,
                centerX - 70, 315
            );
            ctx.lineTo(centerX + 70, 315);
            ctx.bezierCurveTo(
                centerX + 65, 295,
                centerX + 30, 260,
                centerX + 25, 230
            );
            ctx.closePath();
            ctx.fill();
        }
        
        // Nozzle bands
        ctx.strokeStyle = metalDark;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const t = i / 4;
            const y = 240 + t * 75;
            const width = 30 + t * 45;
            ctx.beginPath();
            ctx.moveTo(centerX - width, y);
            ctx.lineTo(centerX + width, y);
            ctx.stroke();
        }
        
        // Nozzle exit rim
        ctx.strokeStyle = metalDark;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 75, 320);
        ctx.lineTo(centerX + 75, 320);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawEngineGlow() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        
        // Outer glow around nozzle exit
        const glow = ctx.createRadialGradient(centerX, 330, 0, centerX, 350, 150);
        glow.addColorStop(0, `rgba(255, 200, 100, ${this.engineGlow * 0.3})`);
        glow.addColorStop(0.3, `rgba(255, 150, 50, ${this.engineGlow * 0.2})`);
        glow.addColorStop(0.6, `rgba(255, 100, 0, ${this.engineGlow * 0.1})`);
        glow.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        ctx.fillStyle = glow;
        ctx.fillRect(0, 280, this.canvas.width, 270);
    }
    
    drawFireParticles() {
        const ctx = this.ctx;
        
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.life;
            
            if (p.type === 'fire') {
                // Create gradient for fire particle
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                if (p.color === 'yellow') {
                    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
                    gradient.addColorStop(0.3, 'rgba(255, 220, 100, 0.8)');
                    gradient.addColorStop(0.6, 'rgba(255, 150, 50, 0.5)');
                    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                } else {
                    gradient.addColorStop(0, 'rgba(255, 220, 150, 1)');
                    gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.8)');
                    gradient.addColorStop(0.6, 'rgba(255, 80, 0, 0.5)');
                    gradient.addColorStop(1, 'rgba(200, 30, 0, 0)');
                }
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'spark') {
                ctx.fillStyle = `rgba(255, 255, 200, ${p.life})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    drawSmoke() {
        const ctx = this.ctx;
        
        for (const p of this.smokeParticles) {
            ctx.save();
            ctx.globalAlpha = p.life * 0.4;
            
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gradient.addColorStop(0, 'rgba(200, 210, 220, 0.6)');
            gradient.addColorStop(0.5, 'rgba(180, 190, 200, 0.3)');
            gradient.addColorStop(1, 'rgba(150, 160, 170, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
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
        
        // Clear
        ctx.clearRect(0, 0, width, height);
        
        // Background
        ctx.fillStyle = 'rgba(10, 30, 50, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        // Grid
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
        
        // Draw data line
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
            
            // Glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 5;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Axes
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
    
    updatePropellantUI() {
        const fuelPercent = (this.fuelRemaining / this.fuelCapacity) * 100;
        const oxidizerPercent = (this.oxidizerRemaining / this.oxidizerCapacity) * 100;
        
        // Update fill heights
        document.getElementById('fuel-fill').style.height = `${fuelPercent}%`;
        document.getElementById('oxidizer-fill').style.height = `${oxidizerPercent}%`;
        
        // Update level text
        document.getElementById('fuel-level').textContent = `${Math.round(fuelPercent)}%`;
        document.getElementById('oxidizer-level').textContent = `${Math.round(oxidizerPercent)}%`;
        
        // Update amount text
        document.getElementById('fuel-amount').textContent = `${Math.round(this.fuelRemaining)} kg`;
        document.getElementById('oxidizer-amount').textContent = `${Math.round(this.oxidizerRemaining)} kg`;
        
        // Add warning class when low
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RocketEngineSimulator();
});
