import { Client, Constraints, LocalStream, RemoteStream } from '@dcl/ion-sdk-js'
import { IonSFUJSONRPCSignal } from '@dcl/ion-sdk-js/lib/signal/json-rpc-impl'
import { EventEmitter } from 'events'

type Options = {
  reconnect: boolean
}

type Events = {
  remoteStreams: RemoteStream[]
  error: Error | Event
  close: Event
  connected: undefined
  disconnect: undefined
}

type Callback<T> = (arg: T) => void

class Signal extends EventEmitter {
  private uri: string
  private signal!: IonSFUJSONRPCSignal
  private client!: Client
  private connected: boolean = false
  private uuid: string
  private reconnect: boolean
  private cbQueue: (() => void)[] = []
  private remoteStreams: RemoteStream[] = []
  private localStream: LocalStream | undefined

  constructor(uri: string, uuid: string, opts?: Options) {
    super()
    this.uri = uri
    this.uuid = uuid
    this.reconnect = opts?.reconnect || true

    this.connect()
  }

  connect() {
    this.signal = new IonSFUJSONRPCSignal(this.uri)
    this.client = new Client(this.signal)
    console.log(this.client)
    this.signal.onclose = (err) => this.handleClose(err)
    this.signal.onerror = (event) => this.handleError(event)
    this.signal.onopen = () => this.handleOnOpen()

    this.handleTracks()
  }

  handleClose(event: Event) {
    this.connected = false

    this.client.close()
    this.remoteStreams = []
    this.localStream = undefined
    this._emit('close', event)

    // Todo handle reconnect with some better algorithm
    // but for now its ok.
    if (this.reconnect) {
      console.log('reconnecting', event)
      setTimeout(() => this.connect(), 1000);
    }
  }

  handleError(error: Error | Event) {
    console.log('handleError', error)
    this._emit('error', error)
  }

  handleOnOpen() {
    console.log('connected')
    this.connected = true
    setInterval(
      () => this.signal.notify('', ''),
      1000 * 60,
    )
    this.cbQueue.forEach(promise => promise())
    this._emit('connected')
  }

  async joinRoom(sid: string) {
    if (!this.connected) {
      this.cbQueue.push(() => this.joinRoom(sid))
      return
    }

    try {
      console.log('trying to connect')
      await this.client.join(sid, this.uuid)

      console.log('joined room: ', sid)
    } catch(e) {
      this.handleError(e as Error)
    }
  }

  async publish(opts?: Partial<Constraints>) {
    this.localStream = await LocalStream.getUserMedia({
      resolution: 'hd',
      audio: true,
      codec: 'vp8',
      video: false,
      simulcast: true,
      sendEmptyOnMute: true,
      ...opts,
    })

    this.client.publish(this.localStream)
    return this.localStream
  }

  unPublish() {
    if (this.localStream) {
      this.localStream.unpublish()
    }
  }

  _on<T extends keyof Events>(key: T, cb: Callback<Events[T]>) {
    this.on(key, cb)
  }

  _emit<T extends keyof Events>(key: T, value?: Events[T]) {
    this.emit(key, value)
  }

  setRemoteStreams(remoteStreams: RemoteStream[]) {
    console.log({ remoteStreams })
    this.remoteStreams = remoteStreams
    this._emit('remoteStreams', this.remoteStreams)
  }

  handleTracks() {
    this.client.ontrack = (track, stream) => {
      track.onunmute = () => {
        const remoteStream = this.remoteStreams.find(r => r.id === stream.id)

        if (!remoteStream) {
          // Add remote stream to array
          this.setRemoteStreams(this.remoteStreams.concat(stream))


          // Find and remove remote stream
          stream.onremovetrack = () => {
            this.setRemoteStreams(this.remoteStreams.filter(s => s.id !== stream.id))
          }

        }
      }
    }
  }

  getLocalStream () {
    return this.localStream
  }

  getRemoteStreams () {
    return this.remoteStreams
  }
}

export default Signal