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

const iconInterface = `export interface Icon {
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

    const iconFile = `import type { Icon } from '../types.js';

export const ${componentName}: Icon = {
  name: '${name}',
  content: \`${svgContent}\`
}
`;

    icons.push({
      name: componentName,
      file: `${name}.ts`,
    });
    await outputFile(resolve(ICONS_PATH, `${name}.ts`), iconFile);
  }

  const iconsTs = icons.map(icon => `export * from './icons/${icon.file.replace(".ts", "")}.js';`).join("\n");
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
