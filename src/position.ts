import { RemoteStreamWithPanner, VoiceReadOnlyVector3 } from './types'

export function udpateLocalPosition(
  audioContext: AudioContext,
  position: VoiceReadOnlyVector3
) {
  // even thouth setPosition and setOrientation are deprecated, that
  // is the only way to set positions in Firefox and Safari
  const { x, y, z } = position
  audioContext.listener.setPosition(x, y, z)
  audioContext.listener.setOrientation(x, y, z, 0, 1, 0)
}

export function updateStreamPosition(
  stream: RemoteStreamWithPanner,
  position: VoiceReadOnlyVector3
) {
  if (stream.panner) {
    // even thouth setPosition and setOrientation are deprecated, that
    // is the only way to set positions in Firefox and Safari
    const { x, y, z } = position
    stream.panner.setPosition(x, y, z)
    stream.panner.setOrientation(x, y, z)
  }
}
