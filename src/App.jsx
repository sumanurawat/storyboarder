import { useEffect, useMemo, useState } from 'react';

import AppLayout from './components/layout/AppLayout.jsx';
import { useProjectStore } from './store/project-store.js';
import { useSettingsStore } from './store/settings-store.js';
import './App.css';

export default function App() {
  const [sidebarTab, setSidebarTab] = useState('stories');

  const settingsStore = useSettingsStore();
  const projectStore = useProjectStore();

  useEffect(() => {
    settingsStore.init();
    projectStore.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProject = projectStore.activeProject;

  const selectedScene = useMemo(() => {
    if (!activeProject || !projectStore.selectedSceneId) {
      return null;
    }

    for (const act of activeProject.storyboard.acts) {
      for (const sequence of act.sequences) {
        const scene = sequence.scenes.find((item) => item.id === projectStore.selectedSceneId);
        if (scene) {
          return scene;
        }
      }
    }

    return null;
  }, [activeProject, projectStore.selectedSceneId]);

  const stats = useMemo(() => {
    const scenes = countScenes(activeProject?.storyboard);
    const characters = activeProject?.entities?.characters?.length || 0;
    const locations = activeProject?.entities?.locations?.length || 0;

    return {
      scenes,
      characters,
      locations,
    };
  }, [activeProject]);

  const projectProps = {
    projects: projectStore.projectIndex,
    activeProjectId: activeProject?.id,
    onSwitch: projectStore.switchProject,
    onCreate: () => {
      const name = window.prompt('Name your new story', `Story ${projectStore.projectIndex.length + 1}`);
      if (name === null) {
        return;
      }
      projectStore.createProject(name);
    },
    onDelete: (projectId) => {
      const ok = window.confirm('Delete this story project permanently?');
      if (!ok) {
        return;
      }
      projectStore.deleteProjectById(projectId);
    },
    onRename: (project) => {
      const next = window.prompt('Rename project', project.name);
      if (next === null) {
        return;
      }

      if (project.id === activeProject?.id) {
        projectStore.renameActiveProject(next);
        return;
      }

      projectStore.switchProject(project.id).then(() => {
        projectStore.renameActiveProject(next);
      });
    },
  };

  const settingsProps = {
    apiKey: settingsStore.apiKey,
    model: settingsStore.model,
    models: settingsStore.availableModels,
    isLoadingModels: settingsStore.isLoadingModels,
    modelError: settingsStore.modelError,
    onSaveApiKey: settingsStore.setApiKey,
    onModelChange: settingsStore.setModel,
    onRefreshModels: settingsStore.refreshModels,
  };

  const chatProps = {
    messages: activeProject?.messages || [],
    streamingText: projectStore.streamingText,
    isStreaming: projectStore.isStreaming,
    isSending: projectStore.isSending,
    onSend: projectStore.sendUserMessage,
  };

  const storyboardProps = {
    storyboard: activeProject?.storyboard,
    selectedSceneId: projectStore.selectedSceneId,
    onSelectScene: projectStore.selectScene,
  };

  const sceneDetailProps = {
    scene: selectedScene,
    entities: activeProject?.entities,
    onClose: projectStore.clearSelection,
  };

  if (!settingsStore.initialized || !activeProject) {
    return (
      <main className="sb-loading">
        <p>Booting Storyboarder...</p>
      </main>
    );
  }

  return (
    <AppLayout
      sidebarTab={sidebarTab}
      setSidebarTab={setSidebarTab}
      projectProps={projectProps}
      settingsProps={settingsProps}
      chatProps={chatProps}
      storyboardProps={storyboardProps}
      sceneDetailProps={sceneDetailProps}
      projectName={activeProject?.name}
      stats={stats}
    />
  );
}

function countScenes(storyboard) {
  const acts = Array.isArray(storyboard?.acts) ? storyboard.acts : [];
  let total = 0;
  for (const act of acts) {
    for (const sequence of act.sequences || []) {
      total += (sequence.scenes || []).length;
    }
  }
  return total;
}
