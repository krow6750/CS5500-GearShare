// swift-tools-version:5.7
import PackageDescription

let package = Package(
    name: "BooqableAPI",
    platforms: [
        .macOS(.v10_15),
        .iOS(.v13)
    ],
    dependencies: [],
    targets: [
        .target(
            name: "BooqableAPI",
            dependencies: []
        ),
        .testTarget(
            name: "BooqableAPITests",
            dependencies: ["BooqableAPI"]
        ),
    ]
)
