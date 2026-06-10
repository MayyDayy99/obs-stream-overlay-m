import { useState, useEffect, useCallback } from 'react'
import OBSWebSocket from 'obs-websocket-js'
import { toast } from 'sonner'
import { useSharedState } from './useSharedState'

export function useOBS() {
  const [obsUrl, setObsUrl] = useSharedState('obs-ws-url', 'ws://localhost:4455')
  const [obsPassword, setObsPassword] = useSharedState('obs-ws-password', '')
  const [isConnected, setIsConnected] = useState(false)
  const [obs] = useState(() => new OBSWebSocket())

  const connect = useCallback(async () => {
    try {
      await obs.connect(obsUrl, obsPassword, { rpcVersion: 1 })
      setIsConnected(true)
      toast.success('Sikeres csatlakozás az OBS-hez!')
    } catch (error: any) {
      console.error('OBS Connection error:', error)
      toast.error('Nem sikerült csatlakozni az OBS-hez. Ellenőrizd a címet és a jelszót!')
      setIsConnected(false)
    }
  }, [obs, obsUrl, obsPassword])

  const disconnect = useCallback(async () => {
    try {
      await obs.disconnect()
      setIsConnected(false)
      toast.info('Lecsatlakozva az OBS-ről.')
    } catch (e) {
      console.error(e)
    }
  }, [obs])

  useEffect(() => {
    obs.on('ConnectionClosed', () => {
      setIsConnected(false)
    })
    
    return () => {
      obs.removeAllListeners('ConnectionClosed')
    }
  }, [obs])

  const changeScene = useCallback(async (sceneName: string) => {
    if (!isConnected) return
    try {
      await obs.call('SetCurrentProgramScene', { sceneName })
    } catch (e) {
      console.error('Failed to change scene', e)
    }
  }, [obs, isConnected])

  return {
    obs,
    isConnected,
    obsUrl,
    setObsUrl,
    obsPassword,
    setObsPassword,
    connect,
    disconnect,
    changeScene
  }
}
