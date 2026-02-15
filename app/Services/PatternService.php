<?php

namespace App\Services;

class PatternService
{
    private array $patterns = [];

    public function __construct()
    {
        $this->loadPatterns();
    }

    private function loadPatterns(): void
    {
        $this->patterns = [
            'glider' => [
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 1],
            ],
            'blinker' => [
                [1, 1, 1],
            ],
            'beacon' => [
                [1, 1, 0, 0],
                [1, 1, 0, 0],
                [0, 0, 1, 1],
                [0, 0, 1, 1],
            ],
            'toad' => [
                [0, 1, 1, 1],
                [1, 1, 1, 0],
            ],
            'pulsar' => [
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
                [0,0,1,1,1,0,0,0,1,1,1,0,0],
            ],
            'glider-gun' => [
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            ],
            'pentadecathlon' => [
                [0,0,1,0,0,0,0,1,0,0],
                [1,1,0,1,1,1,1,0,1,1],
                [0,0,1,0,0,0,0,1,0,0],
            ],
            'lwss' => [ // Lightweight spaceship
                [0,1,0,0,1],
                [1,0,0,0,0],
                [1,0,0,0,1],
                [1,1,1,1,0],
            ],
            'r-pentomino' => [
                [0,1,1],
                [1,1,0],
                [0,1,0],
            ],
            'diehard' => [
                [0,0,0,0,0,0,1,0],
                [1,1,0,0,0,0,0,0],
                [0,1,0,0,0,1,1,1],
            ],
            'acorn' => [
                [0,1,0,0,0,0,0],
                [0,0,0,1,0,0,0],
                [1,1,0,0,1,1,1],
            ],
        ];
    }

    public function getPattern(string $name): ?array
    {
        return $this->patterns[$name] ?? null;
    }

    public function getPatternNames(): array
    {
        return array_keys($this->patterns);
    }

    public function getAllPatterns(): array
    {
        return $this->patterns;
    }

    public function addPattern(string $name, array $pattern): void
    {
        $this->patterns[$name] = $pattern;
    }

    public function parseRLE(string $rle): array
    {
        // Parse RLE (Run Length Encoded) pattern format
        $lines = explode("\n", $rle);
        $pattern = [];
        $row = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || $line[0] === '#' || $line[0] === 'x') {
                continue;
            }

            $count = '';
            for ($i = 0; $i < strlen($line); $i++) {
                $char = $line[$i];
                if (is_numeric($char)) {
                    $count .= $char;
                } elseif ($char === 'b') {
                    $num = $count === '' ? 1 : (int)$count;
                    for ($j = 0; $j < $num; $j++) {
                        $row[] = 0;
                    }
                    $count = '';
                } elseif ($char === 'o') {
                    $num = $count === '' ? 1 : (int)$count;
                    for ($j = 0; $j < $num; $j++) {
                        $row[] = 1;
                    }
                    $count = '';
                } elseif ($char === '$') {
                    $pattern[] = $row;
                    $row = [];
                    $num = $count === '' ? 1 : (int)$count;
                    for ($j = 1; $j < $num; $j++) {
                        $pattern[] = [];
                    }
                    $count = '';
                } elseif ($char === '!') {
                    if (!empty($row)) {
                        $pattern[] = $row;
                    }
                    break 2;
                }
            }
        }

        // Normalize row lengths
        $maxWidth = max(array_map('count', $pattern));
        foreach ($pattern as &$row) {
            while (count($row) < $maxWidth) {
                $row[] = 0;
            }
        }

        return $pattern;
    }
}
