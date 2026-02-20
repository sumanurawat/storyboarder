import { create } from 'zustand';

import { loadSettings, saveSettings } from '../services/storage.js';
import { fetchModels, initClient } from '../services/openrouter.js';

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4';

export const useSettingsStore = create((set, get) => ({
  apiKey: '',
  model: DEFAULT_MODEL,
  availableModels: [],
  isLoadingModels: false,
  initialized: false,
  modelError: '',

  init: async () => {
    const settings = await loadSettings();
    const apiKey = String(settings?.apiKey || '').trim();
    const model = String(settings?.model || DEFAULT_MODEL).trim() || DEFAULT_MODEL;

    set({ apiKey, model, initialized: true });

    if (apiKey) {
      initClient(apiKey);
      await get().refreshModels();
    }
  },

  setApiKey: async (apiKey) => {
    const clean = String(apiKey || '').trim();
    set({ apiKey: clean, modelError: '' });

    initClient(clean);
    await saveSettings({ apiKey: clean, model: get().model });

    if (clean) {
      await get().refreshModels();
    } else {
      set({ availableModels: [] });
    }
  },

  setModel: async (model) => {
    const clean = String(model || '').trim() || DEFAULT_MODEL;
    set({ model: clean });
    await saveSettings({ apiKey: get().apiKey, model: clean });
  },

  refreshModels: async () => {
    const apiKey = get().apiKey;
    if (!apiKey) {
      set({ availableModels: [], modelError: '' });
      return;
    }

    set({ isLoadingModels: true, modelError: '' });

    try {
      const models = await fetchModels(apiKey);
      set({ availableModels: models });

      if (models.length > 0 && !models.some((model) => model.id === get().model)) {
        const nextModel = models[0].id;
        set({ model: nextModel });
        await saveSettings({ apiKey: get().apiKey, model: nextModel });
      }
    } catch (error) {
      set({ modelError: error.message || 'Failed to load OpenRouter models.' });
    } finally {
      set({ isLoadingModels: false });
    }
  },
}));
