import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TailoredResume } from "@/lib/types";

// Use built-in Helvetica — no external font registration needed
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 48,
    color: "#1a1a1a",
  },
  // Header
  header: {
    marginBottom: 10,
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    fontSize: 9,
    color: "#444",
  },
  contactItem: {
    color: "#444",
  },
  link: {
    color: "#1a56db",
    textDecoration: "none",
  },
  // Sections
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 0.75,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 2,
    marginBottom: 5,
  },
  // Summary
  summaryText: {
    lineHeight: 1.4,
    color: "#333",
  },
  // Experience
  experienceEntry: {
    marginBottom: 7,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  expTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  expDates: {
    fontSize: 9,
    color: "#555",
  },
  expSubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  expCompany: {
    fontSize: 9,
    color: "#555",
    fontFamily: "Helvetica-Oblique",
  },
  expLocation: {
    fontSize: 9,
    color: "#555",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: "#333",
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.35,
    color: "#333",
  },
  // Education
  educationEntry: {
    marginBottom: 5,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eduInstitution: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  eduDate: {
    fontSize: 9,
    color: "#555",
  },
  eduDegree: {
    fontSize: 9,
    color: "#555",
  },
  eduMeta: {
    fontSize: 9,
    color: "#555",
  },
  // Skills
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillCategory: {
    fontFamily: "Helvetica-Bold",
    width: 90,
    fontSize: 9,
  },
  skillItems: {
    flex: 1,
    fontSize: 9,
    color: "#333",
  },
  // Projects
  projectEntry: {
    marginBottom: 5,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  projectName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  projectTech: {
    fontSize: 8,
    color: "#666",
  },
  projectDesc: {
    fontSize: 9,
    color: "#333",
    marginTop: 1,
  },
  // Leadership
  leadershipEntry: {
    marginBottom: 4,
  },
  leadershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leadershipRole: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  leadershipPeriod: {
    fontSize: 9,
    color: "#555",
  },
  leadershipOrg: {
    fontSize: 9,
    color: "#555",
    fontFamily: "Helvetica-Oblique",
  },
  leadershipDesc: {
    fontSize: 9,
    color: "#333",
    marginTop: 1,
  },
});

function formatDate(dateStr: string): string {
  if (dateStr === "Present") return "Present";
  const [year, month] = dateStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface Props {
  tailoredResume: TailoredResume;
}

export function ResumePDF({ tailoredResume }: Props) {
  const r = tailoredResume.resume;

  const contactItems: { label: string; href?: string }[] = [
    { label: r.email, href: `mailto:${r.email}` },
    { label: r.phone },
    { label: r.location },
    ...(r.linkedin ? [{ label: "LinkedIn", href: r.linkedin }] : []),
    ...(r.github ? [{ label: "GitHub", href: r.github }] : []),
    ...(r.website ? [{ label: r.website, href: r.website }] : []),
  ];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{r.name}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <Text key={i} style={styles.contactItem}>
                {i > 0 ? "·  " : ""}
                {item.href ? (
                  <Link src={item.href} style={styles.link}>
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </Text>
            ))}
          </View>
        </View>

        {/* Summary */}
        {r.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{r.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {r.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {r.experience.map((exp, i) => (
              <View key={i} style={styles.experienceEntry}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expDates}>
                    {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                  </Text>
                </View>
                <View style={styles.expSubHeader}>
                  <Text style={styles.expCompany}>{exp.company}</Text>
                  <Text style={styles.expLocation}>{exp.location}</Text>
                </View>
                {exp.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {r.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {r.education.map((edu, i) => (
              <View key={i} style={styles.educationEntry}>
                <View style={styles.eduHeader}>
                  <Text style={styles.eduInstitution}>{edu.institution}</Text>
                  <Text style={styles.eduDate}>
                    {formatDate(edu.graduationDate)}
                  </Text>
                </View>
                <Text style={styles.eduDegree}>
                  {edu.degree} in {edu.field}
                  {edu.gpa ? `  ·  GPA: ${edu.gpa}` : ""}
                </Text>
                {edu.honors && edu.honors.length > 0 && (
                  <Text style={styles.eduMeta}>
                    Honors: {edu.honors.join(", ")}
                  </Text>
                )}
                {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                  <Text style={styles.eduMeta}>
                    Coursework: {edu.relevantCoursework.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {r.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {r.skills.map((skill, i) => (
              <View key={i} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{skill.category}:</Text>
                <Text style={styles.skillItems}>{skill.items.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {r.projects && r.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {r.projects.map((project, i) => (
              <View key={i} style={styles.projectEntry}>
                <View style={styles.projectHeader}>
                  {project.url ? (
                    <Link src={project.url} style={[styles.projectName, styles.link]}>
                      {project.name}
                    </Link>
                  ) : (
                    <Text style={styles.projectName}>{project.name}</Text>
                  )}
                  <Text style={styles.projectTech}>
                    {" "}· {project.technologies.join(", ")}
                  </Text>
                </View>
                <Text style={styles.projectDesc}>{project.description}</Text>
                {project.highlights &&
                  project.highlights.map((h, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{h}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        )}

        {/* Leadership */}
        {r.leadership && r.leadership.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leadership & Volunteering</Text>
            {r.leadership.map((item, i) => (
              <View key={i} style={styles.leadershipEntry}>
                <View style={styles.leadershipHeader}>
                  <Text style={styles.leadershipRole}>{item.role}</Text>
                  <Text style={styles.leadershipPeriod}>{item.period}</Text>
                </View>
                <Text style={styles.leadershipOrg}>{item.organization}</Text>
                {item.description && (
                  <Text style={styles.leadershipDesc}>{item.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
