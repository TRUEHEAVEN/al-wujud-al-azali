import type { NarrativeEvent, CodexEntry } from '../types/narrative'

export const NODE_EVENTS: Record<string, NarrativeEvent[]> = {
  safe: [
    {
      id: 'safe-rest',
      trigger: 'node-enter',
      scenes: [
        {
          id: 'rest-1',
          text: 'You find a moment of peace. The air is still, and the Path energy around you settles like dust after a storm. Your wounds ache less, your mind clears.',
          mood: 'calm',
          speaker: 'Narrator',
          archetypeVariant: {
            'void-watcher': 'The silence is profound. In it, you perceive the faint outlines of truths yet to be revealed. Your Void-touched senses drink in the stillness.',
            'bone-harvester': 'Your bones hum with the residual power of this place. Strength flows back into your limbs, hungry for the next challenge.',
            'rift-saint': 'Reality here is unusually stable. You sense the seams where dimensions were once stitched together—evidence of ancient cultivation.',
          },
        },
        {
          id: 'rest-2',
          text: 'A weathered stele stands nearby, its inscriptions worn by countless seasons. Pilgrims have rested here for millennia.',
          mood: 'calm',
          speaker: 'Narrator',
          conditionFlags: { 'visited-safe': true },
        },
      ],
      choices: [
        {
          id: 'rest-recover',
          text: 'Rest and recover your strength',
          tags: ['Recovery', 'Peace', 'Rest'],
          effects: ['energy:gain:25', 'heal:30', 'time:advance:1'],
        },
        {
          id: 'meditate',
          text: 'Meditate on the stillness',
          tags: ['Contemplation', 'Wisdom', 'Growth'],
          effects: ['marks:gain:15', 'energy:gain:10'],
          archetypeWeight: { 'void-watcher': 2, 'star-pilgrim': 2 },
        },
        {
          id: 'move-on',
          text: 'Continue your journey without delay',
          tags: ['Determination', 'Progress'],
          effects: [],
        },
      ],
    },
  ],
  danger: [
    {
      id: 'danger-encounter',
      trigger: 'node-enter',
      scenes: [
        {
          id: 'danger-1',
          text: 'A malevolent presence stirs. Hostile cultivators or beasts block your path. The air thickens with killing intent.',
          mood: 'intense',
          speaker: 'Narrator',
          archetypeVariant: {
            'bone-harvester': 'Your battle-instincts ignite. Every bone in your body screams for combat. This is what you were forged for.',
            'oath-breaker': 'Chains of hostile intent bind this place. Your Oath Breaker senses tingle—there is freedom to be won here.',
            'silent-flame': 'The hostility here is a corruption. Your flame yearns to purify it.',
          },
        },
      ],
      choices: [
        {
          id: 'fight-danger',
          text: 'Face the danger head-on',
          tags: ['Courage', 'Combat', 'Strength'],
          effects: ['combat:start'],
        },
        {
          id: 'evade-danger',
          text: 'Attempt to slip past unnoticed',
          tags: ['Cunning', 'Caution', 'Stealth'],
          effects: ['evasion:check'],
        },
        {
          id: 'intimidate',
          text: 'Radiate your cultivation pressure to assert dominance',
          tags: ['Power', 'Intimidation', 'Pride'],
          effects: ['combat:start'],
          conditionFlags: { 'has-killed-boss': true },
          archetypeWeight: { 'bone-harvester': 3, 'oath-breaker': 2 },
        },
      ],
    },
  ],
  discovery: [
    {
      id: 'discovery-ancient',
      trigger: 'node-enter',
      scenes: [
        {
          id: 'disc-1',
          text: 'You sense a concentration of Mystery Marks nearby. Ancient energy pulses beneath the surface—something old and powerful slumbers here.',
          mood: 'mysterious',
          speaker: 'Narrator',
          archetypeVariant: {
            'void-watcher': 'Your Void Gaze penetrates the veil. You see not just marks, but the memory of the cultivator who left them—a flickering echo across centuries.',
            'star-pilgrim': 'The marks align in patterns you recognize from the stars. This is no random deposit—it is a message.',
            'rift-saint': 'The concentration of marks has warped local reality. Tiny rifts flicker at the edge of your perception.',
          },
        },
      ],
      choices: [
        {
          id: 'investigate-deep',
          text: 'Investigate the source thoroughly',
          tags: ['Curiosity', 'Discovery', 'Knowledge'],
          effects: ['marks:gain:50', 'narrative:advance'],
        },
        {
          id: 'observe-cautious',
          text: 'Observe carefully from a distance',
          tags: ['Caution', 'Wisdom', 'Patience'],
          effects: ['marks:gain:25', 'codex:unlock:ancient-marks'],
        },
        {
          id: 'claim-quick',
          text: 'Claim what you can and move on',
          tags: ['Pragmatism', 'Efficiency'],
          effects: ['marks:gain:35'],
        },
      ],
    },
  ],
  boss: [
    {
      id: 'boss-encounter',
      trigger: 'node-enter',
      scenes: [
        {
          id: 'boss-1',
          text: 'The oppressive weight of a tyrant crushes lesser wills. A sovereign of cultivation has claimed this domain. Their power saturates the very air you breathe.',
          mood: 'terrifying',
          speaker: 'Narrator',
          archetypeVariant: {
            'bone-harvester': 'Your bones resonate with the challenge. This is no mere enemy—this is a rival. Their power calls to yours.',
            'silent-flame': 'You sense the corruption at the heart of this sovereign\'s power. Your flame burns brighter, hungry to purge.',
            'fusion': 'You perceive the unity of purpose radiating from this ruler. There is much to learn here—and much to overcome.',
          },
        },
      ],
      choices: [
        {
          id: 'challenge-boss',
          text: 'Challenge the sovereign directly',
          tags: ['Courage', 'Power', 'Ambition'],
          effects: ['combat:start:boss'],
        },
        {
          id: 'study-boss',
          text: 'Study their power before engaging',
          tags: ['Wisdom', 'Strategy', 'Patience'],
          effects: ['marks:gain:30', 'combat:start:boss'],
          archetypeWeight: { 'void-watcher': 3, 'star-pilgrim': 2 },
        },
      ],
    },
  ],
  story: [
    {
      id: 'story-crossroads',
      trigger: 'node-enter',
      scenes: [
        {
          id: 'story-1',
          text: 'The narrative thread of the world tightens around you. A pivotal moment approaches—one that will reshape your Path forever.',
          mood: 'voiceless',
          speaker: 'The Silent Author',
          archetypeVariant: {
            'void-watcher': 'You see the branching possibilities ahead like threads of light. Each choice unravels a different truth.',
            'oath-breaker': 'The chains of destiny rattle around you. Will you wear them—or break them?',
            'rift-saint': 'Reality warps around this decision point. Whatever you choose here will echo across dimensions.',
          },
        },
        {
          id: 'story-2',
          text: 'The atmosphere thickens with meaning. Something vast and patient watches, waiting for your choice.',
          mood: 'voiceless',
          speaker: 'The Silent Author',
        },
      ],
      choices: [
        {
          id: 'embrace-fate',
          text: 'Embrace the ordained narrative',
          tags: ['Destiny', 'Acceptance', 'Faith'],
          effects: ['story:advance', 'foundation:strengthen', 'marks:gain:100', 'codex:unlock:fate-thread'],
        },
        {
          id: 'defy-fate',
          text: 'Resist and forge your own path',
          tags: ['Freedom', 'Defiance', 'Will'],
          effects: ['story:alter', 'technique:unlock', 'marks:gain:75'],
          archetypeWeight: { 'oath-breaker': 4 },
        },
        {
          id: 'observe-fate',
          text: 'Neither embrace nor resist—simply witness',
          tags: ['Wisdom', 'Detachment', 'Truth'],
          effects: ['marks:gain:125', 'codex:unlock:silent-choice'],
          archetypeWeight: { 'void-watcher': 3, 'star-pilgrim': 2 },
        },
      ],
      flagOnComplete: 'story-crossroads-done',
    },
  ],
}

