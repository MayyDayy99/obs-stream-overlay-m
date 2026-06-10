import { useSharedState } from '@/hooks/useSharedState'
import { StreamOverlay } from '@/components/StreamOverlay'
import { Link } from 'react-router-dom'
import type { SceneType, ThemeType, IndicatorType, LowerThirdData, ScheduleItem, SocialMessage } from '@/components/StreamOverlay'

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
  const [floatingText] = useSharedState<string>('obs-floating-text', 'OE')
  const [activeLowerThird] = useSharedState<LowerThirdData | null>('obs-lower-third-active', null)

  const [scheduleList] = useSharedState<ScheduleItem[]>('obs-schedule-list', [])
  const [activeScheduleId] = useSharedState<string | null>('obs-schedule-active', null)
  
  const [socialMessages] = useSharedState<SocialMessage[]>('obs-social-msgs', [])
  const [isSocialRotatorActive] = useSharedState<boolean>('obs-social-active', false)
  
  const [bgmVolume] = useSharedState<number>('obs-bgm-volume', 30)
  const [isBgmPlaying] = useSharedState<boolean>('obs-bgm-playing', false)

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
        floatingText={floatingText || 'OE'}
        activeLowerThird={activeLowerThird}
        scheduleList={scheduleList}
        activeScheduleId={activeScheduleId}
        socialMessages={socialMessages}
        isSocialRotatorActive={isSocialRotatorActive}
        bgmVolume={bgmVolume}
        isBgmPlaying={isBgmPlaying}
      />

      <Link 
        to="/controller" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-0 right-0 w-24 h-24 z-[60] opacity-0 cursor-pointer"
        title="Vezérlő"
      />
    </div>
  )
}
