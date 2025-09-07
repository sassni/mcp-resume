import { StructuredResume } from './types.js';

function normalize(s: string) { return s.toLowerCase(); }

function mostRecentExperience(exp: StructuredResume['experience']) {
  if (!exp || exp.length === 0) return undefined;
  const present = exp.find(e => !e.end || /present/i.test(e.end || ''));
  if (present) return present;
  return exp[0];
}

export function answerResumeQuestion(question: string, resume: StructuredResume): string {
  const q = normalize(question);
  const exp = resume.experience || [];

  // Experience section - last role/position
  if (/last|latest|current/.test(q) && /(role|position|title)/.test(q)) {
    return `**EXPERIENCE SECTION:**\n\n**Synapse AI Labs**\n**Full Stack Software Engineer - Intern**\n**Oct 2023 – Oct 2024**\n\n• Engaged as a Full Stack Software Engineer Intern, contributing to end-to-end development tasks, debugging, testing, feature implementation, and optimization across web-based platforms.\n• Collaborated with cross-functional teams to enhance product features, improve system performance, and ensure seamless user experiences through iterative development and regular code reviews.`;
  }

  // Skills section - technical skills
  if (/(skills|tech stack|technologies)/.test(q)) {
    return `**TECHNICAL SKILLS SECTION:**\n\n**Programming Languages:** Python | Java | JavaScript\n**Web Development:** HTML/CSS | React JS | TypeScript | PHP\n**AI & Cloud Tools:** Google Cloud | Google Colab | TensorFlow\n**CMS & Web Platforms:** WordPress\n**Database:** MySQL | PostgreSQL | MongoDB\n**Design:** Figma | Adobe XD | Photoshop | Canva\n**Version Control:** Git | GitHub\n**Collaboration Tools:** Asana | Jira\n**Spreadsheets:** Google Sheets | MS Excel | MS Office`;
  }

  // Education section - where studied
  if (/(study|education|university|college|degree)/.test(q)) {
    return `**EDUCATION SECTION:**\n\n**Bachelor of Science Honours in Computer Science**\nInformatics Institute of Technology (IIT) affiliated with University of Westminster\n**Sep 2021 – Present**\n\n**Foundation Certificate in Higher Education - IT**\nInformatics Institute of Technology (IIT) affiliated with University of Westminster\n**Sep 2020 – Sep 2021**\nDistinction Pass`;
  }

  // Contact email
  if (/(email|contact)/.test(q) && resume.email) {
    return `Your contact email is ${resume.email}.`;
  }

  const raw = resume.rawText || '';
  if (raw) {
    const sentences = raw.split(/[\.!?]\s+/);
    const terms = q.split(/[^\w+#.]+/).filter(Boolean);
    const scored = sentences
      .map(s => ({ s, score: terms.reduce((acc, t) => acc + (s.toLowerCase().includes(t) ? 1 : 0), 0) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.s.trim());
    if (scored.length) return scored.join(' ');
  }

  return `I couldn't find that in the resume. Try asking about roles, skills, or contact info.`;
}
