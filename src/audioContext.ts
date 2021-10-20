import { RemoteStream } from './ion'
import { setValue2 } from './utils'
import { VoiceState } from './types'

export function removeVoiceStream(
  context: VoiceState['context'],
  streamId: string
) {
  const stream = context.streams[streamId]

  if (!stream) {
    return
  }

  stream.node.disconnect()
  stream.gain.disconnect()
  stream.panner.disconnect()

  setValue2('streams', streamId, undefined)
}

export async function addVoiceStream(
  context: VoiceState['context'],
  streams: RemoteStream[]
) {
  const { audioContext, destination, streams: oldStreams } = context
  if (!audioContext || !destination) return

  for (const stream of streams) {
    const prevStream = oldStreams[stream.id]

    if (prevStream) {
      continue
    }

    const streamNode = audioContext.createMediaStreamSource(stream)
    const options = {
      maxDistance: 10000,
      refDistance: 5,
      panningModel: 'equalpower',
      distanceModel: 'inverse'
    } as const

    const panNode = audioContext.createPanner()
    const gainNode = audioContext.createGain()

    streamNode.connect(panNode)
    panNode.connect(gainNode)
    gainNode.connect(destination)

    // configure pan node
    panNode.coneInnerAngle = 180
    panNode.coneOuterAngle = 360
    panNode.coneOuterGain = 0.91
    panNode.maxDistance = options.maxDistance ?? 10000
    panNode.refDistance = options.refDistance ?? 5
    panNode.panningModel = options.panningModel ?? 'equalpower'
    panNode.distanceModel = options.distanceModel ?? 'inverse'
    panNode.rolloffFactor = 1.0

    setValue2('streams', stream.id, {
      stream,
      node: streamNode,
      panner: panNode,
      gain: gainNode
    })
  }
}
