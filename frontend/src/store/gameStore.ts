import { create } from 'zustand'

export interface TestCase {
  input: any
  expectedOutput: any
}

export interface ProblemCard {
  id: string
  problem: {
    title: string
    description: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    testCases: TestCase[]
  }
  reward?: {
    type: 'buff' | 'debuff'
    target: 'self' | 'other'
    effect: 'freeze_time' | 'add_time' | 'remove_time'
    value: number
  }
  challenge?: {
    type: 'time_limit' | 'line_limit' | 'complexity'
    value: number | string
  }
}

export interface Player {
  id: string
  username: string
  timeRemaining: number
  isEliminated: boolean
  currentProblem: string | null
  cards: ProblemCard[]
}

interface GameState {
  // Current player info
  currentPlayerId: string | null
  username: string
  roomCode: string
  
  // All players
  players: Record<string, Player>
  
  // Game status
  gameStatus: 'menu' | 'lobby' | 'playing' | 'ended'
  selectedCardId: string | null
  
  // Actions
  setUsername: (username: string) => void
  joinRoom: (roomCode: string) => void
  setGameStatus: (status: 'menu' | 'lobby' | 'playing' | 'ended') => void
  addPlayer: (player: Player) => void
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  selectCard: (cardId: string | null) => void
  removeCard: (playerId: string, cardId: string) => void
  addCard: (playerId: string, card: ProblemCard) => void
  startGame: () => void
}

// Sample problems for card generation
const sampleProblems: Omit<ProblemCard, 'id'>[] = [
  {
    problem: {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'Easy',
      testCases: [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1] }
      ]
    },
    reward: { type: 'buff', target: 'self', effect: 'add_time', value: 30 }
  },
  {
    problem: {
      title: 'Valid Parentheses',
      description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
      difficulty: 'Easy',
      testCases: [
        { input: { s: '()' }, expectedOutput: true }
      ]
    },
    challenge: { type: 'time_limit', value: 120 }
  },
  {
    problem: {
      title: 'Merge Two Sorted Lists',
      description: 'Merge two sorted linked lists and return it as a sorted list.',
      difficulty: 'Easy',
      testCases: []
    },
    reward: { type: 'debuff', target: 'other', effect: 'remove_time', value: 20 }
  },
  {
    problem: {
      title: 'Longest Palindromic Substring',
      description: 'Given a string s, return the longest palindromic substring in s.',
      difficulty: 'Medium',
      testCases: []
    },
    challenge: { type: 'complexity', value: 'O(n)' }
  },
  {
    problem: {
      title: 'Container With Most Water',
      description: 'Find two lines that together with the x-axis forms a container, such that the container contains the most water.',
      difficulty: 'Medium',
      testCases: []
    },
    reward: { type: 'buff', target: 'self', effect: 'freeze_time', value: 60 }
  },
  {
    problem: {
      title: '3Sum',
      description: 'Find all triplets in the array which gives the sum of zero.',
      difficulty: 'Medium',
      testCases: []
    },
    challenge: { type: 'line_limit', value: 30 }
  },
  {
    problem: {
      title: 'Trapping Rain Water',
      description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.',
      difficulty: 'Hard',
      testCases: []
    },
    reward: { type: 'buff', target: 'self', effect: 'add_time', value: 60 }
  },
  {
    problem: {
      title: 'Longest Increasing Subsequence',
      description: 'Find the length of the longest strictly increasing subsequence.',
      difficulty: 'Hard',
      testCases: []
    },
    challenge: { type: 'time_limit', value: 180 }
  }
]

const generateRandomCard = (): ProblemCard => {
  const template = sampleProblems[Math.floor(Math.random() * sampleProblems.length)]
  return {
    ...template,
    id: Math.random().toString(36).substring(7) + Date.now()
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  currentPlayerId: null,
  username: '',
  roomCode: '',
  players: {},
  gameStatus: 'menu',
  selectedCardId: null,
  
  setUsername: (username) => set({ username }),
  
  joinRoom: (roomCode) => {
    const playerId = Math.random().toString(36).substring(7) + Date.now()
    const username = get().username
    
    // Add current player
    const newPlayer: Player = {
      id: playerId,
      username,
      timeRemaining: 300, // 5 minutes default
      isEliminated: false,
      currentProblem: null,
      cards: []
    }
    
    set({
      roomCode,
      currentPlayerId: playerId,
      gameStatus: 'lobby',
      players: { [playerId]: newPlayer }
    })
  },
  
  setGameStatus: (status) => set({ gameStatus: status }),
  
  addPlayer: (player) => set((state) => ({
    players: { ...state.players, [player.id]: player }
  })),
  
  updatePlayer: (playerId, updates) => set((state) => ({
    players: {
      ...state.players,
      [playerId]: {
        ...state.players[playerId],
        ...updates
      }
    }
  })),
  
  selectCard: (cardId) => {
    const state = get()
    const playerId = state.currentPlayerId
    if (!playerId) return
    
    if (cardId === null) {
      set({
        selectedCardId: null,
      })
      get().updatePlayer(playerId, { currentProblem: null })
      return
    }
    
    const player = state.players[playerId]
    const card = player.cards.find(c => c.id === cardId)
    
    if (card) {
      set({
        selectedCardId: cardId,
      })
      // Update player's current problem
      get().updatePlayer(playerId, { currentProblem: cardId })
    }
  },
  
  removeCard: (playerId, cardId) => set((state) => {
    const player = state.players[playerId]
    if (!player) return state
    
    return {
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          cards: player.cards.filter(c => c.id !== cardId),
          currentProblem: player.currentProblem === cardId ? null : player.currentProblem
        }
      },
      selectedCardId: state.selectedCardId === cardId ? null : state.selectedCardId
    }
  }),
  
  addCard: (playerId, card) => set((state) => {
    const player = state.players[playerId]
    if (!player) return state
    
    return {
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          cards: [...player.cards, card]
        }
      }
    }
  }),
  
  startGame: () => {
    const state = get()
    const playerId = state.currentPlayerId
    if (!playerId) return
    
    // Deal 5 cards to current player
    const cards: ProblemCard[] = Array.from({ length: 5 }, () => generateRandomCard())
    
    set({
      gameStatus: 'playing',
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId],
          cards,
          timeRemaining: 300
        }
      }
    })
  }
}))