const AsciiLogic = (window.AsciiLogic = (() => {
  const FALLBACK_RAMP = "@%#*+=-:. ";
  const BLOCK_RAMP = "\u2588\u2593\u2592\u2591 ";
  const CHAR_ASPECT = 0.56;
  const BAYER_4X4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

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

  function srgbToLinear(value) {
    const channel = value / 255;
    if (channel <= 0.04045) {
      return channel / 12.92;
    }
    return ((channel + 0.055) / 1.055) ** 2.4;
  }

  function relativeLuminance(r, g, b) {
    return (
      0.2126 * srgbToLinear(r) +
      0.7152 * srgbToLinear(g) +
      0.0722 * srgbToLinear(b)
    );
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

  function createCanvas(width, height) {
    if (typeof OffscreenCanvas !== "undefined") {
      return new OffscreenCanvas(width, height);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function get2dContext(canvas) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Canvas 2D context unavailable.");
    }
    return context;
  }

  function convertImageToAscii(imageElement, targetWidth, state) {
    const sourceWidth = imageElement.naturalWidth || imageElement.width || 1;
    const sourceHeight = imageElement.naturalHeight || imageElement.height || 1;
    const aspectRatio = sourceHeight / sourceWidth;
    const targetHeight = Math.max(
      1,
      Math.round(targetWidth * aspectRatio * CHAR_ASPECT),
    );
    const canvas = createCanvas(targetWidth, targetHeight);
    const context = get2dContext(canvas);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.clearRect(0, 0, targetWidth, targetHeight);
    context.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

    const pixels = context.getImageData(0, 0, targetWidth, targetHeight).data;
    let ascii = "";
    const ditherAmplitude = 14;

    for (let y = 0; y < targetHeight; y += 1) {
      let row = "";
      for (let x = 0; x < targetWidth; x += 1) {
        const index = (y * targetWidth + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const brightness = relativeLuminance(r, g, b) * 255;
        const dither =
          (BAYER_4X4[(y & 3) * 4 + (x & 3)] / 15 - 0.5) * ditherAmplitude;
        row += charFromBrightness(state, brightness + dither);
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
    const base =
      (state.imageFile && state.imageFile.name.replace(/\.[^.]+$/, "")) ||
      "ascii-output";
    return `${base}.${ext}`;
  }

  function getAsciiExportLayout(asciiText, scale) {
    const lines = asciiText.replace(/\n$/, "").split("\n");
    const width = Math.max(1, Math.max(...lines.map((line) => line.length), 0));
    const height = Math.max(1, lines.length);
    const fontSize = 8 * scale;
    const lineHeight = 10 * scale;
    const padding = 18 * scale;
    const textWidth = width * fontSize * 0.62;
    const textHeight = height * lineHeight;
    return {
      lines,
      width,
      height,
      fontSize,
      lineHeight,
      padding,
      canvasWidth: Math.ceil(padding * 2 + textWidth),
      canvasHeight: Math.ceil(padding * 2 + textHeight),
    };
  }

  function buildSvgDocument(state, asciiText, scale) {
    const layout = getAsciiExportLayout(asciiText, scale);
    const palette = THEMES[state.theme] || THEMES.light;

    const textNodes = layout.lines
      .map((line, index) => {
        const y = layout.padding + (index + 1) * layout.lineHeight;
        return `<text x="${layout.padding}" y="${y}" fill="${palette.text}" font-size="${layout.fontSize}" font-family="monospace" xml:space="preserve">${escapeHtml(line)}</text>`;
      })
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${layout.canvasWidth}" height="${layout.canvasHeight}" viewBox="0 0 ${layout.canvasWidth} ${layout.canvasHeight}">
  <rect width="100%" height="100%" fill="${palette.bg}"/>
  <g>${textNodes}</g>
</svg>`;
  }

  async function exportPng(state, asciiText, scale) {
    const layout = getAsciiExportLayout(asciiText, scale);
    const canvas = createCanvas(layout.canvasWidth, layout.canvasHeight);
    const context = get2dContext(canvas);
    const palette = THEMES[state.theme] || THEMES.light;
    context.fillStyle = palette.bg;
    context.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight);
    context.fillStyle = palette.text;
    context.font = `${layout.fontSize}px monospace`;
    context.textBaseline = "alphabetic";
    context.textRendering = "geometricPrecision";

    layout.lines.forEach((line, index) => {
      const y = layout.padding + (index + 1) * layout.lineHeight;
      context.fillText(line, layout.padding, y);
    });

    const blob = await new Promise((resolve) => {
      if (typeof canvas.convertToBlob === "function") {
        canvas
          .convertToBlob({ type: "image/png" })
          .then(resolve, () => resolve(null));
        return;
      }
      canvas.toBlob(resolve, "image/png");
    });
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
