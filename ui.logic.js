const AsciiLogic = (window.AsciiLogic = (() => {
  const FALLBACK_RAMP = "@%#*+=-:. ";
  const BLOCK_RAMP = "\u2588\u2593\u2592\u2591 ";

  const THEMES = {
    light: {
      bg: "#f6f4ef",
      text: "#1c1b18",
    },
    dark: {
      bg: "#111214",
      text: "#eef0f2",
    },
    "light-contrast": {
      bg: "#fbfaf6",
      text: "#141311",
    },
    "dark-contrast": {
      bg: "#090a0c",
      text: "#fbfcfd",
    },
  };

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

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || !file.type.startsWith("image/")) {
        reject(new Error("Please choose a valid image."));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.onload = () => resolve({ image, dataUrl: event.target.result });
        image.onerror = () => reject(new Error("Image failed to load."));
        image.src = event.target.result;
      };
      reader.onerror = () => reject(new Error("File read failed."));
      reader.readAsDataURL(file);
    });
  }

  function applyAsciiTone(state, brightness) {
    let value = brightness;
    value = (value - 128) * (state.contrast / 100) + 128;
    value += state.brightness;
    value = clamp(value, 0, 255);
    return state.invert ? 255 - value : value;
  }

  function getRamp(state) {
    if (state.preset === "block") {
      return BLOCK_RAMP;
    }
    return state.preset === "classic"
      ? "@%#*+=-:. "
      : state.preset === "bold"
        ? "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,^`'. "
        : FALLBACK_RAMP;
  }

  function charFromBrightness(state, brightness) {
    const ramp = getRamp(state);
    const adjusted = applyAsciiTone(state, brightness);
    const index = Math.floor((adjusted / 255) * (ramp.length - 1));
    return ramp[clamp(index, 0, ramp.length - 1)];
  }

  function convertImageToAscii(imageElement, targetWidth, state) {
    const aspectRatio = imageElement.naturalHeight / imageElement.naturalWidth;
    const targetHeight = Math.max(1, Math.round(targetWidth * aspectRatio * 0.5));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

    const pixels = context.getImageData(0, 0, targetWidth, targetHeight).data;
    let ascii = "";

    for (let y = 0; y < targetHeight; y += 1) {
      let row = "";
      for (let x = 0; x < targetWidth; x += 1) {
        const index = (y * targetWidth + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        row += charFromBrightness(state, brightness);
      }
      ascii += `${row}\n`;
    }

    return {
      ascii,
      columns: targetWidth,
      rows: targetHeight,
      chars: targetWidth * targetHeight,
    };
  }

  function exportText(filename, text, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function getExportBaseName(state, ext) {
    const base = (state.imageFile && state.imageFile.name.replace(/\.[^.]+$/, "")) || "ascii-output";
    return `${base}.${ext}`;
  }

  function buildSvgDocument(state, asciiText, scale) {
    const lines = asciiText.replace(/\n$/, "").split("\n");
    const width = Math.max(1, Math.max(...lines.map((line) => line.length), 0));
    const height = Math.max(1, lines.length);
    const fontSize = 8 * scale;
    const lineHeight = 10 * scale;
    const padding = 18 * scale;
    const svgWidth = padding * 2 + width * fontSize * 0.62;
    const svgHeight = padding * 2 + height * lineHeight;
    const palette = THEMES[state.theme] || THEMES.light;

    const textNodes = lines
      .map((line, index) => {
        const y = padding + (index + 1) * lineHeight;
        return `<text x="${padding}" y="${y}" fill="${palette.text}" font-size="${fontSize}" font-family="monospace" xml:space="preserve">${escapeHtml(line)}</text>`;
      })
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(svgWidth)}" height="${Math.ceil(svgHeight)}" viewBox="0 0 ${Math.ceil(svgWidth)} ${Math.ceil(svgHeight)}">
  <rect width="100%" height="100%" fill="${palette.bg}"/>
  <g>${textNodes}</g>
</svg>`;
  }

  async function exportPng(state, asciiText, scale) {
    const lines = asciiText.replace(/\n$/, "").split("\n");
    const width = Math.max(1, Math.max(...lines.map((line) => line.length), 0));
    const height = Math.max(1, lines.length);
    const fontSize = 8 * scale;
    const lineHeight = 10 * scale;
    const padding = 18 * scale;
    const canvasWidth = Math.ceil(padding * 2 + width * fontSize * 0.62);
    const canvasHeight = Math.ceil(padding * 2 + height * lineHeight);

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d");
    const palette = THEMES[state.theme] || THEMES.light;
    context.fillStyle = palette.bg;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = palette.text;
    context.font = `${fontSize}px monospace`;
    context.textBaseline = "alphabetic";

    lines.forEach((line, index) => {
      const y = padding + (index + 1) * lineHeight;
      context.fillText(line, padding, y);
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) {
      throw new Error("PNG export failed.");
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getExportBaseName(state, "png");
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return {
    clamp,
    escapeHtml,
    formatBytes,
    loadImageFromFile,
    applyAsciiTone,
    getRamp,
    charFromBrightness,
    convertImageToAscii,
    exportText,
    getExportBaseName,
    buildSvgDocument,
    exportPng,
  };
})());
