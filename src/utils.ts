import { RemoteStreamWithPanner } from './types'

const AudioContext = (window as any).webkitAudioContext || window.AudioContext

type Cache = {
  streams: Record<string, RemoteStreamWithPanner | undefined>
  audioContext: AudioContext | undefined
  mapping: Record<string, string>
  destination: MediaStreamAudioDestinationNode | undefined
  audio: HTMLAudioElement | undefined
}

const cache: Cache = {
  audioContext: undefined,
  streams: {},
  mapping: {},
  destination: undefined,
  audio: undefined
}

export function getValue<T extends keyof Cache>(key: T): Cache[T] {
  return cache[key]
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

export function isContextDefined() {
  return !!getValue('audioContext')
}

export function getContext() {
  const context =
    getValue('audioContext') || setValue('audioContext', new AudioContext())
  return context
}

export function getDestination() {
  const destination = getValue('destination')
  if (destination) return destination

  const context = getContext()
  return setValue('destination', context.createMediaStreamDestination())
}

export function getAudio() {
  const cache = getValue('audio')

  if (cache) return cache

  const audio = new Audio()
  setValue('audio', audio)
  return audio
}

export function isNotUndefined<T>(value: T | undefined): value is T {
  return !!value
}

export function isChrome() {
  return window.navigator.userAgent.includes('Chrome')
}
