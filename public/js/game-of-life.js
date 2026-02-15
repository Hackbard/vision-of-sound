export class GameOfLife {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = options.cellSize || 8;
        this.fps = options.fps || 20;
        this.running = false;
        this.animationId = null;
        this.lastFrameTime = 0;
        
        this.currentColor = { h: 0, s: 0, l: 100 };
        this.targetColor = { h: 0, s: 0, l: 100 };
        this.trailOpacity = 0.15;
        
        // Auto-reset settings
        this.autoReset = true;
        this.minLifeThreshold = 0.5; // Percentage (0-100 scale, so 0.5 = 0.5%)
        this.currentPattern = 'random';
        this.fadeOutAlpha = 1;
        this.isFadingOut = false;
        this.checkInterval = 30; // Check every N frames
        this.frameCount = 0;
        
        // Stagnation detection
        this.lastChanges = 0;
        this.stagnationFrames = 0;
        this.stagnationThreshold = 60; // Frames of no/low change before reset
        
        // Intro animation
        this.isIntroPlaying = false;
        this.introType = 'random'; // Will be randomly selected
        this.introProgress = 0;
        this.introSpeed = 0.035; // Speed of intro animation
        this.introCells = [];
        this.newCellGlow = new Map(); // Track glow for new cells
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
        
        this.cols = Math.floor(this.displayWidth / this.cellSize);
        this.rows = Math.floor(this.displayHeight / this.cellSize);
        
        this.offsetX = (this.displayWidth - this.cols * this.cellSize) / 2;
        this.offsetY = (this.displayHeight - this.rows * this.cellSize) / 2;
        
        if (this.grid) {
            const oldGrid = this.grid;
            this.initGrid();
            // Copy old grid data if possible
            const minRows = Math.min(oldGrid.length, this.rows);
            const minCols = Math.min(oldGrid[0]?.length || 0, this.cols);
            for (let y = 0; y < minRows; y++) {
                for (let x = 0; x < minCols; x++) {
                    this.grid[y][x] = oldGrid[y][x];
                }
            }
        } else {
            this.initGrid();
        }
    }
    
    initGrid() {
        this.grid = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(0)
        );
        this.trailGrid = Array(this.rows).fill(null).map(() =>
            Array(this.cols).fill(0)
        );
    }
    
    setAutoReset(enabled) {
        this.autoReset = enabled;
    }
    
    setMinLifeThreshold(percent) {
        this.minLifeThreshold = percent;
    }
    
    getLifePercentage() {
        let alive = 0;
        const total = this.rows * this.cols;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x]) alive++;
            }
        }
        return (alive / total) * 100;
    }
    
    startIntro(pattern) {
        this.initGrid();
        this.isIntroPlaying = true;
        this.introProgress = 0;
        this.introCells = [];
        this.currentPattern = pattern;
        
        // Select random intro type
        const introTypes = ['spiral', 'explosion', 'rain', 'waves', 'dna', 'corners'];
        this.introType = introTypes[Math.floor(Math.random() * introTypes.length)];
        
        // Pre-calculate cells for the intro based on pattern
        this.calculateIntroCells(pattern);
    }
    
    calculateIntroCells(pattern) {
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);
        const targetCells = [];
        
        // First, determine which cells should be alive
        if (pattern === 'random') {
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    if (Math.random() < 0.15) {
                        targetCells.push({ x, y });
                    }
                }
            }
        } else {
            // For patterns, calculate them first
            const tempGrid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
            this.grid = tempGrid;
            
            switch (pattern) {
                // Spaceships (random directions)
                case 'glider':
                    this.fillWithSpaceships(this.patterns.glider, 20, 15);
                    break;
                case 'lwss':
                    this.fillWithSpaceships(this.patterns.lwss, 25, 20);
                    break;
                case 'mwss':
                    this.fillWithSpaceships(this.patterns.mwss, 28, 22);
                    break;
                case 'hwss':
                    this.fillWithSpaceships(this.patterns.hwss, 30, 24);
                    break;
                // Oscillators
                case 'blinker':
                    this.fillWithPattern(this.patterns.blinker, 12, 10);
                    break;
                case 'toad':
                    this.fillWithPattern(this.patterns.toad, 15, 12);
                    break;
                case 'beacon':
                    this.fillWithPattern(this.patterns.beacon, 18, 15);
                    break;
                case 'pulsar':
                    this.fillWithPattern(this.patterns.pulsar, 35, 30);
                    break;
                case 'pentadecathlon':
                    this.fillWithPattern(this.patterns.pentadecathlon, 25, 20);
                    break;
                // Still Lifes
                case 'block':
                    this.fillWithPattern(this.patterns.block, 10, 10);
                    break;
                case 'beehive':
                    this.fillWithPattern(this.patterns.beehive, 15, 12);
                    break;
                case 'loaf':
                    this.fillWithPattern(this.patterns.loaf, 15, 14);
                    break;
                // Methuselahs (single instance centered)
                case 'r-pentomino':
                    this.placePattern(this.patterns.rPentomino, Math.floor(this.cols/2)-1, Math.floor(this.rows/2)-1);
                    break;
                case 'diehard':
                    this.placePattern(this.patterns.diehard, Math.floor(this.cols/2)-4, Math.floor(this.rows/2)-1);
                    break;
                case 'acorn':
                    this.placePattern(this.patterns.acorn, Math.floor(this.cols/2)-3, Math.floor(this.rows/2)-1);
                    break;
                // Guns
                case 'glider-gun':
                    this.fillWithPattern(this.patterns.gliderGun, 50, 20);
                    break;
            }
            
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    if (this.grid[y][x]) {
                        targetCells.push({ x, y });
                    }
                }
            }
            this.initGrid();
        }
        
        // Sort cells based on intro type
        switch (this.introType) {
            case 'spiral':
                targetCells.sort((a, b) => {
                    const angleA = Math.atan2(a.y - centerY, a.x - centerX);
                    const distA = Math.hypot(a.x - centerX, a.y - centerY);
                    const angleB = Math.atan2(b.y - centerY, b.x - centerX);
                    const distB = Math.hypot(b.x - centerX, b.y - centerY);
                    const spiralA = distA + angleA * 10;
                    const spiralB = distB + angleB * 10;
                    return spiralA - spiralB;
                });
                break;
                
            case 'explosion':
                targetCells.sort((a, b) => {
                    const distA = Math.hypot(a.x - centerX, a.y - centerY);
                    const distB = Math.hypot(b.x - centerX, b.y - centerY);
                    return distA - distB;
                });
                break;
                
            case 'rain':
                targetCells.sort((a, b) => {
                    return (a.y + Math.random() * 5) - (b.y + Math.random() * 5);
                });
                break;
                
            case 'waves':
                targetCells.sort((a, b) => {
                    const waveA = Math.sin(a.x * 0.2) * 10 + a.y;
                    const waveB = Math.sin(b.x * 0.2) * 10 + b.y;
                    return waveA - waveB;
                });
                break;
                
            case 'dna':
                targetCells.sort((a, b) => {
                    const helixA = a.y + Math.sin(a.y * 0.3) * (a.x - centerX);
                    const helixB = b.y + Math.sin(b.y * 0.3) * (b.x - centerX);
                    return helixA - helixB;
                });
                break;
                
            case 'corners':
                targetCells.sort((a, b) => {
                    const corners = [
                        { x: 0, y: 0 },
                        { x: this.cols, y: 0 },
                        { x: 0, y: this.rows },
                        { x: this.cols, y: this.rows }
                    ];
                    const nearestA = Math.min(...corners.map(c => Math.hypot(a.x - c.x, a.y - c.y)));
                    const nearestB = Math.min(...corners.map(c => Math.hypot(b.x - c.x, b.y - c.y)));
                    return nearestA - nearestB;
                });
                break;
        }
        
        this.introCells = targetCells;
    }
    
    updateIntro() {
        const prevCells = Math.floor(this.introProgress * this.introCells.length);
        this.introProgress += this.introSpeed;
        const cellsToPlace = Math.floor(this.introProgress * this.introCells.length);
        
        // Place new cells and add glow
        for (let i = prevCells; i < cellsToPlace && i < this.introCells.length; i++) {
            const cell = this.introCells[i];
            this.grid[cell.y][cell.x] = 1;
            this.newCellGlow.set(`${cell.x},${cell.y}`, 1.0);
        }
        
        // Fade out glow
        for (const [key, glow] of this.newCellGlow) {
            const newGlow = glow - 0.05;
            if (newGlow <= 0) {
                this.newCellGlow.delete(key);
            } else {
                this.newCellGlow.set(key, newGlow);
            }
        }
        
        if (this.introProgress >= 1) {
            this.isIntroPlaying = false;
            this.introCells = [];
            this.newCellGlow.clear();
        }
    }
    
    reset(pattern = 'random', skipIntro = false) {
        this.currentPattern = pattern;
        this.fadeOutAlpha = 1;
        this.isFadingOut = false;
        this.stagnationFrames = 0;
        this.lastChanges = 0;
        
        if (skipIntro) {
            this.isIntroPlaying = false;
            this.initGrid();
            
            switch (pattern) {
                case 'random':
                    this.randomize(0.15);
                    break;
                // Spaceships (random directions)
                case 'glider':
                    this.fillWithSpaceships(this.patterns.glider, 20, 15);
                    break;
                case 'lwss':
                    this.fillWithSpaceships(this.patterns.lwss, 25, 20);
                    break;
                case 'mwss':
                    this.fillWithSpaceships(this.patterns.mwss, 28, 22);
                    break;
                case 'hwss':
                    this.fillWithSpaceships(this.patterns.hwss, 30, 24);
                    break;
                // Oscillators
                case 'blinker':
                    this.fillWithPattern(this.patterns.blinker, 12, 10);
                    break;
                case 'toad':
                    this.fillWithPattern(this.patterns.toad, 15, 12);
                    break;
                case 'beacon':
                    this.fillWithPattern(this.patterns.beacon, 18, 15);
                    break;
                case 'pulsar':
                    this.fillWithPattern(this.patterns.pulsar, 35, 30);
                    break;
                case 'pentadecathlon':
                    this.fillWithPattern(this.patterns.pentadecathlon, 25, 20);
                    break;
                // Still Lifes
                case 'block':
                    this.fillWithPattern(this.patterns.block, 10, 10);
                    break;
                case 'beehive':
                    this.fillWithPattern(this.patterns.beehive, 15, 12);
                    break;
                case 'loaf':
                    this.fillWithPattern(this.patterns.loaf, 15, 14);
                    break;
                // Methuselahs (single instance centered)
                case 'r-pentomino':
                    this.placePattern(this.patterns.rPentomino, Math.floor(this.cols/2)-1, Math.floor(this.rows/2)-1);
                    break;
                case 'diehard':
                    this.placePattern(this.patterns.diehard, Math.floor(this.cols/2)-4, Math.floor(this.rows/2)-1);
                    break;
                case 'acorn':
                    this.placePattern(this.patterns.acorn, Math.floor(this.cols/2)-3, Math.floor(this.rows/2)-1);
                    break;
                // Guns
                case 'glider-gun':
                    this.fillWithPattern(this.patterns.gliderGun, 50, 20);
                    break;
                default:
                    this.randomize(0.15);
            }
        } else {
            this.startIntro(pattern);
        }
    }
    
    rotatePattern90(pattern) {
        const rows = pattern.length;
        const cols = pattern[0].length;
        const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = pattern[y][x];
            }
        }
        return rotated;
    }
    
    flipPatternH(pattern) {
        return pattern.map(row => [...row].reverse());
    }
    
    flipPatternV(pattern) {
        return [...pattern].reverse();
    }
    
    transformPattern(pattern, direction) {
        // direction: 0=original, 1=90°, 2=180°, 3=270°, 4-7=flipped versions
        let p = pattern;
        const rotation = direction % 4;
        const flip = direction >= 4;
        
        for (let i = 0; i < rotation; i++) {
            p = this.rotatePattern90(p);
        }
        if (flip) {
            p = this.flipPatternH(p);
        }
        return p;
    }
    
    fillWithPattern(pattern, spacingX, spacingY) {
        const patternWidth = pattern[0]?.length || 1;
        const patternHeight = pattern.length;
        
        // Calculate how many patterns fit
        const countX = Math.floor(this.cols / spacingX);
        const countY = Math.floor(this.rows / spacingY);
        
        // Center the grid of patterns
        const totalWidth = countX * spacingX;
        const totalHeight = countY * spacingY;
        const offsetX = Math.floor((this.cols - totalWidth) / 2) + Math.floor((spacingX - patternWidth) / 2);
        const offsetY = Math.floor((this.rows - totalHeight) / 2) + Math.floor((spacingY - patternHeight) / 2);
        
        for (let gy = 0; gy < countY; gy++) {
            for (let gx = 0; gx < countX; gx++) {
                const x = offsetX + gx * spacingX;
                const y = offsetY + gy * spacingY;
                this.placePattern(pattern, x, y);
            }
        }
    }
    
    fillWithSpaceships(pattern, spacingX, spacingY) {
        // Calculate how many patterns fit
        const countX = Math.floor(this.cols / spacingX);
        const countY = Math.floor(this.rows / spacingY);
        
        // Center the grid of patterns
        const totalWidth = countX * spacingX;
        const totalHeight = countY * spacingY;
        const baseOffsetX = Math.floor((this.cols - totalWidth) / 2);
        const baseOffsetY = Math.floor((this.rows - totalHeight) / 2);
        
        for (let gy = 0; gy < countY; gy++) {
            for (let gx = 0; gx < countX; gx++) {
                // Random direction for each spaceship (0-7 = 8 possible orientations)
                const direction = Math.floor(Math.random() * 8);
                const transformed = this.transformPattern(pattern, direction);
                
                const patternWidth = transformed[0]?.length || 1;
                const patternHeight = transformed.length;
                const offsetX = Math.floor((spacingX - patternWidth) / 2);
                const offsetY = Math.floor((spacingY - patternHeight) / 2);
                
                const x = baseOffsetX + gx * spacingX + offsetX;
                const y = baseOffsetY + gy * spacingY + offsetY;
                this.placePattern(transformed, x, y);
            }
        }
    }
    
    randomize(density = 0.15) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = Math.random() < density ? 1 : 0;
            }
        }
    }
    
    placePattern(pattern, startX, startY) {
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                const gridX = startX + x;
                const gridY = startY + y;
                if (gridX >= 0 && gridX < this.cols && gridY >= 0 && gridY < this.rows) {
                    this.grid[gridY][gridX] = pattern[y][x];
                }
            }
        }
    }
    
    patterns = {
        // Spaceships
        glider: [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1]
        ],
        lwss: [
            [0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 0]
        ],
        mwss: [
            [0, 0, 1, 0, 0, 0],
            [0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 0]
        ],
        hwss: [
            [0, 0, 1, 1, 0, 0, 0],
            [0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0]
        ],
        // Oscillators
        blinker: [
            [1, 1, 1]
        ],
        toad: [
            [0, 1, 1, 1],
            [1, 1, 1, 0]
        ],
        beacon: [
            [1, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 1, 1],
            [0, 0, 1, 1]
        ],
        pulsar: [
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,1,1,1,0,0]
        ],
        pentadecathlon: [
            [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
            [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
            [0, 0, 1, 0, 0, 0, 0, 1, 0, 0]
        ],
        // Still Lifes
        block: [
            [1, 1],
            [1, 1]
        ],
        beehive: [
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [0, 1, 1, 0]
        ],
        loaf: [
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [0, 1, 0, 1],
            [0, 0, 1, 0]
        ],
        // Methuselahs
        rPentomino: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 1, 0]
        ],
        diehard: [
            [0, 0, 0, 0, 0, 0, 1, 0],
            [1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 1, 1, 1]
        ],
        acorn: [
            [0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0],
            [1, 1, 0, 0, 1, 1, 1]
        ],
        // Guns
        gliderGun: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ]
    };
    
    countNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = (x + dx + this.cols) % this.cols;
                const ny = (y + dy + this.rows) % this.rows;
                count += this.grid[ny][nx];
            }
        }
        return count;
    }
    
    step() {
        const newGrid = Array(this.rows).fill(null).map(() => 
            Array(this.cols).fill(0)
        );
        
        let changes = 0;
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const neighbors = this.countNeighbors(x, y);
                const alive = this.grid[y][x];
                
                if (alive) {
                    // Cell survives with 2 or 3 neighbors
                    newGrid[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                    // Update trail
                    if (newGrid[y][x] === 0) {
                        this.trailGrid[y][x] = 1;
                    }
                } else {
                    // Cell is born with exactly 3 neighbors
                    newGrid[y][x] = neighbors === 3 ? 1 : 0;
                }
                
                // Count state changes
                if (newGrid[y][x] !== this.grid[y][x]) {
                    changes++;
                }
                
                // Fade trail
                if (this.trailGrid[y][x] > 0) {
                    this.trailGrid[y][x] *= 0.85;
                    if (this.trailGrid[y][x] < 0.05) {
                        this.trailGrid[y][x] = 0;
                    }
                }
            }
        }
        
        // Track stagnation
        this.lastChanges = changes;
        if (changes < 5) {
            this.stagnationFrames++;
        } else {
            this.stagnationFrames = 0;
        }
        
        this.grid = newGrid;
    }
    
    setColor(color) {
        this.targetColor = color;
    }
    
    lerpColor() {
        const lerp = (a, b, t) => a + (b - a) * t;
        const t = 0.1; // Smoothing factor
        
        this.currentColor.h = lerp(this.currentColor.h, this.targetColor.h, t);
        this.currentColor.s = lerp(this.currentColor.s, this.targetColor.s, t);
        this.currentColor.l = lerp(this.currentColor.l, this.targetColor.l, t);
    }
    
    render() {
        this.lerpColor();
        
        // Clear with black
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        
        const { h, s, l } = this.currentColor;
        const alpha = this.fadeOutAlpha;
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const px = this.offsetX + x * this.cellSize;
                const py = this.offsetY + y * this.cellSize;
                
                if (this.grid[y][x]) {
                    const glowKey = `${x},${y}`;
                    const glow = this.newCellGlow.get(glowKey) || 0;
                    
                    if (glow > 0 && this.isIntroPlaying) {
                        // Glowing new cell during intro
                        const glowSize = this.cellSize * (1 + glow * 0.5);
                        const glowOffset = (glowSize - this.cellSize) / 2;
                        const glowL = Math.min(100, l + glow * 30);
                        
                        // Outer glow
                        this.ctx.fillStyle = `hsla(${h}, ${s}%, ${glowL}%, ${glow * 0.3 * alpha})`;
                        this.ctx.fillRect(px - glowOffset, py - glowOffset, glowSize, glowSize);
                    }
                    
                    // Living cell - full color with fade
                    this.ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
                    this.ctx.fillRect(px, py, this.cellSize - 1, this.cellSize - 1);
                } else if (this.trailGrid[y][x] > 0) {
                    // Trail effect - faded color
                    const trailL = l * this.trailGrid[y][x] * 0.5;
                    const trailS = s * this.trailGrid[y][x];
                    this.ctx.fillStyle = `hsla(${h}, ${trailS}%, ${trailL}%, ${alpha})`;
                    this.ctx.fillRect(px, py, this.cellSize - 1, this.cellSize - 1);
                }
            }
        }
    }
    
    loop(timestamp) {
        if (!this.running) return;
        
        const frameInterval = 1000 / this.fps;
        const elapsed = timestamp - this.lastFrameTime;
        
        if (elapsed >= frameInterval) {
            if (this.isFadingOut) {
                this.fadeOutAlpha -= 0.05;
                if (this.fadeOutAlpha <= 0) {
                    this.fadeOutAlpha = 0;
                    this.isFadingOut = false;
                    this.reset(this.currentPattern);
                }
            } else if (this.isIntroPlaying) {
                this.updateIntro();
            } else {
                this.step();
                this.frameCount++;
                
                // Check life percentage and stagnation periodically
                if (this.autoReset && this.frameCount % this.checkInterval === 0) {
                    const lifePercent = this.getLifePercentage();
                    if (lifePercent < this.minLifeThreshold || this.stagnationFrames > this.stagnationThreshold) {
                        this.isFadingOut = true;
                        this.stagnationFrames = 0;
                    }
                }
            }
            this.render();
            this.lastFrameTime = timestamp - (elapsed % frameInterval);
        }
        
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    }
    
    start() {
        if (this.running) return;
        this.running = true;
        this.lastFrameTime = performance.now();
        this.render();
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    }
    
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    setFPS(fps) {
        this.fps = Math.max(1, Math.min(60, fps));
    }
    
    setCellSize(size) {
        this.cellSize = Math.max(2, Math.min(16, size));
        this.resize();
        this.reset(this.currentPattern, true);
    }
}
