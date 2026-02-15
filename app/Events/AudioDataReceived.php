<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class AudioDataReceived implements ShouldBroadcastNow
{
    use SerializesModels;

    public float $bass;
    public float $mid;
    public float $high;
    public float $rms;
    public ?float $spectralCentroid;
    public ?array $fft;

    public function __construct(array $audioData)
    {
        $this->bass = $audioData['bass'] ?? 0.0;
        $this->mid = $audioData['mid'] ?? 0.0;
        $this->high = $audioData['high'] ?? 0.0;
        $this->rms = $audioData['rms'] ?? 0.0;
        $this->spectralCentroid = $audioData['spectralCentroid'] ?? null;
        $this->fft = $audioData['fft'] ?? null;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('nativephp'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'audio.data';
    }
}
