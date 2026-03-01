import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchJobDescription } from "../step2-fetch-jd";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("step2-fetch-jd — plain text input", () => {
  it("returns plain text unchanged (trimmed)", async () => {
    const jd = "  We are hiring a software engineer.  ";
    const result = await fetchJobDescription(jd);
    expect(result).toBe("We are hiring a software engineer.");
  });

  it("handles multiline plain text", async () => {
    const jd = "Role: Engineer\nRequirements:\n- 5 years exp";
    const result = await fetchJobDescription(jd);
    expect(result).toBe(jd.trim());
  });
});

describe("step2-fetch-jd — URL input", () => {
  it("fetches and strips HTML tags from a URL", async () => {
    const html = "<h1>Staff Engineer</h1><p>We are looking for talent.</p>";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: async () => html })
    );

    const result = await fetchJobDescription("https://example.com/job");
    expect(result).not.toContain("<h1>");
    expect(result).toContain("Staff Engineer");
    expect(result).toContain("We are looking for talent.");
  });

  it("strips script and style blocks", async () => {
    const html =
      "<style>body{color:red}</style><script>alert(1)</script><p>Job posting</p>";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: async () => html })
    );

    const result = await fetchJobDescription("https://example.com/job");
    expect(result).not.toContain("color:red");
    expect(result).not.toContain("alert");
    expect(result).toContain("Job posting");
  });

  it("decodes common HTML entities", async () => {
    const html = "<p>Salary &amp; Benefits &lt;details&gt;</p>";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: async () => html })
    );

    const result = await fetchJobDescription("https://example.com/job");
    expect(result).toContain("Salary & Benefits <details>");
  });

  it("throws on non-OK HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: "Not Found" })
    );

    await expect(fetchJobDescription("https://example.com/gone")).rejects.toThrow(
      "404"
    );
  });
});
