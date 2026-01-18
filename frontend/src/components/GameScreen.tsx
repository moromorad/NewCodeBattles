import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { PlayerHealthBar } from './PlayerHealthBar'
import { ProblemCard } from './ProblemCard'
import { CodeEditor } from './CodeEditor'

interface GameScreenProps {
  emitSelectCard: (cardId: string) => void
  emitSubmitSolution: (cardId: string, code: string) => void
  emitPlayerEliminated: () => void
}

export function GameScreen({ emitSelectCard, emitSubmitSolution, emitPlayerEliminated }: GameScreenProps) {
  const {
    players,
    currentPlayerId,
    selectedCardId,
    selectCard,
    updatePlayer,
    gameStatus
  } = useGameStore()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
          // Emit player eliminated to backend
          emitPlayerEliminated()
          updatePlayer(currentPlayerId!, { isEliminated: true })
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPlayerId, players, updatePlayer, emitPlayerEliminated, currentPlayer])

  const handleCardSelect = (cardId: string) => {
    if (currentPlayer && !currentPlayer.isEliminated) {
      selectCard(cardId)
      // Emit to backend
      emitSelectCard(cardId)
    }
  }

  const handleSubmitSolution = (code: string) => {
    if (!selectedCardId || !currentPlayerId) return

    // Clear any previous errors
    setErrorMessage(null)

    // Emit to backend - backend handles code execution, card removal, and new card addition
    emitSubmitSolution(selectedCardId, code)
  }

  // Listen for solution failed event (handled by useSocket, but we can show error here)
  // Error handling is done in useSocket hook, but we could add a listener here if needed

  if (!currentPlayer) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>
  }

  // When a card is selected, hide other cards
  const cardsToShow = selectedCardId ? currentPlayer.cards.filter(c => c.id === selectedCardId) : currentPlayer.cards

  // Show winner screen if game ended
  if (gameStatus === 'ended') {
    const winner = Object.values(players).find(p => p.id === currentPlayerId && !p.isEliminated)
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Game Over!</h1>
          <p className="text-2xl text-gray-400">
            {winner ? 'You Won! 🎉' : 'Game Ended'}
          </p>
        </div>
      </div>
    )
  }

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
        {/* Error Message Display */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Selected Problem Card Display */}
        {selectedCard ? (
          <div className="mb-6 bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedCard.problem.title}</h2>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${selectedCard.problem.difficulty === 'Easy' ? 'bg-green-600' :
                    selectedCard.problem.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                  {selectedCard.problem.difficulty}
                </span>
              </div>
            </div>

            <p className="text-gray-300 mb-4">{selectedCard.problem.description}</p>

            {/* Function Signature */}
            {selectedCard.problem.functionSignature && (
              <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Function Signature:</p>
                <code className="text-green-400 font-mono">{selectedCard.problem.functionSignature}</code>
              </div>
            )}

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
              onClick={() => {
                selectCard(null)
                emitSelectCard('') // Clear selection on backend
              }}
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
      </div>
    </div>
  )
}
