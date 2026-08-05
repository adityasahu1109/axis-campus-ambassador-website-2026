# 🔥 AXIS'27 Campus Ambassador Portal — Redesign Specification
> **Codename:** Ignis Aeternum — "Illuminate the Infinite"
> **Scope:** Full visual/UX rebuild, functionality unchanged, package upgrades, mobile-first responsive rework.
> **Status:** Planning document — implementation pending source code handoff.

---

## 0. How to use this document

This is the single source of truth for the rebuild. Every page, component, and design decision from the current
site (per `project_architecture.md`) is mapped to its new treatment here. Nothing in "Features & Functionality"
changes — routes, auth flow, Supabase calls, RPCs, and data shapes stay exactly as they are. Only the
presentation layer is scrapped and rebuilt.

When implementation starts, work in this order:
1. Design tokens & global config (Section 2–4)
2. Shared components — Navbar, Footer, buttons, cards, badges (Section 6)
3. Public pages (Section 7)
4. Authenticated pages (Section 8)
5. Polish pass — motion, responsive QA, favicon/meta (Section 9–10)

---

## 1. Package Upgrades

| Package | Current | Target | Notes |
|---|---|---|---|
| `tailwindcss` | 3.4.18 | **^4.x** | CSS-first config via `@theme` in `index.css`; delete `tailwind.config.js`, delete `postcss.config.js` in favor of `@tailwindcss/vite` plugin |
| `@tailwindcss/vite` | — | **new** | Replaces the PostCSS pipeline for Tailwind v4 |
| `postcss` / `autoprefixer` | present | **remove** | No longer needed once on `@tailwindcss/vite` |
| `vite` | 7.1.7 | latest 7.x | keep current major, bump patch |
| `react` / `react-dom` | 19.2.0 | latest 19.x | bump patch |
| `react-router-dom` | 7.9.4 | latest 7.x | bump patch, no API changes expected |
| `@supabase/supabase-js` | 2.75.1 | latest 2.x | bump patch |
| `react-icons` | 5.5.0 | keep | still used for iconography unless replaced by custom SVG icon set (see §5) |
| `framer-motion` (or `motion`) | — | **new (add)** | for page transitions, hover states, gravitational-lensing ring animation, reveal-on-scroll |
| `clsx` | — | **new (add)** | class-name composition, small utility, cleans up conditional Tailwind classes |

**Fonts** — remove the Inter Google Fonts `<link>` in `index.html`, replace with:
- **Display/Heading:** `Space Grotesk` (geometric, techy, good weight range) — or `Chakra Petch` as an alternate if a more "sci-fi terminal" feel is wanted. Recommendation: **Space Grotesk** for headings, weights 500/600/700.
- **Monospace (metadata, timestamps, IDs, badges, terminal UI):** `JetBrains Mono` or `Space Mono` — weights 400/500/700.
- **Body:** Space Grotesk at 400 also works for body copy to keep the font count to two families total (simpler, faster load, more cohesive).

Load via `@fontsource` npm packages instead of Google Fonts `<link>` tags (avoids render-blocking external request, works better with Vite bundling):
```
npm i @fontsource/space-grotesk @fontsource/jetbrains-mono
```

---

## 2. Design Tokens (Tailwind v4 `@theme`)

All tokens live in `src/index.css` under `@theme`, replacing the old `tailwind.config.js` extend block entirely.

```css
@import "tailwindcss";

@theme {
  /* Core brand */
  --color-void: #121216;
  --color-obsidian: #16161A;
  --color-obsidian-soft: #1C1C22;
  --color-sandstone: #DAD2C5;
  --color-sandstone-dim: #B8AF9F;

  --color-amber: #FF9E00;
  --color-amber-bright: #FFD166;
  --color-amber-deep: #FF3D00;

  --color-cyan: #00F0FF;
  --color-cyan-soft: #90E0EF;
  --color-cyan-deep: #005792;

  /* Semantic */
  --color-success: #4ADE80;
  --color-warning: #FFD166;
  --color-danger: #FF3D00;
  --color-border: #2A2A32;

  /* Fonts */
  --font-display: "Space Grotesk", ui-sans-serif, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Radii — sharp/angular per brand, not soft rounded */
  --radius-panel: 2px;
  --radius-chip: 999px; /* pills stay round for badges/status */
}
```

**Palette usage rules** (critical — do not let these blur):
- `void` / `obsidian` = base backgrounds only. Never used for text or borders.
- `sandstone` = structural/management-flavored surfaces (cards under Aethel-associated content: admin/organizer areas, profile, static informational sections)
- `amber` = primary action color — CTAs, active states, Nix-flavored content (student dashboard, tasks, energy/urgency)
- `cyan` = secondary accent — links, metrics, gridlines, crosshairs, data/leaderboard numbers
- Never mix amber-as-primary and cyan-as-primary in the same component; pick one dominant accent per section based on which narrator "owns" it (see §5).

