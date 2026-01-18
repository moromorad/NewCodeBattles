import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export const Lobby = () => {
  const { joinGame } = useGameStore();

  // UI State: 'intro' | 'host' | 'join'
  const [view, setView] = useState<'intro' | 'host' | 'join'>('intro');
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleHost = () => {
    if (!username) return alert("Please enter a username");
    setIsConnecting(true);
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    joinGame(username, newRoom);
  };

  const handleJoin = () => {
    if (!username || !roomCode) return alert("Please fill in all fields");
    joinGame(username, roomCode.toUpperCase());
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[var(--bg-deep)] text-[var(--text-primary)]">

      <h1 className="text-5xl font-bold mb-12 tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        NewCodeBattles
      </h1>

      {/* INTRO VIEW */}
      {view === 'intro' && (
        <div className="flex flex-col gap-4 w-64">
          <button
            onClick={() => setView('host')}
            className="btn-primary py-4 rounded-lg text-lg"
          >
            Create Room
          </button>
          <button
            onClick={() => setView('join')}
            className="py-4 rounded-lg text-lg border border-[var(--bg-panel)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            Join Room
          </button>
        </div>
      )}

      {/* HOST/JOIN Form Container */}
      {(view === 'host' || view === 'join') && (
        <div className="w-96 p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-panel)] shadow-2xl space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setView('intro')} className="text-[var(--text-secondary)] hover:text-white">
              ← Back
            </button>
            <h2 className="text-xl font-semibold">
              {view === 'host' ? 'Host a Game' : 'Join a Game'}
            </h2>
          </div>

          {view === 'join' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Room Code</label>
              <input
                value={roomCode}
                onChange={e => setRoomCode(e.target.value)}
                className="w-full bg-[var(--bg-deep)] border border-[var(--bg-panel)] rounded p-3 focus:outline-none focus:border-blue-500 transition-colors uppercase font-mono"
                placeholder="XB92Z"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[var(--bg-deep)] border border-[var(--bg-panel)] rounded p-3 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <button
            onClick={view === 'host' ? handleHost : handleJoin}
            disabled={isConnecting}
            className="w-full btn-primary py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : (view === 'host' ? 'Start Lobby' : 'Join Lobby')}
          </button>
        </div>
      )}
    </div>
  );
};