import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://127.0.0.1:5173";
const OUT = "/tmp/demo-party-check";
fs.mkdirSync(OUT, { recursive: true });

const report = {
  ok: [],
  fail: [],
  notes: [],
};

function pass(msg) {
  report.ok.push(msg);
  console.log("PASS:", msg);
}
function fail(msg) {
  report.fail.push(msg);
  console.error("FAIL:", msg);
}
function note(msg) {
  report.notes.push(msg);
  console.log("NOTE:", msg);
}

async function shot(page, name) {
  const p = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  return p;
}

async function startSession(page, name = "Анна") {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.fill("#guest-name", name);
  await page.getByRole("button", { name: "Взять демо-фото" }).click();
  await page.waitForSelector(".avatar-preview");
  const logo = await page.locator('img[src="/brand/logo.png"]').count();
  if (logo < 1) fail("logo missing on start");
  else pass("logo on start");
  await page.getByRole("button", { name: "Начать анкету" }).click();
  await page.waitForSelector("text=Какой формат");
}

async function clickChoice(page, testIdOrText) {
  const byId = page.getByTestId(`choice-${testIdOrText}`);
  if (await byId.count()) {
    await byId.click();
    return;
  }
  await page.getByRole("button", { name: testIdOrText }).click();
}

async function next(page) {
  await page.getByTestId("quiz-next").click();
}

async function answerUntilDone(page, steps) {
  for (const step of steps) {
    if (step.type === "choice") {
      await clickChoice(page, step.value);
      await next(page);
    } else if (step.type === "text") {
      await page.fill("#q-text", step.value);
      await next(page);
    } else if (step.type === "number") {
      await page.fill("#q-num", String(step.value));
      await next(page);
    } else if (step.type === "location") {
      await clickChoice(page, "true");
      await page.fill("#q-location", step.value);
      await next(page);
    } else if (step.type === "expect") {
      const visible = await page.getByText(step.value).count();
      if (visible) pass(`saw text: ${step.value}`);
      else fail(`missing text: ${step.value}`);
    }
  }
}

async function climbAll(page) {
  let stages = 0;
  for (let i = 0; i < 30; i++) {
    if (await page.locator(".timing-list").count()) break;
    const active = page.locator(".platform.is-active");
    if ((await active.count()) === 0) break;
    await active.first().click();
    await page.waitForTimeout(200);
    await active.first().click();
    stages += 1;
    await page.waitForTimeout(650);
  }
  return stages;
}

