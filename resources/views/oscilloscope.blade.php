<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oscilloscope | Vision of Sound</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            background: #000;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #canvas-container {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
        }
        
        #oscilloscope-canvas {
            display: block;
            width: 100%; height: 100%;
        }
        
        #back-btn {
            position: fixed;
            top: 20px; left: 300px;
            width: 40px; height: 40px;
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
            border-color: rgba(255, 200, 0, 0.5);
            color: #fc0;
        }
        
        #sidebar {
            position: fixed;
            top: 0; left: 0;
            width: 280px; height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(20px);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
            z-index: 100;
            transition: transform 0.3s ease;
            overflow-y: auto;
        }
        
        #sidebar.hidden { transform: translateX(-100%); }
        
        #sidebar-toggle {
            position: fixed;
            top: 20px; left: 350px;
            width: 40px; height: 40px;
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
        
        #sidebar-toggle:hover { background: rgba(255, 255, 255, 0.1); }
        
        .sidebar-section { margin-bottom: 25px; }
        
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
        
        .control-label { color: #aaa; font-size: 13px; }
        
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
            background: rgba(255, 200, 0, 0.3);
            border-color: rgba(255, 200, 0, 0.6);
        }
        
        button.large { width: 100%; padding: 12px; font-size: 16px; }
        
        input[type="range"] {
            -webkit-appearance: none;
            width: 100px; height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px; height: 14px;
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
        
        select option { background: #222; color: #fff; }
        
        .mode-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        
        .mode-buttons button { padding: 10px 8px; font-size: 11px; }
        
        .toggle-row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .toggle-row button {
            flex: 1;
            min-width: 70px;
            padding: 8px 10px;
            font-size: 11px;
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
            color: #fc0;
            background: rgba(255, 200, 0, 0.1);
        }
        
        #volume-meter {
            margin-top: 10px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
        }
        
        #volume-meter.hidden { display: none; }
        
        .meter-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
        }
        
        .meter-row:last-child { margin-bottom: 0; }
        
        .meter-label {
            color: #666;
            font-size: 10px;
            width: 35px;
            text-transform: uppercase;
        }
        
        .meter-bar {
            flex: 1; height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .meter-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.05s ease-out;
        }
        
        .meter-fill.bass { background: linear-gradient(90deg, #ff8800, #ffaa00); }
        .meter-fill.mid { background: linear-gradient(90deg, #ffcc00, #ffff00); }
        .meter-fill.high { background: linear-gradient(90deg, #aaff00, #00ff00); }
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
        }
    </style>
</head>
<body>
    <div id="canvas-container">
        <canvas id="oscilloscope-canvas"></canvas>
    </div>
    
    <a href="/" id="back-btn" title="Back to Dashboard">←</a>
    <button id="sidebar-toggle">☰</button>
    
    <div id="sidebar">
        <div class="sidebar-section">
            <h3>Display Mode</h3>
            <div class="mode-buttons">
                <button id="btn-waveform" class="active">Waveform</button>
                <button id="btn-spectrum">Spectrum</button>
                <button id="btn-circular">Circular</button>
                <button id="btn-lissajous">Lissajous</button>
                <button id="btn-bars">Bars</button>
            </div>
        </div>
        
        <div class="sidebar-section">
            <h3>Style</h3>
            <div class="control-row">
                <span class="control-label">Line Width</span>
                <input type="range" id="linewidth-slider" min="1" max="8" value="2">
            </div>
            <div class="toggle-row" style="margin-top: 10px">
                <button id="btn-glow" class="active">Glow</button>
                <button id="btn-mirror">Mirror</button>
                <button id="btn-filled">Filled</button>
            </div>
        </div>
        
        <div class="sidebar-section">
            <h3>Colors</h3>
            <select id="color-preset">
                <option value="spectrum">🌈 Spectrum</option>
                <option value="fire">🔥 Fire</option>
                <option value="ocean">🌊 Ocean</option>
                <option value="matrix">💚 Matrix</option>
                <option value="neon">💜 Neon</option>
                <option value="retro">📺 Retro</option>
                <option value="mono">⚪ Mono</option>
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
        import { Oscilloscope } from '/js/oscilloscope.js';
        import { AudioAnalyzer } from '/js/audio-analyzer.js';
        
        const canvas = document.getElementById('oscilloscope-canvas');
        const oscilloscope = new Oscilloscope(canvas);
        
        let audioAnalyzer = null;
        let isPaused = false;
        
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const backBtn = document.getElementById('back-btn');
        const linewidthSlider = document.getElementById('linewidth-slider');
        const colorPreset = document.getElementById('color-preset');
        const btnAudio = document.getElementById('btn-audio');
        const btnGlow = document.getElementById('btn-glow');
        const btnMirror = document.getElementById('btn-mirror');
        const btnFilled = document.getElementById('btn-filled');
        const audioDeviceSelect = document.getElementById('audio-device-select');
        const audioStatus = document.getElementById('audio-status');
        const audioIndicator = document.getElementById('audio-indicator');
        const volumeMeter = document.getElementById('volume-meter');
        
        let selectedDeviceId = localStorage.getItem('selectedAudioDevice') || null;
        
        // Sidebar toggle
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            const isHidden = sidebar.classList.contains('hidden');
            sidebarToggle.textContent = isHidden ? '☰' : '✕';
            backBtn.style.left = isHidden ? '20px' : '300px';
            sidebarToggle.style.left = isHidden ? '70px' : '350px';
        });
        
        // Mode buttons
        const modeBtns = {
            waveform: document.getElementById('btn-waveform'),
            spectrum: document.getElementById('btn-spectrum'),
            circular: document.getElementById('btn-circular'),
            lissajous: document.getElementById('btn-lissajous'),
            bars: document.getElementById('btn-bars')
        };
        
        Object.entries(modeBtns).forEach(([mode, btn]) => {
            btn.addEventListener('click', () => {
                Object.values(modeBtns).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                oscilloscope.setMode(mode);
            });
        });
        
        // Style toggles
        btnGlow.addEventListener('click', () => {
            btnGlow.classList.toggle('active');
            oscilloscope.setGlow(btnGlow.classList.contains('active'));
        });
        
        btnMirror.addEventListener('click', () => {
            btnMirror.classList.toggle('active');
            oscilloscope.setMirror(btnMirror.classList.contains('active'));
        });
        
        btnFilled.addEventListener('click', () => {
            btnFilled.classList.toggle('active');
            oscilloscope.setFilled(btnFilled.classList.contains('active'));
        });
        
        linewidthSlider.addEventListener('input', (e) => {
            oscilloscope.setLineWidth(parseInt(e.target.value));
        });
        
        colorPreset.addEventListener('change', (e) => {
            oscilloscope.setColorPreset(e.target.value);
        });
        
        // Audio
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
                    if (device.deviceId === selectedDeviceId) option.selected = true;
                    audioDeviceSelect.appendChild(option);
                });
            } catch (err) {
                console.error('Failed to load audio devices:', err);
            }
        }
        
        loadAudioDevices();
        
        audioDeviceSelect.addEventListener('change', (e) => {
            selectedDeviceId = e.target.value || null;
            localStorage.setItem('selectedAudioDevice', selectedDeviceId || '');
            if (audioAnalyzer) {
                audioAnalyzer.stop();
                audioAnalyzer = null;
                btnAudio.classList.remove('active');
                btnAudio.innerHTML = '🎤 Enable Audio';
                if (selectedDeviceId) btnAudio.click();
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
                    audioIndicator.textContent = deviceName.length > 25 ? deviceName.slice(0, 25) + '...' : deviceName;
                    audioStatus.classList.add('active');
                } catch (err) {
                    console.error('Failed to initialize audio:', err);
                    audioIndicator.textContent = 'Audio Failed';
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
        oscilloscope.start();
        
        function updateAudio() {
            if (audioAnalyzer && audioAnalyzer.isActive()) {
                const data = audioAnalyzer.getFrequencyData();
                const waveform = audioAnalyzer.getWaveformData();
                const frequency = audioAnalyzer.getRawFrequencyData();
                
                oscilloscope.setAudioData(data);
                oscilloscope.setWaveformData(waveform);
                oscilloscope.setFrequencyData(frequency);
                
                document.getElementById('meter-volume').style.width = `${Math.min(100, data.rms * 200)}%`;
                document.getElementById('meter-bass').style.width = `${Math.min(100, data.bass * 100)}%`;
                document.getElementById('meter-mid').style.width = `${Math.min(100, data.mid * 100)}%`;
                document.getElementById('meter-high').style.width = `${Math.min(100, data.high * 100)}%`;
            }
            requestAnimationFrame(updateAudio);
        }
        updateAudio();
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                window.location.href = '/';
            } else if (e.code === 'Space') {
                e.preventDefault();
                isPaused = !isPaused;
                isPaused ? oscilloscope.stop() : oscilloscope.start();
            } else if (e.code === 'KeyH' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                sidebarToggle.click();
            }
        });
    </script>
</body>
</html>
