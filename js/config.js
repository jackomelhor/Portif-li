window.VITOR_OS_CONFIG = {
  system: {
    name: "VITOR SYSTEM",
    version: "v1.0",
    desktopWallpaper: "assets/wallpapers/desktop-bg.png"
  },

  boot: {
    lines: [
      "VITOR SYSTEM v1.0",
      "Initializing hardware...",
      "Loading modules...",
      "Starting desktop interface...",
      "System ready."
    ],
    typingSpeed: 34,
    lineDelay: 240,
    finalDelay: 700
  },

  desktopIcons: [
    {
      id: "about",
      label: "Sobre mim",
      icon: "assets/icons/about.png",
      windowId: "about-window"
    },
    {
      id: "skills",
      label: "Skills",
      icon: "assets/icons/skills.png",
      windowId: "skills-window"
    },
    {
      id: "projects",
      label: "Projetos",
      icon: "assets/icons/projects.png",
      windowId: "projects-window"
    },
    {
      id: "contact",
      label: "Contato",
      icon: "assets/icons/contact.png",
      windowId: "contact-window"
    }
  ],

  windows: {
    about: {
      id: "about-window",
      title: "Sobre mim",
      icon: "assets/icons/window-about.png"
    },
    skills: {
      id: "skills-window",
      title: "Skills",
      icon: "assets/icons/window-skills.png"
    },
    projects: {
      id: "projects-window",
      title: "Projetos",
      icon: "assets/icons/window-projects.png"
    },
    contact: {
      id: "contact-window",
      title: "Contato",
      icon: "assets/icons/window-contact.png"
    }
  },

  content: {
    about: {
      title: "Sobre mim",
      text: [
        "Olá, meu nome é Vítor.",
        "Tenho 16 anos e sou estudante de TI.",
        "",
        "Busco sempre ampliar meus conhecimentos e acredito que a melhor forma de aprender é colocando a mão na massa e desenvolvendo projetos reais."
      ]
    },

    skills: [
      {
        id: "python",
        name: "Python",
        logo: "assets/skills/python.png"
      },
      {
        id: "javascript",
        name: "JavaScript",
        logo: "assets/skills/javascript.png"
      }
    ],

    projects: [
      {
        id: "auruam",
        name: "AURUAM",
        image: "assets/projects/auruam-preview.png",
        description: "Analista de ações que permite ver em tempo real quais são as ações mais valorizadas do mercado e simular como funcionaria sua carteira digital.",
        githubUrl: "https://github.com/",
        demoUrl: "https://example.com/"
      }

      /*
        ADICIONE NOVOS PROJETOS AQUI

        Exemplo de novo projeto:

        ,
        {
          id: "meu-projeto",
          name: "Nome do Projeto",
          image: "assets/projects/meu-projeto-preview.png",
          description: "Descrição do projeto.",
          githubUrl: "https://github.com/seuusuario/repositorio",
          demoUrl: "https://seudominio.com/demo"
        }
      */
    ],

    contact: [
      {
        id: "github",
        name: "GitHub",
        icon: "assets/contacts/github.png",
        url: "https://github.com/jackomelhor"
      },
      {
        id: "instagram",
        name: "Instagram",
        icon: "assets/contacts/instagram.png",
        url: "https://www.instagram.com/vt._rodrxgs"
      }
    ]
  },

  sounds: {
    boot: "sounds/boot.mp3",
    open: "sounds/open.mp3",
    click: "sounds/click.mp3",
    minimize: "sounds/minimize.mp3"
  },

  storageKeys: {
    windowsState: "vitor-os:windows-state",
    bootCompleted: "vitor-os:boot-completed"
  }
};