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
    densityIndex: 0,
    exportFormat: "figma-frame",
    fileToken: 0,
  };

  const MAX_FILE_SIZE = 4 * 1024 * 1024;
  const ASCII_BASE_WIDTH = 72;
  const DENSITY_LEVELS = [1, 2, 4, 8];
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
  };

  const TOUR_STEPS = [
    {
      selector: "#addFileBtn",
      title: "Load an image",
      body: "Start by choosing a file, dragging an image into the window, or pasting from the clipboard.",
      placement: "bottom",
    },
    {
      selector: "#themeToggleBtn",
      title: "Switch theme",
      body: "Toggle between light and dark UI themes so the workspace stays comfortable in different lighting.",
      placement: "bottom",
    },
    {
      selector: "#modeBtn",
      title: "Pick a mode",
      body: "Choose Classic, Bold, Soft, or Block to change the character ramp used in the conversion.",
      placement: "right",
    },
    {
      selector: "#contrastBtn",
      title: "Tune contrast",
      body: "Push the contrast higher for sharper character separation or lower it for a softer render.",
      placement: "right",
    },
    {
      selector: "#brightnessBtn",
      title: "Tune brightness",
      body: "Shift the image lighter or darker before it is mapped into ASCII characters.",
      placement: "right",
    },
    {
      selector: "#invertToggle",
      title: "Invert tones",
      body: "Flip the light and dark mapping when the image reads better with the opposite tonal order.",
      placement: "right",
    },
    {
      selector: "#densityBtn",
      title: "Change density",
      body: "Use denser columns for more detail or lighter density for a cleaner, looser conversion.",
      placement: "right",
    },
    {
      selector: "#panToolBtn",
      title: "Pan and zoom",
      body: "Hold Space or enable pan mode to move the artwork. Use plus and minus keys to zoom the preview.",
      placement: "right",
    },
    {
      selector: "#previewThumb",
      title: "Inspect the source",
      body: "Open the larger preview when you want to confirm the input image before exporting.",
      placement: "left",
    },
    {
      selector: "#exportMenuBtn",
      title: "Choose an export format",
      body: "Pick TXT, PNG, SVG, or Figma Frame from the menu. The main button always uses the selected format.",
      placement: "top",
    },
    {
      selector: "#exportDefaultBtn",
      title: "Run the export",
      body: "Press the main export button to send the current result using the format you selected.",
      placement: "top",
    },
  ];

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
    "theme-sun": `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.8" fill="currentColor"/>
        <path d="M8 1.7v1.4M8 12.9v1.4M1.7 8h1.4M12.9 8h1.4M3.1 3.1l1 1M11.9 11.9l1 1M12.9 3.1l-1 1M4.1 11.9l-1 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    `,
    "theme-moon": `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10.7 2.5a5.8 5.8 0 1 0 2.8 9A6.6 6.6 0 0 1 10.7 2.5Z" fill="currentColor"/>
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
    frame: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 3h10v10H3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
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
  let currentTooltipTarget = null;
  let currentTourIndex = 0;
  let currentTourTarget = null;
  let allowTourAutoOpen = true;
  let onboardingStateKnown = false;

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

  function setTooltip(el, text, position = "top") {
    if (!el || !text) return;
    el.dataset.tooltip = text;
    el.dataset.tooltipPos = position;
    if (!el.getAttribute("aria-label") && !el.textContent.trim()) {
      el.setAttribute("aria-label", text);
    }
  }

  function inferTooltipPosition(el) {
    if (el.closest(".top-right") || el.classList.contains("floating-btn")) {
      return "bottom";
    }
    return "top";
  }

  function upgradeStaticTooltips() {
    document.querySelectorAll("[title]").forEach((element) => {
      const text = element.getAttribute("title");
      if (!text) return;
      setTooltip(element, text, inferTooltipPosition(element));
      element.removeAttribute("title");
    });
  }

  function ensureTooltipLayer() {
    if (els.appTooltip) return els.appTooltip;
    const tooltip = document.createElement("div");
    tooltip.className = "app-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    document.body.appendChild(tooltip);
    els.appTooltip = tooltip;
    return tooltip;
  }

  function hideTooltip() {
    const tooltip = els.appTooltip;
    if (!tooltip) return;
    tooltip.classList.remove("is-open");
    tooltip.hidden = true;
    currentTooltipTarget = null;
  }

  function positionTooltip(target) {
    const tooltip = ensureTooltipLayer();
    const text = target && target.dataset ? target.dataset.tooltip : "";
    if (!text) {
      hideTooltip();
      return;
    }

    tooltip.textContent = text;
    tooltip.hidden = false;
    tooltip.classList.remove("is-open");

    const rect = target.getBoundingClientRect();
    const preferred = target.dataset.tooltipPos || inferTooltipPosition(target);
    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 10;
    const spacing = 12;
    const spaces = {
      top: rect.top,
      bottom: window.innerHeight - rect.bottom,
      left: rect.left,
      right: window.innerWidth - rect.right,
    };

    let side = preferred;
    if ((side === "top" && spaces.top < tooltipRect.height + spacing) || (!["top", "bottom", "left", "right"].includes(side))) {
      side = spaces.bottom >= spaces.top ? "bottom" : "top";
    }

    if (side === "bottom" && spaces.bottom < tooltipRect.height + spacing && spaces.top > spaces.bottom) {
      side = "top";
    }

    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - spacing;

    if (side === "bottom") {
      top = rect.bottom + spacing;
    } else if (side === "left") {
      left = rect.left - tooltipRect.width - spacing;
      top = rect.top + rect.height / 2 - tooltipRect.height / 2;
    } else if (side === "right") {
      left = rect.right + spacing;
      top = rect.top + rect.height / 2 - tooltipRect.height / 2;
    }

    left = clamp(left, margin, Math.max(margin, window.innerWidth - tooltipRect.width - margin));
    top = clamp(top, margin, Math.max(margin, window.innerHeight - tooltipRect.height - margin));

    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
    tooltip.dataset.side = side;
    tooltip.classList.add("is-open");
    currentTooltipTarget = target;
  }

  function showTooltip(target) {
    if (!target || !target.dataset || !target.dataset.tooltip) {
      hideTooltip();
      return;
    }
    positionTooltip(target);
  }

  function bindTooltipEvents() {
    const findTooltipTarget = (node) => (node && node.closest ? node.closest("[data-tooltip]") : null);

    document.addEventListener("pointerover", (event) => {
      const target = findTooltipTarget(event.target);
      if (target) {
        showTooltip(target);
        return;
      }
      hideTooltip();
    });

    document.addEventListener("pointerout", (event) => {
      const target = findTooltipTarget(event.target);
      if (!target || target !== currentTooltipTarget) return;
      const related = findTooltipTarget(event.relatedTarget);
      if (related === target) return;
      hideTooltip();
    });

    document.addEventListener("focusin", (event) => {
      const target = findTooltipTarget(event.target);
      if (target) {
        showTooltip(target);
      }
    });

    document.addEventListener("focusout", (event) => {
      const target = findTooltipTarget(event.target);
      if (target && target === currentTooltipTarget) {
        hideTooltip();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideTooltip();
      }
    });

    window.addEventListener("resize", () => {
      if (currentTooltipTarget) {
        positionTooltip(currentTooltipTarget);
      }
    });
  }

  function updateRangeFill(input) {
    if (!input) return;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value || 0);
    const percent = ((value - min) / (max - min)) * 100;
    input.style.setProperty("--range-progress", `${percent}%`);
  }

  function getTourStep(index = currentTourIndex) {
    return TOUR_STEPS[Math.max(0, Math.min(index, TOUR_STEPS.length - 1))];
  }

  function setTourVisible(visible) {
    if (!els.tourOverlay) return;
    els.tourOverlay.hidden = !visible;
    if (!visible) {
      if (currentTourTarget) {
        currentTourTarget.classList.remove("tour-target-highlight");
      }
      currentTourTarget = null;
    }
  }

  function closeTour(markSeen = true) {
    allowTourAutoOpen = false;
    setTourVisible(false);
    hideTooltip();
    if (markSeen) {
      window.parent.postMessage(
        {
          pluginMessage: {
            type: "mark-onboarding-seen",
          },
        },
        "*",
      );
    }
  }

  function positionTourCard(target, placement) {
    if (!els.tourCard) return;
    const rect = target.getBoundingClientRect();
    const card = els.tourCard;
    const padding = 12;
    const gap = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardRect = card.getBoundingClientRect();

    const preferredSide = placement || "right";
    const candidateSides = [preferredSide, "right", "left", "top", "bottom"].filter((side, index, list) => list.indexOf(side) === index);

    const available = {
      top: rect.top - padding,
      bottom: viewportHeight - rect.bottom - padding,
      left: rect.left - padding,
      right: viewportWidth - rect.right - padding,
    };

    const buildCandidate = (side) => {
      let left = rect.right + gap;
      let top = rect.top + rect.height / 2 - cardRect.height / 2;

      if (side === "left") {
        left = rect.left - cardRect.width - gap;
      } else if (side === "top") {
        left = rect.left + rect.width / 2 - cardRect.width / 2;
        top = rect.top - cardRect.height - gap;
      } else if (side === "bottom") {
        left = rect.left + rect.width / 2 - cardRect.width / 2;
        top = rect.bottom + gap;
      }

      const clampedLeft = clamp(left, padding, Math.max(padding, viewportWidth - cardRect.width - padding));
      const clampedTop = clamp(top, padding, Math.max(padding, viewportHeight - cardRect.height - padding));
      const overflowLeft = Math.max(0, padding - left);
      const overflowRight = Math.max(0, left + cardRect.width - (viewportWidth - padding));
      const overflowTop = Math.max(0, padding - top);
      const overflowBottom = Math.max(0, top + cardRect.height - (viewportHeight - padding));
      const score = overflowLeft + overflowRight + overflowTop + overflowBottom;

      return {
        side,
        left: clampedLeft,
        top: clampedTop,
        score,
        distanceFromTarget: Math.abs(clampedLeft - left) + Math.abs(clampedTop - top),
        fits:
          left >= padding &&
          top >= padding &&
          left + cardRect.width <= viewportWidth - padding &&
          top + cardRect.height <= viewportHeight - padding,
      };
    };

    const rankedCandidates = candidateSides
      .map((side) => {
        const candidate = buildCandidate(side);
        const space = available[side] ?? 0;
        return {
          ...candidate,
          priority: side === preferredSide ? 0 : 1,
          space,
        };
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        if (a.fits !== b.fits) return a.fits ? -1 : 1;
        if (a.score !== b.score) return a.score - b.score;
        if (b.space !== a.space) return b.space - a.space;
        return a.distanceFromTarget - b.distanceFromTarget;
      });

    const chosen = rankedCandidates[0] || buildCandidate(preferredSide);
    card.dataset.placement = chosen.side;
    card.style.left = `${Math.round(chosen.left)}px`;
    card.style.top = `${Math.round(chosen.top)}px`;
  }

  function positionTourSpotlight(target) {
    if (!els.tourSpotlight) return;
    const rect = target.getBoundingClientRect();
    const padding = 6;
    const borderRadius = window.getComputedStyle(target).borderRadius || "12px";
    els.tourSpotlight.style.left = `${Math.max(0, Math.round(rect.left - padding))}px`;
    els.tourSpotlight.style.top = `${Math.max(0, Math.round(rect.top - padding))}px`;
    els.tourSpotlight.style.width = `${Math.max(0, Math.round(rect.width + padding * 2))}px`;
    els.tourSpotlight.style.height = `${Math.max(0, Math.round(rect.height + padding * 2))}px`;
    els.tourSpotlight.style.borderRadius = borderRadius;
  }

  function updateTourUI() {
    const step = getTourStep();
    if (!step) return;
    const total = TOUR_STEPS.length;
    const stepNumber = currentTourIndex + 1;
    const target = document.querySelector(step.selector);
    if (!target) {
      const nextIndex = currentTourIndex + 1;
      if (nextIndex < total) {
        currentTourIndex = nextIndex;
        updateTourUI();
        return;
      }
      closeTour(true);
      return;
    }

    if (currentTourTarget && currentTourTarget !== target) {
      currentTourTarget.classList.remove("tour-target-highlight");
    }
    currentTourTarget = target;
    target.classList.add("tour-target-highlight");

    if (els.tourTitle) els.tourTitle.textContent = step.title;
    if (els.tourBody) els.tourBody.textContent = step.body;
    if (els.tourStepLabel) els.tourStepLabel.textContent = `Step ${stepNumber} of ${total}`;
    if (els.tourProgressFill) els.tourProgressFill.style.width = `${(stepNumber / total) * 100}%`;
    if (els.tourBackBtn) els.tourBackBtn.disabled = currentTourIndex === 0;
    if (els.tourNextBtn) els.tourNextBtn.textContent = currentTourIndex === total - 1 ? "Finish" : "Next";

    setTourVisible(true);
    requestAnimationFrame(() => {
      positionTourSpotlight(target);
      positionTourCard(target, step.placement);
    });
  }

  function startTour(fromStart = true) {
    closeDropdowns(true);
    hideTooltip();
    currentTourIndex = fromStart ? 0 : Math.max(0, currentTourIndex);
    updateTourUI();
  }

  function goToNextTourStep() {
    if (currentTourIndex >= TOUR_STEPS.length - 1) {
      closeTour(true);
      return;
    }
    currentTourIndex += 1;
    updateTourUI();
  }

  function goToPreviousTourStep() {
    if (currentTourIndex <= 0) return;
    currentTourIndex -= 1;
    updateTourUI();
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

  function normalizeTheme(theme) {
    return String(theme).startsWith("dark") ? "dark" : "light";
  }

  function loadTheme() {
    try {
      const saved = localStorage.getItem("ascii-picture-theme");
      if (saved) {
        state.theme = normalizeTheme(saved);
      }
    } catch {
      // No-op.
    }
    document.body.dataset.theme = state.theme;
    updateThemeButton();
  }

  function applyTheme(theme, shouldPersist = true) {
    if (!THEMES[theme]) return;
    state.theme = theme;
    document.body.dataset.theme = theme;
    if (shouldPersist) {
      persistTheme();
    }
    updateThemeButton();
    measureAndClampViewport();
  }

  function updateThemeButton() {
    const isDark = state.theme === "dark";
    els.themeToggleBtn.classList.toggle("is-dark", isDark);
    els.themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
    els.themeToggleLabel.textContent = isDark ? "Dark" : "Light";
    setTooltip(els.themeToggleBtn, `Switch to ${isDark ? "light" : "dark"} mode`, "bottom");
  }

  function closeDropdowns(skipTour = false) {
    els.menuDropdown.hidden = true;
    els.exportDropdown.hidden = true;
    els.settingsPanel.hidden = true;
    if (els.versionPanel) {
      els.versionPanel.hidden = true;
    }
    hideTooltip();
    if (!skipTour) {
      closeTour(false);
    }
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

  function openExternalLink(url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function toggleVersionPanel(force) {
    const shouldOpen = typeof force === "boolean" ? force : els.versionPanel.hidden;
    closeDropdowns();
    els.versionPanel.hidden = !shouldOpen;
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

  function updateDensityButton() {
    const scale = DENSITY_LEVELS[state.densityIndex] || 1;
    const columns = ASCII_BASE_WIDTH * scale;
    els.densityLabel.textContent = `${scale}x`;
    els.densityBtn.setAttribute("aria-pressed", scale === 1 ? "false" : "true");
    setTooltip(els.densityBtn, `Column density ${scale}x, ${columns} columns`, "top");
  }

  function cycleDensity() {
    state.densityIndex = (state.densityIndex + 1) % DENSITY_LEVELS.length;
    updateDensityButton();
    const scale = DENSITY_LEVELS[state.densityIndex] || 1;
    setStatus(`Density set to ${scale}x (${ASCII_BASE_WIDTH * scale} cols).`, "");
    queueRender();
  }

  function updateExportButtons() {
    document.querySelectorAll("[data-export-format]").forEach((button) => {
      const active = button.dataset.exportFormat === state.exportFormat;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const exportLabels = {
      txt: "TXT",
      png: "PNG",
      svg: "SVG",
      "figma-frame": "Figma Frame",
    };
    const exportIcons = {
      txt: "txt",
      png: "png",
      svg: "svg",
      "figma-frame": "frame",
    };
    const selectedLabel = exportLabels[state.exportFormat] || "Figma Frame";
    const selectedIcon = exportIcons[state.exportFormat] || "frame";
    if (els.exportMainLabel) {
      els.exportMainLabel.textContent = `Export ${selectedLabel}`;
    }
    if (els.exportSelectedLabel) {
      els.exportSelectedLabel.textContent = `Export ${selectedLabel}`;
    }
    if (els.exportMainIcon) {
      setIcon(els.exportMainIcon, selectedIcon);
    }
    if (els.exportSelectedIcon) {
      setIcon(els.exportSelectedIcon, selectedIcon);
    }
    if (els.exportDefaultBtn) {
      setTooltip(els.exportDefaultBtn, `Export current format: ${selectedLabel}`, "top");
    }
    if (els.exportSelectedBtn) {
      setTooltip(els.exportSelectedBtn, `Export as ${selectedLabel}`, "top");
    }
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
    updateRangeFill(els.contrastSlider);
    updateRangeFill(els.brightnessSlider);
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
    const fitScale = Math.min(
      (viewport.width - 24) / contentWidth,
      (viewport.height - 24) / contentHeight,
      1
    );
    const contentScale = state.zoom * fitScale;
    const scaledWidth = contentWidth * contentScale;
    const scaledHeight = contentHeight * contentScale;

    const maxX = Math.max(0, (scaledWidth - viewport.width) / 2);
    const maxY = Math.max(0, (scaledHeight - viewport.height) / 2);
    state.panX = clamp(state.panX, -maxX, maxX);
    state.panY = clamp(state.panY, -maxY, maxY);

    els.viewportContent.style.setProperty("--zoom", String(state.zoom));
    els.viewportContent.style.setProperty("--fit-scale", String(fitScale));
    els.viewportContent.style.setProperty("--content-scale", String(contentScale));
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
      const scale = DENSITY_LEVELS[state.densityIndex] || 1;
      const result = AsciiLogic.convertImageToAscii(state.imageElement, ASCII_BASE_WIDTH * scale, state);
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
    state.densityIndex = 0;

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
    updateDensityButton();
    updateExportButtons();
    updatePreviewThumb();
    closePreviewModal();
    updateThemeButton();
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
    exportSelected();
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
    setStatus("SVG exported.", "success");
  }

  async function exportPng(scale) {
    if (!state.asciiText.trim()) {
      setStatus("Nothing to export yet.", "warn");
      return;
    }
    closeDropdowns();

    try {
      await AsciiLogic.exportPng(state, state.asciiText, scale);
      setStatus("PNG exported.", "success");
    } catch (error) {
      console.warn(error);
      setStatus("PNG export failed.", "warn");
    }
  }

  function exportFigmaFrame() {
    if (!state.asciiText.trim()) {
      setStatus("Nothing to export yet.", "warn");
      return;
    }

    closeDropdowns();
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "insert-ascii-frame",
          asciiText: state.asciiText,
          theme: state.theme,
        },
      },
      "*",
    );
    setStatus("Figma frame sent to canvas.", "success");
  }

  function exportSelected() {
    if (state.exportFormat === "txt") {
      if (!state.asciiText.trim()) {
        setStatus("Nothing to export yet.", "warn");
        return;
      }
      closeDropdowns();
      exportText(getExportBaseName("txt"), state.asciiText, "text/plain;charset=utf-8");
      setStatus("TXT exported.", "success");
      return;
    }
    if (state.exportFormat === "svg") {
      exportSvg(1);
      return;
    }
    if (state.exportFormat === "figma-frame") {
      exportFigmaFrame();
      return;
    }
    exportPng(1);
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
      closeDropdowns();
      applyTheme(state.theme === "dark" ? "light" : "dark");
      setStatus(`${THEMES[state.theme].label} theme enabled.`, "");
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
      startTour(true);
      setStatus("Tour opened.", "");
    });
    els.joinUsItem.addEventListener("click", () => {
      closeDropdowns();
      openExternalLink("https://discord.gg/Y24autEQG9");
      setStatus("Join Us opened in a new tab.", "");
    });
    els.communityItem.addEventListener("click", () => {
      closeDropdowns();
      openExternalLink("https://www.figma.com/@dimastudio");
      setStatus("Community opened in a new tab.", "");
    });
    els.versionNoteItem.addEventListener("click", () => {
      toggleVersionPanel(true);
      setStatus("Version note opened.", "");
    });

    els.exportDefaultBtn.addEventListener("click", exportDefaultAscii);
    els.exportSelectedBtn.addEventListener("click", exportSelected);

    els.densityBtn.addEventListener("click", () => {
      cycleDensity();
    });

    document.querySelectorAll("[data-export-format]").forEach((button) => {
      button.addEventListener("click", () => {
        state.exportFormat = button.dataset.exportFormat;
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

    document.querySelectorAll("[data-close-version]").forEach((button) => {
      button.addEventListener("click", () => {
        els.versionPanel.hidden = true;
      });
    });

    document.querySelectorAll("[data-tour-skip]").forEach((button) => {
      button.addEventListener("click", () => {
        closeTour(true);
      });
    });

    if (els.tourOverlay) {
      els.tourOverlay.addEventListener("click", (event) => {
        if (event.target.closest("[data-tour-dismiss]")) {
          closeTour(true);
        }
      });
    }

    if (els.tourBackBtn) {
      els.tourBackBtn.addEventListener("click", () => {
        goToPreviousTourStep();
      });
    }

    if (els.tourNextBtn) {
      els.tourNextBtn.addEventListener("click", () => {
        goToNextTourStep();
      });
    }

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
    window.addEventListener("resize", () => {
      if (currentTourTarget) {
        const step = getTourStep();
        if (!step) return;
        requestAnimationFrame(() => {
          positionTourSpotlight(currentTourTarget);
          positionTourCard(currentTourTarget, step.placement);
        });
      }
    });
  }

  function initializeIcons() {
    document.querySelectorAll("[data-icon]").forEach((element) => {
      const name = element.dataset.icon;
      setIcon(element, name);
    });
  }

  function requestOnboardingState() {
    window.parent.postMessage(
      {
        pluginMessage: {
          type: "get-onboarding-state",
        },
      },
      "*",
    );
  }

  function bindPluginMessages() {
    window.addEventListener("message", (event) => {
      const msg = event.data && event.data.pluginMessage;
      if (!msg) return;

      if (msg.type === "onboarding-state") {
        onboardingStateKnown = true;
        if (!msg.seen && allowTourAutoOpen) {
          setTimeout(() => startTour(true), 180);
        }
      }
    });
  }

  function init() {
    els.fileInput = $("fileInput");
    els.addFileBtn = $("addFileBtn");
    els.themeToggleBtn = $("themeToggleBtn");
    els.themeToggleLabel = $("themeToggleLabel");
    els.menuBtn = $("menuBtn");
    els.menuDropdown = $("menuDropdown");
    els.settingsItem = $("settingsItem");
    els.resetItem = $("resetItem");
    els.helpItem = $("helpItem");
    els.joinUsItem = $("joinUsItem");
    els.communityItem = $("communityItem");
    els.versionNoteItem = $("versionNoteItem");
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
    els.densityBtn = $("densityBtn");
    els.densityLabel = $("densityLabel");
    els.previewThumb = $("previewThumb");
    els.enlargePreviewBtn = $("enlargePreviewBtn");
    els.zoomInBtn = $("zoomInBtn");
    els.zoomOutBtn = $("zoomOutBtn");
    els.exportDefaultBtn = $("exportDefaultBtn");
    els.exportMainIcon = $("exportMainIcon");
    els.exportMainLabel = $("exportMainLabel");
    els.exportMenuBtn = $("exportMenuBtn");
    els.exportDropdown = $("exportDropdown");
    els.exportSelectedBtn = $("exportSelectedBtn");
    els.exportSelectedIcon = $("exportSelectedIcon");
    els.exportSelectedLabel = $("exportSelectedLabel");
    els.settingsPanel = $("settingsPanel");
    els.versionPanel = $("versionPanel");
    els.tourOverlay = $("tourOverlay");
    els.tourCard = $("tourCard");
    els.tourSpotlight = $("tourSpotlight");
    els.tourTitle = $("tourTitle");
    els.tourBody = $("tourBody");
    els.tourStepLabel = $("tourStepLabel");
    els.tourProgressFill = $("tourProgressFill");
    els.tourBackBtn = $("tourBackBtn");
    els.tourNextBtn = $("tourNextBtn");
    els.liveRenderToggle = $("liveRenderToggle");
    els.previewModal = $("previewModal");
    els.previewModalCard = $("previewModalCard");
    els.previewLarge = $("previewLarge");

    initializeIcons();
    bindPluginMessages();
    upgradeStaticTooltips();
    bindTooltipEvents();
    loadTheme();
    updatePresetButtons();
    updateInvertButton();
    updateModeButton();
    updateContrastButton();
    updateBrightnessButton();
    updatePanButton();
    updateDensityButton();
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
    requestOnboardingState();
    window.setTimeout(() => {
      if (!onboardingStateKnown) {
        allowTourAutoOpen = false;
      }
    }, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

