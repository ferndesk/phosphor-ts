import { emptyDir, ensureDir, outputFile, readFile, remove } from "fs-extra";
import { glob } from "glob";
import { camelCase, upperFirst } from "lodash";
import { basename, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ICONS_PATH = resolve(__dirname, "..", "src", "icons");
const ASSETS_PATH = resolve(__dirname, "..", "assets");
const ICONS_TS_PATH = resolve(__dirname, "..", "src", "icons.ts");
const INDEX_TS_PATH = resolve(__dirname, "..", "src", "index.ts");
const DTS_TS_PATH = resolve(__dirname, "..", "src", "types.ts");

const iconInterface = `export interface PhosphorIcon {
  name: string;
  content: string;
}`;

const main = async () => {
  await emptyDir(ICONS_PATH);
  await ensureDir(ICONS_PATH);

  await remove(ICONS_TS_PATH);
  await remove(INDEX_TS_PATH);
  await remove(DTS_TS_PATH);

  const files = glob.sync(`${ASSETS_PATH}/**/*.svg`);
  const icons: { name: string; file: string; }[] = [];

  for (const file of files) {
    const name = basename(file, ".svg");
    const content = await readFile(file, "utf-8");

    const componentName = upperFirst(camelCase(name));

    const svgContent = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] ?? "";

    // Generate JavaScript file with the actual icon data
    const iconFile = `const icon = {
  name: '${name}',
  content: \`${svgContent}\`
};

export default icon;
`;

    // Generate lightweight TypeScript declaration stub
    const dtsFile = `import type { PhosphorIcon } from '../types.js';
declare const _default: PhosphorIcon;
export default _default;
`;

    icons.push({
      name: componentName,
      file: `${name}.js`,
    });

    // Output both JS and .d.ts files
    await outputFile(resolve(ICONS_PATH, `${name}.js`), iconFile);
    await outputFile(resolve(ICONS_PATH, `${name}.d.ts`), dtsFile);
  }

  // Generate barrel export file with .js extensions for proper ESM resolution
  const iconsTs = icons.map(icon => `export { default as ${upperFirst(camelCase(icon.file.replace('.js', '')))} } from './icons/${icon.file}';`).join("\n");
  const indexTs = `export * from './icons.js';`;

  await outputFile(ICONS_TS_PATH, iconsTs);
  await outputFile(INDEX_TS_PATH, indexTs);
  await outputFile(DTS_TS_PATH, iconInterface);

  console.log("Done!");
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
