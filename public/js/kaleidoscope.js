export class Kaleidoscope {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = false;
        this.animationId = null;
        
        // Kaleidoscope settings
        this.segments = options.segments || 8;
        this.rotation = 0;
        this.rotationSpeed = 0.005;
        this.zoom = 1;
        this.zoomDirection = 1;
        this.zoomSpeed = 0.001;
        
        // Pattern settings
        this.patternType = 'geometric';
        this.shapes = [];
        this.particles = [];
        this.time = 0;
        
        // Color settings
        this.colorPreset = 'spectrum';
        this.hueOffset = 0;
        this.saturation = 80;
        this.brightness = 60;
        
        // Audio reactivity
        this.audioIntensity = 0;
        this.audioBass = 0;
        this.audioMid = 0;
        this.audioHigh = 0;
        
        this.resize();
        this.initShapes();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2;
        
        this.initShapes();
    }
    
    initShapes() {
        this.shapes = [];
        this.particles = [];
        
        // Create random shapes for geometric pattern
        for (let i = 0; i < 15; i++) {
            this.shapes.push({
                x: (Math.random() - 0.5) * this.radius,
                y: (Math.random() - 0.5) * this.radius,
                size: Math.random() * 40 + 10,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                type: Math.floor(Math.random() * 4),
                hueOffset: Math.random() * 60,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2
            });
        }
        
        // Create particles for particle pattern
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                distance: Math.random() * this.radius * 0.8,
                size: Math.random() * 8 + 2,
                speed: Math.random() * 0.02 + 0.01,
                hueOffset: Math.random() * 120,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    setSegments(count) {
        this.segments = Math.max(2, Math.min(24, count));
    }
    
    setPattern(type) {
        this.patternType = type;
    }
    
    setColorPreset(preset) {
        this.colorPreset = preset;
    }
    
    setAudioData(data) {
        this.audioIntensity = data.rms || 0;
        this.audioBass = data.bass || 0;
        this.audioMid = data.mid || 0;
        this.audioHigh = data.high || 0;
    }
    
    getColor(offset = 0, alpha = 1) {
        let h, s, l;
        
        const baseHue = this.hueOffset + offset + this.audioMid * 120;
        const audioSat = 60 + this.audioHigh * 40;
        const audioLight = 40 + this.audioBass * 30;
        
        switch (this.colorPreset) {
            case 'spectrum':
                h = baseHue % 360;
                s = audioSat;
                l = audioLight + 20;
                break;
            case 'fire':
                h = (baseHue * 0.2) % 60;
                s = 100;
                l = 40 + this.audioBass * 30;
                break;
            case 'ocean':
                h = 180 + (baseHue * 0.3) % 60;
                s = 70 + this.audioHigh * 30;
                l = 30 + this.audioBass * 30;
                break;
            case 'matrix':
                h = 120;
                s = 80 + this.audioHigh * 20;
                l = 30 + this.audioBass * 40;
                break;
            case 'neon':
                h = (270 + baseHue * 0.5) % 360;
                s = 100;
                l = 50 + this.audioHigh * 20;
                break;
            case 'aurora':
                h = (120 + baseHue * 0.4 + Math.sin(this.time * 0.5) * 60) % 360;
                s = 70 + this.audioMid * 30;
                l = 40 + this.audioBass * 30;
                break;
            case 'vapor':
                h = (280 + baseHue * 0.3 + Math.sin(this.time) * 40) % 360;
                s = 80;
                l = 50 + this.audioHigh * 20;
                break;
            default:
                h = baseHue % 360;
                s = 80;
                l = 50;
        }
        
        return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
    }
    
    drawSegment() {
        const angleStep = (Math.PI * 2) / this.segments;
        
        // Create clipping path for one segment
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, this.radius * 1.5, 0, angleStep);
        this.ctx.closePath();
        this.ctx.clip();
        
        // Draw pattern based on type
        switch (this.patternType) {
            case 'geometric':
                this.drawGeometric();
                break;
            case 'particles':
                this.drawParticles();
                break;
            case 'waves':
                this.drawWaves();
                break;
            case 'mandala':
                this.drawMandala();
                break;
            case 'flower':
                this.drawFlower();
                break;
        }
        
        this.ctx.restore();
    }
    
    drawGeometric() {
        const audioScale = 1 + this.audioBass * 0.5;
        
        for (let shape of this.shapes) {
            this.ctx.save();
            this.ctx.translate(shape.x, shape.y);
            this.ctx.rotate(shape.rotation);
            
            const size = shape.size * audioScale * (1 + this.audioHigh * 0.3);
            
            this.ctx.fillStyle = this.getColor(shape.hueOffset, 0.7);
            this.ctx.strokeStyle = this.getColor(shape.hueOffset + 30, 0.9);
            this.ctx.lineWidth = 2 + this.audioBass * 3;
            
            this.ctx.beginPath();
            switch (shape.type) {
                case 0: // Circle
                    this.ctx.arc(0, 0, size, 0, Math.PI * 2);
                    break;
                case 1: // Square
                    this.ctx.rect(-size/2, -size/2, size, size);
                    break;
                case 2: // Triangle
                    this.ctx.moveTo(0, -size);
                    this.ctx.lineTo(size * 0.866, size * 0.5);
                    this.ctx.lineTo(-size * 0.866, size * 0.5);
                    this.ctx.closePath();
                    break;
                case 3: // Star
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
                        const innerAngle = angle + Math.PI / 5;
                        this.ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
                        this.ctx.lineTo(Math.cos(innerAngle) * size * 0.4, Math.sin(innerAngle) * size * 0.4);
                    }
                    this.ctx.closePath();
                    break;
            }
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
            
            // Update shape
            shape.rotation += shape.rotationSpeed * (1 + this.audioMid);
            shape.x += shape.speedX * (1 + this.audioBass);
            shape.y += shape.speedY * (1 + this.audioBass);
            
            // Bounce off edges
            if (Math.abs(shape.x) > this.radius * 0.8) shape.speedX *= -1;
            if (Math.abs(shape.y) > this.radius * 0.8) shape.speedY *= -1;
        }
    }
    
    drawParticles() {
        for (let p of this.particles) {
            const audioRadius = p.distance * (1 + this.audioBass * 0.5);
            const x = Math.cos(p.angle) * audioRadius;
            const y = Math.sin(p.angle) * audioRadius;
            
            const pulse = Math.sin(this.time * 2 + p.pulsePhase) * 0.5 + 1;
            const size = p.size * pulse * (1 + this.audioHigh);
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            gradient.addColorStop(0, this.getColor(p.hueOffset, 1));
            gradient.addColorStop(0.5, this.getColor(p.hueOffset, 0.5));
            gradient.addColorStop(1, this.getColor(p.hueOffset, 0));
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Update particle
            p.angle += p.speed * (1 + this.audioMid * 2);
        }
    }
    
    drawWaves() {
        const waves = 5 + Math.floor(this.audioBass * 5);
        const audioAmp = 30 + this.audioBass * 50;
        
        for (let w = 0; w < waves; w++) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.getColor(w * 30, 0.6);
            this.ctx.lineWidth = 3 + this.audioHigh * 3;
            
            const waveOffset = w * 30 + this.time * 50;
            
            for (let i = 0; i <= 100; i++) {
                const t = i / 100;
                const x = t * this.radius;
                const y = Math.sin(t * Math.PI * 4 + this.time * 2 + w) * audioAmp * 
                         Math.sin(t * Math.PI) * (1 + this.audioMid);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y + waveOffset);
                } else {
                    this.ctx.lineTo(x, y + waveOffset);
                }
            }
            this.ctx.stroke();
        }
    }
    
    drawMandala() {
        const rings = 6 + Math.floor(this.audioBass * 4);
        const audioScale = 1 + this.audioBass * 0.3;
        
        for (let r = rings; r > 0; r--) {
            const radius = (r / rings) * this.radius * 0.9 * audioScale;
            const points = 6 + r * 2;
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.getColor(r * 20, 0.8);
            this.ctx.fillStyle = this.getColor(r * 20 + 60, 0.2);
            this.ctx.lineWidth = 2 + this.audioHigh * 2;
            
            for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2 + this.time * 0.5 * (r % 2 ? 1 : -1);
                const wobble = Math.sin(angle * 3 + this.time) * 10 * this.audioMid;
                const x = Math.cos(angle) * (radius + wobble);
                const y = Math.sin(angle) * (radius + wobble);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    drawFlower() {
        const petals = 6 + Math.floor(this.audioMid * 6);
        const layers = 4 + Math.floor(this.audioBass * 3);
        
        for (let l = layers; l > 0; l--) {
            const layerRadius = (l / layers) * this.radius * 0.8;
            
            for (let p = 0; p < petals; p++) {
                const angle = (p / petals) * Math.PI * 2 + this.time * (l % 2 ? 0.3 : -0.3);
                
                this.ctx.save();
                this.ctx.rotate(angle);
                
                const petalLength = layerRadius * (0.8 + this.audioBass * 0.4);
                const petalWidth = layerRadius * 0.3 * (1 + this.audioHigh * 0.5);
                
                const gradient = this.ctx.createRadialGradient(
                    petalLength * 0.5, 0, 0,
                    petalLength * 0.5, 0, petalLength
                );
                gradient.addColorStop(0, this.getColor(l * 30 + p * 10, 0.9));
                gradient.addColorStop(1, this.getColor(l * 30 + p * 10 + 60, 0.3));
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.ellipse(petalLength * 0.5, 0, petalLength * 0.5, petalWidth, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            }
        }
        
        // Center
        const centerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
        centerGradient.addColorStop(0, this.getColor(0, 1));
        centerGradient.addColorStop(1, this.getColor(60, 0.5));
        this.ctx.fillStyle = centerGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20 + this.audioBass * 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    render() {
        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.rotation);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Draw all segments with mirroring
        for (let i = 0; i < this.segments; i++) {
            this.ctx.save();
            this.ctx.rotate((Math.PI * 2 / this.segments) * i);
            
            // Draw segment
            this.drawSegment();
            
            // Mirror segment
            this.ctx.scale(1, -1);
            this.drawSegment();
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
        
        // Update state
        this.time += 0.016;
        this.rotation += this.rotationSpeed * (1 + this.audioMid * 2);
        this.hueOffset += 0.5 + this.audioMid * 2;
        
        // Zoom pulsing
        this.zoom += this.zoomDirection * this.zoomSpeed * (1 + this.audioBass);
        if (this.zoom > 1.3 || this.zoom < 0.8) {
            this.zoomDirection *= -1;
        }
    }
    
    loop() {
        if (!this.running) return;
        this.render();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
    
    start() {
        if (this.running) return;
        this.running = true;
        this.loop();
    }
    
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    reset() {
        this.rotation = 0;
        this.zoom = 1;
        this.hueOffset = 0;
        this.time = 0;
        this.initShapes();
    }
}
