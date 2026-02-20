import { v4 as uuidv4 } from 'uuid';

import { buildSystemPrompt } from '../prompts/system-prompt.js';

export function parseAIResponse(rawText) {
  const original = String(rawText || '').trim();
  if (!original) {
    return {
      chat: 'No response received. Try again.',
      updates: {},
    };
  }

  let cleaned = original;
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      chat:
        typeof parsed?.chat === 'string' && parsed.chat.trim()
          ? parsed.chat.trim()
          : 'Updated storyboard.',
      updates: parsed?.updates && typeof parsed.updates === 'object' ? parsed.updates : {},
    };
  } catch {
    return {
      chat: original,
      updates: {},
    };
  }
}

export function applyUpdates(project, updates) {
  const nextProject = structuredClone(project);
  const nextUpdates = updates && typeof updates === 'object' ? updates : {};

  applyCharacters(nextProject, nextUpdates);
  applyLocations(nextProject, nextUpdates);
  applySceneAdds(nextProject, nextUpdates);
  applySceneUpdates(nextProject, nextUpdates);
  applySceneRemovals(nextProject, nextUpdates);
  normalizeSceneNumbers(nextProject.storyboard);

  nextProject.updatedAt = new Date().toISOString();
  return nextProject;
}

function applyCharacters(project, updates) {
  const list = Array.isArray(updates.characters_add) ? updates.characters_add : [];
  for (const character of list) {
    const safeName = String(character?.name || '').trim();
    if (!safeName) {
      continue;
    }

    const id = safeName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const exists = project.entities.characters.find((item) => item.id === id);
    if (exists) {
      continue;
    }

    const colors = ['#E8B4E8', '#B4D4E8', '#B4E8C8', '#E8D4B4', '#D4B4E8', '#E8B4B4'];
    project.entities.characters.push({
      id,
      name: safeName,
      description: String(character?.description || ''),
      visualPromptDescription: String(character?.visualPromptDescription || ''),
      role: String(character?.role || 'Supporting'),
      firstAppearance: '',
      color: colors[project.entities.characters.length % colors.length],
    });
  }

  const updatesList = Array.isArray(updates.characters_update) ? updates.characters_update : [];
  for (const update of updatesList) {
    const targetId = String(update?.id || '').trim();
    if (!targetId) {
      continue;
    }
    const target = project.entities.characters.find((item) => item.id === targetId);
    if (!target) {
      continue;
    }
    Object.assign(target, update?.changes || {});
  }
}

function applyLocations(project, updates) {
  const list = Array.isArray(updates.locations_add) ? updates.locations_add : [];
  for (const location of list) {
    const safeName = String(location?.name || '').trim();
    if (!safeName) {
      continue;
    }

    const id = safeName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const exists = project.entities.locations.find((item) => item.id === id);
    if (exists) {
      continue;
    }

    project.entities.locations.push({
      id,
      name: safeName,
      description: String(location?.description || ''),
      visualPromptDescription: String(location?.visualPromptDescription || ''),
      mood: String(location?.mood || ''),
    });
  }

  const updatesList = Array.isArray(updates.locations_update) ? updates.locations_update : [];
  for (const update of updatesList) {
    const targetId = String(update?.id || '').trim();
    if (!targetId) {
      continue;
    }
    const target = project.entities.locations.find((item) => item.id === targetId);
    if (!target) {
      continue;
    }
    Object.assign(target, update?.changes || {});
  }
}

function applySceneAdds(project, updates) {
  const additions = Array.isArray(updates.scenes_add) ? updates.scenes_add : [];
  for (const sceneData of additions) {
    const actNumber = Number(sceneData?.act || 1);
    const sequenceNumber = Number(sceneData?.sequence || 1);

    const act = project.storyboard.acts.find((item) => item.number === actNumber);
    if (!act) {
      continue;
    }

    const sequence = act.sequences.find((item) => item.number === sequenceNumber);
    if (!sequence) {
      continue;
    }

    sequence.scenes.push({
      id: `scene_${uuidv4().slice(0, 8)}`,
      sceneNumber: '',
      title: String(sceneData?.title || 'Untitled Scene'),
      location: String(sceneData?.location || ''),
      time: String(sceneData?.time || ''),
      visualDescription: String(sceneData?.visualDescription || ''),
      action: String(sceneData?.action || ''),
      dialogue: normalizeDialogue(sceneData?.dialogue),
      mood: String(sceneData?.mood || ''),
      storyFunction: String(sceneData?.storyFunction || ''),
      characterIds: normalizeStringArray(sceneData?.characterIds),
      locationIds: normalizeStringArray(sceneData?.locationIds),
      imageUrl: null,
    });
  }
}

function applySceneUpdates(project, updates) {
  const list = Array.isArray(updates.scenes_update) ? updates.scenes_update : [];
  for (const update of list) {
    const sceneId = String(update?.sceneId || '').trim();
    if (!sceneId) {
      continue;
    }

    for (const act of project.storyboard.acts) {
      for (const sequence of act.sequences) {
        const scene = sequence.scenes.find((item) => item.id === sceneId);
        if (!scene) {
          continue;
        }

        const changes = update?.changes || {};
        if ('dialogue' in changes) {
          changes.dialogue = normalizeDialogue(changes.dialogue);
        }
        if ('characterIds' in changes) {
          changes.characterIds = normalizeStringArray(changes.characterIds);
        }
        if ('locationIds' in changes) {
          changes.locationIds = normalizeStringArray(changes.locationIds);
        }

        Object.assign(scene, changes);
      }
    }
  }
}

function applySceneRemovals(project, updates) {
  const removals = Array.isArray(updates.scenes_remove) ? updates.scenes_remove : [];
  if (removals.length === 0) {
    return;
  }

  const removeSet = new Set(removals.map((value) => String(value)));
  for (const act of project.storyboard.acts) {
    for (const sequence of act.sequences) {
      sequence.scenes = sequence.scenes.filter((scene) => !removeSet.has(String(scene.id)));
    }
  }
}

function normalizeSceneNumbers(storyboard) {
  for (const act of storyboard.acts) {
    for (const sequence of act.sequences) {
      sequence.scenes = sequence.scenes.map((scene, index) => ({
        ...scene,
        sceneNumber: `${act.number}.${sequence.number}.${index + 1}`,
      }));
    }
  }
}

function normalizeDialogue(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .map((item) => ({
      character: String(item?.character || '').trim(),
      line: String(item?.line || '').trim(),
    }))
    .filter((item) => item.character || item.line);
}

function normalizeStringArray(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .map((value) => String(value || '').trim())
    .filter(Boolean);
}

export { buildSystemPrompt };
