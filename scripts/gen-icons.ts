import { ensureDir, outputFile, readFile, remove } from "fs-extra";
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

const ICONS_JS_PATH = resolve(__dirname, "..", "src", "icons.js");
const ICONS_DTS_PATH = resolve(__dirname, "..", "src", "icons.d.ts");

const DIST_PATH = resolve(__dirname, "..", "dist");
const DIST_ICONS_JS_PATH = resolve(DIST_PATH, "icons.js");
const DIST_ICONS_DTS_PATH = resolve(DIST_PATH, "icons.d.ts");

const iconInterface = `export interface PhosphorIcon {
  name: string;
  content: string;
}`;

const main = async () => {
  // Ensure output directory exists
  await ensureDir(resolve(__dirname, "..", "src"));
  await ensureDir(DIST_PATH);

  // Remove previous outputs
  await remove(ICONS_JS_PATH);
  await remove(ICONS_DTS_PATH);
  await remove(DTS_TS_PATH);

  const files = glob.sync(`${ASSETS_PATH}/**/*.svg`);
  const jsLines: string[] = [];
  const dtsLines: string[] = [];

  for (const file of files) {
    const name = basename(file, ".svg");
    const content = await readFile(file, "utf-8");
    const varName = upperFirst(camelCase(name));
    const svgContent = content.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] ?? "";

    jsLines.push(
      `export const ${varName} = { name: '${name}', content: \`${svgContent}\` };`
    );
    dtsLines.push(`export declare const ${varName}: PhosphorIcon;`);
  }

  // Write icons.js and icons.d.ts
  await outputFile(ICONS_JS_PATH, jsLines.join("\n\n") + "\n");
  await outputFile(
    ICONS_DTS_PATH,
    `import type { PhosphorIcon } from './types.js';\n` +
      dtsLines.join("\n") +
      "\n"
  );

  // Write types.ts (icon interface)
  await outputFile(DTS_TS_PATH, iconInterface);

  // Rewrite index.ts to export from the new single file
  await outputFile(INDEX_TS_PATH, `export * from './icons.js';\n`);

  console.log("Single-file icon bundle generated!");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
