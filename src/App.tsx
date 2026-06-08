import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import { StreamOverlay } from '@/components/StreamOverlay'
import { ControlPanel } from '@/components/ControlPanel'
import { Toaster } from '@/components/ui/sonner'

type SceneType = 'live' | 'starting-soon' | 'break' | 'coffee-break' | 'ending'
type BackgroundType = 'gradient-wave' | 'geometric' | 'pulse' | 'particles'

function App() {
  const [currentScene, setCurrentScene] = useKV<SceneType>('obs-current-scene', 'live')
  const [previousScene, setPreviousScene] = useState<SceneType | null>(null)
  const [customMessage, setCustomMessage] = useKV<string>('obs-custom-message', '')
  const [background, setBackground] = useKV<BackgroundType>('obs-background', 'gradient-wave')
  const [timerMinutes, setTimerMinutes] = useKV<number>('obs-timer-minutes', 5)
  const [isTimerActive, setIsTimerActive] = useState(false)

  const handleSceneChange = (newScene: SceneType) => {
    if (currentScene) {
      setPreviousScene(currentScene)
    }
    setCurrentScene(newScene)
  }

  const handleUndo = () => {
    if (previousScene) {
      setCurrentScene(previousScene)
      setPreviousScene(null)
    }
  }

  const handleTimerToggle = () => {
    setIsTimerActive((current) => !current)
  }

  return (
    <>
      <StreamOverlay
        scene={currentScene || 'live'}
        customMessage={customMessage || ''}
        background={background || 'gradient-wave'}
        timerSeconds={(timerMinutes || 5) * 60}
        isTimerActive={isTimerActive}
      />
      
      <ControlPanel
        currentScene={currentScene || 'live'}
        onSceneChange={handleSceneChange}
        customMessage={customMessage || ''}
        onCustomMessageChange={setCustomMessage}
        background={background || 'gradient-wave'}
        onBackgroundChange={setBackground}
        timerMinutes={timerMinutes || 5}
        onTimerMinutesChange={setTimerMinutes}
        isTimerActive={isTimerActive}
        onTimerToggle={handleTimerToggle}
        previousScene={previousScene}
        onUndo={handleUndo}
      />
      
      <Toaster />
    </>
  )
}

export default App