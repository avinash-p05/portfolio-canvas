export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const prefersDarkScheme = () => matchMedia('(prefers-color-scheme: dark)').matches;

/** Phones get the page view by default and tighter camera framing. */
export const isNarrow = () => innerWidth < 700;

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
