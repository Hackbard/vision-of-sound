<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vision of Sound</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #0a0a0f;
            min-height: 100vh;
            font-family: 'Rajdhani', sans-serif;
            overflow-x: hidden;
            color: #fff;
        }
        
        /* Animated grid background */
        .grid-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
            pointer-events: none;
        }
        
        @keyframes gridMove {
            0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
            100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
        }
        
        /* Scan line effect */
        .scanlines {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.1) 2px,
                rgba(0, 0, 0, 0.1) 4px
            );
            pointer-events: none;
            z-index: 1000;
        }
        
        /* Glow orbs */
        .orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.3;
            animation: float 10s ease-in-out infinite;
            pointer-events: none;
        }
        
        .orb-1 {
            width: 400px;
            height: 400px;
            background: #00ffff;
            top: -100px;
            left: -100px;
            animation-delay: 0s;
        }
        
        .orb-2 {
            width: 300px;
            height: 300px;
            background: #ff00ff;
            bottom: -50px;
            right: -50px;
            animation-delay: -5s;
        }
        
        .orb-3 {
            width: 200px;
            height: 200px;
            background: #00ff88;
            top: 50%;
            left: 50%;
            animation-delay: -2.5s;
        }
        
        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        /* Main content */
        .container {
            position: relative;
            z-index: 10;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }
        
        /* Logo/Title */
        .logo {
            text-align: center;
            margin-bottom: 60px;
        }
        
        .logo h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: clamp(2.5rem, 8vw, 5rem);
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            background: linear-gradient(135deg, #00ffff, #ff00ff, #00ff88);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 5s ease infinite;
            text-shadow: 0 0 40px rgba(0, 255, 255, 0.5);
            position: relative;
        }
        
        .logo h1::after {
            content: 'VISION OF SOUND';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(135deg, #00ffff, #ff00ff, #00ff88);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 5s ease infinite;
            filter: blur(20px);
            opacity: 0.5;
            z-index: -1;
        }
        
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .logo .subtitle {
            font-size: 1.1rem;
            letter-spacing: 0.5em;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 15px;
            text-transform: uppercase;
        }
        
        /* Cards grid */
        .experiences {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            max-width: 1200px;
            width: 100%;
        }
        
        .card {
            position: relative;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, 
                rgba(0, 255, 255, 0.1) 0%, 
                transparent 50%, 
                rgba(255, 0, 255, 0.1) 100%);
            opacity: 0;
            transition: opacity 0.4s;
        }
        
        .card:hover::before {
            opacity: 1;
        }
        
        .card:hover {
            transform: translateY(-10px) scale(1.02);
            border-color: rgba(0, 255, 255, 0.5);
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 30px rgba(0, 255, 255, 0.2),
                inset 0 0 30px rgba(0, 255, 255, 0.05);
        }
        
        .card-icon {
            width: 80px;
            height: 80px;
            margin-bottom: 25px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .card-icon svg {
            width: 100%;
            height: 100%;
            stroke: #00ffff;
            stroke-width: 1;
            fill: none;
            filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
            transition: all 0.4s;
        }
        
        .card:hover .card-icon svg {
            stroke: #ff00ff;
            filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.8));
            transform: scale(1.1);
        }
        
        .card h2 {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 15px;
            letter-spacing: 0.1em;
            position: relative;
        }
        
        .card p {
            color: rgba(255, 255, 255, 0.5);
            font-size: 1rem;
            line-height: 1.6;
            position: relative;
        }
        
        .card-tag {
            position: absolute;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ffff, #00ff88);
            color: #000;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 5px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .card-tag.coming-soon {
            background: linear-gradient(135deg, #444, #666);
            color: #aaa;
        }
        
        .card.disabled {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }
        
        /* Footer */
        .footer {
            margin-top: 80px;
            text-align: center;
            color: rgba(255, 255, 255, 0.2);
            font-size: 0.85rem;
            letter-spacing: 0.2em;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .logo h1 {
                letter-spacing: 0.1em;
            }
            
            .logo .subtitle {
                letter-spacing: 0.2em;
                font-size: 0.9rem;
            }
            
            .card {
                padding: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="grid-bg"></div>
    <div class="scanlines"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    
    <div class="container">
        <div class="logo">
            <h1>Vision of Sound</h1>
            <p class="subtitle">Audio Reactive Experiences</p>
        </div>
        
        <div class="experiences">
            <a href="/game-of-life" class="card">
                <span class="card-tag">Active</span>
                <div class="card-icon">
                    <svg viewBox="0 0 80 80">
                        <rect x="10" y="10" width="15" height="15" rx="2"/>
                        <rect x="30" y="10" width="15" height="15" rx="2"/>
                        <rect x="10" y="30" width="15" height="15" rx="2"/>
                        <rect x="30" y="30" width="15" height="15" rx="2"/>
                        <rect x="50" y="30" width="15" height="15" rx="2"/>
                        <rect x="30" y="50" width="15" height="15" rx="2"/>
                        <rect x="50" y="50" width="15" height="15" rx="2"/>
                        <rect x="55" y="10" width="10" height="10" rx="2"/>
                    </svg>
                </div>
                <h2>Game of Life</h2>
                <p>Conway's cellular automaton reacts to your music. Watch patterns evolve with bass, mids, and highs.</p>
            </a>
            
            <div class="card disabled">
                <span class="card-tag coming-soon">Coming Soon</span>
                <div class="card-icon">
                    <svg viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="30" />
                        <circle cx="40" cy="40" r="20" />
                        <circle cx="40" cy="40" r="10" />
                        <line x1="40" y1="5" x2="40" y2="15" />
                        <line x1="40" y1="65" x2="40" y2="75" />
                        <line x1="5" y1="40" x2="15" y2="40" />
                        <line x1="65" y1="40" x2="75" y2="40" />
                    </svg>
                </div>
                <h2>???</h2>
                <p>Next audio-reactive experience coming soon...</p>
            </div>
        </div>
        
        <div class="footer">
            <p>SELECT YOUR EXPERIENCE</p>
        </div>
    </div>
</body>
</html>
