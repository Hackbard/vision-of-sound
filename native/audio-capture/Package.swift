// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "AudioCapture",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "AudioCapture", targets: ["AudioCapture"])
    ],
    targets: [
        .executableTarget(
            name: "AudioCapture",
            dependencies: [],
            path: "Sources/AudioCapture"
        )
    ]
)
