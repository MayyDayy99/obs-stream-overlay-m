import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard } from '@phosphor-icons/react'

interface HotkeyItem {
  keys: string[]
  description: string
  category: string
}

interface HotkeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const hotkeys: HotkeyItem[] = [
  { keys: ['1'], description: 'ÉLŐ jelenet', category: 'Jelenetek' },
  { keys: ['2'], description: 'HAMAROSAN jelenet', category: 'Jelenetek' },
  { keys: ['3'], description: 'EBÉDSZÜNET jelenet', category: 'Jelenetek' },
  { keys: ['4'], description: 'KÁVÉSZÜNET jelenet', category: 'Jelenetek' },
  { keys: ['5'], description: 'VÉGE jelenet', category: 'Jelenetek' },
  { keys: ['T'], description: 'Időzítő indítása/leállítása', category: 'Időzítő' },
  { keys: ['Ctrl', 'Z'], description: 'Előző jelenet visszaállítása', category: 'Műveletek' },
  { keys: ['?'], description: 'Gyorsbillentyűk megjelenítése', category: 'Súgó' },
]

export function HotkeyDialog({ open, onOpenChange }: HotkeyDialogProps) {
  const categories = [...new Set(hotkeys.map(h => h.category))]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard size={28} weight="bold" />
            Gyorsbillentyűk
          </DialogTitle>
          <DialogDescription>
            Használd ezeket a billentyűkombinációkat a gyors jelenetváltáshoz élő közvetítés közben
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-3 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {category}
              </h3>
              <div className="space-y-2">
                {hotkeys
                  .filter((h) => h.category === category)
                  .map((hotkey, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm font-medium">{hotkey.description}</span>
                      <div className="flex gap-1">
                        {hotkey.keys.map((key, i) => (
                          <div key={i} className="flex items-center gap-1">
                            {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs px-2 py-1 font-bold"
                            >
                              {key}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
