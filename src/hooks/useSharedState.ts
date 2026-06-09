import { useState, useEffect, useCallback } from 'react'
import mqtt from 'mqtt'

// Generate or get ROOM ID
function getRoomId() {
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
const TOPIC_BASE = `obs-overlay-oe/${ROOM_ID}`

let mqttClient: mqtt.MqttClient | null = null
const subscribers = new Set<(data: { key: string, value: any }) => void>()

function initMqtt() {
  if (mqttClient) return
  
  // Use public free MQTT broker over WebSockets
  mqttClient = mqtt.connect('wss://broker.hivemq.com:8000/mqtt')

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT room', ROOM_ID)
    // Subscribe to all state keys for this room
    mqttClient?.subscribe(`${TOPIC_BASE}/+`)
  })

  mqttClient.on('message', (topic, message) => {
    if (topic.startsWith(TOPIC_BASE)) {
      const key = topic.split('/').pop()
      if (!key) return
      
      try {
        const value = JSON.parse(message.toString())
        subscribers.forEach(cb => cb({ key, value }))
      } catch (e) {
        console.error('MQTT parse error', e)
      }
    }
  })
}

// Initializing immediately
initMqtt()

// Original local storage reader
function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      return JSON.parse(stored) as T
    }
  } catch {
  }
  return defaultValue
}

export function useSharedState<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, defaultValue))

  useEffect(() => {
    const onMessage = (data: { key: string, value: any }) => {
      if (data.key === key) {
        setValue(data.value as T)
        try {
          localStorage.setItem(key, JSON.stringify(data.value))
        } catch {}
      }
    }
    subscribers.add(onMessage)
    
    // Also listen to local storage changes for same-device cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T)
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      subscribers.delete(onMessage)
      window.removeEventListener('storage', onStorage)
    }
  }, [key])

  const setSharedValue = useCallback((val: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const newValue = typeof val === 'function' ? (val as (prev: T) => T)(prev) : val
      
      // Persist locally
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch {}
      
      // Publish to cloud with retain:true so new connecting clients get the latest state immediately
      if (mqttClient && mqttClient.connected) {
        mqttClient.publish(`${TOPIC_BASE}/${key}`, JSON.stringify(newValue), { retain: true })
      }
      return newValue
    })
  }, [key])

  return [value, setSharedValue]
}
