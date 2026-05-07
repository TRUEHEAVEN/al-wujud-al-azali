import { GlyphPanel } from '../components/GlyphPanel'
import { SaveMenu } from '../components/SaveMenu'

export function SettingsScreen() {
  return (
    <section className="screen">
      <GlyphPanel title="Settings">
        <p>Audio, display, and gameplay controls will live here.</p>
      </GlyphPanel>
      <GlyphPanel title="Data Management">
        <SaveMenu />
      </GlyphPanel>
    </section>
  )
}
