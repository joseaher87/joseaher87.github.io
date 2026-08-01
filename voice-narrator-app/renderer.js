(() => {
  const textInput = document.getElementById('text-input');
  const charCount = document.getElementById('char-count');
  const fileInput = document.getElementById('file-input');

  const voiceSelect = document.getElementById('voice-select');
  const voiceHint = document.getElementById('voice-hint');

  const btnPlay = document.getElementById('btn-play');
  const btnPause = document.getElementById('btn-pause');
  const btnStop = document.getElementById('btn-stop');
  const statusEl = document.getElementById('status');

  const presetGrid = document.getElementById('preset-grid');
  const rateInput = document.getElementById('rate');
  const pitchInput = document.getElementById('pitch');
  const volumeInput = document.getElementById('volume');
  const rateValue = document.getElementById('rate-value');
  const pitchValue = document.getElementById('pitch-value');
  const volumeValue = document.getElementById('volume-value');

  const toggleMore = document.getElementById('toggle-more');
  const moreContent = document.getElementById('more-content');

  const synth = window.speechSynthesis;
  let voices = [];

  // Combinaciones de velocidad / tono / volumen que aproximan cada efecto
  // usando unicamente los parametros que expone la Web Speech API.
  const PRESETS = {
    normal: { rate: 1, pitch: 1, volume: 1 },
    robot: { rate: 0.9, pitch: 0.35, volume: 1 },
    ardilla: { rate: 1.35, pitch: 2, volume: 1 },
    gigante: { rate: 0.7, pitch: 0.3, volume: 1 },
    susurro: { rate: 1.05, pitch: 0.9, volume: 0.35 },
    anciano: { rate: 0.75, pitch: 0.8, volume: 0.9 },
    bebe: { rate: 1.15, pitch: 1.8, volume: 1 },
    eco: { rate: 1, pitch: 1, volume: 1, echo: true },
  };

  let currentEffect = 'normal';

  function updateCharCount() {
    charCount.textContent = `${textInput.value.length} caracteres`;
  }

  function populateVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';

    if (!voices.length) {
      const opt = document.createElement('option');
      opt.textContent = 'Cargando voces...';
      voiceSelect.appendChild(opt);
      return;
    }

    const spanish = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));
    const others = voices.filter((v) => !v.lang.toLowerCase().startsWith('es'));

    const buildGroup = (label, list) => {
      if (!list.length) return;
      const group = document.createElement('optgroup');
      group.label = label;
      list.forEach((voice) => {
        const opt = document.createElement('option');
        opt.value = voice.name;
        opt.textContent = `${voice.name} (${voice.lang})`;
        group.appendChild(opt);
      });
      voiceSelect.appendChild(group);
    };

    buildGroup('Espanol', spanish);
    buildGroup('Otros idiomas', others);

    const jorge = spanish.find((v) => v.name.toLowerCase().includes('jorge'));
    const preferred = jorge || spanish[0] || voices[0];
    if (preferred) voiceSelect.value = preferred.name;

    updateVoiceHint(jorge);
  }

  function updateVoiceHint(jorge) {
    if (jorge) {
      voiceHint.textContent = `Voz "Jorge" detectada y seleccionada (${jorge.lang}).`;
    } else {
      voiceHint.textContent =
        'No se encontro una voz llamada "Jorge" instalada en el sistema. Se selecciono la mejor voz en espanol disponible. Puedes instalar mas voces desde la configuracion de accesibilidad / voz de tu sistema operativo.';
    }
  }

  function getSelectedVoice() {
    return voices.find((v) => v.name === voiceSelect.value);
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function applyPreset(effectId, { fromMenu = false } = {}) {
    const preset = PRESETS[effectId];
    if (!preset) return;

    currentEffect = effectId;
    rateInput.value = preset.rate;
    pitchInput.value = preset.pitch;
    volumeInput.value = preset.volume;
    refreshSliderLabels();

    document.querySelectorAll('.preset').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.effect === effectId);
    });

    if (fromMenu) {
      setStatus(`Efecto aplicado desde el menu: ${effectId}.`);
    }
  }

  function refreshSliderLabels() {
    rateValue.textContent = `${parseFloat(rateInput.value).toFixed(2)}x`;
    pitchValue.textContent = parseFloat(pitchInput.value).toFixed(2);
    volumeValue.textContent = `${Math.round(parseFloat(volumeInput.value) * 100)}%`;
  }

  function buildUtterance(text, volumeOverride) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getSelectedVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = parseFloat(rateInput.value);
    utterance.pitch = parseFloat(pitchInput.value);
    utterance.volume = volumeOverride ?? parseFloat(volumeInput.value);
    return utterance;
  }

  function speak() {
    const text = textInput.value.trim();
    if (!text) {
      setStatus('Escribe algo de texto antes de reproducir.');
      return;
    }

    synth.cancel();

    const main = buildUtterance(text);
    main.onstart = () => {
      setStatus('Reproduciendo...');
      btnPlay.disabled = true;
      btnPause.disabled = false;
      btnStop.disabled = false;
    };
    main.onend = () => {
      if (currentEffect !== 'eco') finishPlayback();
    };
    main.onerror = () => finishPlayback('Ocurrio un error al reproducir.');

    synth.speak(main);

    if (currentEffect === 'eco') {
      const echoVolume = Math.max(0.15, parseFloat(volumeInput.value) * 0.4);
      const echo = buildUtterance(text, echoVolume);
      echo.rate = parseFloat(rateInput.value) * 1.05;
      echo.onend = () => finishPlayback();
      synth.speak(echo);
    }
  }

  function finishPlayback(message) {
    setStatus(message || 'Listo.');
    btnPlay.disabled = false;
    btnPause.disabled = true;
    btnStop.disabled = true;
  }

  btnPlay.addEventListener('click', speak);

  btnPause.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setStatus('Pausado.');
      btnPause.textContent = 'Reanudar';
    } else if (synth.paused) {
      synth.resume();
      setStatus('Reproduciendo...');
      btnPause.textContent = 'Pausar';
    }
  });

  btnStop.addEventListener('click', () => {
    synth.cancel();
    btnPause.textContent = 'Pausar';
    finishPlayback('Detenido.');
  });

  [rateInput, pitchInput, volumeInput].forEach((input) => {
    input.addEventListener('input', () => {
      refreshSliderLabels();
      document.querySelectorAll('.preset').forEach((btn) => btn.classList.remove('active'));
    });
  });

  presetGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('.preset');
    if (!btn) return;
    applyPreset(btn.dataset.effect);
  });

  voiceSelect.addEventListener('change', () => {
    const voice = getSelectedVoice();
    if (voice) setStatus(`Voz seleccionada: ${voice.name} (${voice.lang}).`);
  });

  textInput.addEventListener('input', updateCharCount);

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      textInput.value = reader.result;
      updateCharCount();
      setStatus(`Archivo cargado: ${file.name}`);
    };
    reader.readAsText(file);
  });

  toggleMore.addEventListener('click', () => {
    const isHidden = moreContent.hasAttribute('hidden');
    if (isHidden) {
      moreContent.removeAttribute('hidden');
      toggleMore.textContent = 'Mas efectos sugeridos ▴';
    } else {
      moreContent.setAttribute('hidden', '');
      toggleMore.textContent = 'Mas efectos sugeridos ▾';
    }
  });

  if (window.electronAPI) {
    window.electronAPI.onApplyEffect((effectId) => applyPreset(effectId, { fromMenu: true }));
  }

  synth.onvoiceschanged = populateVoices;
  populateVoices();
  updateCharCount();
  refreshSliderLabels();
})();
