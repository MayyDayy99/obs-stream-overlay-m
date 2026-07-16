import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import oeLogo from '@/assets/images/oe-logo.svg'
import oeLogoColor from '@/assets/images/oe-logo-color.svg'
import { FloatingOE } from './FloatingOE'

export type SceneType = 'live' | 'starting-soon' | 'break' | 'coffee-break' | 'ending' | 'technical-issue'
export type ThemeType = 'kek' | 'sotet' | 'vilagos'
export type IndicatorType = 'dots' | 'bar' | 'pulse' | 'hologram' | 'morph'
// Réteg mód: 'all' = minden egyben (eredeti), 'bottom' = alsó réteg (kamera alá),
// 'top' = felső réteg (kamera fölé)
export type OverlayLayer = 'all' | 'bottom' | 'top'

export interface LowerThirdData {
  id: string
  name: string
  title: string
}

export interface ScheduleItem {
  id: string
  time: string
  title: string
  speaker: string
}

export interface SocialMessage {
  id: string
  text: string
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
  scheduleList: ScheduleItem[]
  activeScheduleId: string | null
  socialMessages: SocialMessage[]
  isSocialRotatorActive: boolean
  bgmVolume: number
  isBgmPlaying: boolean
  layer?: OverlayLayer
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
  kek:     { '--bg': '#01298B', '--glow': '#1D4FD0', '--fg': '#ffffff', '--muted': 'rgba(255,255,255,.66)', '--line': 'rgba(255,255,255,.16)', '--vig': '.30', '--lower-bg': 'rgba(0,18,66,0.85)' },
  sotet:   { '--bg': '#070B18', '--glow': '#16306e', '--fg': '#ffffff', '--muted': 'rgba(255,255,255,.60)', '--line': 'rgba(255,255,255,.12)', '--vig': '.55', '--lower-bg': 'rgba(2,3,8,0.9)' },
  vilagos: { '--bg': '#EEF1F8', '--glow': '#9fb6ee', '--fg': '#01298B', '--muted': 'rgba(1,41,139,.60)', '--line': 'rgba(1,41,139,.16)', '--vig': '.05', '--lower-bg': 'rgba(255,255,255,0.95)' },
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
  scheduleList = [],
  activeScheduleId = null,
  socialMessages = [],
  isSocialRotatorActive = false,
  bgmVolume = 50,
  isBgmPlaying = false,
  layer = 'all',
}: StreamOverlayProps) {
  const isLive = scene === 'live'
  const themeVars = THEMES[theme] || THEMES.kek
  const isVilagos = theme === 'vilagos'

  const isBottomLayer = layer === 'bottom'
  // Layer 1 (bottom / kamera alá): mindig a márkázott háttér, fedés és feliratok nélkül.
  // Layer 2 (top / kamera fölé) és 'all': eredeti viselkedés (élőben átlátszó, szünetben fedés).
  const showBackground = isBottomLayer ? true : !isLive   // animált háttér + vignetta
  const showCover = isBottomLayer ? false : !isLive        // logó + főcím + visszaszámláló
  const showForeground = !isBottomLayer                    // lábléc, alsó sáv, menetrend, közösségi
  const opaqueBg = isBottomLayer ? true : !isLive          // átlátszatlan --bg kitöltés

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = bgmVolume / 100
      if (isBgmPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play blocked:", e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isBgmPlaying, bgmVolume])

  const styleVars: Record<string, string> = { 
    ...themeVars, 
    '--accent': accentColor,
    background: opaqueBg ? 'var(--bg)' : 'transparent'
  }
  
  const headlineText = customMessage || sceneMessages[scene] || ''
  const subtitleText = subtitle || sceneSubtitles[scene] || ''
  const timerMinutes = Math.ceil(timerSeconds / 60)

  return (
    <div className={`overlay-scene ${isLive ? 'is-live' : ''}`} data-theme={theme} style={styleVars as React.CSSProperties}>
      <div className="overlay-bg" style={{ opacity: showBackground ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <FloatingOE text={floatingText || 'OE'} />
        <div className="overlay-noise" />
        <div className="overlay-orb a" />
        <div className="overlay-orb b" />
        <div className="overlay-orb c" />
        <div className="overlay-orb d" />
        <div className="overlay-orb e" />
      </div>
      
      {showBackground && <div className="overlay-vignette" />}

      {showCover && (
        <div className="overlay-center">
          <div className="overlay-anchor overlay-anchor-logo">
            <div className="overlay-logo-container">
              <img
                src={isVilagos ? oeLogoColor : oeLogo}
                alt="Logo"
                className="overlay-logo"
              />
            </div>
          </div>
          <div className="overlay-anchor overlay-anchor-headline">
            <Headline text={headlineText} />
          </div>
          <div className="overlay-anchor overlay-anchor-status">
            {isTimerActive
              ? <Countdown minutes={timerMinutes} key={timerMinutes} />
              : <Indicator kind={indicator} />}
          </div>
          <div className="overlay-anchor overlay-anchor-subtitle">
            {subtitleText && <p className="overlay-subtitle">{subtitleText}</p>}
          </div>
        </div>
      )}

      {showForeground && (
        <div className="overlay-footer">
          {showLive
            ? <span className="overlay-live"><span className="overlay-live-dot" />{liveLabel}</span>
            : <span />}
          <span className="spacer" />
          {showClock ? <Clock /> : <span />}
        </div>
      )}

      {/* Lower Third */}
      <AnimatePresence mode="wait">
        {showForeground && activeLowerThird && (
          <motion.div 
            key={activeLowerThird.id}
            className="overlay-lower-third"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="overlay-lower-third-content">
              <div className="overlay-lower-third-name">{activeLowerThird.name}</div>
              {activeLowerThird.title && (
                <div className="overlay-lower-third-title">{activeLowerThird.title}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Up Next / Schedule */}
      <AnimatePresence mode="wait">
        {showForeground && activeScheduleId && (
          <motion.div
            key={activeScheduleId}
            className="overlay-schedule"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {(() => {
              const item = scheduleList.find(s => s.id === activeScheduleId)
              if (!item) return null
              return (
                <div className="overlay-schedule-content">
                  <div className="overlay-schedule-label">KÖVETKEZŐ</div>
                  {item.time && <div className="overlay-schedule-time">{item.time}</div>}
                  {item.speaker && <div className="overlay-schedule-speaker">{item.speaker}</div>}
                  <div className="overlay-schedule-title">{item.title}</div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Media Rotator */}
      <AnimatePresence>
        {showForeground && isSocialRotatorActive && socialMessages.length > 0 && (
          <SocialRotator messages={socialMessages} />
        )}
      </AnimatePresence>

      {/* Audio Element – csak a felső / egyesített rétegen, hogy ne szóljon duplán */}
      {!isBottomLayer && (
        <audio
          ref={audioRef}
          src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"
          loop
          preload="auto"
        />
      )}
    </div>
  )
}

function SocialRotator({ messages }: { messages: SocialMessage[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => {
      setIndex(i => (i + 1) % messages.length)
    }, 15000) // Rotate every 15s
    return () => clearInterval(id)
  }, [messages.length])

  const msg = messages[index]
  if (!msg) return null

  return (
    <motion.div
      className="overlay-social"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="overlay-social-text"
        >
          {msg.text}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
