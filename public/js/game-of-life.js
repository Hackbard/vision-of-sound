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
    
    reset(pattern = 'random') {
        this.initGrid();
        
        switch (pattern) {
            case 'random':
                this.randomize(0.15);
                break;
            case 'glider':
                this.placePattern(this.patterns.glider, Math.floor(this.cols / 4), Math.floor(this.rows / 4));
                break;
            case 'pulsar':
                this.placePattern(this.patterns.pulsar, Math.floor(this.cols / 2) - 7, Math.floor(this.rows / 2) - 7);
                break;
            case 'glider-gun':
                this.placePattern(this.patterns.gliderGun, 2, Math.floor(this.rows / 2) - 5);
                break;
            case 'blinker':
                this.placePattern(this.patterns.blinker, Math.floor(this.cols / 2) - 1, Math.floor(this.rows / 2) - 1);
                break;
            case 'beacon':
                this.placePattern(this.patterns.beacon, Math.floor(this.cols / 2) - 2, Math.floor(this.rows / 2) - 2);
                break;
            default:
                this.randomize(0.15);
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
        glider: [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1]
        ],
        blinker: [
            [1, 1, 1]
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
                
                // Fade trail
                if (this.trailGrid[y][x] > 0) {
                    this.trailGrid[y][x] *= 0.85;
                    if (this.trailGrid[y][x] < 0.05) {
                        this.trailGrid[y][x] = 0;
                    }
                }
            }
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
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const px = this.offsetX + x * this.cellSize;
                const py = this.offsetY + y * this.cellSize;
                
                if (this.grid[y][x]) {
                    // Living cell - full color
                    this.ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
                    this.ctx.fillRect(px, py, this.cellSize - 1, this.cellSize - 1);
                } else if (this.trailGrid[y][x] > 0) {
                    // Trail effect - faded color
                    const trailL = l * this.trailGrid[y][x] * 0.5;
                    const trailS = s * this.trailGrid[y][x];
                    this.ctx.fillStyle = `hsl(${h}, ${trailS}%, ${trailL}%)`;
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
            this.step();
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
}
