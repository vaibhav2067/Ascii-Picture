(function () {
  const state = {
    theme: "light",
    imageFile: null,
    imageDataUrl: "",
    imageElement: null,
    asciiText: "",
    preset: "classic",
    contrast: 120,
    brightness: 0,
    invert: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    panToolActive: false,
    isSpaceHeld: false,
    isPanning: false,
    dragOriginX: 0,
    dragOriginY: 0,
    dragPanX: 0,
    dragPanY: 0,
    liveRender: true,
    needsRender: false,
    exportFormat: "txt",
    exportScale: 2,
    fileToken: 0,
  };

  const MAX_FILE_SIZE = 4 * 1024 * 1024;
  const ASCII_WIDTH = 72;
  const PRESETS = {
    classic: {
      label: "Classic",
      ramp: "@%#*+=-:. ",
    },
    bold: {
      label: "Bold",
      ramp: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,^`'. ",
    },
    soft: {
      label: "Soft",
      ramp: " .:-=+*#%@",
    },
    block: {
      label: "Block",
      ramp: "\u2588\u2593\u2592\u2591 ",
    },
  };

  const BLOCK_RAMP = "\u2588\u2593\u2592\u2591 ";

  const THEMES = {
    light: {
      label: "Light",
      bg: "#f6f4ef",
      text: "#1c1b18",
    },
    dark: {
      label: "Dark",
      bg: "#111214",
      text: "#eef0f2",
    },
    "light-contrast": {
      label: "Light contrast",
      bg: "#fbfaf6",
      text: "#141311",
    },
    "dark-contrast": {
      label: "Dark contrast",
      bg: "#090a0c",
      text: "#fbfcfd",
    },
  };

  const ICONS = {
    plus: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>
    `,
    theme: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10.5 2.1a5.8 5.8 0 1 0 3.4 8.2A4.8 4.8 0 0 1 10.5 2.1Z" fill="currentColor"/>
      </svg>
    `,
    menu: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>
    `,
    mode: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.2"/>
        <path d="M5 5.2h6M5 8h3.2M5 10.8h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    `,
    tune: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 4.5h8M4 8h8M4 11.5h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        <circle cx="6" cy="4.5" r="1.2" fill="currentColor"/>
        <circle cx="10" cy="8" r="1.2" fill="currentColor"/>
        <circle cx="8" cy="11.5" r="1.2" fill="currentColor"/>
      </svg>
    `,
    classic: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.2" fill="currentColor" opacity="0.18"/>
        <path d="M4.5 11.2 11.5 4.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
    `,
    bold: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/>
        <path d="M5.4 6h5.2M5.4 8h5.2M5.4 10h3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `,
    soft: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8c2-4 8-4 10 0-2 4-8 4-10 0Z" fill="currentColor" opacity="0.22"/>
        <path d="M5 8h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    `,
    block: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="10" height="10" rx="1.5" fill="currentColor" opacity="0.22"/>
        <rect x="4.4" y="4.4" width="7.2" height="7.2" rx="1" stroke="currentColor" stroke-width="1.2"/>
      </svg>
    `,
    contrast: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.4"/>
        <path d="M8 2.5v11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
    `,
    brightness: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3" fill="currentColor"/>
        <path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `,
    invert: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2a6 6 0 1 0 0 12V2Z" fill="currentColor"/>
        <path d="M8 2a6 6 0 1 1 0 12" stroke="currentColor" stroke-width="1.2"/>
      </svg>
    `,
    pan: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2.2v11.6M2.2 8h11.6M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `,
    image: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/>
        <path d="m4 11 2.5-3 2 2 1.6-1.8 1.9 2.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="6" cy="6" r="1" fill="currentColor"/>
      </svg>
    `,
    expand: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6 3H3v3M10 3h3v3M6 13H3v-3M10 13h3v-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    zoomIn: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4" stroke="currentColor" stroke-width="1.3"/>
        <path d="M7 5.5v3M5.5 7h3M10 10l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    `,
    zoomOut: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4" stroke="currentColor" stroke-width="1.3"/>
        <path d="M5.5 7h3M10 10l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    `,
    export: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2v8M5.2 5.2 8 2.4l2.8 2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 9.5v2A1.5 1.5 0 0 0 4.5 13h7A1.5 1.5 0 0 0 13 11.5v-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `,
    chevron: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="m5 6 3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    settings: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/>
        <path d="M8 2.6v1.2M8 12.2v1.2M2.6 8h1.2M12.2 8h1.2M4.2 4.2l.85.85M10.95 10.95l.85.85M11.8 4.2l-.85.85M5.05 10.95l-.85.85" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
      </svg>
    `,
    reset: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4.2 6.4A5.2 5.2 0 1 1 3 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M4 3.5v3h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    help: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.2" stroke="currentColor" stroke-width="1.2"/>
        <path d="M6.8 6.2a1.4 1.4 0 1 1 2.1 1.2c-.7.3-1.1.8-1.1 1.6v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="8" cy="11.9" r=".8" fill="currentColor"/>
      </svg>
    `,
    txt: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 4h8M6 4v8M10 4v8M3.5 12h9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `,
    png: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2.5" y="3" width="11" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/>
        <path d="m4.2 11 2.1-2.2 1.7 1.5 1.4-1.3 2.1 2" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    svg: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3.5 5.5 8 2.5l4.5 3v5L8 13.5l-4.5-3v-5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M6 6.2h4M6 8h4M6 9.8h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `,
    scale1: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 12h2V4H4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    scale2: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 5.5a1.5 1.5 0 0 1 3 0c0 2-3 2.1-3 4.5h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    scale4: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 4v4m0 0h3m-3 0v4m8-8v8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    close: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    `,
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index += 1;
    }
    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  }

  function setIcon(el, name) {
    if (el) el.innerHTML = ICONS[name] || "";
  }

  function setStatus(message, tone = "") {
    els.statusBadge.textContent = message;
    els.statusBadge.dataset.tone = tone;
  }

  function setEmptyOutput(message) {
    els.asciiOutput.textContent = message;
    els.asciiOutput.classList.add("is-empty");
  }

  function clearEmptyOutput() {
    els.asciiOutput.classList.remove("is-empty");
  }

  function persistTheme() {
    try {
      localStorage.setItem("ascii-picture-theme", state.theme);
    } catch {
      // No-op in restricted contexts.
    }
  }

  function loadTheme() {
    try {
      const saved = localStorage.getItem("ascii-picture-theme");
      if (saved && THEMES[saved]) {
        state.theme = saved;
      }
    } catch {
      // No-op.
    }
    document.body.dataset.theme = state.theme;
    updateThemeButton();
    updateThemeOptions();
  }

  function applyTheme(theme, shouldPersist = true) {
    if (!THEMES[theme]) return;
    state.theme = theme;
    document.body.dataset.theme = theme;
    if (shouldPersist) {
      persistTheme();
    }
    updateThemeButton();
    updateThemeOptions();
    measureAndClampViewport();
  }

  function updateThemeButton() {
    setIcon(els.themeToggleBtn.querySelector("[data-icon]"), "theme");
    els.themeToggleBtn.title = `Theme: ${THEMES[state.theme].label}`;
  }

  function updateThemeOptions() {
    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      const active = button.dataset.themeOption === state.theme;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function closeDropdowns() {
    els.menuDropdown.hidden = true;
    els.exportDropdown.hidden = true;
    els.themeDropdown.hidden = true;
    els.themeToggleBtn.setAttribute("aria-expanded", "false");
    els.settingsPanel.hidden = true;
    if (els.modePopover) {
      els.modePopover.hidden = true;
      els.modeBtn.setAttribute("aria-expanded", "false");
    }
    if (els.contrastPopover) {
      els.contrastPopover.hidden = true;
      els.contrastBtn.setAttribute("aria-expanded", "false");
    }
    if (els.brightnessPopover) {
      els.brightnessPopover.hidden = true;
      els.brightnessBtn.setAttribute("aria-expanded", "false");
    }
    if (els.modePopover && els.contrastPopover && els.brightnessPopover) {
      updateModeButton();
      updateContrastButton();
      updateBrightnessButton();
    }
  }

  function toggleDropdown(dropdown, trigger, force) {
    const shouldOpen = typeof force === "boolean" ? force : dropdown.hidden;
    closeDropdowns();
    if (shouldOpen) {
      dropdown.hidden = false;
      if (trigger) {
        trigger.setAttribute("aria-expanded", "true");
      }
    } else if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  }

  function togglePopover(popover, trigger, force) {
    const shouldOpen = typeof force === "boolean" ? force : popover.hidden;
    closeDropdowns();
    if (shouldOpen) {
      popover.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    } else {
      trigger.setAttribute("aria-expanded", "false");
    }
  }

  function updatePresetButtons() {
    document.querySelectorAll("[data-preset]").forEach((button) => {
      const active = button.dataset.preset === state.preset;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function updateInvertButton() {
    els.invertToggle.classList.toggle("active", state.invert);
    els.invertToggle.setAttribute("aria-pressed", state.invert ? "true" : "false");
  }

  function updateModeButton() {
    els.modeBtn.classList.toggle("active", !els.modePopover.hidden);
  }

  function updateContrastButton() {
    const active = !els.contrastPopover.hidden || state.contrast !== 120;
    els.contrastBtn.classList.toggle("active", active);
    els.contrastBtn.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function updateBrightnessButton() {
    const active = !els.brightnessPopover.hidden || state.brightness !== 0;
    els.brightnessBtn.classList.toggle("active", active);
    els.brightnessBtn.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function updatePanButton() {
    const active = state.panToolActive || state.isSpaceHeld;
    els.panToolBtn.classList.toggle("active", active);
    els.panToolBtn.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function updateExportButtons() {
    document.querySelectorAll("[data-export-format]").forEach((button) => {
      const active = button.dataset.exportFormat === state.exportFormat;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll("[data-export-scale]").forEach((button) => {
      const active = Number(button.dataset.exportScale) === state.exportScale;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function updatePreviewThumb() {
    if (!state.imageDataUrl) {
      els.previewThumb.innerHTML = `
        <div class="preview-empty">
          <span data-icon="image"></span>
        </div>
      `;
      els.previewLarge.innerHTML = "";
      els.previewLarge.style.removeProperty("width");
      els.previewLarge.style.removeProperty("height");
      setIcon(els.previewThumb.querySelector("[data-icon]"), "image");
      return;
    }

    els.previewThumb.innerHTML = `<img src="${state.imageDataUrl}" alt="Source preview thumbnail" />`;
    els.previewLarge.innerHTML = `<img src="${state.imageDataUrl}" alt="Source preview" />`;
  }

  function updateToneValues() {
    els.contrastValue.textContent = `${state.contrast}%`;
    els.brightnessValue.textContent = state.brightness > 0 ? `+${state.brightness}` : String(state.brightness);
  }

  function syncPreviewModalSize() {
    if (!els.previewModalCard || !els.previewLarge) return;

    const image = state.imageElement;
    if (!image || !state.imageDataUrl) {
      els.previewLarge.style.removeProperty("width");
      els.previewLarge.style.removeProperty("height");
      return;
    }

    const naturalWidth = image.naturalWidth || image.width || 240;
    const naturalHeight = image.naturalHeight || image.height || 180;
    const maxWidth = Math.max(180, Math.min(window.innerWidth - 36, 420));
    const maxHeight = Math.max(120, Math.min(window.innerHeight - 120, 320));
    const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
    const width = Math.max(120, Math.round(naturalWidth * scale));
    const height = Math.max(90, Math.round(naturalHeight * scale));

    els.previewLarge.style.width = `${width}px`;
    els.previewLarge.style.height = `${height}px`;
  }

  function updateViewportText() {
    if (!state.imageFile) {
      setEmptyOutput("// add an image to begin");
      return;
    }
    clearEmptyOutput();
    els.asciiOutput.textContent = state.asciiText || "// rendering...";
  }

  function applyViewportTransform() {
    const viewport = els.viewport.getBoundingClientRect();
    const contentWidth = els.asciiOutput.scrollWidth || 1;
    const contentHeight = els.asciiOutput.scrollHeight || 1;
    const scaledWidth = contentWidth * state.zoom;
    const scaledHeight = contentHeight * state.zoom;

    const maxX = Math.max(0, (scaledWidth - viewport.width) / 2);
    const maxY = Math.max(0, (scaledHeight - viewport.height) / 2);
    state.panX = clamp(state.panX, -maxX, maxX);
    state.panY = clamp(state.panY, -maxY, maxY);

    els.viewportContent.style.setProperty("--zoom", String(state.zoom));
    els.viewportContent.style.setProperty("--pan-x", `${state.panX}px`);
    els.viewportContent.style.setProperty("--pan-y", `${state.panY}px`);
  }

  function measureAndClampViewport() {
    requestAnimationFrame(() => {
      applyViewportTransform();
    });
  }

  function applyAsciiTone(brightness) {
    return AsciiLogic.applyAsciiTone(state, brightness);
  }

  function getRamp() {
    return AsciiLogic.getRamp(state);
  }

  function charFromBrightness(brightness) {
    return AsciiLogic.charFromBrightness(state, brightness);
  }

  function loadImageFromFile(file) {
    return AsciiLogic.loadImageFromFile(file);
  }

  function convertImageToAscii(imageElement, targetWidth) {
    return AsciiLogic.convertImageToAscii(imageElement, targetWidth, state);
  }

  function setFileInfo(file) {
    if (!file) {
      setStatus("Ready to load.", "");
      return;
    }
    setStatus(`${file.name} loaded.`, "success");
  }

  async function renderAscii() {
    if (!state.imageElement) {
      state.asciiText = "";
      setEmptyOutput("// add an image to begin");
      setStatus("Ready to load.", "");
      return false;
    }

    try {
      clearEmptyOutput();
      setStatus("Rendering ASCII...", "");
      await new Promise((resolve) => setTimeout(resolve, 8));
      const result = AsciiLogic.convertImageToAscii(state.imageElement, ASCII_WIDTH, state);
      state.asciiText = result.ascii;
      els.asciiOutput.textContent = result.ascii;
      setStatus(`${result.columns} cols x ${result.rows} rows`, "success");
      measureAndClampViewport();
      return true;
    } catch (error) {
      console.error(error);
      state.asciiText = "";
      setEmptyOutput("// render failed");
      setStatus("Render failed.", "warn");
      return false;
    }
  }

  function queueRender() {
    if (!state.liveRender) {
      state.needsRender = true;
      setStatus("Live render paused.", "warn");
      return;
    }

    state.needsRender = false;
    renderAscii();
  }

  async function loadFile(file) {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setStatus("File is too large.", "warn");
      return;
    }

    const token = ++state.fileToken;
    try {
      setStatus("Loading image...", "");
      const { image, dataUrl } = await AsciiLogic.loadImageFromFile(file);
      if (token !== state.fileToken) return;

      state.imageFile = file;
      state.imageDataUrl = dataUrl;
      state.imageElement = image;
      updatePreviewThumb();
      setFileInfo(file);
      state.panX = 0;
      state.panY = 0;
      state.zoom = 1;
      updateViewportText();
      measureAndClampViewport();
      queueRender();
      syncPreviewModalSize();
    } catch (error) {
      console.warn(error);
      state.imageFile = null;
      state.imageDataUrl = "";
      state.imageElement = null;
      state.asciiText = "";
      updatePreviewThumb();
      closePreviewModal();
      setEmptyOutput("// add an image to begin");
      setStatus("Could not load that file.", "warn");
    }
  }

  function resetWorkspace() {
    state.imageFile = null;
    state.imageDataUrl = "";
    state.imageElement = null;
    state.asciiText = "";
    state.preset = "classic";
    state.contrast = 120;
    state.brightness = 0;
    state.invert = false;
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    state.panToolActive = false;
    state.isSpaceHeld = false;
    state.needsRender = false;

    els.fileInput.value = "";
    els.contrastSlider.value = String(state.contrast);
    els.brightnessSlider.value = String(state.brightness);
    els.liveRenderToggle.checked = true;
    state.liveRender = true;
    closeDropdowns();
    updatePresetButtons();
    updateInvertButton();
    updateModeButton();
    updateContrastButton();
    updateBrightnessButton();
    updateToneValues();
    updatePanButton();
    updateExportButtons();
    updatePreviewThumb();
    closePreviewModal();
    updateThemeButton();
    updateThemeOptions();
    setEmptyOutput("// add an image to begin");
    setStatus("Reset complete.", "");
    measureAndClampViewport();
  }

  function copyAsciiToClipboard() {
    if (!state.asciiText.trim()) {
      setStatus("Nothing to export yet.", "warn");
      return;
    }
    navigator.clipboard.writeText(state.asciiText).then(
      () => setStatus("Copied ASCII text.", "success"),
      () => {
        const textarea = document.createElement("textarea");
        textarea.value = state.asciiText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setStatus("Copied ASCII text.", "success");
      }
    );
  }

  function exportText(filename, text, mimeType) {
    AsciiLogic.exportText(filename, text, mimeType);
  }

  function getExportBaseName(ext) {
    return AsciiLogic.getExportBaseName(state, ext);
  }

  function exportDefaultAscii() {
    if (!state.asciiText.trim()) {
      setStatus("Nothing to export yet.", "warn");
      return;
    }
    closeDropdowns();
    exportText(getExportBaseName("txt"), state.asciiText, "text/plain;charset=utf-8");
    setStatus("TXT exported.", "success");
  }

  function buildSvgDocument(scale) {
    return AsciiLogic.buildSvgDocument(state, state.asciiText, scale);
  }

  function exportSvg(scale) {
    if (!state.asciiText.trim()) {
      setStatus("Nothing to export yet.", "warn");
      return;
    }
    closeDropdowns();
    exportText(getExportBaseName("svg"), buildSvgDocument(scale), "image/svg+xml;charset=utf-8");
    setStatus(`SVG exported at ${scale}x.`, "success");
  }

  async function exportPng(scale) {
    if (!state.asciiText.trim()) {
      setStatus("Nothing to export yet.", "warn");
      return;
    }
    closeDropdowns();

    try {
      await AsciiLogic.exportPng(state, state.asciiText, scale);
      setStatus(`PNG exported at ${scale}x.`, "success");
    } catch (error) {
      console.warn(error);
      setStatus("PNG export failed.", "warn");
    }
  }

  function exportSelected() {
    const scale = state.exportScale;
    if (state.exportFormat === "txt") {
      exportDefaultAscii();
      return;
    }
    if (state.exportFormat === "svg") {
      exportSvg(scale);
      return;
    }
    exportPng(scale);
  }

  function updateZoom(delta) {
    state.zoom = clamp(Math.round((state.zoom + delta) * 100) / 100, 0.5, 3);
    measureAndClampViewport();
    setStatus(`Zoom ${Math.round(state.zoom * 100)}%.`, "");
  }

  function beginPan(clientX, clientY) {
    if (!state.imageElement) return;
    state.isPanning = true;
    state.dragOriginX = clientX;
    state.dragOriginY = clientY;
    state.dragPanX = state.panX;
    state.dragPanY = state.panY;
    els.viewport.classList.add("is-panning");
  }

  function endPan() {
    state.isPanning = false;
    els.viewport.classList.remove("is-panning");
  }

  function canPan() {
    return state.panToolActive || state.isSpaceHeld;
  }

  function bindViewportPan() {
    els.viewport.addEventListener("pointerdown", (event) => {
      if (!canPan()) return;
      event.preventDefault();
      els.viewport.setPointerCapture(event.pointerId);
      beginPan(event.clientX, event.clientY);
    });

    els.viewport.addEventListener("pointermove", (event) => {
      if (!state.isPanning) return;
      const deltaX = event.clientX - state.dragOriginX;
      const deltaY = event.clientY - state.dragOriginY;
      state.panX = state.dragPanX + deltaX;
      state.panY = state.dragPanY + deltaY;
      applyViewportTransform();
    });

    els.viewport.addEventListener("pointerup", (event) => {
      if (state.isPanning) {
        endPan();
      }
      try {
        els.viewport.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore.
      }
    });

    els.viewport.addEventListener("pointercancel", endPan);
    els.viewport.addEventListener("pointerleave", () => {
      if (state.isPanning) endPan();
    });
  }

  function openPreviewModal() {
    if (!state.imageDataUrl) {
      setStatus("Load an image first.", "warn");
      return;
    }
    closeDropdowns();
    syncPreviewModalSize();
    els.previewModal.hidden = false;
  }

  function closePreviewModal() {
    els.previewModal.hidden = true;
  }

  function toggleSettingsPanel() {
    const shouldOpen = els.settingsPanel.hidden;
    closeDropdowns();
    els.settingsPanel.hidden = !shouldOpen;
  }

  function updateShortcutsOnKeyDown(event) {
    const isEditable = ["INPUT", "TEXTAREA"].includes(document.activeElement && document.activeElement.tagName);
    if (isEditable) return;

    if (event.code === "Space") {
      event.preventDefault();
      state.isSpaceHeld = true;
      updatePanButton();
      return;
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      updateZoom(0.1);
      return;
    }

    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      updateZoom(-0.1);
    }
  }

  function updateShortcutsOnKeyUp(event) {
    if (event.code === "Space") {
      state.isSpaceHeld = false;
      updatePanButton();
    }
  }

  function bindEvents() {
    els.addFileBtn.addEventListener("click", () => els.fileInput.click());
    els.fileInput.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) loadFile(file);
      els.fileInput.value = "";
    });

    els.themeToggleBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDropdown(els.themeDropdown, els.themeToggleBtn);
    });

    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      button.addEventListener("click", () => {
        closeDropdowns();
        applyTheme(button.dataset.themeOption);
        setStatus(`${THEMES[state.theme].label} theme enabled.`, "");
      });
    });

    els.menuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDropdown(els.menuDropdown, els.menuBtn);
    });

    els.exportMenuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDropdown(els.exportDropdown, els.exportMenuBtn);
    });

    els.settingsItem.addEventListener("click", () => toggleSettingsPanel());
    els.resetItem.addEventListener("click", () => {
      closeDropdowns();
      resetWorkspace();
    });
    els.helpItem.addEventListener("click", () => {
      closeDropdowns();
      els.settingsPanel.hidden = false;
      setStatus("Help opened.", "");
    });

    els.exportDefaultBtn.addEventListener("click", exportDefaultAscii);
    els.exportSelectedBtn.addEventListener("click", exportSelected);

    document.querySelectorAll("[data-export-format]").forEach((button) => {
      button.addEventListener("click", () => {
        state.exportFormat = button.dataset.exportFormat;
        updateExportButtons();
      });
    });

    document.querySelectorAll("[data-export-scale]").forEach((button) => {
      button.addEventListener("click", () => {
        state.exportScale = Number(button.dataset.exportScale);
        updateExportButtons();
      });
    });

    document.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        state.preset = button.dataset.preset;
        updatePresetButtons();
        closeDropdowns();
        setStatus(`${PRESETS[state.preset].label} mode selected.`, "");
        queueRender();
      });
    });

    els.modeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePopover(els.modePopover, els.modeBtn);
      updateModeButton();
    });

    els.contrastBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePopover(els.contrastPopover, els.contrastBtn);
      updateContrastButton();
    });

    els.brightnessBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePopover(els.brightnessPopover, els.brightnessBtn);
      updateBrightnessButton();
    });

    els.contrastSlider.addEventListener("input", () => {
      state.contrast = Number(els.contrastSlider.value);
      updateContrastButton();
      updateToneValues();
      if (state.liveRender) queueRender();
      else state.needsRender = true;
    });

    els.brightnessSlider.addEventListener("input", () => {
      state.brightness = Number(els.brightnessSlider.value);
      updateBrightnessButton();
      updateToneValues();
      if (state.liveRender) queueRender();
      else state.needsRender = true;
    });

    els.invertToggle.addEventListener("click", () => {
      state.invert = !state.invert;
      updateInvertButton();
      if (state.liveRender) queueRender();
      else state.needsRender = true;
    });

    els.panToolBtn.addEventListener("click", () => {
      state.panToolActive = !state.panToolActive;
      updatePanButton();
      setStatus(state.panToolActive ? "Pan tool enabled." : "Pan tool disabled.", "");
    });

    els.zoomInBtn.addEventListener("click", () => updateZoom(0.1));
    els.zoomOutBtn.addEventListener("click", () => updateZoom(-0.1));

    els.enlargePreviewBtn.addEventListener("click", openPreviewModal);
    els.previewThumb.addEventListener("click", openPreviewModal);
    els.previewModal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-preview]")) {
        closePreviewModal();
      }
    });

    els.liveRenderToggle.addEventListener("change", () => {
      state.liveRender = els.liveRenderToggle.checked;
      if (state.liveRender && state.needsRender) {
        queueRender();
      }
    });

    document.querySelectorAll("[data-close-settings]").forEach((button) => {
      button.addEventListener("click", () => {
        els.settingsPanel.hidden = true;
      });
    });

    document.addEventListener("pointerdown", (event) => {
      const insideMenu = event.target.closest(".menu-wrap");
      const insideDropdown = event.target.closest(".dropdown");
      const insidePopover = event.target.closest(".control-popover");
      const insideOverlay = event.target.closest(".overlay-card");
      if (!insideMenu && !insideDropdown && !insidePopover && !insideOverlay) {
        closeDropdowns();
      }
    });

    document.addEventListener("keydown", updateShortcutsOnKeyDown);
    document.addEventListener("keyup", updateShortcutsOnKeyUp);

    window.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    window.addEventListener("drop", (event) => {
      event.preventDefault();
      const files = event.dataTransfer && event.dataTransfer.files;
      if (files && files.length > 0) {
        loadFile(files[0]);
      }
    });

    window.addEventListener("paste", async (event) => {
      const items = event.clipboardData && event.clipboardData.items;
      if (!items) return;
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        if (item.type && item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            await loadFile(blob);
            setStatus("Image pasted from clipboard.", "success");
            break;
          }
        }
      }
    });

    window.addEventListener("resize", measureAndClampViewport);
    window.addEventListener("resize", syncPreviewModalSize);
  }

  function initializeIcons() {
    document.querySelectorAll("[data-icon]").forEach((element) => {
      const name = element.dataset.icon;
      setIcon(element, name);
    });
  }

  function init() {
    els.fileInput = $("fileInput");
    els.addFileBtn = $("addFileBtn");
    els.themeToggleBtn = $("themeToggleBtn");
    els.themeDropdown = $("themeDropdown");
    els.menuBtn = $("menuBtn");
    els.menuDropdown = $("menuDropdown");
    els.settingsItem = $("settingsItem");
    els.resetItem = $("resetItem");
    els.helpItem = $("helpItem");
    els.viewport = $("viewport");
    els.viewportContent = $("viewportContent");
    els.asciiOutput = $("asciiOutput");
    els.statusBadge = $("statusBadge");
    els.modeBtn = $("modeBtn");
    els.modePopover = $("modePopover");
    els.contrastBtn = $("contrastBtn");
    els.contrastPopover = $("contrastPopover");
    els.contrastSlider = $("contrastSlider");
    els.contrastValue = $("contrastValue");
    els.brightnessBtn = $("brightnessBtn");
    els.brightnessPopover = $("brightnessPopover");
    els.brightnessSlider = $("brightnessSlider");
    els.brightnessValue = $("brightnessValue");
    els.invertToggle = $("invertToggle");
    els.panToolBtn = $("panToolBtn");
    els.previewThumb = $("previewThumb");
    els.enlargePreviewBtn = $("enlargePreviewBtn");
    els.zoomInBtn = $("zoomInBtn");
    els.zoomOutBtn = $("zoomOutBtn");
    els.exportDefaultBtn = $("exportDefaultBtn");
    els.exportMenuBtn = $("exportMenuBtn");
    els.exportDropdown = $("exportDropdown");
    els.exportSelectedBtn = $("exportSelectedBtn");
    els.settingsPanel = $("settingsPanel");
    els.liveRenderToggle = $("liveRenderToggle");
    els.previewModal = $("previewModal");
    els.previewModalCard = $("previewModalCard");
    els.previewLarge = $("previewLarge");

    initializeIcons();
    loadTheme();
    updatePresetButtons();
    updateInvertButton();
    updateModeButton();
    updateContrastButton();
    updateBrightnessButton();
    updatePanButton();
    updateExportButtons();
    updatePreviewThumb();
    updateToneValues();
    setEmptyOutput("// add an image to begin");
    setStatus("Ready.", "");
    updateViewportText();
    bindEvents();
    bindViewportPan();
    applyViewportTransform();
    syncPreviewModalSize();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

