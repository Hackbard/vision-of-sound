# Quick Start Guide

Get Vision of Sound running in under 2 minutes.

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vision-of-sound.git
cd vision-of-sound

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

## Running the App

### Option 1: Development Mode

```bash
# Terminal 1: Start Laravel
php artisan serve

# Terminal 2: Start Vite (for hot reload)
npm run dev
```

Open http://localhost:8000

### Option 2: Production Build

```bash
# Build assets
npm run build

# Start server
php artisan serve
```

## Audio Setup (macOS)

To react to system audio (Spotify, YouTube, etc.):

1. Install [BlackHole](https://existential.audio/blackhole/) (free virtual audio driver)
2. Open **Audio MIDI Setup** (Spotlight → "Audio MIDI Setup")
3. Click **+** → **Create Multi-Output Device**
4. Check both your speakers/headphones AND BlackHole
5. Set this Multi-Output as your system output
6. In Vision of Sound, select **BlackHole** as audio input

## Controls

| Key | Action |
|-----|--------|
| `Space` | Pause/Resume |
| `⌘H` | Toggle sidebar |
| `⌘F` | Fullscreen |

## Troubleshooting

**No audio visualization?**
- Make sure you clicked "Enable Audio" in the sidebar
- Check that BlackHole is selected as input device
- Verify audio is actually playing on your system

**Laggy at small cell sizes?**
- Increase cell size to 4px or higher
- Reduce simulation speed

**Can't see the app?**
- Clear browser cache
- Try a different browser (Chrome/Firefox recommended)