async function runBranch(browser, branch) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const downloadDir = path.join(OUT, `pdf-${branch.id}`);
  fs.mkdirSync(downloadDir, { recursive: true });

  console.log("\n=== BRANCH", branch.id, "===");
  await startSession(page, branch.name);
  await answerUntilDone(page, branch.steps);

  await page.waitForSelector(".doodle-stage", { timeout: 10000 });
  pass(`${branch.id}: entered doodle`);

  // host popup
  const host = page.locator(".host-popup");
  await host.waitFor({ timeout: 5000 });
  const hostImg = await host.locator('img[src="/brand/host-face.jpg"]').count();
  if (hostImg) pass(`${branch.id}: host popup with face`);
  else fail(`${branch.id}: host face missing`);
  await shot(page, `${branch.id}-doodle-start`);

  // climb until gastro or finish; watch waiter/coord
  let sawWaiter = false;
  let sawCoord = false;
  for (let i = 0; i < 30; i++) {
    if (await page.locator(".timing-list").count()) break;
    if (await page.locator(".waiter").count()) sawWaiter = true;
    if (await page.locator(".coordinator").count()) sawCoord = true;
    const active = page.locator(".platform.is-active");
    if ((await active.count()) === 0) break;
    const title = await active.locator(".platform__title").innerText();
    await active.first().click();
    await page.waitForTimeout(220);
    // after first click text should partially reveal
    const reveal = await page.locator(".reveal-line").count();
    if (reveal < 1 && i === 0) fail(`${branch.id}: no reveal after first click`);
    await active.first().click();
    await page.waitForTimeout(700);
    if (title.includes("Гастро")) {
      try {
        await page.getByTestId("waiter").waitFor({ state: "visible", timeout: 2000 });
        sawWaiter = true;
      } catch {
        /* counted below */
      }
      try {
        await page.getByTestId("coordinator").waitFor({ state: "visible", timeout: 3000 });
        sawCoord = true;
        await shot(page, `${branch.id}-gastro`);
      } catch {
        /* counted below */
      }
      // allow gastro beat to unlock before next climb loop
      await page.waitForTimeout(1600);
    }
  }

  if (branch.expectWaiter) {
    if (sawWaiter) pass(`${branch.id}: waiter appeared`);
    else fail(`${branch.id}: waiter did not appear`);
    if (sawCoord) pass(`${branch.id}: coordinator appeared`);
    else fail(`${branch.id}: coordinator did not appear`);
  }

  await page.waitForSelector(".timing-list", { timeout: 20000 });
  pass(`${branch.id}: reached result`);

  // company/event name in timing
  for (const needle of branch.expectInResult) {
    const n = await page.getByText(needle, { exact: false }).count();
    if (n) pass(`${branch.id}: result contains «${needle}»`);
    else fail(`${branch.id}: result missing «${needle}»`);
  }

  // edit minutes
  const firstInput = page.locator(".minutes-edit input").first();
  const before = await firstInput.inputValue();
  await firstInput.fill("99");
  const after = await firstInput.inputValue();
  if (after === "99" && before !== "99") pass(`${branch.id}: minutes editable`);
  else fail(`${branch.id}: minutes edit failed (${before}→${after})`);

  // total updates
  const totalText = await page.locator(".summary-bar").innerText();
  if (/Общая длительность/.test(totalText)) pass(`${branch.id}: total duration shown`);
  else fail(`${branch.id}: total duration missing`);

  // PDF
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 15000 }),
    page.getByRole("button", { name: "Скачать PDF" }).click(),
  ]);
  const pdfPath = path.join(downloadDir, await download.suggestedFilename());
  await download.saveAs(pdfPath);
  const size = fs.statSync(pdfPath).size;
  if (size > 1000 && pdfPath.endsWith(".pdf")) pass(`${branch.id}: PDF downloaded (${size} bytes)`);
  else fail(`${branch.id}: PDF bad (${pdfPath}, ${size})`);

  await shot(page, `${branch.id}-result`);
  await page.close();
}

const jubilee = {
  id: "jubilee",
  name: "Анна",
  expectWaiter: true,
  expectInResult: ["Юбилей Анны", "Loft Hall"],
  steps: [
    { type: "choice", value: "jubilee" },
    { type: "text", value: "Юбилей Анны" },
    { type: "choice", value: "wow" },
    { type: "choice", value: "true" }, // has location - first true option may conflict
  ],
};

const browser = await chromium.launch({ headless: true });

// --- count questions per branch ---
async function countQuestions(branchLabel, eventValue, answers) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await startSession(page, "Тест");
  await clickChoice(page, eventValue);
  await next(page);
  let count = 1; // event type
  for (let i = 0; i < 20; i++) {
    if (await page.locator(".doodle-stage").count()) break;
    count += 1;
    const title = await page.locator(".q-step h2").innerText();
    note(`${branchLabel} Q${count}: ${title}`);
    const step = answers[i];
    if (!step) {
      fail(`${branchLabel}: ran out of scripted answers at Q${count} (${title})`);
      break;
    }
    if (step.type === "choice") await clickChoice(page, step.value);
    else if (step.type === "text") await page.fill("#q-text", step.value);
    else if (step.type === "number") await page.fill("#q-num", String(step.value));
    else if (step.type === "location") {
      await clickChoice(page, "true");
      await page.fill("#q-location", step.value);
    }
    await next(page);
    await page.waitForTimeout(150);
  }
  if (count >= 8 && count <= 10) pass(`${branchLabel}: question count ${count} (target 8–10)`);
  else fail(`${branchLabel}: question count ${count} outside 8–10`);
  await page.close();
  return count;
}

await countQuestions("jubilee", "jubilee", [
  { type: "text", value: "Юбилей Анны" },
  { type: "choice", value: "wow" },
  { type: "location", value: "Loft Hall" },
  { type: "choice", value: "45" },
  { type: "number", value: 80 },
  { type: "choice", value: "true" },
  { type: "choice", value: "welcome" },
  { type: "choice", value: "true" },
]);

