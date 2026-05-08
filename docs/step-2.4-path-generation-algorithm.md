# Step 2.4 — Path Generation Algorithm

## Overview
Implement the procedural Path generation system that analyzes trial results to create unique cultivation Paths. The algorithm processes the semantic tags from the Three Trials to determine Path characteristics, generate procedural attributes, and initialize character stats.

## Features to Implement

### Path Generation Algorithm
- **Tag Analysis Engine**: Process 15 trial answers with semantic tags
- **Path Archetype Selection**: Choose from 7 archetypes based on dominant tag patterns
- **Element Assignment**: Match elemental affinities to philosophical leanings
- **Procedural Naming**: Generate unique Path names from tag combinations
- **Trait Generation**: Create passive traits and starting techniques
- **Foundation Calculation**: Determine starting foundation type and stats

### Character Initialization
- **Starting Stats**: Base stats influenced by Path characteristics
- **Initial Techniques**: 2-3 starting techniques based on Path
- **Foundation Setup**: Procedural foundation generation
- **Mystery Marks**: Starting mark allocation

### Technical Implementation
- **Algorithm Logic**: Pure functions for deterministic Path generation
- **Data Structures**: Integration with existing Path and Character types
- **State Management**: Update game store with generated character
- **Navigation Flow**: Transition from character creation to game

## Algorithm Design

### Tag Weighting System
Each trial answer contributes weighted tags:
- **Good Trial**: Mercy (+2), Justice (+2), Sacrifice (+1), Compassion (+1), etc.
- **Evil Trial**: Power (+2), Destruction (+1), Knowledge (+1), Ambition (+2), etc.
- **Self Trial**: Truth (+1), Philosophy (+1), Connection (+2), Empathy (+1), etc.

### Archetype Mapping
Based on dominant tag clusters:
- **VoidWatcher**: High Self tags, philosophical leanings
- **BoneHarvester**: High Evil tags, power-focused
- **SilentFlame**: Balanced Good/Evil, transformation themes
- **OathBreaker**: High Evil + Self, freedom/chaos themes
- **StarPilgrim**: High Good + Self, spiritual journey
- **RiftSaint**: Mixed tags, reality-bending themes
- **Fusion**: Highly mixed, unique hybrid Paths

### Element Assignment
- **Void**: Philosophical, introspective Paths
- **Flame**: Passionate, transformative Paths
- **Ash**: Destructive, rebirth-focused Paths
- **Storm**: Chaotic, freedom-seeking Paths
- **Bone**: Power-hungry, structural Paths
- **Tide**: Adaptive, flowing Paths
- **Radiance**: Pure, justice-oriented Paths
- **Shadow**: Subtle, manipulative Paths

### Procedural Generation Rules
1. **Analyze Tag Frequencies**: Count occurrences of each tag across all trials
2. **Determine Dominant Themes**: Identify top 3-5 tags for Path shaping
3. **Select Archetype**: Match tag patterns to archetype requirements
4. **Assign Element**: Map philosophical leanings to elemental affinities
5. **Generate Name**: Combine tag-derived adjectives with archetype nouns
6. **Create Description**: Procedural description based on tag meanings
7. **Assign Traits**: Generate 3-5 passive traits with stat bonuses
8. **Select Techniques**: Choose starting techniques matching Path theme

## Files to Create/Modify

### Core Algorithm
- `src/utils/pathGenerator.ts` - Main path generation logic
- `src/data/pathTemplates.ts` - Base templates for archetypes and elements
- `src/data/techniqueData.ts` - Starting technique definitions

### Character Creation
- `src/screens/CharacterCreationScreen.tsx` - Full implementation with path display
- `src/store/gameStore.ts` - Add character creation actions
- `src/hooks/useCharacterCreation.ts` - Character creation logic hook

### UI Components
- `src/components/PathDisplay.tsx` - Visual Path presentation
- `src/components/StatPreview.tsx` - Character stats preview
- `src/components/TechniqueList.tsx` - Starting techniques display

## Technical Notes

### Algorithm Determinism
- Same trial results should always generate same Path
- Use seeded random generation for variety within constraints
- Ensure balance across different tag combinations

### Data Flow
1. CharacterCreationScreen receives trial results
2. pathGenerator.ts processes tags → generates Path object
3. Character initialized with Path, stats, techniques
4. Game store updated with new character
5. Navigation to main game screen

### Performance Considerations
- Path generation should be fast (<100ms)
- Pre-load technique and template data
- Cache generated Paths if needed for replayability

### Extensibility
- Design algorithm to easily add new archetypes/elements
- Tag system should support future trial expansions
- Modular trait and technique generation

## Integration Points
- **Trial Results**: Import from TrialsScreen navigation state
- **Game Store**: Update with generated character data
- **Navigation**: Route to game screen after character creation
- **Save System**: Auto-save character creation progress

## Testing Requirements
- Generate Paths for various trial result combinations
- Verify stat balance across different archetypes
- Test edge cases (all same answers, highly mixed results)
- Ensure deterministic generation (same inputs = same outputs)
- Validate all generated data fits existing type interfaces