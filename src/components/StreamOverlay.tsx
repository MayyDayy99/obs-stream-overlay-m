import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

type SceneType = 'live' | 'starting-soon' | 'break' | 'coffee-break' | 'ending'
type BackgroundType = 'gradient-wave' | 'geometric' | 'pulse' | 'particles'

interface StreamOverlayProps {
  scene: SceneType
  customMessage: string
  background: BackgroundType
  timerSeconds: number
  isTimerActive: boolean
}

const sceneMessages: Record<SceneType, string> = {
  'live': '',
  'starting-soon': 'HAMAROSAN KEZDÜNK',
  'break': 'EBÉDSZÜNET',
  'coffee-break': 'KÁVÉSZÜNET',
  'ending': 'KÖSZÖNJÜK A FIGYELMET'
}

export function StreamOverlay({ scene, customMessage, background, timerSeconds, isTimerActive }: StreamOverlayProps) {
  const [displayTime, setDisplayTime] = useState(timerSeconds)

  useEffect(() => {
    setDisplayTime(timerSeconds)
  }, [timerSeconds])

  useEffect(() => {
    if (!isTimerActive || displayTime <= 0) return

    const interval = setInterval(() => {
      setDisplayTime((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerActive, displayTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (scene === 'live') {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <AnimatedBackground type={background} />
      
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-16 p-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-[64px] font-bold tracking-wide text-white drop-shadow-[0_0_40px_rgba(200,0,0,0.8)]">
            ÓBUDAI EGYETEM
          </h2>
        </motion.div>

        <div className="flex flex-col items-center gap-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene + customMessage}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-center"
            >
              <h1 className="text-[96px] font-bold leading-none tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                {customMessage || sceneMessages[scene]}
              </h1>
            </motion.div>
          </AnimatePresence>

          {isTimerActive && displayTime > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              className="font-mono text-[120px] font-bold leading-none text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.6)]"
              style={{
                animation: displayTime < 60 ? 'pulse 1s ease-in-out infinite' : 'none'
              }}
            >
              {formatTime(displayTime)}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function AnimatedBackground({ type }: { type: BackgroundType }) {
  switch (type) {
    case 'gradient-wave':
      return (
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(45deg, oklch(0.52 0.21 25), oklch(0.35 0.15 25), oklch(0.20 0.01 260))',
              backgroundSize: '400% 400%'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      )
    
    case 'geometric':
      return (
        <div className="absolute inset-0 bg-[oklch(0.20_0.01_260)]">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, transparent, transparent 50px, oklch(0.52 0.21 25 / 0.15) 50px, oklch(0.52 0.21 25 / 0.15) 51px),
                repeating-linear-gradient(-45deg, transparent, transparent 50px, oklch(0.60 0.24 20 / 0.15) 50px, oklch(0.60 0.24 20 / 0.15) 51px)
              `
            }}
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      )
    
    case 'pulse':
      return (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, oklch(0.52 0.21 25 / ${0.3 - i * 0.1}), transparent 70%)`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )
    
    case 'particles':
      return (
        <div className="absolute inset-0 bg-[oklch(0.20_0.01_260)]">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )
  }
}
