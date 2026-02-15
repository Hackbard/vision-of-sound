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
        
        /* Sidebar */
        #sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
            z-index: 100;
            transform: translateX(0);
            transition: transform 0.3s ease;
            overflow-y: auto;
        }
        
        #sidebar.hidden {
            transform: translateX(-100%);
        }
        
        #sidebar-toggle {
            position: fixed;
            top: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            z-index: 101;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        #sidebar-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        #sidebar:not(.hidden) ~ #sidebar-toggle {
            left: 300px;
        }
        
        .sidebar-section {
            margin-bottom: 25px;
        }
        
        .sidebar-section h3 {
            color: #666;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .control-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        
        .control-label {
            color: #aaa;
            font-size: 13px;
        }
        
        .button-group {
            display: flex;
            gap: 8px;
        }
        
        button {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 8px 14px;
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
        
        button.large {
            width: 100%;
            padding: 12px;
            font-size: 16px;
        }
        
        input[type="range"] {
            -webkit-appearance: none;
            width: 120px;
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
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            width: 100%;
        }
        
        select option {
            background: #222;
            color: #fff;
        }
        
        select optgroup {
            background: #333;
            color: #888;
        }
        
        #audio-status {
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            color: #666;
            font-size: 12px;
            text-align: center;
            margin-top: 10px;
        }
        
        #audio-status.active {
            color: #4f4;
            background: rgba(68, 255, 68, 0.1);
        }
        
        /* Volume Meter */
        #volume-meter {
            margin-top: 10px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
        }
        
        #volume-meter.hidden {
            display: none;
        }
        
        .meter-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
        }
        
        .meter-row:last-child {
            margin-bottom: 0;
        }
        
        .meter-label {
            color: #666;
            font-size: 10px;
            width: 35px;
            text-transform: uppercase;
        }
        
        .meter-bar {
            flex: 1;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .meter-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.05s ease-out;
        }
        
        .meter-fill.bass { background: linear-gradient(90deg, #ff4444, #ff8800); }
        .meter-fill.mid { background: linear-gradient(90deg, #44ff44, #88ff00); }
        .meter-fill.high { background: linear-gradient(90deg, #4444ff, #00ffff); }
        .meter-fill.volume { background: linear-gradient(90deg, #888, #fff); }
        
        #spectrum {
            width: 100%;
            height: 60px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 6px;
            overflow: hidden;
            margin-top: 10px;
        }
        
        #spectrum.hidden {
            display: none;
        }
        
        #spectrum-canvas {
            width: 100%;
            height: 100%;
        }
        
        /* Keyboard hints */
        .hint {
            color: #444;
            font-size: 10px;
            margin-top: 15px;
            text-align: center;
        }
        
        .hint kbd {
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 6px;
            border-radius: 3px;
            margin: 0 2px;
        }
    </style>
</head>
<body>
    <div id="canvas-container">
        <canvas id="game-canvas"></canvas>
    </div>
    
    <button id="sidebar-toggle">☰</button>
    
    <div id="sidebar">
        <div class="sidebar-section">
            <h3>Playback</h3>
            <div class="button-group">
                <button id="btn-play-pause" style="flex:1" title="Space">
                    <span id="play-pause-icon">⏸</span> Pause
                </button>
                <button id="btn-reset" title="Reset">↻</button>
            </div>
        </div>
        
        <div class="sidebar-section">
            <h3>Pattern</h3>
            <select id="pattern-select">
                <option value="random">Random</option>
                <option value="glider">Glider</option>
                <option value="pulsar">Pulsar</option>
                <option value="glider-gun">Glider Gun</option>
                <option value="blinker">Blinker</option>
                <option value="beacon">Beacon</option>
            </select>
        </div>
        
        <div class="sidebar-section">
            <h3>Simulation</h3>
            <div class="control-row">
                <span class="control-label">Speed</span>
                <input type="range" id="speed-slider" min="5" max="60" value="20">
            </div>
            <div class="control-row">
                <span class="control-label">Min Life %</span>
                <input type="range" id="threshold-slider" min="0.1" max="5" step="0.1" value="0.5">
            </div>
        </div>
        
        <div class="sidebar-section">
            <h3>Colors</h3>
            <select id="color-preset-select">
                <optgroup label="Dynamic">
                    <option value="spectrum">🌈 Spectrum</option>
                    <option value="rainbow">🎨 Rainbow</option>
                    <option value="aurora">🌌 Aurora</option>
                </optgroup>
                <optgroup label="Themed">
                    <option value="fire">🔥 Fire</option>
                    <option value="matrix">💚 Matrix</option>
                    <option value="neon">💜 Neon</option>
                    <option value="ocean">🌊 Ocean</option>
                    <option value="vapor">✨ Vaporwave</option>
                </optgroup>
                <optgroup label="Classic">
                    <option value="energetic">Energetic</option>
                    <option value="psychedelic">Psychedelic</option>
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                    <option value="calm">Calm</option>
                </optgroup>
            </select>
            <div class="control-row" style="margin-top: 12px">
                <span class="control-label">Sensitivity</span>
                <input type="range" id="sensitivity-slider" min="0" max="100" value="50">
            </div>
        </div>
        
        <div class="sidebar-section">
            <h3>Audio Input</h3>
            <select id="audio-device-select">
                <option value="">Select Device...</option>
            </select>
            <button id="btn-audio" class="large" style="margin-top: 10px">🎤 Enable Audio</button>
            <div id="audio-status">
                <span id="audio-indicator">No Audio</span>
            </div>
            <div id="volume-meter" class="hidden">
                <div class="meter-row">
                    <span class="meter-label">Vol</span>
                    <div class="meter-bar"><div class="meter-fill volume" id="meter-volume"></div></div>
                </div>
                <div class="meter-row">
                    <span class="meter-label">Bass</span>
                    <div class="meter-bar"><div class="meter-fill bass" id="meter-bass"></div></div>
                </div>
                <div class="meter-row">
                    <span class="meter-label">Mid</span>
                    <div class="meter-bar"><div class="meter-fill mid" id="meter-mid"></div></div>
                </div>
                <div class="meter-row">
                    <span class="meter-label">High</span>
                    <div class="meter-bar"><div class="meter-fill high" id="meter-high"></div></div>
                </div>
            </div>
            <button id="btn-spectrum" style="width: 100%; margin-top: 10px">📊 Toggle Spectrum</button>
            <div id="spectrum" class="hidden">
                <canvas id="spectrum-canvas"></canvas>
            </div>
        </div>
        
        <div class="hint">
            <kbd>Space</kbd> Pause &nbsp; <kbd>⌘H</kbd> Hide Panel
        </div>
    </div>

    <script type="module">
        import { GameOfLife } from '/js/game-of-life.js';
        import { AudioAnalyzer } from '/js/audio-analyzer.js';
        import { ColorMapper } from '/js/color-mapper.js';
        
        const canvas = document.getElementById('game-canvas');
        const spectrumCanvas = document.getElementById('spectrum-canvas');
        
        const game = new GameOfLife(canvas, {
            cellSize: 8,
            fps: 20
        });
        
        const colorMapper = new ColorMapper();
        let audioAnalyzer = null;
        
        // UI Elements
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const btnPlayPause = document.getElementById('btn-play-pause');
        const btnReset = document.getElementById('btn-reset');
        const btnAudio = document.getElementById('btn-audio');
        const btnSpectrum = document.getElementById('btn-spectrum');
        const patternSelect = document.getElementById('pattern-select');
        const speedSlider = document.getElementById('speed-slider');
        const sensitivitySlider = document.getElementById('sensitivity-slider');
        const thresholdSlider = document.getElementById('threshold-slider');
        const colorPresetSelect = document.getElementById('color-preset-select');
        const audioStatus = document.getElementById('audio-status');
        const audioIndicator = document.getElementById('audio-indicator');
        const spectrum = document.getElementById('spectrum');
        const audioDeviceSelect = document.getElementById('audio-device-select');
        const volumeMeter = document.getElementById('volume-meter');
        const meterVolume = document.getElementById('meter-volume');
        const meterBass = document.getElementById('meter-bass');
        const meterMid = document.getElementById('meter-mid');
        const meterHigh = document.getElementById('meter-high');
        
        let isPlaying = true;
        let selectedDeviceId = localStorage.getItem('selectedAudioDevice') || null;
        
        // Sidebar toggle
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            sidebarToggle.textContent = sidebar.classList.contains('hidden') ? '☰' : '✕';
        });
        
        // Load audio devices
        async function loadAudioDevices() {
            try {
                const devices = await AudioAnalyzer.getAudioDevices();
                audioDeviceSelect.innerHTML = '<option value="">Select Device...</option>';
                
                devices.forEach(device => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.textContent = device.label || `Device ${device.deviceId.slice(0, 8)}`;
                    
                    if (device.label.toLowerCase().includes('blackhole')) {
                        option.textContent = '🎵 ' + option.textContent;
                    }
                    
                    if (device.deviceId === selectedDeviceId) {
                        option.selected = true;
                    }
                    
                    audioDeviceSelect.appendChild(option);
                });
                
                if (!selectedDeviceId) {
                    const blackhole = await AudioAnalyzer.findBlackHoleDevice();
                    if (blackhole) {
                        audioDeviceSelect.value = blackhole.deviceId;
                        selectedDeviceId = blackhole.deviceId;
                        localStorage.setItem('selectedAudioDevice', selectedDeviceId);
                    }
                }
            } catch (err) {
                console.error('Failed to load audio devices:', err);
            }
        }
        
        loadAudioDevices();
        
        audioDeviceSelect.addEventListener('change', async (e) => {
            selectedDeviceId = e.target.value || null;
            localStorage.setItem('selectedAudioDevice', selectedDeviceId || '');
            
            if (audioAnalyzer) {
                audioAnalyzer.stop();
                audioAnalyzer = null;
                btnAudio.classList.remove('active');
                btnAudio.innerHTML = '🎤 Enable Audio';
                
                if (selectedDeviceId) {
                    btnAudio.click();
                }
            }
        });
        
        // Start the game
        game.reset('random');
        game.start();
        
        // Animation loop
        function updateColors() {
            if (audioAnalyzer && audioAnalyzer.isActive()) {
                const audioData = audioAnalyzer.getFrequencyData();
                const sensitivity = sensitivitySlider.value / 50;
                const color = colorMapper.mapAudioToColor(audioData, sensitivity);
                game.setColor(color);
                
                // Update volume meters
                meterVolume.style.width = `${Math.min(100, audioData.rms * 200)}%`;
                meterBass.style.width = `${Math.min(100, audioData.bass * 100)}%`;
                meterMid.style.width = `${Math.min(100, audioData.mid * 100)}%`;
                meterHigh.style.width = `${Math.min(100, audioData.high * 100)}%`;
                
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
                btnPlayPause.innerHTML = '<span id="play-pause-icon">⏸</span> Pause';
            } else {
                game.stop();
                btnPlayPause.innerHTML = '<span id="play-pause-icon">▶</span> Play';
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
        
        thresholdSlider.addEventListener('input', (e) => {
            game.setMinLifeThreshold(parseFloat(e.target.value));
        });
        
        colorPresetSelect.addEventListener('change', (e) => {
            colorMapper.setPreset(e.target.value);
        });
        
        btnAudio.addEventListener('click', async () => {
            if (!audioAnalyzer) {
                try {
                    audioAnalyzer = new AudioAnalyzer();
                    await audioAnalyzer.init(selectedDeviceId);
                    btnAudio.classList.add('active');
                    btnAudio.innerHTML = '🎤 Audio Active';
                    volumeMeter.classList.remove('hidden');
                    
                    const deviceName = audioDeviceSelect.selectedOptions[0]?.textContent || 'Audio';
                    audioIndicator.textContent = deviceName.length > 25 
                        ? deviceName.slice(0, 25) + '...' 
                        : deviceName;
                    audioStatus.classList.add('active');
                } catch (err) {
                    console.error('Failed to initialize audio:', err);
                    audioIndicator.textContent = 'Audio Failed: ' + err.message;
                }
            } else {
                audioAnalyzer.stop();
                audioAnalyzer = null;
                btnAudio.classList.remove('active');
                btnAudio.innerHTML = '🎤 Enable Audio';
                audioIndicator.textContent = 'No Audio';
                audioStatus.classList.remove('active');
                volumeMeter.classList.add('hidden');
                game.setColor({ h: 0, s: 0, l: 100 });
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
                sidebarToggle.click();
            } else if (e.code === 'KeyF' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
        });
        
        window.addEventListener('resize', () => {
            game.resize();
        });
    </script>
</body>
</html>
