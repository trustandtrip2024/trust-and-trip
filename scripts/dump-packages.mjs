import { build } from "esbuild";
import { writeFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { pathToFileURL } from "url";

const tmp = mkdtempSync(join(tmpdir(), "tat-dump-"));
const out = join(tmp, "data.mjs");

await build({
  entryPoints: ["src/lib/data.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
  external: [],
  loader: { ".ts": "ts" },
  logLevel: "error",
});

const mod = await import(pathToFileURL(out).href);
const { packages, destinations } = mod;

const byDest = new Map();
for (const d of destinations) byDest.set(d.slug, { dest: d, pkgs: [] });
for (const p of packages) {
  const e = byDest.get(p.destinationSlug);
  if (e) e.pkgs.push(p);
  else byDest.set(p.destinationSlug, { dest: { name: p.destinationName, slug: p.destinationSlug }, pkgs: [p] });
}

const sorted = [...byDest.values()].sort((a, b) => (a.dest.name || "").localeCompare(b.dest.name || ""));

let md = `# Trust and Trip — Packages by Destination\n\n`;
md += `Total destinations: ${destinations.length} · Total packages: ${packages.length}\n\n`;

for (const { dest, pkgs } of sorted) {
  if (pkgs.length === 0) continue;
  md += `\n## ${dest.name}${dest.country ? " — " + dest.country : ""}${dest.region ? " (" + dest.region + ")" : ""}\n`;
  if (dest.highlights?.length) md += `**Destination highlights:** ${dest.highlights.join(", ")}\n\n`;
  md += `Packages: ${pkgs.length}\n\n`;

  for (const p of pkgs) {
    md += `### ${p.title}\n`;
    md += `- **Slug:** \`${p.slug}\`\n`;
    md += `- **Price / Duration:** ₹${p.price?.toLocaleString("en-IN")} · ${p.duration} · ${p.travelType}\n`;
    if (p.categories?.length) md += `- **Categories:** ${p.categories.join(", ")}\n`;
    if (p.tags?.length) md += `- **Tags:** ${p.tags.join(", ")}\n`;
    if (p.highlights?.length) {
      md += `- **Highlights:**\n`;
      for (const h of p.highlights) md += `  - ${h}\n`;
    }
    if (p.inclusions?.length) {
      md += `- **Inclusions:**\n`;
      for (const i of p.inclusions) md += `  - ${i}\n`;
    }
    md += `\n`;
  }
}

writeFileSync("PACKAGES_BY_DESTINATION.md", md);
console.log(`Wrote PACKAGES_BY_DESTINATION.md — ${destinations.length} destinations, ${packages.length} packages`);
