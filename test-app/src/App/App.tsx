import React, { useEffect, useRef, useState } from 'react'
import { throttle, uniq } from 'lodash'
import { Button, Logo } from 'decentraland-ui'
import { VoiceReadOnlyVector3 } from '@dcl/voice/dist/types'

import styles from './App.module.css'
import { Props } from './App.types'
import { CurrentGraph } from '../components/Graph'
import Triangle from '../components/triangle'

let streamIdDragging: string

const App: React.FC<Props> = ({
  onJoinRoom,
  onStartVoice,
  onSetLocalPosition,
  onSetStreamPosition,
  remoteStreams,
  localStream,
  connected,
}: Props) => {
  const [positions, setPosistions] = useState<Record<string, VoiceReadOnlyVector3 & { deg: number }>>({})
  const [keysPressed, setKeysPressed] = useState<string[]>([])
  const throttled = useRef(
    throttle((streamId: string, newValue: VoiceReadOnlyVector3, local?: boolean) => {
      if (local) {
        return onSetLocalPosition(newValue, newValue)
      }

      return onSetStreamPosition(streamId, newValue)
    }, 1000)
  )

  // Keyboard event listeners on mount.
  useEffect(
    () => {
      const onKeyDown = ({ key }: KeyboardEvent) => {
        setKeysPressed((keys) => uniq(keys.concat(key)))
      }

      const onKeyUp = ({ key }: KeyboardEvent) => {
        setKeysPressed((keys) => keys.filter(k => k !== key))
      }

      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('keyup', onKeyUp)
      return () => {
        document.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('keyup', onKeyUp)
      }
    },
    [setKeysPressed]
  )

  // After component mount start the voice ws
  useEffect(
    () => {
      onStartVoice({ url: 'wss://test-sfu.decentraland.zone/ws' })
    },
    [onStartVoice]
  )

  // Join the room if we are connected to the ws.
  // This could be a param.
  useEffect(
    () => {
      if (connected) {
        onJoinRoom('boedo', Math.random() + 'BOEDOOOOOOOO' + Math.random())
      }
    },
    [connected, onJoinRoom]
  )

  // Mouse handlers
  const onMouseDown = (streamId: string) => () => {
    streamIdDragging = streamId
  }
  const onMouseUp = () => {
    streamIdDragging = ''
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!streamIdDragging) return
    if (!e.clientX && !e.clientY) return
    const TRIANGLE_SIZE = 20
    const prevPosition = positions[streamIdDragging] || { x: 0, y: 0, z: 0 }

    if (!keysPressed.includes('Shift')) {
      const position = { ...prevPosition, x: e.clientX, y: e.clientY }
      setPosistions({ ...positions, [streamIdDragging]: position })
      throttled.current(streamIdDragging, position, streamIdDragging === localStream?.id)
      return
    }

    const centerX = (prevPosition.x) + (TRIANGLE_SIZE / 2);
    const centerY = (prevPosition.y) + (TRIANGLE_SIZE / 2);
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const radians = Math.atan2(mouseX - centerX, mouseY - centerY);
    const deg = (radians * (180 / Math.PI) * -1) + 90;
    setPosistions({ ...positions, [streamIdDragging]: { ...prevPosition, deg: deg } })
  }

  return (
    <div
      className={styles.container}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <h1 className={styles.title}>
        Welcome to <a href="https://decentraland.org">Decentraland ZooMeets!</a>
      </h1>
      <div><Logo /></div>
      <div className={styles.button}>
        <Button>
          {!localStream ? 'Loading...' : 'Listening'}
        </Button>
      </div>
      <div>
        { localStream && (
          <Triangle
            keysPressed={keysPressed}
            onMouseDown={onMouseDown(localStream.id)}
            position={positions[localStream.id]}
            id={localStream.id}
          />
        )}
        {(remoteStreams || []).map(stream => (
          <Triangle
            keysPressed={keysPressed}
            key={stream.id}
            onMouseDown={onMouseDown(stream.id)}
            position={positions[stream.id]}
            id={stream.id}
          />
        ))}
      </div>
      <CurrentGraph />
    </div>
  )
}

export default App
