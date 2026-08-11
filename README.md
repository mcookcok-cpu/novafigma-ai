# NovaFigma AI

Open-source Figma plugin scaffold for generating UI and prototype flows.

## Development
1. Install Node.js.
2. Run `npm install`
3. Run `npm run build`
4. In Figma: Plugins → Development → Import plugin from manifest...
5. Select `dist/manifest.json`.

## Architecture
Prompt/UI → UI JSON schema → validator → Figma renderer → prototype engine.
