/**
 * Comprehensive end-to-end browser test for Trust and Trip.
 * Covers: anonymous browsing, user dashboard, admin, creator dashboard.
 *
 * Usage:  node scripts/full-test.js
 * Reads creds from env or .env.local.
 *
 * Reports:
 *   - 4xx/5xx network responses
 *   - JS page errors + console errors
 *   - Failed assertions per route
 *   - Summary table per persona
 */

const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

// ---- Config ---------------------------------------------------------------

const BASE = process.env.BASE_URL || "https://www.trustandtrip.com";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// Read .env.local for ADMIN_SECRET + supabase + Bitrix
function loadEnv() {
  const env = {};
  const file = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const ADMIN_SECRET = process.env.ADMIN_SECRET || env.ADMIN_SECRET;

// Test users — set via env or fall back to known
const USER_EMAIL = process.env.TEST_USER_EMAIL || "akash@trustandtrip.com";
const USER_PASSWORD = process.env.TEST_USER_PASSWORD || "yzYoDRWpjzE";
const CREATOR_EMAIL = process.env.TEST_CREATOR_EMAIL;
const CREATOR_PASSWORD = process.env.TEST_CREATOR_PASSWORD;

// ---- Recorder -------------------------------------------------------------

class Recorder {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.networkErrors = [];
  }
  attach(page, label) {
    page.on("pageerror", (e) => {
      this.errors.push({ persona: label, type: "pageerror", message: e.message, stack: e.stack?.split("\n")[0] });
    });
    page.on("console", (msg) => {
      const type = msg.type();
      if (type === "error") {
        const text = msg.text();
        // Ignore known noise
        if (text.includes("Failed to load resource: the server responded with a status of 404")) return;
        this.errors.push({ persona: label, type: "console", message: text });
      } else if (type === "warning") {
        this.warnings.push({ persona: label, message: msg.text() });
      }
    });
    page.on("response", (res) => {
      const url = res.url();
      if (url.includes("/_next/data/") || url.includes("/_next/image")) return;
      if (res.status() >= 400 && res.status() !== 404) {
        this.networkErrors.push({ persona: label, status: res.status(), url });
      }
      // 404 only flagged for our own paths, not external
      if (res.status() === 404 && url.startsWith(BASE)) {
        if (!url.match(/favicon|icon|og-image|robots|sitemap|manifest/)) {
          this.networkErrors.push({ persona: label, status: 404, url });
        }
      }
    });
  }
}

const rec = new Recorder();

// ---- Helpers --------------------------------------------------------------

async function visit(page, url, opts = {}) {
  const start = Date.now();
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
    const status = res?.status() ?? 0;
    // give client-side JS a moment to error/render
    await new Promise((r) => setTimeout(r, 1200));
    const elapsed = Date.now() - start;
    return { ok: status === 200, status, elapsed };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

async function expectVisible(page, selector, label) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    return true;
  } catch {
    rec.errors.push({ persona: label, type: "missing-selector", message: `Selector not found: ${selector}` });
    return false;
  }
}

async function login(page, email, password) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForSelector("input[type=email]", { timeout: 10_000 });
  await page.click("input[type=email]");
  await page.type("input[type=email]", email, { delay: 20 });
  await page.click("input[type=password]");
  await page.type("input[type=password]", password, { delay: 20 });
  // Use Enter — button click sometimes misses in headless mode
  await page.keyboard.press("Enter");
  // poll URL for up to 12s
  const start = Date.now();
  while (Date.now() - start < 12_000) {
    const url = page.url();
    if (!url.includes("/login")) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  await new Promise((r) => setTimeout(r, 1500));
  // If we're still on /login, capture inline error and screenshot for debugging
  if (page.url().includes("/login")) {
    try {
      const errMsg = await page.$eval("p.text-red-500", (el) => el.textContent).catch(() => null);
      if (errMsg) console.log(`  ⚠ login error visible: "${errMsg}"`);
      const shotPath = `/tmp/login-fail-${Date.now()}.png`;
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`  ⚠ screenshot: ${shotPath}`);
    } catch {}
  }
  return page.url();
}

function summary(label, results) {
  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  console.log(`\n── ${label}: ${pass}/${results.length} pass ──`);
  for (const r of results) {
    const icon = r.ok ? "✓" : "✗";
    const tail = r.error ? ` (${r.error})` : r.status ? ` [${r.status}]` : "";
    console.log(`  ${icon} ${r.label}${tail}`);
  }
}

// ---- Test suites ----------------------------------------------------------

async function runAnon(browser) {
  const page = await browser.newPage();
  rec.attach(page, "anon");
  const results = [];

  const routes = [
    "/", "/packages", "/destinations", "/experiences", "/offers",
    "/plan", "/build-trip", "/blog", "/about", "/contact",
    "/customize-trip", "/my-booking", "/login", "/refer", "/wishlist",
    "/privacy-policy", "/terms-and-conditions", "/cancellation-policy",
    "/creators", "/creators/apply",
    "/packages/bali-6n7d-honeymoon",
    "/destinations/bali",
    "/experiences/honeymoon",
  ];
  for (const r of routes) {
    const out = await visit(page, BASE + r);
    results.push({ label: `GET ${r}`, ok: out.ok, status: out.status, error: out.error });
  }
  // skip page.close — browser.close at end handles it (close hangs on certain pages)
  summary("Anonymous browsing", results);
  return results;
}

