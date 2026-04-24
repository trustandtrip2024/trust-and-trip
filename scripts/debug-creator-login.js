const puppeteer = require("puppeteer-core");
const fs = require("fs");

const PW = fs.readFileSync(process.env.TEMP + "\\creator-pw.txt", "utf8").trim();

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("PAGE ERR:", e.message));
  page.on("response", (r) => {
    if (r.url().includes("/auth/v1/token")) console.log("AUTH", r.status());
  });
  await page.goto("https://www.trustandtrip.com/login", { waitUntil: "domcontentloaded" });
  console.log("on:", page.url());
  await page.waitForSelector("input[type=email]", { timeout: 10000 });
  await page.type("input[type=email]", "creator-test@trustandtrip.com");
  await page.type("input[type=password]", PW);
  await page.keyboard.press("Enter");
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (!page.url().includes("/login")) break;
  }
  console.log("end:", page.url());
  await browser.close();
})();
