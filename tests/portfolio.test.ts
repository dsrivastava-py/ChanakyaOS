import { describe, it, expect } from 'vitest';
import {
  isValidUsername,
  normalizeUsername,
  isPublicPortfolioPath,
  mapPublicPortfolio,
  safeHttpUrl,
} from '@/lib/portfolio';

describe('username validation', () => {
  it('accepts valid usernames', () => {
    for (const u of ['abc', 'a-b', 'jane-doe-42', 'a'.repeat(30)]) expect(isValidUsername(u)).toBe(true);
  });
  it('rejects invalid usernames and filter-injection characters', () => {
    for (const u of ['', 'ab', 'a'.repeat(31), '-abc', 'abc-', 'A,b', 'a.b', 'a%b', 'a(b)', 'a b', 'ABC', 'a,username.eq.x']) {
      expect(isValidUsername(u)).toBe(false);
    }
    expect(isValidUsername(undefined)).toBe(false);
    expect(isValidUsername(['abc'])).toBe(false);
  });
  it('normalizes case and whitespace', () => {
    expect(normalizeUsername('  Jane-Doe ')).toBe('jane-doe');
  });
});

describe('isPublicPortfolioPath', () => {
  it('matches only a single valid segment', () => {
    expect(isPublicPortfolioPath('/portfolio/abc')).toBe(true);
    expect(isPublicPortfolioPath('/portfolio/abc/')).toBe(true);
    expect(isPublicPortfolioPath('/portfolio')).toBe(false);
    expect(isPublicPortfolioPath('/portfolio/')).toBe(false);
    expect(isPublicPortfolioPath('/portfolio/abc/x')).toBe(false);
    expect(isPublicPortfolioPath('/portfolio/A%2Cb')).toBe(false);
    expect(isPublicPortfolioPath('/dashboard')).toBe(false);
  });
});

describe('mapPublicPortfolio', () => {
  it('returns null for empty input', () => {
    expect(mapPublicPortfolio(null)).toBeNull();
    expect(mapPublicPortfolio(undefined)).toBeNull();
    expect(mapPublicPortfolio('x')).toBeNull();
  });
  it('handles an empty object', () => {
    const r = mapPublicPortfolio({});
    expect(r?.name).toBe('Professional');
    expect(r?.skills).toEqual([]);
    expect(r?.projects).toEqual([]);
  });
  it('maps data, drops unsafe links and never leaks email', () => {
    const r = mapPublicPortfolio({
      name: 'Jane',
      email: 'jane@example.com',
      skills: ['React'],
      projects: [
        { title: 'A', description: 'd', techStack: ['ts'], link: 'javascript:alert(1)' },
        { title: 'B', description: 'd', techStack: [], link: 'https://example.com/b' },
      ],
      certifications: [{ name: 'AWS', provider: 'Amazon' }],
      current_education: 'BTech CSE',
      pathway: {
        title: 'Frontend Dev',
        projects: [{ title: 'P', description: 'x', techStack: ['css'] }],
        requirements: [{ name: 'Cert', provider: 'Prov' }],
        skills: ['React', 'CSS'],
      },
    });
    expect(r).not.toBeNull();
    expect(JSON.stringify(r)).not.toContain('jane@example.com');
    expect(r!.headline).toBe('Frontend Dev');
    expect(r!.skills).toEqual(['React', 'CSS']);
    expect(r!.projects.find((p) => p.title === 'A')?.link).toBeUndefined();
    expect(r!.projects.find((p) => p.title === 'B')?.link).toBe('https://example.com/b');
    expect(r!.projects).toHaveLength(3);
    expect(r!.certifications.map((c) => c.name)).toEqual(['AWS', 'Cert']);
    expect(r!.education[0].degree).toBe('BTech CSE');
  });
  it('tolerates malformed fields', () => {
    const r = mapPublicPortfolio({ skills: 'x', projects: [1, null], certifications: {}, pathway: 'bad' });
    expect(r?.projects).toEqual([]);
  });
});

describe('safeHttpUrl', () => {
  it('allows only http and https', () => {
    expect(safeHttpUrl('http://a.com')).toBeDefined();
    expect(safeHttpUrl('data:text/html,x')).toBeUndefined();
    expect(safeHttpUrl('not a url')).toBeUndefined();
    expect(safeHttpUrl(5)).toBeUndefined();
  });
});