async function runUser(browser) {
  const page = await browser.newPage();
  rec.attach(page, "user");
  const results = [];

  const dest = await login(page, USER_EMAIL, USER_PASSWORD);
  results.push({
    label: `Login → ${dest.replace(BASE, "") || "/"}`,
    ok: dest.includes("/dashboard"),
    error: dest.includes("/dashboard") ? null : `landed at ${dest}`,
  });
  if (!dest.includes("/dashboard")) {
    summary("User dashboard (login failed)", results);
    // skip page.close — browser.close at end handles it (close hangs on certain pages)
    return results;
  }

  const dashRoutes = [
    "/dashboard",
    "/dashboard/bookings",
    "/dashboard/saved",
    "/dashboard/cart",
    "/dashboard/rewards",
    "/dashboard/travellers",
    "/dashboard/offers",
    "/dashboard/reviews",
    "/dashboard/referral",
    "/dashboard/profile",
  ];
  for (const r of dashRoutes) {
    const out = await visit(page, BASE + r);
    results.push({ label: `GET ${r}`, ok: out.ok, status: out.status, error: out.error });
  }
  // skip page.close — browser.close at end handles it (close hangs on certain pages)
  summary("User dashboard", results);
  return results;
}

async function runAdmin(browser) {
  const page = await browser.newPage();
  rec.attach(page, "admin");
  const results = [];

  if (!ADMIN_SECRET) {
    console.log("\n── Admin: SKIP (ADMIN_SECRET missing) ──");
    return results;
  }

  // Basic auth via authenticate
  await page.authenticate({ username: "admin", password: ADMIN_SECRET });

  const adminRoutes = [
    "/admin",
    "/admin/leads",
    "/admin/reviews",
    "/admin/referrals",
    "/admin/creators",
  ];
  for (const r of adminRoutes) {
    const out = await visit(page, BASE + r);
    results.push({ label: `GET ${r}`, ok: out.ok, status: out.status, error: out.error });
  }
  // skip page.close — browser.close at end handles it (close hangs on certain pages)
  summary("Admin dashboard", results);
  return results;
}

async function runCreator(browser) {
  const page = await browser.newPage();
  rec.attach(page, "creator");
  const results = [];

  if (!CREATOR_EMAIL || !CREATOR_PASSWORD) {
    console.log("\n── Creator: SKIP (TEST_CREATOR_EMAIL / TEST_CREATOR_PASSWORD not set) ──");
    return results;
  }

  const dest = await login(page, CREATOR_EMAIL, CREATOR_PASSWORD);
  results.push({
    label: `Login → ${dest.replace(BASE, "") || "/"}`,
    ok: dest.includes("/creators/dashboard"),
    error: dest.includes("/creators/dashboard") ? null : `landed at ${dest}`,
  });
  if (!dest.includes("/creators/dashboard")) {
    summary("Creator dashboard (login failed)", results);
    // skip page.close — browser.close at end handles it (close hangs on certain pages)
    return results;
  }

  const routes = [
    "/creators/dashboard",
    "/creators/dashboard/leads",
    "/creators/dashboard/earnings",
    "/creators/dashboard/profile",
  ];
  for (const r of routes) {
    const out = await visit(page, BASE + r);
    results.push({ label: `GET ${r}`, ok: out.ok, status: out.status, error: out.error });
  }
  // skip page.close — browser.close at end handles it (close hangs on certain pages)
  summary("Creator dashboard", results);
  return results;
}

async function runRefAttribution(browser) {
  // Visit /?ref=CRTR-XXX, verify cookie set, no JS errors
  const page = await browser.newPage();
  rec.attach(page, "ref-attr");
  const out = await visit(page, BASE + "/?ref=CRTR-TEST00");
  const cookies = await page.cookies();
  const ttRef = cookies.find((c) => c.name === "tt_ref");
  const results = [
    { label: "GET /?ref=CRTR-TEST00", ok: out.ok, status: out.status },
    { label: "tt_ref cookie present", ok: !!ttRef && ttRef.value === "CRTR-TEST00",
      error: ttRef ? `value=${ttRef.value}` : "cookie missing" },
  ];
  // skip page.close — browser.close at end handles it (close hangs on certain pages)
  summary("Referral attribution", results);
  return results;
}

// ---- Main -----------------------------------------------------------------

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--ignore-certificate-errors"],
  });

  console.log(`\n═══ Trust and Trip — full-stack test ═══`);
  console.log(`Target: ${BASE}\n`);

  await runAnon(browser);
  await runUser(browser);
  await runAdmin(browser);
  await runCreator(browser);
  await runRefAttribution(browser);

  await browser.close();

  console.log("\n═══ Errors ═══");
  if (rec.errors.length === 0) {
    console.log("  ✓ No JS / page errors");
  } else {
    for (const e of rec.errors) {
      console.log(`  [${e.persona}] [${e.type}] ${e.message}${e.stack ? " — " + e.stack : ""}`);
    }
  }

  console.log("\n═══ Network errors (4xx/5xx, excl noise) ═══");
  if (rec.networkErrors.length === 0) {
    console.log("  ✓ No network errors");
  } else {
    for (const n of rec.networkErrors) {
      console.log(`  [${n.persona}] [${n.status}] ${n.url}`);
    }
  }

  console.log("\nDone.\n");
  process.exit(rec.errors.length + rec.networkErrors.length > 0 ? 1 : 0);
})();
