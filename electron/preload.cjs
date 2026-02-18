const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("storyboarder", {
  mode: "mock",
});
