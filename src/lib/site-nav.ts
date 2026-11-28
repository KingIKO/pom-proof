/**
 * The site's sections, in header order. The header and the 404 page both list them.
 *
 * Study joined the header once its first 18 core pages, stages A and B, were written and
 * reviewed (owner decision, 2026-11-27). Setting `showStudyInNav` to false hides it again.
 */
export const showStudyInNav = true;

const allSections = [
  { id: 'practice', label: 'Practice', path: '/' },
  { id: 'study', label: 'Study', path: '/study/' },
  { id: 'questions', label: 'Questions', path: '/questions/' },
  { id: 'tracks', label: 'Tracks', path: '/tracks/' },
  { id: 'progress', label: 'Progress', path: '/progress/' },
] as const;

export type SectionId = (typeof allSections)[number]['id'];

export const siteSections = allSections.filter(({ id }) => id !== 'study' || showStudyInNav);