---

## 3. Layout & Motif System (reusable, not one-off)

These are the recurring visual devices from the brand PDF, each built as a small reusable component/utility so they don't get redrawn ad hoc per page.

| Motif | Where used | Implementation |
|---|---|---|
| **Corner markers** (`⌐` style brackets at card corners) | Card component wrapper, hero frame, modal frame | CSS `::before`/`::after` on a `.axis-frame` utility class — 4 small L-shaped strokes in cyan, 1px |
| **Crosshair (`+`)** | Decorative accents near headings, loading states, empty states | Small inline SVG component `<Crosshair />`, 12–16px, cyan |
| **Gravitational lensing ring** | Hero section behind title, around key stat numbers, around leaderboard #1 spot | SVG concentric warped ellipses, subtle slow rotation via CSS animation (`prefers-reduced-motion` respected — disable animation if set) |
| **Recursive grid / scanlines** | Section backgrounds (very subtle, low opacity ~4–6%) | Repeating-linear-gradient CSS background utility `.axis-grid-bg` |
| **Terminal readout labels** | Section eyebrows, status badges, timestamps | `font-mono uppercase tracking-wider text-xs` + `//` or `>` prefix character baked into a `<TerminalLabel />` component, e.g. `// SECTION 02` |
| **Fractured/glass shard divider** | Between major homepage sections | Clip-path polygon divider SVG, alternating amber/cyan edge glow |

All of the above go into a small `src/components/motifs/` folder — new in the rebuild — so every page pulls from the same set instead of custom SVGs per page.

---

## 4. Responsive Strategy

Breakpoints (Tailwind v4 defaults, confirmed to keep): `sm 640` `md 768` `lg 1024` `xl 1280` `2xl 1536`.

Rules for every page/component built during this rebuild:
1. **Build mobile layout first** (375px reference), then add `md:`/`lg:` overrides — never the reverse.
2. **No horizontal scroll ever**, except explicitly-scrollable data tables (leaderboard, admin submissions), which get a visible scroll-shadow cue on mobile, not silent overflow.
3. **Touch targets** ≥ 44px height on all buttons/nav items on mobile.
4. **Type scale**: fluid via `clamp()` for hero/display text (e.g. `clamp(2.25rem, 6vw, 4.5rem)`) instead of fixed `text-4xl md:text-6xl` jumps — smoother scaling across all widths, not just breakpoint snaps.
5. **Navbar**: mobile = fixed top bar, logo + hamburger; slide-in full-height panel (not dropdown) styled as a "terminal panel" sliding from the right, matching brand. Desktop = horizontal links, role-aware, terminal-label style active-state underline (cyan).
6. **Dense data (leaderboard, admin tables)**: mobile gets a **stacked card view** per row instead of a shrunk table; `md:` and up switches to true table layout. This is a functional-but-visual change only — same data, same interactions.
7. **Hero/decorative SVGs (lensing rings, grid backgrounds)**: simplified/lower-detail versions swapped in below `md:` via conditional rendering or CSS `hidden md:block`, to protect mobile performance.
8. **Test matrix**: 375×667 (small phone), 390×844 (modern phone), 768×1024 (tablet portrait), 1280×800 (laptop), 1920×1080 (desktop) — every page checked at all five before considered done.

---

## 5. Aethel / Nix Visual Branding System

Per your direction: **visible branding**, not just subtle accent.

| Narrator | Owns | Visual treatment | Copy voice |
|---|---|---|---|
| **Aethel — The Architect** | Organizer/Admin areas, Profile pages, structured info (FAQ, rules, leaderboard framing), static/informational content | Sandstone surfaces, symmetrical grid layouts, cyan gridlines, calm/slow-pulse accents, serif-leaning display weight for section titles in these zones | Formal, directive, "protocol"-toned copy — e.g. section labels like `AETHEL_STRATEGY_SECTOR // LOGISTICS` |
| **Nix — The Catalyst** | Student dashboard, task submission flow, announcements feed, leaderboard live-update moments, login/signup energy | Void-black + amber, glitch-style micro-animations on hover/active states, faster transitions, terminal countdown-style motifs on task deadlines | Punchy, kinetic, urgent — e.g. `NEW TASK DROPPED // CHECK GRID` |

