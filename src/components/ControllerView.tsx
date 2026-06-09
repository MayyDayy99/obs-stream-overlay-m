import { useState } from 'react'
import { useSharedState, ROOM_ID } from '@/hooks/useSharedState'
import { ControlPanel } from '@/components/ControlPanel'
import { HotkeyDialog } from '@/components/HotkeyDialog'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { Button } from '@/components/ui/button'
import { Radio, Keyboard, Copy, DeviceTabletCamera } from '@phosphor-icons/react'
import type { SceneType, ThemeType, IndicatorType } from '@/components/StreamOverlay'

const sceneLabels: Record<SceneType, string> = {
  'live': 'ÉLŐ',
  'starting-soon': 'HAMAROSAN',
  'break': 'EBÉDSZÜNET',
  'coffee-break': 'KÁVÉSZÜNET',
  'ending': 'VÉGE'
}

import { useConnectionStatus } from '@/hooks/useSharedState'

export function ControllerView() {
  const syncStatus = useConnectionStatus()
  const [currentScene, setCurrentScene] = useSharedState<SceneType>('obs-current-scene', 'live')
  const [previousScene, setPreviousScene] = useState<SceneType | null>(null)
  const [customMessage, setCustomMessage] = useSharedState<string>('obs-custom-message', '')
  const [theme, setTheme] = useSharedState<ThemeType>('obs-theme', 'kek')
  const [accentColor, setAccentColor] = useSharedState<string>('obs-accent-color', '#06DCDC')
  const [indicator, setIndicator] = useSharedState<IndicatorType>('obs-indicator', 'hologram')
  const [timerMinutes, setTimerMinutes] = useSharedState<number>('obs-timer-minutes', 5)
  const [isTimerActive, setIsTimerActive] = useSharedState<boolean>('obs-timer-active', false)
  const [showLive, setShowLive] = useSharedState<boolean>('obs-show-live', true)
  const [liveLabel, setLiveLabel] = useSharedState<string>('obs-live-label', 'Élő közvetítés')
  const [showClock, setShowClock] = useSharedState<boolean>('obs-show-clock', true)
  const [subtitle, setSubtitle] = useSharedState<string>('obs-subtitle', '')
  const [faculty, setFaculty] = useSharedState<any>('obs-faculty', 'oe')
  const [logoAnim, setLogoAnim] = useSharedState<any>('obs-logo-anim', 'breathe')
  const [floatingText, setFloatingText] = useSharedState<string>('obs-floating-text', 'OE')
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

  const remoteUrl = `${window.location.origin}${window.location.pathname}?room=${ROOM_ID}#/controller`

  const handleCopyRemoteUrl = () => {
    navigator.clipboard.writeText(remoteUrl)
    toast.success('Link másolva! Küldd el magadnak és nyisd meg a tableten!')
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio size={32} weight="bold" className="text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Stream Vezérlő</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsHotkeyDialogOpen(true)}>
            <Keyboard size={16} className="mr-2" />
            Gyorsbillentyűk
          </Button>
        </div>

        <div className={`rounded-lg p-4 flex flex-col gap-3 border ${
          syncStatus === 'connected' ? 'bg-green-500/10 border-green-500/30' : 
          syncStatus === 'connecting' ? 'bg-yellow-500/10 border-yellow-500/30' : 
          'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DeviceTabletCamera size={24} className={
                syncStatus === 'connected' ? 'text-green-400' : 
                syncStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
              } />
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  Távoli Vezérlés
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    syncStatus === 'connected' ? 'bg-green-500/20 text-green-400' : 
                    syncStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      syncStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                      syncStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
                    }`} />
                    {syncStatus === 'connected' ? 'Kapcsolódva' : syncStatus === 'connecting' ? 'Csatlakozás...' : 'Nincs kapcsolat'}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Szoba: <code className="bg-white/10 px-1 rounded">{ROOM_ID}</code></p>
              </div>
            </div>
            <Button variant="default" size="sm" onClick={handleCopyRemoteUrl} className="whitespace-nowrap">
              <Copy size={16} className="mr-2" />
              Link Másolása
            </Button>
          </div>
          <p className="text-xs text-muted-foreground break-all">{remoteUrl}</p>
        </div>

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
          faculty={faculty}
          onFacultyChange={setFaculty}
          logoAnim={logoAnim}
          onLogoAnimChange={setLogoAnim}
          floatingText={floatingText}
          onFloatingTextChange={setFloatingText}
          previousScene={previousScene}
          onUndo={handleUndo}
          onShowHotkeys={() => setIsHotkeyDialogOpen(true)}
        />

        <HotkeyDialog
          open={isHotkeyDialogOpen}
          onOpenChange={setIsHotkeyDialogOpen}
        />

        <Toaster />
      </div>
    </div>
  )
}
