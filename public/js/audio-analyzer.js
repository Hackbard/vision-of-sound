export class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.stream = null;
        this.dataArray = null;
        this.frequencyData = null;
        this.active = false;
        
        // Frequency band ranges (in Hz)
        this.bands = {
            bass: { min: 20, max: 250 },
            mid: { min: 250, max: 2000 },
            high: { min: 2000, max: 20000 }
        };
    }
    
    async init(deviceId = null) {
        try {
            const constraints = {
                audio: deviceId ? { deviceId: { exact: deviceId } } : true
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            
            this.source = this.audioContext.createMediaStreamSource(this.stream);
            this.source.connect(this.analyser);
            
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.frequencyData = new Uint8Array(this.bufferLength);
            
            this.active = true;
            
            return true;
        } catch (error) {
            console.error('Audio initialization failed:', error);
            throw error;
        }
    }
    
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.active = false;
    }
    
    isActive() {
        return this.active;
    }
    
    getFrequencyData() {
        if (!this.active || !this.analyser) {
            return { bass: 0, mid: 0, high: 0, rms: 0, spectralCentroid: 0 };
        }
        
        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        const sampleRate = this.audioContext.sampleRate;
        const binSize = sampleRate / this.analyser.fftSize;
        
        // Calculate frequency band averages
        const bass = this.getAverageVolume(
            Math.floor(this.bands.bass.min / binSize),
            Math.floor(this.bands.bass.max / binSize)
        );
        
        const mid = this.getAverageVolume(
            Math.floor(this.bands.mid.min / binSize),
            Math.floor(this.bands.mid.max / binSize)
        );
        
        const high = this.getAverageVolume(
            Math.floor(this.bands.high.min / binSize),
            Math.floor(this.bands.high.max / binSize)
        );
        
        // Calculate RMS (Root Mean Square) for amplitude
        const rms = this.calculateRMS();
        
        // Calculate spectral centroid (brightness)
        const spectralCentroid = this.calculateSpectralCentroid(binSize);
        
        return {
            bass: bass / 255,
            mid: mid / 255,
            high: high / 255,
            rms,
            spectralCentroid: spectralCentroid / sampleRate * 2
        };
    }
    
    getAverageVolume(startBin, endBin) {
        startBin = Math.max(0, startBin);
        endBin = Math.min(this.bufferLength - 1, endBin);
        
        let sum = 0;
        let count = 0;
        
        for (let i = startBin; i <= endBin; i++) {
            sum += this.frequencyData[i];
            count++;
        }
        
        return count > 0 ? sum / count : 0;
    }
    
    calculateRMS() {
        let sum = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const value = (this.dataArray[i] - 128) / 128;
            sum += value * value;
        }
        
        return Math.sqrt(sum / this.bufferLength);
    }
    
    calculateSpectralCentroid(binSize) {
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const frequency = i * binSize;
            const magnitude = this.frequencyData[i];
            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
        }
        
        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }
    
    drawSpectrum(canvas) {
        if (!this.active || !canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        const barWidth = width / 64;
        const step = Math.floor(this.bufferLength / 64);
        
        for (let i = 0; i < 64; i++) {
            const value = this.frequencyData[i * step] / 255;
            const barHeight = value * height;
            
            // Color based on frequency
            let hue;
            if (i < 10) {
                hue = 0 + (i / 10) * 60; // Bass: red to yellow
            } else if (i < 30) {
                hue = 60 + ((i - 10) / 20) * 120; // Mid: yellow to cyan
            } else {
                hue = 180 + ((i - 30) / 34) * 150; // High: cyan to magenta
            }
            
            ctx.fillStyle = `hsl(${hue}, 80%, ${30 + value * 40}%)`;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
    }
    
    static async getAudioDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'audioinput');
    }
}
