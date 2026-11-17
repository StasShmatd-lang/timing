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
  const file = `${name}.png`;
  for (const d of outDirs) {
    await page.screenshot({
      path: path.join(d, file),
      fullPage: true,
    });
  }
  console.log("saved", file);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
});

await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await saveAll(page, "demo-party-start");

await page.fill("#guest-name", "Анна");
await page.getByRole("button", { name: "Взять демо-фото" }).click();
await page.waitForSelector(".avatar-preview");
await page.getByRole("button", { name: "Начать анкету" }).click();

await page.getByRole("button", { name: "Юбилей" }).click();
await page.getByRole("button", { name: "Далее" }).click();

await page.fill("#q-text", "Юбилей Анны");
await page.getByRole("button", { name: "Далее" }).click();

await page.getByRole("button", { name: "Вау-эффект и эмоции" }).click();
await page.getByRole("button", { name: "Далее" }).click();

await saveAll(page, "demo-party-quiz");

await page.getByRole("button", { name: /Да — добавим/ }).click();
await page.getByRole("button", { name: "Далее" }).click();

await page.fill("#q-text", "Loft Hall");
await page.getByRole("button", { name: "Далее" }).click();

await page.getByRole("button", { name: "45 минут" }).click();
await page.getByRole("button", { name: "Далее" }).click();

await page.fill("#q-num", "80");
await page.getByRole("button", { name: "Далее" }).click();

await page.getByRole("button", { name: "Да", exact: true }).click();
await page.getByRole("button", { name: "Далее" }).click();

await page.getByRole("button", { name: "После welcome" }).click();
await page.getByRole("button", { name: "Далее" }).click();

await page.getByRole("button", { name: /фирменные/ }).click();
await page.getByRole("button", { name: "Далее" }).click();

await page.waitForSelector(".doodle-stage");
await page.waitForTimeout(800);
await saveAll(page, "demo-party-doodle");

// Climb stages: two clicks per active platform
for (let i = 0; i < 20; i++) {
  const active = page.locator(".platform.is-active");
  if ((await active.count()) === 0) break;
  await active.click();
  await page.waitForTimeout(250);
  await active.click();
  await page.waitForTimeout(700);
  if (await page.locator(".timing-list").count()) break;
}

await page.waitForSelector(".timing-list", { timeout: 20000 });
await page.waitForTimeout(500);
await saveAll(page, "demo-party-result");

await browser.close();
console.log("done");
