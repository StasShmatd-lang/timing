import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const outDirs = [
  "/cursor/stores/bc-8f6cf1c4-2493-4b1a-a6df-7ed437cfa311/media",
  "/workspace/docs/screenshots",
  "/opt/cursor/artifacts",
];
for (const d of outDirs) fs.mkdirSync(d, { recursive: true });

async function saveAll(page, name) {
  for (const d of outDirs) {
    await page.screenshot({ path: path.join(d, `${name}.png`), fullPage: true });
  }
  console.log("saved", name);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await saveAll(page, "demo-party-start");

await page.fill("#guest-name", "Анна");
await page.getByRole("button", { name: "Взять демо-фото" }).click();
await page.waitForSelector(".avatar-preview");
await page.getByRole("button", { name: /Начать/ }).click();

await page.getByTestId("choice-jubilee").click();
await page.getByTestId("quiz-next").click();
await page.fill("#q-text", "Юбилей Анны");
await page.getByTestId("quiz-next").click();
await page.getByTestId("choice-person").click();
await page.getByTestId("quiz-next").click();
await saveAll(page, "demo-party-quiz");

const rest = [
  ["choice", "wow"],
  ["choice", "words"],
  ["location", "Loft Hall"],
  ["choice", "45"],
  ["number", "80"],
  ["choice", "true"],
  ["choice", "false"],
  ["choice", "moderate"],
  ["choice", "welcome"],
  ["choice", "true"],
  ["choice", "warmup-2x30"],
  ["choice", "true"],
];
for (const [t, v] of rest) {
  if (t === "choice") await page.getByTestId(`choice-${v}`).click();
  else if (t === "number") await page.fill("#q-num", v);
  else if (t === "location") {
    await page.getByTestId("choice-true").click();
    await page.fill("#q-location", v);
  }
  await page.getByTestId("quiz-next").click();
  await page.waitForTimeout(60);
}

await page.waitForSelector("[data-testid=mario-stage]");
await page.waitForTimeout(600);
if (await page.getByRole("button", { name: "Понятно" }).count()) {
  await page.getByRole("button", { name: "Понятно" }).click();
}
await saveAll(page, "demo-party-doodle");

for (let i = 0; i < 30; i++) {
  if (await page.locator(".timing-list").count()) break;
  if (await page.getByRole("button", { name: "Понятно" }).count()) {
    await page.getByRole("button", { name: "Понятно" }).click().catch(() => {});
  }
  const action = page.getByTestId("mario-action");
  await action.click({ force: true });
  await page.waitForTimeout(180);
  await action.click({ force: true });
  await page.waitForTimeout(200);
  await action.click({ force: true });
  await page.waitForTimeout(1000);
}

await page.waitForSelector(".timing-list", { timeout: 30000 });
await saveAll(page, "demo-party-result");
await browser.close();
console.log("done");
