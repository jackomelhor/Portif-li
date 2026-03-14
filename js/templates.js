(function () {
  const TEMPLATES_NAMESPACE = "VITOR_OS_TEMPLATES";

  function getConfig() {
    return window.VITOR_OS_CONFIG || null;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildAboutTemplate() {
    const config = getConfig();
    const about = config?.content?.about;

    if (!about) {
      return `
        <div class="window-section">
          <div class="empty-state">Conteúdo de "Sobre mim" não encontrado.</div>
        </div>
      `;
    }

    const paragraphs = about.text
      .map((line) => {
        if (!line.trim()) return "<br />";
        return `<p class="window-text">${escapeHtml(line)}</p>`;
      })
      .join("");

    return `
      <div class="window-section about-card">
        <h2 class="window-title">${escapeHtml(about.title)}</h2>
        ${paragraphs}
      </div>
    `;
  }

  function buildSkillsTemplate() {
    const config = getConfig();
    const skills = config?.content?.skills || [];

    if (!skills.length) {
      return `
        <div class="window-section">
          <div class="empty-state">Nenhuma skill cadastrada.</div>
        </div>
      `;
    }

    const items = skills
      .map(
        (skill) => `
          <article class="skill-card">
            <img
              class="skill-card__logo"
              src="${escapeHtml(skill.logo)}"
              alt="${escapeHtml(skill.name)}"
            />
            <span class="skill-card__name">${escapeHtml(skill.name)}</span>
          </article>
        `
      )
      .join("");

    return `
      <div class="window-section">
        <h2 class="window-title">Skills</h2>
        <div class="skills-grid">
          ${items}
        </div>
      </div>
    `;
  }

  function buildProjectsTemplate() {
    const config = getConfig();
    const projects = config?.content?.projects || [];

    if (!projects.length) {
      return `
        <div class="window-section">
          <div class="empty-state">Nenhum projeto cadastrado.</div>
        </div>
      `;
    }

    const items = projects
      .map(
        (project) => `
          <article class="project-card" data-project-id="${escapeHtml(project.id)}">
            <img
              class="project-card__preview"
              src="${escapeHtml(project.image)}"
              alt="${escapeHtml(project.name)}"
            />
            <div class="project-card__content">
              <h3 class="project-card__title">${escapeHtml(project.name)}</h3>
              <p class="project-card__description">${escapeHtml(project.description)}</p>
              <div class="project-card__actions">
                <a
                  class="classic-btn"
                  href="${escapeHtml(project.githubUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  class="classic-btn"
                  href="${escapeHtml(project.demoUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Demo
                </a>
              </div>
            </div>
          </article>
        `
      )
      .join("");

    return `
      <div class="window-section">
        <h2 class="window-title">Projetos</h2>
        <p class="window-muted">O primeiro projeto em destaque é o AURUAM. Novos projetos devem ser cadastrados em <strong>js/config.js</strong>, dentro de <strong>content.projects</strong>.</p>
        <div class="projects-list">
          ${items}
        </div>
      </div>
    `;
  }

  function buildContactTemplate() {
    const config = getConfig();
    const contacts = config?.content?.contact || [];

    if (!contacts.length) {
      return `
        <div class="window-section">
          <div class="empty-state">Nenhum contato cadastrado.</div>
        </div>
      `;
    }

    const items = contacts
      .map(
        (contact) => `
          <a
            class="contact-link"
            href="${escapeHtml(contact.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              class="contact-link__icon"
              src="${escapeHtml(contact.icon)}"
              alt="${escapeHtml(contact.name)}"
            />
            <span class="contact-link__label">${escapeHtml(contact.name)}</span>
          </a>
        `
      )
      .join("");

    return `
      <div class="window-section">
        <h2 class="window-title">Contato</h2>
        <div class="contact-grid">
          ${items}
        </div>
      </div>
    `;
  }

  function renderByWindowId(windowId) {
    const config = getConfig();
    if (!config?.windows) return "";

    const entries = Object.entries(config.windows);
    const match = entries.find(([, windowConfig]) => windowConfig.id === windowId);

    if (!match) {
      return `
        <div class="window-section">
          <div class="empty-state">Janela não encontrada.</div>
        </div>
      `;
    }

    const [contentKey] = match;

    switch (contentKey) {
      case "about":
        return buildAboutTemplate();
      case "skills":
        return buildSkillsTemplate();
      case "projects":
        return buildProjectsTemplate();
      case "contact":
        return buildContactTemplate();
      default:
        return `
          <div class="window-section">
            <div class="empty-state">Conteúdo não implementado.</div>
          </div>
        `;
    }
  }

  window[TEMPLATES_NAMESPACE] = {
    renderByWindowId,
    buildAboutTemplate,
    buildSkillsTemplate,
    buildProjectsTemplate,
    buildContactTemplate
  };
})();