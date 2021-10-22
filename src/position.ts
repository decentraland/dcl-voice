import { RemoteStreamWithPanner, VoiceReadOnlyVector3 } from './types'
import { getAudioContext } from './utils'

export function udpateLocalPosition(
  position: VoiceReadOnlyVector3,
  orientation: VoiceReadOnlyVector3
) {
  // even thouth setPosition and setOrientation are deprecated, that
  // is the only way to set positions in Firefox and Safari
  const { x, y, z } = position
  const audioContext = getAudioContext()
  console.log('me:', position, orientation)
  audioContext?.listener.setPosition(x, y, z)
  audioContext?.listener.setOrientation(
    orientation.x,
    orientation.y,
    orientation.z,
    0,
    1,
    0
  )
}

export function updateStreamPosition(
  stream: RemoteStreamWithPanner,
  position: VoiceReadOnlyVector3,
  orientation: VoiceReadOnlyVector3
) {
  if (stream.panner) {
    // even thouth setPosition and setOrientation are deprecated, that
    // is the only way to set positions in Firefox and Safari
    console.log('him:', position, orientation)

    stream.panner.positionX.value = position.x
    stream.panner.positionY.value = position.y
    stream.panner.positionZ.value = position.z
    stream.panner.orientationX.value = orientation.x
    stream.panner.orientationY.value = orientation.y
    stream.panner.orientationZ.value = orientation.z
  }
}
