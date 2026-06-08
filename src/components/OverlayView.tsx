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
  const [indicator] = useSharedState<IndicatorType>('obs-indicator', 'hologram')
  const [timerMinutes] = useSharedState<number>('obs-timer-minutes', 5)
  const [isTimerActive] = useSharedState<boolean>('obs-timer-active', false)
  const [showLive] = useSharedState<boolean>('obs-show-live', true)
  const [liveLabel] = useSharedState<string>('obs-live-label', 'Élő közvetítés')
  const [showClock] = useSharedState<boolean>('obs-show-clock', true)
  const [subtitle] = useSharedState<string>('obs-subtitle', '')
  const [faculty] = useSharedState<any>('obs-faculty', 'oe')
  const [logoAnim] = useSharedState<any>('obs-logo-anim', 'breathe')

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
        faculty={faculty || 'oe'}
        logoAnim={logoAnim || 'breathe'}
      />

      <Link 
        to="/controller" 
        className="fixed top-0 right-0 w-24 h-24 z-[60] opacity-0 cursor-pointer"
        title="Vezérlő"
      />
    </div>
  )
}
