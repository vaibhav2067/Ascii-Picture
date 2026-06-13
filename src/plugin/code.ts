// This runs in the Figma environment (separate from UI)
const ONBOARDING_STORAGE_KEY = "ascii-picture-onboarding-seen";

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const parsed = Number.parseInt(value, 16);
  return {
    r: ((parsed >> 16) & 255) / 255,
    g: ((parsed >> 8) & 255) / 255,
    b: (parsed & 255) / 255,
  };
}

function getThemePalette(theme) {
  return String(theme).startsWith("dark")
    ? { bg: "#111214", text: "#eef0f2" }
    : { bg: "#f6f4ef", text: "#1c1b18" };
}

async function insertAsciiFrame(msg) {
  const palette = getThemePalette(msg.theme);
  const asciiText = msg.asciiText || "";
  const frame = figma.createFrame();
  const textNode = figma.createText();

  await figma.loadFontAsync({ family: "Roboto Mono", style: "Regular" });

  frame.name = "ASCII Frame";
  frame.fills = [{ type: "SOLID", color: hexToRgb(palette.bg) }];
  frame.strokes = [];
  frame.strokeWeight = 0;
  frame.cornerRadius = 12;
  frame.clipsContent = false;

  textNode.fontName = { family: "Roboto Mono", style: "Regular" };
  textNode.fontSize = 8;
  textNode.lineHeight = { value: 8, unit: "PIXELS" };
  textNode.textAutoResize = "WIDTH_AND_HEIGHT";
  textNode.characters = asciiText;
  textNode.fills = [{ type: "SOLID", color: hexToRgb(palette.text) }];

  frame.appendChild(textNode);
  textNode.x = 12;
  textNode.y = 12;
  frame.resize(textNode.width + 24, textNode.height + 24);

  const center = figma.viewport.center;
  frame.x = center.x - frame.width / 2;
  frame.y = center.y - frame.height / 2;

  figma.currentPage.appendChild(frame);
  figma.viewport.scrollAndZoomIntoView([frame]);
}

figma.showUI(__html__, { width: 600, height: 600, themeColors: true });

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  // Handle any messages from the UI if needed
  if (msg.type === "insert-ascii" || msg.type === "insert-ascii-frame") {
    await insertAsciiFrame(msg);
  }

  if (msg.type === "get-onboarding-state") {
    const seen = await figma.clientStorage.getAsync(ONBOARDING_STORAGE_KEY);
    figma.ui.postMessage({
      type: "onboarding-state",
      seen: seen === "1",
    });
  }

  if (msg.type === "mark-onboarding-seen") {
    await figma.clientStorage.setAsync(ONBOARDING_STORAGE_KEY, "1");
    figma.ui.postMessage({
      type: "onboarding-seen-saved",
    });
  }

  if (msg.type === "resize") {
    figma.ui.resize(msg.width, msg.height);
  }
};

// Keep plugin alive
figma.on("selectionchange", () => {
  // Optional: handle selection changes
});
