import { useState } from 'react'
import { useSharedState } from '@/hooks/useSharedState'
import { ControlPanel } from '@/components/ControlPanel'
import { HotkeyDialog } from '@/components/HotkeyDialog'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { useHotkeys } from '@/hooks/use-hotkeys'
import type { SceneType, ThemeType, IndicatorType } from '@/components/StreamOverlay'

const sceneLabels: Record<SceneType, string> = {
  'live': 'ÉLŐ',
  'starting-soon': 'HAMAROSAN',
  'break': 'EBÉDSZÜNET',
  'coffee-break': 'KÁVÉSZÜNET',
  'ending': 'VÉGE'
}

export function ControllerView() {
  const [currentScene, setCurrentScene] = useSharedState<SceneType>('obs-current-scene', 'live')
  const [previousScene, setPreviousScene] = useState<SceneType | null>(null)
  const [customMessage, setCustomMessage] = useSharedState<string>('obs-custom-message', '')
  const [theme, setTheme] = useSharedState<ThemeType>('obs-theme', 'kek')
  const [accentColor, setAccentColor] = useSharedState<string>('obs-accent-color', '#06DCDC')
  const [indicator, setIndicator] = useSharedState<IndicatorType>('obs-indicator', 'dots')
  const [timerMinutes, setTimerMinutes] = useSharedState<number>('obs-timer-minutes', 5)
  const [isTimerActive, setIsTimerActive] = useSharedState<boolean>('obs-timer-active', false)
  const [showLive, setShowLive] = useSharedState<boolean>('obs-show-live', true)
  const [liveLabel, setLiveLabel] = useSharedState<string>('obs-live-label', 'Élő közvetítés')
  const [showClock, setShowClock] = useSharedState<boolean>('obs-show-clock', true)
  const [subtitle, setSubtitle] = useSharedState<string>('obs-subtitle', '')
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
    { key: '1', handler: () => handleSceneChange('live'), description: 'ÉLŐ jelenet' },
    { key: '2', handler: () => handleSceneChange('starting-soon'), description: 'HAMAROSAN jelenet' },
    { key: '3', handler: () => handleSceneChange('break'), description: 'EBÉDSZÜNET jelenet' },
    { key: '4', handler: () => handleSceneChange('coffee-break'), description: 'KÁVÉSZÜNET jelenet' },
    { key: '5', handler: () => handleSceneChange('ending'), description: 'VÉGE jelenet' },
    { key: 't', handler: () => handleTimerToggle(), description: 'Időzítő indítása/leállítása' },
    { key: 'z', ctrl: true, handler: () => handleUndo(), description: 'Előző jelenet visszaállítása' },
    { key: '?', handler: () => setIsHotkeyDialogOpen(true), description: 'Gyorsbillentyűk megjelenítése' },
  ])

  return (
    <>
      <ControlPanel
        currentScene={currentScene || 'live'}
        onSceneChange={handleSceneChange}
        customMessage={customMessage || ''}
        onCustomMessageChange={setCustomMessage}
        theme={theme || 'kek'}
        onThemeChange={setTheme}
        accentColor={accentColor || '#06DCDC'}
        onAccentColorChange={setAccentColor}
        indicator={indicator || 'dots'}
        onIndicatorChange={setIndicator}
        timerMinutes={timerMinutes || 5}
        onTimerMinutesChange={setTimerMinutes}
        isTimerActive={isTimerActive || false}
        onTimerToggle={handleTimerToggle}
        showLive={showLive !== false}
        onShowLiveChange={setShowLive}
        liveLabel={liveLabel || 'Élő közvetítés'}
        onLiveLabelChange={setLiveLabel}
        showClock={showClock !== false}
        onShowClockChange={setShowClock}
        subtitle={subtitle || ''}
        onSubtitleChange={setSubtitle}
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
