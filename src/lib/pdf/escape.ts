/**
 * Escapes special LaTeX characters in a string so it can be safely
 * embedded in LaTeX document content (not URLs).
 *
 * Handled chars: \ & % $ # _ { } ~ ^
 */
export function escapeLatex(text: string): string {
  return text.replace(/[\\&%$#_{}~^]/g, (char) => {
    switch (char) {
      case "\\": return "\\textbackslash{}";
      case "&":  return "\\&";
      case "%":  return "\\%";
      case "$":  return "\\$";
      case "#":  return "\\#";
      case "_":  return "\\_";
      case "{":  return "\\{";
      case "}":  return "\\}";
      case "~":  return "\\textasciitilde{}";
      case "^":  return "\\textasciicircum{}";
      default:   return char;
    }
  });
}
