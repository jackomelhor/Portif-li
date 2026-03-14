(function () {
  const WINDOW_MANAGER_NAMESPACE = "VITOR_OS_WINDOW_MANAGER";

  let initialized = false;
  let highestZIndex = 200;
  let restoredFromStorage = false;

  const registry = new Map();

  function getApp() {
    return window.VITOR_OS_APP || null;
  }

  function getConfig() {
    return getApp()?.config || window.VITOR_OS_CONFIG || null;
  }

  function getState() {
    return getApp()?.state || null;
  }

  function getElements() {
    return getApp()?.elements || null;
  }

  function getTemplates() {
    return window.VITOR_OS_TEMPLATES || null;
  }

  function getStorage() {
    return window.VITOR_OS_STORAGE || null;
  }

  function getTaskbar() {
    return window.VITOR_OS_TASKBAR || null;
  }

  function getDrag() {
    return window.VITOR_OS_DRAG || null;
  }

  function getSound() {
    return window.VITOR_OS_SOUND || null;
  }

  function playSound(name) {
    const sound = getSound();
    if (sound && typeof sound.play === "function") {
      sound.play(name);
    }
  }

  function getWindowConfigById(windowId) {
    const config = getConfig();
    if (!config?.windows) return null;
    return Object.values(config.windows).find((windowConfig) => windowConfig.id === windowId) || null;
  }

  function getWindowState(windowId) {
    const state = getState();
    if (!state?.windows) return null;
    return state.windows[windowId] || null;
  }

  function getWindowSize(windowId) {
    const presets = {
      "about-window": { width: 470, height: 300 },
      "skills-window": { width: 450, height: 300 },
      "projects-window": { width: 640, height: 410 },
      "contact-window": { width: 420, height: 290 }
    };

    return presets[windowId] || {
      width: 520,
      height: 340
    };
  }

  function getBounds() {
    const elements = getElements();
    const layer = elements?.windowsLayer;

    if (!layer) {
      return {
        width: window.innerWidth,
        height: window.innerHeight - 42
      };
    }

    return {
      width: layer.clientWidth,
      height: layer.clientHeight
    };
  }

  function centerPosition(windowId) {
    const size = getWindowSize(windowId);
    const bounds = getBounds();

    const left = Math.max(24, Math.round((bounds.width - size.width) / 2));
    const top = Math.max(24, Math.round((bounds.height - size.height) / 2));

    return { left, top, width: size.width, height: size.height };
  }

  function clampPosition(left, top, width, height) {
    const bounds = getBounds();
    const minVisibleX = 140;
    const minVisibleY = 34;

    const minLeft = -(width - minVisibleX);
    const maxLeft = bounds.width - minVisibleX;

    const minTop = 0;
    const maxTop = bounds.height - minVisibleY;

    return {
      left: Math.min(Math.max(left, minLeft), maxLeft),
      top: Math.min(Math.max(top, minTop), maxTop)
    };
  }

  function nextZIndex() {
    highestZIndex += 1;
    return highestZIndex;
  }

  function createWindowElement(windowConfig) {
    const templates = getTemplates();
    const size = getWindowSize(windowConfig.id);

    const win = document.createElement("section");
    win.className = "os-window is-opening";
    win.dataset.windowId = windowConfig.id;
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", windowConfig.title);
    win.style.width = `${size.width}px`;
    win.style.height = `${size.height}px`;
    win.style.opacity = "0";
    win.style.transform = "scale(0.92)";

    const titlebar = document.createElement("header");
    titlebar.className = "os-window__titlebar";

    const title = document.createElement("div");
    title.className = "os-window__title";

    const icon = document.createElement("img");
    icon.className = "os-window__title-icon";
    icon.src = windowConfig.icon;
    icon.alt = windowConfig.title;

    const titleText = document.createElement("span");
    titleText.className = "os-window__title-text";
    titleText.textContent = windowConfig.title;

    title.appendChild(icon);
    title.appendChild(titleText);

    const controls = document.createElement("div");
    controls.className = "os-window__controls";

    const minimizeButton = document.createElement("button");
    minimizeButton.type = "button";
    minimizeButton.className = "os-window__control os-window__control--minimize";
    minimizeButton.setAttribute("aria-label", `Minimizar ${windowConfig.title}`);
    minimizeButton.textContent = "_";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "os-window__control os-window__control--close";
    closeButton.setAttribute("aria-label", `Fechar ${windowConfig.title}`);
    closeButton.textContent = "X";

    controls.appendChild(minimizeButton);
    controls.appendChild(closeButton);

    titlebar.appendChild(title);
    titlebar.appendChild(controls);

    const body = document.createElement("div");
    body.className = "os-window__body";
    body.innerHTML = templates?.renderByWindowId(windowConfig.id) || "";

    win.appendChild(titlebar);
    win.appendChild(body);

    minimizeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      minimizeWindow(windowConfig.id);
    });

    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      closeWindow(windowConfig.id);
    });

    win.addEventListener("mousedown", () => {
      focusWindow(windowConfig.id);
    });

    return win;
  }

  function applyPosition(windowId, left, top) {
    const win = registry.get(windowId);
    const state = getWindowState(windowId);
    if (!win || !state) return;

    const rect = clampPosition(left, top, win.offsetWidth, win.offsetHeight);
    win.style.left = `${rect.left}px`;
    win.style.top = `${rect.top}px`;

    state.x = rect.left;
    state.y = rect.top;
  }

  function mountWindow(windowId, options = {}) {
    const elements = getElements();
    const windowConfig = getWindowConfigById(windowId);
    const state = getWindowState(windowId);

    if (!elements?.windowsLayer || !windowConfig || !state) return null;

    if (registry.has(windowId)) {
      return registry.get(windowId);
    }

    const win = createWindowElement(windowConfig);
    elements.windowsLayer.appendChild(win);
    registry.set(windowId, win);

    const left = typeof state.x === "number" ? state.x : centerPosition(windowId).left;
    const top = typeof state.y === "number" ? state.y : centerPosition(windowId).top;

    applyPosition(windowId, left, top);

    if (typeof state.zIndex === "number") {
      highestZIndex = Math.max(highestZIndex, state.zIndex);
      win.style.zIndex = String(state.zIndex);
    } else {
      const zIndex = nextZIndex();
      state.zIndex = zIndex;
      win.style.zIndex = String(zIndex);
    }

    const drag = getDrag();
    if (drag && typeof drag.makeDraggable === "function") {
      drag.makeDraggable(win, {
        windowId,
        onFocus: focusWindow,
        onMoveEnd: persistState
      });
    }

    if (!options.skipAnimation) {
      requestAnimationFrame(() => {
        win.style.transition = "opacity 180ms ease, transform 180ms ease";
        win.style.opacity = "1";
        win.style.transform = "scale(1)";
        window.setTimeout(() => {
          win.classList.remove("is-opening");
          win.style.transition = "";
          win.style.opacity = "";
          win.style.transform = "";
        }, 200);
      });
    } else {
      win.classList.remove("is-opening");
      win.style.opacity = "";
      win.style.transform = "";
    }

    return win;
  }

  function unmountWindow(windowId) {
    const win = registry.get(windowId);
    if (win) {
      win.remove();
      registry.delete(windowId);
    }
  }

  function syncWindowClasses() {
    const state = getState();
    if (!state?.windows) return;

    Object.values(state.windows).forEach((windowState) => {
      const win = registry.get(windowState.id);
      if (!win) return;

      win.classList.toggle("is-hidden", !!windowState.isMinimized);
      win.classList.toggle("is-focused", state.focusedWindowId === windowState.id);
      if (!windowState.isMinimized) {
        win.style.display = "";
      }
    });
  }

  function persistState() {
    const storage = getStorage();
    const state = getState();

    if (!storage || typeof storage.saveAll !== "function" || !state?.windows) return;
    storage.saveAll(state.windows);
  }

  function updateTaskbar() {
    const taskbar = getTaskbar();
    if (taskbar && typeof taskbar.render === "function") {
      taskbar.render();
    }
  }

  function focusWindow(windowId) {
    const state = getState();
    const win = registry.get(windowId);

    if (!state || !win) return;

    const windowState = getWindowState(windowId);
    if (!windowState) return;

    const zIndex = nextZIndex();
    windowState.zIndex = zIndex;
    state.focusedWindowId = windowId;
    win.style.zIndex = String(zIndex);

    syncWindowClasses();
    updateTaskbar();
    persistState();
  }

  function openWindow(windowId, options = {}) {
    const state = getState();
    const windowState = getWindowState(windowId);

    if (!state || !windowState) return;

    if (windowState.isOpen && windowState.isMinimized) {
      restoreWindow(windowId);
      return;
    }

    if (windowState.isOpen && !windowState.isMinimized) {
      focusWindow(windowId);
      return;
    }

    windowState.isOpen = true;
    windowState.isMinimized = false;

    const win = mountWindow(windowId, options);
    if (!win) return;

    focusWindow(windowId);
    syncWindowClasses();
    updateTaskbar();
    persistState();

    if (!options.silent) {
      playSound("open");
    }
  }

  function closeWindow(windowId) {
    const state = getState();
    const windowState = getWindowState(windowId);

    if (!state || !windowState) return;

    windowState.isOpen = false;
    windowState.isMinimized = false;

    if (state.focusedWindowId === windowId) {
      state.focusedWindowId = null;
    }

    unmountWindow(windowId);
    syncWindowClasses();
    updateTaskbar();
    persistState();
    playSound("click");
  }

  function minimizeWindow(windowId) {
    const state = getState();
    const windowState = getWindowState(windowId);
    const win = registry.get(windowId);

    if (!state || !windowState || !win || windowState.isMinimized) return;

    windowState.isMinimized = true;

    win.classList.add("is-minimizing");
    win.style.transition = "opacity 140ms ease, transform 140ms ease";
    win.style.opacity = "0";
    win.style.transform = "scale(0.92)";

    window.setTimeout(() => {
      win.classList.remove("is-minimizing");
      win.style.transition = "";
      win.style.opacity = "";
      win.style.transform = "";
      syncWindowClasses();
    }, 150);

    if (state.focusedWindowId === windowId) {
      state.focusedWindowId = null;
    }

    updateTaskbar();
    persistState();
    playSound("minimize");
  }

  function restoreWindow(windowId) {
    const state = getState();
    const windowState = getWindowState(windowId);

    if (!state || !windowState) return;

    if (!windowState.isOpen) {
      openWindow(windowId);
      return;
    }

    const win = registry.get(windowId) || mountWindow(windowId, { skipAnimation: true });
    if (!win) return;

    windowState.isMinimized = false;
    win.classList.remove("is-hidden");
    win.style.display = "";
    focusWindow(windowId);
    syncWindowClasses();
    updateTaskbar();
    persistState();
    playSound("open");
  }

  function handleTaskbarClick(windowId) {
    const windowState = getWindowState(windowId);
    if (!windowState) return;

    if (windowState.isMinimized) {
      restoreWindow(windowId);
      return;
    }

    focusWindow(windowId);
  }

  function setWindowPosition(windowId, left, top) {
    applyPosition(windowId, left, top);
    persistState();
  }

  function restoreFromSavedState() {
    const state = getState();
    if (!state?.windows || restoredFromStorage) return;

    restoredFromStorage = true;

    const openWindows = Object.values(state.windows)
      .filter((windowState) => windowState.isOpen)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    openWindows.forEach((windowState) => {
      openWindow(windowState.id, {
        skipAnimation: true,
        silent: true
      });

      if (windowState.isMinimized) {
        minimizeWindow(windowState.id);
      }
    });

    updateTaskbar();
    syncWindowClasses();
  }

  function waitForDesktopAndRestore() {
    const state = getState();
    if (!state?.desktopReady) {
      window.requestAnimationFrame(waitForDesktopAndRestore);
      return;
    }

    restoreFromSavedState();
  }

  function wireAppMethods() {
    const app = getApp();
    if (!app) return;

    app.openWindow = openWindow;
    app.closeWindow = closeWindow;
    app.minimizeWindow = minimizeWindow;
    app.restoreWindow = restoreWindow;
    app.focusWindow = focusWindow;
  }

  function syncStateFromStorageIfAvailable() {
    const storage = getStorage();
    if (storage && typeof storage.applyToMemory === "function") {
      storage.applyToMemory();
    }
  }

  function initWindowManager() {
    if (initialized) return;

    const app = getApp();
    const templates = getTemplates();
    const elements = getElements();

    if (!app || !templates || !elements?.windowsLayer) {
      window.requestAnimationFrame(initWindowManager);
      return;
    }

    syncStateFromStorageIfAvailable();
    wireAppMethods();
    waitForDesktopAndRestore();

    window.addEventListener("resize", () => {
      registry.forEach((win, windowId) => {
        const rect = clampPosition(
          parseInt(win.style.left || "0", 10),
          parseInt(win.style.top || "0", 10),
          win.offsetWidth,
          win.offsetHeight
        );
        setWindowPosition(windowId, rect.left, rect.top);
      });
    });

    initialized = true;
  }

  window[WINDOW_MANAGER_NAMESPACE] = {
    init: initWindowManager,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    handleTaskbarClick,
    setWindowPosition,
    restoreFromSavedState,
    getWindowElement(windowId) {
      return registry.get(windowId) || null;
    }
  };

  document.addEventListener("DOMContentLoaded", initWindowManager);
})();