**Concrete implementation ideas:**
- A small character emblem/glyph (abstract geometric mark, not a full illustration unless you provide/commission character art) representing each narrator appears in the header/eyebrow of their respective sections — e.g. a small triangular "N" glyph for Nix on the dashboard, a hexagonal "A" glyph for Aethel on admin/profile.
- Homepage hero: split-diagonal composition — left half Aethel-toned (sandstone/cyan, structured), right half Nix-toned (void/amber, energetic) — converging at center on the AXIS'27 wordmark, echoing the "Convergence" day-3 theme.
- Login page: student login = Nix-toned; organizer login = Aethel-toned — reinforces which narrator "owns" that user type immediately on entry.
- If you can supply/commission actual character illustrations later, they slot into the emblem spots without restructuring layout — build the space for them now as a bordered `.axis-frame` slot, use the abstract glyph as a placeholder in v1.

---

## 6. Shared Components — Rebuild Spec

| Component | Current | New treatment |
|---|---|---|
| **Navbar** | Fixed, role-aware links, dropdown hamburger on mobile | Fixed, `obsidian` bg w/ 1px bottom border in cyan-at-8%-opacity, logo left, terminal-style nav links w/ `//` separators, mobile = slide-in panel (see §4.5). Dark/light toggle **removed or reconsidered** — brand is inherently dark-first; recommend keeping dark-only (see open question in §11) |
| **Footer** | Copyright + social links | Rebuilt as a "system footer" — monospace `SYS.ID: AXIS-2027` style line, social icons as small bordered squares (corner-marker motif), copyright in muted sandstone-dim |
| **Buttons** | Tailwind blue defaults | Two variants: **Primary (amber)** — filled, sharp corners, subtle glow on hover; **Secondary (cyan outline)** — 1px cyan border, transparent fill, fills on hover. Both use `font-mono uppercase tracking-wide text-sm` for button label |
| **Cards** | Plain rounded slate cards | `.axis-frame` treatment — sharp 2px radius, corner markers, `obsidian-soft` bg, hover = subtle cyan or amber border glow depending on section owner |
| **Badges/Status pills** (Pending/Approved/Rejected) | Yellow/green/red text | Pill-shaped (only the pill shape stays round, per §2 rule), monospace uppercase, colored dot + label: `● PENDING` in amber, `● APPROVED` in success green, `● REJECTED` in danger red |
| **Modals** (submission, review) | Plain white/slate modal | `.axis-frame` panel, void backdrop blur, terminal-style header bar with fake "traffic light" corner marks instead of generic close X styling (still fully accessible/functional close button) |
| **Loading state** | Plain "Loading..." text | Replace with a small animated terminal cursor / scanning-line component (`<TerminalLoader />`) — addresses the existing tech-debt item #6 as part of this rebuild |
| **ProtectedRoute** | No visual component | No visual change needed — logic only |

---

## 7. Public Pages

### 7.1 HomePage
- **Hero**: split Aethel/Nix diagonal composition (see §5), AXIS'27 wordmark center, gravitational lensing ring animation behind it, tagline `ILLUMINATE THE INFINITE` in mono below.
- **Stats counter section**: keep count-up animation, restyle numbers in large mono/cyan digits inside bordered `.axis-frame` stat cards, each with a crosshair accent.
- **Benefits section**: restructure as "diagnostic readout" cards — icon (custom line-icon set, replacing generic react-icons where possible for brand consistency) + terminal-label eyebrow + short copy.
- **FAQ**: accordion restyled with `+`/`×` toggle icons matching crosshair motif, sandstone-toned (Aethel-owned, informational).
- **Contact section**: keep scroll-to-anchor behavior; restyle as a "terminal input" styled form/contact block.
- New: consider a compact **event category strip** (Management/Analytics, Construction & Design, Software & Electronics, Robotics, Convergence) using the dual gradient system from the AXIS'27 palette PDF page, even if full event listing pages aren't in scope — reinforces brand richness on the landing page. *(Confirm scope before building — see §11.)*

### 7.2 LoginPage (student)
- Nix-toned. Void background, amber accents, glitch-style input focus states, OAuth (Google) button restyled to match dark terminal aesthetic while keeping Google's brand mark recognizable per their guidelines.

### 7.3 OrganizerLoginPage
- Aethel-toned. Sandstone/cyan, more symmetrical/calm layout than student login — visually signals "you're in a different zone" immediately.

### 7.4 ForgotPasswordPage / UpdatePasswordPage
- Neutral void/cyan treatment (utility pages, not narrator-specific), minimal terminal-form styling, clear success/error states using semantic tokens.

