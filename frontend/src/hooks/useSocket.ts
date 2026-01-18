import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGameStore } from '../store/gameStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const updatePlayer = useGameStore((state) => state.updatePlayer)

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    // Listen for player updates from other players
    newSocket.on('player_move', (data: { playerId: number; position: { x: number; y: number } }) => {
      updatePlayer(data.playerId, { position: data.position })
    })

    newSocket.on('player_action', (data: { playerId: number; action: string }) => {
      updatePlayer(data.playerId, { action: data.action })
    })

    // Listen for game state updates
    newSocket.on('game_state', (data: { players: Record<number, any> }) => {
      // Update all players at once
      Object.entries(data.players).forEach(([playerId, playerData]) => {
        updatePlayer(Number(playerId), playerData)
      })
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [updatePlayer])

  const sendMove = (playerId: number, position: { x: number; y: number }) => {
    if (socket?.connected) {
      socket.emit('player_move', { playerId, position })
      // Update local state immediately
      updatePlayer(playerId, { position })
    }
  }

  const sendAction = (playerId: number, action: string) => {
    if (socket?.connected) {
      socket.emit('player_action', { playerId, action })
      // Update local state immediately
      updatePlayer(playerId, { action })
    }
  }

  return {
    socket,
    connected,
    sendMove,
    sendAction,
  }
}