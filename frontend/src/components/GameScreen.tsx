import { useEffect, useState } from 'react'
import { useGameStore, ProblemCard as ProblemCardType } from '../store/gameStore'
import { PlayerHealthBar } from './PlayerHealthBar'
import { ProblemCard } from './ProblemCard'
import { CodeEditor } from './CodeEditor'

export function GameScreen() {
  const {
    players,
    currentPlayerId,
    selectedCardId,
    selectCard,
    removeCard,
    addCard,
    updatePlayer
  } = useGameStore()

  const currentPlayer = currentPlayerId ? players[currentPlayerId] : null
  const selectedCard = currentPlayer?.cards.find(c => c.id === selectedCardId) || null

  // Timer countdown
  useEffect(() => {
    if (!currentPlayer || currentPlayer.isEliminated) return

    const interval = setInterval(() => {
      const player = players[currentPlayerId!]
      if (player && player.timeRemaining > 0) {
        const newTime = Math.max(0, player.timeRemaining - 1)
        updatePlayer(currentPlayerId!, { timeRemaining: newTime })

        if (newTime === 0) {
          updatePlayer(currentPlayerId!, { isEliminated: true })
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPlayerId, players, updatePlayer])

  const handleCardSelect = (cardId: string) => {
    if (currentPlayer && !currentPlayer.isEliminated) {
      selectCard(cardId)
    }
  }

  const handleSubmitSolution = (code: string) => {
    if (!selectedCardId || !currentPlayerId) return

    // Generate a random new card from sample problems
    const sampleProblems: Omit<ProblemCardType, 'id'>[] = [
      {
        problem: { title: 'Two Sum', description: 'Find two numbers that add up to target', difficulty: 'Easy' as const, testCases: [] },
        reward: { type: 'buff', target: 'self', effect: 'add_time', value: 30 }
      },
      {
        problem: { title: 'Valid Parentheses', description: 'Check if parentheses are valid', difficulty: 'Easy' as const, testCases: [] },
        challenge: { type: 'time_limit', value: 120 }
      },
      {
        problem: { title: 'Merge Lists', description: 'Merge two sorted lists', difficulty: 'Medium' as const, testCases: [] },
        reward: { type: 'debuff', target: 'other', effect: 'remove_time', value: 20 }
      },
      {
        problem: { title: 'Palindrome', description: 'Find longest palindrome', difficulty: 'Medium' as const, testCases: [] },
        challenge: { type: 'complexity', value: 'O(n)' }
      },
      {
        problem: { title: 'Container Water', description: 'Container with most water', difficulty: 'Hard' as const, testCases: [] },
        reward: { type: 'buff', target: 'self', effect: 'add_time', value: 60 }
      }
    ]
    const randomTemplate = sampleProblems[Math.floor(Math.random() * sampleProblems.length)]
    const generatedCard: ProblemCardType = {
      ...randomTemplate,
      id: Math.random().toString(36).substring(7) + Date.now()
    }

    removeCard(currentPlayerId, selectedCardId)
    selectCard(null) // Clear selection
    
    // Once a problem is complete, add new card after a negligible (1ms) delay.
    setTimeout(() => {
      addCard(currentPlayerId, generatedCard)
    }, 1)
  }

  if (!currentPlayer) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>
  }

  // When a card is selected, hide other cards
  const cardsToShow = selectedCardId ? currentPlayer.cards.filter(c => c.id === selectedCardId) : currentPlayer.cards

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Sidebar - Player Health Bars */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Players</h2>
        {Object.values(players).map((player) => (
          <PlayerHealthBar
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === currentPlayerId}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6">
        {/* Selected Problem Card Display */}
        {selectedCard ? (
          <div className="mb-6 bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedCard.problem.title}</h2>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  selectedCard.problem.difficulty === 'Easy' ? 'bg-green-600' :
                  selectedCard.problem.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {selectedCard.problem.difficulty}
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{selectedCard.problem.description}</p>

            {selectedCard.reward && (
              <div className="mb-2">
                <span className="text-sm px-3 py-1 bg-purple-600/30 text-purple-300 rounded">
                  Reward: {selectedCard.reward.effect.replace('_', ' ')} {selectedCard.reward.value}s
                </span>
              </div>
            )}

            {selectedCard.challenge && (
              <div>
                <span className="text-sm px-3 py-1 bg-orange-600/30 text-orange-300 rounded">
                  Challenge: {selectedCard.challenge.type.replace('_', ' ')} {selectedCard.challenge.value}
                </span>
              </div>
            )}

            <button
              onClick={() => selectCard(null)}
              className="mt-4 text-sm text-gray-400 hover:text-white"
            >
              ← Back to cards
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Select a Problem</h2>
            <div className="grid grid-cols-5 gap-4">
              {cardsToShow.map((card) => (
                <ProblemCard
                  key={card.id}
                  card={card}
                  isSelected={card.id === selectedCardId}
                  onSelect={() => handleCardSelect(card.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Code Editor */}
        {selectedCard && (
          <div className="flex-1">
            <CodeEditor
              onSubmit={handleSubmitSolution}
              disabled={currentPlayer.isEliminated}
            />
          </div>
        )}

        {
        /* A duplicated "Select a Problem" section. Currently not needed.
        {!selectedCardId && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Your Cards ({currentPlayer.cards.length}/5)</h3>
            <div className="grid grid-cols-5 gap-4">
              {currentPlayer.cards.map((card) => (
                <ProblemCard
                  key={card.id}
                  card={card}
                  isSelected={false}
                  onSelect={() => handleCardSelect(card.id)}
                />
              ))}
            </div>
          </div>
        )} */
        }
      </div>
    </div>
  )
}