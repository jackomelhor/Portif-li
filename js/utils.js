(function () {
  const BOOT_NAMESPACE = "VITOR_OS_BOOT";
  const BOOT_SOUND_EVENTS = ["pointerdown", "keydown"];
  const EXIT_DELAY = 420;

  let initialized = false;
  let bootSoundPlayed = false;

  function getApp() {
    return window.VITOR_OS_APP || null;
  }

  function getConfig() {
    return getApp()?.config || window.VITOR_OS_CONFIG || null;
  }

  function getElements() {
    return getApp()?.elements || null;
  }

  function getUtils() {
    return window.VITOR_OS_UTILS || null;
  }

  function getState() {
    return getApp()?.state || null;
  }

  async function sleep(ms) {
    const utils = getUtils();
    if (utils && typeof utils.sleep === "function") {
      return utils.sleep(ms);
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function playBootSoundOnce() {
    if (bootSoundPlayed) return;
    if (window.VITOR_OS_SOUND && typeof window.VITOR_OS_SOUND.play === "function") {
      if (typeof window.VITOR_OS_SOUND.unlockAudio === "function") {
        window.VITOR_OS_SOUND.unlockAudio();
      }
      window.VITOR_OS_SOUND.play("boot");
      bootSoundPlayed = true;
    }
  }

  function removeBootSoundListeners() {
    BOOT_SOUND_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, playBootSoundOnce, true);
    });
  }

  function bindBootSoundListeners() {
    BOOT_SOUND_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, playBootSoundOnce, true);
    });
  }

  function setTypingMode(mode) {
    const elements = getElements();
    const textEl = elements?.bootText;
    if (!textEl) return;

    textEl.classList.remove("is-typing", "is-waiting");

    if (mode === "typing") {
      textEl.classList.add("is-typing");
    }

    if (mode === "waiting") {
      textEl.classList.add("is-waiting");
    }
  }

  async function typeBootSequence() {
    const config = getConfig();
    const elements = getElements();

    if (!config?.boot || !elements?.bootText) return;

    const { lines, typingSpeed, lineDelay, finalDelay } = config.boot;
    const textEl = elements.bootText;
    textEl.textContent = "";

    setTypingMode("typing");

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];

      for (let charIndex = 0; charIndex < line.length; charIndex += 1) {
        textEl.textContent += line[charIndex];
        await sleep(typingSpeed);
      }

      if (lineIndex < lines.length - 1) {
        textEl.textContent += "\n";
        await sleep(lineDelay);
      }
    }

    await sleep(finalDelay);
    setTypingMode("waiting");
  }

  function revealDesktop() {
    const elements = getElements();
    const state = getState();

    if (!elements?.bootScreen || !elements?.desktopScreen || !state) return;

    state.bootFinished = true;
    elements.desktopScreen.classList.add("is-visible");
    elements.bootScreen.classList.add("is-exiting");

    if (elements.bootHint) {
      elements.bootHint.style.display = "none";
    }

    setTimeout(() => {
      elements.bootScreen.classList.add("is-hidden");
      document.body.classList.remove("is-booting");
      state.desktopReady = true;
      setTypingMode(null);

      if (
        window.VITOR_OS_WINDOW_MANAGER &&
        typeof window.VITOR_OS_WINDOW_MANAGER.restoreFromSavedState === "function"
      ) {
        window.VITOR_OS_WINDOW_MANAGER.restoreFromSavedState();
      }

      if (
        window.VITOR_OS_TASKBAR &&
        typeof window.VITOR_OS_TASKBAR.render === "function"
      ) {
        window.VITOR_OS_TASKBAR.render();
      }
    }, EXIT_DELAY);
  }

  async function startBoot() {
    bindBootSoundListeners();
    await typeBootSequence();
    removeBootSoundListeners();
    revealDesktop();
  }

  function initBoot() {
    if (initialized) return;

    const app = getApp();
    const elements = getElements();
    if (!app || !elements?.bootScreen || !elements?.bootText) {
      window.requestAnimationFrame(initBoot);
      return;
    }

    initialized = true;
    startBoot();
  }

  window[BOOT_NAMESPACE] = {
    init: initBoot
  };
})();