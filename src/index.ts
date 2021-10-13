import { LocalStream, RemoteStream } from 'ion-sdk-js'
import { getValue, getContext, isChrome, isNotUndefined, setValue2 } from './utils'

export function removeVoiceStream(streamId: string) {
  const stream = getValue('streams')[streamId]

  if (!stream) {
    return
  }

  stream.stream.disconnect()
  stream.gain.disconnect()
  setValue2('streams', streamId, undefined)
}

export function addVoiceStream(streams: RemoteStream[]) {
  const context = getContext()
  const oldStreams = getValue('streams')

  return streams
    .map((stream) => {
      const prevStream = oldStreams[stream.id]

      if (prevStream) {
        prevStream.gain.disconnect()
        prevStream.stream.disconnect()
      }

      const streamNode = context.createMediaStreamSource(stream)
      const gainNode = context.createGain()

      streamNode.connect(gainNode)
      gainNode.connect(context.destination)

      if (isChrome()) {
        // chrome needs an audio or an html tag to play sound.
        const audio = new Audio()
        audio.srcObject = streamNode.mediaStream
        audio.muted = true
      }

      const value = { stream: streamNode, gain: gainNode }
      setValue2('streams', stream.id, value)

      return value
    })
    .filter(isNotUndefined)
}

// Add local stream muted to initialize AudioContext.
// Then we cache that AudioContext and append all the streams.
// Workaround for browsers that need a click in order to play some sound
export function initVoiceContext(localStream: LocalStream) {
  const [stream] = addVoiceStream([localStream as any as RemoteStream])
  stream.gain.gain.value = 0
}
