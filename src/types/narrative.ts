export type NarrativeTrigger =
  | 'game-start'
  | 'node-enter'
  | 'combat-win'
  | 'circle-ascend'
  | 'manual'

export interface NarrativeChoice {
  id: string
  text: string
  tags: string[]
  nextSceneId?: string
  effects: string[]
}

export interface NarrativeScene {
  id: string
  speaker?: string
  text: string
  mood?: 'calm' | 'intense' | 'amused' | 'terrifying' | 'voiceless'
}

export interface NarrativeEvent {
  id: string
  trigger: NarrativeTrigger
  scenes: NarrativeScene[]
  choices: NarrativeChoice[]
}
