import { test, expect } from "@playwright/test";
import { ProfilePage } from "./pages/profile.page";
import masterResume from "./fixtures/master-resume.json";

const VALID_JSON = JSON.stringify(masterResume, null, 2);

test.describe("Profile page", () => {
  // Mock POST /api/profile so these UI tests don't pollute the real disk profile
  test.beforeEach(async ({ page }) => {
    await page.route("/api/profile", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ json: { ok: true } });
      } else {
        await route.continue();
      }
    });
  });

  test("saves a valid master resume JSON", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.pasteResume(VALID_JSON);
    await profile.save();
    await expect(page.getByText("Saved!")).toBeVisible();
  });

  test("shows validation error for invalid JSON", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.pasteResume("{ not valid json }");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
    await expect(page.locator("p.text-red-600")).toContainText("Invalid JSON");
  });

  test("shows validation error for missing required field", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    const missingName = { ...masterResume };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (missingName as any).name;
    await profile.pasteResume(JSON.stringify(missingName));
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
    await expect(page.locator("p.text-red-600")).toContainText("name");
  });

  test("clears saved resume on Clear", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.pasteResume(VALID_JSON);
    await profile.save();
    await profile.clear();
    await expect(page.locator("textarea")).toHaveValue("");
  });

  test("persists resume in localStorage after page reload", async ({ page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.pasteResume(VALID_JSON);
    await profile.save();

    // Reload and verify content is still there
    await page.reload();
    await expect(page.locator("textarea")).not.toHaveValue("");

    // Verify localStorage contains the saved resume
    const stored = await page.evaluate(() =>
      localStorage.getItem("masterResume")
    );
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.name).toBe(masterResume.name);
  });
});
