(function () {
  const UTILS_NAMESPACE = "VITOR_OS_UTILS";

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function safeParseJSON(value, fallback = {}) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function waitFor(getter, options = {}) {
    const interval = options.interval ?? 50;
    const timeout = options.timeout ?? 4000;

    return new Promise((resolve, reject) => {
      const startedAt = Date.now();

      function check() {
        const result = getter();

        if (result) {
          resolve(result);
          return;
        }

        if (Date.now() - startedAt >= timeout) {
          reject(new Error("Tempo esgotado ao aguardar recurso."));
          return;
        }

        setTimeout(check, interval);
      }

      check();
    });
  }

  function openExternal(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  window[UTILS_NAMESPACE] = {
    sleep,
    clamp,
    safeParseJSON,
    waitFor,
    openExternal
  };
})();