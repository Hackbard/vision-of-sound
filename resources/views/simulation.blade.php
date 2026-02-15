<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game of Sound</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #000;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #canvas-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
        }
        
        #game-canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
        
        #controls {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            padding: 15px 25px;
            border-radius: 12px;
            display: flex;
            gap: 20px;
            align-items: center;
            transition: opacity 0.3s ease;
            z-index: 100;
        }
        
        #controls.hidden {
            opacity: 0;
            pointer-events: none;
        }
        
        .control-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .control-label {
            color: #888;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        button {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        
        button:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
        }
        
        button.active {
            background: rgba(100, 200, 255, 0.3);
            border-color: rgba(100, 200, 255, 0.6);
        }
        
        input[type="range"] {
            -webkit-appearance: none;
            width: 100px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
        }
        
        select {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
        }
        
        select option {
            background: #222;
            color: #fff;
        }
        
        #audio-status {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            padding: 10px 15px;
            border-radius: 8px;
            color: #888;
            font-size: 12px;
            z-index: 100;
        }
        
        #audio-status.active {
            color: #4f4;
        }
        
        #spectrum {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 60px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
            overflow: hidden;
            z-index: 100;
        }
        
        #spectrum.hidden {
            display: none;
        }
        
        #spectrum-canvas {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="canvas-container">
        <canvas id="game-canvas"></canvas>
    </div>
    
    <div id="audio-status">
        <span id="audio-indicator">No Audio</span>
    </div>
    
    <div id="spectrum" class="hidden">
        <canvas id="spectrum-canvas"></canvas>
    </div>
    
    <div id="controls">
        <div class="control-group">
            <button id="btn-play-pause" title="Space to toggle">
                <span id="play-pause-icon">⏸</span>
            </button>
            <button id="btn-reset" title="Cmd+R to reset">↻</button>
        </div>
        
        <div class="control-group">
            <span class="control-label">Pattern</span>
            <select id="pattern-select">
                <option value="random">Random</option>
                <option value="glider">Glider</option>
                <option value="pulsar">Pulsar</option>
                <option value="glider-gun">Glider Gun</option>
                <option value="blinker">Blinker</option>
                <option value="beacon">Beacon</option>
            </select>
        </div>
        
        <div class="control-group">
            <span class="control-label">Speed</span>
            <input type="range" id="speed-slider" min="5" max="60" value="20">
        </div>
        
        <div class="control-group">
            <span class="control-label">Sensitivity</span>
            <input type="range" id="sensitivity-slider" min="0" max="100" value="50">
        </div>
        
        <div class="control-group">
            <button id="btn-audio" title="Enable Audio">🎤</button>
            <button id="btn-spectrum" title="Toggle Spectrum">📊</button>
        </div>
    </div>

    <script type="module">
        import { GameOfLife } from '/js/game-of-life.js';
        import { AudioAnalyzer } from '/js/audio-analyzer.js';
        import { ColorMapper } from '/js/color-mapper.js';
        
        // Initialize components
        const canvas = document.getElementById('game-canvas');
        const spectrumCanvas = document.getElementById('spectrum-canvas');
        
        const game = new GameOfLife(canvas, {
            cellSize: 8,
            fps: 20
        });
        
        const colorMapper = new ColorMapper();
        let audioAnalyzer = null;
        
        // UI Elements
        const controls = document.getElementById('controls');
        const btnPlayPause = document.getElementById('btn-play-pause');
        const btnReset = document.getElementById('btn-reset');
        const btnAudio = document.getElementById('btn-audio');
        const btnSpectrum = document.getElementById('btn-spectrum');
        const patternSelect = document.getElementById('pattern-select');
        const speedSlider = document.getElementById('speed-slider');
        const sensitivitySlider = document.getElementById('sensitivity-slider');
        const audioStatus = document.getElementById('audio-status');
        const audioIndicator = document.getElementById('audio-indicator');
        const spectrum = document.getElementById('spectrum');
        
        let isPlaying = true;
        let controlsVisible = true;
        
        // Start the game
        game.reset('random');
        game.start();
        
        // Animation loop for audio-reactive colors
        function updateColors() {
            if (audioAnalyzer && audioAnalyzer.isActive()) {
                const audioData = audioAnalyzer.getFrequencyData();
                const sensitivity = sensitivitySlider.value / 50;
                const color = colorMapper.mapAudioToColor(audioData, sensitivity);
                game.setColor(color);
                
                // Draw spectrum
                if (!spectrum.classList.contains('hidden')) {
                    audioAnalyzer.drawSpectrum(spectrumCanvas);
                }
            }
            requestAnimationFrame(updateColors);
        }
        updateColors();
        
        // Event handlers
        btnPlayPause.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                game.start();
                document.getElementById('play-pause-icon').textContent = '⏸';
            } else {
                game.stop();
                document.getElementById('play-pause-icon').textContent = '▶';
            }
        });
        
        btnReset.addEventListener('click', () => {
            game.reset(patternSelect.value);
        });
        
        patternSelect.addEventListener('change', (e) => {
            game.reset(e.target.value);
        });
        
        speedSlider.addEventListener('input', (e) => {
            game.setFPS(parseInt(e.target.value));
        });
        
        btnAudio.addEventListener('click', async () => {
            if (!audioAnalyzer) {
                try {
                    audioAnalyzer = new AudioAnalyzer();
                    await audioAnalyzer.init();
                    btnAudio.classList.add('active');
                    audioIndicator.textContent = 'Audio Active';
                    audioStatus.classList.add('active');
                } catch (err) {
                    console.error('Failed to initialize audio:', err);
                    audioIndicator.textContent = 'Audio Failed';
                }
            } else {
                audioAnalyzer.stop();
                audioAnalyzer = null;
                btnAudio.classList.remove('active');
                audioIndicator.textContent = 'No Audio';
                audioStatus.classList.remove('active');
                game.setColor({ h: 0, s: 0, l: 100 }); // White when no audio
            }
        });
        
        btnSpectrum.addEventListener('click', () => {
            spectrum.classList.toggle('hidden');
            btnSpectrum.classList.toggle('active');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                btnPlayPause.click();
            } else if (e.code === 'KeyH' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                controlsVisible = !controlsVisible;
                controls.classList.toggle('hidden');
            } else if (e.code === 'KeyF' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            game.resize();
        });
        
        // NativePHP event listeners
        window.addEventListener('native:init', () => {
            console.log('NativePHP initialized');
            
            // Listen for audio data from native child process
            Native.on('App\\Events\\AudioDataReceived', (data) => {
                if (data.fft) {
                    const color = colorMapper.mapAudioToColor(data);
                    game.setColor(color);
                }
            });
        });
    </script>
</body>
</html>
