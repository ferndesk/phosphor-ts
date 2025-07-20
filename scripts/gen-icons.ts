import { ensureDir, outputFile, readFile, remove } from "fs-extra";
import { glob } from "glob";
import { camelCase, upperFirst } from "lodash";
import { basename, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INDEX_MJS_PATH = resolve(__dirname, "..", "src", "index.mjs");
const INDEX_DTS_PATH = resolve(__dirname, "..", "src", "index.d.ts");
const INDEX_MJS_DTS_PATH = resolve(__dirname, "..", "src", "index.mjs.d.ts");
const INDEX_TS_PATH = resolve(__dirname, "..", "src", "index.ts");
const ASSETS_PATH = resolve(__dirname, "..", "assets");

const main = async () => {
  // Ensure output directory exists
  await ensureDir(resolve(__dirname, "..", "src"));

  // Remove previous outputs
  await remove(INDEX_MJS_PATH);
  await remove(INDEX_DTS_PATH);
  await remove(INDEX_MJS_DTS_PATH);
  await remove(INDEX_TS_PATH);
  // Remove old types.ts if it exists
  await remove(resolve(__dirname, "..", "src", "types.ts"));

  const files = glob.sync(`${ASSETS_PATH}/**/*.svg`);
  const jsLines: string[] = [];
  const dtsLines: string[] = [];

  for (const file of files) {
    const name = basename(file, ".svg");
    const content = await readFile(file, "utf-8");
    const varName = upperFirst(camelCase(name));
    const svgContent = content.match(/<svg[^>]*>(.*?)<\/svg>/s)?.[1] || "";

    jsLines.push(
      `export const ${varName} = { name: '${name}', content: \`${svgContent}\` };`
    );
    dtsLines.push(`export declare const ${varName}: PhosphorIcon;`);
  }

  // Write the main index.mjs file with all icons
  await outputFile(INDEX_MJS_PATH, jsLines.join("\n\n") + "\n");

  // Write the index.d.ts file with the interface and all icon declarations
  const indexDtsContent = `export interface PhosphorIcon {
  name: string;
  content: string;
}

${dtsLines.join("\n")}
`;
  await outputFile(INDEX_DTS_PATH, indexDtsContent);

  // Write index.mjs.d.ts that TypeScript can find for the index.mjs import
  await outputFile(INDEX_MJS_DTS_PATH, `export * from './index.d.ts';\n`);

  // Write a simple index.ts that re-exports from index.mjs for TypeScript compilation
  await outputFile(INDEX_TS_PATH, `export * from './index.mjs';\n`);

  console.log(`✅ Generated ${files.length} icons in index.mjs and index.d.ts`);
};

main().catch(console.error);
