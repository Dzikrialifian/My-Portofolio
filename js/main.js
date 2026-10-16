/**
 * ====================================================================
 * MAIN INTERACTION & UI SCRIPT - Muhammad Dzikri Alifian
 * Minimalist Developer Theme with Cyber Neon Micro-Interactions
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Developer Console Branding
  printConsoleBanner();

  // 2. Navbar & Scroll Behavior
  initNavbarScroll();
  initMobileMenu();
  initActiveNavLink();
  initSmoothScroll();

  // 3. Hero Interactive Effects
  initHeroPhotoEffect();
  initSpecialtyHoverEffects();

  // 4. Test Load Data Layer
  verifyDataLoader();

  // 5. TAHAP 2: Dynamic Projects Rendering & Interactive Filtering
  initProjectsSection();
});

/**
 * Mencetak identitas developer bergaya terminal di browser console
 */
function printConsoleBanner() {
  const titleStyle = 'color: #00F2FE; font-family: monospace; font-size: 16px; font-weight: bold; padding: 4px 0;';
  const subStyle = 'color: #8B949E; font-family: monospace; font-size: 12px;';
  const linkStyle = 'color: #00E5FF; font-family: monospace; font-size: 11px; text-decoration: underline;';

  console.log(
    '%c<C/> Dzikri.dev %c| Muhammad Dzikri Alifian\n' +
    '%cInformatics Engineering @ Universitas Negeri Surabaya (UNESA)\n' +
    'Focus: Machine Learning, Data Science, AI Systems & Web Architecture\n' +
    '%cGitHub: https://github.com/Dzikrialifian\n' +
    'LinkedIn: https://www.linkedin.com/in/dzikrialifian',
    titleStyle,
    'color: #00FF87; font-weight: bold;',
    subStyle,
    linkStyle
  );
}

/**
 * Mengelola efek sticky navbar dengan background blur saat halaman di-scroll
 */
function initNavbarScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Trigger awal
}

/**
 * Mengelola tombol hamburger menu untuk tampilan mobile
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('primaryNav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    menuBtn.classList.toggle('active', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Tutup menu saat salah satu link diklik
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Tutup menu saat area luar diklik
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      navMenu.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/**
 * Menyorot tautan navigasi aktif berdasarkan posisi scroll (IntersectionObserver)
 */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * Smooth scrolling untuk link jangkar (#)
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Micro-interaction: Efek subtle parallax pada foto developer
 */
function initHeroPhotoEffect() {
  const centerStage = document.querySelector('.hero-center-stage');
  const heroSection = document.querySelector('.hero-retro-layout');
  if (!centerStage || !heroSection) return;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const photo = centerStage.querySelector('.hero-photo-wrapper');
    if (photo) {
      photo.style.transform = `translateX(${x * 12}px) translateY(${y * 8}px)`;
    }
  });

  heroSection.addEventListener('mouseleave', () => {
    const photo = centerStage.querySelector('.hero-photo-wrapper');
    if (photo) {
      photo.style.transform = 'translateX(0) translateY(0)';
      photo.style.transition = 'transform 0.4s ease-out';
    }
  });
}

/**
 * Micro-interaction: Efek interaktif pada list spesialisasi
 */
function initSpecialtyHoverEffects() {
  const items = document.querySelectorAll('.specialty-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const arrow = item.querySelector('.arrow-glyph');
      if (arrow) arrow.style.transform = 'translateX(4px)';
    });
    item.addEventListener('mouseleave', () => {
      const arrow = item.querySelector('.arrow-glyph');
      if (arrow) arrow.style.transform = 'translateX(0)';
    });
  });
}

/**
 * Menguji integrasi dataLoader.js agar siap 100% untuk Tahap 2
 */
async function verifyDataLoader() {
  if (window.DataLoader) {
    try {
      const data = await window.DataLoader.getAllPortfolioData();
      console.log(
        '%c[DataLoader Ready]%c Loaded ' +
        `${data.projects ? data.projects.length : 0} projects and ` +
        `${data.articles ? data.articles.length : 0} articles/activities ready for Phase 2 dynamic display.`,
        'background: #00F2FE; color: #0D1117; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #00FF87; padding-left: 6px;'
      );
    } catch (err) {
      console.error('[DataLoader] Verification Error:', err);
    }
  }
}

/* ====================================================================
 * TAHAP 2: DYNAMIC DATA-DRIVEN PROJECTS SECTION & GITHUB HYBRID ENGINE
 * ==================================================================== */

// Global state untuk proyek
const projectsState = {
  allProjects: [],
  activeCategory: 'All',
  isLoading: false
};

