import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import type { SceneType, ThemeType, IndicatorType, LowerThirdData, ScheduleItem, SocialMessage } from '@/components/StreamOverlay'
import { ExcelManager } from '@/components/ExcelManager'

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
  floatingText: string
  onFloatingTextChange: (text: string) => void
  lowerThirdsList: LowerThirdData[]
  onLowerThirdsListChange: (list: LowerThirdData[] | ((prev: LowerThirdData[]) => LowerThirdData[])) => void
  activeLowerThird: LowerThirdData | null
  onActiveLowerThirdChange: (item: LowerThirdData | null) => void
  previousScene: SceneType | null
  onUndo: () => void
  onShowHotkeys: () => void
  
  scheduleList: ScheduleItem[]
  onScheduleListChange: (list: ScheduleItem[] | ((prev: ScheduleItem[]) => ScheduleItem[])) => void
  activeScheduleId: string | null
  onActiveScheduleIdChange: (id: string | null) => void
  
  socialMessages: SocialMessage[]
  onSocialMessagesChange: (list: SocialMessage[] | ((prev: SocialMessage[]) => SocialMessage[])) => void
  isSocialRotatorActive: boolean
  onSocialRotatorActiveChange: (v: boolean) => void
  
  bgmVolume: number
  onBgmVolumeChange: (v: number) => void
  isBgmPlaying: boolean
  onBgmPlayingChange: (v: boolean) => void
  
  obsData: any
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
  floatingText,
  onFloatingTextChange,
  lowerThirdsList,
  onLowerThirdsListChange,
  activeLowerThird,
  onActiveLowerThirdChange,
  previousScene,
  onUndo,
  onShowHotkeys,
  scheduleList,
  onScheduleListChange,
  activeScheduleId,
  onActiveScheduleIdChange,
  socialMessages,
  onSocialMessagesChange,
  isSocialRotatorActive,
  onSocialRotatorActiveChange,
  bgmVolume,
  onBgmVolumeChange,
  isBgmPlaying,
  onBgmPlayingChange,
  obsData,
}: ControlPanelProps) {
  const overlayUrl = `${window.location.origin}${window.location.pathname}`
  const [newName, setNewName] = useState('')
  const [newTitle, setNewTitle] = useState('')

  const [newScheduleTime, setNewScheduleTime] = useState('')
  const [newScheduleTitle, setNewScheduleTitle] = useState('')
  const [newScheduleSpeaker, setNewScheduleSpeaker] = useState('')

  const [newSocialMsg, setNewSocialMsg] = useState('')

  const handleAddSchedule = () => {
    if (!newScheduleTime.trim() || !newScheduleTitle.trim()) return
    const newItem: ScheduleItem = {
      id: Math.random().toString(36).substring(2, 9),
      time: newScheduleTime.trim(),
      title: newScheduleTitle.trim(),
      speaker: newScheduleSpeaker.trim()
    }
    onScheduleListChange(prev => [...prev, newItem])
    setNewScheduleTime('')
    setNewScheduleTitle('')
    setNewScheduleSpeaker('')
  }
  
  const handleRemoveSchedule = (id: string) => {
    onScheduleListChange(prev => prev.filter(item => item.id !== id))
    if (activeScheduleId === id) onActiveScheduleIdChange(null)
  }

  const handleAddSocial = () => {
    if (!newSocialMsg.trim()) return
    const newItem: SocialMessage = {
      id: Math.random().toString(36).substring(2, 9),
      text: newSocialMsg.trim()
    }
    onSocialMessagesChange(prev => [...prev, newItem])
    setNewSocialMsg('')
  }
  const handleRemoveSocial = (id: string) => {
    onSocialMessagesChange(prev => prev.filter(item => item.id !== id))
  }

  const handleAddLowerThird = () => {
    if (!newName.trim()) return
    const newItem: LowerThirdData = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      title: newTitle.trim(),
    }
    onLowerThirdsListChange(prev => [...prev, newItem])
    setNewName('')
    setNewTitle('')
  }

  const handleRemoveLowerThird = (id: string) => {
    onLowerThirdsListChange(prev => prev.filter(item => item.id !== id))
    if (activeLowerThird?.id === id) {
      onActiveLowerThirdChange(null)
    }
  }

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

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-14">
          <TabsTrigger value="live" className="text-lg font-bold">🔴 Élőzés</TabsTrigger>
          <TabsTrigger value="prep" className="text-lg font-bold">⚙️ Előkészület</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="outline-none">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
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
              
              {/* Floating Text LIVE */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TextT size={24} weight="bold" />
                  <h2 className="text-xl font-bold">Lebegő Szöveg (Háttér)</h2>
                </div>
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
                </div>
              </Card>

              {/* Social Media Rotator LIVE */}
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TextT size={24} weight="bold" />
                    <h2 className="text-xl font-bold">Közösségi Rotátor</h2>
                  </div>
                  <Switch 
                    checked={isSocialRotatorActive} 
                    onCheckedChange={onSocialRotatorActiveChange} 
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isSocialRotatorActive 
                    ? "A rotátor aktív és váltogatja a megadott szövegeket." 
                    : "A rotátor kikapcsolva."}
                </p>
              </Card>

              {/* BGM LIVE */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Play size={24} weight="bold" />
                  <h2 className="text-xl font-bold">Háttérzene (Szünetekre)</h2>
                </div>
                <div className="space-y-4">
                  <Button
                    onClick={() => onBgmPlayingChange(!isBgmPlaying)}
                    variant={isBgmPlaying ? 'destructive' : 'default'}
                    className="w-full font-bold"
                  >
                    {isBgmPlaying ? '⏸️ Zene Leállítása' : '▶️ Zene Indítása'}
                  </Button>
                  <div>
                    <Label>Hangerő ({bgmVolume}%)</Label>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={bgmVolume} 
                      onChange={(e) => onBgmVolumeChange(parseInt(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
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
              </Card>

              {/* Schedule LIVE */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TextT size={24} weight="bold" />
                  <h2 className="text-xl font-bold">Menetrend (Következő)</h2>
                </div>
                <div className="space-y-4">
                  {scheduleList.length > 0 ? (
                    <div className="space-y-2">
                      {scheduleList.map(item => {
                        const isActive = activeScheduleId === item.id
                        return (
                          <div key={item.id} className={cn(
                            "flex items-center justify-between p-3 rounded-lg border gap-3 transition-colors",
                            isActive ? "border-primary bg-primary/10" : "border-border"
                          )}>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold whitespace-nowrap">{item.time}</div>
                              <div className="text-sm font-semibold truncate">{item.speaker}</div>
                              <div className="text-xs text-muted-foreground truncate">{item.title}</div>
                            </div>
                            <Button 
                              variant={isActive ? 'default' : 'secondary'}
                              size="sm"
                              className="font-bold"
                              onClick={() => onActiveScheduleIdChange(isActive ? null : item.id)}
                            >
                              {isActive ? 'Kinn van' : 'Mutat'}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nincs menetrend felvéve.</p>
                  )}
                </div>
              </Card>

              {/* Lower Thirds LIVE */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TextT size={24} weight="bold" />
                  <h2 className="text-xl font-bold">Előadók (Gyorsvezérlő)</h2>
                </div>
                <div className="space-y-4">
                  {lowerThirdsList.length > 0 ? (
                    <div className="space-y-2">
                      {lowerThirdsList.map(item => {
                        const isActive = activeLowerThird?.id === item.id
                        return (
                          <div key={item.id} className={cn(
                            "flex items-center justify-between p-3 rounded-lg border gap-3 transition-colors",
                            isActive ? "border-primary bg-primary/10" : "border-border"
                          )}>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold break-words whitespace-pre-wrap">{item.name}</div>
                              {item.title && <div className="text-sm text-muted-foreground break-words whitespace-pre-wrap">{item.title}</div>}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button 
                                variant={isActive ? 'default' : 'secondary'}
                                size="lg"
                                className="w-24 font-bold"
                                onClick={() => onActiveLowerThirdChange(isActive ? null : item)}
                              >
                                {isActive ? 'Rejtés' : 'Mutat'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nincsenek mentett előadók. Az Előkészület fülön tudsz hozzáadni.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prep" className="outline-none">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <ExcelManager 
                onLowerThirdsListChange={onLowerThirdsListChange}
                onScheduleListChange={onScheduleListChange}
                onSocialMessagesChange={onSocialMessagesChange}
              />

              {/* OBS Connection Settings */}
              <Card className="p-6 border-l-4 border-l-orange-500">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Broadcast size={24} weight="bold" />
                    <h2 className="text-xl font-bold">OBS WebSocket Kapcsolat</h2>
                  </div>
                  <Badge variant={obsData?.isConnected ? "default" : "destructive"}>
                    {obsData?.isConnected ? "Kapcsolódva" : "Nincs kapcsolat"}
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>IP Cím és Port</Label>
                      <Input 
                        value={obsData?.obsUrl} 
                        onChange={e => obsData?.setObsUrl(e.target.value)} 
                        placeholder="ws://localhost:4455"
                      />
                    </div>
                    <div>
                      <Label>Jelszó</Label>
                      <Input 
                        type="password"
                        value={obsData?.obsPassword} 
                        onChange={e => obsData?.setObsPassword(e.target.value)} 
                        placeholder="OBS jelszó"
                      />
                    </div>
                  </div>
                  <Button 
                    variant={obsData?.isConnected ? "outline" : "default"} 
                    className="w-full"
                    onClick={() => obsData?.isConnected ? obsData?.disconnect() : obsData?.connect()}
                  >
                    {obsData?.isConnected ? "Lecsatlakozás" : "Csatlakozás"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    A gombok (ÉLŐ, HAMAROSAN, stb.) automatikusan váltják az OBS jeleneteket, ha csatlakozva vagy!
                  </p>
                </div>
              </Card>

              {/* Custom Message + Subtitle */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TextT size={24} weight="bold" />
                  <h2 className="text-xl font-bold">Főcím / Alcím</h2>
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
                <h2 className="mb-4 text-xl font-bold">Megjelenés (Téma & Színek)</h2>
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
                </div>
              </Card>

              {/* Social Rotator PREP */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TextT size={24} weight="bold" />
                  <h2 className="text-xl font-bold">Közösségi Rotátor Szövegek</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Pl. Kövess minket: @obudai_egyetem" 
                      value={newSocialMsg}
                      onChange={e => setNewSocialMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSocial()}
                    />
                    <Button onClick={handleAddSocial} disabled={!newSocialMsg.trim()}>
                      Hozzáadás
                    </Button>
                  </div>
                  {socialMessages.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {socialMessages.map(msg => (
                        <div key={msg.id} className="flex items-center justify-between p-2 rounded border gap-3">
                          <span className="font-semibold">{msg.text}</span>
                          <Button variant="destructive" size="sm" onClick={() => handleRemoveSocial(msg.id)}>
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Schedule PREP */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TextT size={24} weight="bold" />
                  <h2 className="text-xl font-bold">Menetrend Szerkesztő</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2 p-4 border border-border rounded-lg bg-black/5">
                    <Label>Új hozzáadása</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input 
                        placeholder="Időpont (pl. 14:00)" 
                        value={newScheduleTime} 
                        onChange={e => setNewScheduleTime(e.target.value)}
                        className="col-span-1"
                      />
                      <Input 
                        placeholder="Előadó neve" 
                        value={newScheduleSpeaker} 
                        onChange={e => setNewScheduleSpeaker(e.target.value)}
                        className="col-span-2"
                      />
                    </div>
                    <Input 
                      placeholder="Előadás címe" 
                      value={newScheduleTitle} 
                      onChange={e => setNewScheduleTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSchedule()}
                    />
                    <Button onClick={handleAddSchedule} disabled={!newScheduleTime.trim() || !newScheduleTitle.trim()}>
                      Hozzáadás
                    </Button>
                  </div>

                  {scheduleList.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <Label>Mentett programpontok (Törlés)</Label>
                      {scheduleList.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold whitespace-nowrap">{item.time}</div>
                            <div className="text-sm font-semibold truncate">{item.speaker}</div>
                            <div className="text-xs text-muted-foreground truncate">{item.title}</div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRemoveSchedule(item.id)}
                          >
                            Törlés
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Lower Thirds PREP */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TextT size={24} weight="bold" />
                  <h2 className="text-xl font-bold">Alsósáv Szerkesztő</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid gap-2 p-4 border border-border rounded-lg bg-black/5">
                    <Label>Új hozzáadása</Label>
                    <Textarea 
                      placeholder="Név (több sorba is írhatod)" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                    <Textarea 
                      placeholder="Titulus (pl. Dékán)" 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                    <Button onClick={handleAddLowerThird} disabled={!newName.trim()}>
                      Hozzáadás
                    </Button>
                  </div>

                  {lowerThirdsList.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <Label>Mentett előadók listája (Törlés)</Label>
                      {lowerThirdsList.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold break-words whitespace-pre-wrap">{item.name}</div>
                            {item.title && <div className="text-sm text-muted-foreground break-words whitespace-pre-wrap">{item.title}</div>}
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRemoveLowerThird(item.id)}
                          >
                            Törlés
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Footer settings */}
              <Card className="p-6">
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
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
