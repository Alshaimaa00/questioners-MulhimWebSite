# Mulhim — onboarding + questionnaire (merged React app)

This merges the two exported pages you gave me — the onboarding flow and the
health questionnaire — into a single React app that runs as one continuous
journey:

    welcome → account → intro → onboarding setup → about you → health questionnaire → done

## Run it

```
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
```

## Layout

- `src/data/content.json` — the onboarding's original text + flow spec (both languages)
- `src/data/questionnaire-db.json` — the questionnaire's question bank (163 questions)
- `src/lib/` — the ported logic: flow branching (`flow.js`), question show/hide
  rules (`questionnaire.js`), Hijri calendar (`hijri.js`), validation
  (`validate.js`), CSV/sheet export (`submit.js`), saved-progress (`storage.js`)
- `src/state/AppState.jsx` — the one store for the whole journey
- `src/screens/` — every screen, grouped by phase (`setupScreens/` = onboarding
  screens, `qs/` = questionnaire screens)
- `src/components/` — shared UI: the phone-frame shell (`Shell.jsx`), buttons/
  cards/chips (`ui.jsx`), the wheel & ruler pickers (`pickers.jsx`)
- `src/styles/` — `onboarding.css` (ported 1:1 from the original page) +
  `qs.css` (the questionnaire's screens re-themed onto the same design tokens)
- `src/config.js` — every tunable from the questionnaire's original CONFIG
  block (language default, which follow-up questionnaire to route to, etc.)

## Brand identity

Restyled to match mulhim-plan-track-insight.lovable.app's own design system
(same `src/index.css` tokens): OKLCH colors (dark navy/teal `--background`
and `--stage`, muted teal `--primary`/`--accent`), the Sora + Manrope font
pairing, and the same "stage" radial-gradient backdrop used there. All colors
are still plain CSS custom properties in `src/styles/onboarding.css`'s
`:root` block, so retuning the palette later is a one-place edit.

## Notes on the merge

- The questionnaire's own "About you" page only asks what the onboarding
  hadn't already collected — name, birth date, and gender carry straight over
  (see `PREFILLED` / `customerFromOnboarding` in `src/lib/questionnaire.js`).
- Weight and height (Q2/Q3 in the question bank) are filled in from the
  onboarding's measurements screen and hidden rather than asked twice.
- Both phases now share one shell (header, progress, footer button) so the
  questionnaire doesn't feel like a different app bolted onto the onboarding.
- Styled as a responsive website (a centred column that fills the browser,
  no phone-bezel mock-up) rather than a mobile-app frame — it works the same
  way from a phone browser up to a wide desktop window.
- The admin/export panel (`?admin=1` or Ctrl+Shift+A) still produces the same
  CSV files for `Questionnaire_Database_Aligned.xlsx`, plus a new
  `Onboarding` sheet for what the onboarding collected.

## Tested

Ran the full flow headlessly (English and Arabic, both RTL/LTR) end to end —
every onboarding screen, the full 90-question Juthoor questionnaire plus a
follow-up questionnaire, submission, and the admin CSV export — with zero
console errors.
