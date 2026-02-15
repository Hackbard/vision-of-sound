export class ColorMapper {
    constructor() {
        this.presets = {
            energetic: {
                bassHue: 0,      // Red
                midHue: 120,     // Green
                highHue: 240,    // Blue
                bassSaturation: 100,
                midSaturation: 90,
                highSaturation: 95
            },
            calm: {
                bassHue: 220,    // Deep blue
                midHue: 180,     // Cyan
                highHue: 280,    // Purple
                bassSaturation: 60,
                midSaturation: 50,
                highSaturation: 55
            },
            psychedelic: {
                bassHue: 300,    // Magenta
                midHue: 60,      // Yellow
                highHue: 180,    // Cyan
                bassSaturation: 100,
                midSaturation: 100,
                highSaturation: 100
            },
            warm: {
                bassHue: 0,      // Red
                midHue: 30,      // Orange
                highHue: 60,     // Yellow
                bassSaturation: 90,
                midSaturation: 95,
                highSaturation: 85
            },
            cool: {
                bassHue: 200,    // Light blue
                midHue: 240,     // Blue
                highHue: 280,    // Purple
                bassSaturation: 75,
                midSaturation: 80,
                highSaturation: 70
            }
        };
        
        this.currentPreset = 'energetic';
        this.smoothedValues = { bass: 0, mid: 0, high: 0, rms: 0 };
        this.smoothingFactor = 0.3;
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
        
        const { bass, mid, high, rms } = this.smoothedValues;
        const preset = this.presets[this.currentPreset];
        
        // Calculate dominant frequency band
        const total = bass + mid + high + 0.001; // Avoid division by zero
        const bassRatio = bass / total;
        const midRatio = mid / total;
        const highRatio = high / total;
        
        // Calculate hue based on frequency distribution
        // Weighted average of preset hues based on frequency ratios
        let hue = (
            preset.bassHue * bassRatio +
            preset.midHue * midRatio +
            preset.highHue * highRatio
        );
        
        // Add some variation based on spectral centroid if available
        if (audioData.spectralCentroid !== undefined) {
            const centroidOffset = (audioData.spectralCentroid - 0.5) * 30;
            hue += centroidOffset;
        }
        
        // Normalize hue to 0-360
        hue = ((hue % 360) + 360) % 360;
        
        // Calculate saturation based on frequency dominance and amplitude
        const maxRatio = Math.max(bassRatio, midRatio, highRatio);
        const dominance = (maxRatio - 0.33) / 0.67; // How dominant is the strongest band
        
        const baseSaturation = (
            preset.bassSaturation * bassRatio +
            preset.midSaturation * midRatio +
            preset.highSaturation * highRatio
        );
        
        // Higher amplitude = higher saturation
        const saturation = Math.min(100, baseSaturation * (0.5 + rms * 1.5) * (0.7 + dominance * 0.3));
        
        // Calculate lightness based on amplitude
        // Silence = dark, loud = bright
        const minLightness = 20;
        const maxLightness = 70;
        const lightness = minLightness + (maxLightness - minLightness) * Math.min(1, rms * 2);
        
        return {
            h: Math.round(hue),
            s: Math.round(Math.max(0, Math.min(100, saturation))),
            l: Math.round(Math.max(minLightness, Math.min(maxLightness, lightness)))
        };
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
