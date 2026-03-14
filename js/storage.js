(function () {
  const STORAGE_NAMESPACE = "VITOR_OS_STORAGE";
  let initialized = false;

  function getConfig() {
    return window.VITOR_OS_CONFIG || null;
  }

  function getApp() {
    return window.VITOR_OS_APP || null;
  }

  function getKey() {
    return getConfig()?.storageKeys?.windowsState || "vitor-os:windows-state";
  }

  function readRaw() {
    try {
      const raw = window.localStorage.getItem(getKey());
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function writeRaw(value) {
    try {
      window.localStorage.setItem(getKey(), JSON.stringify(value));
    } catch (error) {}
  }

  function saveAll(windowsState) {
    writeRaw(windowsState || {});
  }

  function saveOne(windowId, nextState) {
    const current = readRaw();
    current[windowId] = nextState;
    writeRaw(current);
  }

  function applyToMemory() {
    const app = getApp();
    if (!app?.state?.windows) return;

    const saved = readRaw();

    Object.keys(app.state.windows).forEach((windowId) => {
      const stored = saved[windowId];
      if (!stored) return;

      app.state.windows[windowId] = {
        ...app.state.windows[windowId],
        ...stored
      };
    });
  }

  function clear() {
    try {
      window.localStorage.removeItem(getKey());
    } catch (error) {}
  }

  function initStorage() {
    if (initialized) return;

    const app = getApp();
    if (!app?.state?.windows) {
      window.requestAnimationFrame(initStorage);
      return;
    }

    applyToMemory();

    if (
      window.VITOR_OS_WINDOW_MANAGER &&
      typeof window.VITOR_OS_WINDOW_MANAGER.restoreFromSavedState === "function" &&
      app.state.desktopReady
    ) {
      window.VITOR_OS_WINDOW_MANAGER.restoreFromSavedState();
    }

    initialized = true;
  }

  window[STORAGE_NAMESPACE] = {
    init: initStorage,
    readRaw,
    writeRaw,
    saveAll,
    saveOne,
    applyToMemory,
    clear
  };

  document.addEventListener("DOMContentLoaded", initStorage);
})();