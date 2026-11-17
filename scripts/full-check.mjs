import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://127.0.0.1:5173";
const OUT = "/tmp/demo-party-check";
fs.mkdirSync(OUT, { recursive: true });

const report = { ok: [], fail: [], notes: [] };
const pass = (m) => {
  report.ok.push(m);
  console.log("PASS:", m);
};
const fail = (m) => {
  report.fail.push(m);
  console.error("FAIL:", m);
};

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

async function startSession(page, name = "Анна") {
  await page.goto(BASE, { waitUntil: "networkidle" });
  // centered hero check
  const box = await page.locator(".brand-hero__center").boundingBox();
  const vp = page.viewportSize();
  if (box && vp) {
    const center = box.x + box.width / 2;
    const mid = vp.width / 2;
    if (Math.abs(center - mid) < 100) pass("start screen centered");
    else fail(`start screen not centered (center=${center.toFixed(0)}, mid=${mid})`);
  }
  await page.fill("#guest-name", name);
  await page.getByRole("button", { name: "Взять демо-фото" }).click();
  await page.waitForSelector(".avatar-preview");
  await page.getByRole("button", { name: /Начать/ }).click();
  await page.waitForSelector("text=Какой формат");
}

async function clickChoice(page, value) {
  await page.getByTestId(`choice-${value}`).click();
}

async function next(page) {
  await page.getByTestId("quiz-next").click();
}

async function answer(page, step) {
  if (step.type === "choice") await clickChoice(page, step.value);
  else if (step.type === "text") await page.fill("#q-text", step.value);
  else if (step.type === "number") await page.fill("#q-num", String(step.value));
  else if (step.type === "location") {
    await clickChoice(page, "true");
    await page.fill("#q-location", step.value);
  }
  await next(page);
  await page.waitForTimeout(80);
}

async function climbMario(page, branchId) {
  await page.waitForSelector("[data-testid=mario-stage]");
  pass(`${branchId}: mario stage visible`);
  let sawWaiter = false;
  let sawCoord = false;

  for (let i = 0; i < 40; i++) {
    if (await page.locator(".timing-list").count()) break;
    // dismiss host if it blocks
    const ok = page.getByRole("button", { name: "Понятно" });
    if (await ok.count()) await ok.click().catch(() => {});

    const title = await page.locator(".stage-card h3").innerText();
    const action = page.getByTestId("mario-action");
    await action.click({ force: true });
    await page.waitForTimeout(200);
    await action.click({ force: true });
    await page.waitForTimeout(250);

    if (title.includes("Гастро")) {
      try {
        await page.getByTestId("waiter").waitFor({ state: "visible", timeout: 1500 });
        sawWaiter = true;
      } catch {}
      try {
        await page.getByTestId("coordinator").waitFor({ state: "visible", timeout: 2500 });
        sawCoord = true;
        await shot(page, `${branchId}-gastro`);
      } catch {}
      await page.waitForTimeout(1600);
    }

    await action.click({ force: true });
    await page.waitForTimeout(1100);
  }

  if (sawWaiter) pass(`${branchId}: waiter`);
  else fail(`${branchId}: waiter missing`);
  if (sawCoord) pass(`${branchId}: coordinator`);
  else fail(`${branchId}: coordinator missing`);
}

async function runBranch(browser, cfg) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const dl = path.join(OUT, `pdf-${cfg.id}`);
  fs.mkdirSync(dl, { recursive: true });
  console.log("\n===", cfg.id, "===");
  await startSession(page, cfg.name);
  for (const step of cfg.steps) await answer(page, step);

  await page.waitForSelector("[data-testid=mario-stage]", { timeout: 10000 });
  await page.waitForSelector("[data-testid=mario-action]");
  await page.waitForSelector(".host-popup");
  if (await page.locator('.host-popup img[src="/brand/host-face.jpg"]').count())
    pass(`${cfg.id}: host face`);
  else fail(`${cfg.id}: host face`);
  // dismiss host so it never covers the action button
  if (await page.getByRole("button", { name: "Понятно" }).count()) {
    await page.getByRole("button", { name: "Понятно" }).click();
  }
  await shot(page, `${cfg.id}-mario`);

  await climbMario(page, cfg.id);
  await page.waitForSelector(".timing-list", { timeout: 30000 });
  pass(`${cfg.id}: result`);

  for (const n of cfg.expect) {
    if (await page.getByText(n, { exact: false }).count()) pass(`${cfg.id}: has ${n}`);
    else fail(`${cfg.id}: missing ${n}`);
  }

  const input = page.locator(".minutes-edit input").first();
  await input.fill("99");
  if ((await input.inputValue()) === "99") pass(`${cfg.id}: edit minutes`);
  else fail(`${cfg.id}: edit minutes`);

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 15000 }),
    page.getByRole("button", { name: "Скачать PDF" }).click(),
  ]);
  const pdfPath = path.join(dl, await download.suggestedFilename());
  await download.saveAs(pdfPath);
  if (fs.statSync(pdfPath).size > 1000) pass(`${cfg.id}: PDF`);
  else fail(`${cfg.id}: PDF`);
  await shot(page, `${cfg.id}-result`);
  await page.close();
}

