import { LocalStream, RemoteStream } from './ion'
import {
  getValue,
  getContext,
  isChrome,
  setValue2,
  getDestination
} from './utils'
import { startLoopback } from './loopback'

export function removeVoiceStream(streamId: string) {
  const stream = getValue('streams')[streamId]

  if (!stream) {
    return
  }

  stream.stream.disconnect()
  stream.gain.disconnect()
  if (stream.audio) {
    stream.audio.srcObject = null
    stream.audio.pause()
    stream.audio.currentTime = 0
  }
  setValue2('streams', streamId, undefined)
}

export async function addVoiceStream(
  streams: RemoteStream[],
  _isLocal?: boolean
) {
  const context = getContext()
  const destination = getDestination()
  const oldStreams = getValue('streams')

  streams.forEach(async (stream) => {
    const prevStream = oldStreams[stream.id]

    if (prevStream) {
      return prevStream
    }

    const streamNode = context.createMediaStreamSource(stream)
    const gainNode = context.createGain()
    streamNode.connect(gainNode)
    gainNode.connect(destination)
    let audio: HTMLAudioElement | undefined

    if (isChrome()) {
      // audio = new Audio()
      // audio.muted = true
      // audio.srcObject = streamNode.mediaStream
    }

    setValue2('streams', stream.id, {
      gain: gainNode,
      stream: streamNode,
      audio
    })
  })

  const loopback = await startLoopback(destination.stream)
  const audio = new Audio()
  audio.autoplay = true
  audio.srcObject = loopback
  audio.volume = 1
  await audio.play()
}

// Add local stream muted to initialize AudioContext.
// Then we cache that AudioContext and append all the streams.
// Workaround for browsers that need a click in order to play some sound
export function initVoiceContext(localStream: LocalStream) {
  const context = getContext()
  const destination = getDestination()
  const stream = context.createMediaStreamSource(localStream)
  const gain = context.createGain()
  gain.gain.value = 0
  stream.connect(gain).connect(destination)
  // addVoiceStream([localStream as any as RemoteStream], true)
}
