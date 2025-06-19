const ALERTS_URL = 'https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json';
let primaryCities = [];
let allCities = [];
let selectedSound = 'default';
let customSoundBlob = null;
let lastAlerts = [];
let saveTimer = null;
const POLL_INTERVAL = 1000;

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await fetchCities();
  setupTomSelects();
  setupSoundControls();
  startPolling();
  document.getElementById('test-btn').addEventListener('click', () => {
    logToUI(['TEST']);
    notifyXSOverlay('This is a test alert from RedXA');
    playAlertSound();
  });
});

async function loadConfig() {
  const res = await fetch('config.json');
  const cfg = await res.json();
  primaryCities = cfg.areas.filter(a => a.isPrimary).map(a => a.name);
}

async function fetchCities() {
  const response = await fetch('https://www.tzevaadom.co.il/static/cities.json?v=5');
  const data = await response.json();
  allCities = Object.values(data.cities).sort((a, b) => a.he.localeCompare(b.he));
}

function setupTomSelects() {
  const select = new TomSelect('#primary-select', { maxOptions: null, persist: false, plugins: ['remove_button'] });
  allCities.forEach(city => select.addOption({ value: city.he, text: city.he }));
  primaryCities.forEach(name => select.addItem(name));
  select.on('change', () => {
    primaryCities = [...select.items];
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => window.electronAPI.savePrimaryCities(primaryCities), 10000);
  });
}

function setupSoundControls() {
  const soundSelect = document.getElementById('sound-select');
  const customInput = document.getElementById('custom-sound');
  soundSelect.addEventListener('change', e => {
    selectedSound = e.target.value;
    customInput.style.display = selectedSound === 'custom' ? 'block' : 'none';
    if (selectedSound !== 'custom') customSoundBlob = null;
  });
  customInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) customSoundBlob = URL.createObjectURL(file);
  });
}

async function fetchAlerts() {
  try {
    const res = await fetch(ALERTS_URL);
    const parsed = await res.json();
    const data = Array.isArray(parsed) ? parsed : parsed.data;
    const cutoff = Date.now() - 15 * 60 * 1000;
    const newAlerts = data.filter(alert => {
      const t = new Date(alert.alertDate).getTime();
      const isRecent = t >= cutoff;
      const isNew = !lastAlerts.some(a => a.alertDate === alert.alertDate && a.title === alert.title && a.data === alert.data);
      return isRecent && isNew;
    });
    if (newAlerts.length) {
      newAlerts.forEach(alert => handleAlert(alert));
      lastAlerts = [...lastAlerts, ...newAlerts];
    }
  } catch (err) {
    console.error('Polling error:', err);
  }
}

function startPolling() { fetchAlerts(); setInterval(fetchAlerts, POLL_INTERVAL); }

function handleAlert(alert) {
  const matches = alert.data.split(',').map(s => s.trim()).filter(c => primaryCities.includes(c));
  if (matches.length) { logToUI(matches); notifyXSOverlay(`${alert.title} – ${matches.join(', ')}`); playAlertSound(alert.category); }
}

function logToUI(msgList) {
  const logEl = document.getElementById('log-output');
  const entry = document.createElement('li');
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${msgList.join(', ')}`;
  logEl.prepend(entry);
}

function notifyXSOverlay(text) {
  const socket = new WebSocket('ws://127.0.0.1:42070/?client=RedXA');
  socket.onopen = () => socket.send(JSON.stringify({ sender: 'RedXA', target: 'XSOverlay', command: 'SendNotification', jsonData: JSON.stringify({ title: 'RedXA: RED ALERT!', content: text, timeout: 8, type: 1 }), rawData: null }));
}

function playAlertSound(category) {
  let soundPath = '';
  if (category === 14) soundPath = 'sounds/GovWarn.mp3';
  else if (category === 13) soundPath = 'sounds/Calm.mp3';
  else { switch (selectedSound) { case 'default': soundPath = 'sounds/philippines-eas-alarm-original-320905.mp3'; break; case 'redalert': soundPath = 'sounds/japan-eas-alarm-EQ.mp3'; break; case 'custom': if (customSoundBlob) soundPath = customSoundBlob; break; } }
  console.log('→ playing sound:', soundPath);
  if (soundPath) new Audio(soundPath).play().catch(err => console.warn('Audio failed', err));
}
