import { ProblemCard as ProblemCardType } from '../store/gameStore'

interface ProblemCardProps {
  card: ProblemCardType
  isSelected: boolean
  onSelect: () => void
}

export function ProblemCard({ card, isSelected, onSelect }: ProblemCardProps) {
  const difficultyColors = {
    Easy: 'bg-green-600',
    Medium: 'bg-yellow-600',
    Hard: 'bg-red-600'
  }

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-900/20 scale-105'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{card.problem.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[card.problem.difficulty]}`}>
          {card.problem.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
        {card.problem.description}
      </p>

      {card.reward && (
        <div className="mb-2">
          <span className="text-xs px-2 py-1 bg-purple-600/30 text-purple-300 rounded">
            Reward: {card.reward.effect.replace('_', ' ')} {card.reward.value}s
          </span>
        </div>
      )}

      {card.challenge && (
        <div>
          <span className="text-xs px-2 py-1 bg-orange-600/30 text-orange-300 rounded">
            Challenge: {card.challenge.type.replace('_', ' ')} {card.challenge.value}
          </span>
        </div>
      )}
    </div>
  )
}