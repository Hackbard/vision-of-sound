<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fractals | Vision of Sound</title>
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
        
        #fractal-canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
        
        #back-btn {
            position: fixed;
            top: 20px;
            left: 300px;
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            z-index: 102;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        
        #back-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 0, 255, 0.5);
            color: #f0f;
        }
        
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
            left: 350px;
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
            background: rgba(255, 0, 255, 0.3);
            border-color: rgba(255, 0, 255, 0.6);
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
        
        .mode-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        
        .mode-buttons button {
            padding: 12px 8px;
            font-size: 12px;
        }
        
        .mode-buttons button.full-width {
            grid-column: 1 / -1;
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
            color: #f0f;
            background: rgba(255, 0, 255, 0.1);
        }
        
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
        
        .meter-fill.bass { background: linear-gradient(90deg, #ff00ff, #ff00aa); }
        .meter-fill.mid { background: linear-gradient(90deg, #aa00ff, #ff00ff); }
        .meter-fill.high { background: linear-gradient(90deg, #00ffff, #00aaff); }
        .meter-fill.volume { background: linear-gradient(90deg, #888, #fff); }
        
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
        <canvas id="fractal-canvas"></canvas>
    </div>
    
    <a href="/" id="back-btn" title="Back to Dashboard">←</a>
    <button id="sidebar-toggle">☰</button>
    
    <div id="sidebar">
        <div class="sidebar-section">
            <h3>Mode</h3>
            <div class="mode-buttons">
                <button id="btn-mandelbrot" class="active">Mandelbrot</button>
                <button id="btn-julia">Julia Set</button>
                <button id="btn-tunnel">Tunnel</button>
                <button id="btn-starfield">Starfield</button>
                <button id="btn-warp" class="full-width">🚀 Toggle Warp</button>
            </div>
        </div>
        
        <div class="sidebar-section">
            <h3>Visuals</h3>
            <div class="control-row">
                <span class="control-label">Speed</span>
                <input type="range" id="speed-slider" min="0.1" max="3" step="0.1" value="1">
            </div>
        </div>
        
        <div class="sidebar-section">
            <h3>Colors</h3>
            <select id="color-preset">
                <option value="spectrum">🌈 Spectrum</option>
                <option value="cosmic">🌌 Cosmic</option>
                <option value="fire">🔥 Fire</option>
                <option value="ocean">🌊 Ocean</option>
                <option value="matrix">💚 Matrix</option>
                <option value="neon">💜 Neon</option>
            </select>
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
        </div>
        
        <div class="hint">
            <kbd>Space</kbd> Pause &nbsp; <kbd>⌘H</kbd> Hide Panel
        </div>
    </div>

    <script type="module">
        import { FractalVisualizer } from '/js/fractal-visualizer.js';
        import { AudioAnalyzer } from '/js/audio-analyzer.js';
        
        const canvas = document.getElementById('fractal-canvas');
        const fractal = new FractalVisualizer(canvas);
        
        let audioAnalyzer = null;
        
        // UI Elements
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const backBtn = document.getElementById('back-btn');
        const btnMandelbrot = document.getElementById('btn-mandelbrot');
        const btnJulia = document.getElementById('btn-julia');
        const btnTunnel = document.getElementById('btn-tunnel');
        const btnStarfield = document.getElementById('btn-starfield');
        const btnWarp = document.getElementById('btn-warp');
        const btnAudio = document.getElementById('btn-audio');
        const speedSlider = document.getElementById('speed-slider');
        const colorPreset = document.getElementById('color-preset');
        const audioDeviceSelect = document.getElementById('audio-device-select');
        const audioStatus = document.getElementById('audio-status');
        const audioIndicator = document.getElementById('audio-indicator');
        const volumeMeter = document.getElementById('volume-meter');
        const meterVolume = document.getElementById('meter-volume');
        const meterBass = document.getElementById('meter-bass');
        const meterMid = document.getElementById('meter-mid');
        const meterHigh = document.getElementById('meter-high');
        
        let selectedDeviceId = localStorage.getItem('selectedAudioDevice') || null;
        let isPaused = false;
        
        // Sidebar toggle
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            const isHidden = sidebar.classList.contains('hidden');
            sidebarToggle.textContent = isHidden ? '☰' : '✕';
            backBtn.style.left = isHidden ? '20px' : '300px';
            sidebarToggle.style.left = isHidden ? '70px' : '350px';
        });
        
        // Mode buttons
        const modeButtons = [btnMandelbrot, btnJulia, btnTunnel, btnStarfield];
        
        function setMode(mode, activeBtn) {
            fractal.setMode(mode);
            modeButtons.forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }
        
        btnMandelbrot.addEventListener('click', () => setMode('mandelbrot', btnMandelbrot));
        btnJulia.addEventListener('click', () => setMode('julia', btnJulia));
        btnTunnel.addEventListener('click', () => setMode('tunnel', btnTunnel));
        btnStarfield.addEventListener('click', () => setMode('starfield', btnStarfield));
        
        btnWarp.addEventListener('click', () => {
            const isWarp = fractal.toggleWarp();
            btnWarp.classList.toggle('active', isWarp);
            btnWarp.textContent = isWarp ? '🚀 Warp Active!' : '🚀 Toggle Warp';
        });
        
        // Controls
        speedSlider.addEventListener('input', (e) => {
            fractal.setSpeed(parseFloat(e.target.value));
        });
        
        colorPreset.addEventListener('change', (e) => {
            fractal.setColorPreset(e.target.value);
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
            }
        });
        
        // Start
        fractal.start();
        
        // Audio update loop
        function updateAudio() {
            if (audioAnalyzer && audioAnalyzer.isActive()) {
                const audioData = audioAnalyzer.getFrequencyData();
                fractal.setAudioData(audioData);
                
                meterVolume.style.width = `${Math.min(100, audioData.rms * 200)}%`;
                meterBass.style.width = `${Math.min(100, audioData.bass * 100)}%`;
                meterMid.style.width = `${Math.min(100, audioData.mid * 100)}%`;
                meterHigh.style.width = `${Math.min(100, audioData.high * 100)}%`;
            }
            requestAnimationFrame(updateAudio);
        }
        updateAudio();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                isPaused = !isPaused;
                if (isPaused) {
                    fractal.stop();
                } else {
                    fractal.start();
                }
            } else if (e.code === 'KeyH' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                sidebarToggle.click();
            }
        });
    </script>
</body>
</html>
