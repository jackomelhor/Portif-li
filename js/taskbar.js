(function () {
  const TASKBAR_NAMESPACE = "VITOR_OS_TASKBAR";
  let initialized = false;

  function getApp() {
    return window.VITOR_OS_APP || null;
  }

  function getState() {
    return getApp()?.state || null;
  }

  function getElements() {
    return getApp()?.elements || null;
  }

  function getWindowManager() {
    return window.VITOR_OS_WINDOW_MANAGER || null;
  }

  function renderEmptyState(container) {
    container.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "taskbar-empty";
    empty.textContent = "Nenhuma janela aberta";
    container.appendChild(empty);
  }

  function createTaskbarButton(windowState) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "taskbar-window";
    button.dataset.windowId = windowState.id;
    button.title = windowState.title;

    if (windowState.isMinimized) {
      button.classList.add("is-minimized");
    }

    const state = getState();
    if (state?.focusedWindowId === windowState.id && !windowState.isMinimized) {
      button.classList.add("is-active");
    }

    const icon = document.createElement("img");
    icon.className = "taskbar-window__icon";
    icon.src = windowState.icon;
    icon.alt = windowState.title;

    const label = document.createElement("span");
    label.className = "taskbar-window__label";
    label.textContent = windowState.title;

    button.appendChild(icon);
    button.appendChild(label);

    button.addEventListener("click", () => {
      if (window.VITOR_OS_SOUND && typeof window.VITOR_OS_SOUND.play === "function") {
        window.VITOR_OS_SOUND.play("click");
      }

      const manager = getWindowManager();
      if (manager && typeof manager.handleTaskbarClick === "function") {
        manager.handleTaskbarClick(windowState.id);
      }
    });

    return button;
  }

  function render() {
    const elements = getElements();
    const state = getState();

    if (!elements?.taskbarWindows || !state?.windows) return;

    const container = elements.taskbarWindows;
    const openWindows = Object.values(state.windows)
      .filter((windowState) => windowState.isOpen)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    if (!openWindows.length) {
      renderEmptyState(container);
      return;
    }

    container.innerHTML = "";

    openWindows.forEach((windowState) => {
      const button = createTaskbarButton(windowState);
      container.appendChild(button);
    });
  }

  function initTaskbar() {
    if (initialized) return;

    const elements = getElements();
    if (!elements?.taskbarWindows) {
      window.requestAnimationFrame(initTaskbar);
      return;
    }

    render();
    initialized = true;
  }

  window[TASKBAR_NAMESPACE] = {
    init: initTaskbar,
    render
  };

  document.addEventListener("DOMContentLoaded", initTaskbar);
})();