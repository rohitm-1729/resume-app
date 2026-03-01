import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { stripHtml, normalizeWhitespace, isHtml, parseJd } from "../parse-jd";

const fixturesDir = join(__dirname, "fixtures");
const sampleJdTxt = readFileSync(join(fixturesDir, "sample-jd.txt"), "utf-8");
const sampleJdHtml = readFileSync(join(fixturesDir, "sample-jd.html"), "utf-8");

describe("isHtml", () => {
  it("detects HTML input", () => {
    expect(isHtml("<p>Hello</p>")).toBe(true);
    expect(isHtml("<!DOCTYPE html><html></html>")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isHtml("Staff Software Engineer\nDataFlow Inc")).toBe(false);
    expect(isHtml("Just plain text")).toBe(false);
  });
});

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    const result = stripHtml("<h1>Job Title</h1><p>Description</p>");
    expect(result).not.toMatch(/<[^>]+>/);
    expect(result).toContain("Job Title");
    expect(result).toContain("Description");
  });

  it("decodes HTML entities", () => {
    expect(stripHtml("&amp; &lt; &gt; &quot; &#39; &nbsp;")).toBe(
      "& < > \" ' " + " "
    );
  });

  it("removes script and style blocks entirely", () => {
    const html = "<script>alert('xss')</script><p>Content</p><style>body{}</style>";
    const result = stripHtml(html);
    expect(result).not.toContain("alert");
    expect(result).not.toContain("body{}");
    expect(result).toContain("Content");
  });

  it("converts block elements to newlines", () => {
    const html = "<p>Line one</p><p>Line two</p>";
    const result = stripHtml(html);
    expect(result).toContain("\n");
  });

  it("strips HTML from sample-jd.html fixture", () => {
    const result = stripHtml(sampleJdHtml);
    expect(result).not.toMatch(/<[^>]+>/);
    expect(result).toContain("Staff Software Engineer");
    expect(result).toContain("DataFlow Inc");
  });
});

describe("normalizeWhitespace", () => {
  it("trims lines and removes blank lines", () => {
    const input = "  line one  \n\n   line two   \n\n";
    const result = normalizeWhitespace(input);
    expect(result).toBe("line one\nline two");
  });

  it("handles already-clean text", () => {
    const input = "line one\nline two";
    expect(normalizeWhitespace(input)).toBe("line one\nline two");
  });
});

describe("parseJd", () => {
  it("parses plain text JD without modification beyond normalization", () => {
    const result = parseJd(sampleJdTxt);
    expect(result).toContain("Staff Software Engineer");
    expect(result).toContain("DataFlow Inc");
    expect(result).toContain("Kafka");
  });

  it("parses HTML JD by stripping tags and normalizing", () => {
    const result = parseJd(sampleJdHtml);
    expect(result).not.toMatch(/<[^>]+>/);
    expect(result).toContain("Staff Software Engineer");
    expect(result).toContain("DataFlow Inc");
    expect(result).toContain("Kafka");
  });

  it("HTML and text fixtures produce similar key content", () => {
    const fromText = parseJd(sampleJdTxt);
    const fromHtml = parseJd(sampleJdHtml);
    // Both should contain the same key phrases
    const keyPhrases = ["Staff Software Engineer", "DataFlow Inc", "Kafka", "Flink"];
    for (const phrase of keyPhrases) {
      expect(fromText).toContain(phrase);
      expect(fromHtml).toContain(phrase);
    }
  });

  it("returns non-empty output for valid input", () => {
    expect(parseJd(sampleJdTxt).length).toBeGreaterThan(100);
    expect(parseJd(sampleJdHtml).length).toBeGreaterThan(100);
  });
});
