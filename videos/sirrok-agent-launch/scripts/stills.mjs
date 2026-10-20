// Bundle một lần, chụp nhiều khung: node scripts/stills.mjs <compId> <outDir> <f1,f2,...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [comp, outDir, framesArg] = process.argv.slice(2);
const frames = framesArg.split(',').map(Number);
const browserExecutable = process.env.REMOTION_CHROME || null;
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), enableCaching: true});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
for (const frame of frames) {
  const output = path.join(outDir, `${comp}-${String(frame).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable, imageFormat: 'png'});
  console.log('ok', output);
}
