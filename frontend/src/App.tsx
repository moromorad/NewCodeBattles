import { useGameStore } from './store/gameStore'
import { StartMenu } from './components/StartMenu'
import { Lobby } from './components/Lobby'
import { GameScreen } from './components/GameScreen'

function App() {
  const gameStatus = useGameStore((state) => state.gameStatus)

  if (gameStatus === 'menu') {
    return <StartMenu />
  }

  if (gameStatus === 'lobby') {
    return <Lobby />
  }

  if (gameStatus === 'playing' || gameStatus === 'ended') {
    return <GameScreen />
  }

  return <StartMenu />
}

export default App