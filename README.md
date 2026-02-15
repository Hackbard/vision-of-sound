# Vision of Sound

Audio-reactive visual experiences for your desktop. Watch your music come alive.

## Experiences

### Game of Life
Conway's cellular automaton that reacts to audio frequencies.
- 16 classic patterns (Gliders, Spaceships, Oscillators, Methuselahs, Guns)
- Adjustable resolution (2-16px cell size)
- Spaceships fly in random directions

### Fractals
Deep zoom into mathematical infinity.
- **Mandelbrot** - Endless zoom into the famous fractal
- **Julia Set** - Dynamic Julia set with audio-reactive parameters
- **Tunnel** - Fly through a fractal wormhole
- **Starfield** - Hyperspace warp through stars

### Kaleidoscope
Mesmerizing symmetrical patterns.
- **Geometric** - Bouncing shapes with reflections
- **Particles** - Orbiting glowing particles
- **Waves** - Flowing sine waves
- **Mandala** - Rotating ring patterns
- **Flower** - Petal formations

### Oscilloscope
Classic audio visualization.
- **Waveform** - Real-time audio wave display
- **Spectrum** - Frequency bar analyzer
- **Circular** - Radial frequency visualization
- **Lissajous** - X/Y audio plotting
- **Bars** - Mirrored frequency bars

## Quick Start

```bash
# Install dependencies
composer install && npm install

# Setup environment
cp .env.example .env && php artisan key:generate

# Build and run
npm run build && php artisan serve
```

Open http://localhost:8000

**[Full Setup Guide →](QUICKSTART.md)**

## Audio Setup (macOS)

To visualize system audio (Spotify, browsers, etc.), install [BlackHole](https://existential.audio/blackhole/) and create a Multi-Output Device combining your speakers with BlackHole. Then select BlackHole as input in the app.

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

## Tech Stack

- **Backend:** Laravel 11 + PHP 8.2
- **Frontend:** Vanilla JS + Canvas API
- **Audio:** Web Audio API
- **Build:** Vite
- **Desktop:** NativePHP (optional)

## Controls

| Key | Action |
|-----|--------|
| `Space` | Pause/Resume |
| `⌘H` | Toggle sidebar |
| `⌘F` | Fullscreen |

## Development Costs

### Claude Opus 4.5 Pricing

| Type | Price per 1M Tokens |
|------|---------------------|
| Input | $15.00 |
| Output | $75.00 |
| Cache Write | $18.75 |
| Cache Read | $1.50 |

### Session Costs (Example)

| Category | Tokens | Cost |
|----------|--------|------|
| Input | 640 | $0.0096 |
| Output | 85,500 | $6.4125 |
| Cache Creation | 347,300 | $6.5119 |
| Cache Read | 7,000,000 | $10.50 |
| **Total** | | **~$23.43** |

Cache Reads machen den größten Teil aus - das ist normal bei längeren Conversations, weil der Kontext immer wieder geladen wird. Cache Reads sind aber deutlich günstiger als normale Inputs ($1.50 vs $15 pro 1M Tokens), daher ist das Caching-System sehr effizient für längere Sessions.

Der Output ist auch signifikant, was daran liegt, dass wir in dieser Session umfangreiche Code-Generierung und Dokumentation gemacht haben.

## License

MIT
