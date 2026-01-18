import { create } from 'zustand'

export interface Player {
  id: number
  position?: { x: number; y: number }
  action?: string
}

interface GameState {
  players: Record<number, Player>
  setPlayerPosition: (playerId: number, position: { x: number; y: number }) => void
  setPlayerAction: (playerId: number, action: string) => void
  updatePlayer: (playerId: number, updates: Partial<Player>) => void
}

export const useGameStore = create<GameState>((set) => ({
  players: {},
  
  setPlayerPosition: (playerId, position) =>
    set((state) => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId],
          id: playerId,
          position,
        },
      },
    })),
  
  setPlayerAction: (playerId, action) =>
    set((state) => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId],
          id: playerId,
          action,
        },
      },
    })),
  
  updatePlayer: (playerId, updates) =>
    set((state) => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId],
          id: playerId,
          ...updates,
        },
      },
    })),
}))