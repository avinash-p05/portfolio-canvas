/**
 * Everything shown on the canvas is described by these types. To make the portfolio your own,
 * edit `portfolio.ts`; the components only read from it.
 *
 * Positions (`x`, `y`) are world coordinates on the canvas, in pixels. `(0, 0)` is roughly the
 * centre of the intro card. Text fields accept `**bold**` for emphasis.
 */

/** Where something sits on the canvas. `w` is a width in pixels, `r` a rotation in degrees. */
export interface Placement {
  x: number;
  y: number;
  w?: number;
  r?: number;
}

export type ZoneId = 'intro' | 'work' | 'projects' | 'wins' | 'stack' | 'learning' | 'contact';

export interface ZoneLabel extends Placement {
  title: string;
  subtitle: string;
}

export interface Person {
  name: string;
  /** Initials shown on the avatar, and on the postcard stamp when there's no photo. */
  initials: string;
  /** Photo for the postcard stamp, served from public/. Falls back to the initials if missing. */
  photo?: string;
  /** Short role shown in the page title. */
  role: string;
  email: string;
  resumeUrl: string;
  links: { label: string; url: string }[];
}

export interface Intro extends Placement {
  status: string;
  /** Headline before and after the highlighted word. */
  headline: { before: string; highlight: string; after: string };
  body: string;
  tags: string[];
}

export interface Experience extends Placement {
  company: string;
  role: string;
  period: string;
  bullets: string[];
  metrics: { value: string; label: string }[];
  /** What the live cursor says when it comments on this card. */
  note: string;
}

export type StickyColor = 'yellow' | 'pink' | 'green' | 'blue' | 'purple';

export interface Sticky extends Placement {
  id: string;
  color: StickyColor;
  place: string;
  title: string;
  detail: string;
}

export type ProjectArt = 'pipeline' | 'retrieval' | 'workers' | 'qr' | 'peaks' | 'globe';

export interface Project extends Placement {
  id: string;
  name: string;
  kind: string;
  description: string;
  stack: string[];
  links: { label: string; url: string }[];
  art: ProjectArt;
  /** Two colours for the card's illustration background. */
  gradient: [string, string];
  /** Stroke colour for the illustration. */
  ink: string;
  note: string;
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export interface SkillCard extends Placement {
  groups: SkillGroup[];
}

export interface Education extends Placement {
  degree: string;
  period: string;
  score: string;
  scoreLabel: string;
  school: string;
}

export interface Certifications extends Placement {
  items: { name: string; issuer: string }[];
}

export interface Contact extends Placement {
  message: string;
  detail: string;
}

/** Handwritten annotations and the arrows that connect zones. */
export interface Annotation extends Placement {
  text: string;
}

export type Arrow = [from: [number, number], control: [number, number], to: [number, number]];

export interface TourStep {
  zone: ZoneId;
  /** Where the cursor points, in world coordinates. */
  at: [number, number];
  text: string;
}

export interface Portfolio {
  person: Person;
  labels: Record<Exclude<ZoneId, 'intro'>, ZoneLabel>;
  intro: Intro;
  startHere: Annotation;
  experience: Experience[];
  highlight: Sticky;
  projects: Project[];
  wins: Sticky[];
  skills: SkillCard[];
  education: Education;
  certifications: Certifications;
  contact: Contact;
  annotations: Annotation[];
  arrows: Arrow[];
  tour: TourStep[];
  greeting: string;
  /** Lines the live cursor cycles through when it retypes the status pill. */
  statusLines: string[];
}
