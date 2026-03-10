document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  } else {
    updateThemeIcon('light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon(theme);
    });
  }

  // Sidebar Toggle (Mobile)
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');

  function toggleSidebar() {
    if (sidebar && overlay) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    }
  }

  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', toggleSidebar);

  // Search Filter
  const searchInput = document.getElementById('sidebar-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const sections = document.querySelectorAll('.sidebar-nav h3');

      sections.forEach(header => {
        let hasVisibleLink = false;
        let next = header.nextElementSibling;

        while (next && next.tagName === 'A') {
          const text = next.textContent.toLowerCase();
          if (text.includes(term)) {
            next.style.display = 'block';
            hasVisibleLink = true;
          } else {
            next.style.display = 'none';
          }
          next = next.nextElementSibling;
        }
        header.style.display = hasVisibleLink ? 'block' : 'none';
      });
    });
  }

  // Cookie Banner
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptCookies = document.getElementById('accept-cookies');
  if (cookieBanner && !localStorage.getItem('cookieConsent')) {
    cookieBanner.style.display = 'flex';
  } else if (cookieBanner) {
    cookieBanner.style.display = 'none';
  }

  if (acceptCookies) {
    acceptCookies.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'true');
      if (cookieBanner) cookieBanner.style.display = 'none';
      if (typeof initAds === 'function') initAds();
    });
  }

  // Set Active Link in Sidebar
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.sidebar-nav a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const cleanHref = href.replace('./', '').replace('../', '');
      if (currentPath.endsWith(cleanHref) || (currentPath === '/' && cleanHref === 'index.html')) {
        link.classList.add('active');
        // If nested, might need more logic but for this flat structure this works
      }
    }
  });
});
