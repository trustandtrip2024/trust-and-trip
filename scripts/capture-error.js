// Capture client-side errors from a URL via headless Chrome
const puppeteer = require("puppeteer-core");

(async () => {
  const url = process.argv[2] || "https://www.trustandtrip.com/dashboard";
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();

  const errors = [];
  const consoles = [];
  page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}\n${e.stack}`));
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      consoles.push(`[${type}] ${msg.text()}`);
    }
  });
  page.on("requestfailed", (req) => {
    consoles.push(`[netfail] ${req.url()} - ${req.failure()?.errorText}`);
  });
  page.on("response", (res) => {
    if (res.status() >= 400) consoles.push(`[${res.status()}] ${res.url()}`);
  });

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 3000));
  } catch (e) {
    console.log("NAV ERROR:", e.message);
  }

  console.log("=== Page errors ===");
  errors.forEach((e) => console.log(e));
  console.log("\n=== Console errors/warnings ===");
  consoles.forEach((c) => console.log(c));

  const html = await page.content();
  const title = await page.title();
  console.log(`\n=== Page title: ${title} ===`);
  console.log(`HTML length: ${html.length}`);
  // Check for error boundary text
  if (html.includes("Application error")) {
    console.log("⚠ App error boundary visible");
  }
  if (html.includes("client-side exception")) {
    console.log("⚠ client-side exception text in HTML");
  }

  await browser.close();
})();
