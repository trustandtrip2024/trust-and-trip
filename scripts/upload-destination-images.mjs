#!/usr/bin/env node
// Uploads curated images to Sanity for every destination missing an image
// or gallery, so the runtime can stop relying on the hardcoded
// DESTINATION_GALLERY map. Idempotent — skips destinations that already
// have a Sanity image.
//
// Source pool: src/lib/gallery-images.ts (DESTINATION_GALLERY) + a few
// hand-picked Unsplash URLs for slugs the local map doesn't cover
// (bhutan, mauritius, char-dham, vaishno-devi, kanha, ranthambore,
// pondicherry, mahabaleshwar, lonavala, mount-abu, pushkar, tirupati,
// sikkim, lakshadweep, darjeeling, kenya, italy, france, russia, uk,
// hong-kong, south-korea).

import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(ENV_PATH)) {
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.trim().replace(/^"|"$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ncxbf32w";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    || "production";
const TOKEN      = process.env.SANITY_API_WRITE_TOKEN;
const API_HOST   = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01`;
if (!TOKEN) { console.error("missing SANITY_API_WRITE_TOKEN"); process.exit(1); }

// Curated 5-image pool for every destination slug. Re-uses the source
// strings from src/lib/gallery-images.ts so editorial intent is unchanged.
const POOL = {
  "mount-abu": [
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1477587458883-47145ed6979e?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&q=85&auto=format&fit=crop",
  ],
  pushkar: [
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1477587458883-47145ed6979e?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=1600&q=85&auto=format&fit=crop",
  ],
  tirupati: [
    "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591621997572-0f99bb98c00a?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597149040794-1e97c98d1b3e?w=1600&q=85&auto=format&fit=crop",
  ],
  cambodia: [
    "https://images.unsplash.com/photo-1508005104426-d527d20cb1c5?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574080378016-d61b03b6c81e?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1496939376851-89342e90adcd?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517627043994-6e7e5fa42d10?w=1600&q=85&auto=format&fit=crop",
  ],
  uk: [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543832923-44667a44c804?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1600&q=85&auto=format&fit=crop",
  ],
  mahabaleshwar: [
    "https://images.unsplash.com/photo-1626015365107-3a71e18c5268?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1600&q=85&auto=format&fit=crop",
  ],
  "vaishno-devi": [
    "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1609766857413-21c26b143aca?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591621997572-0f99bb98c00a?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1600&q=85&auto=format&fit=crop",
  ],
  "char-dham": [
    "https://images.unsplash.com/photo-1591020887970-c6a61c1cd5ea?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554476347-8cfe14f5d652?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580746738099-78d6833b8bcc?w=1600&q=85&auto=format&fit=crop",
  ],
  italy: [
    "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517220474977-83adf2ab18d6?w=1600&q=85&auto=format&fit=crop",
  ],
  pondicherry: [
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580889272861-dc2dbea4e4ab?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=1600&q=85&auto=format&fit=crop",
  ],
  "hong-kong": [
    "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576788369575-1ad8b25653a8?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583318432730-a19c89692612?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576788903709-5b2e4cd2fd3c?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599321955726-9e3e91d04bcc?w=1600&q=85&auto=format&fit=crop",
  ],
  darjeeling: [
    "https://images.unsplash.com/photo-1626015365107-3a71e18c5268?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591218306099-f5e57c9da30b?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580082978243-c32e0c6c1ef1?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=85&auto=format&fit=crop",
  ],
  lonavala: [
    "https://images.unsplash.com/photo-1626015365107-3a71e18c5268?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=1600&q=85&auto=format&fit=crop",
  ],
  kenya: [
    "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=1600&q=85&auto=format&fit=crop",
  ],
  france: [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549144511-f099e773c147?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=1600&q=85&auto=format&fit=crop",
  ],
  russia: [
    "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514475692532-2e9d7a3bcfa3?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=1600&q=85&auto=format&fit=crop",
  ],
  kanha: [
    "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1577023311546-cdc07a8454d9?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551763370-fcd35c4e3f5d?w=1600&q=85&auto=format&fit=crop",
  ],
  lakshadweep: [
    "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1600&q=85&auto=format&fit=crop",
  ],
  sikkim: [
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1609766857413-21c26b143aca?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580746738099-78d6833b8bcc?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop",
  ],
  bhutan: [
    "https://images.unsplash.com/photo-1580255056108-da8e5e1efb37?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622645286859-d8c45ae57a4f?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=1600&q=85&auto=format&fit=crop",
  ],
  mauritius: [
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1600&q=85&auto=format&fit=crop",
  ],
  ranthambore: [
    "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1577023311546-cdc07a8454d9?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551763370-fcd35c4e3f5d?w=1600&q=85&auto=format&fit=crop",
  ],
  "south-korea": [
    "https://images.unsplash.com/photo-1538485399081-7c8970e89cd1?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535139262971-c51845709a48?w=1600&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593457271270-99ed40df56d2?w=1600&q=85&auto=format&fit=crop",
  ],
};

// Strip Unsplash query params for upload — Sanity will store raw bytes,
// our urlFor() builder appends our own resize params on read.
function rawUrl(u) { return u.split("?")[0]; }

async function downloadImage(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`download ${url} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get("content-type") || "image/jpeg";
  return { buf, contentType: ct };
}

async function uploadAsset(buf, contentType, filename) {
  const url = `${API_HOST}/assets/images/${DATASET}?filename=${encodeURIComponent(filename)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": contentType,
    },
    body: buf,
  });
  if (!r.ok) throw new Error(`upload failed: ${await r.text()}`);
  const j = await r.json();
  return j.document._id;
}

async function patch(docId, set) {
  const r = await fetch(`${API_HOST}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations: [{ patch: { id: docId, set } }] }),
  });
  if (!r.ok) throw new Error(`patch failed: ${await r.text()}`);
  return r.json();
}

async function fetchTargets() {
  const q = encodeURIComponent(
    `*[_type=="destination" && !defined(image)]{_id, "slug": slug.current, name}`
  );
  const r = await fetch(`${API_HOST}/data/query/${DATASET}?query=${q}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!r.ok) throw new Error(`fetch failed: ${await r.text()}`);
  return (await r.json()).result || [];
}

const targets = await fetchTargets();
console.log(`Destinations missing image: ${targets.length}`);

let done = 0;
const skipped = [];

for (const dest of targets) {
  const urls = POOL[dest.slug];
  if (!urls || urls.length === 0) { skipped.push(dest.slug); continue; }

  console.log(`-> ${dest.slug} (${urls.length} images)`);
  const assets = [];
  for (let i = 0; i < urls.length; i++) {
    const src = rawUrl(urls[i]);
    try {
      const { buf, contentType } = await downloadImage(urls[i]);
      const filename = `${dest.slug}-${i + 1}.jpg`;
      const assetId = await uploadAsset(buf, contentType, filename);
      assets.push(assetId);
    } catch (e) {
      console.warn(`   skip ${src}: ${e.message}`);
    }
  }
  if (assets.length === 0) { skipped.push(dest.slug); continue; }

  const set = {
    image: { _type: "image", asset: { _type: "reference", _ref: assets[0] } },
    heroImage: { _type: "image", asset: { _type: "reference", _ref: assets[0] } },
    gallery: assets.map((id, idx) => ({
      _key: `gal_${idx}`,
      _type: "image",
      asset: { _type: "reference", _ref: id },
    })),
  };
  await patch(dest._id, set);
  done++;
}

console.log(`\nUploaded for ${done} destinations.`);
if (skipped.length) console.log(`Skipped (no source URLs): ${skipped.join(", ")}`);
