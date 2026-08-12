figma.showUI(__html__, { width: 360, height: 520 });

const TRIGGER_MAP: Record<string, Trigger> = {
  click: { type: "ON_CLICK" },
  hover: { type: "ON_HOVER" },
  drag:  { type: "ON_DRAG" },
  press: { type: "ON_PRESS" }
};

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

/**
 * Buat satu screen (frame) di halaman aktif.
 * Nama frame akan dipakai sebagai key koneksi prototype.
 */
async function createScreen(screen: any) {
  if (!screen) throw new Error("Payload screen kosong");

  const name = String(screen.name || screen.id || "Nova Screen");
  const width = Number(screen.width) || 390;
  const height = Number(screen.height) || 844;

  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(width, height);
  frame.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.97 } }];

  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Semi Bold" };
  title.fontSize = 24;
  title.characters = String(screen.title || name);
  title.x = 24;
  title.y = 24;
  frame.appendChild(title);

  figma.currentPage.appendChild(frame);
  figma.viewport.scrollAndZoomIntoView([frame]);

  figma.notify(`Screen '${name}' dibuat`);
}

/**
 * Buat koneksi prototype asli di Figma pakai reactions API:
 * - Cari node by name di semua page
 * - Set node.reactions dengan trigger + NODE action -> destinationId
 */
async function createPrototype(flow: any) {
  if (!flow?.connections || !Array.isArray(flow.connections)) {
    throw new Error("Prototype flow tidak valid");
  }

  // Kumpulkan semua frame di dokumen, di-index berdasarkan nama
  const frameIndex: Record<string, FrameNode> = {};
  for (const page of figma.root.children) {
    for (const child of page.children) {
      if (child.type === "FRAME") {
        frameIndex[child.name] = child;
      }
    }
  }

  let ok = 0;
  const failed: string[] = [];

  for (const conn of flow.connections) {
    const fromNode = frameIndex[conn.from];
    const toNode   = frameIndex[conn.to];

    if (!fromNode) {
      failed.push(`Frame '${conn.from}' tidak ditemukan`);
      continue;
    }
    if (!toNode) {
      failed.push(`Frame '${conn.to}' tidak ditemukan`);
      continue;
    }

    const trigger = TRIGGER_MAP[conn.trigger] || TRIGGER_MAP.click;

    try {
      // Reactions API: set array reaksi pada node asal
      fromNode.reactions = [
        {
          trigger,
          action: {
            type: "NODE",
            destinationId: toNode.id,
            navigation: "NAVIGATE",
            transition: null,
            preserveScrollPosition: false
          }
        }
      ];
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      failed.push(`${conn.from} → ${conn.to}: ${msg}`);
    }
  }

  let notice = `${ok} koneksi prototype dibuat`;
  if (failed.length > 0) {
    notice += `. ${failed.length} gagal (${failed.join("; ")})`;
  }
  figma.notify(notice);
}