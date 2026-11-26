/* Apply preferences before the page is painted. */
(function () {
  const read = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Session-only preference. */ } };
  let mode = read('heian.theme', 'light') === 'dark' ? 'dark' : 'light';
  let appearance = read('heian.appearance', 'default');
  if (!['default', 'autumn', 'winter'].includes(appearance)) appearance = 'default';
  const apply = () => { document.documentElement.dataset.theme = appearance !== 'default' ? 'light' : mode; document.documentElement.dataset.appearance = appearance; };
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    const select = document.getElementById('appearance-select');
    const controls = document.getElementById('autumn-music');
    const toggle = document.getElementById('music-toggle');
    const volume = document.getElementById('music-volume');
    const status = document.getElementById('music-status');
    const windButton = document.getElementById('winter-wind');
    let windContext, windSource, windGain, windModulator;
    function stopWind() { if (windSource) { windSource.stop(); windModulator.stop(); windSource = null; windGain = null; } windButton.textContent = 'Bật gió'; windButton.setAttribute('aria-pressed', 'false'); }
    function startWind() {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) { status.textContent = 'Trình duyệt không hỗ trợ tiếng gió'; return; }
      windContext ||= new Context(); windContext.resume();
      const buffer = windContext.createBuffer(1, windContext.sampleRate * 4, windContext.sampleRate);
      const samples = buffer.getChannelData(0); for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      windSource = windContext.createBufferSource(); windSource.buffer = buffer; windSource.loop = true;
      const filter = windContext.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 450; filter.Q.value = 0.6;
      windGain = windContext.createGain(); windGain.gain.value = 0.12 * Number(volume.value);
      windModulator = windContext.createOscillator(); windModulator.frequency.value = 0.15;
      const sweep = windContext.createGain(); sweep.gain.value = 250; windModulator.connect(sweep).connect(filter.frequency);
      windSource.connect(filter).connect(windGain).connect(windContext.destination); windSource.start(); windModulator.start();
      windButton.textContent = 'Tắt gió'; windButton.setAttribute('aria-pressed', 'true');
    }
    windButton.addEventListener('click', () => windSource ? stopWind() : startWind());
    const tracks = { autumn: 'sources/sounds/onmyoji-winter.mp3', winter: 'sources/sounds/onmyoji-antumn.mp3' };
    const audio = new Audio(tracks.autumn);
    let activeTrack = 'autumn';
    audio.loop = true;
    audio.preload = 'none';
    let enabled = read('heian.music.enabled', 'true') !== 'false';
    const storedVolume = Number(read('heian.music.volume', '0.3'));
    audio.volume = Number.isFinite(storedVolume) ? Math.max(0, Math.min(1, storedVolume)) : 0.3;
    volume.value = String(audio.volume);
    const setMusicButton = () => { toggle.textContent = audio.paused ? '▶' : '❚❚'; toggle.setAttribute('aria-label', audio.paused ? 'Phát nhạc' : 'Tạm dừng nhạc'); };
    async function play() { try { await audio.play(); status.textContent = ''; } catch { status.textContent = audio.error ? 'Không tải được nhạc' : 'Bấm ▶ để phát nhạc'; } setMusicButton(); }
    audio.addEventListener('error', () => { status.textContent = appearance === 'winter' ? 'Không tải được nhạc mùa đông' : 'Không tải được nhạc'; setMusicButton(); });
    audio.addEventListener('play', setMusicButton);
    audio.addEventListener('pause', setMusicButton);
    function update() {
      if (appearance !== 'winter') stopWind();
      windButton.hidden = appearance !== 'winter';
      apply(); select.value = appearance; button.hidden = appearance !== 'default'; controls.hidden = appearance === 'default';
      button.textContent = mode === 'dark' ? '☀' : '☾';
      button.setAttribute('aria-label', mode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
      button.title = button.getAttribute('aria-label'); button.setAttribute('aria-pressed', String(mode === 'dark'));
      document.getElementById('autumn-leaves')?.remove();
      document.getElementById('winter-snow')?.remove();
      if (appearance !== 'default' && appearance !== activeTrack) { audio.pause(); audio.src = tracks[appearance]; activeTrack = appearance; }
      if (appearance === 'autumn') {
        const leaves = document.createElement('div'); leaves.id = 'autumn-leaves'; leaves.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 9; i++) { const leaf = document.createElement('span'); leaf.textContent = '🍁'; leaf.style.setProperty('--x', `${Math.random() * 100}%`); leaf.style.setProperty('--size', `${10 + Math.random() * 14}px`); leaf.style.setProperty('--duration', `${12 + Math.random() * 14}s`); leaf.style.setProperty('--delay', `${-Math.random() * 26}s`); leaf.style.setProperty('--drift', `${Math.round(Math.random() * 130 - 65)}px`); leaf.style.setProperty('--opacity', `${0.3 + Math.random() * 0.45}`); leaves.appendChild(leaf); }
        document.body.appendChild(leaves);
        if (enabled) play();
      } else if (appearance === 'winter') {
        const snow = document.createElement('div'); snow.id = 'winter-snow'; snow.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 42; i++) {
          const flake = document.createElement('span');
          const crystal = i % 5 === 0;
          flake.className = crystal ? 'snow-crystal' : 'snow-speck';
          flake.style.setProperty('--x', `${Math.random() * 140 - 20}%`);
          flake.style.setProperty('--size', `${crystal ? 9 + Math.random() * 7 : 2 + Math.random() * 4}px`);
          flake.style.setProperty('--duration', `${8 + Math.random() * 10}s`);
          flake.style.setProperty('--delay', `${-Math.random() * 18}s`);
          snow.appendChild(flake);
        }
        for (let i = 0; i < 3; i++) {
          const gust = document.createElement('i'); gust.className = 'snow-gust';
          gust.style.setProperty('--height', `${20 + i * 25}%`);
          gust.style.setProperty('--delay', `${i * -5}s`);
          snow.appendChild(gust);
        }
        document.body.appendChild(snow);
        if (enabled) play();
      } else { audio.pause(); status.textContent = ''; }
    }
    select.addEventListener('change', () => { appearance = ['autumn', 'winter'].includes(select.value) ? select.value : 'default'; save('heian.appearance', appearance); update(); });
    button.addEventListener('click', () => { mode = mode === 'dark' ? 'light' : 'dark'; save('heian.theme', mode); update(); });
    toggle.addEventListener('click', () => { if (audio.paused) { enabled = true; save('heian.music.enabled', 'true'); play(); } else { enabled = false; save('heian.music.enabled', 'false'); audio.pause(); status.textContent = ''; } });
    volume.addEventListener('input', () => { audio.volume = Number(volume.value); if (windGain) windGain.gain.value = 0.12 * audio.volume; save('heian.music.volume', volume.value); });
    update();
  });
})();
