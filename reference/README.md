# Onboarding reference

`Mulhim-Onboarding.html` is a browsable copy of the mobile app's setup flow —
every question, in Arabic and English, with the real branching. Open it in a
browser; it needs no server and no internet, and the images are embedded.

**10 branches · 139 screens.** Pick a goal and it walks the pages that goal
actually opens, because it runs the app's own `setupFlow` rather than a
hand-drawn copy of it.

## What it is for

Checking what the app asks, and in what order, without installing the app.
Where this React rebuild and the file disagree, the file is the app.

## Keep it honest

It is generated from the app's own strings, not written by hand, so a
hand-edit here is lost on the next build and wrong in the meantime. It is
rebuilt in the mobile repo with:

    cd expo && bun run build:onboarding-web

Generated 28 September 2026 from the mobile app's `main`.
