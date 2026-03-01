import fs from "fs/promises";
import type { MasterResume } from "../types";

export async function loadProfile(filePath: string): Promise<MasterResume> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as MasterResume;
}
