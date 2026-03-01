export interface SkillEntry {
  category: string;
  items: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  highlights?: string[];
}

export interface LeadershipItem {
  role: string;
  organization: string;
  period: string;
  description?: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | "Present";
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
  honors?: string[];
  relevantCoursework?: string[];
}

export interface MasterResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects?: Project[];
  leadership?: LeadershipItem[];
}

export interface TailoredResume {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resume: MasterResume;
  tailoringNotes?: string;
  matchScore?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score?: number;
}

export interface PipelineResult {
  success: boolean;
  tailoredResume?: TailoredResume;
  validation?: ValidationResult;
  pdfBuffer?: Buffer;
  error?: string;
  steps: {
    name: string;
    status: "pending" | "running" | "success" | "error";
    duration?: number;
    error?: string;
  }[];
}
