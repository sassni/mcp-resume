import fs from 'fs/promises';
import path from 'path';
import { StructuredResume } from './types.js';
import { isProbablyJson, isProbablyPdf } from './util.js';

async function extractTextFromPdf(absPath: string): Promise<string> {
  const pdf = (await import('pdf-parse')).default as any;
  const data = await fs.readFile(absPath);
  const res = await pdf(data);
  return String(res.text || '');
}

function cleanLine(line: string): string {
  return line.replace(/^[-•*]\s+/, '').trim();
}

function parseListSection(lines: string[], startIdx: number): { items: string[]; nextIdx: number } {
  const items: string[] = [];
  let i = startIdx + 1;
  while (i < lines.length) {
    const line = cleanLine(lines[i].trim());
    if (!line || /^#{1,6}\s|^\*\*|^[A-Z].+:/.test(line)) break;
    if (line) items.push(line);
    i++;
  }
  return { items, nextIdx: i };
}

function tryStructuredFromMarkdown(text: string): StructuredResume {
  const lines = text.split(/\r?\n/);
  const sr: StructuredResume = { experience: [], rawText: text };

  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (email) sr.email = email[0];

  // ---------- Skills ----------
  const techSkillsIdx = lines.findIndex(l => /^TECHNICAL SKILLS/i.test(l));
  if (techSkillsIdx !== -1) {
    const items: string[] = [];
    let i = techSkillsIdx + 1;
    while (i < lines.length) {
      const line = cleanLine(lines[i].trim());
      if (!line || /^[A-Z\s]+$/.test(line)) break;
      if (line) {
        const skillLine = line.split(/[-|]/).map(s => s.trim()).filter(Boolean);
        items.push(...skillLine);
      }
      i++;
    }
    sr.skills = items.filter(Boolean);
  }

  // ---------- Experience ----------
  const expIdx = lines.findIndex(l => /^EXPERIENCE/i.test(l));
  if (expIdx !== -1) {
    let i = expIdx + 1;
    while (i < lines.length) {
      let line = cleanLine(lines[i]?.trim() || '');
      if (!line) { i++; continue; }
      if (/^[A-Z\s]+$/.test(line)) break;

      if (line && line.length > 3 && !/\(.*\)/.test(line)) {
        const nextLine = cleanLine(lines[i+1]?.trim() || '');
        const thirdLine = cleanLine(lines[i+2]?.trim() || '');
        
        let company = line;
        let title = '';
        let start = '';
        let end = '';
        
        if (nextLine && nextLine.length > 5 && !/^[A-Z\s]+$/.test(nextLine) && !/\(.*\)/.test(nextLine)) {
          title = nextLine;
          if (thirdLine && /\(.*\)/.test(thirdLine)) {
            const dateMatch = thirdLine.match(/\((.*?)\)/);
            if (dateMatch) {
              const dates = dateMatch[1].split(/[–—-]/).map(s => s.trim());
              start = dates[0];
              end = dates[1] || 'Present';
            }
          }
        }
        
        if (company) {
          sr.experience.push({ company, title, start, end });
        }
      }
      i++;
    }
  }

  // ---------- Education ----------
  const eduIdx = lines.findIndex(l => /^EDUCATION/i.test(l));
  if (eduIdx !== -1) {
    sr.education = [];
    let i = eduIdx + 1;
    while (i < lines.length) {
      let line = cleanLine(lines[i]?.trim() || '');
      if (!line) { i++; continue; }
      if (/^[A-Z\s]+$/.test(line)) break;

      if (line && line.length > 10) {
        const nextLine = cleanLine(lines[i+1]?.trim() || '');
        const thirdLine = cleanLine(lines[i+2]?.trim() || '');
        
        let degree = line;
        let school = '';
        let start = '';
        let end = '';
        
        if (nextLine && nextLine.length > 5 && !/^[A-Z\s]+$/.test(nextLine)) {
          school = nextLine;
          if (thirdLine && /\(.*\)/.test(thirdLine)) {
            const dateMatch = thirdLine.match(/\((.*?)\)/);
            if (dateMatch) {
              const dates = dateMatch[1].split(/[–—-]/).map(s => s.trim());
              start = dates[0];
              end = dates[1] || 'Present';
            }
          }
        }
        
        if (degree) {
          sr.education.push({ school, degree, start, end });
        }
      }
      i++;
    }
  }

  return sr;
}

export async function loadResume(inputPath: string): Promise<StructuredResume> {
  const abs = path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);
  if (isProbablyJson(abs)) {
    const raw = await fs.readFile(abs, 'utf8');
    const parsed = JSON.parse(raw);
    return { experience: [], ...parsed, rawText: raw } as StructuredResume;
  }
  let text = '';
  if (isProbablyPdf(abs)) text = await extractTextFromPdf(abs);
  else text = await fs.readFile(abs, 'utf8');
  const structured = tryStructuredFromMarkdown(text);
  if (!structured.rawText) structured.rawText = text;
  return structured;
}
