import { test, expect } from "@playwright/test";
import { GeneratePage } from "./pages/generate.page";
import { ProfilePage } from "./pages/profile.page";
import masterResume from "./fixtures/master-resume.json";
import tailorFixture from "./fixtures/tailor-response.json";

const VALID_RESUME_JSON = JSON.stringify(masterResume, null, 2);
const SAMPLE_JD = "We are looking for a Senior Software Engineer to join our team. You will build scalable backend services using TypeScript and Node.js.";

async function saveProfile(page: import("@playwright/test").Page) {
  const profile = new ProfilePage(page);
  await profile.goto();
  await profile.pasteResume(VALID_RESUME_JSON);
  await profile.save();
}

test.describe("Generate page", () => {
  test("shows error when no profile is saved", async ({ page }) => {
    // Clear any existing profile
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("masterResume"));

    const generate = new GeneratePage(page);
    await generate.goto();
    await generate.pasteJobDescription(SAMPLE_JD);
    await page.getByRole("button", { name: "Generate" }).click();

    await expect(
      page.locator('[class*="bg-red-50"], [class*="border-red-200"]').first()
    ).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/No master resume found/i)).toBeVisible();
  });

  test("generates tailored resume from pasted job description", async ({ page }) => {
    await saveProfile(page);

    const generate = new GeneratePage(page);
    await generate.mockTailorApi();
    await generate.goto();
    await generate.pasteJobDescription(SAMPLE_JD);
    await generate.generate();

    await expect(page.getByRole("button", { name: "Download PDF" })).toBeVisible();
  });

  test("shows pipeline steps during generation", async ({ page }) => {
    await saveProfile(page);

    // Use a slow route so we can see loading state
    await page.route("/api/tailor", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({ json: tailorFixture });
    });

    const generate = new GeneratePage(page);
    await generate.goto();
    await generate.pasteJobDescription(SAMPLE_JD);
    await page.getByRole("button", { name: "Generate" }).click();

    // Pipeline status should appear while loading
    await expect(page.getByText("Parse job description")).toBeVisible();

    // Wait for completion
    await expect(page.getByRole("button", { name: "Download PDF" })).toBeVisible({ timeout: 15_000 });
  });

  test("displays validation score after completion", async ({ page }) => {
    await saveProfile(page);

    const generate = new GeneratePage(page);
    await generate.mockTailorApi();
    await generate.goto();
    await generate.pasteJobDescription(SAMPLE_JD);
    await generate.generate();

    const score = await generate.getValidationScore();
    expect(score).toBe(tailorFixture.validation.score);
  });

  test("downloads PDF file when Download PDF is clicked", async ({ page }) => {
    await saveProfile(page);

    const generate = new GeneratePage(page);
    await generate.mockTailorApi();
    await generate.goto();
    await generate.pasteJobDescription(SAMPLE_JD);
    await generate.generate();

    const download = await generate.downloadPdf();
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test("full E2E flow: save profile → enter JD → generate → download PDF", async ({ page }) => {
    // 1. Save profile
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.pasteResume(VALID_RESUME_JSON);
    await profile.save();
    await expect(page.getByText("Saved!")).toBeVisible();

    // 2. Navigate to generate page and mock API
    const generate = new GeneratePage(page);
    await generate.mockTailorApi();
    await generate.goto();

    // 3. Enter job description and generate
    await generate.pasteJobDescription(SAMPLE_JD);
    await generate.selectPages(1);
    await generate.generate();

    // 4. Verify result shows up
    await expect(page.getByRole("button", { name: "Download PDF" })).toBeVisible();
    await expect(page.getByText("Valid", { exact: true })).toBeVisible();

    // 5. Download the PDF
    const download = await generate.downloadPdf();
    expect(download.suggestedFilename()).toMatch(/resume.*\.pdf$/);
  });
});
