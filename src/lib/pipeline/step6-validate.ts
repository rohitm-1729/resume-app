import type { TailoredResume, ValidationResult } from "../types";

export function validateResume(tailored: TailoredResume): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!tailored.jobTitle?.trim()) errors.push("Missing jobTitle");
  if (!tailored.company?.trim()) errors.push("Missing company");
  if (!tailored.jobDescription?.trim()) errors.push("Missing jobDescription");

  const r = tailored.resume;
  if (!r) {
    errors.push("Missing resume object");
    return { valid: false, errors, warnings, score: 0 };
  }

  if (!r.name?.trim()) errors.push("resume.name is required");
  if (!r.email?.trim()) errors.push("resume.email is required");
  if (!r.phone?.trim()) errors.push("resume.phone is required");
  if (!r.location?.trim()) errors.push("resume.location is required");

  if (!r.experience?.length) {
    errors.push("resume.experience must have at least one entry");
  } else {
    r.experience.forEach((exp, i) => {
      if (!exp.company?.trim()) errors.push(`experience[${i}].company is required`);
      if (!exp.title?.trim()) errors.push(`experience[${i}].title is required`);
      if (!exp.bullets?.length) {
        errors.push(`experience[${i}].bullets must not be empty`);
      } else {
        exp.bullets.forEach((b, j) => {
          if (!b?.trim()) errors.push(`experience[${i}].bullets[${j}] is empty`);
        });
      }
    });
  }

  if (!r.education?.length) {
    errors.push("resume.education must have at least one entry");
  } else {
    r.education.forEach((edu, i) => {
      if (!edu.institution?.trim()) errors.push(`education[${i}].institution is required`);
      if (!edu.degree?.trim()) errors.push(`education[${i}].degree is required`);
    });
  }

  if (!r.skills?.length) errors.push("resume.skills must have at least one entry");

  if (!r.summary?.trim()) warnings.push("resume.summary is missing");

  if (
    tailored.matchScore !== undefined &&
    (tailored.matchScore < 0 || tailored.matchScore > 100)
  ) {
    warnings.push("matchScore should be between 0 and 100");
  }

  const score = Math.max(0, 100 - errors.length * 15 - warnings.length * 5);
  return { valid: errors.length === 0, errors, warnings, score };
}
