import React from 'react';
import { Hand } from './Hand';
import { CodeEditor } from './CodeEditor';
import { useGameStore } from '../store/useGameStore';

export const GameView = () => {
    const { activeCard, roomId, playerId, hand } = useGameStore();

    console.log("GameView Render. Hand size:", hand?.length, "Hand Data:", hand);

    return (
        <div className="relative w-screen h-screen bg-[var(--bg-deep)] overflow-hidden flex flex-col font-sans">

            {/* Top HUD */}
            <div className="h-16 border-b border-[var(--bg-panel)] bg-[var(--bg-surface)] flex justify-between items-center px-6 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-sm text-[var(--text-secondary)]">LOBBY: <span className="text-white">{roomId}</span></span>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">Time Remaining</span>
                    <span className="text-2xl font-mono font-bold text-white">05:00</span>
                </div>

                <div className="font-mono text-sm text-[var(--text-secondary)]">
                    OPERATOR: <span className="text-white">{playerId?.substring(0, 8)}</span>
                </div>
            </div>

            {/* Main Arena Area */}
            <div className="flex-1 relative flex items-center justify-center">
                {/* Placeholder for Players list/status */}
                <div className="p-8 border border-[var(--bg-panel)] rounded-xl bg-[var(--bg-surface)] text-center max-w-md">
                    <h3 className="text-lg font-medium text-white mb-2">Battle Arena</h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        Waiting for game sync...
                        <br />
                        Select a card from your hand to begin.
                    </p>
                </div>
            </div>

            {/* Bottom: Player Hand */}
            {/* We render Hand outside the relative container so it creates a layout layer */}
            <Hand />

            {/* Overlays */}
            {activeCard && <CodeEditor />}
        </div>
    );
};
