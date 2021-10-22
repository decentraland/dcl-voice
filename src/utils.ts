import { RemoteStreamWithPanner } from './types'

const AudioContext = (window as any).webkitAudioContext || window.AudioContext

type StreamId = string
type AddressId = string
export type Cache = {
  streams: Record<StreamId, RemoteStreamWithPanner | undefined>
  audioContext: AudioContext | undefined
  mapping: Record<AddressId, StreamId>
  destination: MediaStreamAudioDestinationNode | undefined
  audio: HTMLAudioElement | undefined
}

export function getDefaultCache() {
  return {
    audioContext: undefined,
    streams: {},
    mapping: {},
    destination: undefined,
    audio: undefined
  }
}
export const cache: Cache = getDefaultCache()

export const resetCache = () => {
  const defaultCache = getDefaultCache()
  const entries = Object.entries(defaultCache)
  entries.forEach(([key, value]) => {
    ;(cache as any)[key] = value
  })
}

export function getAudioContext() {
  return cache['audioContext']
}

export function setValue<T extends keyof Cache>(
  key: T,
  value: NonNullable<Cache[T]>
): NonNullable<Cache[T]> {
  return (cache[key] = value)
}

export function setValue2<T extends keyof Cache, K extends keyof Cache[T]>(
  key: T,
  key2: K,
  value: Cache[T][K]
) {
  return ((cache[key] as any)[key2] = value)
}

export function createContext(): AudioContext {
  const audioContext = new AudioContext()
  return setValue('audioContext', audioContext)
}

export function createDestination(
  audioContext: AudioContext
): MediaStreamAudioDestinationNode {
  const destination = audioContext.createMediaStreamDestination()
  return setValue('destination', destination)
}

export function createAudio(): HTMLAudioElement {
  const audio = new Audio()
  return setValue('audio', audio)
}

export function isChrome() {
  return window.navigator.userAgent.includes('Chrome')
}

export function getStreamByAddress(address: string) {
  const streamId = cache['mapping'][address]
  if (!streamId) return
  return cache['streams'][streamId]
}
