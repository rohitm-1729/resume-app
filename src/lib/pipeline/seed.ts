import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { MasterResume } from "../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, "__tests__", "fixtures");

export async function seedMasterResume(
  outputPath = path.join(process.cwd(), "data", "master-resume.json")
): Promise<string> {
  const fixturePath = path.join(FIXTURES_DIR, "master-resume.json");
  const raw = await fs.readFile(fixturePath, "utf-8");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, raw, "utf-8");
  return outputPath;
}

export async function getFixtureMasterResume(): Promise<MasterResume> {
  const fixturePath = path.join(FIXTURES_DIR, "master-resume.json");
  const raw = await fs.readFile(fixturePath, "utf-8");
  return JSON.parse(raw) as MasterResume;
}

export async function getFixtureJobDescription(): Promise<string> {
  const fixturePath = path.join(FIXTURES_DIR, "sample-jd.txt");
  return fs.readFile(fixturePath, "utf-8");
}