### 7.5 LeaderboardPage
- Top 3 get special "podium" treatment with lensing rings scaled by rank (largest/brightest ring on #1).
- Rest of list: desktop = table with mono rank numbers + cyan progress-style point bars; mobile = stacked cards (§4.6).
- Global/Local toggle restyled as a segmented terminal-style switch.

### 7.6 AnnouncementsPage
- Nix-toned feed, each announcement as a terminal-log entry (`> timestamp — message`), newest at top with a subtle "new" amber pulse indicator on unseen items.

---

## 8. Authenticated Pages

### 8.1 MyDashboardPage (student)
- Nix-toned primary dashboard. Task list as `.axis-frame` cards, status badges per §6, "new task" indicator restyled as an amber corner-marker pulse instead of a plain dot.
- Submission modal: terminal-panel style, monospace char-counter if applicable.
- Rank display: small embedded leaderboard-position widget with cyan mono digits.

### 8.2 ProfilePage (student)
- Aethel-toned (administrative/structured task, even though it's a student page) — signals "this is a system record," distinct from the kinetic dashboard.
- Form fields restyled as bordered terminal-input fields with mono labels above each (`NAME //`, `COLLEGE //`, etc.)

### 8.3 AdminDashboard (organizer)
- Fully Aethel-toned. Tabs restyled as terminal nav tabs (`[ TASKS ]  [ SUBMISSIONS ]  [ STUDENTS ]`).
- Tables: desktop table view with sandstone/cyan header row; mobile stacked cards (§4.6).
- Review modal: Approve = amber confirm button, Reject = danger-toned with reason textarea, same terminal-panel frame as student submission modal for consistency.
- **Tech-debt fix rolled in here** (§9): guard against double-award on re-approve while modal/table is being restyled anyway, since the review-flow component is being touched regardless.

### 8.4 OrganizerProfilePage
- Same Aethel treatment as 8.2, simplified (name + password fields only, per current scope).

---

## 9. Technical Debt Addressed As Part Of Rebuild

Since these files are being touched anyway for the visual rebuild, fold in fixes that don't change functionality/behavior, only correctness:

| # | Fix | Why it's in-scope now |
|---|---|---|
| 1 | Delete `src/useAuth.js` (broken duplicate), keep `AuthContext.jsx` as sole source | Dead/broken code, zero functional risk to remove |
| 2 | Delete `src/data/mock.js` | Unused, dead code |
| 3 | Delete/move `src/beckup/` out of the project | Clutter, not part of build |
| 4 | Replace `public/vite.svg` favicon with AXIS'27 mark | Direct branding requirement of this rebuild anyway |
| 5 | Loading states → `<TerminalLoader />` | Explicitly a visual component being built (§6) |
| 6 | Double-award guard on re-approve | Touching `AdminDashboard.jsx` review logic for restyle regardless — trivial to guard `status !== 'Approved'` more strictly with a re-fetch check before RPC call |

**Explicitly NOT touched** (out of scope per your instructions): route-guard architecture beyond current state, pagination, error boundaries, any new features. These stay exactly as they are functionally.

---

## 10. Meta / Build-level Changes

- `index.html`: update `<meta name="theme-color">` to `#121216` (void), update font preconnects to `@fontsource` (self-hosted, so preconnects to Google Fonts get removed entirely), update `<title>` and meta description copy to match new tagline if desired.
- `tailwind.config.js` — **deleted**, replaced by `@theme` block in `src/index.css` (Tailwind v4 approach).
- `postcss.config.js` — **deleted** (Tailwind v4 + Vite plugin handles this).
- `vite.config.js` — add `@tailwindcss/vite` plugin alongside existing `@vitejs/plugin-react`.
- Favicon + OG/social preview image — new asset needed, AXIS'27 mark on void background.

---

## 11. Open Questions (need your input before/during build)

1. **Dark/light toggle** — brand is void-black/amber/cyan by design. Do we keep a light mode at all, or go dark-only and remove the toggle entirely? (Recommend dark-only for brand integrity, but confirming since it's a current feature.)
2. **Event category strip on homepage** — is showing the 5 event categories (Management, Construction, Software, Robotics, Convergence) from the brand PDF in scope for this rebuild, or is that a future features addition? Current site has no event-listing pages per the architecture doc.
3. **Character art** — do you have or plan to commission actual Aethel/Nix illustrations, or should the abstract glyph-emblem approach (§5) be the permanent solution?
4. **Icon set** — okay to replace `react-icons` usage with a custom minimal line-icon set for brand consistency, or keep `react-icons` for speed/practicality and just recolor them?
5. **Logo** — current `logo-light.png`/`logo-dark.png` — are these being replaced with new AXIS'27 branded logo files, or should the rebuild work around existing logo assets?

---

## 12. Next Step

Once source code (`src/` folder or repo access) is provided, implementation proceeds in the order listed in §0 —
starting with `index.css` design tokens and the shared motif components, since every page depends on those
being in place first.
