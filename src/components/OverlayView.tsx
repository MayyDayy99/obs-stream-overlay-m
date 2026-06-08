import { useKV } from '@github/spark/hooks'
import { StreamOverlay } from '@/components/StreamOverlay'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Gear } from '@phosphor-icons/react'

type SceneType = 'live' | 'starting-soon' | 'break' | 'coffee-break' | 'ending'
type BackgroundType = 'gradient-wave' | 'geometric' | 'pulse' | 'particles'

export function OverlayView() {
  const [currentScene] = useKV<SceneType>('obs-current-scene', 'live')
  const [customMessage] = useKV<string>('obs-custom-message', '')
  const [background] = useKV<BackgroundType>('obs-background', 'gradient-wave')
  const [timerMinutes] = useKV<number>('obs-timer-minutes', 5)
  const [isTimerActive] = useKV<boolean>('obs-timer-active', false)

  return (
    <div className="relative w-full h-screen">
      <StreamOverlay
        scene={currentScene || 'live'}
        customMessage={customMessage || ''}
        background={background || 'gradient-wave'}
        timerSeconds={(timerMinutes || 5) * 60}
        isTimerActive={isTimerActive || false}
      />
      
      <Link to="/controller" className="fixed top-4 right-4 z-50">
        <Button 
          size="lg" 
          className="gap-2 bg-primary/90 hover:bg-primary backdrop-blur-sm"
        >
          <Gear className="w-5 h-5" weight="bold" />
          Vezérlő
        </Button>
      </Link>
    </div>
  )
}
