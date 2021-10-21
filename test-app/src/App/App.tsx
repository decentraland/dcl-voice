import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { throttle, uniq } from 'lodash'
import { Logo, SelectField } from 'decentraland-ui'
import { VoiceReadOnlyVector3 } from '@dcl/voice/dist/types'

import styles from './App.module.css'
import { Props } from './App.types'
import { CurrentGraph } from '../components/Graph'
import Triangle from '../components/triangle'

let streamIdDragging: string

const ROOM_1 = 'Room: Casla'
const ROOM_2 = 'Room: Boedo'

const App: React.FC<Props> = ({
  onJoinRoom,
  onStartVoice,
  onSetLocalPosition,
  onSetStreamPosition,
  remoteStreams,
  localStream,
  connected,
}: Props) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [positions, setPosistions] = useState<Record<string, VoiceReadOnlyVector3 & { deg: number }>>({})
  const [keysPressed, setKeysPressed] = useState<string[]>([])
  const [currentRoom, setCurrentRoom] = useState<string>(ROOM_1)
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
      onStartVoice({
        url: 'wss://test-sfu.decentraland.zone/ws',
        userAddress: window.location.search || uuid()
      })
    },
    [onStartVoice]
  )

  // Join the room if we are connected to the ws.
  // This could be a param.
  useEffect(
    () => {
      if (connected) {
        onJoinRoom(currentRoom)
      }
    },
    [connected, onJoinRoom, currentRoom]
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
    if (!divRef.current) return
    const TRIANGLE_SIZE = 20
    const rect = divRef.current.getBoundingClientRect()
    const prevPosition = positions[streamIdDragging] || { x: 0, y: 0, z: 0 }
    const mouseX = e.clientX - rect.x
    const mouseY = e.clientY - rect.y

    if (!keysPressed.includes('Shift')) {
      const position = { ...prevPosition, x: mouseX, z: mouseY }
      setPosistions({ ...positions, [streamIdDragging]: position })
      throttled.current(streamIdDragging, position, streamIdDragging === localStream?.id)
      return
    }

    const centerX = (prevPosition.x) + (TRIANGLE_SIZE / 2)
    const centerZ = (prevPosition.z) + (TRIANGLE_SIZE / 2)

    const radians = Math.atan2(mouseX - centerX, mouseY - centerZ)
    const deg = (radians * (180 / Math.PI) * -1) + 90
    setPosistions({ ...positions, [streamIdDragging]: { ...prevPosition, deg: deg } })
  }

  return (
    <div
      className={styles.container}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div className={styles.header}>
        <SelectField
          search={false}
          value={currentRoom}
          onChange={(_, data) => setCurrentRoom(data.value as string)}
          label="Choose Room"
          placeholder="Room"
          options={[
            { key: ROOM_1, text: ROOM_1, value: ROOM_1 },
            { key: ROOM_2, text: ROOM_2, value: ROOM_2 },
          ]}
          />
        <Logo />
      </div>
      <div className={styles.graphs}>
        <div ref={divRef}>
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
    </div>
  )
}

export default App
