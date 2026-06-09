import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Play,
  Broadcast,
  Coffee,
  ForkKnife,
  HandWaving,
  Clock,
  TextT,
  ArrowCounterClockwise,
  Keyboard,
  Warning
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { SceneType, ThemeType, IndicatorType, FacultyType, LogoAnimType } from '@/components/StreamOverlay'

interface ControlPanelProps {
  currentScene: SceneType
  onSceneChange: (scene: SceneType) => void
  customMessage: string
  onCustomMessageChange: (message: string) => void
  theme: ThemeType
  onThemeChange: (theme: ThemeType) => void
  accentColor: string
  onAccentColorChange: (color: string) => void
  indicator: IndicatorType
  onIndicatorChange: (ind: IndicatorType) => void
  timerMinutes: number
  onTimerMinutesChange: (mins: number) => void
  isTimerActive: boolean
  onTimerToggle: () => void
  showLive: boolean
  onShowLiveChange: (v: boolean) => void
  liveLabel: string
  onLiveLabelChange: (v: string) => void
  showClock: boolean
  onShowClockChange: (v: boolean) => void
  subtitle: string
  onSubtitleChange: (subtitle: string) => void
  faculty: FacultyType
  onFacultyChange: (faculty: FacultyType) => void
  logoAnim: LogoAnimType
  onLogoAnimChange: (anim: LogoAnimType) => void
  floatingText: string
  onFloatingTextChange: (text: string) => void
  previousScene: SceneType | null
  onUndo: () => void
  onShowHotkeys: () => void
}

const sceneButtons: Array<{
  scene: SceneType
  label: string
  icon: any
  hotkey: string
}> = [
  { scene: 'live', label: 'ÉLŐ', icon: Broadcast, hotkey: '1' },
  { scene: 'starting-soon', label: 'HAMAROSAN', icon: Play, hotkey: '2' },
  { scene: 'break', label: 'EBÉDSZÜNET', icon: ForkKnife, hotkey: '3' },
  { scene: 'coffee-break', label: 'KÁVÉSZÜNET', icon: Coffee, hotkey: '4' },
  { scene: 'ending', label: 'VÉGE', icon: HandWaving, hotkey: '5' },
  { scene: 'technical-issue', label: 'TECHNIKAI SZÜNET', icon: Warning, hotkey: '6' },
]

const themeOptions: Array<{ id: ThemeType; label: string; preview: string }> = [
  { id: 'kek', label: 'Kék', preview: '#01298B' },
  { id: 'sotet', label: 'Sötét', preview: '#070B18' },
  { id: 'vilagos', label: 'Világos', preview: '#EEF1F8' },
]

const accentOptions = ['#06DCDC', '#3DE8E8', '#C9A24B', '#ffffff']

const indicatorOptions: Array<{ id: IndicatorType; label: string }> = [
  { id: 'dots', label: 'Pontok' },
  { id: 'bar', label: 'Sáv' },
  { id: 'pulse', label: 'Pulzus' },
  { id: 'hologram', label: 'Hologram' },
  { id: 'morph', label: 'Organikus' },
]

const logoAnimOptions: Array<{ id: LogoAnimType; label: string }> = [
  { id: 'breathe', label: 'Lélegzés (Letisztult)' },
  { id: 'spin3d', label: '3D Érme (Letisztult)' },
  { id: 'bounce', label: 'Pattogás (Vicces)' },
  { id: 'glitch', label: 'Glitch (Cyberpunk)' },
  { id: 'swing', label: 'Inga (Játékos)' },
]

const facultyOptions: Array<{ id: FacultyType; label: string }> = [
  { id: 'oe', label: 'Óbudai Egyetem (Fő)' },
  { id: 'amk', label: 'AMK - Alba Regia Műszaki Kar' },
  { id: 'bgk', label: 'BGK - Bánki Donát Gépész Kar' },
  { id: 'kgk', label: 'KGK - Keleti Károly Gazdasági Kar' },
  { id: 'kvk', label: 'KVK - Kandó Kálmán Villamos Kar' },
  { id: 'nik', label: 'NIK - Neumann János Informatikai Kar' },
  { id: 'rkk', label: 'RKK - Rejtő Sándor Könnyűipari Kar' },
  { id: 'ybl', label: 'YBL - Ybl Miklós Építéstudományi Kar' },
]

