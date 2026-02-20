/**
 * @typedef {Object} DialogueLine
 * @property {string} character
 * @property {string} line
 */

/**
 * @typedef {Object} Scene
 * @property {string} id
 * @property {string} sceneNumber
 * @property {string} title
 * @property {string} location
 * @property {string} time
 * @property {string} visualDescription
 * @property {string} action
 * @property {DialogueLine[]} dialogue
 * @property {string} mood
 * @property {string} storyFunction
 * @property {string[]} characterIds
 * @property {string[]} locationIds
 * @property {string|null} imageUrl
 */

/**
 * @typedef {Object} Sequence
 * @property {number} number
 * @property {string} title
 * @property {Scene[]} scenes
 */

/**
 * @typedef {Object} Act
 * @property {number} number
 * @property {string} title
 * @property {Sequence[]} sequences
 */

/**
 * @typedef {Object} Character
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} visualPromptDescription
 * @property {string} role
 * @property {string} firstAppearance
 * @property {string} color
 */

/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} visualPromptDescription
 * @property {string} mood
 */

/**
 * @typedef {Object} StoryBeats
 * @property {string|null} openingImage
 * @property {string|null} statusQuo
 * @property {string|null} incitingIncident
 * @property {string|null} lockIn
 * @property {string|null} midpoint
 * @property {string|null} crisis
 * @property {string|null} climax
 * @property {string|null} resolution
 */

/**
 * @typedef {Object} Storyboard
 * @property {Act[]} acts
 * @property {StoryBeats} storyBeats
 */

/**
 * @typedef {Object} Entities
 * @property {Character[]} characters
 * @property {Location[]} locations
 */

/**
 * @typedef {Object} ChatMessage
 * @property {'user'|'assistant'} role
 * @property {string} content
 * @property {string} timestamp
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {ChatMessage[]} messages
 * @property {Storyboard} storyboard
 * @property {Entities} entities
 */

export function createEmptyStoryboard() {
  return {
    acts: [
      {
        number: 1,
        title: 'SETUP',
        sequences: [
          { number: 1, title: 'Status Quo + Inciting Incident', scenes: [] },
          { number: 2, title: 'Reaction + Lock-In', scenes: [] },
        ],
      },
      {
        number: 2,
        title: 'CONFRONTATION',
        sequences: [
          { number: 3, title: 'New World / First Attempts', scenes: [] },
          { number: 4, title: 'Midpoint Shift / Revelation', scenes: [] },
          { number: 5, title: 'Escalation / Complications', scenes: [] },
          { number: 6, title: 'Crisis / Low Point', scenes: [] },
        ],
      },
      {
        number: 3,
        title: 'RESOLUTION',
        sequences: [
          { number: 7, title: 'Climax / Final Confrontation', scenes: [] },
          { number: 8, title: 'Denouement / New Normal', scenes: [] },
        ],
      },
    ],
    storyBeats: {
      openingImage: null,
      statusQuo: null,
      incitingIncident: null,
      lockIn: null,
      midpoint: null,
      crisis: null,
      climax: null,
      resolution: null,
    },
  };
}

export function createEmptyEntities() {
  return {
    characters: [],
    locations: [],
  };
}

export function createProject(name) {
  const now = new Date().toISOString();
  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || 'Untitled Story',
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        role: 'assistant',
        content: 'Tell me your story idea. I will keep the storyboard updated as we chat.',
        timestamp: now,
      },
    ],
    storyboard: createEmptyStoryboard(),
    entities: createEmptyEntities(),
  };
}
