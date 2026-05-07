import { NavLink } from 'react-router-dom'
import { GlyphPanel } from '../components/GlyphPanel'
import { SaveMenu } from '../components/SaveMenu'

export function MainMenuScreen() {
  return (
    <section className="screen screen-main-menu">
      <GlyphPanel className="title-panel">
        <p className="kicker">The Eternal Existence</p>
        <h1>AL-WUJUD AL-AZALI</h1>
        <p className="subtitle">Choose your first step into the void.</p>
      </GlyphPanel>

      <GlyphPanel title="Main Menu">
        <nav className="menu-list" aria-label="Main navigation">
          <NavLink to="/game" className="menu-link">
            New Game
          </NavLink>
          <NavLink to="/game" className="menu-link">
            Continue
          </NavLink>
          <NavLink to="/codex" className="menu-link">
            Codex
          </NavLink>
          <NavLink to="/settings" className="menu-link">
            Settings
          </NavLink>
        </nav>
      </GlyphPanel>

      <GlyphPanel title="Continue">
        <SaveMenu />
      </GlyphPanel>
    </section>
  )
}
