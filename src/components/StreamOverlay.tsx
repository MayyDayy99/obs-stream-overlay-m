import { useEffect, useState } from 'react'
import oeLogo from '@/assets/images/oe-logo.svg'
import oeLogoColor from '@/assets/images/oe-logo-color.svg'
import { FloatingOE } from './FloatingOE'

export type SceneType = 'live' | 'starting-soon' | 'break' | 'coffee-break' | 'ending' | 'technical-issue'
export type ThemeType = 'kek' | 'sotet' | 'vilagos'
export type IndicatorType = 'dots' | 'bar' | 'pulse' | 'hologram' | 'morph'

export interface LowerThirdData {
  id: string
  name: string
  title: string
}

interface StreamOverlayProps {
  scene: SceneType
  customMessage: string
  theme: ThemeType
  accentColor: string
  indicator: IndicatorType
  showLive: boolean
  liveLabel: string
  showClock: boolean
  subtitle: string
  timerSeconds: number
  isTimerActive: boolean
  floatingText: string
  activeLowerThird: LowerThirdData | null
}

const sceneMessages: Record<SceneType, string> = {
  'live': '',
  'starting-soon': 'Hamarosan kezdünk',
  'break': 'Ebédszünet',
  'coffee-break': 'Kávészünet',
  'ending': 'Köszönjük a figyelmet',
  'technical-issue': 'Technikai szünet',
}

const sceneSubtitles: Record<SceneType, string> = {
  'live': '',
  'starting-soon': 'A közvetítés hamarosan elindul — köszönjük a türelmet.',
  'break': 'Hamarosan folytatjuk a közvetítést.',
  'coffee-break': 'Egy rövid szünet után folytatjuk.',
  'ending': 'Köszönjük, hogy velünk voltatok!',
  'technical-issue': 'Kérjük türelmüket, dolgozunk a hiba elhárításán.',
}

const THEMES = {
  kek:     { '--bg': '#01298B', '--glow': '#1D4FD0', '--fg': '#ffffff', '--muted': 'rgba(255,255,255,.66)', '--line': 'rgba(255,255,255,.16)', '--vig': '.30' },
  sotet:   { '--bg': '#070B18', '--glow': '#16306e', '--fg': '#ffffff', '--muted': 'rgba(255,255,255,.60)', '--line': 'rgba(255,255,255,.12)', '--vig': '.55' },
  vilagos: { '--bg': '#EEF1F8', '--glow': '#9fb6ee', '--fg': '#01298B', '--muted': 'rgba(1,41,139,.60)', '--line': 'rgba(1,41,139,.16)', '--vig': '.05' },
}

function pad(n: number) { return String(n).padStart(2, '0') }

function Headline({ text }: { text: string }) {
  const words = text.trim().split(/\s+/)
  if (words.length < 2) return <h1 className="overlay-headline">{text}</h1>
  const last = words.pop()!
  return <h1 className="overlay-headline">{words.join(' ')} <span className="accent-word">{last}</span></h1>
}

function Indicator({ kind }: { kind: IndicatorType }) {
  if (kind === 'bar') return <div className="overlay-indicator"><div className="overlay-bar" /></div>
  if (kind === 'pulse') return (
    <div className="overlay-indicator">
      <div className="overlay-pulse">
        <span className="ring" />
        <span className="ring" />
        <span className="core" />
      </div>
    </div>
  )
  if (kind === 'hologram') return (
    <div className="overlay-indicator">
      <div className="overlay-hologram">
        <span className="holo-ring" />
        <span className="holo-ring" />
        <span className="holo-core" />
      </div>
    </div>
  )
  if (kind === 'morph') return <div className="overlay-indicator"><div className="overlay-morph" /></div>

  return (
    <div className="overlay-indicator">
      <div className="overlay-dots"><span /><span /><span /></div>
    </div>
  )
}

function Countdown({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60)

  useEffect(() => {
    const KEY = 'oe_soon_end'
    let end = parseInt(localStorage.getItem(KEY) || '0', 10)
    const storedMin = parseInt(localStorage.getItem('oe_soon_min') || '-1', 10)
    const now = Date.now()
    if (!end || end < now || storedMin !== minutes) {
      end = now + minutes * 60 * 1000
      localStorage.setItem(KEY, String(end))
      localStorage.setItem('oe_soon_min', String(minutes))
    }
    const tick = () => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [minutes])

  if (left <= 0) return <div className="overlay-countdown done">Mindjárt kezdünk!</div>
  const m = Math.floor(left / 60), s = left % 60
  return (
    <div className="overlay-countdown">
      <span>{pad(m)}</span><span className="col">:</span><span>{pad(s)}</span>
    </div>
  )
}

function Clock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const f = () => {
      const d = new Date()
      setT(pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()))
    }
    f()
    const id = setInterval(f, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="overlay-clock">{t}</span>
}

export function StreamOverlay({
  scene,
  customMessage,
  theme,
  accentColor,
  indicator,
  showLive,
  liveLabel,
  showClock,
  subtitle,
  timerSeconds,
  isTimerActive,
  floatingText,
  activeLowerThird,
}: StreamOverlayProps) {
  const isLive = scene === 'live'
  const themeVars = THEMES[theme] || THEMES.kek
  const isVilagos = theme === 'vilagos'

  const styleVars: Record<string, string> = { 
    ...themeVars, 
    '--accent': accentColor,
    background: isLive ? 'transparent' : 'var(--bg)'
  }
  
  const headlineText = customMessage || sceneMessages[scene] || ''
  const subtitleText = subtitle || sceneSubtitles[scene] || ''
  const timerMinutes = Math.ceil(timerSeconds / 60)

  return (
    <div className={`overlay-scene ${isLive ? 'is-live' : ''}`} data-theme={theme} style={styleVars as React.CSSProperties}>
      <div className="overlay-bg" style={{ opacity: isLive ? 0.6 : 1 }}>
        <FloatingOE text={floatingText || 'OE'} />
        <div className="overlay-noise" />
        <div className="overlay-orb a" />
        <div className="overlay-orb b" />
        <div className="overlay-orb c" />
        <div className="overlay-orb d" />
        <div className="overlay-orb e" />
      </div>
      
      {!isLive && <div className="overlay-vignette" />}

      {!isLive && (
        <div className="overlay-center">
          <div className="overlay-logo-container">
            <img 
              src={isVilagos ? oeLogoColor : oeLogo} 
              alt="Logo" 
              className="overlay-logo" 
            />
          </div>
          <Headline text={headlineText} />
          {isTimerActive
            ? <Countdown minutes={timerMinutes} key={timerMinutes} />
            : <Indicator kind={indicator} />}
          {subtitleText && <p className="overlay-subtitle">{subtitleText}</p>}
        </div>
      )}

      <div className="overlay-footer">
        {showLive
          ? <span className="overlay-live"><span className="overlay-live-dot" />{liveLabel}</span>
          : <span />}
        <span className="spacer" />
        {showClock ? <Clock /> : <span />}
      </div>

      {/* Lower Third */}
      <div className={`overlay-lower-third ${activeLowerThird ? 'is-visible' : ''}`}>
        {activeLowerThird && (
          <div className="overlay-lower-third-content">
            <div className="overlay-lower-third-name">{activeLowerThird.name}</div>
            {activeLowerThird.title && (
              <div className="overlay-lower-third-title">{activeLowerThird.title}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
