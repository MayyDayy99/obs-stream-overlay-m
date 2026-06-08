import { useSharedState } from '@/hooks/useSharedState'
import { StreamOverlay } from '@/components/StreamOverlay'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { SceneType, ThemeType, IndicatorType } from '@/components/StreamOverlay'

export function OverlayView() {
  const [currentScene] = useSharedState<SceneType>('obs-current-scene', 'live')
  const [customMessage] = useSharedState<string>('obs-custom-message', '')
  const [theme] = useSharedState<ThemeType>('obs-theme', 'kek')
  const [accentColor] = useSharedState<string>('obs-accent-color', '#06DCDC')
  const [indicator] = useSharedState<IndicatorType>('obs-indicator', 'dots')
  const [timerMinutes] = useSharedState<number>('obs-timer-minutes', 5)
  const [isTimerActive] = useSharedState<boolean>('obs-timer-active', false)
  const [showLive] = useSharedState<boolean>('obs-show-live', true)
  const [liveLabel] = useSharedState<string>('obs-live-label', 'Élő közvetítés')
  const [showClock] = useSharedState<boolean>('obs-show-clock', true)
  const [subtitle] = useSharedState<string>('obs-subtitle', '')

  return (
    <div className="relative w-full h-screen">
      <StreamOverlay
        scene={currentScene || 'live'}
        customMessage={customMessage || ''}
        theme={theme || 'kek'}
        accentColor={accentColor || '#06DCDC'}
        indicator={indicator || 'dots'}
        showLive={showLive !== false}
        liveLabel={liveLabel || 'Élő közvetítés'}
        showClock={showClock !== false}
        subtitle={subtitle || ''}
        timerSeconds={(timerMinutes || 5) * 60}
        isTimerActive={isTimerActive || false}
      />

      <Link to="/controller" className="fixed top-4 right-4 z-[60]">
        <Button
          size="lg"
          className="gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white border border-white/20"
        >
          ⚙️ Vezérlő
        </Button>
      </Link>
    </div>
  )
}
