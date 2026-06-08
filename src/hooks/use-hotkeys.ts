import { useEffect, useCallback, useRef } from 'react'

export type HotkeyHandler = (event: KeyboardEvent) => void

interface HotkeyConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: HotkeyHandler
  description?: string
}

export function useHotkeys(hotkeys: HotkeyConfig[], enabled: boolean = true) {
  const savedHotkeys = useRef<HotkeyConfig[]>(hotkeys)

  useEffect(() => {
    savedHotkeys.current = hotkeys
  }, [hotkeys])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    for (const hotkey of savedHotkeys.current) {
      const keyMatch = event.key.toLowerCase() === hotkey.key.toLowerCase()
      const ctrlMatch = hotkey.ctrl === undefined || hotkey.ctrl === event.ctrlKey
      const shiftMatch = hotkey.shift === undefined || hotkey.shift === event.shiftKey
      const altMatch = hotkey.alt === undefined || hotkey.alt === event.altKey
      const metaMatch = hotkey.meta === undefined || hotkey.meta === event.metaKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault()
        hotkey.handler(event)
        break
      }
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

export function formatHotkey(config: HotkeyConfig): string {
  const parts: string[] = []
  
  if (config.ctrl) parts.push('Ctrl')
  if (config.alt) parts.push('Alt')
  if (config.shift) parts.push('Shift')
  if (config.meta) parts.push('Cmd')
  
  parts.push(config.key.toUpperCase())
  
  return parts.join('+')
}
