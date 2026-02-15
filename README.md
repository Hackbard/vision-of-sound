# Vision of Sound

Audio-reactive visual experiences for your desktop. Watch your music come alive.

## Experiences

### Game of Life
Conway's cellular automaton that reacts to audio frequencies. Bass controls intensity, mids affect color saturation, and highs influence brightness.

**Features:**
- 16 classic patterns (Gliders, Spaceships, Oscillators, Methuselahs, Guns)
- Adjustable resolution (2-16px cell size)
- Multiple color presets (Spectrum, Fire, Matrix, Neon, and more)
- Auto-reset when patterns die out
- Spaceships fly in random directions

*More experiences coming soon...*

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

## License

MIT
