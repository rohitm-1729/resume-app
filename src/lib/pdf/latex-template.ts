import { escapeLatex } from "./escape";
import type {
  TailoredResume,
  ExperienceEntry,
  EducationEntry,
  Project,
  LeadershipItem,
  SkillEntry,
} from "../types";

// ---- date helpers -------------------------------------------------------

const MONTHS = [
  "Jan.", "Feb.", "Mar.", "Apr.", "May",  "Jun.",
  "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.",
];

function formatDate(date: string): string {
  if (date === "Present") return "Present";
  const [year, month] = date.split("-");
  if (!year) return escapeLatex(date);
  if (!month) return year;
  const monthName = MONTHS[parseInt(month, 10) - 1] ?? month;
  return `${monthName} ${year}`;
}

/** Strip https:// / http:// for clean display text inside \href{}. */
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

// ---- preamble -----------------------------------------------------------

function buildPreamble(): string {
  return `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section heading style (Jake's Resume)
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% ATS machine-readable PDF
\\pdfgentounicode=1

%-- Custom commands (Jake's structure + Deedy-CV tight-bullet spacing) --

\\newcommand{\\resumeItem}[1]{
  \\item\\small{{#1 \\vspace{-2pt}}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\small#1 & #2 \\\\
  \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}

% Deedy-CV-style tight bullets: no extra vertical space between items
\\newcommand{\\resumeItemListStart}{%
  \\begin{itemize}[leftmargin=0.1in, itemsep=-1pt, topsep=0pt, parsep=0pt, partopsep=0pt]%
}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}`;
}

// ---- section builders ---------------------------------------------------

function buildHeader(tailored: TailoredResume): string {
  const r = tailored.resume;
  const name = escapeLatex(r.name);
  const phone = escapeLatex(r.phone);
  const emailHref = `\\href{mailto:${r.email}}{\\underline{${escapeLatex(r.email)}}}`;

  const contactParts: string[] = [phone, emailHref];

  if (r.linkedin) {
    contactParts.push(
      `\\href{${r.linkedin}}{\\underline{${escapeLatex(displayUrl(r.linkedin))}}}`
    );
  }
  if (r.github) {
    contactParts.push(
      `\\href{${r.github}}{\\underline{${escapeLatex(displayUrl(r.github))}}}`
    );
  }
  if (r.website) {
    contactParts.push(
      `\\href{${r.website}}{\\underline{${escapeLatex(displayUrl(r.website))}}}`
    );
  }

  const contactLine = contactParts.join(" $|$ ");

  return `%----------HEADING----------
\\begin{center}
  \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
  \\small ${contactLine}
\\end{center}`;
}

function buildEducation(entries: EducationEntry[]): string {
  const items = entries.map((e) => {
    const inst = escapeLatex(e.institution);
    const degreeField = escapeLatex(`${e.degree} in ${e.field}`);
    const gradDate = formatDate(e.graduationDate);
    const gpaLine = e.gpa ? `; GPA: ${escapeLatex(e.gpa)}` : "";

    return `  \\resumeSubheading
    {${inst}}{${gradDate}}
    {${degreeField}${gpaLine}}{}`;
  });

  return `%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart
${items.join("\n")}
\\resumeSubHeadingListEnd`;
}

function buildExperience(entries: ExperienceEntry[]): string {
  const items = entries.map((e) => {
    const title = escapeLatex(e.title);
    const company = escapeLatex(e.company);
    const location = escapeLatex(e.location);
    const dateRange = `${formatDate(e.startDate)} -- ${formatDate(e.endDate)}`;
    const bullets = e.bullets
      .map((b) => `      \\resumeItem{${escapeLatex(b)}}`)
      .join("\n");

    return `  \\resumeSubheading
    {${title}}{${dateRange}}
    {${company}}{${location}}
    \\resumeItemListStart
${bullets}
    \\resumeItemListEnd`;
  });

  return `%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeSubHeadingListStart
${items.join("\n")}
\\resumeSubHeadingListEnd`;
}

function buildProjects(projects: Project[]): string {
  const items = projects.map((p) => {
    const name = escapeLatex(p.name);
    const techs = p.technologies.map(escapeLatex).join(", ");
    const heading = `\\textbf{${name}} $|$ \\emph{${techs}}`;
    const urlPart = p.url
      ? `\\href{${p.url}}{\\underline{${escapeLatex(displayUrl(p.url))}}}`
      : "";

    const descBullet = `      \\resumeItem{${escapeLatex(p.description)}}`;
    const highlightBullets = (p.highlights ?? [])
      .map((h) => `      \\resumeItem{${escapeLatex(h)}}`)
      .join("\n");
    const allBullets = [descBullet, highlightBullets].filter(Boolean).join("\n");

    return `  \\resumeProjectHeading
    {${heading}}{${urlPart}}
    \\resumeItemListStart
${allBullets}
    \\resumeItemListEnd`;
  });

  return `%-----------PROJECTS-----------
\\section{Projects}
\\resumeSubHeadingListStart
${items.join("\n")}
\\resumeSubHeadingListEnd`;
}

function buildSkills(skills: SkillEntry[]): string {
  const lines = skills
    .map((s) => {
      const cat = escapeLatex(s.category);
      const items = s.items.map(escapeLatex).join(", ");
      return `     \\textbf{${cat}}{: ${items}}`;
    })
    .join(" \\\\\n");

  return `%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{
${lines}
  }}
\\end{itemize}`;
}

function buildLeadership(items: LeadershipItem[]): string {
  const entries = items.map((l) => {
    const role = escapeLatex(l.role);
    const org = escapeLatex(l.organization);
    const period = escapeLatex(l.period);
    const desc = l.description
      ? `    \\resumeItemListStart\n      \\resumeItem{${escapeLatex(l.description)}}\n    \\resumeItemListEnd`
      : "";

    return `  \\resumeSubheading
    {${role}}{${period}}
    {${org}}{}${desc ? "\n" + desc : ""}`;
  });

  return `%-----------LEADERSHIP & ACTIVITIES-----------
\\section{Leadership \\& Activities}
\\resumeSubHeadingListStart
${entries.join("\n")}
\\resumeSubHeadingListEnd`;
}

// ---- public API ---------------------------------------------------------

/**
 * Builds a complete LaTeX document string from a TailoredResume.
 *
 * Uses Jake's Resume single-column ATS-friendly template with
 * Deedy-CV tight-bullet spacing.
 */
export function buildLatexDoc(tailored: TailoredResume): string {
  const { resume } = tailored;

  const sections: string[] = [
    buildPreamble(),
    "",
    "\\begin{document}",
    "",
    buildHeader(tailored),
    "",
    buildEducation(resume.education),
    "",
    buildExperience(resume.experience),
  ];

  if (resume.projects?.length) {
    sections.push("", buildProjects(resume.projects));
  }

  sections.push("", buildSkills(resume.skills));

  if (resume.leadership?.length) {
    sections.push("", buildLeadership(resume.leadership));
  }

  sections.push("", "\\end{document}");

  return sections.join("\n");
}
