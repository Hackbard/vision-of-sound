import Foundation
import ScreenCaptureKit
import AVFoundation
import Accelerate

// MARK: - Audio Data Output
struct AudioData: Codable {
    let timestamp: Double
    let bass: Float
    let mid: Float
    let high: Float
    let rms: Float
    let spectralCentroid: Float
    let fft: [Float]?
}

// MARK: - FFT Processor
class FFTProcessor {
    private let fftSize: Int
    private var fftSetup: vDSP_DFT_Setup?
    private var window: [Float]
    private var realPart: [Float]
    private var imagPart: [Float]
    private var magnitudes: [Float]
    
    init(size: Int = 2048) {
        self.fftSize = size
        self.window = [Float](repeating: 0, count: size)
        self.realPart = [Float](repeating: 0, count: size)
        self.imagPart = [Float](repeating: 0, count: size)
        self.magnitudes = [Float](repeating: 0, count: size / 2)
        
        // Create Hann window
        vDSP_hann_window(&window, vDSP_Length(size), Int32(vDSP_HANN_NORM))
        
        // Create FFT setup
        self.fftSetup = vDSP_DFT_zop_CreateSetup(
            nil,
            vDSP_Length(size),
            .FORWARD
        )
    }
    
    deinit {
        if let setup = fftSetup {
            vDSP_DFT_DestroySetup(setup)
        }
    }
    
    func process(samples: [Float], sampleRate: Float) -> AudioData {
        var windowedSamples = [Float](repeating: 0, count: fftSize)
        
        // Apply window
        let count = min(samples.count, fftSize)
        for i in 0..<count {
            windowedSamples[i] = samples[i] * window[i]
        }
        
        // Perform FFT
        if let setup = fftSetup {
            vDSP_DFT_Execute(setup, windowedSamples, imagPart, &realPart, &imagPart)
        }
        
        // Calculate magnitudes
        var splitComplex = DSPSplitComplex(realp: &realPart, imagp: &imagPart)
        vDSP_zvabs(&splitComplex, 1, &magnitudes, 1, vDSP_Length(fftSize / 2))
        
        // Normalize
        var scale: Float = 2.0 / Float(fftSize)
        vDSP_vsmul(magnitudes, 1, &scale, &magnitudes, 1, vDSP_Length(fftSize / 2))
        
        // Calculate frequency bands
        let binSize = sampleRate / Float(fftSize)
        
        let bass = averageMagnitude(minFreq: 20, maxFreq: 250, binSize: binSize)
        let mid = averageMagnitude(minFreq: 250, maxFreq: 2000, binSize: binSize)
        let high = averageMagnitude(minFreq: 2000, maxFreq: 20000, binSize: binSize)
        
        // Calculate RMS
        var rms: Float = 0
        vDSP_rmsqv(samples, 1, &rms, vDSP_Length(count))
        
        // Calculate spectral centroid
        var weightedSum: Float = 0
        var magnitudeSum: Float = 0
        for i in 0..<(fftSize / 2) {
            let freq = Float(i) * binSize
            weightedSum += freq * magnitudes[i]
            magnitudeSum += magnitudes[i]
        }
        let spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
        
        return AudioData(
            timestamp: Date().timeIntervalSince1970,
            bass: bass,
            mid: mid,
            high: high,
            rms: rms,
            spectralCentroid: spectralCentroid / sampleRate,
            fft: Array(magnitudes.prefix(64))
        )
    }
    
    private func averageMagnitude(minFreq: Float, maxFreq: Float, binSize: Float) -> Float {
        let startBin = max(0, Int(minFreq / binSize))
        let endBin = min(fftSize / 2 - 1, Int(maxFreq / binSize))
        
        if startBin >= endBin { return 0 }
        
        var sum: Float = 0
        for i in startBin...endBin {
            sum += magnitudes[i]
        }
        return sum / Float(endBin - startBin + 1)
    }
}

// MARK: - Audio Stream Handler
class AudioStreamHandler: NSObject, SCStreamOutput {
    private let fftProcessor = FFTProcessor()
    private let encoder = JSONEncoder()
    private var sampleRate: Float = 44100
    
    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio else { return }
        
        // Extract audio samples
        guard let blockBuffer = CMSampleBufferGetDataBuffer(sampleBuffer) else { return }
        
        var length = 0
        var dataPointer: UnsafeMutablePointer<Int8>?
        CMBlockBufferGetDataPointer(blockBuffer, atOffset: 0, lengthAtOffsetOut: nil, totalLengthOut: &length, dataPointerOut: &dataPointer)
        
        guard let data = dataPointer else { return }
        
        // Get format description
        if let formatDesc = CMSampleBufferGetFormatDescription(sampleBuffer),
           let asbd = CMAudioFormatDescriptionGetStreamBasicDescription(formatDesc) {
            sampleRate = Float(asbd.pointee.mSampleRate)
        }
        
        // Convert to Float samples
        let floatData = data.withMemoryRebound(to: Float.self, capacity: length / 4) { ptr in
            Array(UnsafeBufferPointer(start: ptr, count: length / 4))
        }
        
        // Process and output
        let audioData = fftProcessor.process(samples: floatData, sampleRate: sampleRate)
        
        if let jsonData = try? encoder.encode(audioData),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            print(jsonString)
            fflush(stdout)
        }
    }
}

// MARK: - Main
@main
struct AudioCapture {
    static func main() async throws {
        // Check for screen recording permission
        guard CGPreflightScreenCaptureAccess() else {
            fputs("Error: Screen recording permission required\n", stderr)
            fputs("Please grant permission in System Settings > Privacy & Security > Screen Recording\n", stderr)
            exit(1)
        }
        
        // Get available content
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)
        
        guard let display = content.displays.first else {
            fputs("Error: No display found\n", stderr)
            exit(1)
        }
        
        // Configure stream for audio only
        let config = SCStreamConfiguration()
        config.capturesAudio = true
        config.excludesCurrentProcessAudio = true
        config.sampleRate = 44100
        config.channelCount = 1
        
        // We need to capture something visual, but we won't use it
        config.width = 1
        config.height = 1
        config.minimumFrameInterval = CMTime(value: 1, timescale: 1) // 1 FPS to minimize overhead
        
        // Create filter to capture the display
        let filter = SCContentFilter(display: display, excludingWindows: [])
        
        // Create and start stream
        let stream = SCStream(filter: filter, configuration: config, delegate: nil)
        let handler = AudioStreamHandler()
        
        try stream.addStreamOutput(handler, type: .audio, sampleHandlerQueue: .main)
        try await stream.startCapture()
        
        fputs("Audio capture started. Press Ctrl+C to stop.\n", stderr)
        
        // Keep running
        await withCheckedContinuation { (_: CheckedContinuation<Void, Never>) in
            // This will run forever until the process is killed
            signal(SIGINT) { _ in
                exit(0)
            }
            signal(SIGTERM) { _ in
                exit(0)
            }
        }
    }
}