export function ControlPanel({
  currentScene,
  onSceneChange,
  customMessage,
  onCustomMessageChange,
  theme,
  onThemeChange,
  accentColor,
  onAccentColorChange,
  indicator,
  onIndicatorChange,
  timerMinutes,
  onTimerMinutesChange,
  isTimerActive,
  onTimerToggle,
  showLive,
  onShowLiveChange,
  liveLabel,
  onLiveLabelChange,
  showClock,
  onShowClockChange,
  subtitle,
  onSubtitleChange,
  faculty,
  onFacultyChange,
  logoAnim,
  onLogoAnimChange,
  floatingText,
  onFloatingTextChange,
  previousScene,
  onUndo,
  onShowHotkeys
}: ControlPanelProps) {
  const overlayUrl = `${window.location.origin}${window.location.pathname}`

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Óbudai Egyetem</h1>
          <p className="text-xl text-muted-foreground">Stream Vezérlő</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowHotkeys}
            className="gap-2"
          >
            <Keyboard size={18} />
            Gyorsbillentyűk
          </Button>
          {previousScene && previousScene !== currentScene && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              className="gap-2"
            >
              <ArrowCounterClockwise size={18} />
              Vissza
            </Button>
          )}
          <Badge
            variant={currentScene === 'live' ? 'default' : 'secondary'}
            className={cn(
              "px-4 py-2 text-sm font-bold",
              currentScene === 'live' && "animate-pulse"
            )}
          >
            {currentScene === 'live' ? '🔴 ÉLŐ' : '⏸️ SZÜNET'}
          </Badge>
        </div>
      </div>

      <Card className="p-6 border-primary/30">
        <h3 className="mb-3 text-lg font-bold">OBS Browser Source URL</h3>
        <div className="flex gap-3 items-center">
          <code className="flex-1 rounded-md bg-secondary px-4 py-3 text-sm font-mono">
            {overlayUrl}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(overlayUrl)
              toast.success('URL másolva a vágólapra')
            }}
          >
            Másolás
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajánlott felbontás: 1920x1080 | Add hozzá OBS-ben mint Browser Source
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scenes */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Jelenetek</h2>
          <div className="grid grid-cols-2 gap-4">
            {sceneButtons.map((btn) => {
              const Icon = btn.icon
              const isActive = currentScene === btn.scene

              return (
                <motion.div key={btn.scene} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => onSceneChange(btn.scene)}
                    className={cn(
                      "relative h-32 w-full flex-col gap-3 text-lg font-bold transition-all",
                      isActive && "ring-4 ring-primary shadow-[0_0_20px_rgba(200,0,0,0.5)]"
                    )}
                    variant={isActive ? 'default' : 'outline'}
                  >
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 font-mono text-xs font-bold"
                    >
                      {btn.hotkey}
                    </Badge>
                    <Icon size={40} weight="bold" />
                    {btn.label}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </Card>

        {/* Custom Message + Subtitle */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TextT size={24} weight="bold" />
            <h2 className="text-xl font-bold">Szövegek</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-message">Egyedi főcím (felülírja a jelenet címét)</Label>
              <Textarea
                id="custom-message"
                placeholder="Írd be az egyedi üzenetet..."
                value={customMessage}
                onChange={(e) => onCustomMessageChange(e.target.value)}
                className="mt-2 min-h-[80px] text-base"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                {customMessage.length} karakter
              </p>
            </div>
            <div>
              <Label htmlFor="subtitle">Alcím</Label>
              <Input
                id="subtitle"
                placeholder="Egyedi alcím szöveg..."
                value={subtitle}
                onChange={(e) => onSubtitleChange(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => { onCustomMessageChange(''); onSubtitleChange(''); }}
              disabled={!customMessage && !subtitle}
              className="w-full"
            >
              Szövegek törlése
            </Button>
          </div>
        </Card>

        {/* Theme */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Megjelenés</h2>
          <div className="space-y-4">
            <div>
              <Label>Háttér téma</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {themeOptions.map((t) => (
                  <Button
                    key={t.id}
                    variant={theme === t.id ? 'default' : 'outline'}
                    onClick={() => onThemeChange(t.id)}
                    className="h-16 flex-col gap-1"
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-white/20"
                      style={{ background: t.preview }}
                    />
                    <span className="text-xs">{t.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Kiemelő szín</Label>
              <div className="flex gap-3 mt-2">
                {accentOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => onAccentColorChange(color)}
                    className={cn(
                      "w-12 h-12 rounded-lg border-2 transition-all",
                      accentColor === color
                        ? "border-primary ring-2 ring-primary scale-110"
                        : "border-white/20 hover:scale-105"
                    )}
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Jelző animáció</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {indicatorOptions.map((ind) => (
                  <Button
                    key={ind.id}
                    variant={indicator === ind.id ? 'default' : 'outline'}
                    onClick={() => onIndicatorChange(ind.id)}
                    className="h-12"
                  >
                    {ind.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Floating Text */}
            <div className="pt-4 border-t border-border mt-2">
              <Label className="block mb-2">Lebegő Szöveg (Háttér)</Label>
              <div className="flex gap-2">
                <Input 
                  value={floatingText}
                  onChange={(e) => onFloatingTextChange(e.target.value)}
                  placeholder="Pl. OE, EDTI vagy 🚀"
                  maxLength={15}
                  className="flex-1"
                />
                <Button variant="outline" onClick={() => onFloatingTextChange('OE')}>
                  OE
                </Button>
                <Button variant="outline" onClick={() => onFloatingTextChange('EDTI')}>
                  EDTI
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tipp: Rövid szövegnél nagy betűk, hosszúnál kisebbek jelennek meg. Emojit (Win + .) is használhatsz!
              </p>
            </div>
            
            {/* Faculty & Logo Anim */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-4 border-t border-border">
              <div>
                <Label>Aktív Kar / Intézmény</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <select 
                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={faculty}
                    onChange={(e) => onFacultyChange(e.target.value as FacultyType)}
                  >
                    {facultyOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Logó Animáció</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <select 
                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={logoAnim}
                    onChange={(e) => onLogoAnimChange(e.target.value as LogoAnimType)}
                  >
                    {logoAnimOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </Card>

        {/* Timer */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock size={24} weight="bold" />
            <h2 className="text-xl font-bold">Időzítő</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="timer-minutes">Percek</Label>
              <Input
                id="timer-minutes"
                type="number"
                min="1"
                max="120"
                value={timerMinutes}
                onChange={(e) => onTimerMinutesChange(parseInt(e.target.value) || 1)}
                className="mt-2"
              />
            </div>
            <Button
              onClick={onTimerToggle}
              variant={isTimerActive ? 'destructive' : 'default'}
              className="w-full"
              size="lg"
            >
              {isTimerActive ? 'Időzítő Leállítása' : 'Időzítő Indítása'}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="mb-4 text-lg font-bold">Lábléc beállítások</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-live">Élő jelzés</Label>
                <Switch id="show-live" checked={showLive} onCheckedChange={onShowLiveChange} />
              </div>
              {showLive && (
                <div>
                  <Label htmlFor="live-label">Élő felirat</Label>
                  <Input
                    id="live-label"
                    value={liveLabel}
                    onChange={(e) => onLiveLabelChange(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="show-clock">Óra megjelenítése</Label>
                <Switch id="show-clock" checked={showClock} onCheckedChange={onShowClockChange} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-auto p-6">
        <h3 className="mb-2 text-lg font-bold">Használati Útmutató</h3>
        <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
          <div>
            <p className="font-semibold text-foreground">1. OBS Browser Source</p>
            <p>Másold be a fenti URL-t az OBS-be mint Browser Source (1920x1080)</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">2. Jelenetek Váltása</p>
            <p>Kattints a jelenet gombokra vagy használd a gyorsbillentyűket (1-5)</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">3. Időzítő</p>
            <p>Állítsd be a perceket és indítsd el a visszaszámlálást (T gomb)</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
