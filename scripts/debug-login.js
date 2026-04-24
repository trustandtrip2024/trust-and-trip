const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();

  page.on("pageerror", (e) => console.log("PAGE ERR:", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.log("CONSOLE ERR:", m.text());
    else if (m.type() === "log" && m.text().includes("[")) console.log("LOG:", m.text());
  });
  page.on("response", (r) => {
    if (r.url().includes("/auth/v1/token")) {
      console.log(`AUTH RESP [${r.status()}] ${r.url()}`);
    }
    if (r.status() >= 400 && r.url().startsWith("https://www.trustandtrip.com")) {
      console.log(`HTTP ${r.status()}: ${r.url()}`);
    }
  });

  await page.goto("https://www.trustandtrip.com/login", { waitUntil: "domcontentloaded" });
  console.log("→ landed on", page.url());

  await page.waitForSelector("input[type=email]");
  await page.type("input[type=email]", "akash@trustandtrip.com");
  await page.type("input[type=password]", "yzYoDRWpjzE");

  console.log("→ submitting via Enter key");
  // Try pressing Enter from the password field instead of button click
  await page.focus("input[type=password]");
  await page.keyboard.press("Enter");

  // wait 8s for redirect or error
  for (let i = 0; i < 16; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const url = page.url();
    if (!url.includes("/login")) {
      console.log("✓ redirected to", url);
      break;
    }
  }

  if (page.url().includes("/login")) {
    console.log("✗ still on /login");
    const errMsg = await page.$eval("p.text-red-500", (el) => el.textContent).catch(() => null);
    console.log("error msg:", errMsg);

    // check localStorage for session
    const session = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const supabaseKey = keys.find((k) => k.includes("supabase") && k.includes("auth"));
      if (supabaseKey) return { key: supabaseKey, val: localStorage.getItem(supabaseKey)?.slice(0, 200) };
      return { keys };
    });
    console.log("localStorage:", JSON.stringify(session, null, 2));

    await page.screenshot({ path: "/tmp/login-debug.png" });
    console.log("screenshot: /tmp/login-debug.png");
  }

  await browser.close();
})();