/**
 * Inisialisasi seksi proyek: memuat data Hybrid (GitHub API + projects.json),
 * menampilkan skeleton screen loader, dan merender kartu & filter dinamis.
 */
async function initProjectsSection() {
  const filtersContainer = document.getElementById('project-filters');
  const projectsGrid = document.getElementById('projects-grid') || document.getElementById('projectsContainer');

  if (!projectsGrid) return;

  try {
    projectsState.isLoading = true;

    // Tampilkan skeleton cards placeholder selama proses fetching berlangsung
    renderSkeletonCards(projectsGrid, 3);

    // Panggil Hybrid Data Engine via DataLoader (GitHub API + data/projects.json)
    let projects = [];
    if (window.DataLoader && typeof window.DataLoader.getHybridProjects === 'function') {
      projects = await window.DataLoader.getHybridProjects();
    } else if (window.DataLoader && typeof window.DataLoader.fetchProjects === 'function') {
      projects = await window.DataLoader.fetchProjects();
    } else {
      const res = await fetch('./data/projects.json');
      projects = await res.json();
    }

    projectsState.allProjects = Array.isArray(projects) ? projects : [];
    projectsState.isLoading = false;

    // Render filter kategori dinamis
    if (filtersContainer) {
      renderProjectFilters(filtersContainer, projectsGrid);
    }

    // Render grid kartu proyek hybrid
    renderProjectsGrid(projectsGrid, projectsState.activeCategory);

  } catch (error) {
    console.error('[Projects] Error saat inisialisasi seksi proyek hybrid:', error);
    projectsState.isLoading = false;
    projectsGrid.innerHTML = `
      <div class="projects-empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>Gagal memuat database proyek. Silakan periksa koneksi internet atau refresh halaman.</span>
      </div>
    `;
  }
}

/**
 * Merender placeholder skeleton screen saat data sedang dimuat dari GitHub API
 */
function renderSkeletonCards(container, count = 3) {
  let skeletonsHtml = '';
  for (let i = 0; i < count; i++) {
    skeletonsHtml += `
      <div class="project-skeleton-card" aria-hidden="true">
        <div class="skeleton-shimmer"></div>
        <div>
          <div class="skeleton-top">
            <div class="skeleton-icon"></div>
            <div class="skeleton-pill"></div>
          </div>
          <div class="skeleton-tag"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-footer">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
        </div>
      </div>
    `;
  }
  container.innerHTML = skeletonsHtml;
}

/**
 * Merender tombol filter kategori secara dinamis berdasarkan data proyek hybrid
 */
