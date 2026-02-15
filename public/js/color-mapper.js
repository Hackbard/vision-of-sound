export class ColorMapper {
    constructor() {
        this.presets = {
            energetic: {
                bassHue: 0,      // Red
                midHue: 120,     // Green
                highHue: 240,    // Blue
                bassSaturation: 100,
                midSaturation: 90,
                highSaturation: 95,
                mode: 'blend'
            },
            calm: {
                bassHue: 220,    // Deep blue
                midHue: 180,     // Cyan
                highHue: 280,    // Purple
                bassSaturation: 60,
                midSaturation: 50,
                highSaturation: 55,
                mode: 'blend'
            },
            psychedelic: {
                bassHue: 300,    // Magenta
                midHue: 60,      // Yellow
                highHue: 180,    // Cyan
                bassSaturation: 100,
                midSaturation: 100,
                highSaturation: 100,
                mode: 'blend'
            },
            warm: {
                bassHue: 0,      // Red
                midHue: 30,      // Orange
                highHue: 60,     // Yellow
                bassSaturation: 90,
                midSaturation: 95,
                highSaturation: 85,
                mode: 'blend'
            },
            cool: {
                bassHue: 200,    // Light blue
                midHue: 240,     // Blue
                highHue: 280,    // Purple
                bassSaturation: 75,
                midSaturation: 80,
                highSaturation: 70,
                mode: 'blend'
            },
            spectrum: {
                mode: 'spectrum'
            },
            rainbow: {
                mode: 'rainbow'
            },
            fire: {
                mode: 'fire'
            },
            matrix: {
                mode: 'matrix'
            },
            neon: {
                mode: 'neon'
            },
            ocean: {
                mode: 'ocean'
            },
            aurora: {
                mode: 'aurora'
            },
            vapor: {
                mode: 'vapor'
            }
        };
        
        this.currentPreset = 'energetic';
        this.smoothedValues = { bass: 0, mid: 0, high: 0, rms: 0, spectralCentroid: 0 };
        this.smoothingFactor = 0.3;
        this.hueOffset = 0;
        this.time = 0;
    }
    
    setPreset(presetName) {
        if (this.presets[presetName]) {
            this.currentPreset = presetName;
        }
    }
    
    smooth(current, target, factor) {
        return current + (target - current) * factor;
    }
    
    mapAudioToColor(audioData, sensitivity = 1) {
        this.time += 0.016; // ~60fps time increment
        
        // Smooth the values for less jittery colors
        this.smoothedValues.bass = this.smooth(
            this.smoothedValues.bass,
            audioData.bass * sensitivity,
            this.smoothingFactor
        );
        this.smoothedValues.mid = this.smooth(
            this.smoothedValues.mid,
            audioData.mid * sensitivity,
            this.smoothingFactor
        );
        this.smoothedValues.high = this.smooth(
            this.smoothedValues.high,
            audioData.high * sensitivity,
            this.smoothingFactor
        );
        this.smoothedValues.rms = this.smooth(
            this.smoothedValues.rms,
            audioData.rms * sensitivity,
            this.smoothingFactor
        );
        this.smoothedValues.spectralCentroid = this.smooth(
            this.smoothedValues.spectralCentroid,
            (audioData.spectralCentroid || 0) * sensitivity,
            this.smoothingFactor
        );
        
        const { bass, mid, high, rms, spectralCentroid } = this.smoothedValues;
        const preset = this.presets[this.currentPreset];
        
        // Handle special modes
        if (preset.mode && preset.mode !== 'blend') {
            return this.mapSpecialMode(preset.mode, { bass, mid, high, rms, spectralCentroid });
        }
        
        // Calculate dominant frequency band
        const total = bass + mid + high + 0.001;
        const bassRatio = bass / total;
        const midRatio = mid / total;
        const highRatio = high / total;
        
        // Calculate hue based on frequency distribution
        let hue = (
            preset.bassHue * bassRatio +
            preset.midHue * midRatio +
            preset.highHue * highRatio
        );
        
        if (audioData.spectralCentroid !== undefined) {
            const centroidOffset = (audioData.spectralCentroid - 0.5) * 30;
            hue += centroidOffset;
        }
        
        hue = ((hue % 360) + 360) % 360;
        
        const maxRatio = Math.max(bassRatio, midRatio, highRatio);
        const dominance = (maxRatio - 0.33) / 0.67;
        
        const baseSaturation = (
            preset.bassSaturation * bassRatio +
            preset.midSaturation * midRatio +
            preset.highSaturation * highRatio
        );
        
        const saturation = Math.min(100, baseSaturation * (0.5 + rms * 1.5) * (0.7 + dominance * 0.3));
        
        const minLightness = 20;
        const maxLightness = 70;
        const lightness = minLightness + (maxLightness - minLightness) * Math.min(1, rms * 2);
        
        return {
            h: Math.round(hue),
            s: Math.round(Math.max(0, Math.min(100, saturation))),
            l: Math.round(Math.max(minLightness, Math.min(maxLightness, lightness)))
        };
    }
    
    mapSpecialMode(mode, { bass, mid, high, rms, spectralCentroid }) {
        const energy = rms * 2;
        
        switch (mode) {
            case 'spectrum': {
                // Like the spectrum visualizer - hue follows frequency
                this.hueOffset += bass * 2 + mid * 1 + high * 0.5;
                const hue = (spectralCentroid * 360 + this.hueOffset) % 360;
                return {
                    h: Math.round(hue),
                    s: Math.round(70 + energy * 30),
                    l: Math.round(30 + energy * 40)
                };
            }
            
            case 'rainbow': {
                // Continuously cycling rainbow, speed based on energy
                this.hueOffset += 1 + energy * 5;
                return {
                    h: Math.round(this.hueOffset % 360),
                    s: 100,
                    l: Math.round(40 + energy * 30)
                };
            }
            
            case 'fire': {
                // Red/orange/yellow fire effect
                const fireHue = bass * 30 + mid * 15; // 0-45 range
                const flicker = Math.sin(this.time * 20) * 5 * energy;
                return {
                    h: Math.round(Math.max(0, Math.min(60, fireHue + flicker))),
                    s: Math.round(90 + energy * 10),
                    l: Math.round(20 + energy * 50 + bass * 20)
                };
            }
            
            case 'matrix': {
                // Green with variations
                const pulse = Math.sin(this.time * 5) * 10;
                return {
                    h: Math.round(120 + high * 20 + pulse),
                    s: Math.round(80 + energy * 20),
                    l: Math.round(25 + energy * 45)
                };
            }
            
            case 'neon': {
                // Electric neon colors - pink, cyan, purple
                const neonHues = [320, 180, 280, 60]; // Pink, Cyan, Purple, Yellow
                const index = Math.floor((this.time * 0.5 + bass * 2) % neonHues.length);
                const nextIndex = (index + 1) % neonHues.length;
                const blend = ((this.time * 0.5 + bass * 2) % 1);
                const hue = neonHues[index] + (neonHues[nextIndex] - neonHues[index]) * blend;
                return {
                    h: Math.round(((hue % 360) + 360) % 360),
                    s: 100,
                    l: Math.round(50 + energy * 25)
                };
            }
            
            case 'ocean': {
                // Deep blue to turquoise
                const depth = 200 + spectralCentroid * 40 - bass * 20;
                const wave = Math.sin(this.time * 2) * 10;
                return {
                    h: Math.round(Math.max(180, Math.min(240, depth + wave))),
                    s: Math.round(60 + energy * 40),
                    l: Math.round(25 + energy * 35 + high * 15)
                };
            }
            
            case 'aurora': {
                // Northern lights - greens, purples, pinks
                const auroraBase = 120 + Math.sin(this.time * 0.3) * 60;
                const shift = spectralCentroid * 100 + bass * 50;
                return {
                    h: Math.round((auroraBase + shift) % 360),
                    s: Math.round(70 + energy * 30),
                    l: Math.round(30 + energy * 40)
                };
            }
            
            case 'vapor': {
                // Vaporwave aesthetics - pink, purple, cyan
                const vaporTime = this.time * 0.2;
                const vaporHue = 280 + Math.sin(vaporTime) * 40 + Math.cos(vaporTime * 1.3) * 30;
                const shift = mid * 60 - high * 30;
                return {
                    h: Math.round(((vaporHue + shift) % 360 + 360) % 360),
                    s: Math.round(75 + energy * 25),
                    l: Math.round(45 + energy * 30)
                };
            }
            
            default:
                return { h: 0, s: 0, l: 50 };
        }
    }
    
    // Create a gradient of colors based on audio data
    createGradient(audioData, steps = 5) {
        const colors = [];
        const baseColor = this.mapAudioToColor(audioData);
        
        for (let i = 0; i < steps; i++) {
            const offset = (i - Math.floor(steps / 2)) * 15;
            colors.push({
                h: (baseColor.h + offset + 360) % 360,
                s: baseColor.s,
                l: baseColor.l + (i - Math.floor(steps / 2)) * 5
            });
        }
        
        return colors;
    }
    
    // Get a contrasting color for UI elements
    getContrastColor(color) {
        return {
            h: (color.h + 180) % 360,
            s: color.s,
            l: color.l > 50 ? 20 : 80
        };
    }
    
    // Convert HSL to CSS string
    toCSS(color) {
        return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    }
    
    // Convert HSL to RGB
    toRGB(color) {
        const h = color.h / 360;
        const s = color.s / 100;
        const l = color.l / 100;
        
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
}
