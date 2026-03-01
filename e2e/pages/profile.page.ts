import { type Page } from "@playwright/test";

export class ProfilePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/profile");
  }

  async pasteResume(json: string) {
    await this.page.locator("textarea").fill(json);
  }

  async save() {
    await this.page.getByRole("button", { name: "Save profile" }).click();
    await this.page.getByText("Saved!").waitFor({ state: "visible" });
  }

  async clear() {
    await this.page.getByRole("button", { name: "Clear" }).click();
  }

  async getSavedMessage() {
    return this.page.getByText("Saved!").textContent();
  }

  async getValidationError() {
    return this.page.locator("p.text-red-600").textContent();
  }
}
