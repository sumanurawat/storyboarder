import { useMemo, useState } from "react";
import "./App.css";

const SAMPLE_IDEA =
  "A quiet engineer discovers his AI assistant has been impersonating him online. He falls in love through words he did not write, then loses himself trying to become real again.";

const QUICK_NOTES = [
  "close-up hands, morning light, static frame",
  "wide city shot, neon reflections, slight haze",
  "split-screen chat overlays, typing indicators",
  "awkward silence in cafe, no phone in hand",
  "mirror frame repeated with colder lighting",
  "live stream UI and exploding comments",
];

const ASSISTANT_WELCOME =
  "Tell me your story. I can generate a storyboard and keep updating scenes as we chat.";

const BUTTON_HELP = {
  switchProject: "Switch between projects. Each project keeps its own chat and storyboard state.",
  newProject: "Create a new project with a fresh chat and storyboard workspace.",
  resetConversation: "Clear the active chat conversation and start a fresh one in this project.",
  generateStoryboard:
    "Builds a fresh storyboard from the Story Idea text and replaces current scene cards.",
  sendChat:
    "Sends your chat message. In mock mode this can trigger dummy actions like generate, add, or remove scene.",
  addScene: "Appends a new manual scene card at the end of the storyboard.",
  regenerate: "Re-runs storyboard generation from the current Story Idea and resets scene cards.",
  moveUp: "Moves this scene one position earlier in the storyboard.",
  moveDown: "Moves this scene one position later in the storyboard.",
  deleteScene: "Deletes this scene card from the storyboard.",
  randomVisual: "Changes the dummy visual seed for the selected scene so preview styling updates.",
};

function nowLabel() {
  return new Date().toLocaleTimeString();
}

function makeAssistantMessage(content) {
  return {
    role: "assistant",
    content,
    ts: nowLabel(),
  };
}

function makeUserMessage(content) {
  return {
    role: "user",
    content,
    ts: nowLabel(),
  };
}

function createScene(id, index, text) {
  return {
    id,
    title: `Beat ${index + 1}`,
    description: text,
    durationSec: 20 + (index % 4) * 10,
    shot: ["Wide", "Medium", "Close-up", "OTS"][index % 4],
    mood: ["Tense", "Calm", "Uneasy", "Hopeful"][index % 4],
    seed: Math.floor(Math.random() * 9999),
  };
}

function extractBeats(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    return [];
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
  if (lines.length >= 2) {
    return lines;
  }

  return text
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildScenesFromIdea(idea, maxScenes = 8) {
  const beats = extractBeats(idea);
  const pool = beats.length > 0 ? beats : [SAMPLE_IDEA, ...QUICK_NOTES];
  return pool.slice(0, maxScenes).map((beat, index) => {
    return createScene(`scene_${Date.now()}_${index}`, index, beat);
  });
}

function createProject(name, initialIdea = "") {
  const storyIdea = String(initialIdea || "");
  const scenes = storyIdea.trim() ? buildScenesFromIdea(storyIdea, 6) : [];

  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    storyIdea,
    chatInput: "",
    messages: [makeAssistantMessage(ASSISTANT_WELCOME)],
    scenes,
    selectedSceneId: scenes[0]?.id || null,
  };
}

function clip(text, max = 80) {
  const safe = String(text || "").trim();
  if (safe.length <= max) {
    return safe;
  }
  return `${safe.slice(0, Math.max(0, max - 1))}...`;
}

