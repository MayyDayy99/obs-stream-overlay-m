import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { ControlPanel } from '@/components/ControlPanel'
import { HotkeyDialog } from '@/components/HotkeyDialog'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { useHotkeys } from '@/hooks/use-hotkeys'

type SceneType = 'live' | 'starting-soon' | 'break' | 'coffee-break' | 'ending'
type BackgroundType = 'gradient-wave' | 'geometric' | 'pulse' | 'particles'

const sceneLabels: Record<SceneType, string> = {
  'live': 'ÉLŐ',
  'starting-soon': 'HAMAROSAN',
  'break': 'EBÉDSZÜNET',
  'coffee-break': 'KÁVÉSZÜNET',
  'ending': 'VÉGE'
}

export function ControllerView() {
  const [currentScene, setCurrentScene] = useKV<SceneType>('obs-current-scene', 'live')
  const [previousScene, setPreviousScene] = useState<SceneType | null>(null)
  const [customMessage, setCustomMessage] = useKV<string>('obs-custom-message', '')
  const [background, setBackground] = useKV<BackgroundType>('obs-background', 'gradient-wave')
  const [timerMinutes, setTimerMinutes] = useKV<number>('obs-timer-minutes', 5)
  const [isTimerActive, setIsTimerActive] = useKV<boolean>('obs-timer-active', false)
  const [isHotkeyDialogOpen, setIsHotkeyDialogOpen] = useState(false)

  const handleSceneChange = (newScene: SceneType) => {
    if (currentScene && currentScene !== newScene) {
      setPreviousScene(currentScene)
    }
    setCurrentScene(newScene)
    toast.success(`Jelenet váltva: ${sceneLabels[newScene]}`)
  }

  const handleUndo = () => {
    if (previousScene) {
      setCurrentScene(previousScene)
      setPreviousScene(null)
      toast.info(`Visszaállítva: ${sceneLabels[previousScene]}`)
    }
  }

  const handleTimerToggle = () => {
    setIsTimerActive((current) => {
      const newState = !current
      toast.success(newState ? 'Időzítő elindítva' : 'Időzítő leállítva')
      return newState
    })
  }

  useHotkeys([
    {
      key: '1',
      handler: () => handleSceneChange('live'),
      description: 'ÉLŐ jelenet'
    },
    {
      key: '2',
      handler: () => handleSceneChange('starting-soon'),
      description: 'HAMAROSAN jelenet'
    },
    {
      key: '3',
      handler: () => handleSceneChange('break'),
      description: 'EBÉDSZÜNET jelenet'
    },
    {
      key: '4',
      handler: () => handleSceneChange('coffee-break'),
      description: 'KÁVÉSZÜNET jelenet'
    },
    {
      key: '5',
      handler: () => handleSceneChange('ending'),
      description: 'VÉGE jelenet'
    },
    {
      key: 't',
      handler: () => handleTimerToggle(),
      description: 'Időzítő indítása/leállítása'
    },
    {
      key: 'z',
      ctrl: true,
      handler: () => handleUndo(),
      description: 'Előző jelenet visszaállítása'
    },
    {
      key: '?',
      handler: () => setIsHotkeyDialogOpen(true),
      description: 'Gyorsbillentyűk megjelenítése'
    }
  ])

  return (
    <>
      <ControlPanel
        currentScene={currentScene || 'live'}
        onSceneChange={handleSceneChange}
        customMessage={customMessage || ''}
        onCustomMessageChange={setCustomMessage}
        background={background || 'gradient-wave'}
        onBackgroundChange={setBackground}
        timerMinutes={timerMinutes || 5}
        onTimerMinutesChange={setTimerMinutes}
        isTimerActive={isTimerActive || false}
        onTimerToggle={handleTimerToggle}
        previousScene={previousScene}
        onUndo={handleUndo}
        onShowHotkeys={() => setIsHotkeyDialogOpen(true)}
      />
      
      <HotkeyDialog
        open={isHotkeyDialogOpen}
        onOpenChange={setIsHotkeyDialogOpen}
      />
      
      <Toaster />
    </>
  )
}