const browser = await chromium.launch({ headless: true });

// Section count: jubilee 4+3+4+3 + event type = 15; verify chip text appears
{
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await startSession(page, "Тест");
  await clickChoice(page, "jubilee");
  await next(page);
  await page.waitForSelector("text=Смысл вечера");
  const chip = await page.locator(".section-chip").innerText();
  if (/4/.test(chip) && /смысл/i.test(chip)) pass("section chip shows 4 for meaning");
  else fail(`section chip wrong: ${chip}`);
  // count questions by walking
  let q = 1;
  const jubileeSteps = [
    { type: "text", value: "Юбилей Анны" },
    { type: "choice", value: "person" },
    { type: "choice", value: "wow" },
    { type: "choice", value: "words" },
    { type: "location", value: "Loft Hall" },
    { type: "choice", value: "45" },
    { type: "number", value: 80 },
    { type: "choice", value: "true" },
    { type: "choice", value: "false" },
    { type: "choice", value: "moderate" },
    { type: "choice", value: "welcome" },
    { type: "choice", value: "true" },
    { type: "choice", value: "warmup-2x30" },
    { type: "choice", value: "true" },
  ];
  for (const s of jubileeSteps) {
    q += 1;
    await answer(page, s);
  }
  await page.waitForSelector("[data-testid=mario-stage]");
  if (q === 15) pass(`jubilee total questions including type: ${q}`);
  else fail(`jubilee question count ${q}`);
  await page.close();
}

await runBranch(browser, {
  id: "jubilee",
  name: "Анна",
  expect: ["Юбилей Анны", "Loft Hall"],
  steps: [
    { type: "choice", value: "jubilee" },
    { type: "text", value: "Юбилей Анны" },
    { type: "choice", value: "person" },
    { type: "choice", value: "wow" },
    { type: "choice", value: "words" },
    { type: "location", value: "Loft Hall" },
    { type: "choice", value: "45" },
    { type: "number", value: 80 },
    { type: "choice", value: "true" },
    { type: "choice", value: "false" },
    { type: "choice", value: "moderate" },
    { type: "choice", value: "welcome" },
    { type: "choice", value: "true" },
    { type: "choice", value: "warmup-2x30" },
    { type: "choice", value: "true" },
  ],
});

await runBranch(browser, {
  id: "corporate",
  name: "Игорь",
  expect: ["Softline", "знакомство через фото"],
  steps: [
    { type: "choice", value: "corporate" },
    { type: "text", value: "Softline" },
    { type: "text", value: "Softline Day" },
    { type: "choice", value: "team" },
    { type: "choice", value: "mix" },
    { type: "location", value: "Congress Hall" },
    { type: "choice", value: "45" },
    { type: "number", value: 120 },
    { type: "choice", value: "true" },
    { type: "choice", value: "blend" },
    { type: "choice", value: "welcome" },
    { type: "choice", value: "true" },
    { type: "choice", value: "true" },
    { type: "choice", value: "warmup-2x30" },
    { type: "choice", value: "true" },
  ],
});

// static
for (const s of [
  "demo-party-start.png",
  "demo-party-quiz.png",
  "demo-party-doodle.png",
  "demo-party-result.png",
]) {
  const p = `/workspace/docs/screenshots/${s}`;
  if (fs.existsSync(p)) pass(`screenshot ${s}`);
  else fail(`screenshot missing ${s}`);
}
if (fs.existsSync("/workspace/brand/logo.png")) pass("logo");
else fail("logo");

await browser.close();
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log("\n==== SUMMARY ====");
console.log(JSON.stringify({ passed: report.ok.length, failed: report.fail.length, fail: report.fail }, null, 2));
process.exit(report.fail.length ? 1 : 0);
