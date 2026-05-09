const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(window, name) {
  const img = await window.webContents.capturePage();
  const p = path.join(outDir, name + '.png');
  fs.writeFileSync(p, img.toPNG());
  console.log('Saved:', p);
}

async function run() {
  await app.whenReady();

  const win = new BrowserWindow({
    width: 560,
    height: 420,
    frame: false,
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setOpacity(1);
  await win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Wait for clock to render
  await sleep(2000);

  // Screenshot 1: Main clock view (dark theme)
  await capture(win, '01-main-dark');

  // Screenshot 2: Settings panel open
  await win.webContents.executeJavaScript(`
    document.getElementById('settings-overlay').classList.add('show');
    document.getElementById('settings-panel').classList.add('show');
  `);
  await sleep(500);
  await capture(win, '02-settings');

  // Close settings
  await win.webContents.executeJavaScript(`
    document.getElementById('settings-overlay').classList.remove('show');
    document.getElementById('settings-panel').classList.remove('show');
  `);
  await sleep(300);

  // Screenshot 3: Blue theme
  await win.webContents.executeJavaScript(`
    document.body.className = 'theme-blue';
  `);
  await sleep(500);
  await capture(win, '03-theme-blue');

  // Screenshot 4: Red theme
  await win.webContents.executeJavaScript(`
    document.body.className = 'theme-red';
  `);
  await sleep(500);
  await capture(win, '04-theme-red');

  // Screenshot 5: Green theme
  await win.webContents.executeJavaScript(`
    document.body.className = 'theme-green';
  `);
  await sleep(500);
  await capture(win, '05-theme-green');

  // Screenshot 6: Purple theme
  await win.webContents.executeJavaScript(`
    document.body.className = 'theme-purple';
  `);
  await sleep(500);
  await capture(win, '06-theme-purple');

  // Screenshot 7: Wood theme
  await win.webContents.executeJavaScript(`
    document.body.className = 'theme-wood';
  `);
  await sleep(500);
  await capture(win, '07-theme-wood');

  // Screenshot 8: Seconds hidden
  await win.webContents.executeJavaScript(`
    document.body.className = 'theme-dark';
    document.querySelectorAll('.separator.dot, #group-seconds-tens, #group-seconds-ones').forEach(function(el) { el.style.display = 'none'; });
  `);
  await sleep(500);
  await capture(win, '08-no-seconds');

  console.log('All screenshots captured.');
  app.quit();
}

run().catch((e) => { console.error(e); app.quit(); });