await countQuestions("wedding", "wedding", [
  { type: "text", value: "Свадьба Марии и Ивана" },
  { type: "choice", value: "wow" },
  { type: "location", value: "Усадьба" },
  { type: "choice", value: "45" },
  { type: "number", value: 60 },
  { type: "choice", value: "true" },
  { type: "choice", value: "true" },
  { type: "choice", value: "welcome" },
  { type: "choice", value: "true" },
]);

await countQuestions("corporate", "corporate", [
  { type: "text", value: "Softline Day" },
  { type: "text", value: "Softline" },
  { type: "choice", value: "team" },
  { type: "location", value: "Congress Hall" },
  { type: "choice", value: "45" },
  { type: "number", value: 120 },
  { type: "choice", value: "true" },
  { type: "choice", value: "welcome" },
  { type: "choice", value: "true" },
]);

// Full journeys
await runBranch(browser, {
  id: "jubilee",
  name: "Анна",
  expectWaiter: true,
  expectInResult: ["Юбилей Анны", "Loft Hall"],
  steps: [
    { type: "choice", value: "jubilee" },
    { type: "text", value: "Юбилей Анны" },
    { type: "choice", value: "wow" },
    { type: "location", value: "Loft Hall" },
    { type: "choice", value: "45" },
    { type: "number", value: 80 },
    { type: "choice", value: "true" },
    { type: "choice", value: "welcome" },
    { type: "choice", value: "true" },
  ],
});

await runBranch(browser, {
  id: "wedding",
  name: "Мария",
  expectWaiter: true,
  expectInResult: ["Свадьба Марии и Ивана", "обряд"],
  steps: [
    { type: "choice", value: "wedding" },
    { type: "text", value: "Свадьба Марии и Ивана" },
    { type: "choice", value: "wow" },
    { type: "choice", value: "false" },
    { type: "choice", value: "45" },
    { type: "number", value: 60 },
    { type: "choice", value: "true" },
    { type: "choice", value: "true" },
    { type: "choice", value: "first-toast" },
    { type: "choice", value: "true" },
  ],
});

await runBranch(browser, {
  id: "corporate",
  name: "Игорь",
  expectWaiter: true,
  expectInResult: ["Softline", "знакомство через фото"],
  steps: [
    { type: "choice", value: "corporate" },
    { type: "text", value: "Softline Day" },
    { type: "text", value: "Softline" },
    { type: "choice", value: "team" },
    { type: "location", value: "Congress Hall" },
    { type: "choice", value: "30" },
    { type: "number", value: 120 },
    { type: "choice", value: "true" },
    { type: "choice", value: "welcome" },
    { type: "choice", value: "true" },
  ],
});

// Static checks
const logoRepo = fs.existsSync("/workspace/brand/logo.png");
const hostRepo = fs.existsSync("/workspace/brand/host-face.jpg");
const readme = fs.readFileSync("/workspace/README.md", "utf8");
const shots = [
  "demo-party-start.png",
  "demo-party-quiz.png",
  "demo-party-doodle.png",
  "demo-party-result.png",
];
if (logoRepo) pass("brand/logo.png in repo");
else fail("brand/logo.png missing");
if (hostRepo) pass("brand/host-face.jpg in repo");
else fail("brand/host-face.jpg missing");
if (/npm run dev/.test(readme)) pass("README has run instructions");
else fail("README missing run instructions");
for (const s of shots) {
  const a = `/workspace/docs/screenshots/${s}`;
  const b = `/cursor/stores/bc-8f6cf1c4-2493-4b1a-a6df-7ed437cfa311/media/${s}`;
  if (fs.existsSync(a) && fs.statSync(a).size > 10000) pass(`screenshot repo ${s}`);
  else fail(`screenshot repo missing/small ${s}`);
  if (fs.existsSync(b) && fs.statSync(b).size > 10000) pass(`screenshot media ${s}`);
  else fail(`screenshot media missing/small ${s}`);
}

await browser.close();

const summary = {
  passed: report.ok.length,
  failed: report.fail.length,
  fail: report.fail,
  notes: report.notes,
};
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(summary, null, 2));
console.log("\n==== SUMMARY ====");
console.log(JSON.stringify(summary, null, 2));
process.exit(report.fail.length ? 1 : 0);
