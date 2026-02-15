<?php

namespace App\Services;

class GameOfLifeService
{
    private array $grid = [];
    private int $width;
    private int $height;
    private PatternService $patternService;

    public function __construct(int $width = 150, int $height = 100)
    {
        $this->width = $width;
        $this->height = $height;
        $this->patternService = new PatternService();
        $this->reset();
    }

    public function reset(string $pattern = 'random'): void
    {
        $this->grid = array_fill(0, $this->height, array_fill(0, $this->width, 0));

        if ($pattern === 'random') {
            $this->randomize(0.15);
        } else {
            $patternData = $this->patternService->getPattern($pattern);
            if ($patternData) {
                $startX = (int) (($this->width - count($patternData[0])) / 2);
                $startY = (int) (($this->height - count($patternData)) / 2);
                $this->placePattern($patternData, $startX, $startY);
            }
        }
    }

    public function randomize(float $density = 0.15): void
    {
        for ($y = 0; $y < $this->height; $y++) {
            for ($x = 0; $x < $this->width; $x++) {
                $this->grid[$y][$x] = (mt_rand() / mt_getrandmax()) < $density ? 1 : 0;
            }
        }
    }

    public function placePattern(array $pattern, int $startX, int $startY): void
    {
        foreach ($pattern as $y => $row) {
            foreach ($row as $x => $cell) {
                $gridX = $startX + $x;
                $gridY = $startY + $y;
                if ($gridX >= 0 && $gridX < $this->width && $gridY >= 0 && $gridY < $this->height) {
                    $this->grid[$gridY][$gridX] = $cell;
                }
            }
        }
    }

    public function tick(): array
    {
        $newGrid = [];
        $changes = [];

        for ($y = 0; $y < $this->height; $y++) {
            $newGrid[$y] = [];
            for ($x = 0; $x < $this->width; $x++) {
                $neighbors = $this->countNeighbors($x, $y);
                $alive = $this->grid[$y][$x];
                $newState = 0;

                if ($alive) {
                    $newState = ($neighbors === 2 || $neighbors === 3) ? 1 : 0;
                } else {
                    $newState = ($neighbors === 3) ? 1 : 0;
                }

                $newGrid[$y][$x] = $newState;

                if ($newState !== $alive) {
                    $changes[] = ['x' => $x, 'y' => $y, 'state' => $newState];
                }
            }
        }

        $this->grid = $newGrid;
        return $changes;
    }

    private function countNeighbors(int $x, int $y): int
    {
        $count = 0;
        for ($dy = -1; $dy <= 1; $dy++) {
            for ($dx = -1; $dx <= 1; $dx++) {
                if ($dx === 0 && $dy === 0) continue;
                $nx = ($x + $dx + $this->width) % $this->width;
                $ny = ($y + $dy + $this->height) % $this->height;
                $count += $this->grid[$ny][$nx];
            }
        }
        return $count;
    }

    public function getGrid(): array
    {
        return $this->grid;
    }

    public function setCell(int $x, int $y, bool $alive): void
    {
        if ($x >= 0 && $x < $this->width && $y >= 0 && $y < $this->height) {
            $this->grid[$y][$x] = $alive ? 1 : 0;
        }
    }

    public function getWidth(): int
    {
        return $this->width;
    }

    public function getHeight(): int
    {
        return $this->height;
    }

    public function toArray(): array
    {
        return [
            'width' => $this->width,
            'height' => $this->height,
            'grid' => $this->grid,
        ];
    }
}
