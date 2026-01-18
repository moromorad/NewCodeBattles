import React from 'react';
import { useGameStore } from '../store/useGameStore';

export const WaitingRoom = () => {
    const { roomId, players, isHost, startGame, playerId } = useGameStore();
    const playerList = Object.values(players);
    const canStart = playerList.length > 1;

    const getAvatar = (name: string) => {
        // Deterministic avatar based on name char code sum
        const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const avatarNum = (sum % 8) + 1; // Assuming 8 avatars
        return `/avatars/avatar_${avatarNum}.png`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] relative">

            {/* Room Info */}
            <div className="absolute top-8 left-8">
                <h2 className="text-[var(--text-secondary)] text-sm tracking-widest uppercase">Lobby Uplink</h2>
                <div className="text-4xl font-mono font-bold text-white mt-2 tracking-tighter">
                    {roomId}
                </div>
            </div>

            <div className="w-full max-w-4xl p-8">
                <h1 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Awaiting Operators
                </h1>

                {/* Player Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {playerList.map((p) => (
                        <div key={p.id} className="group relative flex flex-col items-center">
                            <div className={`w-32 h-32 rounded-full border-4 overflow-hidden bg-[var(--bg-surface)] transition-all
                                ${p.id === playerId ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-[var(--bg-panel)]'}
                            `}>
                                <img
                                    src={getAvatar(p.name)}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback if image missing
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                        e.currentTarget.parentElement!.innerHTML = `<span class="text-3xl font-bold text-gray-600">${p.name[0]}</span>`;
                                    }}
                                />
                            </div>
                            <div className="mt-4 text-lg font-medium">{p.name} {p.id === playerId && '(You)'}</div>
                            {p.id === playerId && <div className="text-xs text-green-500 uppercase tracking-widest mt-1">Ready</div>}
                        </div>
                    ))}

                    {/* Empty slots placeholders */}
                    {Array.from({ length: Math.max(0, 4 - playerList.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex flex-col items-center opacity-30">
                            <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-[var(--bg-surface)]">
                                <span className="text-gray-600 text-4xl font-light">+</span>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">Searching...</div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex justify-center flex-col items-center gap-4">
                    {isHost ? (
                        <>
                            <button
                                onClick={startGame}
                                disabled={!canStart}
                                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-bold text-xl tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed shadow-xl"
                            >
                                START OPERATION
                            </button>
                            {!canStart && (
                                <p className="text-sm text-[var(--text-secondary)] animate-pulse">
                                    Waiting for more operators to join...
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[var(--text-secondary)]">Waiting for Host to initialize...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
