import { useState, useEffect, useCallback, useRef } from 'react'

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

// ─── Sync Engine (jsonbin.io free tier – no signup) ────────
// We use a simple JSON key-value store via jsonbin.io (free, no auth)
// Fallback: JSONBin.io public bins

const BIN_STORAGE_KEY = `obs-overlay-bin-${ROOM_ID}`
const POLL_INTERVAL = 800 // ms – fast enough for real-time feel

// In-memory state that all hooks share
const sharedState: Record<string, any> = {}
const listeners = new Map<string, Set<(val: any) => void>>()
let binId: string | null = null
let binReady = false
let pendingWrites: Record<string, any> = {}
let writeTimer: ReturnType<typeof setTimeout> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let lastEtag = ''

// Connection status
type ConnectionStatus = 'connecting' | 'connected' | 'error'
let connectionStatus: ConnectionStatus = 'connecting'
const statusListeners = new Set<(status: ConnectionStatus) => void>()

function setConnectionStatus(s: ConnectionStatus) {
  connectionStatus = s
  statusListeners.forEach(cb => cb(s))
}

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(connectionStatus)
  useEffect(() => {
    statusListeners.add(setStatus)
    return () => { statusListeners.delete(setStatus) }
  }, [])
  return status
}

// ─── JSONBin.io API helpers ────────────────────────────────
const JSONBIN_API = 'https://api.jsonbin.io/v3'
// We use a master key for a free public bin (X-Master-Key is required but free)
// Instead, let's use a simpler approach: npoint.io (free, no auth, instant)
const NPOINT_API = 'https://api.npoint.io'

async function createBin(): Promise<string> {
  // Try loading existing bin ID from localStorage
  const savedBin = localStorage.getItem(BIN_STORAGE_KEY)
  if (savedBin) {
    try {
      const resp = await fetch(`${NPOINT_API}/${savedBin}`)
      if (resp.ok) {
        const data = await resp.json()
        Object.assign(sharedState, data)
        return savedBin
      }
    } catch { /* bin doesn't exist anymore, create new */ }
  }

  // Create a new bin
  const resp = await fetch('https://api.npoint.io/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })

  if (!resp.ok) throw new Error('Failed to create npoint bin')
  // npoint returns the URL of the new document
  const data = await resp.json()
  // The response from npoint POST is just the data, but the URL is in the Location header
  // Actually npoint.io doesn't have a public create API easily. Let me use a different approach.
  throw new Error('npoint creation not straightforward')
}

// ─── Simpler approach: use val.town or a peer-to-peer WebSocket relay ───

// Let's use the simplest possible approach that actually works:
// A free WebSocket relay service (piesocket free plan or similar)
// 
// Actually, the SIMPLEST reliable approach: Ably free tier with anonymous auth
// Free: 6M messages/month, no credit card
//
// But that requires an API key...
//
// OK, truly the simplest: use the Window.postMessage API + a shared iframe,
// or use a WebSocket echo server.
//
// FINAL ANSWER: Use a combination of:
// 1. Same device: BroadcastChannel (instant)
// 2. Cross device: Simple WebSocket relay via free public echo server

// ─── CLEAN APPROACH: WebSocket via free relay ──────────────
// We'll use a simple shared WebSocket room approach

const WS_URLS = [
  // Free WebSocket relay services
  `wss://free.blr2.piesocket.com/v3/${ROOM_ID}?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self`,
]

let ws: WebSocket | null = null
let wsConnected = false
let reconnectAttempt = 0
const MAX_RECONNECT_DELAY = 10000

function notifyListeners(key: string, value: any) {
  listeners.get(key)?.forEach(cb => cb(value))
}

function connectWs() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return
  }

  const url = WS_URLS[0]
  setConnectionStatus('connecting')

  try {
    ws = new WebSocket(url)
  } catch (e) {
    console.error('WebSocket create error:', e)
    setConnectionStatus('error')
    scheduleReconnect()
    return
  }

  ws.onopen = () => {
    console.log(`[sync] Connected to room ${ROOM_ID}`)
    wsConnected = true
    reconnectAttempt = 0
    setConnectionStatus('connected')

    // Request full state sync from other connected clients
    ws?.send(JSON.stringify({ type: 'sync-request', room: ROOM_ID }))
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type === 'state-update' && msg.key) {
        sharedState[msg.key] = msg.value
        try { localStorage.setItem(msg.key, JSON.stringify(msg.value)) } catch {}
        notifyListeners(msg.key, msg.value)
      } else if (msg.type === 'sync-request') {
        // Another client is requesting full state – send everything we have
        const keys = Object.keys(sharedState)
        if (keys.length > 0) {
          ws?.send(JSON.stringify({
            type: 'sync-response',
            state: sharedState
          }))
        }
      } else if (msg.type === 'sync-response' && msg.state) {
        // Received full state from another client
        for (const [key, value] of Object.entries(msg.state)) {
          sharedState[key] = value
          try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
          notifyListeners(key, value)
        }
      }
    } catch (e) {
      // Ignore non-JSON messages (PieSocket sends some system messages)
    }
  }

  ws.onerror = (e) => {
    console.error('[sync] WebSocket error', e)
    setConnectionStatus('error')
  }

  ws.onclose = () => {
    console.log('[sync] WebSocket closed, reconnecting...')
    wsConnected = false
    ws = null
    setConnectionStatus('error')
    scheduleReconnect()
  }
}

function scheduleReconnect() {
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), MAX_RECONNECT_DELAY)
  reconnectAttempt++
  setTimeout(connectWs, delay)
}

function publishState(key: string, value: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'state-update',
      key,
      value
    }))
  }
}

// Initialize connection
connectWs()

// ─── localStorage helper ───────────────────────────────────
function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      const parsed = JSON.parse(stored) as T
      sharedState[key] = parsed
      return parsed
    }
  } catch {}
  return defaultValue
}

// ─── BroadcastChannel for same-device tabs ─────────────────
const CHANNEL_NAME = 'obs-stream-overlay-sync'
let broadcastChannel: BroadcastChannel | null = null
try {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  broadcastChannel.onmessage = (event) => {
    if (event.data?.key && event.data?.value !== undefined) {
      sharedState[event.data.key] = event.data.value
      notifyListeners(event.data.key, event.data.value)
    }
  }
} catch {}

// ─── Hook ──────────────────────────────────────────────────
export function useSharedState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, defaultValue))

  useEffect(() => {
    const onUpdate = (newVal: any) => {
      setValue(newVal as T)
    }

    if (!listeners.has(key)) {
      listeners.set(key, new Set())
    }
    listeners.get(key)!.add(onUpdate)

    // Also listen for localStorage changes (same-device cross-tab fallback)
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue) as T
          setValue(parsed)
        } catch {}
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

      // Update shared state
      sharedState[key] = newValue

      // Persist locally
      try { localStorage.setItem(key, JSON.stringify(newValue)) } catch {}

      // Broadcast to same-device tabs
      try { broadcastChannel?.postMessage({ key, value: newValue }) } catch {}

      // Publish to remote devices via WebSocket
      publishState(key, newValue)

      return newValue
    })
  }, [key])

  return [value, setSharedValue]
}