function mutateRandomScene(scenes, hint = "") {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    return [];
  }

  const tweakPool = [
    "Add passing train lights in the background.",
    "Push tension with a longer silence beat.",
    "Shift to handheld for emotional instability.",
    "Add a prop callback from Scene 1.",
    "Keep this as a static frame for contrast.",
    "Introduce subtle comic relief in reaction shot.",
  ];

  const targetIndex = Math.floor(Math.random() * scenes.length);
  const tweak = tweakPool[Math.floor(Math.random() * tweakPool.length)];
  const finalTweak = hint ? `${tweak} (${hint})` : tweak;

  return scenes.map((scene, index) => {
    if (index !== targetIndex) {
      return scene;
    }
    return {
      ...scene,
      description: clip(`${scene.description} ${finalTweak}`, 190),
      mood: ["Tense", "Calm", "Uneasy", "Hopeful", "Melancholic"][
        Math.floor(Math.random() * 5)
      ],
      seed: Math.floor(Math.random() * 9999),
    };
  });
}

function toImageDataUri(scene, index) {
  const palettes = [
    ["#e0f2fe", "#bae6fd", "#0ea5e9"],
    ["#fef3c7", "#fde68a", "#d97706"],
    ["#dcfce7", "#bbf7d0", "#15803d"],
    ["#ede9fe", "#ddd6fe", "#6d28d9"],
    ["#ccfbf1", "#99f6e4", "#0f766e"],
  ];
  const [bgA, bgB, accent] = palettes[index % palettes.length];
  const title = clip(scene.title, 28).replace(/&/g, "and");
  const body = clip(scene.description, 96).replace(/&/g, "and");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgA}"/>
      <stop offset="100%" stop-color="${bgB}"/>
    </linearGradient>
  </defs>
  <rect width="960" height="540" fill="url(#g)"/>
  <rect x="26" y="24" width="908" height="492" fill="none" stroke="${accent}" stroke-width="3" rx="14"/>
  <text x="52" y="78" fill="#0f172a" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700">${title}</text>
  <text x="52" y="124" fill="#1e293b" font-family="Helvetica, Arial, sans-serif" font-size="20">${scene.shot} shot • ${scene.mood}</text>
  <text x="52" y="172" fill="#1d4ed8" font-family="Helvetica, Arial, sans-serif" font-size="24">${body}</text>
  <text x="52" y="496" fill="#0c4a6e" font-family="Helvetica, Arial, sans-serif" font-size="18">Dummy storyboard frame • seed ${scene.seed}</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const STARTER_PROJECT = createProject("Project 1", SAMPLE_IDEA);

