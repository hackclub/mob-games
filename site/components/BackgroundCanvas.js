import { Canvas } from '@react-three/fiber'
import { MinecraftBackground } from './MinecraftBackground'
import React, { useState } from 'react'

export const BackgroundCanvas = React.memo(() => {
  const [isPaused, setIsPaused] = useState(false)

  const handleTogglePause = (paused) => {
    setIsPaused(paused)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      cursor: 'pointer'
    }}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ background: 'transparent' }}
        gl={{ 
          preserveDrawingBuffer: false,
          antialias: false,
          powerPreference: 'high-performance'
        }}
        frameloop="always"
        dpr={[1, 2]}
      >
        <MinecraftBackground timeScale={0.3} onTogglePause={handleTogglePause} />
      </Canvas>
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '5px',
          fontFamily: 'Minecraft, monospace',
          fontSize: '14px',
          pointerEvents: 'none'
        }}>
          PAUSED
        </div>
      )}
    </div>
  )
})

BackgroundCanvas.displayName = 'BackgroundCanvas' 