import { describe, it, expect, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { seedMasterResume, getFixtureMasterResume, getFixtureJobDescription } from "../seed";

describe("seed — getFixtureMasterResume", () => {
  it("returns the master resume fixture", async () => {
    const profile = await getFixtureMasterResume();
    expect(profile.name).toBe("Jane Doe");
    expect(profile.experience.length).toBeGreaterThan(0);
    expect(profile.skills.length).toBeGreaterThan(0);
  });
});

describe("seed — getFixtureJobDescription", () => {
  it("returns a non-empty job description string", async () => {
    const jd = await getFixtureJobDescription();
    expect(typeof jd).toBe("string");
    expect(jd.length).toBeGreaterThan(50);
    expect(jd).toContain("DataFlow");
  });
});

describe("seed — seedMasterResume", () => {
  let tmpPath: string;

  afterEach(async () => {
    if (tmpPath) {
      await fs.rm(path.dirname(tmpPath), { recursive: true, force: true });
    }
  });

  it("writes master-resume.json to the specified output path", async () => {
    tmpPath = path.join(os.tmpdir(), `resume-seed-test-${Date.now()}`, "master-resume.json");

    const result = await seedMasterResume(tmpPath);
    expect(result).toBe(tmpPath);

    const written = await fs.readFile(tmpPath, "utf-8");
    const parsed = JSON.parse(written);
    expect(parsed.name).toBe("Jane Doe");
  });

  it("creates parent directories if they do not exist", async () => {
    tmpPath = path.join(
      os.tmpdir(),
      `resume-seed-test-${Date.now()}`,
      "nested",
      "dir",
      "master-resume.json"
    );

    await seedMasterResume(tmpPath);
    const exists = await fs.access(tmpPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });
});
