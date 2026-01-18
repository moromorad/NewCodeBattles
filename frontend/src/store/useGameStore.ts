import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Card, Player, GameState } from '../types';

interface GameStore {
    socket: Socket | null;
    isConnected: boolean;

    // Game State
    roomId: string | null;
    playerId: string | null;
    isHost: boolean;
    username: string | null;
    hand: Card[];
    players: { [id: string]: Player };
    gameState: GameState | null;

    // UI State
    activeCard: Card | null; // The card currently being played (open editor)
    activeProblemDescription: string | null;
    lastResult: { success: boolean; message?: string } | null;

    // Actions
    connect: () => void;
    joinGame: (username: string, room?: string) => void;
    playCard: (index: number) => void;
    submitCode: (code: string) => void;
    startGame: () => void;
    closeEditor: () => void;
}

const SOCKET_URL = `http://${window.location.hostname}:3000`;

export const useGameStore = create<GameStore>((set, get) => ({
    socket: null,
    isConnected: false,
    roomId: null,
    playerId: null,
    isHost: false,
    username: null,
    hand: [],
    players: {},
    gameState: null,
    activeCard: null,
    activeProblemDescription: null,
    lastResult: null,

    connect: () => {
        if (get().socket) return; // Already connected

        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false });
        });

        socket.on('game_joined', (data) => {
            console.log('Game Joined:', data);
            set({
                roomId: data.room,
                playerId: data.player_id,
                hand: data.hand,
                isHost: data.is_host
            });
        });

        socket.on('player_joined', (data) => {
            console.log('Player Joined:', data);
            // We might want to request a full game state update here ideally
        });

        socket.on('card_played', (data) => {
            console.log('Card Played:', data);
            set({
                activeCard: data.card,
                activeProblemDescription: data.problem.description,// This now comes from backend setup/desc
                lastResult: null
            });
        });

        socket.on('submission_result', (data) => {
            console.log('Submission Result:', data);
            if (data.success) {
                // Success: Update hand and close editor
                set({
                    hand: data.new_hand,
                    activeCard: null,
                    activeProblemDescription: null,
                    lastResult: { success: true, message: 'System Override Successful' }
                });
            } else {
                // Failure: Show error
                set({
                    lastResult: {
                        success: false,
                        message: data.error || 'Test Cases Failed'
                    }
                });
            }
        });

        socket.on('game_update', (data) => {
            // Update full game state, including player list
            const playersMap: { [id: string]: Player } = {};
            if (data.players) {
                data.players.forEach((p: Player) => {
                    playersMap[p.id] = p;
                });
            }
            set({
                gameState: data,
                players: playersMap
            });
        });

        socket.on('game_started', () => {
            set(state => ({
                gameState: state.gameState ? { ...state.gameState, started: true } : null
            }));
        });

        set({ socket });
    },

    joinGame: (username, room) => {
        const socket = get().socket;
        if (socket) {
            set({ username });
            socket.emit('join_game', { username, room });
        }
    },

    playCard: (index) => {
        const socket = get().socket;
        if (socket) {
            socket.emit('play_card', { card_index: index });
        }
    },

    submitCode: (code) => {
        const socket = get().socket;
        if (socket) {
            socket.emit('submit_code', { code });
        }
    },

    startGame: () => {
        const socket = get().socket;
        if (socket) {
            socket.emit('start_game', {});
        }
    },

    closeEditor: () => {
        set({ activeCard: null });
    }
}));
