import React from 'react'
import { VoiceReadOnlyVector3 } from '@dcl/voice/dist/types'

import styles from './triangle.module.css'
import { stringToHex } from '../../utils'

type Props = {
  keysPressed: string[]
  id: string
  position?: VoiceReadOnlyVector3 & { deg: number }
  onMouseDown: () => void
}

const Triangle: React.FC<Props> = ({ id, position, onMouseDown, keysPressed }) => (
  <div
    data-for={id}
    data-tip
    onMouseDown={onMouseDown}
    className={styles.triangle}
    style={{
      cursor: keysPressed.includes('Shift') ? 'nesw-resize' : 'grab',
      top: `${position?.z}px`,
      left: `${position?.x}px`,
      transform: `rotate(${position?.deg}deg)`
    }}
  >
    <div style={{ background: stringToHex(id) }}/>
  </div>
)

export default Triangle