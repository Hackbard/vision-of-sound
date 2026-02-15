export class FractalVisualizer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = options.mode || 'mandelbrot';
        this.running = false;
        this.animationId = null;
        
        // Color settings
        this.colorPreset = 'spectrum';
        this.hueOffset = 0;
        this.saturation = 80;
        this.brightness = 50;
        
        // Audio reactivity
        this.audioIntensity = 0;
        this.audioBass = 0;
        this.audioMid = 0;
        this.audioHigh = 0;
        this.baseSpeed = 1;
        
        // Mandelbrot/Julia settings
        this.zoom = 1;
        this.centerX = -0.5;
        this.centerY = 0;
        this.maxIterations = 100;
        this.juliaC = { x: -0.7, y: 0.27015 };
        this.isJulia = false;
        this.zoomSpeed = 0.01;
        this.zoomTarget = { x: -0.743643887037151, y: 0.131825904205330 };
        
        // Tunnel settings
        this.tunnelTime = 0;
        this.tunnelSpeed = 0.02;
        this.tunnelSegments = 32;
        this.tunnelDepth = 50;
        
        // Starfield settings
        this.stars = [];
        this.starCount = 800;
        this.starSpeed = 5;
        this.warpMode = false;
        
        this.resize();
        this.initStars();
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
        this.centerScreenX = this.width / 2;
        this.centerScreenY = this.height / 2;
        
        // Reinit for new size
        if (this.mode === 'starfield') {
            this.initStars();
        }
    }
    
    initStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push(this.createStar(true));
        }
    }
    
    createStar(randomZ = false) {
        return {
            x: (Math.random() - 0.5) * this.width * 3,
            y: (Math.random() - 0.5) * this.height * 3,
            z: randomZ ? Math.random() * 2000 : 2000,
            size: Math.random() * 2 + 1,
            color: Math.random() * 60 - 30
        };
    }
    
    setMode(mode) {
        this.mode = mode;
        this.reset();
    }
    
    reset() {
        this.zoom = 1;
        this.tunnelTime = 0;
        this.hueOffset = 0;
        if (this.mode === 'starfield') {
            this.initStars();
        }
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
    
    setSpeed(speed) {
        this.baseSpeed = speed;
    }
    
    getColor(iteration, maxIter) {
        if (iteration === maxIter) return 'rgb(0,0,0)';
        
        const t = iteration / maxIter;
        let h, s, l;
        
        const audioHue = this.audioMid * 180;
        const audioSat = 60 + this.audioHigh * 40;
        const audioLight = 30 + this.audioBass * 40;
        
        switch (this.colorPreset) {
            case 'spectrum':
                h = (t * 360 + this.hueOffset + audioHue) % 360;
                s = audioSat;
                l = audioLight + t * 30;
                break;
            case 'fire':
                h = (t * 60 + audioHue * 0.3) % 360;
                s = 100;
                l = Math.min(60, t * 100 + audioLight);
                break;
            case 'ocean':
                h = 180 + t * 60 + audioHue * 0.2;
                s = 70 + this.audioHigh * 30;
                l = 20 + t * 50 + audioLight * 0.5;
                break;
            case 'matrix':
                h = 120 + audioHue * 0.1;
                s = 80;
                l = t * 60 + audioLight;
                break;
            case 'neon':
                h = (t * 180 + 270 + audioHue) % 360;
                s = 100;
                l = 50 + this.audioHigh * 20;
                break;
            case 'cosmic':
                h = (t * 270 + this.hueOffset + audioHue) % 360;
                s = 60 + t * 40;
                l = 10 + t * 60 + audioLight;
                break;
            default:
                h = (t * 360 + this.hueOffset) % 360;
                s = 80;
                l = 50;
        }
        
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    // Mandelbrot/Julia fractal
    renderMandelbrot() {
        const imgData = this.ctx.createImageData(this.width, this.height);
        const data = imgData.data;
        
        const aspectRatio = this.width / this.height;
        const viewWidth = 3.5 / this.zoom;
        const viewHeight = viewWidth / aspectRatio;
        
        const xMin = this.centerX - viewWidth / 2;
        const yMin = this.centerY - viewHeight / 2;
        
        const audioBoost = 1 + this.audioBass * 0.5;
        const iterations = Math.floor(this.maxIterations * audioBoost);
        
        for (let py = 0; py < this.height; py++) {
            for (let px = 0; px < this.width; px++) {
                const x0 = xMin + (px / this.width) * viewWidth;
                const y0 = yMin + (py / this.height) * viewHeight;
                
                let x, y, cx, cy;
                
                if (this.isJulia) {
                    x = x0;
                    y = y0;
                    cx = this.juliaC.x + Math.sin(this.hueOffset * 0.01) * 0.1 * this.audioMid;
                    cy = this.juliaC.y + Math.cos(this.hueOffset * 0.01) * 0.1 * this.audioHigh;
                } else {
                    x = 0;
                    y = 0;
                    cx = x0;
                    cy = y0;
                }
                
                let iteration = 0;
                
                while (x * x + y * y <= 4 && iteration < iterations) {
                    const xTemp = x * x - y * y + cx;
                    y = 2 * x * y + cy;
                    x = xTemp;
                    iteration++;
                }
                
                const idx = (py * this.width + px) * 4;
                
                if (iteration === iterations) {
                    data[idx] = 0;
                    data[idx + 1] = 0;
                    data[idx + 2] = 0;
                } else {
                    const t = iteration / iterations;
                    const hue = (t * 360 + this.hueOffset + this.audioMid * 180) % 360;
                    const sat = 60 + this.audioHigh * 40;
                    const light = 30 + t * 50 + this.audioBass * 20;
                    
                    const rgb = this.hslToRgb(hue / 360, sat / 100, light / 100);
                    data[idx] = rgb.r;
                    data[idx + 1] = rgb.g;
                    data[idx + 2] = rgb.b;
                }
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imgData, 0, 0);
        
        // Zoom in
        const zoomFactor = this.zoomSpeed * this.baseSpeed * (1 + this.audioBass * 2);
        this.zoom *= 1 + zoomFactor;
        
        // Move toward target
        this.centerX += (this.zoomTarget.x - this.centerX) * zoomFactor;
        this.centerY += (this.zoomTarget.y - this.centerY) * zoomFactor;
        
        // Reset zoom after deep zoom
        if (this.zoom > 1e12) {
            this.zoom = 1;
            this.centerX = -0.5;
            this.centerY = 0;
        }
        
        this.hueOffset += 0.5 + this.audioMid * 2;
    }
    
    // Tunnel effect
    renderTunnel() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const speed = this.tunnelSpeed * this.baseSpeed * (1 + this.audioBass * 3);
        this.tunnelTime += speed;
        
        const segments = this.tunnelSegments;
        const audioWobble = this.audioMid * 30;
        const audioRadius = 1 + this.audioBass * 0.5;
        
        for (let d = this.tunnelDepth; d > 0; d--) {
            const z = (d + this.tunnelTime * 10) % this.tunnelDepth;
            const scale = 1 / (z * 0.1 + 0.1);
            const radius = (100 + audioWobble) * scale * audioRadius;
            const alpha = Math.min(1, z / 10);
            
            const hue = (this.hueOffset + z * 5 + this.audioMid * 180) % 360;
            const sat = 70 + this.audioHigh * 30;
            const light = 40 + this.audioBass * 30;
            
            this.ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
            this.ctx.lineWidth = Math.max(1, 3 * scale);
            
            this.ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const wobble = Math.sin(angle * 3 + this.tunnelTime * 2) * 20 * this.audioHigh;
                const r = radius + wobble;
                
                const offsetX = Math.sin(this.tunnelTime + z * 0.1) * 50 * this.audioMid;
                const offsetY = Math.cos(this.tunnelTime * 0.7 + z * 0.1) * 50 * this.audioMid;
                
                const x = this.centerScreenX + Math.cos(angle) * r + offsetX;
                const y = this.centerScreenY + Math.sin(angle) * r + offsetY;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
        
        this.hueOffset += 1 + this.audioMid * 3;
    }
    
    // Starfield/Hyperspace
    renderStarfield() {
        // Trail effect
        this.ctx.fillStyle = this.warpMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const speed = this.starSpeed * this.baseSpeed * (1 + this.audioBass * 4);
        const warpStretch = this.warpMode ? 20 + this.audioBass * 30 : 1;
        
        for (let star of this.stars) {
            // Move star toward viewer
            star.z -= speed;
            
            // Reset star if too close
            if (star.z <= 0) {
                Object.assign(star, this.createStar(false));
            }
            
            // Project to 2D
            const factor = 200 / star.z;
            const x = this.centerScreenX + star.x * factor;
            const y = this.centerScreenY + star.y * factor;
            
            // Previous position for trails
            const prevFactor = 200 / (star.z + speed * warpStretch);
            const prevX = this.centerScreenX + star.x * prevFactor;
            const prevY = this.centerScreenY + star.y * prevFactor;
            
            // Check if on screen
            if (x < 0 || x > this.width || y < 0 || y > this.height) continue;
            
            const size = Math.max(0.5, (1 - star.z / 2000) * 4 * star.size);
            const alpha = Math.min(1, (1 - star.z / 2000) * 2);
            
            const hue = (this.hueOffset + star.color + this.audioMid * 60) % 360;
            const sat = 20 + this.audioHigh * 60;
            const light = 70 + this.audioBass * 30;
            
            if (this.warpMode || this.audioBass > 0.3) {
                // Draw trail line
                this.ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
                this.ctx.lineWidth = size;
                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            } else {
                // Draw point
                this.ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.hueOffset += 0.3 + this.audioMid;
    }
    
    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    render() {
        switch (this.mode) {
            case 'mandelbrot':
            case 'julia':
                this.isJulia = this.mode === 'julia';
                this.renderMandelbrot();
                break;
            case 'tunnel':
                this.renderTunnel();
                break;
            case 'starfield':
                this.renderStarfield();
                break;
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
    
    toggleWarp() {
        this.warpMode = !this.warpMode;
        return this.warpMode;
    }
    
    setJuliaC(x, y) {
        this.juliaC = { x, y };
    }
    
    setZoomTarget(x, y) {
        this.zoomTarget = { x, y };
    }
}
