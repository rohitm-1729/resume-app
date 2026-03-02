import { describe, it, expect } from "vitest";
import { escapeLatex } from "../escape";

describe("escapeLatex", () => {
  it("returns plain text unchanged", () => {
    expect(escapeLatex("Hello World")).toBe("Hello World");
  });

  it("escapes backslash", () => {
    expect(escapeLatex("a\\b")).toBe("a\\textbackslash{}b");
  });

  it("escapes ampersand", () => {
    expect(escapeLatex("A & B")).toBe("A \\& B");
  });

  it("escapes percent", () => {
    expect(escapeLatex("100%")).toBe("100\\%");
  });

  it("escapes dollar sign", () => {
    expect(escapeLatex("$100")).toBe("\\$100");
  });

  it("escapes hash", () => {
    expect(escapeLatex("#1")).toBe("\\#1");
  });

  it("escapes underscore", () => {
    expect(escapeLatex("snake_case")).toBe("snake\\_case");
  });

  it("escapes braces", () => {
    expect(escapeLatex("{hello}")).toBe("\\{hello\\}");
  });

  it("escapes tilde", () => {
    expect(escapeLatex("home~dir")).toBe("home\\textasciitilde{}dir");
  });

  it("escapes caret", () => {
    expect(escapeLatex("x^2")).toBe("x\\textasciicircum{}2");
  });

  it("handles multiple special chars in one string", () => {
    expect(escapeLatex("50% & $200")).toBe("50\\% \\& \\$200");
  });

  it("does not double-escape — single pass only", () => {
    // If double-escaping occurred, & would produce \\& and then the backslash
    // would be escaped again. Single pass produces \\& directly.
    expect(escapeLatex("&")).toBe("\\&");
    expect(escapeLatex("\\&")).toBe("\\textbackslash{}\\&");
  });

  it("handles empty string", () => {
    expect(escapeLatex("")).toBe("");
  });
});
