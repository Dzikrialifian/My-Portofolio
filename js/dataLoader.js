/**
 * ====================================================================
 * DATA LOADER & GITHUB API HYBRID MODULE - Muhammad Dzikri Alifian
 * Asynchronous Fetch API for local JSON databases & GitHub REST API
 * Hybrid Data Engine merging live repositories with curated metadata
 * ====================================================================
 */

const DataLoader = (() => {
  // Path konfigurasi file JSON & GitHub API
  const PATHS = {
    projects: './data/projects.json',
    articles: './data/articles.json',
    githubApi: 'https://api.github.com/users/Dzikrialifian/repos?sort=updated&per_page=100'
  };

  // Cache internal untuk mencegah re-fetching berulang
  const _cache = {
    projects: null,
    articles: null,
    githubRepos: null,
    hybridProjects: null
  };

  /**
   * Mengambil data repositori publik secara langsung dari GitHub REST API
   * @param {boolean} forceRefresh - Paksa fetch ulang tanpa cache
   * @returns {Promise<Array>} Array of filtered GitHub repository objects
   */
  async function fetchGithubRepos(forceRefresh = false) {
    if (_cache.githubRepos && !forceRefresh) {
      return _cache.githubRepos;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    try {
      const response = await fetch(PATHS.githubApi, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      const repos = await response.json();

      if (!Array.isArray(repos)) {
        throw new Error('Format respon GitHub API bukan array');
      }

      // Filter: Hanya repositori publik pribadi (bukan fork, dan bukan profile readme repo khusus)
      const filteredRepos = repos.filter(repo => {
        if (repo.fork) return false;
        // Abaikan repo konfigurasi profil khusus (Dzikrialifian/Dzikrialifian)
        if (repo.name.toLowerCase() === 'dzikrialifian') return false;
        return true;
      }).map(repo => ({
        id: repo.name.toLowerCase(),
        name: repo.name,
        description: repo.description || '',
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || null,
        topics: Array.isArray(repo.topics) ? repo.topics : [],
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        syncedWithGithub: true
      }));

      _cache.githubRepos = filteredRepos;
      console.log(`%c[GitHub API]%c Berhasil memuat ${filteredRepos.length} repositori publik dari Dzikrialifian.`, 'color: #00F2FE; font-weight: bold;', 'color: #8b949e;');
      return filteredRepos;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn('[GitHub API] Warning/fallback (Rate limit / Offline):', error.message);
      return [];
    }
  }

  /**
   * Mengambil data daftar proyek lokal dari data/projects.json
   * @param {boolean} forceRefresh - Paksa fetch ulang tanpa menggunakan cache
   * @returns {Promise<Array>} Array of project objects
   */
  async function fetchProjects(forceRefresh = false) {
    if (_cache.projects && !forceRefresh) {
      return _cache.projects;
    }

    try {
      const response = await fetch(PATHS.projects);
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status} saat memuat projects.json`);
      }
      const data = await response.json();
      _cache.projects = data;
      console.log(`%c[DataLoader]%c Berhasil memuat ${data.length} proyek kustom dari projects.json.`, 'color: #00FF87; font-weight: bold;', 'color: #8b949e;');
      return data;
    } catch (error) {
      console.warn('[DataLoader] Fetch projects.json warning/fallback:', error.message);
      return getFallbackProjects();
    }
  }

  /**
   * HYBRID DATA ENGINE:
   * Menggabungkan data repositori live dari GitHub API dengan konfigurasi narasi lokal `data/projects.json`.
   * Jika repositori ada di GitHub dan cocok dengan JSON lokal, utamakan deskripsi kustom & kategori dari JSON,
   * lalu sematkan live statistics bintang, link repo, dan tag sinkronisasi.
   * @param {boolean} forceRefresh
   * @returns {Promise<Array>} Array proyek hybrid gabungan
   */
  async function getHybridProjects(forceRefresh = false) {
    if (_cache.hybridProjects && !forceRefresh) {
      return _cache.hybridProjects;
    }

    try {
      // Ambil data lokal dan GitHub API secara paralel
      const [localProjects, githubRepos] = await Promise.all([
        fetchProjects(forceRefresh),
        fetchGithubRepos(forceRefresh)
      ]);

      const matchedRepoNames = new Set();
      const hybridList = [];

      // 1. Proses proyek lokal terlebih dahulu (Prioritas narasi & kurasi unggulan)
      localProjects.forEach(local => {
        const repoKey = (local.repoName || local.id || '').toLowerCase();
        
        // Cari padanan di GitHub Repos
        const ghRepo = githubRepos.find(gh => 
          gh.name.toLowerCase() === repoKey || 
          gh.id.toLowerCase() === repoKey
        );

        if (ghRepo) {
          matchedRepoNames.add(ghRepo.name.toLowerCase());
          
          // Gabungkan tech stack (gabungan unik antara lokal, bahasa, dan topik GitHub)
          const combinedTech = Array.from(new Set([
            ...(Array.isArray(local.techStack) ? local.techStack : []),
            ...(ghRepo.topics || []),
            ...(ghRepo.language ? [ghRepo.language] : [])
          ]));

          hybridList.push({
            id: local.id || ghRepo.id,
            repoName: ghRepo.name,
            title: local.title || ghRepo.name,
            category: local.category || inferCategoryFromRepo(ghRepo),
            description: local.description || ghRepo.description || 'Proyek open-source oleh Muhammad Dzikri Alifian.',
            techStack: combinedTech,
            githubUrl: ghRepo.htmlUrl || local.githubUrl || 'https://github.com/Dzikrialifian',
            demoUrl: local.demoUrl || '',
            stars: ghRepo.stars || 0,
            forks: ghRepo.forks || 0,
            syncedWithGithub: true,
            source: 'hybrid'
          });
        }
        // Non-repo projects (seperti yang tidak ada di GitHub) diabaikan/dihapus sesuai permintaan pengguna
      });

      // 2. Tambahkan repositori GitHub publik lainnya milik Dzikrialifian yang belum ada di local JSON
      githubRepos.forEach(gh => {
        if (!matchedRepoNames.has(gh.name.toLowerCase())) {
          const techList = gh.topics && gh.topics.length > 0 
            ? gh.topics 
            : (gh.language ? [gh.language] : ['Python']);

          hybridList.push({
            id: gh.id,
            repoName: gh.name,
            title: formatRepoTitle(gh.name),
            category: inferCategoryFromRepo(gh),
            description: gh.description || `Repositori open-source ${gh.name} yang dikembangkan oleh Muhammad Dzikri Alifian.`,
            techStack: techList,
            githubUrl: gh.htmlUrl,
            demoUrl: '',
            stars: gh.stars,
            forks: gh.forks,
            syncedWithGithub: true,
            source: 'github'
          });
        }
      });

      // 3. Urutkan berdasarkan repositori dengan bintang atau pembaruan terkini
      hybridList.sort((a, b) => (b.stars || 0) - (a.stars || 0));

      _cache.hybridProjects = hybridList;
      console.log(`%c[Hybrid Engine]%c Total ${hybridList.length} proyek siap ditampilkan (${githubRepos.length > 0 ? 'Live GitHub Sync Aktif' : 'Mode Offline/Fallback'}).`, 'background: #00F2FE; color: #0A0D12; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: #00FF87; padding-left: 6px;');
      return hybridList;
    } catch (error) {
      console.error('[Hybrid Engine] Error saat kompilasi data proyek:', error);
      return getFallbackProjects();
    }
  }

  /**
   * Helper untuk mengonversi nama repo camel/kebab ke judul yang mudah dibaca
   */
  function formatRepoTitle(repoName = '') {
    if (!repoName) return 'Untitled Project';
    return repoName
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Menginferensikan kategori otomatis berdasarkan nama, bahasa, dan topik repo
   */
  function inferCategoryFromRepo(repo) {
    const text = `${repo.name} ${repo.description} ${(repo.topics || []).join(' ')}`.toLowerCase();

    if (/rag|langchain|gemini|llm|vector|embedding|deep-learning|machine-learning|ai|nlp|chatbot/.test(text)) {
      return 'Machine Learning / AI';
    }
    if (/automation|discord|bot|crawler|scraper|termux/.test(text)) {
      return 'AI & Automation';
    }
    if (/cipher|crypto|security|steganography|extractor|encryption/.test(text)) {
      return 'Cybersecurity';
    }
    if (/streamlit|dashboard|analytics|pandas|numpy|data-science/.test(text)) {
      return 'Web & Data Science';
    }
    if (repo.language === 'Python') {
      return 'Python Development';
    }
    if (/html|css|javascript|typescript|react|vue|web/.test(text) || ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(repo.language)) {
      return 'Web Development';
    }
    return 'Software Development';
  }

  /**
   * Mengambil daftar kategori unik dari array data proyek
   * @param {Array} projects 
   * @returns {Array<string>} Array kategori unik
   */
  function getProjectCategories(projects = []) {
    if (!Array.isArray(projects)) return [];
    const categories = new Set();
    projects.forEach(project => {
      if (project.category) {
        categories.add(project.category.trim());
      }
    });
    return Array.from(categories);
  }

  /**
   * Menyaring daftar proyek berdasarkan kategori yang dipilih
   * @param {Array} projects 
   * @param {string} category 
   * @returns {Array} Array proyek terfilter
   */
  function filterProjectsByCategory(projects = [], category = 'All') {
    if (!Array.isArray(projects)) return [];
    if (!category || category === 'All' || category.toLowerCase() === 'all') {
      return projects;
    }
    return projects.filter(project => project.category && project.category.trim().toLowerCase() === category.trim().toLowerCase());
  }

  /**
   * Mengambil data artikel & kegiatan dari data/articles.json
   */
  async function fetchArticles(forceRefresh = false) {
    if (_cache.articles && !forceRefresh) {
      return _cache.articles;
    }

    try {
      const response = await fetch(PATHS.articles);
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status} saat memuat articles.json`);
      }
      const data = await response.json();
      _cache.articles = data;
      console.log(`%c[DataLoader]%c Berhasil memuat ${data.length} artikel & kegiatan.`, 'color: #00F2FE; font-weight: bold;', 'color: #8b949e;');
      return data;
    } catch (error) {
      console.warn('[DataLoader] Fetch articles.json warning/fallback:', error.message);
      return getFallbackArticles();
    }
  }

  /**
   * Mengambil seluruh data portofolio secara paralel (Hybrid Projects & Articles)
   */
  async function getAllPortfolioData() {
    try {
      const [projects, articles] = await Promise.all([
        getHybridProjects(),
        fetchArticles()
      ]);
      return { projects, articles };
    } catch (error) {
      console.error('[DataLoader] Gagal memuat data portofolio:', error);
      return {
        projects: getFallbackProjects(),
        articles: getFallbackArticles()
      };
    }
  }

  /**
   * Data cadangan lengkap (fallback) jika dibuka tanpa koneksi internet & offline file://
   */
  function getFallbackProjects() {
    return [
      {
        id: "idk-rag-navasena",
        repoName: "idk-rag-navasena",
        title: "RAG Chatbot System (Hacktiv8 Bootcamp)",
        category: "Machine Learning / AI",
        description: "Sistem Chatbot RAG berbasis LLM & Vector Search yang dikembangkan saat bootcamp Hacktiv8 untuk pengolahan dokumen cerdas.",
        techStack: ["Python", "LangChain", "RAG", "Vector DB", "Gemini API"],
        githubUrl: "https://github.com/Dzikrialifian/idk-rag-navasena",
        demoUrl: "",
        stars: 0,
        syncedWithGithub: true
      },
      {
        id: "chatBot",
        repoName: "chatBot",
        title: "Interactive Conversational Chatbot",
        category: "Machine Learning / AI",
        description: "Aplikasi chatbot pintar memanfaatkan Natural Language Processing dan model AI untuk respons kontekstual real-time.",
        techStack: ["Python", "NLP", "Gemini API", "Chatbot"],
        githubUrl: "https://github.com/Dzikrialifian/chatBot",
        demoUrl: "",
        stars: 0,
        syncedWithGithub: true
      },
      {
        id: "MediFirst",
        repoName: "MediFirst",
        title: "MediFirst - AI Health Triage Assistant",
        category: "Machine Learning / AI",
        description: "Asisten triase kesehatan berbasis AI yang membantu penilaian gejala awal pengguna melalui panduan dialog terstruktur.",
        techStack: ["Python", "Healthcare AI", "Prompt Engineering"],
        githubUrl: "https://github.com/Dzikrialifian/MediFirst",
        demoUrl: "",
        stars: 0,
        syncedWithGithub: true
      },
      {
        id: "Streamlit",
        repoName: "Streamlit",
        title: "Streamlit Interactive Data Apps",
        category: "Web & Data Science",
        description: "Koleksi aplikasi visualisasi data dan antarmuka web interaktif berbasis Streamlit.",
        techStack: ["Python", "Streamlit", "Data Science"],
        githubUrl: "https://github.com/Dzikrialifian/Streamlit",
        demoUrl: "",
        stars: 0,
        syncedWithGithub: true
      },
      {
        id: "PinExtractor",
        repoName: "PinExtractor",
        title: "PinExtractor Cryptographic Utility",
        category: "Python Development",
        description: "Program Python untuk ekstraksi kode rahasia dari puisi menggunakan perhitungan panjang kata.",
        techStack: ["Python", "Cryptography", "Algorithms"],
        githubUrl: "https://github.com/Dzikrialifian/PinExtractor",
        demoUrl: "",
        stars: 0,
        syncedWithGithub: true
      },
      {
        id: "CaesarCipher",
        repoName: "CaesarCipher",
        title: "Caesar Cipher Security Tool",
        category: "Cybersecurity",
        description: "Implementasi kriptografi klasik Caesar Cipher untuk enkripsi dan dekripsi teks.",
        techStack: ["Python", "Cybersecurity", "Classic Cipher"],
        githubUrl: "https://github.com/Dzikrialifian/CaesarCipher",
        demoUrl: "",
        stars: 0,
        syncedWithGithub: true
      },
      {
        id: "RPG_Character",
        repoName: "RPG_Character",
        title: "RPG Character Simulator",
        category: "Python Development",
        description: "Simulasi pembuatan karakter game RPG dengan validasi status atribut berbasis OOP Python.",
        techStack: ["Python", "OOP", "Game Logic"],
        githubUrl: "https://github.com/Dzikrialifian/RPG_Character",
        demoUrl: "",
        stars: 0,
        syncedWithGithub: true
      },
      {
        id: "dzikrialifian-portfolio",
        repoName: "dzikrialifian.github.io",
        title: "Dzikri.dev Developer Portfolio",
        category: "Web Development",
        description: "Website portofolio developer modern bertema minimalist code editor dengan integrasi real-time GitHub REST API, arsitektur data hybrid, dan performa tinggi.",
        techStack: ["HTML5", "Vanilla CSS", "JavaScript", "GitHub REST API", "Glassmorphism"],
        githubUrl: "https://github.com/Dzikrialifian/dzikrialifian.github.io",
        demoUrl: "https://dzikrialifian.github.io",
        stars: 0,
        syncedWithGithub: true
      }
    ];
  }

  function getFallbackArticles() {
    return [
      {
        id: "act-1",
        title: "Key Insights: Google Gemini Campus Tour Surabaya",
        category: "Event / Tech Tour",
        date: "August 2026",
        summary: "Menghadiri sesi eksplorasi teknologi AI terbaru bersama Google, mendalami kapabilitas Google Gemini multimodal API dan ekosistem AI generatif.",
        tags: ["Google Gemini", "Tech Tour", "Generative AI", "Surabaya"],
        type: "Event & Workshop",
        link: "#"
      },
      {
        id: "act-2",
        title: "My Journey: Google Student Ambassador Candidate Batch 2",
        category: "Application & Journey",
        date: "August 2026",
        summary: "Pengalaman dan perjalanan seleksi sebagai kandidat Google Student Ambassador (GSA) Batch 2, berfokus pada kepemimpinan teknologi kampus.",
        tags: ["GSA Candidate", "Leadership", "Google Community"],
        type: "Leadership Program",
        link: "#"
      },
      {
        id: "act-3",
        title: "Volunteer Experience: Pasukan Baik Program",
        category: "Community Service",
        date: "2026",
        summary: "Berperan aktif dalam program aksi sosial dan pengabdian masyarakat 'Pasukan Baik', mendukung kegiatan kemanusiaan dan dampak sosial nyata.",
        tags: ["Volunteering", "Social Impact", "Community Service"],
        type: "Social & Community",
        link: "#"
      },
      {
        id: "act-4",
        title: "Participant at Techvolution 3",
        category: "Hackathon / Event",
        date: "June 2026",
        summary: "Berpartisipasi aktif dalam ajang kompetisi teknologi berskala nasional Techvolution 3 di bidang inovasi digital.",
        tags: ["Techvolution 3", "Hackathon", "Innovation"],
        type: "Competition & Hackathon",
        link: "#"
      }
    ];
  }

  // Public API
  return {
    fetchProjects,
    fetchGithubRepos,
    getHybridProjects,
    fetchArticles,
    getAllPortfolioData,
    getProjectCategories,
    filterProjectsByCategory
  };
})();

// Ekspor ke global object untuk pemanggilan Vanilla JS
if (typeof window !== 'undefined') {
  window.DataLoader = DataLoader;
}
