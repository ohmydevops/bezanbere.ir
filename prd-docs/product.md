# Bezan Bere — PRD

**v1.0 · May 20, 2026**

---

## Principles

1. **Calm over capable** — never add a feature that adds stress
2. **Action over organization** — every interaction moves toward doing
3. **Restraint over scale** — if it can be removed, remove it

---

## Core Rules

| Rule | Detail |
|---|---|
| Max 5 active tasks | Block add with: *"یه کار تموم کن، بعد اضافه کن."* |
| Title only | No deadlines, notes, tags, priorities, or subtasks |
| No account | All data local — no login, no sync, no tracking |
| No onboarding | Instantly usable on first open |

---

## MVP User Stories

| # | Story | Acceptance Criteria |
|---|---|---|
| 1 | See tasks on open | Task list visible in < 1s (repeat visit) |
| 2 | Add task (type + Enter) | Task appears within 100ms |
| 3 | Complete task (tap checkbox) | Smooth animation, task disappears |
| 4 | Blocked at 5 tasks | Message shown, no input appears |
| 5 | Works offline | Fully functional after first load |
| 6 | Install to home screen | PWA install prompt available |
| 7 | Delete task | Swipe-to-delete on mobile |

---

## UX

- **Language:** Persian (Farsi) — `lang="fa"`, `dir="rtl"`, full RTL layout
- **Font:** Vazirmatn
- **Layout:** Title top · task list middle · floating "+" bottom-left (RTL thumb zone)
- **Theme:** Auto-detect `prefers-color-scheme`, user-toggleable, saved locally
- **Colors:** Off-white (light) / deep grey (dark), one calm accent — color signals completion only
- **Animations:** Add 150ms · complete 300ms strikethrough + 200ms fade · delete 150ms — subtle, never bouncy

**Main screen:** App title · task list · floating add button. Nothing else.

**Add modal:** Auto-focused input · *"چی باید انجام بشه؟"* placeholder · Enter or tap to confirm · dismiss on outside tap.

---

## Non-Goals

No collaboration, AI, calendar, reminders, pomodoro, habits, analytics, gamification, or import/export.

**If it increases mental load, it doesn't belong here.**
