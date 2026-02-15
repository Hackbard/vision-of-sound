export class FractalVisualizer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mode = options.mode || 'mandelbrot';
        this.running = false;
        this.animationId = null;
        
        // WebGL for fast fractal rendering
        this.glCanvas = document.createElement('canvas');
        this.gl = this.glCanvas.getContext('webgl') || this.glCanvas.getContext('experimental-webgl');
        this.glProgram = null;
        this.initWebGL();
        
        // Color settings
        this.colorPreset = 'spectrum';
        this.colorPresetIndex = 0;
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
        this.maxIterations = 200;
        this.juliaC = { x: -0.7, y: 0.27015 };
        this.isJulia = false;
        this.zoomSpeed = 0.0005; // Very slow zoom
        // Interesting deep zoom point in Mandelbrot set
        this.zoomTarget = { x: -0.749, y: 0.1 };
        
        // Tunnel settings
        this.tunnelTime = 0;
        this.tunnelSpeed = 0.015;
        
        // Starfield settings
        this.stars = [];
        this.starCount = 800;
        this.starSpeed = 5;
        this.warpMode = false;
        
        this.resize();
        this.initStars();
        window.addEventListener('resize', () => this.resize());
    }
    
    initWebGL() {
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to CPU rendering');
            return;
        }
        
        const gl = this.gl;
        
        // Vertex shader
        const vsSource = `
            attribute vec2 a_position;
            varying vec2 v_pos;
            void main() {
                v_pos = a_position;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Fragment shader for Mandelbrot/Julia
        const fsSource = `
            precision highp float;
            varying vec2 v_pos;
            
            uniform vec2 u_center;
            uniform float u_zoom;
            uniform float u_aspectRatio;
            uniform int u_maxIter;
            uniform int u_isJulia;
            uniform vec2 u_juliaC;
            uniform float u_hueOffset;
            uniform float u_audioMid;
            uniform float u_audioBass;
            uniform float u_audioHigh;
            uniform int u_colorPreset;
            
            vec3 hsl2rgb(float h, float s, float l) {
                float c = (1.0 - abs(2.0 * l - 1.0)) * s;
                float x = c * (1.0 - abs(mod(h / 60.0, 2.0) - 1.0));
                float m = l - c / 2.0;
                vec3 rgb;
                if (h < 60.0) rgb = vec3(c, x, 0.0);
                else if (h < 120.0) rgb = vec3(x, c, 0.0);
                else if (h < 180.0) rgb = vec3(0.0, c, x);
                else if (h < 240.0) rgb = vec3(0.0, x, c);
                else if (h < 300.0) rgb = vec3(x, 0.0, c);
                else rgb = vec3(c, 0.0, x);
                return rgb + m;
            }
            
            void main() {
                float viewWidth = 3.5 / u_zoom;
                float viewHeight = viewWidth / u_aspectRatio;
                
                float x0 = u_center.x + v_pos.x * viewWidth * 0.5;
                float y0 = u_center.y + v_pos.y * viewHeight * 0.5;
                
                float x, y, cx, cy;
                
                if (u_isJulia == 1) {
                    x = x0;
                    y = y0;
                    cx = u_juliaC.x;
                    cy = u_juliaC.y;
                } else {
                    x = 0.0;
                    y = 0.0;
                    cx = x0;
                    cy = y0;
                }
                
                int iteration = 0;
                for (int i = 0; i < 1000; i++) {
                    if (i >= u_maxIter) break;
                    if (x * x + y * y > 4.0) break;
                    float xTemp = x * x - y * y + cx;
                    y = 2.0 * x * y + cy;
                    x = xTemp;
                    iteration++;
                }
                
                if (iteration >= u_maxIter) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                } else {
                    float t = float(iteration) / float(u_maxIter);
                    float h, s, l;
                    float audioHue = u_audioMid * 120.0;
                    
                    if (u_colorPreset == 0) { // spectrum
                        h = mod(t * 360.0 + u_hueOffset + audioHue, 360.0);
                        s = 0.7 + u_audioHigh * 0.3;
                        l = 0.3 + t * 0.4 + u_audioBass * 0.2;
                    } else if (u_colorPreset == 1) { // fire
                        h = mod(t * 60.0 + audioHue * 0.3, 60.0);
                        s = 1.0;
                        l = min(0.6, t * 0.8 + u_audioBass * 0.3);
                    } else if (u_colorPreset == 2) { // ocean
                        h = 180.0 + t * 60.0 + audioHue * 0.2;
                        s = 0.7 + u_audioHigh * 0.3;
                        l = 0.2 + t * 0.5 + u_audioBass * 0.2;
                    } else if (u_colorPreset == 3) { // matrix
                        h = 120.0;
                        s = 0.8;
                        l = t * 0.6 + u_audioBass * 0.3;
                    } else if (u_colorPreset == 4) { // neon
                        h = mod(t * 180.0 + 270.0 + audioHue, 360.0);
                        s = 1.0;
                        l = 0.5 + u_audioHigh * 0.2;
                    } else { // cosmic
                        h = mod(t * 270.0 + u_hueOffset + audioHue, 360.0);
                        s = 0.6 + t * 0.4;
                        l = 0.1 + t * 0.6 + u_audioBass * 0.2;
                    }
                    
                    vec3 rgb = hsl2rgb(h, s, l);
                    gl_FragColor = vec4(rgb, 1.0);
                }
            }
        `;
        
        // Compile shaders
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSource);
        gl.compileShader(vs);
        
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);
        
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            console.error('Fragment shader error:', gl.getShaderInfoLog(fs));
        }
        
        // Create program
        this.glProgram = gl.createProgram();
        gl.attachShader(this.glProgram, vs);
        gl.attachShader(this.glProgram, fs);
        gl.linkProgram(this.glProgram);
        
        // Create quad
        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        const posLoc = gl.getAttribLocation(this.glProgram, 'a_position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Resize WebGL canvas too
        if (this.gl) {
            this.glCanvas.width = rect.width;
            this.glCanvas.height = rect.height;
            this.gl.viewport(0, 0, rect.width, rect.height);
        }
        
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
        this.centerX = -0.5;
        this.centerY = 0;
        this.maxIterations = 200;
        this.juliaC = { x: -0.7, y: 0.27015 };
        if (this.mode === 'starfield') {
            this.initStars();
        }
    }
    
    setColorPreset(preset) {
        this.colorPreset = preset;
        const presets = ['spectrum', 'fire', 'ocean', 'matrix', 'neon', 'cosmic'];
        this.colorPresetIndex = presets.indexOf(preset);
        if (this.colorPresetIndex < 0) this.colorPresetIndex = 0;
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
    
    // Mandelbrot/Julia fractal (WebGL accelerated)
    renderMandelbrot() {
        if (!this.gl || !this.glProgram) {
            this.renderMandelbrotCPU();
            return;
        }
        
        const gl = this.gl;
        gl.useProgram(this.glProgram);
        
        // Set uniforms
        gl.uniform2f(gl.getUniformLocation(this.glProgram, 'u_center'), this.centerX, this.centerY);
        gl.uniform1f(gl.getUniformLocation(this.glProgram, 'u_zoom'), this.zoom);
        gl.uniform1f(gl.getUniformLocation(this.glProgram, 'u_aspectRatio'), this.width / this.height);
        gl.uniform1i(gl.getUniformLocation(this.glProgram, 'u_maxIter'), Math.floor(this.maxIterations * (1 + this.audioBass * 0.5)));
        gl.uniform1i(gl.getUniformLocation(this.glProgram, 'u_isJulia'), this.isJulia ? 1 : 0);
        
        const jx = this.juliaC.x + Math.sin(this.hueOffset * 0.01) * 0.1 * this.audioMid;
        const jy = this.juliaC.y + Math.cos(this.hueOffset * 0.01) * 0.1 * this.audioHigh;
        gl.uniform2f(gl.getUniformLocation(this.glProgram, 'u_juliaC'), jx, jy);
        
        gl.uniform1f(gl.getUniformLocation(this.glProgram, 'u_hueOffset'), this.hueOffset);
        gl.uniform1f(gl.getUniformLocation(this.glProgram, 'u_audioMid'), this.audioMid);
        gl.uniform1f(gl.getUniformLocation(this.glProgram, 'u_audioBass'), this.audioBass);
        gl.uniform1f(gl.getUniformLocation(this.glProgram, 'u_audioHigh'), this.audioHigh);
        gl.uniform1i(gl.getUniformLocation(this.glProgram, 'u_colorPreset'), this.colorPresetIndex || 0);
        
        // Render
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        // Copy to main canvas
        this.ctx.drawImage(this.glCanvas, 0, 0);
        
        // Julia: animate C parameter instead of zooming
        if (this.isJulia) {
            // Slowly morph the Julia set shape
            const speed = 0.003 * this.baseSpeed * (1 + this.audioMid * 0.5);
            this.juliaC.x = -0.7 + Math.sin(this.hueOffset * 0.01) * 0.3;
            this.juliaC.y = 0.27 + Math.cos(this.hueOffset * 0.015) * 0.3;
            
            // Gentle zoom pulsing
            const targetZoom = 1.2 + Math.sin(this.hueOffset * 0.005) * 0.3 + this.audioBass * 0.5;
            this.zoom += (targetZoom - this.zoom) * 0.02;
        } else {
            // Mandelbrot: very slow cinematic zoom
            const zoomFactor = this.zoomSpeed * this.baseSpeed;
            this.zoom *= 1 + zoomFactor;
            
            // Smoothly move toward target point
            const moveSpeed = 0.002;
            this.centerX += (this.zoomTarget.x - this.centerX) * moveSpeed;
            this.centerY += (this.zoomTarget.y - this.centerY) * moveSpeed;
            
            // Increase iterations as we zoom deeper for more detail
            this.maxIterations = Math.min(400, 150 + Math.log10(Math.max(1, this.zoom)) * 25);
            
            // Float precision limit reached - smooth reset
            if (this.zoom > 1e12) {
                this.zoom = 1;
                this.centerX = -0.5;
                this.centerY = 0;
                this.maxIterations = 150;
                // Pick a new random interesting point
                const points = [
                    { x: -0.749, y: 0.1 },
                    { x: -0.1011, y: 0.9563 },
                    { x: -1.25066, y: 0.02012 },
                    { x: -0.748, y: 0.1 },
                    { x: 0.001643721971153, y: -0.822467633298876 }
                ];
                this.zoomTarget = points[Math.floor(Math.random() * points.length)];
            }
        }
        
        this.hueOffset += 0.3 + this.audioMid;
    }
    
    // Fallback CPU renderer
    renderMandelbrotCPU() {
        const imgData = this.ctx.createImageData(this.width, this.height);
        const data = imgData.data;
        const iterations = 50;
        
        for (let py = 0; py < this.height; py += 2) {
            for (let px = 0; px < this.width; px += 2) {
                const x0 = (px / this.width - 0.5) * 3.5 / this.zoom + this.centerX;
                const y0 = (py / this.height - 0.5) * 2 / this.zoom + this.centerY;
                let x = 0, y = 0, iter = 0;
                while (x*x + y*y <= 4 && iter < iterations) {
                    const t = x*x - y*y + x0;
                    y = 2*x*y + y0;
                    x = t;
                    iter++;
                }
                const c = iter === iterations ? 0 : (iter / iterations) * 255;
                for (let dy = 0; dy < 2; dy++) {
                    for (let dx = 0; dx < 2; dx++) {
                        const idx = ((py + dy) * this.width + px + dx) * 4;
                        data[idx] = c; data[idx+1] = c * 0.5; data[idx+2] = c * 2;
                        data[idx+3] = 255;
                    }
                }
            }
        }
        this.ctx.putImageData(imgData, 0, 0);
        this.zoom *= 1.01;
    }
    
    // Tunnel effect
    renderTunnel() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const speed = this.tunnelSpeed * this.baseSpeed * (1 + this.audioBass * 2);
        this.tunnelTime += speed;
        
        const segments = 64;
        const depth = 80;
        const baseRadius = Math.min(this.width, this.height) * 0.6;
        const audioRadius = 1 + this.audioBass * 0.3;
        
        for (let d = depth; d > 0; d--) {
            const z = (d + this.tunnelTime * 15) % depth;
            const progress = z / depth;
            const scale = 0.1 + progress * 2;
            const radius = baseRadius * scale * audioRadius;
            const alpha = Math.min(1, (1 - progress) * 1.5);
            
            const hue = (this.hueOffset + z * 4 + this.audioMid * 120) % 360;
            const sat = 70 + this.audioHigh * 30;
            const light = 35 + this.audioBass * 25 + (1 - progress) * 20;
            
            this.ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
            this.ctx.lineWidth = Math.max(1, (1 - progress) * 4 + this.audioBass * 2);
            
            // Smooth tunnel sway
            const sway = 30 + this.audioMid * 40;
            const offsetX = Math.sin(this.tunnelTime * 0.5 + z * 0.05) * sway;
            const offsetY = Math.cos(this.tunnelTime * 0.3 + z * 0.05) * sway;
            
            this.ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const wobble = Math.sin(angle * 4 + this.tunnelTime) * 15 * this.audioHigh * progress;
                const r = radius + wobble;
                
                const x = this.centerScreenX + Math.cos(angle) * r + offsetX * progress;
                const y = this.centerScreenY + Math.sin(angle) * r + offsetY * progress;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
        
        this.hueOffset += 0.8 + this.audioMid * 2;
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
