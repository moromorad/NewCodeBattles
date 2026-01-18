import React from 'react';
import { Card } from './Card';
import { useGameStore } from '../store/useGameStore';

export const Hand = () => {
    const { hand, playCard } = useGameStore();

    if (!hand || hand.length === 0) {
        return <div className="text-center text-gray-500 animate-pulse">Wait for data stream...</div>;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-64 flex items-end justify-center pb-8 gap-4 pointer-events-none">
            <div className="flex items-end -space-x-12 hover:space-x-4 transition-all duration-300 pointer-events-auto px-12">
                {hand.map((card, idx) => (
                    <Card
                        key={`${card.name}-${idx}`}
                        index={idx}
                        card={card}
                        onClick={playCard}
                    />
                ))}
            </div>
        </div>
    );
};
