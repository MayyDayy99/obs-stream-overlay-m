import { useState, useEffect, useCallback } from 'react'

// ─── Room ID ───────────────────────────────────────────────
function getRoomId(): string {
  const urlParams = new URLSearchParams(window.location.search)
  let room = urlParams.get('room')
  if (!room) {
    room = Math.random().toString(36).substring(2, 8)
    urlParams.set('room', room)
    const newUrl = window.location.pathname + '?' + urlParams.toString() + window.location.hash
    window.history.replaceState({}, '', newUrl)
  }
  return room
}

export const ROOM_ID = getRoomId()

// ─── Sync Engine via ntfy.sh ───────────────────────────────
// ntfy.sh is a free, open-source push notification service.
// No signup, no API key, 100% reliable.

const CLIENT_ID = Math.random().toString(36).substring(2, 10)
const NTFY_BASE = 'https://ntfy.sh'
const TOPIC = `obs-oe-overlay-${ROOM_ID}`

// Shared in-memory state
const cloudState: Record<string, any> = {}
const listeners = new Map<string, Set<(val: any) => void>>()

// Connection status
type ConnectionStatus = 'connecting' | 'connected' | 'error'
let connectionStatus: ConnectionStatus = 'connecting'
const statusListeners = new Set<(s: ConnectionStatus) => void>()

function setStatus(s: ConnectionStatus) {
  if (connectionStatus === s) return
  connectionStatus = s
  statusListeners.forEach(cb => cb(s))
}

export function useConnectionStatus(): ConnectionStatus {
  const [status, setS] = useState<ConnectionStatus>(connectionStatus)
  useEffect(() => {
    statusListeners.add(setS)
    return () => { statusListeners.delete(setS) }
  }, [])
  return status
}

function notifyListeners(key: string, value: any) {
  listeners.get(key)?.forEach(cb => cb(value))
}

// ─── Publish (HTTP POST) ───────────────────────────────────
let pendingUpdates: Record<string, any> = {}
let writeTimer: ReturnType<typeof setTimeout> | null = null

function flushUpdates() {
  const updates = { ...pendingUpdates }
  pendingUpdates = {}
  if (Object.keys(updates).length === 0) return

  fetch(`${NTFY_BASE}/${TOPIC}`, {
    method: 'POST',
    body: JSON.stringify({ cid: CLIENT_ID, updates }),
  }).catch(err => {
    console.error('[sync] publish error', err)
    // Re-queue on failure
    pendingUpdates = { ...updates, ...pendingUpdates }
  })
}

function publishState(key: string, value: any) {
  pendingUpdates[key] = value
  if (writeTimer) clearTimeout(writeTimer)
  writeTimer = setTimeout(flushUpdates, 50) // 50ms debounce to batch rapid changes
}

// ─── Subscribe (EventSource / SSE) ─────────────────────────
let eventSource: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectDelay = 1000

function handleMessage(msgData: any) {
  try {
    const parsed = typeof msgData === 'string' ? JSON.parse(msgData) : msgData

    // ntfy wraps our message in { message: "..." }
    let payload: any
    if (parsed.message) {
      payload = JSON.parse(parsed.message)
    } else if (parsed.updates) {
      payload = parsed
    } else {
      return
    }

    // Skip our own messages
    if (payload.cid === CLIENT_ID) return

    if (payload.updates && typeof payload.updates === 'object') {
      for (const [key, value] of Object.entries(payload.updates)) {
        cloudState[key] = value
        try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
        notifyListeners(key, value)
      }
    }
  } catch {
    // Ignore non-JSON or malformed messages
  }
}

function connectSSE() {
  if (eventSource) {
    eventSource.close()
  }

  setStatus('connecting')

  // Subscribe with since=30m to get cached messages from the last 30 minutes
  eventSource = new EventSource(`${NTFY_BASE}/${TOPIC}/sse`)

  eventSource.onopen = () => {
    console.log(`[sync] Connected to room ${ROOM_ID}`)
    setStatus('connected')
    reconnectDelay = 1000

    // Fetch cached messages to get current state
    fetchCachedState()
  }

  eventSource.onmessage = (event) => {
    setStatus('connected')
    handleMessage(event.data)
  }

  eventSource.onerror = () => {
    setStatus('error')
    eventSource?.close()
    eventSource = null

    // Reconnect with exponential backoff
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, 15000)
      connectSSE()
    }, reconnectDelay)
  }
}

async function fetchCachedState() {
  try {
    const resp = await fetch(`${NTFY_BASE}/${TOPIC}/json?poll=1&since=30m`)
    if (!resp.ok) return
    const text = await resp.text()
    const lines = text.trim().split('\n').filter(Boolean)

    for (const line of lines) {
      try {
        const msg = JSON.parse(line)
        if (msg.message) {
          handleMessage(msg)
        }
      } catch {}
    }
  } catch (e) {
    console.error('[sync] fetch cached state error', e)
  }
}

// Start SSE connection
connectSSE()

// ─── BroadcastChannel (same-browser fallback) ──────────────
let broadcastChannel: BroadcastChannel | null = null
try {
  broadcastChannel = new BroadcastChannel('obs-stream-overlay-sync')
  broadcastChannel.onmessage = (event) => {
    if (event.data?.key && event.data?.value !== undefined) {
      cloudState[event.data.key] = event.data.value
      notifyListeners(event.data.key, event.data.value)
    }
  }
} catch {}

// ─── localStorage reader ───────────────────────────────────
function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      const val = JSON.parse(stored) as T
      cloudState[key] = val
      return val
    }
  } catch {}
  return defaultValue
}

// ─── Hook ──────────────────────────────────────────────────
export function useSharedState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    // Priority: cloudState > localStorage > default
    if (key in cloudState) return cloudState[key] as T
    return readStorage(key, defaultValue)
  })

  useEffect(() => {
    const onUpdate = (newVal: any) => setValue(newVal as T)

    if (!listeners.has(key)) listeners.set(key, new Set())
    listeners.get(key)!.add(onUpdate)

    // localStorage fallback for same-device cross-tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try { setValue(JSON.parse(e.newValue) as T) } catch {}
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      listeners.get(key)?.delete(onUpdate)
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  const setSharedValue = useCallback((val: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const newValue = typeof val === 'function' ? (val as (prev: T) => T)(prev) : val

      cloudState[key] = newValue
      try { localStorage.setItem(key, JSON.stringify(newValue)) } catch {}
      try { broadcastChannel?.postMessage({ key, value: newValue }) } catch {}

      // Publish to remote devices
      publishState(key, newValue)

      return newValue
    })
  }, [key])

  return [value, setSharedValue]
}
