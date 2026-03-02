import { parseJd } from "./parse-jd";

export async function fetchJobDescription(source: string): Promise<string> {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch job description: ${res.status} ${res.statusText}`
      );
    }
    const text = await res.text();
    return parseJd(text);
  }
  return source.trim();
}
