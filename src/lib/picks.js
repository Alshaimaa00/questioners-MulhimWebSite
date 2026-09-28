/* Defaults the onboarding screens show before the person touches them.
   A screen that shows a default counts as answered with it (same as the
   original page, which wrote defaults into its state as it rendered them). */
export const DEFAULT_HEIGHT = 170;
export const DEFAULT_WEIGHT = 70;
export const defaultDob = () => ({ d: 1, m: 0, y: new Date().getFullYear() - 25 });

const pad = (n) => String(n).padStart(2, '0');

/** { d, m (0-based), y } -> "YYYY-MM-DD" (what the Customer sheet stores). */
export const isoDate = (g) => `${g.y}-${pad(g.m + 1)}-${pad(g.d)}`;
