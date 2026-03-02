import { type Page } from "@playwright/test";
import tailorFixture from "../fixtures/tailor-response.json";

export class GeneratePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async mockTailorApi() {
    await this.page.route("/api/tailor", async (route) => {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      if (!body.text && !body.url) {
        await route.fulfill({ status: 400, json: { error: "Provide text or url" } });
        return;
      }
      if (body.targetPages !== 1 && body.targetPages !== 2) {
        await route.fulfill({ status: 400, json: { error: "targetPages must be 1 or 2" } });
        return;
      }
      await route.fulfill({ json: tailorFixture });
    });
  }

  async pasteJobDescription(text: string) {
    await this.page.getByRole("button", { name: "Paste text" }).click();
    await this.page.locator("textarea").fill(text);
  }

  async selectPages(n: 1 | 2) {
    await this.page.locator(`input[type="radio"][value="${n}"]`).check();
  }

  async generate() {
    await this.page.getByRole("button", { name: "Generate" }).click();
    // Wait for either result or error to appear
    await this.page
      .locator('[class*="bg-red-50"], button:has-text("Download PDF")')
      .waitFor({ state: "visible", timeout: 15_000 });
  }

  async downloadPdf() {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByRole("button", { name: "Download PDF" }).click(),
    ]);
    return download;
  }

  async getValidationScore() {
    const text = await this.page
      .locator("span")
      .filter({ hasText: /^\d+\/100$/ })
      .first()
      .textContent();
    return text ? parseInt(text.split("/")[0], 10) : null;
  }

  async getErrorText() {
    return this.page.locator('[class*="bg-red-50"]').textContent();
  }
}
