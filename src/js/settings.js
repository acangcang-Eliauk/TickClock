/**
 * Settings Panel (Win10 Fluent Style)
 */
(function () {
  const overlay = document.getElementById('settings-overlay');
  const panel = document.getElementById('settings-panel');
  const btnSettings = document.getElementById('btn-settings');
  const btnClose = document.getElementById('btn-close-settings');
  const btnLock = document.getElementById('btn-lock');
  const btnCloseWidget = document.getElementById('btn-close-widget');

  const settingLocked = document.getElementById('setting-locked');
  const settingOntop = document.getElementById('setting-ontop');
  const settingSeconds = document.getElementById('setting-seconds');
  const setting24h = document.getElementById('setting-24h');
  const settingOpacity = document.getElementById('setting-opacity');

  const themeDots = document.querySelectorAll('.theme-dot');

  // Load saved settings
  function loadSettings() {
    settingOntop.checked = localStorage.getItem('tickclock_ontop') !== 'false';
    settingLocked.checked = localStorage.getItem('tickclock_locked') === 'true';
    settingSeconds.checked = localStorage.getItem('tickclock_seconds') !== 'false';
    setting24h.checked = localStorage.getItem('tickclock_24h') !== 'false';

    const savedOpacity = localStorage.getItem('tickclock_opacity');
    if (savedOpacity !== null) {
      settingOpacity.value = savedOpacity;
      if (window.tickAPI) window.tickAPI.setOpacity(Number(savedOpacity) / 100);
    }

    const savedTheme = localStorage.getItem('tickclock_theme') || 'dark';
    document.body.className = 'theme-' + savedTheme;
    themeDots.forEach(d => d.classList.toggle('active', d.dataset.theme === savedTheme));
  }

  // Toggle seconds display
  function toggleSeconds(show) {
    const els = document.querySelectorAll('.separator.dot, #group-seconds-tens, #group-seconds-ones');
    els.forEach(el => { el.style.display = show ? '' : 'none'; });
  }

  // Open settings
  btnSettings.addEventListener('click', () => {
    overlay.classList.add('show');
    panel.classList.add('show');
    loadSettings();
  });

  function closeSettings() {
    overlay.classList.remove('show');
    panel.classList.remove('show');
  }

  btnClose.addEventListener('click', closeSettings);
  overlay.addEventListener('click', closeSettings);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('show')) closeSettings();
  });

  // Lock toggle
  btnLock.addEventListener('click', () => {
    const locked = !(window.tickDrag ? window.tickDrag.isLocked() : false);
    if (window.tickDrag) window.tickDrag.setLocked(locked);
    settingLocked.checked = locked;
    localStorage.setItem('tickclock_locked', locked);
  });

  // Settings changes
  settingLocked.addEventListener('change', () => {
    if (window.tickDrag) window.tickDrag.setLocked(settingLocked.checked);
  });

  settingOntop.addEventListener('change', () => {
    localStorage.setItem('tickclock_ontop', settingOntop.checked);
    if (window.tickAPI) window.tickAPI.setAlwaysOnTop(settingOntop.checked);
  });

  settingSeconds.addEventListener('change', () => {
    localStorage.setItem('tickclock_seconds', settingSeconds.checked);
    toggleSeconds(settingSeconds.checked);
  });

  setting24h.addEventListener('change', () => {
    localStorage.setItem('tickclock_24h', setting24h.checked);
  });

  settingOpacity.addEventListener('input', () => {
    const val = Number(settingOpacity.value);
    localStorage.setItem('tickclock_opacity', val);
    if (window.tickAPI) window.tickAPI.setOpacity(val / 100);
  });

  // Theme picker
  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const theme = dot.dataset.theme;
      themeDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      document.body.className = 'theme-' + theme;
      localStorage.setItem('tickclock_theme', theme);
    });
  });

  // Close widget
  btnCloseWidget.addEventListener('click', () => {
    if (window.tickAPI) window.tickAPI.close();
  });

  // Init
  loadSettings();
  toggleSeconds(settingSeconds.checked);

  // Listen for ontop changes from global shortcut Ctrl+Shift+F12
  if (window.tickAPI && window.tickAPI.onOntopChanged) {
    window.tickAPI.onOntopChanged((val) => {
      settingOntop.checked = val;
      localStorage.setItem('tickclock_ontop', val);
    });
  }
})();
