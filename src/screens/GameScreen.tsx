import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleRing } from '../components/CircleRing'
import { CosmicButton } from '../components/CosmicButton'
import { EnergyBar } from '../components/EnergyBar'
import { FoundationDisplay } from '../components/FoundationDisplay'
import { GlyphPanel } from '../components/GlyphPanel'
import { MysteryCounter } from '../components/MysteryCounter'
import { PortraitFrame } from '../components/PortraitFrame'
import { RuneText } from '../components/RuneText'
import { useGameStore } from '../store/gameStore'
import { generateWorldMap, getRegionForCircle } from '../systems/worldMapGenerator'
import { generateEnemy, generateBoss } from '../systems/enemyGenerator'
import {
  createCombatState,
  startInitiative,
  playerAttack,
  enemyTurn,
  resolveCombat,
  isCombatOver,
  getWinner,
} from '../systems/combatEngine'
import type { WorldNode } from '../types/world'
import type { CombatState } from '../types/combat'

type GameView = 'map' | 'character' | 'codex' | 'techniques' | 'options'

interface Notification {
  id: string
  message: string
  type: 'marks' | 'stage' | 'achievement' | 'combat' | 'info'
}

const NODE_TYPE_ICONS: Record<string, string> = {
  safe: '\u{1F3E1}',       // house
  danger: '\u2694\uFE0F',  // swords
  discovery: '\u{1F50D}',  // magnifying glass
  boss: '\u{1F480}',       // skull
  story: '\u{1F4DC}',      // scroll
}

const NODE_TYPE_COLORS: Record<string, string> = {
  safe: 'var(--gold-primary)',
  danger: 'var(--blood-red)',
  discovery: 'var(--spirit-blue)',
  boss: '#ff4444',
  story: 'var(--glyph-glow)',
}

