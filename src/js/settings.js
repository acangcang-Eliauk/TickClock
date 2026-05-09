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
  const settingAutostart = document.getElementById('setting-autostart');

  const themeDots = document.querySelectorAll('.theme-dot');

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

    if (window.tickAPI) {
      window.tickAPI.getAutoStart().then(function (v) {
        settingAutostart.checked = v;
      }).catch(function () {});
    }
  }

  function toggleSeconds(show) {
    var els = document.querySelectorAll('.separator.dot, #group-seconds-tens, #group-seconds-ones');
    els.forEach(function (el) { el.style.display = show ? '' : 'none'; });
  }

  function openSettings() {
    overlay.classList.add('show');
    panel.classList.add('show');
    loadSettings();
  }

  btnSettings.addEventListener('click', openSettings);

  function closeSettings() {
    overlay.classList.remove('show');
    panel.classList.remove('show');
  }

  btnClose.addEventListener('click', closeSettings);
  overlay.addEventListener('click', closeSettings);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('show')) closeSettings();
  });

  // Lock toggle
  btnLock.addEventListener('click', function () {
    var locked = !(window.tickDrag ? window.tickDrag.isLocked() : false);
    if (window.tickDrag) window.tickDrag.setLocked(locked);
    settingLocked.checked = locked;
    localStorage.setItem('tickclock_locked', locked);
  });

  // Settings changes
  settingLocked.addEventListener('change', function () {
    if (window.tickDrag) window.tickDrag.setLocked(settingLocked.checked);
  });

  settingOntop.addEventListener('change', function () {
    localStorage.setItem('tickclock_ontop', settingOntop.checked);
    if (window.tickAPI) window.tickAPI.setAlwaysOnTop(settingOntop.checked);
  });

  settingSeconds.addEventListener('change', function () {
    localStorage.setItem('tickclock_seconds', settingSeconds.checked);
    toggleSeconds(settingSeconds.checked);
  });

  setting24h.addEventListener('change', function () {
    localStorage.setItem('tickclock_24h', setting24h.checked);
  });

  settingOpacity.addEventListener('input', function () {
    var val = Number(settingOpacity.value);
    localStorage.setItem('tickclock_opacity', val);
    if (window.tickAPI) window.tickAPI.setOpacity(val / 100);
  });

  settingAutostart.addEventListener('change', function () {
    if (window.tickAPI) window.tickAPI.setAutoStart(settingAutostart.checked);
  });

  // Theme picker
  themeDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var theme = dot.dataset.theme;
      themeDots.forEach(function (d) { d.classList.remove('active'); });
      dot.classList.add('active');
      document.body.className = 'theme-' + theme;
      localStorage.setItem('tickclock_theme', theme);
    });
  });

  // Close/hide widget
  btnCloseWidget.addEventListener('click', function () {
    if (window.tickAPI) window.tickAPI.close();
  });

  // Init
  loadSettings();
  toggleSeconds(settingSeconds.checked);

  // Listen for ontop changes from global shortcut Ctrl+Shift+F12
  if (window.tickAPI && window.tickAPI.onOntopChanged) {
    window.tickAPI.onOntopChanged(function (val) {
      settingOntop.checked = val;
      localStorage.setItem('tickclock_ontop', val);
    });
  }

  // Listen for autostart changes from tray menu
  if (window.tickAPI && window.tickAPI.onAutoStartChanged) {
    window.tickAPI.onAutoStartChanged(function (val) {
      settingAutostart.checked = val;
    });
  }

  // Listen for show-settings from tray menu
  if (window.tickAPI && window.tickAPI.onShowSettings) {
    window.tickAPI.onShowSettings(function () {
      openSettings();
    });
  }
})();
