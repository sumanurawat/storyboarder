import { create } from 'zustand';

import { sendMessage } from '../services/openrouter.js';
import {
  applyUpdates,
  buildSystemPrompt,
  parseAIResponse,
} from '../services/prompt-builder.js';
import {
  createProject,
  createEmptyEntities,
  createEmptyStoryboard,
} from '../types/storyboard.js';
import {
  deleteProject,
  listProjects,
  loadProject,
  saveProject,
} from '../services/storage.js';
import { useSettingsStore } from './settings-store.js';

function createAssistantMessage(content) {
  return {
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
  };
}

function createUserMessage(content) {
  return {
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  };
}

function sortByUpdatedDesc(projects) {
  return [...projects].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

export const useProjectStore = create((set, get) => ({
  projectIndex: [],
  activeProject: null,
  selectedSceneId: null,
  isStreaming: false,
  streamingText: '',
  isSending: false,

  init: async () => {
    const index = sortByUpdatedDesc(await listProjects());

    if (index.length === 0) {
      const starter = createProject('New Story');
      await saveProject(starter);
      const updatedIndex = sortByUpdatedDesc(await listProjects());
      set({
        projectIndex: updatedIndex,
        activeProject: starter,
        selectedSceneId: null,
      });
      return;
    }

    const first = await loadProject(index[0].id);
    set({
      projectIndex: index,
      activeProject: normalizeProject(first),
      selectedSceneId: null,
    });
  },

  refreshProjectIndex: async () => {
    const index = sortByUpdatedDesc(await listProjects());
    set({ projectIndex: index });
  },

  createProject: async (name) => {
    const project = createProject(String(name || '').trim() || 'New Story');
    await saveProject(project);
    const index = sortByUpdatedDesc(await listProjects());
    set({ projectIndex: index, activeProject: project, selectedSceneId: null });
    return project;
  },

  switchProject: async (projectId) => {
    const project = normalizeProject(await loadProject(projectId));
    if (!project) {
      return;
    }

    set({
      activeProject: project,
      selectedSceneId: null,
      streamingText: '',
      isStreaming: false,
      isSending: false,
    });
  },

  renameActiveProject: async (name) => {
    const activeProject = get().activeProject;
    if (!activeProject) {
      return;
    }

    const clean = String(name || '').trim();
    if (!clean) {
      return;
    }

    const nextProject = {
      ...activeProject,
      name: clean,
      updatedAt: new Date().toISOString(),
    };

    await saveProject(nextProject);
    set({ activeProject: nextProject });
    await get().refreshProjectIndex();
  },

  deleteProjectById: async (projectId) => {
    await deleteProject(projectId);
    const index = sortByUpdatedDesc(await listProjects());

    let nextProject = null;
    if (index.length > 0) {
      nextProject = normalizeProject(await loadProject(index[0].id));
    }

    set({
      projectIndex: index,
      activeProject: nextProject,
      selectedSceneId: null,
      streamingText: '',
      isStreaming: false,
      isSending: false,
    });

    if (!nextProject) {
      const starter = createProject('New Story');
      await saveProject(starter);
      const withStarter = sortByUpdatedDesc(await listProjects());
      set({ projectIndex: withStarter, activeProject: starter });
    }
  },

  deleteActiveProject: async () => {
    const activeProject = get().activeProject;
    if (!activeProject) {
      return;
    }
    await get().deleteProjectById(activeProject.id);
  },

  selectScene: (sceneId) => {
    set({ selectedSceneId: sceneId || null });
  },

  clearSelection: () => {
    set({ selectedSceneId: null });
  },

  saveCurrentProject: async () => {
    const activeProject = get().activeProject;
    if (!activeProject) {
      return;
    }

    const nextProject = {
      ...activeProject,
      updatedAt: new Date().toISOString(),
    };

    await saveProject(nextProject);
    set({ activeProject: nextProject });
    await get().refreshProjectIndex();
  },

  setActiveProject: (updater) => {
    const activeProject = get().activeProject;
    if (!activeProject) {
      return;
    }

    const nextProject = normalizeProject(
      typeof updater === 'function' ? updater(activeProject) : updater
    );

    if (!nextProject) {
      return;
    }

    set({ activeProject: nextProject });
  },

  sendUserMessage: async (userText) => {
    const activeProject = get().activeProject;
    const settings = useSettingsStore.getState();
    const content = String(userText || '').trim();

    if (!activeProject || !content) {
      return;
    }

    if (!settings.apiKey) {
      const errorProject = {
        ...activeProject,
        messages: [
          ...activeProject.messages,
          createUserMessage(content),
          createAssistantMessage('Add your OpenRouter API key in Settings to start AI storyboarding.'),
        ],
        updatedAt: new Date().toISOString(),
      };

      await saveProject(errorProject);
      set({ activeProject: errorProject, streamingText: '', isStreaming: false, isSending: false });
      await get().refreshProjectIndex();
      return;
    }

    const projectWithUser = {
      ...activeProject,
      messages: [...activeProject.messages, createUserMessage(content)],
      updatedAt: new Date().toISOString(),
    };

    set({
      activeProject: projectWithUser,
      isStreaming: true,
      isSending: true,
      streamingText: '',
    });

    await saveProject(projectWithUser);
    await get().refreshProjectIndex();

    const systemPrompt = buildSystemPrompt(projectWithUser.storyboard, projectWithUser.entities);

    const apiMessages = projectWithUser.messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    await sendMessage({
      model: settings.model,
      systemPrompt,
      messages: apiMessages,
      onToken: (_delta, fullText) => {
        set({ streamingText: fullText });
      },
      onDone: async (fullText) => {
        const parsed = parseAIResponse(fullText);
        const withAssistant = {
          ...projectWithUser,
          messages: [
            ...projectWithUser.messages,
            createAssistantMessage(parsed.chat || 'Updated storyboard.'),
          ],
        };

        const updated = applyUpdates(withAssistant, parsed.updates || {});
        updated.updatedAt = new Date().toISOString();

        await saveProject(updated);
        const index = sortByUpdatedDesc(await listProjects());

        set({
          activeProject: updated,
          projectIndex: index,
          isStreaming: false,
          streamingText: '',
          isSending: false,
        });
      },
      onError: async (error) => {
        const fallback = {
          ...projectWithUser,
          messages: [
            ...projectWithUser.messages,
            createAssistantMessage(
              `OpenRouter error: ${error?.message || 'Unable to process request.'}`
            ),
          ],
          updatedAt: new Date().toISOString(),
        };

        await saveProject(fallback);
        const index = sortByUpdatedDesc(await listProjects());

        set({
          activeProject: fallback,
          projectIndex: index,
          isStreaming: false,
          streamingText: '',
          isSending: false,
        });
      },
    });
  },
}));

function normalizeProject(project) {
  if (!project || typeof project !== 'object') {
    return null;
  }

  const storyboard = project.storyboard || createEmptyStoryboard();
  const entities = project.entities || createEmptyEntities();

  return {
    ...project,
    messages: Array.isArray(project.messages) ? project.messages : [],
    storyboard,
    entities: {
      characters: Array.isArray(entities.characters) ? entities.characters : [],
      locations: Array.isArray(entities.locations) ? entities.locations : [],
    },
    updatedAt: project.updatedAt || new Date().toISOString(),
  };
}
