import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useGameStore } from '../store/useGameStore';

export const CodeEditor = () => {
  const { activeCard, activeProblemDescription, submitCode, closeEditor, lastResult } = useGameStore();
  const [code, setCode] = useState('');

  useEffect(() => {
    // "activeProblemDescription" currently holds the Setup Code from the backend
    if (activeProblemDescription) {
      setCode(activeProblemDescription);
    }
  }, [activeProblemDescription]);

  if (!activeCard) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="w-full h-full bg-[var(--bg-surface)] rounded-xl border border-[var(--bg-panel)] overflow-hidden flex flex-col shadow-2xl">

        {/* IDE Header */}
        <div className="h-14 border-b border-[var(--bg-panel)] flex justify-between items-center px-6 bg-[var(--bg-panel)]/50">
          <div className="flex items-center gap-4">
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase 
                            ${activeCard.problemType === 'easy' ? 'bg-green-500/20 text-green-400' :
                activeCard.problemType === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
              {activeCard.problemType}
            </span>
            <h2 className="text-lg font-semibold text-white">{activeCard.name}</h2>
          </div>

          <button
            onClick={closeEditor}
            className="text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            Close [Esc]
          </button>
        </div>

        {/* Main Content: Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL: Problem Description */}
          <div className="w-1/3 border-r border-[var(--bg-panel)] flex flex-col bg-[var(--bg-surface)]">
            <div className="p-6 overflow-y-auto flex-1 prose prose-invert max-w-none">
              <h3 className="text-white text-lg font-medium mb-4">Description</h3>
              {/* Ideally we would render markdown here. For now, text. */}
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {/* Fallback layout for description */}
                Complete the function to solve the problem.
                <br />
                <span className="text-yellow-500 block mt-4 text-sm font-mono">Quest: {activeCard.quest}</span>
                <span className="text-blue-400 block mt-1 text-sm font-mono">Reward: {activeCard.reward}</span>
              </p>
            </div>

            {/* Console/Output Area */}
            <div className="h-1/3 border-t border-[var(--bg-panel)] bg-[var(--bg-deep)] p-4 overflow-y-auto">
              <div className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Console Output</div>
              {lastResult ? (
                <div className={`font-mono text-sm ${lastResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {lastResult.success ? '>> SUCCESS' : '>> ERROR'}
                  <br />
                  {lastResult.message}
                </div>
              ) : (
                <div className="text-[var(--text-secondary)] text-sm italic">Ready to run...</div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 16 }
                }}
              />
            </div>

            {/* Action Bar */}
            <div className="h-16 border-t border-[var(--bg-panel)] bg-[var(--bg-surface)] flex items-center justify-end px-6 gap-4">
              <button className="px-6 py-2 text-[var(--text-primary)] hover:bg-[var(--bg-panel)] rounded transition-colors" onClick={closeEditor}>
                Cancel
              </button>
              <button
                onClick={() => submitCode(code)}
                className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold transition-colors flex items-center gap-2"
              >
                ▷ Submit Solution
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};