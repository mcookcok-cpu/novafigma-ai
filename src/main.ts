figma.showUI(__html__, { width: 360, height: 520 });

figma.ui.onmessage = async (message) => {
  try {
    switch (message.type) {
      case "create-screen":
        await createScreen(message.screen);
        break;
      case "create-prototype":
        await createPrototype(message.flow);
        break;
      case "close":
        figma.closePlugin();
        break;
    }
  } catch (error) {
    figma.notify(`NovaFigma: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

async function createScreen(screen: any) {
  const frame = figma.createFrame();
  frame.name = screen.name || "NovaFigma Screen";
  frame.resize(screen.width || 390, screen.height || 844);
  frame.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.97 } }];

  const title = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  title.fontName = { family: "Inter", style: "Semi Bold" };
  title.fontSize = 24;
  title.characters = screen.title || "Nova Screen";
  title.x = 24;
  title.y = 24;
  frame.appendChild(title);

  figma.currentPage.appendChild(frame);
  figma.viewport.scrollAndZoomIntoView([frame]);
  figma.notify("Screen dibuat");
}

async function createPrototype(flow: any) {
  // Prototype engine abstraction. Figma-specific interaction mapping
  // will be added here after the UI schema is validated.
  if (!flow?.connections) throw new Error("Prototype flow tidak valid");
  figma.notify(`${flow.connections.length} koneksi prototype siap diproses`);
}
