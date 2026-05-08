import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleRing } from '../components/CircleRing'
import { CosmicButton } from '../components/CosmicButton'
import { DiscoveryOverlay } from '../components/DiscoveryOverlay'
import type { DiscoveryReward } from '../types/exploration'
import { EnergyBar } from '../components/EnergyBar'
import { FoundationDisplay } from '../components/FoundationDisplay'
import { GlyphPanel } from '../components/GlyphPanel'
import { MysteryCounter } from '../components/MysteryCounter'
import { NarrativeOverlay } from '../components/NarrativeOverlay'
import type { ResolvedNarrativeEvent } from '../components/NarrativeOverlay'
import { PortraitFrame } from '../components/PortraitFrame'
import { RuneText } from '../components/RuneText'
import { useGameStore } from '../store/gameStore'
import { generateWorldMap, getRegionForCircle } from '../systems/worldMapGenerator'
import { generateEnemy, generateBoss } from '../systems/enemyGenerator'
import {
  createCombatState,
  startInitiative,
  playerAttack,
  playerTechniqueAttack,
  enemyTurn,
  resolveCombat,
  isCombatOver,
  getWinner,
} from '../systems/combatEngine'
import { getTechniquesByIds } from '../systems/techniqueSystem'
import {
  buildNarrativeContext,
  selectNodeEvent,
  resolveChoiceEffects,
  getCombatAftermathEvent,
} from '../systems/narrativeEngine'
import {
  resolveHazard,
  derivePerceptionField,
  checkHiddenNodeVisibility,
} from '../systems/explorationEngine'
import { getNodeEventsForType, COMBAT_EVENTS } from '../data/narrativeEvents'
import { getHazardDefinition } from '../data/explorationData'
import { HazardType } from '../types/exploration'
import type { WorldNode } from '../types/world'
import type { CombatState } from '../types/combat'
import type { DiscoveryGame } from '../types/exploration'

type GameView = 'map' | 'character' | 'codex' | 'techniques' | 'options'

interface Notification {
  id: string
  message: string
  type: 'marks' | 'stage' | 'achievement' | 'combat' | 'info' | 'hazard' | 'loot'
}

const NODE_TYPE_ICONS: Record<string, string> = {
  safe: '\u{1F3E1}',
  danger: '\u2694\uFE0F',
  discovery: '\u{1F50D}',
  boss: '\u{1F480}',
  story: '\u{1F4DC}',
}

const NODE_TYPE_COLORS: Record<string, string> = {
  safe: 'var(--gold-primary)',
  danger: 'var(--blood-red)',
  discovery: 'var(--spirit-blue)',
  boss: '#ff4444',
  story: 'var(--glyph-glow)',
}