export const COMBAT_EVENTS: NarrativeEvent[] = [
  {
    id: 'combat-victory',
    trigger: 'combat-win',
    scenes: [
      {
        id: 'victory-1',
        text: 'Your enemies fall before you. The Path acknowledges your strength. Mystery Marks coalesce from their fading essence.',
        mood: 'triumphant',
        speaker: 'Narrator',
        archetypeVariant: {
          'bone-harvester': 'You drink deep of their fading essence. Your bones sing with new power. This is the way of the Bone Harvester.',
          'silent-flame': 'The corruption in your enemies is purified. From their ashes, new growth will come. Your flame dims, satisfied.',
          'oath-breaker': 'Another chain broken. Your enemies sought to bind you with violence, but your freedom is absolute.',
        },
      },
    ],
    choices: [
      {
        id: 'absorb-essence',
        text: 'Absorb the essence of the defeated',
        tags: ['Power', 'Harvest', 'Growth'],
        effects: ['marks:gain:30', 'heal:20'],
        conditionFlags: { 'has-killed-10': true },
        archetypeWeight: { 'bone-harvester': 3 },
      },
      {
        id: 'honor-fallen',
        text: 'Honor the fallen with a moment of silence',
        tags: ['Respect', 'Wisdom', 'Mercy'],
        effects: ['marks:gain:20', 'codex:unlock:fallen-memorial'],
        archetypeWeight: { 'void-watcher': 2, 'star-pilgrim': 2 },
      },
      {
        id: 'continue-journey',
        text: 'Continue onward without looking back',
        tags: ['Determination', 'Progress'],
        effects: [],
      },
    ],
  },
  {
    id: 'combat-defeat',
    trigger: 'combat-lose',
    scenes: [
      {
        id: 'defeat-1',
        text: 'Darkness swallows you. Your Path wavers but does not break. The cultivation world is merciless, yet it is also full of second chances.',
        mood: 'somber',
        speaker: 'Narrator',
        archetypeVariant: {
          'void-watcher': 'In the darkness, you glimpse a deeper truth. Defeat is not the end—it is a different kind of beginning.',
          'bone-harvester': 'Your bones crack but do not shatter. Pain is merely the forge in which true strength is tempered.',
          'fusion': 'The unity of your Path holds even in defeat. All experiences, even this, contribute to your growth.',
        },
      },
    ],
    choices: [
      {
        id: 'rise-again',
        text: 'Rise and learn from this defeat',
        tags: ['Resilience', 'Growth', 'Wisdom'],
        effects: ['marks:gain:15', 'heal:100'],
      },
    ],
  },
]

