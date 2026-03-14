(function () {
  const DESKTOP_NAMESPACE = "VITOR_OS_DESKTOP";
  let initialized = false;
  let selectedIconId = null;

  function getApp() {
    return window.VITOR_OS_APP || null;
  }

  function getConfig() {
    return getApp()?.config || window.VITOR_OS_CONFIG || null;
  }

  function getElements() {
    return getApp()?.elements || null;
  }

  function playClickSound() {
    if (window.VITOR_OS_SOUND && typeof window.VITOR_OS_SOUND.play === "function") {
      window.VITOR_OS_SOUND.play("click");
    }
  }

  function clearSelection() {
    const elements = getElements();
    if (!elements?.desktopIcons) return;

    selectedIconId = null;
    elements.desktopIcons
      .querySelectorAll(".desktop-icon")
      .forEach((icon) => icon.classList.remove("is-selected"));
  }

  function selectIcon(button, iconId) {
    clearSelection();
    selectedIconId = iconId;
    button.classList.add("is-selected");
  }

  function createDesktopIcon(iconData) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "desktop-icon";
    button.dataset.iconId = iconData.id;
    button.dataset.windowTarget = iconData.windowId;
    button.setAttribute("aria-label", iconData.label);
    button.title = iconData.label;

    const img = document.createElement("img");
    img.className = "desktop-icon__image";
    img.src = iconData.icon;
    img.alt = iconData.label;

    const label = document.createElement("span");
    label.className = "desktop-icon__label";
    label.textContent = iconData.label;

    button.appendChild(img);
    button.appendChild(label);

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      selectIcon(button, iconData.id);
      playClickSound();

      const app = getApp();
      if (app && typeof app.openWindow === "function") {
        app.openWindow(iconData.windowId);
      }
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        button.click();
      }
    });

    return button;
  }

  function renderDesktopIcons() {
    const config = getConfig();
    const elements = getElements();

    if (!config?.desktopIcons || !elements?.desktopIcons) return;

    elements.desktopIcons.innerHTML = "";

    config.desktopIcons.forEach((iconData) => {
      const icon = createDesktopIcon(iconData);
      elements.desktopIcons.appendChild(icon);
    });
  }

  function bindDesktopSurfaceEvents() {
    const elements = getElements();
    if (!elements?.desktopScreen || !elements?.windowsLayer) return;

    elements.desktopScreen.addEventListener("click", (event) => {
      const target = event.target;

      const clickedInsideIcon = target.closest(".desktop-icon");
      const clickedInsideWindow = target.closest(".os-window");
      const clickedTaskbar = target.closest("#taskbar");

      if (!clickedInsideIcon && !clickedInsideWindow && !clickedTaskbar) {
        clearSelection();
      }
    });

    elements.windowsLayer.addEventListener("mousedown", () => {
      clearSelection();
    });
  }

  function markDesktopReady() {
    const elements = getElements();
    if (!elements?.desktopScreen) return;
    elements.desktopScreen.classList.add("is-ready");
  }

  function initDesktop() {
    if (initialized) return;

    const app = getApp();
    const elements = getElements();

    if (!app || !elements?.desktopIcons) {
      window.requestAnimationFrame(initDesktop);
      return;
    }

    renderDesktopIcons();
    bindDesktopSurfaceEvents();
    markDesktopReady();
    initialized = true;
  }

  window[DESKTOP_NAMESPACE] = {
    init: initDesktop,
    renderDesktopIcons,
    clearSelection
  };

  document.addEventListener("DOMContentLoaded", initDesktop);
})();