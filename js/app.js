(function () {
  const MODULE_ORDER = [
    "VITOR_OS_SOUND",
    "VITOR_OS_STORAGE",
    "VITOR_OS_DESKTOP",
    "VITOR_OS_TASKBAR",
    "VITOR_OS_WINDOW_MANAGER",
    "VITOR_OS_BOOT"
  ];

  const state = {
    bootFinished: false,
    desktopReady: false,
    focusedWindowId: null,
    windows: {}
  };

  const elements = {
    bootScreen: null,
    bootText: null,
    bootHint: null,
    desktopScreen: null,
    desktopIcons: null,
    windowsLayer: null,
    taskbar: null,
    taskbarWindows: null
  };

  function getConfig() {
    return window.VITOR_OS_CONFIG || null;
  }

  function cacheElements() {
    elements.bootScreen = document.getElementById("boot-screen");
    elements.bootText = document.getElementById("boot-text");
    elements.bootHint = document.getElementById("boot-hint");
    elements.desktopScreen = document.getElementById("desktop-screen");
    elements.desktopIcons = document.getElementById("desktop-icons");
    elements.windowsLayer = document.getElementById("windows-layer");
    elements.taskbar = document.getElementById("taskbar");
    elements.taskbarWindows = document.getElementById("taskbar-windows");
  }

  function buildWindowState() {
    const config = getConfig();
    if (!config?.windows) return;

    Object.values(config.windows).forEach((windowConfig, index) => {
      state.windows[windowConfig.id] = {
        id: windowConfig.id,
        title: windowConfig.title,
        icon: windowConfig.icon,
        isOpen: false,
        isMinimized: false,
        x: null,
        y: null,
        zIndex: 100 + index
      };
    });
  }

  function applyWallpaper() {
    const config = getConfig();
    const desktop = elements.desktopScreen;
    const wallpaper = config?.system?.desktopWallpaper;

    if (!desktop || !wallpaper) return;

    desktop.style.backgroundImage = `
      linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
      url("${wallpaper}")
    `;
    desktop.style.backgroundSize = "cover";
    desktop.style.backgroundPosition = "center";
    desktop.style.backgroundRepeat = "no-repeat";
  }

  function callModuleInit(moduleName) {
    const mod = window[moduleName];
    if (mod && typeof mod.init === "function") {
      mod.init();
    }
  }

  function initModules() {
    MODULE_ORDER.forEach(callModuleInit);
  }

  function exposeAppApi() {
    window.VITOR_OS_APP = {
      config: getConfig(),
      state,
      elements,
      openWindow(windowId) {
        if (
          window.VITOR_OS_WINDOW_MANAGER &&
          typeof window.VITOR_OS_WINDOW_MANAGER.openWindow === "function"
        ) {
          window.VITOR_OS_WINDOW_MANAGER.openWindow(windowId);
        }
      },
      closeWindow(windowId) {
        if (
          window.VITOR_OS_WINDOW_MANAGER &&
          typeof window.VITOR_OS_WINDOW_MANAGER.closeWindow === "function"
        ) {
          window.VITOR_OS_WINDOW_MANAGER.closeWindow(windowId);
        }
      },
      minimizeWindow(windowId) {
        if (
          window.VITOR_OS_WINDOW_MANAGER &&
          typeof window.VITOR_OS_WINDOW_MANAGER.minimizeWindow === "function"
        ) {
          window.VITOR_OS_WINDOW_MANAGER.minimizeWindow(windowId);
        }
      },
      restoreWindow(windowId) {
        if (
          window.VITOR_OS_WINDOW_MANAGER &&
          typeof window.VITOR_OS_WINDOW_MANAGER.restoreWindow === "function"
        ) {
          window.VITOR_OS_WINDOW_MANAGER.restoreWindow(windowId);
        }
      },
      focusWindow(windowId) {
        if (
          window.VITOR_OS_WINDOW_MANAGER &&
          typeof window.VITOR_OS_WINDOW_MANAGER.focusWindow === "function"
        ) {
          window.VITOR_OS_WINDOW_MANAGER.focusWindow(windowId);
        }
      }
    };
  }

  function init() {
    document.body.classList.add("is-booting");
    cacheElements();
    buildWindowState();
    applyWallpaper();
    exposeAppApi();
    initModules();
  }

  document.addEventListener("DOMContentLoaded", init);
})();