const isElectron =
  typeof window !== 'undefined' &&
  window.storyboarder &&
  typeof window.storyboarder.loadSettings === 'function';

const SETTINGS_KEY = 'storyboarder_settings';
const INDEX_KEY = 'storyboarder_projects_index';

export async function loadSettings() {
  if (isElectron) {
    return window.storyboarder.loadSettings();
  }

  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return { apiKey: '', model: 'anthropic/claude-sonnet-4' };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { apiKey: '', model: 'anthropic/claude-sonnet-4' };
  }
}

export async function saveSettings(settings) {
  if (isElectron) {
    return window.storyboarder.saveSettings(settings);
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return true;
}

export async function listProjects() {
  if (isElectron) {
    return window.storyboarder.listProjects();
  }

  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function loadProject(projectId) {
  if (isElectron) {
    return window.storyboarder.loadProject(projectId);
  }

  const raw = localStorage.getItem(projectStorageKey(projectId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveProject(project) {
  if (isElectron) {
    return window.storyboarder.saveProject(project);
  }

  localStorage.setItem(projectStorageKey(project.id), JSON.stringify(project));

  const index = await listProjects();
  const record = {
    id: project.id,
    name: project.name,
    updatedAt: project.updatedAt,
  };

  const existingIndex = index.findIndex((item) => item.id === project.id);
  if (existingIndex >= 0) {
    index[existingIndex] = record;
  } else {
    index.push(record);
  }

  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  return true;
}

export async function deleteProject(projectId) {
  if (isElectron) {
    return window.storyboarder.deleteProject(projectId);
  }

  localStorage.removeItem(projectStorageKey(projectId));
  const index = await listProjects();
  localStorage.setItem(
    INDEX_KEY,
    JSON.stringify(index.filter((item) => item.id !== projectId))
  );
  return true;
}

function projectStorageKey(projectId) {
  return `storyboarder_project_${projectId}`;
}
