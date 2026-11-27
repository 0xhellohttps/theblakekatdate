// Turns a folder of rendered frames (f00000.jpg …) plus the soundtrack into an .mp4.
// H.264 video at 24 fps; the AAC audio is copied in untouched.
//   swiftc -O encode.swift -o encode && ./encode <framesDir> <audio.m4a> <out.mp4> <width> <height> [bitrate]
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let a = CommandLine.arguments
let dir = URL(fileURLWithPath: a[1]), audioURL = URL(fileURLWithPath: a[2]), outURL = URL(fileURLWithPath: a[3])
let W = Int(a[4])!, H = Int(a[5])!
let bitrate = a.count > 6 ? Int(a[6])! : 16_000_000
let fps: Int32 = 24
let files = try FileManager.default.contentsOfDirectory(atPath: dir.path).filter { $0.hasSuffix(".jpg") }.sorted()
let tmp = dir.appendingPathComponent("video-only.mov")
try? FileManager.default.removeItem(at: tmp)
try? FileManager.default.removeItem(at: outURL)

let writer = try AVAssetWriter(outputURL: tmp, fileType: .mov)
let settings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: bitrate, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoExpectedSourceFrameRateKey: 24, AVVideoMaxKeyFrameIntervalKey: 48,
  ],
  AVVideoColorPropertiesKey: [
    AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
    AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
    AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
  ],
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
  kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H,
])
writer.add(input)
guard writer.startWriting() else { fatalError("cannot start: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)
let space = CGColorSpace(name: CGColorSpace.sRGB)!
for (i, f) in files.enumerated() {
  autoreleasepool {
    let src = CGImageSourceCreateWithURL(dir.appendingPathComponent(f) as CFURL, nil)!
    let img = CGImageSourceCreateImageAtIndex(src, 0, nil)!
    var pb: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
    CVPixelBufferLockBaseAddress(pb!, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: W, height: H, bitsPerComponent: 8,
                        bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: space,
                        bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H))
    CVPixelBufferUnlockBaseAddress(pb!, [])
    while !input.isReadyForMoreMediaData { usleep(2000) }
    adaptor.append(pb!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
  }
}
input.markAsFinished()
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()
guard writer.status == .completed else { fatalError("video failed: \(String(describing: writer.error))") }

// lay the soundtrack under the picture, both starting at zero
let comp = AVMutableComposition()
let video = AVURLAsset(url: tmp), audio = AVURLAsset(url: audioURL)
let vt = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
let at = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)!
let dur = CMTime(value: CMTimeValue(files.count), timescale: fps)
try vt.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: video.tracks(withMediaType: .video)[0], at: .zero)
try at.insertTimeRange(CMTimeRange(start: .zero, duration: CMTimeMinimum(dur, audio.duration)), of: audio.tracks(withMediaType: .audio)[0], at: .zero)
let export = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetPassthrough)!
export.outputURL = outURL
export.outputFileType = .mp4
export.shouldOptimizeForNetworkUse = true
export.exportAsynchronously { sem.signal() }
sem.wait()
try? FileManager.default.removeItem(at: tmp)
if export.status == .completed { print("wrote \(outURL.path): \(files.count) frames, \(Double(files.count) / Double(fps)) s") }
else { print("export failed: \(String(describing: export.error))"); exit(1) }
