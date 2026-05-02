// One-shot: TS data → markdown → HTML → PDF via Playwright.
// Run: node scripts/dump-packages-pdf.mjs
import { build } from "esbuild";
import { writeFileSync, readFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { pathToFileURL } from "url";
import { chromium } from "playwright";

const tmp = mkdtempSync(join(tmpdir(), "tat-pdf-"));
const out = join(tmp, "data.mjs");

await build({
  entryPoints: ["src/lib/data.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: out,
  loader: { ".ts": "ts" },
  logLevel: "error",
});

const { packages, destinations } = await import(pathToFileURL(out).href);

const byDest = new Map();
for (const d of destinations) byDest.set(d.slug, { dest: d, pkgs: [] });
for (const p of packages) {
  const e = byDest.get(p.destinationSlug);
  if (e) e.pkgs.push(p);
  else byDest.set(p.destinationSlug, { dest: { name: p.destinationName, slug: p.destinationSlug }, pkgs: [p] });
}
const sorted = [...byDest.values()]
  .filter(({ pkgs }) => pkgs.length > 0)
  .sort((a, b) => (a.dest.name || "").localeCompare(b.dest.name || ""));

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inr = (n) => "₹" + (n ?? 0).toLocaleString("en-IN");

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

let body = "";
body += `<section class="cover"><h1>Trust and Trip</h1><p class="cover-sub">Packages by Destination</p>`;
body += `<p class="meta">${destinations.length} destinations · ${packages.length} packages · Generated ${new Date().toLocaleDateString("en-IN")}</p></section>`;

// Table of contents (clickable in most PDF viewers)
body += `<section class="toc"><h2>Contents</h2><ol>`;
for (const { dest, pkgs } of sorted) {
  const id = "dest-" + slugify(dest.slug || dest.name);
  body += `<li><a href="#${id}"><span class="toc-name">${esc(dest.name)}</span><span class="toc-dots"></span><span class="toc-count">${pkgs.length} pkg${pkgs.length === 1 ? "" : "s"}</span></a></li>`;
}
body += `</ol></section>`;

for (const { dest, pkgs } of sorted) {
  const id = "dest-" + slugify(dest.slug || dest.name);
  body += `<section class="dest" id="${id}"><h2>${esc(dest.name)}${dest.country ? " — " + esc(dest.country) : ""}${dest.region ? ` <span class="region">(${esc(dest.region)})</span>` : ""}</h2>`;
  if (dest.highlights?.length)
    body += `<p class="dest-hl"><strong>Destination highlights:</strong> ${dest.highlights.map(esc).join(", ")}</p>`;
  body += `<p class="count">${pkgs.length} package${pkgs.length === 1 ? "" : "s"}</p>`;

  for (const p of pkgs) {
    body += `<article class="pkg">`;
    body += `<h3>${esc(p.title)}</h3>`;
    const pp = p.priceBreakdown?.doubleSharing ?? p.price;
    body += `<p class="pkg-meta"><strong>${inr(pp)} <span class="pp">per person</span></strong> · ${esc(p.duration)} · ${esc(p.travelType)} · <code>${esc(p.slug)}</code></p>`;
    if (p.priceBreakdown) {
      const pb = p.priceBreakdown;
      const parts = [];
      if (pb.tripleSharing) parts.push(`Triple ${inr(pb.tripleSharing)}`);
      if (pb.singleSupplement) parts.push(`Single supplement ${inr(pb.singleSupplement)}`);
      if (pb.childUnder12) parts.push(`Child <12 ${inr(pb.childUnder12)}`);
      if (pb.childUnder5 != null) parts.push(`Child <5 ${pb.childUnder5 === 0 ? "Free" : inr(pb.childUnder5)}`);
      if (parts.length) body += `<p class="pkg-pb">${parts.join(" · ")}</p>`;
    }
    if (p.categories?.length)
      body += `<p><strong>Categories:</strong> ${p.categories.map(esc).join(", ")}</p>`;
    if (p.tags?.length) body += `<p><strong>Tags:</strong> ${p.tags.map(esc).join(", ")}</p>`;
    if (p.highlights?.length) {
      body += `<p><strong>Highlights:</strong></p><ul>`;
      for (const h of p.highlights) body += `<li>${esc(h)}</li>`;
      body += `</ul>`;
    }
    if (p.inclusions?.length) {
      body += `<p><strong>Inclusions:</strong></p><ul>`;
      for (const i of p.inclusions) body += `<li>${esc(i)}</li>`;
      body += `</ul>`;
    }
    body += `</article>`;
  }
  body += `</section>`;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><title>TAT Packages</title>
<style>
  @page { size: A4; margin: 18mm 14mm; }
  * { box-sizing: border-box; }
  body { font: 10pt/1.45 -apple-system, "Segoe UI", Roboto, sans-serif; color: #2a2a2a; background: #fbf7f1; padding: 0; margin: 0; }
  h1 { font-size: 30pt; color: #094948; margin: 0 0 4pt; letter-spacing: -0.5pt; }
  .meta { color: #6b7280; font-size: 9pt; margin: 0 0 18pt; }

  /* Cover page */
  section.cover { page-break-after: always; padding-top: 30vh; text-align: center; }
  .cover-sub { font-size: 14pt; color: #c8932a; margin: 0 0 12pt; letter-spacing: 1pt; }

  /* Table of contents */
  section.toc { page-break-after: always; }
  section.toc h2 { color: #094948; font-size: 18pt; margin: 0 0 12pt; }
  section.toc ol { list-style: none; padding: 0; margin: 0; counter-reset: toc; }
  section.toc li { counter-increment: toc; margin: 4pt 0; padding: 3pt 0; border-bottom: 0.5pt dotted #c8932a55; }
  section.toc li::before { content: counter(toc, decimal-leading-zero) "  "; color: #c8932a; font-weight: 600; font-size: 9pt; }
  section.toc a { color: #2a2a2a; text-decoration: none; display: inline-flex; align-items: baseline; gap: 6pt; width: calc(100% - 30pt); }
  section.toc .toc-name { font-size: 11pt; }
  section.toc .toc-dots { flex: 1; }
  section.toc .toc-count { color: #6b7280; font-size: 9pt; }

  /* One destination per page */
  section.dest { page-break-before: always; padding-top: 4pt; }
  section.dest:first-of-type { /* first dest still gets break — toc is before */ }
  h2 { color: #0e7c7b; font-size: 16pt; margin: 0 0 4pt; }
  h2 .region { color: #6b7280; font-size: 10pt; font-weight: 400; }
  .dest-hl, .count { font-size: 9pt; color: #3a3a3a; margin: 0 0 6pt; }
  .count { color: #6b7280; }
  article.pkg { page-break-inside: avoid; margin: 8pt 0 10pt; padding: 8pt 10pt; background: #fff; border-left: 3pt solid #e87b3d; border-radius: 2pt; }
  h3 { color: #2a2a2a; font-size: 11pt; margin: 0 0 3pt; }
  .pkg-meta { font-size: 9pt; color: #3a3a3a; margin: 0 0 5pt; }
  .pkg-meta code { background: #f5e6d3; padding: 1pt 4pt; border-radius: 2pt; font-size: 8.5pt; }
  .pkg-meta .pp { font-size: 8pt; font-weight: 400; color: #6b7280; }
  .pkg-pb { font-size: 8.5pt; color: #6b7280; margin: 0 0 5pt; }
  ul { margin: 2pt 0 5pt 14pt; padding: 0; }
  li { margin: 1pt 0; }
  p { margin: 3pt 0; }
</style></head><body>${body}</body></html>`;

const htmlPath = join(tmp, "out.html");
writeFileSync(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
await page.pdf({
  path: "PACKAGES_BY_DESTINATION.pdf",
  format: "A4",
  margin: { top: "18mm", bottom: "18mm", left: "14mm", right: "14mm" },
  printBackground: true,
});
await browser.close();

const size = readFileSync("PACKAGES_BY_DESTINATION.pdf").length;
console.log(`Wrote PACKAGES_BY_DESTINATION.pdf — ${(size / 1024).toFixed(0)} KB · ${destinations.length} destinations · ${packages.length} packages`);
