/* Apply preferences before the page is painted. */
(function () {
  const read = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Session-only preference. */ } };
  let mode = read('heian.theme', 'light') === 'dark' ? 'dark' : 'light';
  let appearance = read('heian.appearance', 'default') === 'autumn' ? 'autumn' : 'default';
  const apply = () => { document.documentElement.dataset.theme = appearance === 'autumn' ? 'light' : mode; document.documentElement.dataset.appearance = appearance; };
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    const select = document.getElementById('appearance-select');
    const controls = document.getElementById('autumn-music');
    const toggle = document.getElementById('music-toggle');
    const volume = document.getElementById('music-volume');
    const status = document.getElementById('music-status');
    const audio = new Audio('sources/sounds/YTSave.to_YouTube_Media_ibNcsdUPAy0_Okami-Side-E-Vinyl-Rip-DATA-DISCS_006_128k.m4a');
    audio.loop = true;
    audio.preload = 'none';
    let enabled = read('heian.music.enabled', 'true') !== 'false';
    const storedVolume = Number(read('heian.music.volume', '0.3'));
    audio.volume = Number.isFinite(storedVolume) ? Math.max(0, Math.min(1, storedVolume)) : 0.3;
    volume.value = String(audio.volume);
    const setMusicButton = () => { toggle.textContent = audio.paused ? '▶' : '❚❚'; toggle.setAttribute('aria-label', audio.paused ? 'Phát nhạc' : 'Tạm dừng nhạc'); };
    async function play() { try { await audio.play(); status.textContent = ''; } catch { status.textContent = audio.error ? 'Không tải được nhạc' : 'Bấm ▶ để phát nhạc'; } setMusicButton(); }
    audio.addEventListener('error', () => { status.textContent = 'Không tải được nhạc'; setMusicButton(); });
    audio.addEventListener('play', setMusicButton);
    audio.addEventListener('pause', setMusicButton);
    function update() {
      apply(); select.value = appearance; button.hidden = appearance !== 'default'; controls.hidden = appearance !== 'autumn';
      button.textContent = mode === 'dark' ? '☀' : '☾';
      button.setAttribute('aria-label', mode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
      button.title = button.getAttribute('aria-label'); button.setAttribute('aria-pressed', String(mode === 'dark'));
      document.getElementById('autumn-leaves')?.remove();
      if (appearance === 'autumn') {
        const leaves = document.createElement('div'); leaves.id = 'autumn-leaves'; leaves.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 9; i++) { const leaf = document.createElement('span'); leaf.textContent = '🍁'; leaf.style.setProperty('--x', `${Math.random() * 100}%`); leaf.style.setProperty('--size', `${10 + Math.random() * 14}px`); leaf.style.setProperty('--duration', `${12 + Math.random() * 14}s`); leaf.style.setProperty('--delay', `${-Math.random() * 26}s`); leaf.style.setProperty('--drift', `${Math.round(Math.random() * 130 - 65)}px`); leaf.style.setProperty('--opacity', `${0.3 + Math.random() * 0.45}`); leaves.appendChild(leaf); }
        document.body.appendChild(leaves);
        if (enabled) play();
      } else { audio.pause(); status.textContent = ''; }
    }
    select.addEventListener('change', () => { appearance = select.value === 'autumn' ? 'autumn' : 'default'; save('heian.appearance', appearance); update(); });
    button.addEventListener('click', () => { mode = mode === 'dark' ? 'light' : 'dark'; save('heian.theme', mode); update(); });
    toggle.addEventListener('click', () => { if (audio.paused) { enabled = true; save('heian.music.enabled', 'true'); play(); } else { enabled = false; save('heian.music.enabled', 'false'); audio.pause(); status.textContent = ''; } });
    volume.addEventListener('input', () => { audio.volume = Number(volume.value); save('heian.music.volume', volume.value); });
    update();
  });
})();