export const CIRCLE_EVENTS: NarrativeEvent[] = [
  {
    id: 'circle-2-awakening',
    trigger: 'circle-ascend',
    triggerSource: 'circle-2',
    scenes: [
      {
        id: 'c2-1',
        text: 'Your Second Circle crystallizes within you. The world sharpens—colors deepen, sounds gain texture, and the flow of Path energy becomes visible as faint golden threads.',
        mood: 'triumphant',
        speaker: 'Narrator',
        archetypeVariant: {
          'void-watcher': 'Your Void Gaze deepens. What was once hidden now reveals itself in layers. Truth peels away like old skin.',
          'bone-harvester': 'Your bones resonate at a new frequency. Where 108 bones once anchored you, now 206 will form. You have claimed the first tier.',
          'rift-saint': 'The rifts speak to you more clearly now. Each one is a doorway, a wound in reality that your power can exploit.',
        },
      },
    ],
    choices: [
      {
        id: 'explore-senses',
        text: 'Explore your expanded perception',
        tags: ['Curiosity', 'Growth', 'Perception'],
        effects: ['marks:gain:50', 'codex:unlock:second-circle'],
      },
    ],
    minCircle: 2,
    maxCircle: 2,
  },
  {
    id: 'circle-3-embodiment',
    trigger: 'circle-ascend',
    triggerSource: 'circle-3',
    scenes: [
      {
        id: 'c3-1',
        text: 'The Third Circle brings Embodiment—the power to manifest your Path physically. Your body begins to transform, taking on qualities of your cultivated element.',
        mood: 'triumphant',
        speaker: 'Narrator',
        archetypeVariant: {
          'void-watcher': 'Your form flickers at the edges, becoming less substantial, more... void-like. You can step between moments.',
          'bone-harvester': 'Your bones surface through your skin like living armor. You are becoming a weapon.',
          'silent-flame': 'Faint flames dance in your eyes and along your fingertips. You are heat and light and transformation incarnate.',
        },
      },
    ],
    choices: [
      {
        id: 'embrace-transformation',
        text: 'Embrace the transformation',
        tags: ['Power', 'Identity', 'Evolution'],
        effects: ['marks:gain:80', 'technique:unlock', 'codex:unlock:third-circle'],
      },
    ],
    minCircle: 3,
    maxCircle: 3,
  },
]

