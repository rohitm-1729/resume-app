import { describe, it, expect } from "vitest";
import path from "path";
import { fileURLToPath } from "url";
import { loadProfile } from "../step1-load-profile";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, "fixtures");

describe("step1-load-profile", () => {
  it("loads and parses the master resume fixture", async () => {
    const profile = await loadProfile(path.join(FIXTURES, "master-resume.json"));
    expect(profile.name).toBe("Jane Doe");
    expect(profile.email).toBe("jane.doe@example.com");
    expect(profile.experience).toHaveLength(3);
    expect(profile.education).toHaveLength(1);
    expect(profile.skills.length).toBeGreaterThan(0);
  });

  it("throws when the file does not exist", async () => {
    await expect(loadProfile("/nonexistent/path/resume.json")).rejects.toThrow();
  });

  it("throws when the file contains invalid JSON", async () => {
    const invalidPath = path.join(FIXTURES, "sample-jd.txt");
    await expect(loadProfile(invalidPath)).rejects.toThrow();
  });
});
