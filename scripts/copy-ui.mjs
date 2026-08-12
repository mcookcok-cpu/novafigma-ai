import {mkdir, copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';

await mkdir('dist', {recursive:true});
await copyFile('manifest.json','dist/manifest.json');

// Salin UI agar plugin bisa load UI dari dist/
const uiSrc = 'src/ui/index.html';
if (existsSync(uiSrc)) {
  await copyFile(uiSrc, 'dist/index.html');
}