export const CODEX_ENTRIES: CodexEntry[] = [
  {
    id: 'ancient-marks',
    category: 'lore',
    title: 'The Nature of Mystery Marks',
    subtitle: 'A Seeking Scholar\'s Treatise',
    text: 'Mystery Marks are the crystallized residue of cultivation. Every cultivator who has walked the Path leaves traces—fragments of insight, emotion, and power that coalesce into these golden motes. To accumulate Marks is to inherit the legacy of all who came before. Some say the Marks themselves remember. Some say they judge.',
    unlockCondition: { trigger: 'discovery' },
    relatedEntryIds: ['formation-stage', 'bones-of-the-path'],
  },
  {
    id: 'fate-thread',
    category: 'cosmic',
    title: 'The Thread of Fate',
    subtitle: 'From the Scroll of Unmaking',
    text: 'Every Path exists within a greater weave. The Silent Author spins threads that connect all cultivators, all worlds, all moments. To walk the Path is to tug at these threads. Some break. Some strengthen. Some lead to places that should not exist. The wise cultivator learns to feel the tension.',
    unlockCondition: { trigger: 'manual', flag: 'story-crossroads-done' },
    relatedEntryIds: ['silent-choice'],
  },
  {
    id: 'silent-choice',
    category: 'lore',
    title: 'The Silent Choice',
    subtitle: 'Fragment of Forbidden Wisdom',
    text: 'There is a third way between acceptance and defiance: witness. To neither embrace fate nor reject it, but to observe it with perfect clarity. This is the way of the Void Watchers in their highest form. To see without acting is the most difficult cultivation—and the most dangerous.',
    unlockCondition: { trigger: 'manual', flag: 'story-crossroads-done' },
    relatedEntryIds: ['fate-thread'],
  },
  {
    id: 'fallen-memorial',
    category: 'lore',
    title: 'The Fallen Memorial',
    subtitle: 'Elegy of the Path',
    text: 'Countless cultivators have fallen on the Path. Their Marks scatter to the void, their names forgotten. But some remember. The Fallen Memorial exists not as a place but as an idea—a silence that honors those who walked before and failed. When you honor the fallen, their Marks stir and seek you out.',
    unlockCondition: { flag: 'honored-fallen' },
    relatedEntryIds: ['ancient-marks'],
  },
  {
    id: 'second-circle',
    category: 'lore',
    title: 'The Second Circle — Awakening',
    subtitle: 'Foundations of Cultivation',
    text: 'The Second Circle marks the awakening of enhanced perception. Colors deepen, the flow of Path energy becomes visible as golden threads, and the cultivator begins to sense the Marks around them. This is the threshold where a Seeker becomes a true cultivator. Beyond this point, there is no return to ordinary sight.',
    unlockCondition: { circle: 2 },
    relatedEntryIds: ['third-circle'],
  },
  {
    id: 'third-circle',
    category: 'lore',
    title: 'The Third Circle — Embodiment',
    subtitle: 'The Flesh Remembers',
    text: 'At the Third Circle, cultivation ceases to be merely spiritual. The body transforms, taking on qualities of the cultivator\'s Path. Void Watchers become translucent, Bone Harvesters grow living armor, Silent Flames flicker at the fingertips. This is Embodiment—the moment when your Path becomes your flesh.',
    unlockCondition: { circle: 3 },
    relatedEntryIds: ['second-circle'],
  },
  {
    id: 'formation-stage',
    category: 'lore',
    title: 'The Formation Stage',
    subtitle: 'First Steps on the Path',
    text: 'All cultivators begin at the Formation Stage—when the body has gathered 1,000 Mystery Marks and begun the process of restructuring. The Foundation takes shape as an egg, containing limitless potential. From this humble beginning, all greatness grows.',
    unlockCondition: { marks: 1000 },
    relatedEntryIds: ['ancient-marks', 'bones-of-the-path'],
  },
  {
    id: 'bones-of-the-path',
    category: 'lore',
    title: 'The 206 Bones of Mastery',
    subtitle: 'Anatomy of Ascension',
    text: 'To reach the Controller stage, a cultivator must forge 206 bones within their Foundation. Each bone corresponds to a truth, a memory, a sacrifice. The full skeleton is the architecture of power—without it, no cultivator can advance beyond the Newborn stage. Some bones are harder to forge than others. The skull requires the greatest insight.',
    unlockCondition: { marks: 5000 },
    relatedEntryIds: ['formation-stage'],
  },
]

export function getNodeEventsForType(nodeType: string): NarrativeEvent[] {
  return NODE_EVENTS[nodeType] ?? []
}

export function getCodexEntriesForUnlock(
  entries: CodexEntry[],
  flags: Record<string, boolean>,
  circle: number,
  marks: number,
): CodexEntry[] {
  return entries.filter((entry) => {
    const c = entry.unlockCondition
    if (c.flag && flags[c.flag]) return true
    if (c.circle && circle >= c.circle) return true
    if (c.marks && marks >= c.marks) return true
    return false
  })
}
