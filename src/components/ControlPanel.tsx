import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Keyboard
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type SceneType = 'live' | 'starting-soon' | 'break' | 'coffee-break' | 'ending'
type BackgroundType = 'gradient-wave' | 'geometric' | 'pulse' | 'particles'

interface ControlPanelProps {
  currentScene: SceneType
  onSceneChange: (scene: SceneType) => void
  customMessage: string
  onCustomMessageChange: (message: string) => void
  background: BackgroundType
  onBackgroundChange: (bg: BackgroundType) => void
  timerMinutes: number
  onTimerMinutesChange: (mins: number) => void
  isTimerActive: boolean
  onTimerToggle: () => void
  previousScene: SceneType | null
  onUndo: () => void
  onShowHotkeys: () => void
}

const sceneButtons: Array<{
  scene: SceneType
  label: string
  icon: any
  color: string
  hotkey: string
}> = [
  { scene: 'live', label: 'ÉLŐ', icon: Broadcast, color: 'primary', hotkey: '1' },
  { scene: 'starting-soon', label: 'HAMAROSAN', icon: Play, color: 'accent', hotkey: '2' },
  { scene: 'break', label: 'EBÉDSZÜNET', icon: ForkKnife, color: 'accent', hotkey: '3' },
  { scene: 'coffee-break', label: 'KÁVÉSZÜNET', icon: Coffee, color: 'accent', hotkey: '4' },
  { scene: 'ending', label: 'VÉGE', icon: HandWaving, color: 'accent', hotkey: '5' },
]

export function ControlPanel({
  currentScene,
  onSceneChange,
  customMessage,
  onCustomMessageChange,
  background,
  onBackgroundChange,
  timerMinutes,
  onTimerMinutesChange,
  isTimerActive,
  onTimerToggle,
  previousScene,
  onUndo,
  onShowHotkeys
}: ControlPanelProps) {
  const overlayUrl = `${window.location.origin}/`
  
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

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TextT size={24} weight="bold" />
            <h2 className="text-xl font-bold">Egyedi Üzenet</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-message">Szöveg</Label>
              <Textarea
                id="custom-message"
                placeholder="Írd be az egyedi üzenetet..."
                value={customMessage}
                onChange={(e) => onCustomMessageChange(e.target.value)}
                className="mt-2 min-h-[100px] text-base"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {customMessage.length} karakter
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onCustomMessageChange('')}
              disabled={!customMessage}
              className="w-full"
            >
              Törlés
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold">Háttér Animáció</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'gradient-wave', label: 'Színes Hullám' },
              { id: 'geometric', label: 'Geometrikus' },
              { id: 'pulse', label: 'Pulzáló' },
              { id: 'particles', label: 'Részecskék' },
            ].map((bg) => (
              <Button
                key={bg.id}
                variant={background === bg.id ? 'default' : 'outline'}
                onClick={() => onBackgroundChange(bg.id as BackgroundType)}
                className="h-20"
              >
                {bg.label}
              </Button>
            ))}
          </div>
        </Card>

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
