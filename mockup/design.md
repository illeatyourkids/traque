# Design — Traque (v2, simplified)

A locked design system for the Traque prototype. Every screen reads this file. Extend it; do not regenerate per screen.

## Who this is for
An HVAC or plumbing owner reading on a phone in a truck. Short plain words. One job per screen. One primary button. No product mechanics in the copy.

## Genre
modern-minimal, warmed: calm paper, one green, lots of air. Serif display kept from v1 so it still reads as Traque, used only for the one heading per screen.

## Macrostructure family
- Marketing (home): Marquee Hero. One big line, one button, then three plain steps and a two-column plan choice. No feature-card grid.
- App screens: Letter. One narrow column (max 34rem), heading, one or two lines, the control, one primary button pinned at the bottom on phones.
- Lists (More, Notes, Team, Activity): Letter with a plain row list. Rows are full-width tappable, one line each, chevron on the right.

## Theme (tokens in css/tokens.css)
- `--color-paper`   oklch(97% 0.012 90)
- `--color-surface` oklch(99% 0.004 90)
- `--color-ink`     oklch(23% 0.025 150)
- `--color-muted`   oklch(41% 0.02 150)
- `--color-rule`    oklch(86% 0.018 100)
- `--color-accent`  oklch(37% 0.07 155)  forest green, buttons and links only
- `--color-amber`   waiting / needs a fix
- `--color-green`   working / done
- `--color-focus`   oklch(52% 0.12 155)

## Typography
- Display: Fraunces 500, roman only. One per screen.
- Body: IBM Plex Sans 400/600.
- Mono: Geist Mono, only for a pairing code or a web address.
- Base 17px on phones for readability; 1rem = 1.0625rem body.

## Spacing
4-point named scale. Screens breathe: `--space-2xl` between heading and control, `--space-xl` between groups.

## Motion
- One reveal: none. Buttons: `transform: translateY(1px)` on `:active`, 120ms opacity on state changes.
- Reduced motion: everything instant.

## Microinteractions stance
- Silent success. The button label changes ("Done") and the next step appears. No confetti, no celebratory toasts.
- Undo over confirm for anything reversible.
- Focus ring: 2px `--color-focus`, instant.

## Status words (user-facing)
Not connected · Waiting on you · Still testing · Connected · Needs a fix · Paused · Off · On.
Never "connected" or "done" until a check from Traque's side succeeds. Status always has a word and a dot shape; never colour alone.

## Banned here
MCP, scopes, bundle, manifest, connector (say "connection"), evidence, verified (say "Connected"), credentials (say "sign-ins"), provision, configure. Sparkle, robot, brain imagery. "Supercharge", "unlock", "seamless". Fake stats. Card grids of features. Gradient blobs. Redrawn phone or browser chrome.

## CTA voice
- Primary: filled green pill-ish (8px radius), full width on phones, one per screen, verb first: "Get started", "Open in ChatGPT", "Send a test text", "Save".
- Secondary: plain text link under the button. Never a second filled button.

## What screens MUST share
Wordmark top-left, "More" top-right in the app. Same heading size, same button, same row list.

## What screens MAY differ on
Home only may use the larger display size and two columns on desktop.
