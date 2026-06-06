function toggleTheme() {
      const html = document.documentElement;
      const isLight = html.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      html.setAttribute('data-theme', newTheme);
      document.getElementById('themeIcon').innerText = isLight ? '🌙' : '☀️';
      document.getElementById('themeLabel').innerText = isLight ? 'Tối' : 'Sáng';
      localStorage.setItem('fa_theme', newTheme);
    }

    // Init theme
    const saved = localStorage.getItem('fa_theme');
    if(saved) {
      document.documentElement.setAttribute('data-theme', saved);
      document.getElementById('themeIcon').innerText = saved === 'light' ? '☀️' : '🌙';
      document.getElementById('themeLabel').innerText = saved === 'light' ? 'Sáng' : 'Tối';
    }

