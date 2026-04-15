(() => {
  'use strict';

  // ─── Utility: HTML Escaping ──────────────────────────────────────
  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str);
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
  }

  // ─── Utility: Simple String Hash ─────────────────────────────────
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }

  // ─── Utility: Generate ID ────────────────────────────────────────
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  // ─── Validation Helpers ──────────────────────────────────────────
  function isValidUrl(str) {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  // ─── Storage Keys ────────────────────────────────────────────────
  const KEYS = {
    hero: 'portfolio_hero',
    about: 'portfolio_about',
    skills: 'portfolio_skills',
    projects: 'portfolio_projects',
    experience: 'portfolio_experience',
    github: 'portfolio_github',
    certifications: 'portfolio_certifications',
    softskills: 'portfolio_softskills',
    references: 'portfolio_references',
    contact: 'portfolio_contact',
    password: 'portfolio_admin_password',
    session: 'portfolio_admin_session',
  };

  // ─── Default Data ────────────────────────────────────────────────
  const DEFAULTS = {
    hero: {
      firstName: 'Samsudeen',
      lastName: 'Ashad',
      subtitle: 'Software Engineering Student | Data Science Enthusiast | Machine Learning | Full-Stack Developer',
      description: "Hello! I'm Samsudeen Ashad, an undergraduate student pursuing a degree in Software Engineering. My journey in technology is fueled by a deep passion for coding and an insatiable curiosity about data science. I thrive in collaborative environments, bringing a warm and friendly personality that helps me work well with others. With a knack for conflict resolution and a keen eye for detail, I am dedicated to understanding the needs of others and providing effective solutions.",
      profileImage: 'assets/images/SamsuddenAshad.jpg',
      cvFile: '../Ashad CV White.pdf',
    },
    about: {
      bio: [
        "Hello! I'm Samsudeen Ashad, an undergraduate student pursuing a degree in Software Engineering at NSBM Green University (2022-2026). My journey in technology is fueled by a deep passion for coding and an insatiable curiosity about data science. I thrive in collaborative environments, bringing a warm and friendly personality that helps me work well with others.",
        'With a knack for conflict resolution and a keen eye for detail, I am dedicated to understanding the needs of others and providing effective solutions. My punctuality, problem-solving abilities, and multitasking skills have consistently made me an integral part of any team, where I contribute to both immediate outcomes and long-term success.',
        "I am particularly enthusiastic about Data Science and Machine Learning, constantly seeking new knowledge and opportunities to grow in these fields. Additionally, I have developed skills in Full-Stack Development, enabling me to build comprehensive and dynamic web applications. I'm fluent in English (Advanced), Sinhala (Native), and Tamil (Native), which enables me to work effectively in diverse, multicultural environments.",
      ],
      stats: [
        { label: 'GitHub Repositories', value: 55 },
        { label: 'GitHub Contributions', value: 561 },
        { label: 'Technologies Mastered', value: 25 },
      ],
    },
    skills: [
      {
        id: 'cat_1',
        title: 'Programming Languages',
        icon: 'fas fa-code',
        items: [
          { name: 'Python', icon: 'fab fa-python', level: 'Advanced' },
          { name: 'Java', icon: 'fab fa-java', level: 'Intermediate' },
          { name: 'C', icon: '', level: 'Intermediate' },
          { name: 'C#', icon: '', level: 'Intermediate' },
          { name: 'C++', icon: '', level: 'Intermediate' },
          { name: 'JavaScript', icon: 'fab fa-js-square', level: 'Advanced' },
          { name: 'PHP', icon: 'fab fa-php', level: 'Intermediate' },
          { name: 'SQL', icon: 'fas fa-database', level: 'Advanced' },
        ],
      },
      {
        id: 'cat_2',
        title: 'Frontend Development',
        icon: 'fas fa-palette',
        items: [
          { name: 'React', icon: 'fab fa-react', level: 'Advanced' },
          { name: 'TypeScript', icon: '', level: 'Intermediate' },
          { name: 'HTML5', icon: 'fab fa-html5', level: 'Expert' },
          { name: 'CSS3', icon: 'fab fa-css3-alt', level: 'Expert' },
          { name: 'Bootstrap', icon: 'fab fa-bootstrap', level: 'Advanced' },
          { name: 'Flutter', icon: 'fas fa-mobile-alt', level: 'Intermediate' },
          { name: 'Figma', icon: 'fab fa-figma', level: 'Advanced' },
        ],
      },
      {
        id: 'cat_3',
        title: 'Backend & Frameworks',
        icon: 'fas fa-server',
        items: [
          { name: 'Node.js', icon: 'fab fa-node-js', level: 'Advanced' },
          { name: 'Express.js', icon: '', level: 'Advanced' },
          { name: 'Flask', icon: 'fas fa-flask', level: 'Intermediate' },
          { name: 'Django', icon: '', level: 'Intermediate' },
          { name: 'FastAPI', icon: 'fas fa-bolt', level: 'Intermediate' },
          { name: '.NET', icon: 'fab fa-microsoft', level: 'Beginner' },
        ],
      },
      {
        id: 'cat_4',
        title: 'Data Science & ML',
        icon: 'fas fa-brain',
        items: [
          { name: 'TensorFlow', icon: '', level: 'Intermediate' },
          { name: 'Scikit-learn', icon: 'fas fa-cogs', level: 'Advanced' },
          { name: 'Pandas', icon: 'fas fa-table', level: 'Advanced' },
          { name: 'NumPy', icon: 'fas fa-calculator', level: 'Advanced' },
          { name: 'Matplotlib', icon: 'fas fa-chart-line', level: 'Advanced' },
          { name: 'Power BI', icon: 'fas fa-chart-pie', level: 'Intermediate' },
        ],
      },
      {
        id: 'cat_5',
        title: 'Databases & Cloud',
        icon: 'fas fa-cloud',
        items: [
          { name: 'MySQL', icon: 'fas fa-database', level: 'Advanced' },
          { name: 'PostgreSQL', icon: 'fas fa-elephant', level: 'Intermediate' },
          { name: 'MongoDB', icon: 'fas fa-leaf', level: 'Intermediate' },
          { name: 'Firebase', icon: 'fas fa-fire', level: 'Intermediate' },
          { name: 'AWS', icon: 'fab fa-aws', level: 'Beginner' },
          { name: 'Azure', icon: 'fab fa-microsoft', level: 'Beginner' },
        ],
      },
      {
        id: 'cat_6',
        title: 'Tools & DevOps',
        icon: 'fas fa-tools',
        items: [
          { name: 'Git', icon: 'fab fa-git-alt', level: 'Advanced' },
          { name: 'GitHub', icon: 'fab fa-github', level: 'Advanced' },
          { name: 'Docker', icon: 'fab fa-docker', level: 'Intermediate' },
          { name: 'JIRA', icon: 'fab fa-jira', level: 'Intermediate' },
          { name: 'WordPress', icon: 'fab fa-wordpress', level: 'Advanced' },
          { name: 'MS Project', icon: 'fas fa-project-diagram', level: 'Intermediate' },
        ],
      },
    ],
    projects: [
      {
        id: 'proj_1',
        title: 'Quizer AI - Quiz Generation Platform',
        description: 'Intelligent quiz generation platform using AI to create personalized quizzes. Features automated question generation, difficulty adjustment, and comprehensive performance analytics. Built with modern web technologies and AI integration.',
        emoji: '🧠',
        techTags: ['HTML', 'CSS', 'JavaScript', 'Python', 'AI/ML'],
        links: [
          { label: 'View Code', url: 'https://github.com/SamsudeenAshad/Quizer-AI-' },
          { label: 'Live Demo', url: 'https://github.com/SamsudeenAshad/Quizer-AI-' },
        ],
      },
      {
        id: 'proj_2',
        title: 'Tea House - Modern Tea Store',
        description: 'A modern, responsive tea store website featuring elegant design, product showcases, and user-friendly navigation. Built with clean HTML, CSS, and JavaScript for optimal performance and user experience.',
        emoji: '🍵',
        techTags: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'UI/UX'],
        links: [
          { label: 'View Code', url: 'https://github.com/SamsudeenAshad/Tea-House' },
          { label: 'Live Demo', url: 'https://github.com/SamsudeenAshad/Tea-House' },
        ],
      },
      {
        id: 'proj_3',
        title: 'Dashboard - Analytics Platform',
        description: 'A comprehensive analytics dashboard featuring data visualization, real-time monitoring, and interactive charts. Built with modern web technologies for efficient data presentation and user interaction.',
        emoji: '📊',
        techTags: ['React', 'Chart.js', 'Node.js', 'Dashboard', 'Data Visualization'],
        links: [
          { label: 'View Code', url: 'https://github.com/SamsudeenAshad/Dashboard' },
          { label: 'Live Demo', url: 'https://github.com/SamsudeenAshad/Dashboard' },
        ],
      },
      {
        id: 'proj_4',
        title: 'MathMaster Quiz Competition Site',
        description: 'Interactive quiz competition platform designed for mathematics competitions. Features real-time scoring, user management, and comprehensive analytics dashboard.',
        emoji: '🎯',
        techTags: ['React', 'Vite', 'TypeScript', 'PostgreSQL', 'Express.js'],
        links: [
          { label: 'View Details', url: 'https://github.com/samsudeenashad' },
          { label: 'View Code', url: 'https://github.com/samsudeenashad' },
        ],
      },
      {
        id: 'proj_5',
        title: 'Business Profile Client',
        description: 'A professional business profile client application designed for managing and showcasing business information. Features client management, profile customization, and responsive design for optimal user experience.',
        emoji: '💼',
        techTags: ['React', 'TypeScript', 'CSS3', 'Business Management', 'Client Portal'],
        links: [
          { label: 'View Code', url: 'https://github.com/SamsudeenAshad/business-profile-client' },
          { label: 'Live Demo', url: 'https://github.com/SamsudeenAshad/business-profile-client' },
        ],
      },
      {
        id: 'proj_6',
        title: 'AI-Tutor - Intelligent Learning Assistant',
        description: 'An intelligent AI-powered tutoring system that provides personalized learning experiences. Features adaptive learning algorithms, real-time feedback, and comprehensive progress tracking for enhanced educational outcomes.',
        emoji: '🤖',
        techTags: ['Python', 'Machine Learning', 'AI/ML', 'Natural Language Processing', 'Education Technology'],
        links: [
          { label: 'View Code', url: 'https://github.com/HexaElite/AI-Tutor' },
          { label: 'Live Demo', url: 'https://github.com/HexaElite/AI-Tutor' },
        ],
      },
      {
        id: 'proj_7',
        title: 'Baminithiya - Disaster Management System',
        description: 'Advanced disaster management system developed for NBQSA Project. Features real-time monitoring, emergency response coordination, and comprehensive disaster preparedness tools. Contributed to frontend design and development.',
        emoji: '🌍',
        techTags: ['React', 'TypeScript', 'Node.js', 'Emergency Management', 'Real-time Systems'],
        links: [
          { label: 'View Code', url: 'https://github.com/Adhishtanaka/Baminithiya' },
          { label: 'TypeScript Version', url: 'https://github.com/SamsudeenAshad/disa' },
        ],
      },
    ],
    experience: [
      {
        id: 'exp_1',
        title: 'BSc (Hons) in Software Engineering',
        organization: 'NSBM Green University',
        dateRange: '2022 - 2026',
        description: "Pursuing Bachelor's degree in Software Engineering with excellent academic performance. Actively participating in coding competitions, technology workshops, and leadership roles within the university.",
      },
      {
        id: 'exp_2',
        title: 'Chief Event Coordinator Executive',
        organization: 'NSBM Islamic Society',
        dateRange: 'Jan 2025 - Present',
        description: 'Leading event coordination and management for the Islamic Society, organizing cultural and educational events, managing teams, and fostering community engagement within the university.',
      },
      {
        id: 'exp_3',
        title: 'Assistant Event Coordinator',
        organization: 'NSBM Mathematics and Statistics Circle',
        dateRange: 'Nov 2024 - Present',
        description: 'Coordinating academic events, workshops, and competitions for mathematics and statistics students. Collaborating with faculty and students to enhance learning experiences.',
      },
      {
        id: 'exp_4',
        title: 'Executive Committee Member',
        organization: 'NSBM Software Engineering Students Association',
        dateRange: 'Jan 2025 - Present',
        description: 'Contributing to strategic planning and execution of association activities. Representing software engineering students and organizing technical workshops and career development programs.',
      },
      {
        id: 'exp_5',
        title: 'Diploma in Business Management',
        organization: 'IMBS Green Campus',
        dateRange: '2024 - 2025',
        description: 'Completed comprehensive business management program focusing on project management, leadership, and strategic planning. Served as CSR Project Chairperson leading community service initiatives.',
      },
      {
        id: 'exp_6',
        title: 'AIESEC Member & EP Manager',
        organization: 'AIESEC in Sri Lanka',
        dateRange: 'Feb 2023 - Nov 2024',
        description: 'Served as Exchange Program Manager (Jun 2023 - Aug 2023) and B2B Team Member (Oct 2023 - Feb 2024). Managed international exchange programs and business partnerships.',
      },
    ],
    github: {
      stats: [
        { value: '55+', label: 'Repositories' },
        { value: '561', label: 'Contributions' },
        { value: '4+', label: 'Organizations' },
        { value: '15+', label: 'Followers' },
      ],
      activities: [
        {
          icon: 'fas fa-code-branch',
          title: 'Recent Commits',
          description: 'Active development on Quizer-AI, Tea-House, and Dashboard projects',
        },
        {
          icon: 'fas fa-users',
          title: 'Collaborations',
          description: 'Contributing to HexaElite/AI-Tutor and Adhishtanaka/Baminithiya',
        },
        {
          icon: 'fas fa-star',
          title: 'GitHub Achievements',
          description: 'Pair Extraordinaire x2, Pull Shark x2, Quickdraw, YOLO',
        },
        {
          icon: 'fas fa-rocket',
          title: 'Latest Projects',
          description: 'TypeScript developments and business profile applications',
        },
      ],
    },
    certifications: [
      {
        id: 'cert_1',
        title: 'GitHub Achievements & Contributions',
        emoji: '🏆',
        items: [
          { title: '561 Contributions in 2024-2025', description: 'Active contributor with consistent coding activity across multiple projects' },
          { title: '55+ GitHub Repositories', description: 'Diverse portfolio of projects in various technologies and domains' },
          { title: 'GitHub Profile Achievements', description: 'Pair Extraordinaire x2, Pull Shark x2, Quickdraw, YOLO' },
          { title: 'Open Source Contributions', description: 'Contributed to HexaElite/AI-Tutor and Adhishtanaka/Baminithiya projects' },
        ],
      },
      {
        id: 'cert_2',
        title: 'Professional Certifications',
        emoji: '📜',
        items: [
          { title: 'Executive Diploma in Business Administration', description: 'IMBS Green Campus' },
          { title: 'Career Skills in Software Development', description: 'Introduction to Software Development' },
          { title: 'Investment Risk Management', description: 'Professional Certification' },
        ],
      },
      {
        id: 'cert_3',
        title: 'AI & Data Science',
        emoji: '🧠',
        items: [
          { title: 'Artificial Intelligence Fundamentals', description: 'AI/ML Certification' },
          { title: 'Introduction to Neural Networks', description: 'Deep Learning Certification' },
          { title: 'Career Essentials in Data Analysis', description: 'Microsoft and LinkedIn' },
        ],
      },
      {
        id: 'cert_4',
        title: 'Business & Management',
        emoji: '💼',
        items: [
          { title: 'Business Analysis & Process Management', description: 'Business Process Optimization' },
          { title: 'PwC Switzerland - Power BI Job Simulation', description: 'Data Visualization & Analytics' },
          { title: 'Project Management Experience', description: 'Multiple leadership roles and project coordination' },
        ],
      },
    ],
    softskills: [
      'Project Management',
      'Public Relations',
      'Teamwork',
      'Time Management',
      'Leadership',
      'Effective Communication',
      'Critical Thinking',
      'Collaboration',
      'Adaptability',
      'Problem Solving',
      'Conflict Resolution',
      'Analytical Thinking',
    ],
    references: [
      {
        id: 'ref_1',
        name: 'Mrs. Hirushi Dilpriya',
        title: 'Lecturer at NSBM Green University',
        email: 'hirushi.d@nsbm.ac.lk',
        phone: '071 564 0820',
      },
      {
        id: 'ref_2',
        name: 'Mr. Anton Jayakody',
        title: 'Lecturer at NSBM Green University',
        email: 'anton.j@nsbm.ac.lk',
        phone: '076 417 778',
      },
    ],
    contact: [
      { icon: 'fas fa-envelope', title: 'Email', value: 'samsudeenashad@gmail.com', link: 'mailto:samsudeenashad@gmail.com', isExternal: false },
      { icon: 'fas fa-phone', title: 'Phone', value: '+94 70 539 0110', link: 'tel:+94705390110', isExternal: false },
      { icon: 'fab fa-github', title: 'GitHub', value: 'github.com/SamsudeenAshad', link: 'https://github.com/SamsudeenAshad', isExternal: true },
      { icon: 'fab fa-linkedin', title: 'LinkedIn', value: 'linkedin.com/in/samsudeen-ashad-90b281255', link: 'https://www.linkedin.com/in/samsudeen-ashad-90b281255', isExternal: true },
      { icon: 'fas fa-map-marker-alt', title: 'Location', value: 'Sri Lanka | Available for Remote Work', link: '', isExternal: false },
      { icon: 'fas fa-globe', title: 'Languages', value: 'English (Advanced), Sinhala (Native), Tamil (Native)', link: '', isExternal: false },
    ],
  };

  // ─── Data Layer ──────────────────────────────────────────────────
  function getData(section) {
    const raw = localStorage.getItem(KEYS[section]);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    return null;
  }

  function setData(section, data) {
    localStorage.setItem(KEYS[section], JSON.stringify(data));
  }

  function initDefaults() {
    Object.keys(DEFAULTS).forEach(key => {
      if (!localStorage.getItem(KEYS[key])) {
        setData(key, DEFAULTS[key]);
      }
    });
    if (!localStorage.getItem(KEYS.password)) {
      localStorage.setItem(KEYS.password, simpleHash('admin123'));
    }
  }

  // ─── Authentication ──────────────────────────────────────────────
  function isAuthenticated() {
    return sessionStorage.getItem(KEYS.session) === 'active';
  }

  function login(password) {
    const stored = localStorage.getItem(KEYS.password);
    if (simpleHash(password) === stored) {
      sessionStorage.setItem(KEYS.session, 'active');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(KEYS.session);
    window.location.reload();
  }

  function changePassword(currentPw, newPw) {
    const stored = localStorage.getItem(KEYS.password);
    if (simpleHash(currentPw) !== stored) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    if (newPw.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }
    localStorage.setItem(KEYS.password, simpleHash(newPw));
    return { success: true, message: 'Password changed successfully!' };
  }

  // ─── Toast System ───────────────────────────────────────────────
  let toastContainer = null;

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.querySelector('.toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
      }
    }
    return toastContainer;
  }

  function showToast(message, type) {
    type = type || 'info';
    const container = getToastContainer();
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle',
      warning: 'fas fa-exclamation-triangle',
    };
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    const iconEl = document.createElement('span');
    iconEl.className = 'toast-icon';
    const iconI = document.createElement('i');
    iconI.className = icons[type] || icons.info;
    iconEl.appendChild(iconI);

    const msgEl = document.createElement('span');
    msgEl.className = 'toast-message';
    msgEl.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.type = 'button';
    const closeI = document.createElement('i');
    closeI.className = 'fas fa-times';
    closeBtn.appendChild(closeI);
    closeBtn.addEventListener('click', () => removeToast(toast));

    toast.appendChild(iconEl);
    toast.appendChild(msgEl);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    setTimeout(() => removeToast(toast), 4000);
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast-exit');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }

  // ─── Modal System ───────────────────────────────────────────────
  let modalOverlay = null;

  function getModalOverlay() {
    if (!modalOverlay) {
      modalOverlay = document.querySelector('.modal-overlay');
      if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = '<div class="modal-card"><div class="modal-header"><h3></h3><button class="modal-close" type="button"><i class="fas fa-times"></i></button></div><div class="modal-body"></div><div class="modal-footer"></div></div>';
        document.body.appendChild(modalOverlay);
      }
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
      const closeBtn = modalOverlay.querySelector('.modal-close');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
    }
    return modalOverlay;
  }

  function openModal(title, bodyHtml, footerHtml) {
    const overlay = getModalOverlay();
    const h3 = overlay.querySelector('.modal-header h3');
    h3.textContent = '';
    h3.textContent = title;
    overlay.querySelector('.modal-body').innerHTML = bodyHtml || '';
    overlay.querySelector('.modal-footer').innerHTML = footerHtml || '';
    overlay.classList.add('active');
  }

  function closeModal() {
    const overlay = getModalOverlay();
    overlay.classList.remove('active');
  }

  function confirmDelete(callback) {
    openModal(
      'Confirm Delete',
      '<p style="color: var(--text-secondary); font-size: 0.9rem;">Are you sure you want to delete this item? This action cannot be undone.</p>',
      '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-danger" type="button" id="modal-confirm-btn"><i class="fas fa-trash"></i> Delete</button>'
    );
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        closeModal();
        callback();
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }
  }

  // ─── Current State ──────────────────────────────────────────────
  let currentSection = 'hero';

  // ─── Navigation ─────────────────────────────────────────────────
  const SECTIONS = [
    { key: 'hero', label: 'Hero Section', icon: 'fas fa-home' },
    { key: 'about', label: 'About', icon: 'fas fa-user' },
    { key: 'skills', label: 'Skills', icon: 'fas fa-code' },
    { key: 'projects', label: 'Projects', icon: 'fas fa-project-diagram' },
    { key: 'experience', label: 'Experience', icon: 'fas fa-briefcase' },
    { key: 'github', label: 'GitHub Profile', icon: 'fab fa-github' },
    { key: 'certifications', label: 'Certifications', icon: 'fas fa-certificate' },
    { key: 'softskills', label: 'Soft Skills', icon: 'fas fa-heart' },
    { key: 'references', label: 'References', icon: 'fas fa-address-book' },
    { key: 'contact', label: 'Contact Info', icon: 'fas fa-envelope' },
    { key: 'settings', label: 'Settings', icon: 'fas fa-cog' },
  ];

  // ─── Render: Login Page ─────────────────────────────────────────
  function renderLoginPage() {
    document.body.innerHTML = '';
    document.body.className = 'login-page';
    const card = document.createElement('div');
    card.className = 'login-card';
    card.innerHTML = [
      '<div class="login-logo">',
      '  <h1>Portfolio Admin</h1>',
      '  <p>Sign in to manage your portfolio</p>',
      '</div>',
      '<div class="login-error" id="login-error">Invalid password. Please try again.</div>',
      '<form class="login-form" id="login-form">',
      '  <div class="form-group">',
      '    <label for="login-password">Password</label>',
      '    <input type="password" id="login-password" placeholder="Enter admin password" autocomplete="current-password" required>',
      '  </div>',
      '  <button type="submit" class="login-btn">Sign In</button>',
      '</form>',
    ].join('\n');
    document.body.appendChild(card);

    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = document.getElementById('login-password').value;
      if (login(pw)) {
        renderAdminPanel();
      } else {
        const errEl = document.getElementById('login-error');
        errEl.classList.add('active');
        setTimeout(() => errEl.classList.remove('active'), 3000);
      }
    });
  }

  // ─── Render: Admin Panel Shell ──────────────────────────────────
  function renderAdminPanel() {
    document.body.className = '';
    document.body.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'admin-wrapper';

    // Sidebar
    const sidebar = document.createElement('aside');
    sidebar.className = 'admin-sidebar';
    sidebar.id = 'admin-sidebar';

    let sidebarHtml = '<div class="sidebar-logo"><div class="logo-icon">SA</div><div class="logo-text"><h2>Admin Panel</h2><span>Portfolio Manager</span></div></div>';
    sidebarHtml += '<nav class="sidebar-nav" id="sidebar-nav"><div class="sidebar-nav-label">Sections</div>';
    SECTIONS.forEach(sec => {
      sidebarHtml += '<a href="#" data-section="' + escapeHtml(sec.key) + '" class="' + (sec.key === currentSection ? 'active' : '') + '"><i class="' + escapeHtml(sec.icon) + '"></i> ' + escapeHtml(sec.label) + '</a>';
    });
    sidebarHtml += '</nav>';
    sidebarHtml += '<div class="sidebar-footer"><button class="logout-btn" type="button" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button></div>';
    sidebar.innerHTML = sidebarHtml;

    // Sidebar overlay for mobile
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    sidebarOverlay.id = 'sidebar-overlay';

    // Main area
    const main = document.createElement('div');
    main.className = 'admin-main';

    // Header
    const header = document.createElement('header');
    header.className = 'admin-header';
    header.innerHTML = [
      '<div class="header-left">',
      '  <button class="hamburger-btn" type="button" id="hamburger-btn"><i class="fas fa-bars"></i></button>',
      '  <div class="header-title"><h1 id="header-title">Hero Section</h1><p id="header-subtitle">Manage your portfolio content</p></div>',
      '</div>',
      '<div class="header-right">',
      '  <div class="header-avatar" id="header-avatar">SA</div>',
      '</div>',
    ].join('\n');

    // Content area
    const content = document.createElement('div');
    content.className = 'admin-content';
    content.id = 'admin-content';

    main.appendChild(header);
    main.appendChild(content);
    wrapper.appendChild(sidebar);
    wrapper.appendChild(sidebarOverlay);
    wrapper.appendChild(main);
    document.body.appendChild(wrapper);

    // Event: sidebar nav
    const navLinks = sidebar.querySelectorAll('[data-section]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sec = link.getAttribute('data-section');
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        currentSection = sec;
        const sectionObj = SECTIONS.find(s => s.key === sec);
        document.getElementById('header-title').textContent = sectionObj ? sectionObj.label : sec;
        renderSection(sec);
        // Close mobile sidebar
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      });
    });

    // Event: logout
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Event: hamburger (mobile)
    document.getElementById('hamburger-btn').addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });

    renderSection(currentSection);
  }

  // ─── Render Section Router ──────────────────────────────────────
  function renderSection(section) {
    const content = document.getElementById('admin-content');
    if (!content) return;
    content.innerHTML = '';

    const renderers = {
      hero: renderHeroSection,
      about: renderAboutSection,
      skills: renderSkillsSection,
      projects: renderProjectsSection,
      experience: renderExperienceSection,
      github: renderGithubSection,
      certifications: renderCertificationsSection,
      softskills: renderSoftSkillsSection,
      references: renderReferencesSection,
      contact: renderContactSection,
      settings: renderSettingsSection,
    };

    const renderer = renderers[section];
    if (renderer) {
      renderer(content);
    } else {
      content.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-question"></i></div><h3>Section not found</h3></div>';
    }
  }

  // ─── Helper: Build Section Card ─────────────────────────────────
  function buildSectionCard(titleText, iconClass, count) {
    const card = document.createElement('div');
    card.className = 'section-card';
    const header = document.createElement('div');
    header.className = 'section-card-header';
    let headerHtml = '<h2><i class="' + escapeHtml(iconClass) + '"></i> ' + escapeHtml(titleText) + '</h2>';
    if (count !== undefined) {
      headerHtml += '<span class="item-count">' + escapeHtml(String(count)) + ' items</span>';
    }
    header.innerHTML = headerHtml;
    card.appendChild(header);
    return card;
  }

  // ─── Helper: Build Add Button ───────────────────────────────────
  function buildAddButton(label, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary btn-sm';
    const icon = document.createElement('i');
    icon.className = 'fas fa-plus';
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(' ' + label));
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ─── Helper: Build Table Actions ────────────────────────────────
  function buildTableActions(onEdit, onDelete) {
    const div = document.createElement('div');
    div.className = 'table-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-icon btn-edit';
    editBtn.title = 'Edit';
    const editI = document.createElement('i');
    editI.className = 'fas fa-pen';
    editBtn.appendChild(editI);
    editBtn.addEventListener('click', onEdit);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn btn-icon btn-delete';
    delBtn.title = 'Delete';
    const delI = document.createElement('i');
    delI.className = 'fas fa-trash';
    delBtn.appendChild(delI);
    delBtn.addEventListener('click', onDelete);

    div.appendChild(editBtn);
    div.appendChild(delBtn);
    return div;
  }

  // ─── Helper: Build Form Field HTML ──────────────────────────────
  function formField(id, label, type, value, placeholder, extra) {
    extra = extra || {};
    const isTextarea = type === 'textarea';
    const isSelect = type === 'select';
    const cls = extra.fullWidth ? 'form-group full-width' : 'form-group';
    let html = '<div class="' + cls + '">';
    html += '<label class="form-label" for="' + escapeHtml(id) + '">' + escapeHtml(label) + (extra.required ? ' *' : '') + '</label>';
    if (isTextarea) {
      html += '<textarea class="form-textarea" id="' + escapeHtml(id) + '" placeholder="' + escapeHtml(placeholder || '') + '" rows="' + (extra.rows || 4) + '">' + escapeHtml(value || '') + '</textarea>';
    } else if (isSelect) {
      html += '<select class="form-select" id="' + escapeHtml(id) + '">';
      (extra.options || []).forEach(opt => {
        html += '<option value="' + escapeHtml(opt) + '"' + (opt === value ? ' selected' : '') + '>' + escapeHtml(opt) + '</option>';
      });
      html += '</select>';
    } else {
      html += '<input class="form-input" type="' + escapeHtml(type || 'text') + '" id="' + escapeHtml(id) + '" value="' + escapeHtml(value || '') + '" placeholder="' + escapeHtml(placeholder || '') + '">';
    }
    if (extra.hint) {
      html += '<span class="form-hint">' + escapeHtml(extra.hint) + '</span>';
    }
    html += '</div>';
    return html;
  }

  // ─── Helper: Validate Required Fields ───────────────────────────
  function validateFields(fields) {
    let valid = true;
    const errors = [];
    fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (!el) return;
      const val = el.value.trim();
      el.classList.remove('error');
      if (f.required && !val) {
        el.classList.add('error');
        errors.push(f.label + ' is required.');
        valid = false;
      }
      if (f.type === 'url' && val && !isValidUrl(val)) {
        el.classList.add('error');
        errors.push(f.label + ' must be a valid URL.');
        valid = false;
      }
      if (f.type === 'email' && val && !isValidEmail(val)) {
        el.classList.add('error');
        errors.push(f.label + ' must be a valid email.');
        valid = false;
      }
    });
    if (!valid) {
      showToast(errors[0], 'error');
    }
    return valid;
  }

  // ═══════════════════════════════════════════════════════════════
  //  SECTION RENDERERS
  // ═══════════════════════════════════════════════════════════════

  // ─── Hero Section ───────────────────────────────────────────────
  function renderHeroSection(container) {
    const data = getData('hero') || DEFAULTS.hero;
    const card = buildSectionCard('Hero Section', 'fas fa-home');
    const body = document.createElement('div');
    body.innerHTML = [
      '<form class="admin-form" id="hero-form">',
      '  <div class="form-row">',
      formField('hero-firstName', 'First Name', 'text', data.firstName, 'First name', { required: true }),
      formField('hero-lastName', 'Last Name', 'text', data.lastName, 'Last name', { required: true }),
      '  </div>',
      formField('hero-subtitle', 'Subtitle', 'text', data.subtitle, 'Your subtitle / tagline', { required: true, fullWidth: true }),
      formField('hero-description', 'Description', 'textarea', data.description, 'Brief description about yourself', { required: true, fullWidth: true, rows: 5 }),
      '  <div class="form-row">',
      formField('hero-profileImage', 'Profile Image URL', 'text', data.profileImage, 'Path or URL to profile image'),
      formField('hero-cvFile', 'CV File Path', 'text', data.cvFile, 'Path or URL to CV file'),
      '  </div>',
      '  <div class="form-actions">',
      '    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>',
      '  </div>',
      '</form>',
    ].join('\n');
    card.appendChild(body);
    container.appendChild(card);

    document.getElementById('hero-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [
        { id: 'hero-firstName', label: 'First Name', required: true },
        { id: 'hero-lastName', label: 'Last Name', required: true },
        { id: 'hero-subtitle', label: 'Subtitle', required: true },
        { id: 'hero-description', label: 'Description', required: true },
      ];
      if (!validateFields(fields)) return;
      const updated = {
        firstName: document.getElementById('hero-firstName').value.trim(),
        lastName: document.getElementById('hero-lastName').value.trim(),
        subtitle: document.getElementById('hero-subtitle').value.trim(),
        description: document.getElementById('hero-description').value.trim(),
        profileImage: document.getElementById('hero-profileImage').value.trim(),
        cvFile: document.getElementById('hero-cvFile').value.trim(),
      };
      setData('hero', updated);
      showToast('Hero section saved!', 'success');
    });
  }

  // ─── About Section ──────────────────────────────────────────────
  function renderAboutSection(container) {
    const data = getData('about') || DEFAULTS.about;

    // Bio card
    const bioCard = buildSectionCard('Bio Paragraphs', 'fas fa-align-left', data.bio.length);
    const bioBody = document.createElement('div');
    const addBioBtn = buildAddButton('Add Paragraph', () => openBioModal(-1, data));
    bioCard.querySelector('.section-card-header').appendChild(addBioBtn);

    if (data.bio.length === 0) {
      bioBody.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-paragraph"></i></div><h3>No bio paragraphs</h3><p>Add some paragraphs about yourself.</p></div>';
    } else {
      let tableHtml = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>#</th><th>Paragraph</th><th>Actions</th></tr></thead><tbody>';
      data.bio.forEach((p, i) => {
        tableHtml += '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(p.substring(0, 120)) + (p.length > 120 ? '...' : '') + '</td><td><div class="table-actions" data-bio-idx="' + i + '"></div></td></tr>';
      });
      tableHtml += '</tbody></table></div>';
      bioBody.innerHTML = tableHtml;
    }
    bioCard.appendChild(bioBody);
    container.appendChild(bioCard);

    // Attach bio action listeners
    bioBody.querySelectorAll('[data-bio-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-bio-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openBioModal(idx, data),
        () => confirmDelete(() => { data.bio.splice(idx, 1); setData('about', data); showToast('Paragraph deleted.', 'success'); renderSection('about'); })
      ));
    });

    // Stats card
    const statsCard = buildSectionCard('Stats', 'fas fa-chart-bar', data.stats.length);
    const addStatBtn = buildAddButton('Add Stat', () => openStatModal(-1, data));
    statsCard.querySelector('.section-card-header').appendChild(addStatBtn);
    const statsBody = document.createElement('div');

    if (data.stats.length === 0) {
      statsBody.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-chart-bar"></i></div><h3>No stats</h3></div>';
    } else {
      let stHtml = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>Label</th><th>Value</th><th>Actions</th></tr></thead><tbody>';
      data.stats.forEach((s, i) => {
        stHtml += '<tr><td>' + escapeHtml(s.label) + '</td><td>' + escapeHtml(String(s.value)) + '</td><td><div class="table-actions" data-stat-idx="' + i + '"></div></td></tr>';
      });
      stHtml += '</tbody></table></div>';
      statsBody.innerHTML = stHtml;
    }
    statsCard.appendChild(statsBody);
    container.appendChild(statsCard);

    statsBody.querySelectorAll('[data-stat-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-stat-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openStatModal(idx, data),
        () => confirmDelete(() => { data.stats.splice(idx, 1); setData('about', data); showToast('Stat deleted.', 'success'); renderSection('about'); })
      ));
    });
  }

  function openBioModal(idx, data) {
    const isNew = idx < 0;
    const val = isNew ? '' : data.bio[idx];
    const bodyHtml = '<form class="admin-form" id="bio-form">' +
      formField('bio-text', 'Paragraph', 'textarea', val, 'Enter paragraph text', { required: true, fullWidth: true, rows: 6 }) +
      '</form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Paragraph' : 'Edit Paragraph', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      const text = document.getElementById('bio-text').value.trim();
      if (!text) { showToast('Paragraph text is required.', 'error'); return; }
      if (isNew) { data.bio.push(text); } else { data.bio[idx] = text; }
      setData('about', data);
      closeModal();
      showToast(isNew ? 'Paragraph added!' : 'Paragraph updated!', 'success');
      renderSection('about');
    });
  }

  function openStatModal(idx, data) {
    const isNew = idx < 0;
    const stat = isNew ? { label: '', value: '' } : data.stats[idx];
    const bodyHtml = '<form class="admin-form" id="stat-form"><div class="form-row">' +
      formField('stat-label', 'Label', 'text', stat.label, 'e.g. GitHub Repositories', { required: true }) +
      formField('stat-value', 'Value', 'text', String(stat.value), 'e.g. 55', { required: true }) +
      '</div></form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Stat' : 'Edit Stat', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([
        { id: 'stat-label', label: 'Label', required: true },
        { id: 'stat-value', label: 'Value', required: true },
      ])) return;
      const newStat = {
        label: document.getElementById('stat-label').value.trim(),
        value: document.getElementById('stat-value').value.trim(),
      };
      const numVal = Number(newStat.value);
      if (!isNaN(numVal)) newStat.value = numVal;
      if (isNew) { data.stats.push(newStat); } else { data.stats[idx] = newStat; }
      setData('about', data);
      closeModal();
      showToast(isNew ? 'Stat added!' : 'Stat updated!', 'success');
      renderSection('about');
    });
  }

  // ─── Skills Section ─────────────────────────────────────────────
  function renderSkillsSection(container) {
    const data = getData('skills') || DEFAULTS.skills;
    const totalItems = data.reduce((sum, c) => sum + c.items.length, 0);
    const card = buildSectionCard('Skills & Technologies', 'fas fa-code', totalItems);
    const addCatBtn = buildAddButton('Add Category', () => openSkillCategoryModal(-1, data));
    card.querySelector('.section-card-header').appendChild(addCatBtn);

    const body = document.createElement('div');

    data.forEach((cat, ci) => {
      const catDiv = document.createElement('div');
      catDiv.style.cssText = 'margin-bottom:1.5rem;padding:1rem;background:rgba(255,255,255,0.02);border-radius:var(--radius-md);border:1px solid var(--glass-border);';

      let catHeader = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">';
      catHeader += '<h3 style="font-size:0.95rem;color:var(--text-primary);display:flex;align-items:center;gap:0.5rem;"><i class="' + escapeHtml(cat.icon) + '"></i> ' + escapeHtml(cat.title) + ' <span style="font-size:0.7rem;color:var(--text-muted);">(' + cat.items.length + ' skills)</span></h3>';
      catHeader += '<div class="table-actions" data-cat-idx="' + ci + '"></div>';
      catHeader += '</div>';

      let tableHtml = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>Skill</th><th>Icon</th><th>Level</th><th>Actions</th></tr></thead><tbody>';
      cat.items.forEach((item, si) => {
        tableHtml += '<tr><td>' + escapeHtml(item.name) + '</td><td>' + (item.icon ? '<i class="' + escapeHtml(item.icon) + '"></i> ' + escapeHtml(item.icon) : '<em>custom</em>') + '</td><td>' + escapeHtml(item.level) + '</td><td><div class="table-actions" data-cat="' + ci + '" data-skill="' + si + '"></div></td></tr>';
      });
      tableHtml += '</tbody></table></div>';

      catDiv.innerHTML = catHeader + tableHtml;

      // Add skill button
      const addSkillBtn = document.createElement('button');
      addSkillBtn.type = 'button';
      addSkillBtn.className = 'btn btn-sm btn-success';
      addSkillBtn.style.marginTop = '0.5rem';
      const plusI = document.createElement('i');
      plusI.className = 'fas fa-plus';
      addSkillBtn.appendChild(plusI);
      addSkillBtn.appendChild(document.createTextNode(' Add Skill'));
      addSkillBtn.addEventListener('click', () => openSkillItemModal(ci, -1, data));
      catDiv.appendChild(addSkillBtn);

      body.appendChild(catDiv);
    });

    card.appendChild(body);
    container.appendChild(card);

    // Attach category action listeners
    body.querySelectorAll('[data-cat-idx]').forEach(actDiv => {
      const ci = parseInt(actDiv.getAttribute('data-cat-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openSkillCategoryModal(ci, data),
        () => confirmDelete(() => { data.splice(ci, 1); setData('skills', data); showToast('Category deleted.', 'success'); renderSection('skills'); })
      ));
    });

    // Attach skill item action listeners
    body.querySelectorAll('[data-cat][data-skill]').forEach(actDiv => {
      const ci = parseInt(actDiv.getAttribute('data-cat'), 10);
      const si = parseInt(actDiv.getAttribute('data-skill'), 10);
      actDiv.appendChild(buildTableActions(
        () => openSkillItemModal(ci, si, data),
        () => confirmDelete(() => { data[ci].items.splice(si, 1); setData('skills', data); showToast('Skill deleted.', 'success'); renderSection('skills'); })
      ));
    });
  }

  function openSkillCategoryModal(idx, data) {
    const isNew = idx < 0;
    const cat = isNew ? { title: '', icon: 'fas fa-code', items: [] } : data[idx];
    const bodyHtml = '<form class="admin-form" id="cat-form"><div class="form-row">' +
      formField('cat-title', 'Category Title', 'text', cat.title, 'e.g. Programming Languages', { required: true }) +
      formField('cat-icon', 'Icon Class', 'text', cat.icon, 'e.g. fas fa-code', { hint: 'FontAwesome class' }) +
      '</div></form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Category' : 'Edit Category', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([{ id: 'cat-title', label: 'Title', required: true }])) return;
      const updated = {
        id: isNew ? generateId() : (cat.id || generateId()),
        title: document.getElementById('cat-title').value.trim(),
        icon: document.getElementById('cat-icon').value.trim() || 'fas fa-code',
        items: isNew ? [] : cat.items,
      };
      if (isNew) { data.push(updated); } else { data[idx] = updated; }
      setData('skills', data);
      closeModal();
      showToast(isNew ? 'Category added!' : 'Category updated!', 'success');
      renderSection('skills');
    });
  }

  function openSkillItemModal(catIdx, skillIdx, data) {
    const isNew = skillIdx < 0;
    const item = isNew ? { name: '', icon: '', level: 'Intermediate' } : data[catIdx].items[skillIdx];
    const bodyHtml = '<form class="admin-form" id="skill-form">' +
      formField('skill-name', 'Skill Name', 'text', item.name, 'e.g. Python', { required: true, fullWidth: true }) +
      '<div class="form-row">' +
      formField('skill-icon', 'Icon Class', 'text', item.icon, 'e.g. fab fa-python', { hint: 'Leave empty for custom text icon' }) +
      formField('skill-level', 'Level', 'select', item.level, '', { options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }) +
      '</div></form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Skill' : 'Edit Skill', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([{ id: 'skill-name', label: 'Skill Name', required: true }])) return;
      const updated = {
        name: document.getElementById('skill-name').value.trim(),
        icon: document.getElementById('skill-icon').value.trim(),
        level: document.getElementById('skill-level').value,
      };
      if (isNew) { data[catIdx].items.push(updated); } else { data[catIdx].items[skillIdx] = updated; }
      setData('skills', data);
      closeModal();
      showToast(isNew ? 'Skill added!' : 'Skill updated!', 'success');
      renderSection('skills');
    });
  }

  // ─── Projects Section ───────────────────────────────────────────
  function renderProjectsSection(container) {
    const data = getData('projects') || DEFAULTS.projects;
    const card = buildSectionCard('Featured Projects', 'fas fa-project-diagram', data.length);
    const addBtn = buildAddButton('Add Project', () => openProjectModal(-1, data));
    card.querySelector('.section-card-header').appendChild(addBtn);

    const body = document.createElement('div');
    if (data.length === 0) {
      body.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-folder-open"></i></div><h3>No projects yet</h3><p>Add your first project.</p></div>';
    } else {
      let html = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th></th><th>Title</th><th>Tags</th><th>Links</th><th>Actions</th></tr></thead><tbody>';
      data.forEach((p, i) => {
        const tags = (p.techTags || []).map(t => escapeHtml(t)).join(', ');
        html += '<tr><td>' + escapeHtml(p.emoji || '') + '</td><td>' + escapeHtml(p.title) + '</td><td style="font-size:0.8rem;">' + tags + '</td><td>' + (p.links || []).length + '</td><td><div class="table-actions" data-proj-idx="' + i + '"></div></td></tr>';
      });
      html += '</tbody></table></div>';
      body.innerHTML = html;
    }
    card.appendChild(body);
    container.appendChild(card);

    body.querySelectorAll('[data-proj-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-proj-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openProjectModal(idx, data),
        () => confirmDelete(() => { data.splice(idx, 1); setData('projects', data); showToast('Project deleted.', 'success'); renderSection('projects'); })
      ));
    });
  }

  function openProjectModal(idx, data) {
    const isNew = idx < 0;
    const proj = isNew ? { title: '', description: '', emoji: '', techTags: [], links: [] } : data[idx];
    const tagsStr = (proj.techTags || []).join(', ');
    const linksHtml = (proj.links || []).map((l, li) =>
      '<div class="form-row" style="margin-bottom:0.5rem;">' +
      formField('link-label-' + li, 'Label', 'text', l.label, 'e.g. View Code') +
      formField('link-url-' + li, 'URL', 'text', l.url, 'https://...') +
      '</div>'
    ).join('');

    const linkCount = (proj.links || []).length;

    const bodyHtml = '<form class="admin-form" id="proj-form">' +
      '<div class="form-row">' +
      formField('proj-title', 'Title', 'text', proj.title, 'Project title', { required: true }) +
      formField('proj-emoji', 'Emoji', 'text', proj.emoji, 'e.g. 🧠') +
      '</div>' +
      formField('proj-desc', 'Description', 'textarea', proj.description, 'Project description', { required: true, fullWidth: true, rows: 4 }) +
      formField('proj-tags', 'Tech Tags (comma separated)', 'text', tagsStr, 'React, Node.js, Python', { fullWidth: true }) +
      '<div style="margin-top:0.5rem;"><label class="form-label">Links</label><div id="proj-links-container">' + linksHtml + '</div>' +
      '<button type="button" class="btn btn-sm btn-success" id="add-link-btn" style="margin-top:0.5rem;"><i class="fas fa-plus"></i> Add Link</button></div>' +
      '<input type="hidden" id="proj-link-count" value="' + linkCount + '">' +
      '</form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Project' : 'Edit Project', bodyHtml, footerHtml);

    let lc = linkCount;
    document.getElementById('add-link-btn').addEventListener('click', () => {
      const cont = document.getElementById('proj-links-container');
      const div = document.createElement('div');
      div.className = 'form-row';
      div.style.marginBottom = '0.5rem';
      div.innerHTML = formField('link-label-' + lc, 'Label', 'text', '', 'e.g. View Code') +
        formField('link-url-' + lc, 'URL', 'text', '', 'https://...');
      cont.appendChild(div);
      lc++;
      document.getElementById('proj-link-count').value = lc;
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([
        { id: 'proj-title', label: 'Title', required: true },
        { id: 'proj-desc', label: 'Description', required: true },
      ])) return;

      const currentLc = parseInt(document.getElementById('proj-link-count').value, 10);
      const links = [];
      for (let li = 0; li < currentLc; li++) {
        const labelEl = document.getElementById('link-label-' + li);
        const urlEl = document.getElementById('link-url-' + li);
        if (labelEl && urlEl) {
          const lbl = labelEl.value.trim();
          const url = urlEl.value.trim();
          if (lbl && url) {
            if (!isValidUrl(url)) {
              showToast('Link "' + lbl + '" has an invalid URL.', 'error');
              return;
            }
            links.push({ label: lbl, url: url });
          }
        }
      }

      const updated = {
        id: isNew ? generateId() : (proj.id || generateId()),
        title: document.getElementById('proj-title').value.trim(),
        description: document.getElementById('proj-desc').value.trim(),
        emoji: document.getElementById('proj-emoji').value.trim(),
        techTags: document.getElementById('proj-tags').value.split(',').map(s => s.trim()).filter(Boolean),
        links: links,
      };
      if (isNew) { data.push(updated); } else { data[idx] = updated; }
      setData('projects', data);
      closeModal();
      showToast(isNew ? 'Project added!' : 'Project updated!', 'success');
      renderSection('projects');
    });
  }

  // ─── Experience Section ─────────────────────────────────────────
  function renderExperienceSection(container) {
    const data = getData('experience') || DEFAULTS.experience;
    const card = buildSectionCard('Experience & Education', 'fas fa-briefcase', data.length);
    const addBtn = buildAddButton('Add Entry', () => openExperienceModal(-1, data));
    card.querySelector('.section-card-header').appendChild(addBtn);

    const body = document.createElement('div');
    if (data.length === 0) {
      body.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-briefcase"></i></div><h3>No entries yet</h3></div>';
    } else {
      let html = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>Title</th><th>Organization</th><th>Date Range</th><th>Actions</th></tr></thead><tbody>';
      data.forEach((e, i) => {
        html += '<tr><td>' + escapeHtml(e.title) + '</td><td>' + escapeHtml(e.organization) + '</td><td>' + escapeHtml(e.dateRange) + '</td><td><div class="table-actions" data-exp-idx="' + i + '"></div></td></tr>';
      });
      html += '</tbody></table></div>';
      body.innerHTML = html;
    }
    card.appendChild(body);
    container.appendChild(card);

    body.querySelectorAll('[data-exp-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-exp-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openExperienceModal(idx, data),
        () => confirmDelete(() => { data.splice(idx, 1); setData('experience', data); showToast('Entry deleted.', 'success'); renderSection('experience'); })
      ));
    });
  }

  function openExperienceModal(idx, data) {
    const isNew = idx < 0;
    const entry = isNew ? { title: '', organization: '', dateRange: '', description: '' } : data[idx];
    const bodyHtml = '<form class="admin-form" id="exp-form">' +
      formField('exp-title', 'Title', 'text', entry.title, 'e.g. BSc in Software Engineering', { required: true, fullWidth: true }) +
      '<div class="form-row">' +
      formField('exp-org', 'Organization', 'text', entry.organization, 'e.g. NSBM Green University', { required: true }) +
      formField('exp-date', 'Date Range', 'text', entry.dateRange, 'e.g. 2022 - 2026', { required: true }) +
      '</div>' +
      formField('exp-desc', 'Description', 'textarea', entry.description, 'Describe your role and achievements', { required: true, fullWidth: true, rows: 4 }) +
      '</form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Experience' : 'Edit Experience', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([
        { id: 'exp-title', label: 'Title', required: true },
        { id: 'exp-org', label: 'Organization', required: true },
        { id: 'exp-date', label: 'Date Range', required: true },
        { id: 'exp-desc', label: 'Description', required: true },
      ])) return;
      const updated = {
        id: isNew ? generateId() : (entry.id || generateId()),
        title: document.getElementById('exp-title').value.trim(),
        organization: document.getElementById('exp-org').value.trim(),
        dateRange: document.getElementById('exp-date').value.trim(),
        description: document.getElementById('exp-desc').value.trim(),
      };
      if (isNew) { data.push(updated); } else { data[idx] = updated; }
      setData('experience', data);
      closeModal();
      showToast(isNew ? 'Entry added!' : 'Entry updated!', 'success');
      renderSection('experience');
    });
  }

  // ─── GitHub Profile Section ─────────────────────────────────────
  function renderGithubSection(container) {
    const data = getData('github') || DEFAULTS.github;

    // Stats card
    const statsCard = buildSectionCard('GitHub Stats', 'fas fa-chart-bar', data.stats.length);
    const addStatBtn = buildAddButton('Add Stat', () => openGhStatModal(-1, data));
    statsCard.querySelector('.section-card-header').appendChild(addStatBtn);
    const statsBody = document.createElement('div');

    if (data.stats.length === 0) {
      statsBody.innerHTML = '<div class="empty-state"><h3>No stats</h3></div>';
    } else {
      let html = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>Value</th><th>Label</th><th>Actions</th></tr></thead><tbody>';
      data.stats.forEach((s, i) => {
        html += '<tr><td>' + escapeHtml(String(s.value)) + '</td><td>' + escapeHtml(s.label) + '</td><td><div class="table-actions" data-ghstat-idx="' + i + '"></div></td></tr>';
      });
      html += '</tbody></table></div>';
      statsBody.innerHTML = html;
    }
    statsCard.appendChild(statsBody);
    container.appendChild(statsCard);

    statsBody.querySelectorAll('[data-ghstat-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-ghstat-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openGhStatModal(idx, data),
        () => confirmDelete(() => { data.stats.splice(idx, 1); setData('github', data); showToast('Stat deleted.', 'success'); renderSection('github'); })
      ));
    });

    // Activities card
    const actCard = buildSectionCard('Activity Highlights', 'fas fa-bolt', data.activities.length);
    const addActBtn = buildAddButton('Add Activity', () => openGhActivityModal(-1, data));
    actCard.querySelector('.section-card-header').appendChild(addActBtn);
    const actBody = document.createElement('div');

    if (data.activities.length === 0) {
      actBody.innerHTML = '<div class="empty-state"><h3>No activities</h3></div>';
    } else {
      let html = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>Icon</th><th>Title</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
      data.activities.forEach((a, i) => {
        html += '<tr><td><i class="' + escapeHtml(a.icon) + '"></i></td><td>' + escapeHtml(a.title) + '</td><td>' + escapeHtml(a.description.substring(0, 80)) + '</td><td><div class="table-actions" data-ghact-idx="' + i + '"></div></td></tr>';
      });
      html += '</tbody></table></div>';
      actBody.innerHTML = html;
    }
    actCard.appendChild(actBody);
    container.appendChild(actCard);

    actBody.querySelectorAll('[data-ghact-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-ghact-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openGhActivityModal(idx, data),
        () => confirmDelete(() => { data.activities.splice(idx, 1); setData('github', data); showToast('Activity deleted.', 'success'); renderSection('github'); })
      ));
    });
  }

  function openGhStatModal(idx, data) {
    const isNew = idx < 0;
    const stat = isNew ? { value: '', label: '' } : data.stats[idx];
    const bodyHtml = '<form class="admin-form" id="ghstat-form"><div class="form-row">' +
      formField('ghstat-value', 'Value', 'text', String(stat.value), 'e.g. 55+', { required: true }) +
      formField('ghstat-label', 'Label', 'text', stat.label, 'e.g. Repositories', { required: true }) +
      '</div></form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Stat' : 'Edit Stat', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([
        { id: 'ghstat-value', label: 'Value', required: true },
        { id: 'ghstat-label', label: 'Label', required: true },
      ])) return;
      const updated = {
        value: document.getElementById('ghstat-value').value.trim(),
        label: document.getElementById('ghstat-label').value.trim(),
      };
      if (isNew) { data.stats.push(updated); } else { data.stats[idx] = updated; }
      setData('github', data);
      closeModal();
      showToast(isNew ? 'Stat added!' : 'Stat updated!', 'success');
      renderSection('github');
    });
  }

  function openGhActivityModal(idx, data) {
    const isNew = idx < 0;
    const act = isNew ? { icon: 'fas fa-code-branch', title: '', description: '' } : data.activities[idx];
    const bodyHtml = '<form class="admin-form" id="ghact-form">' +
      '<div class="form-row">' +
      formField('ghact-title', 'Title', 'text', act.title, 'e.g. Recent Commits', { required: true }) +
      formField('ghact-icon', 'Icon Class', 'text', act.icon, 'e.g. fas fa-code-branch') +
      '</div>' +
      formField('ghact-desc', 'Description', 'textarea', act.description, 'Activity description', { required: true, fullWidth: true, rows: 3 }) +
      '</form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Activity' : 'Edit Activity', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([
        { id: 'ghact-title', label: 'Title', required: true },
        { id: 'ghact-desc', label: 'Description', required: true },
      ])) return;
      const updated = {
        icon: document.getElementById('ghact-icon').value.trim() || 'fas fa-code-branch',
        title: document.getElementById('ghact-title').value.trim(),
        description: document.getElementById('ghact-desc').value.trim(),
      };
      if (isNew) { data.activities.push(updated); } else { data.activities[idx] = updated; }
      setData('github', data);
      closeModal();
      showToast(isNew ? 'Activity added!' : 'Activity updated!', 'success');
      renderSection('github');
    });
  }

  // ─── Certifications Section ─────────────────────────────────────
  function renderCertificationsSection(container) {
    const data = getData('certifications') || DEFAULTS.certifications;
    const totalItems = data.reduce((sum, c) => sum + c.items.length, 0);
    const card = buildSectionCard('Certifications & Achievements', 'fas fa-certificate', totalItems);
    const addCatBtn = buildAddButton('Add Category', () => openCertCategoryModal(-1, data));
    card.querySelector('.section-card-header').appendChild(addCatBtn);

    const body = document.createElement('div');

    data.forEach((cat, ci) => {
      const catDiv = document.createElement('div');
      catDiv.style.cssText = 'margin-bottom:1.5rem;padding:1rem;background:rgba(255,255,255,0.02);border-radius:var(--radius-md);border:1px solid var(--glass-border);';

      let catHeader = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem;">';
      catHeader += '<h3 style="font-size:0.95rem;color:var(--text-primary);">' + escapeHtml(cat.emoji || '') + ' ' + escapeHtml(cat.title) + ' <span style="font-size:0.7rem;color:var(--text-muted);">(' + cat.items.length + ' items)</span></h3>';
      catHeader += '<div class="table-actions" data-certcat-idx="' + ci + '"></div>';
      catHeader += '</div>';

      let tableHtml = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>Title</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
      cat.items.forEach((item, ii) => {
        tableHtml += '<tr><td>' + escapeHtml(item.title) + '</td><td>' + escapeHtml(item.description) + '</td><td><div class="table-actions" data-certcat="' + ci + '" data-certitem="' + ii + '"></div></td></tr>';
      });
      tableHtml += '</tbody></table></div>';

      catDiv.innerHTML = catHeader + tableHtml;

      const addItemBtn = document.createElement('button');
      addItemBtn.type = 'button';
      addItemBtn.className = 'btn btn-sm btn-success';
      addItemBtn.style.marginTop = '0.5rem';
      const plusI = document.createElement('i');
      plusI.className = 'fas fa-plus';
      addItemBtn.appendChild(plusI);
      addItemBtn.appendChild(document.createTextNode(' Add Item'));
      addItemBtn.addEventListener('click', () => openCertItemModal(ci, -1, data));
      catDiv.appendChild(addItemBtn);

      body.appendChild(catDiv);
    });

    card.appendChild(body);
    container.appendChild(card);

    body.querySelectorAll('[data-certcat-idx]').forEach(actDiv => {
      const ci = parseInt(actDiv.getAttribute('data-certcat-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openCertCategoryModal(ci, data),
        () => confirmDelete(() => { data.splice(ci, 1); setData('certifications', data); showToast('Category deleted.', 'success'); renderSection('certifications'); })
      ));
    });

    body.querySelectorAll('[data-certcat][data-certitem]').forEach(actDiv => {
      const ci = parseInt(actDiv.getAttribute('data-certcat'), 10);
      const ii = parseInt(actDiv.getAttribute('data-certitem'), 10);
      actDiv.appendChild(buildTableActions(
        () => openCertItemModal(ci, ii, data),
        () => confirmDelete(() => { data[ci].items.splice(ii, 1); setData('certifications', data); showToast('Item deleted.', 'success'); renderSection('certifications'); })
      ));
    });
  }

  function openCertCategoryModal(idx, data) {
    const isNew = idx < 0;
    const cat = isNew ? { title: '', emoji: '', items: [] } : data[idx];
    const bodyHtml = '<form class="admin-form" id="certcat-form"><div class="form-row">' +
      formField('certcat-title', 'Category Title', 'text', cat.title, 'e.g. Professional Certifications', { required: true }) +
      formField('certcat-emoji', 'Emoji', 'text', cat.emoji, 'e.g. 📜') +
      '</div></form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Category' : 'Edit Category', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([{ id: 'certcat-title', label: 'Title', required: true }])) return;
      const updated = {
        id: isNew ? generateId() : (cat.id || generateId()),
        title: document.getElementById('certcat-title').value.trim(),
        emoji: document.getElementById('certcat-emoji').value.trim(),
        items: isNew ? [] : cat.items,
      };
      if (isNew) { data.push(updated); } else { data[idx] = updated; }
      setData('certifications', data);
      closeModal();
      showToast(isNew ? 'Category added!' : 'Category updated!', 'success');
      renderSection('certifications');
    });
  }

  function openCertItemModal(catIdx, itemIdx, data) {
    const isNew = itemIdx < 0;
    const item = isNew ? { title: '', description: '' } : data[catIdx].items[itemIdx];
    const bodyHtml = '<form class="admin-form" id="certitem-form">' +
      formField('certitem-title', 'Title', 'text', item.title, 'Certification title', { required: true, fullWidth: true }) +
      formField('certitem-desc', 'Description', 'textarea', item.description, 'Description or issuer', { required: true, fullWidth: true, rows: 3 }) +
      '</form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Certification' : 'Edit Certification', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([
        { id: 'certitem-title', label: 'Title', required: true },
        { id: 'certitem-desc', label: 'Description', required: true },
      ])) return;
      const updated = {
        title: document.getElementById('certitem-title').value.trim(),
        description: document.getElementById('certitem-desc').value.trim(),
      };
      if (isNew) { data[catIdx].items.push(updated); } else { data[catIdx].items[itemIdx] = updated; }
      setData('certifications', data);
      closeModal();
      showToast(isNew ? 'Certification added!' : 'Certification updated!', 'success');
      renderSection('certifications');
    });
  }

  // ─── Soft Skills Section ────────────────────────────────────────
  function renderSoftSkillsSection(container) {
    const data = getData('softskills') || DEFAULTS.softskills;
    const card = buildSectionCard('Soft Skills & Personal Qualities', 'fas fa-heart', data.length);
    const addBtn = buildAddButton('Add Skill', () => openSoftSkillModal(-1, data));
    card.querySelector('.section-card-header').appendChild(addBtn);

    const body = document.createElement('div');
    if (data.length === 0) {
      body.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-heart"></i></div><h3>No soft skills</h3></div>';
    } else {
      let html = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>#</th><th>Skill</th><th>Actions</th></tr></thead><tbody>';
      data.forEach((s, i) => {
        html += '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(s) + '</td><td><div class="table-actions" data-ss-idx="' + i + '"></div></td></tr>';
      });
      html += '</tbody></table></div>';
      body.innerHTML = html;
    }
    card.appendChild(body);
    container.appendChild(card);

    body.querySelectorAll('[data-ss-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-ss-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openSoftSkillModal(idx, data),
        () => confirmDelete(() => { data.splice(idx, 1); setData('softskills', data); showToast('Skill deleted.', 'success'); renderSection('softskills'); })
      ));
    });
  }

  function openSoftSkillModal(idx, data) {
    const isNew = idx < 0;
    const val = isNew ? '' : data[idx];
    const bodyHtml = '<form class="admin-form" id="ss-form">' +
      formField('ss-name', 'Skill Name', 'text', val, 'e.g. Leadership', { required: true, fullWidth: true }) +
      '</form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Soft Skill' : 'Edit Soft Skill', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      const name = document.getElementById('ss-name').value.trim();
      if (!name) { showToast('Skill name is required.', 'error'); return; }
      if (isNew) { data.push(name); } else { data[idx] = name; }
      setData('softskills', data);
      closeModal();
      showToast(isNew ? 'Skill added!' : 'Skill updated!', 'success');
      renderSection('softskills');
    });
  }

  // ─── References Section ─────────────────────────────────────────
  function renderReferencesSection(container) {
    const data = getData('references') || DEFAULTS.references;
    const card = buildSectionCard('Professional References', 'fas fa-address-book', data.length);
    const addBtn = buildAddButton('Add Reference', () => openReferenceModal(-1, data));
    card.querySelector('.section-card-header').appendChild(addBtn);

    const body = document.createElement('div');
    if (data.length === 0) {
      body.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-address-book"></i></div><h3>No references</h3></div>';
    } else {
      let html = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>Name</th><th>Title</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead><tbody>';
      data.forEach((r, i) => {
        html += '<tr><td>' + escapeHtml(r.name) + '</td><td>' + escapeHtml(r.title) + '</td><td>' + escapeHtml(r.email) + '</td><td>' + escapeHtml(r.phone) + '</td><td><div class="table-actions" data-ref-idx="' + i + '"></div></td></tr>';
      });
      html += '</tbody></table></div>';
      body.innerHTML = html;
    }
    card.appendChild(body);
    container.appendChild(card);

    body.querySelectorAll('[data-ref-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-ref-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openReferenceModal(idx, data),
        () => confirmDelete(() => { data.splice(idx, 1); setData('references', data); showToast('Reference deleted.', 'success'); renderSection('references'); })
      ));
    });
  }

  function openReferenceModal(idx, data) {
    const isNew = idx < 0;
    const ref = isNew ? { name: '', title: '', email: '', phone: '' } : data[idx];
    const bodyHtml = '<form class="admin-form" id="ref-form">' +
      '<div class="form-row">' +
      formField('ref-name', 'Full Name', 'text', ref.name, 'e.g. Mrs. Hirushi Dilpriya', { required: true }) +
      formField('ref-title', 'Title / Position', 'text', ref.title, 'e.g. Lecturer at NSBM', { required: true }) +
      '</div>' +
      '<div class="form-row">' +
      formField('ref-email', 'Email', 'email', ref.email, 'email@example.com', { required: true }) +
      formField('ref-phone', 'Phone', 'text', ref.phone, '+94 XX XXX XXXX') +
      '</div>' +
      '</form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Reference' : 'Edit Reference', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([
        { id: 'ref-name', label: 'Full Name', required: true },
        { id: 'ref-title', label: 'Title', required: true },
        { id: 'ref-email', label: 'Email', required: true, type: 'email' },
      ])) return;
      const updated = {
        id: isNew ? generateId() : (ref.id || generateId()),
        name: document.getElementById('ref-name').value.trim(),
        title: document.getElementById('ref-title').value.trim(),
        email: document.getElementById('ref-email').value.trim(),
        phone: document.getElementById('ref-phone').value.trim(),
      };
      if (isNew) { data.push(updated); } else { data[idx] = updated; }
      setData('references', data);
      closeModal();
      showToast(isNew ? 'Reference added!' : 'Reference updated!', 'success');
      renderSection('references');
    });
  }

  // ─── Contact Info Section ───────────────────────────────────────
  function renderContactSection(container) {
    const data = getData('contact') || DEFAULTS.contact;
    const card = buildSectionCard('Contact Information', 'fas fa-envelope', data.length);
    const addBtn = buildAddButton('Add Contact', () => openContactModal(-1, data));
    card.querySelector('.section-card-header').appendChild(addBtn);

    const body = document.createElement('div');
    if (data.length === 0) {
      body.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-envelope"></i></div><h3>No contact info</h3></div>';
    } else {
      let html = '<div class="admin-table-wrapper"><table class="admin-table"><thead><tr><th>Icon</th><th>Title</th><th>Value</th><th>Link</th><th>Actions</th></tr></thead><tbody>';
      data.forEach((c, i) => {
        html += '<tr><td><i class="' + escapeHtml(c.icon) + '"></i></td><td>' + escapeHtml(c.title) + '</td><td>' + escapeHtml(c.value) + '</td><td>' + (c.link ? escapeHtml(c.link.substring(0, 40)) : '<em>none</em>') + '</td><td><div class="table-actions" data-ct-idx="' + i + '"></div></td></tr>';
      });
      html += '</tbody></table></div>';
      body.innerHTML = html;
    }
    card.appendChild(body);
    container.appendChild(card);

    body.querySelectorAll('[data-ct-idx]').forEach(actDiv => {
      const idx = parseInt(actDiv.getAttribute('data-ct-idx'), 10);
      actDiv.appendChild(buildTableActions(
        () => openContactModal(idx, data),
        () => confirmDelete(() => { data.splice(idx, 1); setData('contact', data); showToast('Contact deleted.', 'success'); renderSection('contact'); })
      ));
    });
  }

  function openContactModal(idx, data) {
    const isNew = idx < 0;
    const item = isNew ? { icon: 'fas fa-envelope', title: '', value: '', link: '', isExternal: false } : data[idx];
    const bodyHtml = '<form class="admin-form" id="ct-form">' +
      '<div class="form-row">' +
      formField('ct-title', 'Title', 'text', item.title, 'e.g. Email', { required: true }) +
      formField('ct-icon', 'Icon Class', 'text', item.icon, 'e.g. fas fa-envelope') +
      '</div>' +
      formField('ct-value', 'Display Value', 'text', item.value, 'e.g. samsudeenashad@gmail.com', { required: true, fullWidth: true }) +
      '<div class="form-row">' +
      formField('ct-link', 'Link URL', 'text', item.link, 'e.g. mailto:email@example.com', { hint: 'Leave empty if no link' }) +
      '<div class="form-group"><label class="form-label" for="ct-external">Opens Externally</label><select class="form-select" id="ct-external"><option value="false"' + (!item.isExternal ? ' selected' : '') + '>No</option><option value="true"' + (item.isExternal ? ' selected' : '') + '>Yes (target=_blank)</option></select></div>' +
      '</div>' +
      '</form>';
    const footerHtml = '<button class="btn btn-secondary" type="button" id="modal-cancel-btn">Cancel</button><button class="btn btn-primary" type="button" id="modal-save-btn"><i class="fas fa-save"></i> ' + (isNew ? 'Add' : 'Save') + '</button>';
    openModal(isNew ? 'Add Contact' : 'Edit Contact', bodyHtml, footerHtml);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (!validateFields([
        { id: 'ct-title', label: 'Title', required: true },
        { id: 'ct-value', label: 'Value', required: true },
      ])) return;
      const linkVal = document.getElementById('ct-link').value.trim();
      if (linkVal && !linkVal.startsWith('mailto:') && !linkVal.startsWith('tel:') && !isValidUrl(linkVal)) {
        showToast('Link must be a valid URL, mailto:, or tel: link.', 'error');
        return;
      }
      const updated = {
        icon: document.getElementById('ct-icon').value.trim() || 'fas fa-info-circle',
        title: document.getElementById('ct-title').value.trim(),
        value: document.getElementById('ct-value').value.trim(),
        link: linkVal,
        isExternal: document.getElementById('ct-external').value === 'true',
      };
      if (isNew) { data.push(updated); } else { data[idx] = updated; }
      setData('contact', data);
      closeModal();
      showToast(isNew ? 'Contact added!' : 'Contact updated!', 'success');
      renderSection('contact');
    });
  }

  // ─── Settings Section ───────────────────────────────────────────
  function renderSettingsSection(container) {
    const card = buildSectionCard('Settings', 'fas fa-cog');
    const body = document.createElement('div');
    body.innerHTML = [
      '<form class="admin-form" id="settings-form">',
      '  <h3 style="font-size:0.95rem;color:var(--text-primary);margin-bottom:0.25rem;">Change Password</h3>',
      '  <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Update your admin panel password.</p>',
      formField('set-current', 'Current Password', 'password', '', 'Enter current password', { required: true, fullWidth: true }),
      formField('set-new', 'New Password', 'password', '', 'Enter new password (min 4 chars)', { required: true, fullWidth: true }),
      formField('set-confirm', 'Confirm New Password', 'password', '', 'Re-enter new password', { required: true, fullWidth: true }),
      '  <div class="form-actions">',
      '    <button type="submit" class="btn btn-primary"><i class="fas fa-key"></i> Change Password</button>',
      '  </div>',
      '</form>',
      '<hr style="border:none;border-top:1px solid var(--glass-border);margin:2rem 0;">',
      '<h3 style="font-size:0.95rem;color:var(--text-primary);margin-bottom:0.25rem;">Data Management</h3>',
      '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Reset all portfolio data to default values.</p>',
      '<div class="form-actions" style="justify-content:flex-start;">',
      '  <button type="button" class="btn btn-danger" id="reset-data-btn"><i class="fas fa-undo"></i> Reset All Data</button>',
      '  <button type="button" class="btn btn-secondary" id="export-data-btn"><i class="fas fa-download"></i> Export Data</button>',
      '</div>',
    ].join('\n');
    card.appendChild(body);
    container.appendChild(card);

    document.getElementById('settings-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateFields([
        { id: 'set-current', label: 'Current Password', required: true },
        { id: 'set-new', label: 'New Password', required: true },
        { id: 'set-confirm', label: 'Confirm Password', required: true },
      ])) return;
      const cur = document.getElementById('set-current').value;
      const newPw = document.getElementById('set-new').value;
      const conf = document.getElementById('set-confirm').value;
      if (newPw !== conf) {
        showToast('New passwords do not match.', 'error');
        return;
      }
      const result = changePassword(cur, newPw);
      showToast(result.message, result.success ? 'success' : 'error');
      if (result.success) {
        document.getElementById('set-current').value = '';
        document.getElementById('set-new').value = '';
        document.getElementById('set-confirm').value = '';
      }
    });

    document.getElementById('reset-data-btn').addEventListener('click', () => {
      confirmDelete(() => {
        Object.keys(DEFAULTS).forEach(key => {
          setData(key, DEFAULTS[key]);
        });
        showToast('All data has been reset to defaults.', 'success');
        renderSection('settings');
      });
    });

    document.getElementById('export-data-btn').addEventListener('click', () => {
      const exportObj = {};
      Object.keys(KEYS).forEach(key => {
        if (key === 'password' || key === 'session') return;
        const val = getData(key);
        if (val) exportObj[key] = val;
      });
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio-data-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
    });
  }

  // ─── Initialization ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initDefaults();
    if (isAuthenticated()) {
      renderAdminPanel();
    } else {
      renderLoginPage();
    }
  });

})();
