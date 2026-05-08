import { Navigate, Route, Routes } from 'react-router-dom'
import { VoidBackground } from './components/VoidBackground'
import { useAutoSave } from './hooks/useAutoSave'
import { CodexScreen } from './screens/CodexScreen'
import { DoorsScreen } from './screens/DoorsScreen'
import { FirstDreamScreen } from './screens/FirstDreamScreen'
import { GameScreen } from './screens/GameScreen'
import { MainMenuScreen } from './screens/MainMenuScreen'
import { PathGenerationScreen } from './screens/PathGenerationScreen'
import { PeaceEndingScreen } from './screens/PeaceEndingScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { TrialsScreen } from './screens/TrialsScreen'
import { CharacterCreationScreen } from './screens/CharacterCreationScreen'

function App() {
  useAutoSave()

  return (
    <div className="app-shell">
      <VoidBackground />
      <main className="route-layer">
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<MainMenuScreen />} />
          <Route path="/first-dream" element={<FirstDreamScreen />} />
          <Route path="/doors" element={<DoorsScreen />} />
          <Route path="/peace-ending" element={<PeaceEndingScreen />} />
          <Route path="/trials" element={<TrialsScreen />} />
          <Route path="/path-generation" element={<PathGenerationScreen />} />
          <Route path="/character-creation" element={<CharacterCreationScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/codex" element={<CodexScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
