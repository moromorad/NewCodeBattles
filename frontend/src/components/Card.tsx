import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
    card: CardType;
    index: number;
    onClick: (index: number) => void;
    disabled?: boolean;
}

const RARITY_BORDERS = {
    easy: 'border-green-500/50 hover:border-green-400',
    medium: 'border-blue-500/50 hover:border-blue-400',
    hard: 'border-purple-500/50 hover:border-purple-400',
    legendary: 'border-orange-500/50 hover:border-orange-400'
};

const RARITY_BG = {
    easy: 'text-green-400',
    medium: 'text-blue-400',
    hard: 'text-purple-400',
    legendary: 'text-orange-400'
};

export const Card: React.FC<CardProps> = ({ card, index, onClick, disabled }) => {
    return (
        <div
            onClick={() => !disabled && onClick(index)}
            className={`
                relative w-48 h-72 bg-[var(--bg-surface)] 
                border-2 rounded-xl p-4 
                cursor-pointer transition-all duration-300 transform 
                hover:-translate-y-8 hover:scale-105 hover:shadow-2xl hover:z-10
                flex flex-col gap-3 group
                ${RARITY_BORDERS[card.problemType] || 'border-gray-500'}
                ${disabled ? 'opacity-30 cursor-not-allowed scale-95' : 'shadow-lg'}
            `}
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <span className={`text-xs font-bold uppercase tracking-wider ${RARITY_BG[card.problemType]}`}>
                    {card.problemType}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                    #{card.problem_id || "001"}
                </span>
            </div>

            {/* Visual Centerpiece */}
            <div className="flex-1 bg-[var(--bg-deep)] rounded-lg border border-[var(--bg-panel)] flex items-center justify-center relative overflow-hidden group-hover:border-opacity-100 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-bold text-center px-2 text-white group-hover:scale-105 transition-transform">
                    {card.name}
                </h3>
            </div>

            {/* Footer / Stats */}
            <div className="space-y-2">
                <div className="text-xs bg-[var(--bg-deep)] p-2 rounded border border-[var(--bg-panel)]">
                    <span className="text-[var(--text-secondary)] block text-[10px] uppercase">Reward</span>
                    <span className="text-blue-300 font-mono">{card.reward}</span>
                </div>
            </div>
        </div>
    );
};