export function GameScreen() {
  const navigate = useNavigate()
  const character = useGameStore((s) => s.character)
  const world = useGameStore((s) => s.world)
  const combat = useGameStore((s) => s.combat)
  const time = useGameStore((s) => s.time)
  const setWorldNodes = useGameStore((s) => s.setWorldNodes)
  const visitNode = useGameStore((s) => s.visitNode)
  const setCurrentNode = useGameStore((s) => s.setCurrentNode)
  const startCombat = useGameStore((s) => s.startCombat)
  const endCombat = useGameStore((s) => s.endCombat)
  const appendCombatLog = useGameStore((s) => s.appendCombatLog)
  const gainMarks = useGameStore((s) => s.gainMarks)
  const gainEnergy = useGameStore((s) => s.gainEnergy)
  const advanceYears = useGameStore((s) => s.advanceYears)
  const advanceTicks = useGameStore((s) => s.advanceTicks)

  const [currentView, setCurrentView] = useState<GameView>('map')
  const [selectedNode, setSelectedNode] = useState<WorldNode | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [combatMode, setCombatMode] = useState(false)
  const [localCombat, setLocalCombat] = useState<CombatState | null>(null)

  const activeCombat = combat ?? localCombat

  // Initialize world on first load
  useEffect(() => {
    if (world.nodes.length === 0) {
      const nodes = generateWorldMap(character)
      setWorldNodes(nodes)
      if (nodes.length > 0) {
        setCurrentNode(nodes[0].id)
      }
    }
  }, [world.nodes.length, character, setWorldNodes, setCurrentNode])

  const currentNode = useMemo(
    () => world.nodes.find((n) => n.id === world.currentNodeId) ?? null,
    [world.nodes, world.currentNodeId],
  )

  const connectedNodes = useMemo(
    () => world.nodes.filter((n) => currentNode?.connections.includes(n.id) || n.connections.includes(currentNode?.id ?? '')),
    [world.nodes, currentNode],
  )

  const regionInfo = useMemo(
    () => getRegionForCircle(character.circle),
    [character.circle],
  )

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3500)
  }, [])

  // Explore a node
  const handleExploreNode = useCallback(
    (node: WorldNode) => {
      if (!currentNode || !currentNode.connections.includes(node.id)) return

      setSelectedNode(node)
      visitNode(node.id)
      advanceTicks(1)

      if (node.type === 'danger' || node.type === 'boss') {
        const enemy = node.type === 'boss' ? generateBoss(character.circle) : generateEnemy(character.circle)
        const cmb = createCombatState(character, [enemy], {
          region: node.region,
          environment: node.name,
          modifiers: node.type === 'boss' ? ['oppressive-atmosphere', 'boss-arena'] : ['hostile-territory'],
        })
        const initiated = startInitiative(cmb)
        startCombat(initiated)
        setLocalCombat(initiated)
        setCombatMode(true)
        addNotification(`\u2694\uFE0F ${enemy.name} appears!`, 'combat')
      } else if (node.type === 'discovery') {
        const marks = 20 + Math.floor(Math.random() * 40) * character.circle
        gainMarks(marks)
        addNotification(`\u2728 Discovered ${marks} Mystery Marks!`, 'marks')
        if (Math.random() < 0.3) {
          const energyGain = 5 + Math.floor(Math.random() * 15)
          gainEnergy(energyGain)
          addNotification(`\u{1F4A0} Recovered ${energyGain} Path Energy`, 'info')
        }
      } else if (node.type === 'story') {
        advanceYears(1)
        const marks = 30 + Math.floor(Math.random() * 50) * character.circle
        gainMarks(marks)
        addNotification(`\u{1F4DC} Fate unravels... ${marks} Mystery Marks granted.`, 'stage')
      } else if (node.type === 'safe') {
        const energyGain = 10 + Math.floor(Math.random() * 20)
        gainEnergy(energyGain)
        addNotification(`\u{1F3E1} Restored ${energyGain} Path Energy`, 'info')
      }
    },
    [currentNode, visitNode, advanceTicks, character, startCombat, gainMarks, gainEnergy, advanceYears, addNotification],
  )

  // Combat actions
  const handlePlayerAttack = useCallback(() => {
    const cmb = activeCombat
    if (!cmb || cmb.phase !== 'player-turn') return
    const next = playerAttack(cmb)
    appendCombatLog(next.combatLog[next.combatLog.length - 1])

    if (isCombatOver(next)) {
      const { marksGained, victory } = resolveCombat(next)
      if (victory) {
        gainMarks(marksGained)
        addNotification(`\u{1F3C6} Victory! +${marksGained} Mystery Marks`, 'marks')
      } else {
        addNotification('\u{1F480} Defeated... Your Path was not strong enough.', 'combat')
      }
      setTimeout(() => {
        endCombat()
        setLocalCombat(null)
        setCombatMode(false)
      }, 2000)
    } else {
      startCombat(next)
      setLocalCombat(next)
      setTimeout(() => {
        const afterEnemy = enemyTurn(next)
        appendCombatLog(afterEnemy.combatLog[afterEnemy.combatLog.length - 1])
        if (isCombatOver(afterEnemy)) {
          const { marksGained, victory } = resolveCombat(afterEnemy)
          if (victory) {
            gainMarks(marksGained)
            addNotification(`\u{1F3C6} Victory! +${marksGained} Mystery Marks`, 'marks')
          } else {
            addNotification('\u{1F480} Defeated... Your Path was not strong enough.', 'combat')
          }
          setTimeout(() => {
            endCombat()
            setLocalCombat(null)
            setCombatMode(false)
          }, 2000)
        } else {
          startCombat(afterEnemy)
          setLocalCombat(afterEnemy)
        }
      }, 800)
    }
  }, [activeCombat, appendCombatLog, gainMarks, endCombat, addNotification, startCombat])

  const handleFleeCombat = useCallback(() => {
    if (activeCombat && activeCombat.phase === 'player-turn') {
      addNotification('\u{1F3C3} You fled from combat!', 'info')
      endCombat()
      setLocalCombat(null)
      setCombatMode(false)
      // Return to previous node
      if (world.currentNodeId && world.visitedNodeIds.length > 1) {
        const prev = world.visitedNodeIds[world.visitedNodeIds.length - 2]
        setCurrentNode(prev)
      }
    }
  }, [activeCombat, addNotification, endCombat, world, setCurrentNode])

  const playerParticipant = activeCombat?.participants.find((p) => p.kind === 'player')
  const enemyParticipants = activeCombat?.participants.filter((p) => p.kind === 'enemy') ?? []

  // If no character, redirect
  useEffect(() => {
    if (!character.name || character.name === 'Unnamed Seeker') {
      navigate('/first-dream')
    }
  }, [character.name, navigate])

  if (combatMode && activeCombat) {
    const combatOver = isCombatOver(activeCombat)
    const winner = combatOver ? getWinner(activeCombat) : null

    return (
      <motion.section
        className="screen screen-game"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="game-hud">
          <header className="hud-top">
            <div className="resource-bar">
              <div className="energy-section">
                <label>Path Energy</label>
                <EnergyBar value={playerParticipant?.hp ?? 0} max={playerParticipant?.maxHp ?? 100} />
              </div>
              <div className="marks-section">
                <MysteryCounter marks={character.mystery.count} stage={character.mystery.masteryStage} />
              </div>
            </div>
          </header>

          <main className="hud-main">
            <GlyphPanel title={`\u2694\uFE0F Combat — Turn ${activeCombat.turn}`}>
              <div className="combat-content">
                <div className="combat-participants">
                  <div className="combat-player">
                    <PortraitFrame name={character.name} />
                    <div className="combat-hp-bar">
                      <EnergyBar value={playerParticipant?.hp ?? 0} max={playerParticipant?.maxHp ?? 100} />
                      <span className="combat-stat">{playerParticipant?.hp ?? 0} / {playerParticipant?.maxHp ?? 100} HP</span>
                    </div>
                  </div>
                  <div className="combat-vs">VS</div>
                  {enemyParticipants.map((enemy) => {
                    const enemyData = activeCombat.enemies.find((e) => e.id === enemy.id)
                    return (
                      <div key={enemy.id} className="combat-enemy">
                        <RuneText text={enemy.name} />
                        <div className="combat-hp-bar">
                          <EnergyBar value={enemy.hp} max={enemy.maxHp} />
                          <span className="combat-stat">{enemy.hp} / {enemy.maxHp} HP</span>
                        </div>
                        {enemyData && (
                          <div className="enemy-info">
                            <span className="enemy-tier">{enemyData.tier} — Circle {enemyData.circle}</span>
                            <p className="enemy-lore">{enemyData.lore}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {combatOver && (
                  <motion.div
                    className="combat-result"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <RuneText
                      text={winner === 'player' ? 'Victory!' : winner === 'enemy' ? 'Defeat...' : 'Combat Ended'}
                    />
                  </motion.div>
                )}

                {!combatOver && (
                  <div className="combat-actions">
                    <CosmicButton
                      onClick={handlePlayerAttack}
                      disabled={activeCombat.phase !== 'player-turn'}
                      className="combat-action-btn"
                    >
                      Attack
                    </CosmicButton>
                    <CosmicButton
                      onClick={handleFleeCombat}
                      disabled={activeCombat.phase !== 'player-turn'}
                      glow="soft"
                    >
                      Flee
                    </CosmicButton>
                  </div>
                )}

                {combatOver && (
                  <div className="combat-post-actions">
                    <CosmicButton onClick={() => { endCombat(); setLocalCombat(null); setCombatMode(false) }}>
                      Continue
                    </CosmicButton>
                  </div>
                )}

                <div className="combat-log">
                  {activeCombat.combatLog.slice(-5).map((line, i) => (
                    <p key={i} className="combat-log-entry">{line}</p>
                  ))}
                </div>
              </div>
            </GlyphPanel>
          </main>

          <aside className="hud-panel hud-right">
            <GlyphPanel title="Combat Info">
              <div className="context-info">
                <div className="info-item">
                  <label>Field</label>
                  <span>{activeCombat.field.environment}</span>
                </div>
                <div className="info-item">
                  <label>Modifiers</label>
                  <span>{activeCombat.field.modifiers.join(', ') || 'None'}</span>
                </div>
              </div>
            </GlyphPanel>
          </aside>
        </div>

        <div className="notifications-container">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                className={`notification notification-${n.type}`}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.8 }}
              >
                <RuneText text={n.message} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      className="screen screen-game"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="game-hud">
        {/* Left Panel - Character Info */}
        <aside className="hud-panel hud-left">
          <GlyphPanel title="Seeker">
            <PortraitFrame name={character.name} auraColor={character.path?.auraColor} />
            <div className="character-info">
              <RuneText text={character.name} />
              <div className="circle-badge">
                <CircleRing circle={character.circle} progress={Math.floor((character.mystery.count % 1000) / 10)} size="small" />
                <span>Circle {character.circle}</span>
              </div>
              <div className="lifespan-info">
                <span>Lifespan: {character.lifespan} years</span>
              </div>
              {character.path && (
                <div className="path-info">
                  <span className="path-label" style={{ color: character.path.auraColor }}>
                    {character.path.name}
                  </span>
                </div>
              )}
            </div>
          </GlyphPanel>
        </aside>

        {/* Top Bar */}
        <header className="hud-top">
          <div className="resource-bar">
            <div className="energy-section">
              <label>Path Energy</label>
              <EnergyBar value={character.currentEnergy} max={character.mindSpace} />
            </div>
            <div className="marks-section">
              <MysteryCounter marks={character.mystery.count} stage={character.mystery.masteryStage} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="hud-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              className="game-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'map' && (
                <GlyphPanel title={`\u{1F5FA}\uFE0F ${regionInfo.name} — ${character.name}'s Journey`}>
                  <div className="world-map">
                    <p className="region-description">{regionInfo.description}</p>
                    <div className="node-info-header">
                      <span>Year {time.year}, Era: {time.era}</span>
                      <span>Nodes: {world.visitedNodeIds.length} explored / {world.nodes.length} total</span>
                    </div>

                    {currentNode && (
                      <div className="current-location">
                        <RuneText text={`\u{1F4CD} ${currentNode.name}`} />
                        <p className="node-desc">{currentNode.description}</p>
                        <span className={`node-type-badge node-type-${currentNode.type}`}>
                          {NODE_TYPE_ICONS[currentNode.type] ?? '?'} {currentNode.type.toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="node-grid">
                      <h3 className="connections-title">Connected Locations</h3>
                      {connectedNodes.length === 0 && (
                        <p className="no-connections">No paths lead from here. Explore further.</p>
                      )}
                      <div className="node-list">
                        {connectedNodes.map((node) => (
                          <motion.div
                            key={node.id}
                            className={`node-card ${node.visited ? 'visited' : ''} node-${node.type}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleExploreNode(node)}
                          >
                            <div className="node-card-header">
                              <span className="node-icon">{NODE_TYPE_ICONS[node.type] ?? '?'}</span>
                              <span className="node-card-name">{node.name}</span>
                              {node.visited && <span className="visited-badge">\u2713</span>}
                            </div>
                            <p className="node-card-desc">{node.description}</p>
                            <div className="node-card-footer">
                              <span className="node-type-label" style={{ color: NODE_TYPE_COLORS[node.type] }}>
                                {node.type.toUpperCase()}
                              </span>
                              <span className="explore-hint">
                                {node.visited ? 'Revisit' : 'Explore'} &rarr;
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {selectedNode && selectedNode !== currentNode && (
                      <div className="last-explored">
                        <span>Last explored: {selectedNode.name}</span>
                      </div>
                    )}
                  </div>
                </GlyphPanel>
              )}

              {currentView === 'character' && (
                <GlyphPanel title="Character Sheet">
                  <div className="character-sheet">
                    <FoundationDisplay stage={character.foundation.stage} integrity={character.foundation.integrity} />
                    <div className="stats-grid">
                      {Object.entries(character.stats).map(([key, value]) => (
                        <div key={key} className="stat-item">
                          <label>{key}</label>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <label>Mind Space</label>
                        <span>{character.mindSpace}</span>
                      </div>
                      <div className="stat-item">
                        <label>Energy</label>
                        <span>{character.currentEnergy}</span>
                      </div>
                      <div className="stat-item">
                        <label>Lifespan</label>
                        <span>{character.lifespan} yrs</span>
                      </div>
                      <div className="stat-item">
                        <label>Age</label>
                        <span>{character.age + time.year}</span>
                      </div>
                    </div>
                    {character.techniques.length > 0 && (
                      <div className="techniques-section">
                        <h3>Techniques</h3>
                        <div className="techniques-list">
                          {character.techniques.map((t) => (
                            <span key={t} className="technique-tag">{t.replace(/-/g, ' ')}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlyphPanel>
              )}

              {currentView === 'codex' && (
                <GlyphPanel title="Codex">
                  <div className="codex-content">
                    <RuneText text="The Chronicles of the Path" />
                    <div className="codex-entries">
                      <div className="codex-entry">
                        <h4>Your Path: {character.path?.name ?? 'Unknown'}</h4>
                        <p>{character.path?.description ?? 'Your Path has not yet been forged.'}</p>
                        <p className="codex-quote">"{character.path?.philosophy ?? 'Seek and you shall find.'}"</p>
                      </div>
                      <div className="codex-entry">
                        <h4>Region: {regionInfo.name}</h4>
                        <p>{regionInfo.description}</p>
                      </div>
                      <div className="codex-entry">
                        <h4>Mystery Marks: {character.mystery.count}</h4>
                        <p>Mastery Stage: {character.mystery.masteryStage}</p>
                        <p>Boost Multiplier: {character.mystery.boostMultiplier}x</p>
                        <p>Bones Formed: {character.mystery.bones} / 206</p>
                      </div>
                      <p className="codex-hint">More entries will be unlocked as you explore the world.</p>
                    </div>
                  </div>
                </GlyphPanel>
              )}

              {currentView === 'techniques' && (
                <GlyphPanel title="Techniques">
                  <div className="techniques-content">
                    <RuneText text="Available Techniques" />
                    {character.techniques.length === 0 ? (
                      <p>No techniques available yet. Explore the world to unlock new abilities.</p>
                    ) : (
                      <div className="techniques-list">
                        {character.techniques.map((t) => (
                          <motion.div key={t} className="technique-card" whileHover={{ scale: 1.02 }}>
                            <h4>{t.replace(/-/g, ' ')}</h4>
                            <p className="technique-hint">Master this technique through combat and cultivation.</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <p className="technique-hint">New techniques unlock as your Path grows stronger.</p>
                  </div>
                </GlyphPanel>
              )}

              {currentView === 'options' && (
                <GlyphPanel title="Options">
                  <div className="options-content">
                    <CosmicButton onClick={() => navigate('/menu')} glow="soft">
                      Return to Main Menu
                    </CosmicButton>
                    <CosmicButton onClick={() => navigate('/settings')} glow="soft">
                      Settings
                    </CosmicButton>
                  </div>
                </GlyphPanel>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right Panel */}
        <aside className="hud-panel hud-right">
          <GlyphPanel title="World">
            <div className="context-info">
              <div className="info-item">
                <label>Region</label>
                <span>{regionInfo.name}</span>
              </div>
              <div className="info-item">
                <label>Location</label>
                <span>{currentNode?.name ?? 'Unknown'}</span>
              </div>
              <div className="info-item">
                <label>Time</label>
                <span>Era {character.circle}, Year {time.year}</span>
              </div>
              <div className="info-item">
                <label>Explored</label>
                <span>{world.visitedNodeIds.length} / {world.nodes.length} nodes</span>
              </div>
            </div>
          </GlyphPanel>
        </aside>

        {/* Bottom Navigation */}
        <nav className="hud-bottom">
          <div className="nav-buttons">
            {[
              { id: 'map' as GameView, label: 'Map', icon: '\u{1F5FA}\uFE0F' },
              { id: 'character' as GameView, label: 'Self', icon: '\u{1F464}' },
              { id: 'codex' as GameView, label: 'Codex', icon: '\u{1F4DA}' },
              { id: 'techniques' as GameView, label: 'Arts', icon: '\u2694\uFE0F' },
              { id: 'options' as GameView, label: 'Options', icon: '\u2699\uFE0F' },
            ].map(({ id, label, icon }) => (
              <CosmicButton
                key={id}
                className={`nav-button ${currentView === id ? 'active' : ''}`}
                onClick={() => setCurrentView(id)}
                size="small"
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </CosmicButton>
            ))}
          </div>
        </nav>
      </div>

      {/* Notifications */}
      <div className="notifications-container">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              className={`notification notification-${n.type}`}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <RuneText text={n.message} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
