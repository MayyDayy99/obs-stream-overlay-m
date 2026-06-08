import { useState, useEffect, useCallback, useRef } from 'react'

const CHANNEL_NAME = 'obs-stream-overlay-sync'

function getChannel(): BroadcastChannel | null {
  try {
    return new BroadcastChannel(CHANNEL_NAME)
  } catch {
    return null
  }
}

function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      return JSON.parse(stored) as T
    }
  } catch {
    // ignore parse errors
  }
  return defaultValue
}

export function useSharedState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, defaultValue))
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    const channel = getChannel()
    channelRef.current = channel

    // Listen for changes from other tabs via BroadcastChannel
    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.key === key) {
          setValue(event.data.value as T)
        }
      }
    }

    // Fallback: listen for storage events (for cross-tab when BroadcastChannel not available)
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T)
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      channel?.close()
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  const setSharedValue = useCallback((val: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const newValue = typeof val === 'function' ? (val as (prev: T) => T)(prev) : val
      // Persist to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch {
        // ignore quota errors
      }
      // Broadcast to other tabs
      try {
        channelRef.current?.postMessage({ key, value: newValue })
      } catch {
        // ignore
      }
      return newValue
    })
  }, [key])

  return [value, setSharedValue]
}
