import { useEffect } from 'react'
import { useGameStore } from './store/useGameStore'
import { Lobby } from './components/Lobby'
import { GameView } from './components/GameView'
import { WaitingRoom } from './components/WaitingRoom'

function App() {
  const { connect, isConnected, roomId, gameState } = useGameStore()

  useEffect(() => {
    connect()
  }, [connect])

  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      {!isConnected && (
        <div className="fixed top-2 left-2 text-red-500 text-xs font-mono z-50 bg-black px-2">OFFLINE</div>
      )}

      {!roomId ? (
        <Lobby />
      ) : (
        !gameState?.started ? (
          <WaitingRoom />
        ) : (
          <GameView />
        )
      )}
    </div>
  )
}

export default App