const HAZARD_ICONS: Record<string, string> = {
  [HazardType.PoisonSwamp]: '\u2620\uFE0F',
  [HazardType.VoidStorm]: '\u{1F300}',
  [HazardType.BloodMist]: '\u{1FA78}',
  [HazardType.DustWaste]: '\u{1F4A8}',
  [HazardType.BoneField]: '\u{1F480}',
  [HazardType.ResonanceCrack]: '\u26A1',
  [HazardType.EchoMaze]: '\u{1F5FA}\uFE0F',
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
  const spendEnergy = useGameStore((s) => s.spendEnergy)
  const advanceYears = useGameStore((s) => s.advanceYears)
  const advanceTicks = useGameStore((s) => s.advanceTicks)
  const setNarrativeFlag = useGameStore((s) => s.setNarrativeFlag)
  const unlockCodex = useGameStore((s) => s.unlockCodex)
  const revealHiddenNode = useGameStore((s) => s.revealHiddenNode)
  const addLootToInventory = useGameStore((s) => s.addLootToInventory)
  const markDiscoveryComplete = useGameStore((s) => s.markDiscoveryComplete)

  const [currentView, setCurrentView] = useState<GameView>('map')
  const [selectedNode, setSelectedNode] = useState<WorldNode | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [combatMode, setCombatMode] = useState(false)
  const [localCombat, setLocalCombat] = useState<CombatState | null>(null)
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null)
  const [narrativeEvent, setNarrativeEvent] = useState<ResolvedNarrativeEvent | null>(null)
  const [pendingNodeAction, setPendingNodeAction] = useState<(() => void) | null>(null)
  const [discoveryGame, setDiscoveryGame] = useState<DiscoveryGame | null>(null)
  const [hazardAwareness, setHazardAwareness] = useState<boolean>(false)

  const activeCombat = combat ?? localCombat

  const knownTechniques = useMemo(() => {
    return getTechniquesByIds(character.techniques)
  }, [character.techniques])

  const perceptionField = useMemo(() => derivePerceptionField(character), [character])

  useEffect(() => {
    if (world.nodes.length === 0) {
      const nodes = generateWorldMap(character)
      setWorldNodes(nodes)
      if (nodes.length > 0) {
        setCurrentNode(nodes[0].id)
      }
    }
  }, [world.nodes.length, character, setWorldNodes, setCurrentNode])

  useEffect(() => {
    for (const node of world.nodes) {
      if (
        node.hidden &&
        !world.revealedHiddenNodeIds.includes(node.id) &&
        checkHiddenNodeVisibility(node.perceptionRequired, perceptionField)
      ) {
        revealHiddenNode(node.id)
      }
    }
  }, [world.nodes, world.revealedHiddenNodeIds, perceptionField, revealHiddenNode])

  const currentNode = useMemo(
    () => world.nodes.find((n) => n.id === world.currentNodeId) ?? null,
    [world.nodes, world.currentNodeId],
  )

  const connectedNodes = useMemo(
    () =>
      world.nodes.filter(
        (n) =>
          !n.hidden &&
          (currentNode?.connections.includes(n.id) ||
            n.connections.includes(currentNode?.id ?? '')),
      ),
    [world.nodes, currentNode],
  )

  const inventory = world.inventory ?? []

  const regionInfo = useMemo(
    () => getRegionForCircle(character.circle),
    [character.circle],
  )

  const addNotification = useCallback(
    (message: string, type: Notification['type']) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setNotifications((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 3500)
    },
    [],
  )

  const executeNodeAction = useCallback(
    (node: WorldNode) => {
      if (node.hazard && node.hazard !== HazardType.None && !hazardAwareness) {
        const hazardResult = resolveHazard(node.hazard, useGameStore.getState().character, false)
        if (hazardResult.damage > 0) {
          addNotification(
            `\u2620\uFE0F ${hazardResult.messages[0] ?? 'Hazard damaged you'}. -${hazardResult.damage} HP`,
            'hazard',
          )
        }
        if (hazardResult.energyLost > 0) {
          spendEnergy(hazardResult.energyLost)
          addNotification(
            `\u{1F300} Lost ${hazardResult.energyLost} Path Energy to ${node.hazard}`,
            'hazard',
          )
        }
        if (hazardResult.marksLost > 0) {
          addNotification(
            `\u2728 Lost ${hazardResult.marksLost} Marks to ${node.hazard}`,
            'hazard',
          )
        }
        if (hazardResult.timeSkipped > 0) {
          advanceYears(hazardResult.timeSkipped)
          addNotification(
            `\u23F3 ${hazardResult.timeSkipped} years passed in the ${node.hazard}`,
            'hazard',
          )
        }
        if (hazardResult.combatTriggered) {
          const enemy = generateEnemy(character.circle)
          const cmb = createCombatState(character, [enemy], {
            region: node.region,
            environment: node.name,
            modifiers: node.combatModifiers ?? ['hostile-territory'],
          })
          const initiated = startInitiative(cmb)
          startCombat(initiated)
          setLocalCombat(initiated)
          setCombatMode(true)
          addNotification(`\u2694\uFE0F Hazard spawns ${enemy.name}!`, 'combat')
          return
        }
        setHazardAwareness(true)
        return
      }

      if (node.discoveryGame && !world.discoveredGameIds.includes(node.discoveryGame.id)) {
        setDiscoveryGame(node.discoveryGame)
        return
      }

      if (node.loot && node.loot.length > 0) {
        addLootToInventory(node.loot)
        for (const item of node.loot) {
          addNotification(`\u{1F4E6} Found: ${item.name} (${item.rarity})`, 'loot')
        }
      }

      if (node.type === 'danger' || node.type === 'boss') {
        const enemy =
          node.type === 'boss'
            ? generateBoss(character.circle)
            : generateEnemy(character.circle)
        const cmb = createCombatState(character, [enemy], {
          region: node.region,
          environment: node.name,
          modifiers:
            node.combatModifiers ??
            (node.type === 'boss'
              ? ['oppressive-atmosphere', 'boss-arena']
              : ['hostile-territory']),
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
        addNotification(
          `\u{1F4DC} Fate unravels... ${marks} Mystery Marks granted.`,
          'stage',
        )
      } else if (node.type === 'safe') {
        const energyGain = 10 + Math.floor(Math.random() * 20)
        gainEnergy(energyGain)
        addNotification(`\u{1F3E1} Restored ${energyGain} Path Energy`, 'info')
      }
    },
    [
      character,
      startCombat,
      gainMarks,
      gainEnergy,
      spendEnergy,
      advanceYears,
      addNotification,
      hazardAwareness,
      world.discoveredGameIds,
      addLootToInventory,
    ],
  )

  const handleExploreNode = useCallback(
    (node: WorldNode) => {
      if (!currentNode || !currentNode.connections.includes(node.id)) return

      setSelectedNode(node)
      visitNode(node.id)
      advanceTicks(1)
      setHazardAwareness(false)

      const context = buildNarrativeContext(useGameStore.getState())
      const events = getNodeEventsForType(node.type)
      const resolved = selectNodeEvent(events, context)

      if (resolved) {
        setNarrativeEvent(resolved)
        setPendingNodeAction(() => () => executeNodeAction(node))
      } else {
        executeNodeAction(node)
      }
    },
    [currentNode, visitNode, advanceTicks, executeNodeAction],
  )

  const handleDiscoveryResolve = useCallback(
    (reward: DiscoveryReward, success: boolean, message: string) => {
      if (!discoveryGame) return

      markDiscoveryComplete(discoveryGame.id)
      gainMarks(reward.marks + reward.bonusMarks)
      addNotification(
        `\u2728 ${success ? 'Discovery!' : 'Partial find'} - +${reward.marks + reward.bonusMarks} Marks`,
        success ? 'achievement' : 'marks',
      )
      addNotification(message, success ? 'achievement' : 'info')

      if (reward.energy && reward.energy > 0) {
        gainEnergy(reward.energy)
      }
      if (reward.codexId && success) {
        unlockCodex(reward.codexId)
        addNotification('\u{1F4DC} Codex entry unlocked!', 'achievement')
      }
      if (reward.techniqueId && success) {
        addNotification('\u2694\uFE0F Technique fragment discovered!', 'achievement')
      }
      if (reward.narrativeAdvance) {
        setNarrativeFlag('discovery-narrative', true)
      }

      setDiscoveryGame(null)

      if (selectedNode && selectedNode.loot && selectedNode.loot.length > 0) {
        addLootToInventory(selectedNode.loot)
        for (const item of selectedNode.loot) {
          addNotification(`\u{1F4E6} Found: ${item.name}`, 'loot')
        }
      }
    },
    [
      discoveryGame,
      markDiscoveryComplete,
      gainMarks,
      gainEnergy,
      unlockCodex,
      setNarrativeFlag,
      addNotification,
      selectedNode,
      addLootToInventory,
    ],
  )

  const handleDiscoveryDismiss = useCallback(() => {
    setDiscoveryGame(null)
    if (selectedNode && selectedNode.loot && selectedNode.loot.length > 0) {
      addLootToInventory(selectedNode.loot)
      for (const item of selectedNode.loot) {
        addNotification(`\u{1F4E6} Found: ${item.name}`, 'loot')
      }
    }
  }, [selectedNode, addLootToInventory, addNotification])

  const handlePlayerAttack = useCallback(() => {
    const cmb = activeCombat
    if (!cmb || cmb.phase !== 'player-turn') return

    const useTechnique =
      selectedTechnique && cmb.cooldowns[selectedTechnique] === undefined
    const next = useTechnique
      ? playerTechniqueAttack(cmb, selectedTechnique)
      : playerAttack(cmb)

    appendCombatLog(next.combatLog[next.combatLog.length - 1])
    setSelectedTechnique(null)

    if (isCombatOver(next)) {
      const { marksGained, victory } = resolveCombat(next)
      if (victory) {
        gainMarks(marksGained)
        addNotification(`\u{1F3C6} Victory! +${marksGained} Mystery Marks`, 'marks')
        const ctx = buildNarrativeContext(useGameStore.getState())
        const aftermath = getCombatAftermathEvent(true, COMBAT_EVENTS, ctx)
        if (aftermath) {
          setTimeout(() => {
            endCombat()
            setLocalCombat(null)
            setCombatMode(false)
            setNarrativeEvent(aftermath)
          }, 600)
        } else {
          setTimeout(() => {
            endCombat()
            setLocalCombat(null)
            setCombatMode(false)
          }, 2000)
        }
      } else {
        addNotification(
          '\u{1F480} Defeated... Your Path was not strong enough.',
          'combat',
        )
        const ctx = buildNarrativeContext(useGameStore.getState())
        const aftermath = getCombatAftermathEvent(false, COMBAT_EVENTS, ctx)
        if (aftermath) {
          setTimeout(() => {
            endCombat()
            setLocalCombat(null)
            setCombatMode(false)
            setNarrativeEvent(aftermath)
          }, 800)
        } else {
          setTimeout(() => {
            endCombat()
            setLocalCombat(null)
            setCombatMode(false)
          }, 2000)
        }
      }
    } else {
      startCombat(next)
      setLocalCombat(next)
      setTimeout(() => {
        const afterEnemy = enemyTurn(next)
        afterEnemy.combatLog
          .slice(next.combatLog.length)
          .forEach((line) => appendCombatLog(line))
        if (isCombatOver(afterEnemy)) {
          const { marksGained, victory } = resolveCombat(afterEnemy)
          if (victory) {
            gainMarks(marksGained)
            addNotification(
              `\u{1F3C6} Victory! +${marksGained} Mystery Marks`,
              'marks',
            )
            const ctx = buildNarrativeContext(useGameStore.getState())
            const aftermath = getCombatAftermathEvent(true, COMBAT_EVENTS, ctx)
            if (aftermath) {
              startCombat(afterEnemy)
              setLocalCombat(afterEnemy)
              setTimeout(() => {
                endCombat()
                setLocalCombat(null)
                setCombatMode(false)
                setNarrativeEvent(aftermath)
              }, 600)
              return
            }
          } else {
            addNotification(
              '\u{1F480} Defeated... Your Path was not strong enough.',
              'combat',
            )
            const ctx = buildNarrativeContext(useGameStore.getState())
            const aftermath = getCombatAftermathEvent(false, COMBAT_EVENTS, ctx)
            if (aftermath) {
              setTimeout(() => {
                endCombat()
                setLocalCombat(null)
                setCombatMode(false)
                setNarrativeEvent(aftermath)
              }, 800)
              return
            }
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
  }, [
    activeCombat,
    selectedTechnique,
    appendCombatLog,
    gainMarks,
    endCombat,
    addNotification,
    startCombat,
  ])

  const handleFleeCombat = useCallback(() => {
    if (activeCombat && activeCombat.phase === 'player-turn') {
      addNotification('\u{1F3C3} You fled from combat!', 'info')
      endCombat()
      setLocalCombat(null)
      setCombatMode(false)
      if (world.currentNodeId && world.visitedNodeIds.length > 1) {
        const prev = world.visitedNodeIds[world.visitedNodeIds.length - 2]
        setCurrentNode(prev)
      }
    }
  }, [activeCombat, addNotification, endCombat, world, setCurrentNode])

  const handleNarrativeChoice = useCallback(
    (choiceId: string) => {
      if (!narrativeEvent) return
      const choice = narrativeEvent.choices.find((c) => c.id === choiceId)
      if (!choice) return

      const effects = resolveChoiceEffects(choice.effects)

      if (effects.marksGained > 0) {
        gainMarks(effects.marksGained)
        addNotification(
          `\u2728 Gained ${effects.marksGained} Mystery Marks`,
          'marks',
        )
      }
      if (effects.energyGained > 0) {
        gainEnergy(effects.energyGained)
      }
      if (effects.energyLost > 0) {
        useGameStore.getState().spendEnergy(effects.energyLost)
      }
      if (effects.timeAdvanced > 0) {
        advanceYears(effects.timeAdvanced)
      }
      if (effects.healthGained > 0) {
        addNotification(`\u2764\uFE0F Restored ${effects.healthGained} HP`, 'info')
      }

      for (const [flag, value] of Object.entries(effects.flagsToSet)) {
        setNarrativeFlag(flag, value)
      }
      for (const codexId of effects.codexToUnlock) {
        unlockCodex(codexId)
        addNotification(`\u{1F4DC} Codex entry unlocked!`, 'achievement')
      }

      if (narrativeEvent.flagOnComplete) {
        setNarrativeFlag(narrativeEvent.flagOnComplete, true)
      }
      if (narrativeEvent.codexOnView) {
        unlockCodex(narrativeEvent.codexOnView)
        addNotification(`\u{1F4DC} Codex entry unlocked!`, 'achievement')
      }

      if (effects.foundationStrengthen) {
        addNotification('\u{1F4AA} Foundation strengthened!', 'stage')
      }
      if (effects.narrativeAdvance) {
        setNarrativeFlag('story-advanced', true)
      }
      if (effects.storyAdvance) {
        setNarrativeFlag('story-embraced', true)
      }
      if (effects.storyAlter) {
        setNarrativeFlag('story-altered', true)
      }
      if (effects.techniqueUnlock) {
        addNotification('\u2694\uFE0F New technique unlocked!', 'achievement')
      }

      setNarrativeEvent(null)

      if (effects.shouldStartCombat) {
        const enemy = effects.isBossCombat
          ? generateBoss(character.circle)
          : generateEnemy(character.circle)
        const cmb = createCombatState(character, [enemy], {
          region: selectedNode?.region ?? 'Unknown',
          environment: selectedNode?.name ?? 'Unknown',
          modifiers: effects.isBossCombat
            ? ['oppressive-atmosphere', 'boss-arena']
            : ['hostile-territory'],
        })
        const initiated = startInitiative(cmb)
        startCombat(initiated)
        setLocalCombat(initiated)
        setCombatMode(true)
        addNotification(`\u2694\uFE0F ${enemy.name} appears!`, 'combat')
      } else if (effects.shouldCheckEvasion) {
        const success = Math.random() < 0.5
        if (success) {
          addNotification('\u{1F3C3} You slipped past unnoticed.', 'info')
        } else {
          const enemy = generateEnemy(character.circle)
          const cmb = createCombatState(character, [enemy], {
            region: selectedNode?.region ?? 'Unknown',
            environment: selectedNode?.name ?? 'Unknown',
            modifiers: ['hostile-territory'],
          })
          const initiated = startInitiative(cmb)
          startCombat(initiated)
          setLocalCombat(initiated)
          setCombatMode(true)
          addNotification(
            `\u2694\uFE0F You were spotted! ${enemy.name} attacks!`,
            'combat',
          )
        }
      } else if (pendingNodeAction) {
        pendingNodeAction()
      }
      setPendingNodeAction(null)
    },
    [
      narrativeEvent,
      gainMarks,
      gainEnergy,
      advanceYears,
      setNarrativeFlag,
      unlockCodex,
      addNotification,
      character,
      selectedNode,
      startCombat,
      pendingNodeAction,
    ],
  )

  const handleNarrativeDismiss = useCallback(() => {
    if (narrativeEvent?.flagOnComplete) {
      setNarrativeFlag(narrativeEvent.flagOnComplete, true)
    }
    if (narrativeEvent?.codexOnView) {
      unlockCodex(narrativeEvent.codexOnView)
      addNotification(`\u{1F4DC} Codex entry unlocked!`, 'achievement')
    }
    setNarrativeEvent(null)
    if (pendingNodeAction) {
      pendingNodeAction()
      setPendingNodeAction(null)
    }
  }, [narrativeEvent, pendingNodeAction, setNarrativeFlag, unlockCodex, addNotification])

  const playerParticipant = activeCombat?.participants.find((p) => p.kind === 'player')
  const enemyParticipants =
    activeCombat?.participants.filter((p) => p.kind === 'enemy') ?? []

  useEffect(() => {
    if (!character.name || character.name === 'Unnamed Seeker') {
      navigate('/first-dream')
    }
  }, [character.name, navigate])

  if (discoveryGame) {
    return (
      <motion.section
        className="screen screen-game"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <DiscoveryOverlay
          game={discoveryGame}
          onResolve={handleDiscoveryResolve}
          onDismiss={handleDiscoveryDismiss}
        />
      </motion.section>
    )
  }

  if (narrativeEvent) {
    return (
      <motion.section
        className="screen screen-game"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <NarrativeOverlay
          event={narrativeEvent}
          onChoice={handleNarrativeChoice}
          onDismiss={handleNarrativeDismiss}
        />
      </motion.section>
    )
  }

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
                <EnergyBar
                  value={playerParticipant?.hp ?? 0}
                  max={playerParticipant?.maxHp ?? 100}
                />
                <span className="combat-stat">
                  {playerParticipant?.hp ?? 0} / {playerParticipant?.maxHp ?? 100} HP
                </span>
                {(playerParticipant?.shield ?? 0) > 0 && (
                  <span className="shield-badge">
                    {'\u{1F6E1}'} Shield: {playerParticipant?.shield}
                  </span>
                )}
              </div>
              <div className="marks-section">
                <MysteryCounter
                  marks={character.mystery.count}
                  stage={character.mystery.masteryStage}
                />
              </div>
              <div className="energy-section">
                <label>Energy</label>
                <EnergyBar
                  value={playerParticipant?.energy ?? 0}
                  max={playerParticipant?.maxHp ?? 100}
                />
                <span className="combat-stat">
                  {playerParticipant?.energy ?? 0} / {playerParticipant?.maxHp ?? 100}
                </span>
              </div>
            </div>
          </header>

          <main className="hud-main">
            <GlyphPanel
              title={`\u2694\uFE0F Combat — Turn ${activeCombat.turn}`}
            >
              <div className="combat-content">
                <div className="combat-participants">
                  <div className="combat-player">
                    <PortraitFrame name={character.name} />
                    <div className="combat-hp-bar">
                      <EnergyBar
                        value={playerParticipant?.hp ?? 0}
                        max={playerParticipant?.maxHp ?? 100}
                      />
                    </div>
                    <StatusEffectList
                      statuses={playerParticipant?.statuses ?? []}
                    />
                  </div>
                  <div className="combat-vs">VS</div>
                  {enemyParticipants.map((enemy) => {
                    const enemyData = activeCombat.enemies.find(
                      (e) => e.id === enemy.id,
                    )
                    return (
                      <div key={enemy.id} className="combat-enemy">
                        <RuneText text={enemy.name} />
                        <div className="combat-hp-bar">
                          <EnergyBar value={enemy.hp} max={enemy.maxHp} />
                          <span className="combat-stat">
                            {enemy.hp} / {enemy.maxHp} HP
                          </span>
                        </div>
                        {enemyData && (
                          <div className="enemy-info">
                            <span className="enemy-tier">
                              {enemyData.tier} — Circle {enemyData.circle}
                            </span>
                            <p className="enemy-lore">{enemyData.lore}</p>
                          </div>
                        )}
                        <StatusEffectList statuses={enemy.statuses ?? []} />
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
                      text={
                        winner === 'player'
                          ? 'Victory!'
                          : winner === 'enemy'
                            ? 'Defeat...'
                            : 'Combat Ended'
                      }
                    />
                  </motion.div>
                )}

                {!combatOver && (
                  <>
                    <div className="techniques-panel">
                      <h4 className="techniques-panel-title">Techniques</h4>
                      <div className="techniques-grid">
                        <button
                          className={`technique-select-btn ${!selectedTechnique ? 'active' : ''}`}
                          onClick={() => setSelectedTechnique(null)}
                          disabled={activeCombat.phase !== 'player-turn'}
                        >
                          <span className="technique-select-name">
                            Basic Attack
                          </span>
                          <span className="technique-select-cost">Free</span>
                        </button>
                        {knownTechniques.map((tech) => {
                          const onCooldown =
                            (activeCombat.cooldowns[tech.id] ?? 0) > 0
                          const canAfford =
                            character.currentEnergy >= tech.energyCost
                          const isSelected = selectedTechnique === tech.id
                          return (
                            <button
                              key={tech.id}
                              className={`technique-select-btn ${isSelected ? 'active' : ''} ${onCooldown ? 'cooldown' : ''} ${!canAfford ? 'no-energy' : ''}`}
                              onClick={() =>
                                setSelectedTechnique(
                                  isSelected ? null : tech.id,
                                )
                              }
                              disabled={
                                activeCombat.phase !== 'player-turn' ||
                                (!canAfford && !onCooldown)
                              }
                              title={tech.description}
                            >
                              <span className="technique-select-name">
                                {tech.name}
                              </span>
                              <span className="technique-select-cost">
                                {onCooldown
                                  ? `CD: ${activeCombat.cooldowns[tech.id]}`
                                  : `${tech.energyCost} EP`}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="combat-actions">
                      <CosmicButton
                        onClick={handlePlayerAttack}
                        disabled={activeCombat.phase !== 'player-turn'}
                        glow="strong"
                        className="combat-action-btn"
                      >
                        {selectedTechnique ? 'Use Technique' : 'Attack'}
                      </CosmicButton>
                      <CosmicButton
                        onClick={handleFleeCombat}
                        disabled={activeCombat.phase !== 'player-turn'}
                        glow="soft"
                      >
                        Flee
                      </CosmicButton>
                    </div>
                  </>
                )}

                {combatOver && (
                  <div className="combat-post-actions">
                    <CosmicButton
                      onClick={() => {
                        endCombat()
                        setLocalCombat(null)
                        setCombatMode(false)
                      }}
                    >
                      Continue
                    </CosmicButton>
                  </div>
                )}

                <div className="combat-log">
                  {activeCombat.combatLog.slice(-8).map((line, i) => (
                    <p key={i} className="combat-log-entry">
                      {line}
                    </p>
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
                  <span>
                    {activeCombat.field.modifiers.join(', ') || 'None'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Turn</label>
                  <span>{activeCombat.turn}</span>
                </div>
                <div className="info-item">
                  <label>Phase</label>
                  <span
                    className={`phase-indicator phase-${activeCombat.phase}`}
                  >
                    {activeCombat.phase === 'player-turn'
                      ? 'Your Turn'
                      : activeCombat.phase === 'enemy-turn'
                        ? 'Enemy Turn'
                        : activeCombat.phase}
                  </span>
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
        <aside className="hud-panel hud-left">
          <GlyphPanel title="Seeker">
            <PortraitFrame
              name={character.name}
              auraColor={character.path?.auraColor}
            />
            <div className="character-info">
              <RuneText text={character.name} />
              <div className="circle-badge">
                <CircleRing
                  circle={character.circle}
                  progress={Math.floor(
                    (character.mystery.count % 1000) / 10,
                  )}
                  size="small"
                />
                <span>Circle {character.circle}</span>
              </div>
              <div className="lifespan-info">
                <span>Lifespan: {character.lifespan} years</span>
              </div>
              {character.path && (
                <div className="path-info">
                  <span
                    className="path-label"
                    style={{ color: character.path.auraColor }}
                  >
                    {character.path.name}
                  </span>
                </div>
              )}
              <div className="six-sense-info">
                <label>Six Sense</label>
                <span className="six-sense-level">
                  {perceptionField.level >= 4
                    ? 'Infinite'
                    : perceptionField.level >= 3
                      ? 'Vast'
                      : perceptionField.level >= 2
                        ? 'Awake'
                        : perceptionField.level >= 1
                          ? 'Stirring'
                          : 'Dormant'}
                </span>
                <span className="six-sense-hint">
                  {perceptionField.secretText}
                </span>
              </div>
            </div>
          </GlyphPanel>
        </aside>

        <header className="hud-top">
          <div className="resource-bar">
            <div className="energy-section">
              <label>Path Energy</label>
              <EnergyBar
                value={character.currentEnergy}
                max={character.mindSpace}
              />
            </div>
            <div className="marks-section">
              <MysteryCounter
                marks={character.mystery.count}
                stage={character.mystery.masteryStage}
              />
            </div>
          </div>
        </header>

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
                <GlyphPanel
                  title={`\u{1F5FA}\uFE0F ${regionInfo.name} — ${character.name}'s Journey`}
                >
                  <div className="world-map">
                    <p className="region-description">
                      {regionInfo.description}
                    </p>
                    <div className="node-info-header">
                      <span>
                        Year {time.year}, Era: {time.era}
                      </span>
                      <span>
                        Nodes: {world.visitedNodeIds.length} explored /{' '}
                        {world.nodes.filter((n) => !n.hidden || world.revealedHiddenNodeIds.includes(n.id)).length} visible
                      </span>
                    </div>

                    {currentNode && (
                      <div className="current-location">
                        <RuneText text={`\u{1F4CD} ${currentNode.name}`} />
                        <p className="node-desc">{currentNode.description}</p>
                        <span
                          className={`node-type-badge node-type-${currentNode.type}`}
                        >
                          {NODE_TYPE_ICONS[currentNode.type] ?? '?'}{' '}
                          {currentNode.type.toUpperCase()}
                        </span>
                        {currentNode.hazard &&
                          currentNode.hazard !== HazardType.None && (
                            <span className="hazard-badge">
                              {HAZARD_ICONS[currentNode.hazard] ?? '\u26A0\uFE0F'}{' '}
                              Hazard: {getHazardDefinition(currentNode.hazard)?.name ?? currentNode.hazard}
                            </span>
                          )}
                      </div>
                    )}

                    <div className="node-grid">
                      <h3 className="connections-title">
                        Connected Locations
                      </h3>
                      {connectedNodes.length === 0 && (
                        <p className="no-connections">
                          No paths lead from here. Explore further.
                        </p>
                      )}
                      <div className="node-list">
                        {connectedNodes.map((node) => {
                          const hazardDef =
                            node.hazard && node.hazard !== HazardType.None
                              ? getHazardDefinition(node.hazard)
                              : null
                          return (
                            <motion.div
                              key={node.id}
                              className={`node-card ${node.visited ? 'visited' : ''} node-${node.type}`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleExploreNode(node)}
                            >
                              <div className="node-card-header">
                                <span className="node-icon">
                                  {NODE_TYPE_ICONS[node.type] ?? '?'}
                                </span>
                                <span className="node-card-name">
                                  {node.name}
                                </span>
                                {node.visited && (
                                  <span className="visited-badge">{'\u2713'}</span>
                                )}
                              </div>
                              <p className="node-card-desc">
                                {node.description}
                              </p>
                              {hazardDef && (
                                <div className="node-hazard-info">
                                  <span className="hazard-icon">
                                    {HAZARD_ICONS[node.hazard!] ?? '\u26A0\uFE0F'}
                                  </span>
                                  <span className="hazard-name">
                                    {hazardDef.name}
                                  </span>
                                </div>
                              )}
                              {node.discoveryGame && (
                                <div className="node-minigame-info">
                                  <span className="minigame-icon">{'\u{1F3AE}'}</span>
                                  <span className="minigame-label">Mini-Game</span>
                                </div>
                              )}
                              <div className="node-card-footer">
                                <span
                                  className="node-type-label"
                                  style={{
                                    color: NODE_TYPE_COLORS[node.type],
                                  }}
                                >
                                  {node.type.toUpperCase()}
                                </span>
                                <span className="explore-hint">
                                  {node.visited ? 'Revisit' : 'Explore'} &rarr;
                                </span>
                              </div>
                            </motion.div>
                          )
                        })}
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
                    <FoundationDisplay
                      stage={character.foundation.stage}
                      integrity={character.foundation.integrity}
                    />
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
                    {inventory.length > 0 && (
                      <div className="inventory-section">
                        <h3>Inventory ({inventory.length})</h3>
                        <div className="inventory-grid">
                          {inventory.map((item, idx) => (
                            <div
                              key={`${item.id}-${idx}`}
                              className={`inventory-item rarity-${item.rarity}`}
                            >
                              <span className="item-name">{item.name}</span>
                              <span className="item-rarity">{item.rarity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {character.techniques.length > 0 && (
                      <div className="techniques-section">
                        <h3>Techniques</h3>
                        <div className="techniques-list">
                          {character.techniques.map((t) => (
                            <span key={t} className="technique-tag">
                              {t.replace(/-/g, ' ')}
                            </span>
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
                        <h4>
                          Your Path: {character.path?.name ?? 'Unknown'}
                        </h4>
                        <p>
                          {character.path?.description ??
                            'Your Path has not yet been forged.'}
                        </p>
                        <p className="codex-quote">
                          "{character.path?.philosophy ??
                            'Seek and you shall find.'}"
                        </p>
                      </div>
                      <div className="codex-entry">
                        <h4>Region: {regionInfo.name}</h4>
                        <p>{regionInfo.description}</p>
                      </div>
                      <div className="codex-entry">
                        <h4>Mystery Marks: {character.mystery.count}</h4>
                        <p>
                          Mastery Stage: {character.mystery.masteryStage}
                        </p>
                        <p>
                          Boost Multiplier:{' '}
                          {character.mystery.boostMultiplier}x
                        </p>
                        <p>
                          Bones Formed: {character.mystery.bones} / 206
                        </p>
                      </div>
                      <p className="codex-hint">
                        More entries will be unlocked as you explore the world.
                      </p>
                    </div>
                  </div>
                </GlyphPanel>
              )}

              {currentView === 'techniques' && (
                <GlyphPanel title="Techniques">
                  <div className="techniques-content">
                    <RuneText text="Available Techniques" />
                    {character.techniques.length === 0 ? (
                      <p>
                        No techniques available yet. Explore the world to
                        unlock new abilities.
                      </p>
                    ) : (
                      <div className="techniques-list">
                        {character.techniques.map((t) => (
                          <motion.div
                            key={t}
                            className="technique-card"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h4>{t.replace(/-/g, ' ')}</h4>
                            <p className="technique-hint">
                              Master this technique through combat and
                              cultivation.
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <p className="technique-hint">
                      New techniques unlock as your Path grows stronger.
                    </p>
                  </div>
                </GlyphPanel>
              )}

              {currentView === 'options' && (
                <GlyphPanel title="Options">
                  <div className="options-content">
                    <CosmicButton
                      onClick={() => navigate('/menu')}
                      glow="soft"
                    >
                      Return to Main Menu
                    </CosmicButton>
                    <CosmicButton
                      onClick={() => navigate('/settings')}
                      glow="soft"
                    >
                      Settings
                    </CosmicButton>
                  </div>
                </GlyphPanel>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

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
                <span>
                  Era {character.circle}, Year {time.year}
                </span>
              </div>
              <div className="info-item">
                <label>Explored</label>
                <span>
                  {world.visitedNodeIds.length} / {world.nodes.filter((n) => !n.hidden || world.revealedHiddenNodeIds.includes(n.id)).length} nodes
                </span>
              </div>
              <div className="info-item">
                <label>Inventory</label>
                <span>{inventory.length} items</span>
              </div>
              <div className="info-item">
                <label>Six Sense</label>
                <span className="six-sense-label">
                  {perceptionField.level >= 4
                    ? '\u{1F441}\uFE0F Infinite'
                    : perceptionField.level >= 3
                      ? '\u{1F441}\uFE0F Vast'
                      : perceptionField.level >= 2
                        ? '\u{1F441}\uFE0F Awake'
                        : perceptionField.level >= 1
                          ? '\u{1F441}\uFE0F Stirring'
                          : '\u{1F441}\uFE0F Dormant'}
                </span>
              </div>
            </div>
          </GlyphPanel>
        </aside>

        <nav className="hud-bottom">
          <div className="nav-buttons">
            {[
              { id: 'map' as GameView, label: 'Map', icon: '\u{1F5FA}\uFE0F' },
              {
                id: 'character' as GameView,
                label: 'Self',
                icon: '\u{1F464}',
              },
              { id: 'codex' as GameView, label: 'Codex', icon: '\u{1F4DA}' },
              {
                id: 'techniques' as GameView,
                label: 'Arts',
                icon: '\u2694\uFE0F',
              },
              {
                id: 'options' as GameView,
                label: 'Options',
                icon: '\u2699\uFE0F',
              },
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

function StatusEffectList({
  statuses,
}: {
  statuses: import('../types/combat').StatusEffect[]
}) {
  if (statuses.length === 0) return null
  return (
    <div className="status-effects">
      {statuses.map((s) => (
        <span
          key={s.id}
          className={`status-badge status-${s.kind}`}
          title={`${s.name}: ${s.value > 0 && s.kind !== 'buff' ? Math.floor(s.value * 100) + '%' : s.value} — ${s.turnsRemaining} turn${s.turnsRemaining !== 1 ? 's' : ''}`}
        >
          {statusIcon(s.kind)} {s.name}{' '}
          {s.turnsRemaining > 0 &&
            s.turnsRemaining < 99 &&
            `(${s.turnsRemaining})`}
        </span>
      ))}
    </div>
  )
}

function statusIcon(kind: string): string {
  switch (kind) {
    case 'buff':
      return '\u{1F4AA}'
    case 'debuff':
      return '\u{1F4C9}'
    case 'heal-over-time':
      return '\u2764\uFE0F'
    case 'shield':
      return '\u{1F6E1}'
    case 'stun':
      return '\u{1F4AB}'
    case 'dot':
      return '\u{1F3F9}'
    default:
      return '\u25C9'
  }
}
