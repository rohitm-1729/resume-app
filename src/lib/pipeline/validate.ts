import type { MasterResume, TailoredResume, ValidationResult } from "../types";

export function validateMasterResume(resume: MasterResume): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required top-level fields
  if (!resume.name?.trim()) errors.push("name is required");
  if (!resume.email?.trim()) errors.push("email is required");
  if (!resume.phone?.trim()) errors.push("phone is required");
  if (!resume.location?.trim()) errors.push("location is required");

  // Email format
  if (resume.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email)) {
    errors.push("email format is invalid");
  }

  // Experience
  if (!Array.isArray(resume.experience) || resume.experience.length === 0) {
    errors.push("experience must have at least one entry");
  } else {
    resume.experience.forEach((exp, i) => {
      if (!exp.company?.trim()) errors.push(`experience[${i}].company is required`);
      if (!exp.title?.trim()) errors.push(`experience[${i}].title is required`);
      if (!Array.isArray(exp.bullets) || exp.bullets.length === 0) {
        warnings.push(`experience[${i}] has no bullets`);
      }
    });
  }

  // Education
  if (!Array.isArray(resume.education) || resume.education.length === 0) {
    errors.push("education must have at least one entry");
  } else {
    resume.education.forEach((edu, i) => {
      if (!edu.institution?.trim()) errors.push(`education[${i}].institution is required`);
      if (!edu.degree?.trim()) errors.push(`education[${i}].degree is required`);
    });
  }

  // Skills
  if (!Array.isArray(resume.skills) || resume.skills.length === 0) {
    warnings.push("no skills entries found");
  }

  const score = errors.length === 0 ? Math.max(0, 100 - warnings.length * 5) : 0;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

export function validateTailoredResume(tailored: TailoredResume): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!tailored.jobTitle?.trim()) errors.push("jobTitle is required");
  if (!tailored.company?.trim()) errors.push("company is required");
  if (!tailored.jobDescription?.trim()) errors.push("jobDescription is required");

  if (tailored.matchScore !== undefined) {
    if (tailored.matchScore < 0 || tailored.matchScore > 100) {
      errors.push("matchScore must be between 0 and 100");
    }
    if (tailored.matchScore < 50) {
      warnings.push("matchScore is below 50 — consider better aligning the resume");
    }
  }

  const resumeValidation = validateMasterResume(tailored.resume);
  errors.push(...resumeValidation.errors.map((e) => `resume.${e}`));
  warnings.push(...resumeValidation.warnings.map((w) => `resume.${w}`));

  const score = errors.length === 0 ? Math.max(0, 100 - warnings.length * 5) : 0;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}
