import { useKV } from '@github/spark/hooks'
import { StreamOverlay } from '@/components/StreamOverlay'

type SceneType = 'live' | 'starting-soon' | 'break' | 'coffee-break' | 'ending'
type BackgroundType = 'gradient-wave' | 'geometric' | 'pulse' | 'particles'

export function OverlayView() {
  const [currentScene] = useKV<SceneType>('obs-current-scene', 'live')
  const [customMessage] = useKV<string>('obs-custom-message', '')
  const [background] = useKV<BackgroundType>('obs-background', 'gradient-wave')
  const [timerMinutes] = useKV<number>('obs-timer-minutes', 5)
  const [isTimerActive] = useKV<boolean>('obs-timer-active', false)

  return (
    <StreamOverlay
      scene={currentScene || 'live'}
      customMessage={customMessage || ''}
      background={background || 'gradient-wave'}
      timerSeconds={(timerMinutes || 5) * 60}
      isTimerActive={isTimerActive || false}
    />
  )
}
