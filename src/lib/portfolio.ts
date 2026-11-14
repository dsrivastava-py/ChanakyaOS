// Helpers for opt-in public portfolios. The username regex must match
// supabase/migrations/00010_public_portfolio.sql.

export const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

export interface PortfolioData {
  name: string;
  headline: string;
  bio: string;
  education: { institution: string; degree: string; year: string }[];
  skills: string[];
  projects: { title: string; description: string; techStack: string[]; link?: string }[];
  certifications: { name: string; provider: string; year: string }[];
}

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidUsername(input: unknown): input is string {
  return typeof input === 'string' && USERNAME_REGEX.test(input);
}

/** True for /portfolio/<one valid username segment> only. */
export function isPublicPortfolioPath(pathname: string): boolean {
  const match = /^\/portfolio\/([^/]+)\/?$/.exec(pathname);
  return !!match && isValidUsername(match[1]);
}

export function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function strList(v: unknown): string[] {
  return arr(v)
    .map((item) => (typeof item === 'string' ? item : isObj(item) ? str(item.name) || str(item.skill) : ''))
    .filter(Boolean);
}

/** Maps the get_public_portfolio jsonb to page data. Returns null when there is no portfolio. */
export function mapPublicPortfolio(raw: unknown): PortfolioData | null {
  if (!isObj(raw)) return null;
  const pathway = isObj(raw.pathway) ? raw.pathway : null;
  const title = pathway ? str(pathway.title) : '';
  const year = new Date().getFullYear().toString();

  const profileProjects = arr(raw.projects).filter(isObj).map((p) => ({
    title: str(p.title) || str(p.name),
    description: str(p.description),
    techStack: strList(p.techStack),
    link: safeHttpUrl(p.link ?? p.url),
  }));
  const pathwayProjects = pathway
    ? arr(pathway.projects).filter(isObj).map((p) => ({
        title: str(p.title),
        description: str(p.description),
        techStack: strList(p.techStack),
        link: safeHttpUrl(p.link ?? p.url),
      }))
    : [];

  const profileCerts = arr(raw.certifications).map((c) =>
    typeof c === 'string'
      ? { name: c, provider: '', year }
      : isObj(c)
        ? { name: str(c.name), provider: str(c.provider), year: str(c.year) || year }
        : { name: '', provider: '', year }
  );
  const pathwayCerts = pathway
    ? arr(pathway.requirements).filter(isObj).map((r) => ({ name: str(r.name), provider: str(r.provider), year }))
    : [];

  const skills = Array.from(new Set([...strList(raw.skills), ...(pathway ? strList(pathway.skills) : [])]));
  const education = str(raw.current_education);

  return {
    name: str(raw.name) || 'Professional',
    headline: title || 'Career Professional',
    bio: `Passionate professional specializing in ${title || 'technology'}`,
    education: education ? [{ institution: '', degree: education, year: '' }] : [],
    skills,
    projects: [...profileProjects, ...pathwayProjects].filter((p) => p.title),
    certifications: [...profileCerts, ...pathwayCerts].filter((c) => c.name),
  };
}