function renderProjectFilters(filtersContainer, projectsGrid) {
  const { allProjects } = projectsState;
  
  // Dapatkan daftar kategori unik
  let categories = [];
  if (window.DataLoader && typeof window.DataLoader.getProjectCategories === 'function') {
    categories = window.DataLoader.getProjectCategories(allProjects);
  } else {
    const catSet = new Set();
    allProjects.forEach(p => { if (p.category) catSet.add(p.category.trim()); });
    categories = Array.from(catSet);
  }

  // Siapkan kategori "All" pertama diikuti kategori spesifik
  const filterList = [
    { name: 'All', count: allProjects.length },
    ...categories.map(cat => ({
      name: cat,
      count: allProjects.filter(p => p.category && p.category.trim().toLowerCase() === cat.toLowerCase()).length
    }))
  ];

  // Buat tombol filter
  filtersContainer.innerHTML = '';
  filterList.forEach(item => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${item.name === projectsState.activeCategory ? 'active' : ''}`;
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-category', item.name);
    btn.innerHTML = `
      <span class="filter-name">${escapeHTML(item.name)}</span>
      <span class="filter-count">${item.count}</span>
    `;

    // Event listener untuk filter interaktif dengan transisi halus
    btn.addEventListener('click', () => {
      if (projectsState.activeCategory === item.name) return;

      // Update active category
      projectsState.activeCategory = item.name;
      filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Animasi transisi halus saat filter berganti
      projectsGrid.style.opacity = '0.2';
      projectsGrid.style.transform = 'translateY(6px)';
      projectsGrid.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

      setTimeout(() => {
        renderProjectsGrid(projectsGrid, item.name);
        projectsGrid.style.opacity = '1';
        projectsGrid.style.transform = 'translateY(0)';
      }, 200);
    });

    filtersContainer.appendChild(btn);
  });
}

/**
 * Merender kartu proyek ke dalam grid container
 */
function renderProjectsGrid(projectsGrid, category = 'All') {
  const { allProjects } = projectsState;

  // Filter proyek
  let filteredProjects = allProjects;
  if (category && category !== 'All') {
    if (window.DataLoader && typeof window.DataLoader.filterProjectsByCategory === 'function') {
      filteredProjects = window.DataLoader.filterProjectsByCategory(allProjects, category);
    } else {
      filteredProjects = allProjects.filter(p => p.category && p.category.trim().toLowerCase() === category.trim().toLowerCase());
    }
  }

  if (filteredProjects.length === 0) {
    projectsGrid.innerHTML = `
      <div class="projects-empty-state">
        <i class="fa-solid fa-code-commit"></i>
        <span>Tidak ada proyek yang ditemukan untuk kategori "${escapeHTML(category)}".</span>
      </div>
    `;
    return;
  }

  // Susun kartu proyek
  const cardsHtml = filteredProjects.map((project, index) => createProjectCardHTML(project, index)).join('');
  projectsGrid.innerHTML = cardsHtml;
}

/**
 * Menghasilkan markup HTML kartu proyek dengan gaya Developer Slate, Glassmorphism,
 * serta integrasi statistik GitHub (bintang, sync badge, dan links).
 */
function createProjectCardHTML(project, index) {
  const {
    id = '',
    repoName = '',
    title = 'Untitled Project',
    category = 'General',
    description = '',
    techStack = [],
    githubUrl = 'https://github.com/Dzikrialifian',
    demoUrl = '',
    liveDemoUrl = '',
    stars = 0,
    featured = false,
    syncedWithGithub = false
  } = project;

  // Tentukan URL demo jika ada
  const finalDemoUrl = demoUrl || liveDemoUrl || '';
  const finalGithubUrl = githubUrl || (repoName ? `https://github.com/Dzikrialifian/${repoName}` : 'https://github.com/Dzikrialifian');

  // Tech stack badges
  const techBadgesHtml = Array.isArray(techStack)
    ? techStack.map(tech => `<li class="tech-badge">${escapeHTML(tech)}</li>`).join('')
    : '';

  // Synced with GitHub indicator badge
  const syncedBadgeHtml = syncedWithGithub
    ? `<span class="project-synced-badge" title="Tersinkronisasi langsung via GitHub API"><span class="synced-pulse-dot"></span> GitHub Synced</span>`
    : '';

  // GitHub Star Counter badge
  const starsBadgeHtml = (typeof stars === 'number' && (stars > 0 || syncedWithGithub))
    ? `<a href="${escapeHTML(finalGithubUrl)}" target="_blank" rel="noopener noreferrer" class="project-stars-badge" title="${stars} Stars di GitHub">
         <i class="fa-solid fa-star"></i> ${stars}
       </a>`
    : '';

  // Demo link button jika tersedia
  const demoLinkHtml = finalDemoUrl
    ? `<a href="${escapeHTML(finalDemoUrl)}" target="_blank" rel="noopener noreferrer" class="project-action-link project-demo-link" style="margin-right: 1.25rem;" aria-label="Live Demo ${escapeHTML(title)}" title="Lihat Live Demo: ${escapeHTML(finalDemoUrl)}">
         <i class="fa-solid fa-arrow-up-right-from-square"></i>
       </a>`
    : '';

  const isPortfolioCard = id === 'dzikrialifian-portfolio' || repoName === 'dzikrialifian.github.io';
  const portfolioClass = isPortfolioCard ? ' project-portfolio-card' : '';

  return `
    <article class="project-card fade-in${portfolioClass}" data-id="${escapeHTML(id)}" style="animation-delay: ${index * 0.05}s;">
      <div>
        <div class="project-card-top">
          <div class="project-icon-group">
            <i class="fa-regular fa-folder-open project-folder-icon" aria-hidden="true"></i>
            ${syncedBadgeHtml}
          </div>
          <div class="project-card-links">
            ${starsBadgeHtml}
            <a href="${escapeHTML(finalGithubUrl)}" target="_blank" rel="noopener noreferrer" class="project-action-link" aria-label="Repository GitHub ${escapeHTML(title)}" title="Lihat Kode di GitHub: ${escapeHTML(finalGithubUrl)}">
              <i class="fa-brands fa-github"></i>
            </a>
            ${demoLinkHtml}
          </div>
        </div>

        <div class="project-card-body">
          <span class="project-card-category">${escapeHTML(category)}</span>
          <h3 class="project-card-title">${escapeHTML(title)}</h3>
          <p class="project-card-desc">${escapeHTML(description)}</p>
        </div>
      </div>

      <ul class="project-tech-list" aria-label="Teknologi yang digunakan">
        ${techBadgesHtml}
      </ul>
    </article>
  `;
}

/**
 * Utility untuk sanitasi string HTML agar aman
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