function App() {
  const [projects, setProjects] = useState([STARTER_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState(STARTER_PROJECT.id);

  const activeProject = useMemo(() => {
    return projects.find((project) => project.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  const scenes = useMemo(() => activeProject?.scenes || [], [activeProject]);

  const selectedScene = useMemo(() => {
    if (!activeProject?.selectedSceneId) {
      return null;
    }
    return scenes.find((scene) => scene.id === activeProject.selectedSceneId) || null;
  }, [scenes, activeProject]);

  const totalDuration = useMemo(() => {
    return scenes.reduce((sum, scene) => sum + Number(scene.durationSec || 0), 0);
  }, [scenes]);

  const updateActiveProject = (updater) => {
    if (!activeProjectId) {
      return;
    }

    setProjects((current) =>
      current.map((project) => {
        if (project.id !== activeProjectId) {
          return project;
        }
        return updater(project);
      })
    );
  };

  const newProject = () => {
    const fallbackName = `Project ${projects.length + 1}`;
    const typedName = window.prompt("Project name", fallbackName);
    if (typedName === null) {
      return;
    }

    const name = typedName.trim() || fallbackName;
    const project = createProject(name, "");
    setProjects((current) => [...current, project]);
    setActiveProjectId(project.id);
  };

  const resetConversation = () => {
    updateActiveProject((project) => ({
      ...project,
      chatInput: "",
      messages: [makeAssistantMessage("Conversation reset. Tell me what to change next.")],
    }));
  };

  const generateStoryboard = (overrideIdea) => {
    if (!activeProject) {
      return;
    }

    const text = String(overrideIdea ?? activeProject.storyIdea).trim();
    const nextScenes = buildScenesFromIdea(text || SAMPLE_IDEA, 8);

    updateActiveProject((project) => ({
      ...project,
      storyIdea: text || project.storyIdea,
      scenes: nextScenes,
      selectedSceneId: nextScenes[0]?.id || null,
      messages: [
        ...project.messages,
        makeAssistantMessage(`Generated ${nextScenes.length} storyboard scenes from your story idea.`),
      ],
    }));
  };

  const sendChat = () => {
    if (!activeProject) {
      return;
    }

    const text = String(activeProject.chatInput || "").trim();
    if (!text) {
      return;
    }

    setProjects((current) =>
      current.map((project) => {
        if (project.id !== activeProjectId) {
          return project;
        }

        const lower = text.toLowerCase();
        let nextProject = {
          ...project,
          chatInput: "",
          messages: [...project.messages, makeUserMessage(text)],
        };

        if (lower.includes("generate") || lower.includes("storyboard")) {
          const generatedScenes = buildScenesFromIdea(project.storyIdea || SAMPLE_IDEA, 8);
          nextProject = {
            ...nextProject,
            scenes: generatedScenes,
            selectedSceneId: generatedScenes[0]?.id || null,
            messages: [
              ...nextProject.messages,
              makeAssistantMessage(`Generated ${generatedScenes.length} storyboard scenes from your story idea.`),
            ],
          };
          return nextProject;
        }

        if (lower.includes("add scene") || lower.includes("insert")) {
          const inserted = [...nextProject.scenes];
          const insertAt = Math.min(inserted.length, Math.floor(inserted.length / 2) + 1);
          const insertedScene = createScene(
            `scene_${Date.now()}_${insertAt}`,
            insertAt,
            "New bridge moment: character makes a risky emotional choice."
          );
          inserted.splice(insertAt, 0, insertedScene);

          nextProject = {
            ...nextProject,
            scenes: inserted,
            selectedSceneId: insertedScene.id,
            messages: [
              ...nextProject.messages,
              makeAssistantMessage("Inserted a new scene in the middle to improve progression."),
            ],
          };
          return nextProject;
        }

        if (lower.includes("remove") || lower.includes("delete")) {
          if (nextProject.scenes.length > 1) {
            const trimmed = nextProject.scenes.slice(0, -1);
            nextProject = {
              ...nextProject,
              scenes: trimmed,
              selectedSceneId: trimmed.some((scene) => scene.id === nextProject.selectedSceneId)
                ? nextProject.selectedSceneId
                : trimmed[0]?.id || null,
              messages: [
                ...nextProject.messages,
                makeAssistantMessage(
                  "Removed the last scene. We can regenerate if you want a different ending."
                ),
              ],
            };
            return nextProject;
          }

          nextProject = {
            ...nextProject,
            messages: [...nextProject.messages, makeAssistantMessage("Need at least one scene to continue.")],
          };
          return nextProject;
        }

        const mutatedScenes = mutateRandomScene(nextProject.scenes, text);
        nextProject = {
          ...nextProject,
          scenes: mutatedScenes,
          selectedSceneId:
            nextProject.selectedSceneId || (mutatedScenes.length > 0 ? mutatedScenes[0].id : null),
          messages: [
            ...nextProject.messages,
            makeAssistantMessage(
              "Updated one scene with your latest direction. This is a dummy change for UI testing."
            ),
          ],
        };

        return nextProject;
      })
    );
  };

  const moveScene = (index, direction) => {
    updateActiveProject((project) => {
      const swapWith = index + direction;
      if (swapWith < 0 || swapWith >= project.scenes.length) {
        return project;
      }

      const nextScenes = [...project.scenes];
      const [item] = nextScenes.splice(index, 1);
      nextScenes.splice(swapWith, 0, item);

      return {
        ...project,
        scenes: nextScenes,
      };
    });
  };

  const addManualScene = () => {
    updateActiveProject((project) => {
      const nextScenes = [
        ...project.scenes,
        createScene(
          `scene_${Date.now()}_${project.scenes.length}`,
          project.scenes.length,
          "Manual scene note: describe visual action and emotional beat."
        ),
      ];

      return {
        ...project,
        scenes: nextScenes,
        selectedSceneId: nextScenes[nextScenes.length - 1]?.id || null,
      };
    });
  };

  const removeSceneAt = (index) => {
    updateActiveProject((project) => {
      if (project.scenes.length <= 1) {
        return project;
      }

      const nextScenes = project.scenes.filter((_, i) => i !== index);
      const hasSelected = nextScenes.some((scene) => scene.id === project.selectedSceneId);

      return {
        ...project,
        scenes: nextScenes,
        selectedSceneId: hasSelected ? project.selectedSceneId : nextScenes[0]?.id || null,
      };
    });
  };

  const updateSelectedField = (field, value) => {
    if (!selectedScene) {
      return;
    }

    updateActiveProject((project) => ({
      ...project,
      scenes: project.scenes.map((scene) =>
        scene.id === project.selectedSceneId ? { ...scene, [field]: value } : scene
      ),
    }));
  };

  return (
    <main className="mock-shell">
      <header className="app-header">
        <div>
          <h1>Storyboarder</h1>
          <p>Desktop UI mock mode. Clickable prototype with dummy storyboard logic.</p>
        </div>
        <div className="header-stats">
          <div>
            <strong>{scenes.length}</strong>
            <span>Scenes</span>
          </div>
          <div>
            <strong>{totalDuration}s</strong>
            <span>Runtime</span>
          </div>
          <div>
            <strong>{activeProject?.name || "-"}</strong>
            <span>Project</span>
          </div>
        </div>
      </header>

      <section className="workspace">
        <aside className="chat-panel">
          <h2>Chat</h2>
          <p className="muted">Tell your story, then keep refining scene by scene.</p>

          <label className="label">Project</label>
          <div className="row">
            <select
              value={activeProject?.id || ""}
              title={BUTTON_HELP.switchProject}
              aria-label={BUTTON_HELP.switchProject}
              onChange={(event) => setActiveProjectId(event.target.value)}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button
              className="btn"
              onClick={newProject}
              title={BUTTON_HELP.newProject}
              aria-label={BUTTON_HELP.newProject}
            >
              New Project
            </button>
            <button
              className="btn"
              onClick={resetConversation}
              title={BUTTON_HELP.resetConversation}
              aria-label={BUTTON_HELP.resetConversation}
            >
              Reset Conversation
            </button>
          </div>

          <label className="label">Story Idea</label>
          <textarea
            rows={5}
            value={activeProject?.storyIdea || ""}
            onChange={(event) => {
              const value = event.target.value;
              updateActiveProject((project) => ({ ...project, storyIdea: value }));
            }}
            placeholder="Describe your short film idea..."
          />

          <div className="row">
            <button
              className="btn primary"
              onClick={() => generateStoryboard()}
              title={BUTTON_HELP.generateStoryboard}
              aria-label={BUTTON_HELP.generateStoryboard}
            >
              Generate Storyboard
            </button>
          </div>

          <p className="muted button-help">
            Generate Storyboard rebuilds all scenes from your idea. Send applies your chat instruction.
          </p>

          <div className="chat-log">
            {(activeProject?.messages || []).map((message, index) => (
              <article key={`msg_${index}`} className={`bubble ${message.role}`}>
                <div className="bubble-head">
                  <strong>{message.role === "assistant" ? "Storyboarder" : "You"}</strong>
                  <span>{message.ts}</span>
                </div>
                <p>{message.content}</p>
              </article>
            ))}
          </div>

          <div className="chat-compose">
            <input
              value={activeProject?.chatInput || ""}
              onChange={(event) => {
                const value = event.target.value;
                updateActiveProject((project) => ({ ...project, chatInput: value }));
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendChat();
                }
              }}
              placeholder='Try: "Add scene between 3 and 4" or "Generate storyboard"'
            />
            <button
              className="btn primary"
              onClick={sendChat}
              title={BUTTON_HELP.sendChat}
              aria-label={BUTTON_HELP.sendChat}
            >
              Send
            </button>
          </div>
        </aside>

        <section className="board-panel">
          <div className="board-toolbar">
            <h2>Storyboard</h2>
            <div className="row">
              <button
                className="btn"
                onClick={addManualScene}
                title={BUTTON_HELP.addScene}
                aria-label={BUTTON_HELP.addScene}
              >
                Add Scene
              </button>
              <button
                className="btn"
                onClick={() => generateStoryboard(activeProject?.storyIdea || "")}
                title={BUTTON_HELP.regenerate}
                aria-label={BUTTON_HELP.regenerate}
              >
                Regenerate
              </button>
            </div>
          </div>

          <div className="scene-grid">
            {scenes.map((scene, index) => {
              const active = activeProject?.selectedSceneId === scene.id;
              return (
                <article
                  key={scene.id}
                  className={`scene-card ${active ? "active" : ""}`}
                  onClick={() => {
                    updateActiveProject((project) => ({ ...project, selectedSceneId: scene.id }));
                  }}
                >
                  <img src={toImageDataUri(scene, index)} alt={scene.title} />
                  <div className="scene-card-body">
                    <div className="scene-card-head">
                      <strong>Scene {index + 1}</strong>
                      <span>{scene.durationSec}s</span>
                    </div>
                    <p>{scene.description}</p>
                    <div className="pill-row">
                      <span>{scene.shot}</span>
                      <span>{scene.mood}</span>
                    </div>
                    <div className="scene-actions">
                      <button
                        className="btn tiny"
                        title={BUTTON_HELP.moveUp}
                        aria-label={BUTTON_HELP.moveUp}
                        onClick={(event) => {
                          event.stopPropagation();
                          moveScene(index, -1);
                        }}
                      >
                        Up
                      </button>
                      <button
                        className="btn tiny"
                        title={BUTTON_HELP.moveDown}
                        aria-label={BUTTON_HELP.moveDown}
                        onClick={(event) => {
                          event.stopPropagation();
                          moveScene(index, 1);
                        }}
                      >
                        Down
                      </button>
                      <button
                        className="btn tiny danger"
                        title={BUTTON_HELP.deleteScene}
                        aria-label={BUTTON_HELP.deleteScene}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeSceneAt(index);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="inspector-panel">
          <h2>Scene Inspector</h2>
          {!selectedScene && <p className="muted">Select a scene card to edit details.</p>}

          {selectedScene && (
            <div className="inspector-fields">
              <label className="label">Title</label>
              <input
                value={selectedScene.title}
                onChange={(event) => updateSelectedField("title", event.target.value)}
              />

              <label className="label">Description</label>
              <textarea
                rows={6}
                value={selectedScene.description}
                onChange={(event) => updateSelectedField("description", event.target.value)}
              />

              <label className="label">Duration (sec)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={selectedScene.durationSec}
                onChange={(event) =>
                  updateSelectedField("durationSec", Number(event.target.value || selectedScene.durationSec))
                }
              />

              <label className="label">Shot Type</label>
              <input
                value={selectedScene.shot}
                onChange={(event) => updateSelectedField("shot", event.target.value)}
              />

              <label className="label">Mood</label>
              <input
                value={selectedScene.mood}
                onChange={(event) => updateSelectedField("mood", event.target.value)}
              />

              <button
                className="btn"
                title={BUTTON_HELP.randomVisual}
                aria-label={BUTTON_HELP.randomVisual}
                onClick={() => {
                  updateSelectedField("seed", Math.floor(Math.random() * 9999));
                }}
              >
                Randomize Dummy Visual
              </button>
            </div>
          )}

          <div className="timeline">
            <h3>Timeline</h3>
            {scenes.map((scene, index) => (
              <div key={`tl_${scene.id}`} className="timeline-item">
                <span>Scene {index + 1}</span>
                <strong>{scene.durationSec}s</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;
