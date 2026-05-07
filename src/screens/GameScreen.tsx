import { CircleRing } from '../components/CircleRing'
import { CosmicButton } from '../components/CosmicButton'
import { EnergyBar } from '../components/EnergyBar'
import { FoundationDisplay } from '../components/FoundationDisplay'
import { GlyphPanel } from '../components/GlyphPanel'
import { MysteryCounter } from '../components/MysteryCounter'
import { PortraitFrame } from '../components/PortraitFrame'
import { RuneText } from '../components/RuneText'
import { TooltipGlyph } from '../components/TooltipGlyph'
import { useGameContext } from '../store/useGameContext'
import { useGameStore } from '../store/gameStore'

export function GameScreen() {
  const { shell, setShell } = useGameContext()
  const character = useGameStore((state) => state.character)
  const gainMarks = useGameStore((state) => state.gainMarks)

  return (
    <section className="screen">
      <GlyphPanel title="Game Shell">
        <p>
          <RuneText text={`Current phase: ${shell.phase}`} />
        </p>
        <p>
          Current route: {shell.route}{' '}
          <TooltipGlyph label="Route info" text="This is the active route inside the app shell.">
            <span className="glyph-tip">[?]</span>
          </TooltipGlyph>
        </p>
        <CosmicButton
          type="button"
          onClick={() =>
            setShell({
              phase: 'first-dream',
              route: 'game',
            })
          }
        >
          Enter The First Dream
        </CosmicButton>
      </GlyphPanel>

      <GlyphPanel title="Component Preview">
        <div className="component-grid">
          <PortraitFrame name={character.name} />
          <CircleRing circle={character.circle} progress={38} />
          <MysteryCounter
            marks={character.mystery.count}
            stage={character.mystery.masteryStage}
          />
        </div>
        <EnergyBar value={character.currentEnergy} max={character.mindSpace} />
        <FoundationDisplay
          stage={character.foundation.stage}
          integrity={character.foundation.integrity}
        />
        <CosmicButton onClick={() => gainMarks(250)} glow="strong">
          Gather 250 Mystery Marks
        </CosmicButton>
      </GlyphPanel>
    </section>
  )
}
