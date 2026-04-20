// This runs in the Figma environment (separate from UI)
function extractTagContent(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  return match ? match[1] : "";
}

const uiBody = extractTagContent(__uiFiles__.main, "body") || __uiFiles__.main;
const uiTitle = extractTagContent(__uiFiles__.main, "title") || "ASCII Art Converter | Figma Plugin";

figma.showUI(
  `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no"
      />
      <title>${uiTitle}</title>
      <style>${__uiFiles__.styles}</style>
    </head>
    <body>
    ${uiBody}
    <script>${__uiFiles__.logic}</script>
    <script>${__uiFiles__.script}</script>
    </body>
  </html>`,
  { width: 500, height: 500, themeColors: true },
);

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  // Handle any messages from the UI if needed
  if (msg.type === "insert-ascii") {
    // Example: Insert ASCII art as text node in Figma
    const textNode = figma.createText();
    await figma.loadFontAsync({ family: "Roboto Mono", style: "Regular" });
    textNode.fontName = { family: "Roboto Mono", style: "Regular" };
    textNode.characters = msg.asciiText;
    textNode.fontSize = 8;
    figma.currentPage.appendChild(textNode);
    figma.viewport.scrollAndZoomIntoView([textNode]);
  }

  if (msg.type === "resize") {
    figma.ui.resize(msg.width, msg.height);
  }
};

// Keep plugin alive
figma.on("selectionchange", () => {
  // Optional: handle selection changes
});
