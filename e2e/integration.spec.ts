import { test, expect } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import masterResume from "./fixtures/master-resume.json";

const BASE_URL = "http://localhost:3002";
const PROFILE_PATH = path.join(os.homedir(), ".resume-app", "profile.json");

test.describe("API integration", () => {
  test("profile round-trip: POST then GET returns same data", async ({ request }) => {
    const postRes = await request.post(`${BASE_URL}/api/profile`, {
      data: masterResume,
    });
    expect(postRes.status()).toBe(200);
    expect(await postRes.json()).toEqual({ ok: true });

    const getRes = await request.get(`${BASE_URL}/api/profile`);
    expect(getRes.status()).toBe(200);
    const profile = await getRes.json();
    expect(profile.name).toBe(masterResume.name);
    expect(profile.email).toBe(masterResume.email);
    expect(profile.experience).toEqual(masterResume.experience);
  });

  test("tailor returns 400 when targetPages is missing", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/tailor`, {
      data: { text: "Looking for a Senior Software Engineer" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/targetPages/);
  });

  test("tailor returns 400 when neither text nor url is provided", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/tailor`, {
      data: { jobDescription: "Looking for a Senior Software Engineer", targetPages: 1 },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/text or url/i);
  });

  test("tailor returns helpful error when no profile exists on disk", async ({ request }) => {
    const backupPath = `${PROFILE_PATH}.bak`;
    let hadProfile = false;
    try {
      await fs.rename(PROFILE_PATH, backupPath);
      hadProfile = true;
    } catch {
      // profile didn't exist on disk — that's the condition we want
    }

    try {
      const res = await request.post(`${BASE_URL}/api/tailor`, {
        data: { text: "Looking for a Senior Software Engineer", targetPages: 1 },
      });
      expect(res.status()).toBe(404);
      const body = await res.json();
      expect(body.error).toBeTruthy();
    } finally {
      if (hadProfile) {
        await fs.rename(backupPath, PROFILE_PATH);
      }
    }
  });

});
