import { Navigate, Route, Routes } from 'react-router-dom'
import { VoidBackground } from './components/VoidBackground'
import { useAutoSave } from './hooks/useAutoSave'
import { CodexScreen } from './screens/CodexScreen'
import { GameScreen } from './screens/GameScreen'
import { MainMenuScreen } from './screens/MainMenuScreen'
import { SettingsScreen } from './screens/SettingsScreen'

function App() {
  useAutoSave()

  return (
    <div className="app-shell">
      <VoidBackground />
      <main className="route-layer">
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<MainMenuScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/codex" element={<CodexScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
