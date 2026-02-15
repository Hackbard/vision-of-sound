export class Oscilloscope {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = false;
        this.animationId = null;
        
        // Display mode
        this.mode = 'waveform'; // waveform, spectrum, circular, lissajous, bars
        
        // Waveform data
        this.waveformData = new Float32Array(2048);
        this.frequencyData = new Uint8Array(1024);
        this.history = [];
        this.historyLength = 50;
        
        // Visual settings
        this.colorPreset = 'spectrum';
        this.hueOffset = 0;
        this.lineWidth = 2;
        this.glow = true;
        this.mirror = false;
        this.filled = false;
        
        // Audio data
        this.audioIntensity = 0;
        this.audioBass = 0;
        this.audioMid = 0;
        this.audioHigh = 0;
        
        // Animation
        this.time = 0;
        this.rotation = 0;
        
        this.resize();
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
    }
    
    setMode(mode) {
        this.mode = mode;
        this.history = [];
    }
    
    setColorPreset(preset) {
        this.colorPreset = preset;
    }
    
    setLineWidth(width) {
        this.lineWidth = width;
    }
    
    setGlow(enabled) {
        this.glow = enabled;
    }
    
    setMirror(enabled) {
        this.mirror = enabled;
    }
    
    setFilled(enabled) {
        this.filled = enabled;
    }
    
    setWaveformData(data) {
        this.waveformData = data;
    }
    
    setFrequencyData(data) {
        this.frequencyData = data;
    }
    
    setAudioData(data) {
        this.audioIntensity = data.rms || 0;
        this.audioBass = data.bass || 0;
        this.audioMid = data.mid || 0;
        this.audioHigh = data.high || 0;
        
        // Store history for trails
        if (this.history.length >= this.historyLength) {
            this.history.shift();
        }
        this.history.push({
            waveform: new Float32Array(this.waveformData),
            frequency: new Uint8Array(this.frequencyData),
            bass: this.audioBass,
            mid: this.audioMid,
            high: this.audioHigh
        });
    }
    
    getColor(offset = 0, alpha = 1, intensity = 1) {
        let h, s, l;
        const baseHue = this.hueOffset + offset;
        
        switch (this.colorPreset) {
            case 'spectrum':
                h = (baseHue + this.audioMid * 120) % 360;
                s = 80 + this.audioHigh * 20;
                l = 50 + this.audioBass * 20;
                break;
            case 'fire':
                h = (baseHue * 0.15 + this.audioBass * 30) % 60;
                s = 100;
                l = 40 + intensity * 30;
                break;
            case 'ocean':
                h = 180 + (baseHue * 0.2) % 60;
                s = 70 + this.audioHigh * 30;
                l = 40 + this.audioBass * 30;
                break;
            case 'matrix':
                h = 120;
                s = 100;
                l = 40 + intensity * 40;
                break;
            case 'neon':
                h = (280 + baseHue * 0.3) % 360;
                s = 100;
                l = 50 + this.audioHigh * 20;
                break;
            case 'mono':
                h = 0;
                s = 0;
                l = 60 + intensity * 40;
                break;
            case 'retro':
                h = 120 + Math.sin(this.time) * 20;
                s = 100;
                l = 50 + this.audioBass * 30;
                break;
            default:
                h = baseHue % 360;
                s = 80;
                l = 50;
        }
        
        return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
    }
    
    drawWaveform() {
        const data = this.waveformData;
        const sliceWidth = this.width / data.length;
        const amplitude = this.height * 0.4 * (1 + this.audioBass * 0.5);
        
        // Draw history (trails)
        if (this.history.length > 1) {
            for (let h = 0; h < this.history.length - 1; h++) {
                const historyData = this.history[h].waveform;
                const alpha = (h / this.history.length) * 0.3;
                
                this.ctx.strokeStyle = this.getColor(h * 5, alpha);
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                
                for (let i = 0; i < historyData.length; i++) {
                    const x = i * sliceWidth;
                    const y = this.centerY + historyData[i] * amplitude;
                    i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
                }
                this.ctx.stroke();
            }
        }
        
        // Draw main waveform
        if (this.glow) {
            this.ctx.shadowColor = this.getColor(0, 1);
            this.ctx.shadowBlur = 20 + this.audioBass * 30;
        }
        
        this.ctx.strokeStyle = this.getColor(0, 1);
        this.ctx.lineWidth = this.lineWidth + this.audioBass * 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = i * sliceWidth;
            const y = this.centerY + data[i] * amplitude;
            i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        
        // Mirror
        if (this.mirror) {
            this.ctx.strokeStyle = this.getColor(180, 0.5);
            this.ctx.beginPath();
            for (let i = 0; i < data.length; i++) {
                const x = i * sliceWidth;
                const y = this.centerY - data[i] * amplitude;
                i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    drawSpectrum() {
        const data = this.frequencyData;
        const barCount = 128;
        const barWidth = this.width / barCount;
        const barGap = 2;
        
        for (let i = 0; i < barCount; i++) {
            const value = data[i] / 255;
            const barHeight = value * this.height * 0.8;
            const x = i * barWidth;
            const y = this.height - barHeight;
            
            const hue = (i / barCount) * 180 + this.hueOffset;
            
            if (this.glow) {
                this.ctx.shadowColor = this.getColor(hue, 1, value);
                this.ctx.shadowBlur = 15 * value;
            }
            
            if (this.filled) {
                const gradient = this.ctx.createLinearGradient(x, this.height, x, y);
                gradient.addColorStop(0, this.getColor(hue, 0.8, value));
                gradient.addColorStop(1, this.getColor(hue + 60, 0.4, value));
                this.ctx.fillStyle = gradient;
            } else {
                this.ctx.fillStyle = this.getColor(hue, 0.8, value);
            }
            
            this.ctx.fillRect(x + barGap/2, y, barWidth - barGap, barHeight);
            
            // Mirror
            if (this.mirror) {
                this.ctx.fillStyle = this.getColor(hue + 180, 0.4, value);
                this.ctx.fillRect(x + barGap/2, 0, barWidth - barGap, barHeight * 0.5);
            }
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    drawCircular() {
        const data = this.waveformData;
        const freqData = this.frequencyData;
        const radius = Math.min(this.width, this.height) * 0.3;
        const audioRadius = radius * (1 + this.audioBass * 0.3);
        
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.rotation);
        
        // Outer frequency ring
        const segments = 64;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const nextAngle = ((i + 1) / segments) * Math.PI * 2;
            const value = freqData[i * 2] / 255;
            const barLength = value * radius * 0.8;
            
            const x1 = Math.cos(angle) * audioRadius;
            const y1 = Math.sin(angle) * audioRadius;
            const x2 = Math.cos(angle) * (audioRadius + barLength);
            const y2 = Math.sin(angle) * (audioRadius + barLength);
            
            if (this.glow) {
                this.ctx.shadowColor = this.getColor(i * 5, 1, value);
                this.ctx.shadowBlur = 10 * value;
            }
            
            this.ctx.strokeStyle = this.getColor(i * 5, 0.8, value);
            this.ctx.lineWidth = this.lineWidth + value * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        // Inner waveform
        this.ctx.strokeStyle = this.getColor(0, 1);
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const angle = (i / data.length) * Math.PI * 2;
            const waveRadius = audioRadius * 0.6 + data[i] * radius * 0.3;
            const x = Math.cos(angle) * waveRadius;
            const y = Math.sin(angle) * waveRadius;
            
            i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Center circle
        const centerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.2);
        centerGradient.addColorStop(0, this.getColor(0, 0.8));
        centerGradient.addColorStop(1, this.getColor(60, 0));
        this.ctx.fillStyle = centerGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.2 * (1 + this.audioBass * 0.5), 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
        
        this.rotation += 0.005 + this.audioMid * 0.02;
    }
    
    drawLissajous() {
        const data = this.waveformData;
        const scale = Math.min(this.width, this.height) * 0.35;
        const audioScale = scale * (1 + this.audioBass * 0.3);
        
        // Draw trails
        for (let h = 0; h < this.history.length; h++) {
            const historyData = this.history[h].waveform;
            const alpha = (h / this.history.length) * 0.2;
            
            this.ctx.strokeStyle = this.getColor(h * 10, alpha);
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            
            for (let i = 0; i < historyData.length - 1; i++) {
                const x = this.centerX + historyData[i] * audioScale;
                const y = this.centerY + historyData[i + 100] * audioScale;
                i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }
        
        // Main curve
        if (this.glow) {
            this.ctx.shadowColor = this.getColor(0, 1);
            this.ctx.shadowBlur = 20;
        }
        
        this.ctx.strokeStyle = this.getColor(0, 1);
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length - 1; i++) {
            const x = this.centerX + data[i] * audioScale;
            const y = this.centerY + data[Math.min(i + 100, data.length - 1)] * audioScale;
            i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawBars() {
        const data = this.frequencyData;
        const barCount = 32;
        const spacing = this.width / (barCount + 1);
        const maxHeight = this.height * 0.7;
        
        for (let i = 0; i < barCount; i++) {
            // Average multiple frequency bins
            let sum = 0;
            const binSize = Math.floor(data.length / barCount);
            for (let j = 0; j < binSize; j++) {
                sum += data[i * binSize + j];
            }
            const value = (sum / binSize) / 255;
            const barHeight = value * maxHeight;
            
            const x = spacing * (i + 1);
            const barWidth = spacing * 0.6;
            
            // Draw bar
            if (this.glow) {
                this.ctx.shadowColor = this.getColor(i * 10, 1, value);
                this.ctx.shadowBlur = 20 * value;
            }
            
            const gradient = this.ctx.createLinearGradient(x, this.centerY - barHeight, x, this.centerY + barHeight);
            gradient.addColorStop(0, this.getColor(i * 10, 1, value));
            gradient.addColorStop(0.5, this.getColor(i * 10 + 30, 0.8, value));
            gradient.addColorStop(1, this.getColor(i * 10, 1, value));
            
            this.ctx.fillStyle = gradient;
            
            // Top bar
            this.ctx.beginPath();
            this.ctx.roundRect(x - barWidth/2, this.centerY - barHeight, barWidth, barHeight, 5);
            this.ctx.fill();
            
            // Bottom bar (mirrored)
            this.ctx.beginPath();
            this.ctx.roundRect(x - barWidth/2, this.centerY, barWidth, barHeight, 5);
            this.ctx.fill();
            
            // Peak indicator
            this.ctx.fillStyle = this.getColor(i * 10, 1);
            this.ctx.fillRect(x - barWidth/2, this.centerY - barHeight - 8, barWidth, 4);
            this.ctx.fillRect(x - barWidth/2, this.centerY + barHeight + 4, barWidth, 4);
        }
        
        // Center line
        this.ctx.strokeStyle = this.getColor(0, 0.3);
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.width, this.centerY);
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
    }
    
    render() {
        // Clear with fade
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        switch (this.mode) {
            case 'waveform':
                this.drawWaveform();
                break;
            case 'spectrum':
                this.drawSpectrum();
                break;
            case 'circular':
                this.drawCircular();
                break;
            case 'lissajous':
                this.drawLissajous();
                break;
            case 'bars':
                this.drawBars();
                break;
        }
        
        this.time += 0.016;
        this.hueOffset += 0.5 + this.audioMid * 2;
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
}
