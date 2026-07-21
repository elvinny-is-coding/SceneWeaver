# SceneWeaver UI Upgrade Plan

## Overview

Migrate the entire SceneWeaver frontend from raw HTML + hand-rolled Tailwind components
to the locked stack defined in `.bob/rules`:

- **shadcn/ui** for all interactive primitives
- **Tailwind CSS** (dark mode via `class` strategy) for all styling
- **Magic UI** for animated visuals: landing page, shot cards, board, decorative elements
- **Tiptap** for the scene script editor (replaces the raw `<textarea>` in SceneForm)

The current codebase has:
- Zero shadcn/ui components — raw `<button>`, `<input>`, `<textarea>` everywhere
- Zero dark mode variants — no `dark:` classes exist
- Zero Magic UI components
- No Tiptap integration

This plan is broken into six independent sub-tasks, each fully scoped to one layer.
Each sub-task must be completed and approved before the next begins.

---

## Sub-Task 1 — Foundation: shadcn/ui init + Tailwind dark mode + design tokens

**Intent**
Bootstrap the project so subsequent sub-tasks can use shadcn/ui components and dark mode
without conflict. This sub-task makes no visible UI changes — it is purely infrastructure.

**Expected Outcomes**
- `tailwind.config.ts` exists with `darkMode: 'class'` and a complete design token set
  (colors, radius, shadows, fonts) that all future components reference.
- shadcn/ui is initialised (`components.json` present, `src/components/ui/` structure ready).
- `cn()` utility (`lib/utils.ts`) is available.
- `globals.css` uses CSS custom properties driven by `tailwind.config.ts` tokens.
- `app/layout.tsx` wraps the tree in a `ThemeProvider` so `dark` class toggles apply.
- A `ThemeToggle` button component (`components/shared/ThemeToggle.tsx`) exists and is
  wired into `app/(app)/layout.tsx` header.
- `npx shadcn@latest init` has been run; no manual copy-paste of shadcn internals.

**Todo List**
1. Run `npx shadcn@latest init` inside `sceneweaver/` — choose: TypeScript, Tailwind v4,
   app router, `src/` off (project uses root), path alias `@/*`.
2. Update `tailwind.config.ts` — add `darkMode: 'class'`, define color tokens
   (background, foreground, card, popover, primary, secondary, muted, accent, destructive,
   border, input, ring) as CSS variable references, add border-radius token `radius`.
3. Update `app/globals.css` — add CSS custom property definitions for both `:root` (light)
   and `.dark` (dark) for every token defined in step 2.
4. Install and configure `next-themes` — wrap `app/layout.tsx` body in `<ThemeProvider
   attribute="class" defaultTheme="system" enableSystem>`.
5. Create `components/shared/ThemeToggle.tsx` — shadcn/ui `Button` with `variant="ghost"`,
   `size="icon"`, using Lucide `Sun`/`Moon` icons, toggling `useTheme()` from `next-themes`.
6. Add `ThemeToggle` to the header in `app/(app)/layout.tsx`.
7. Verify `lib/utils.ts` exports `cn()` (merged by shadcn init, but confirm).

**Relevant Context**
- `app/layout.tsx` — add ThemeProvider here
- `app/(app)/layout.tsx` — add ThemeToggle to header
- `tailwind.config.ts` — currently minimal, needs full token set
- `app/globals.css` — currently only base directives

**Status:** [ ] pending

---

## Sub-Task 2 — Migrate all components to shadcn/ui primitives

**Intent**
Replace every raw HTML interactive element with the shadcn/ui equivalent, conforming
to the `.bob/rules` mandate. The hand-rolled `Button`, `Input`, and `ErrorBanner` in
`components/ui/` are replaced by shadcn/ui installed versions.

**Expected Outcomes**
- `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/card.tsx`,
  `components/ui/badge.tsx`, `components/ui/alert.tsx`, `components/ui/dialog.tsx`,
  `components/ui/tooltip.tsx`, `components/ui/separator.tsx` all installed via
  `npx shadcn@latest add`.
- `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/ErrorBanner.tsx`
  (the hand-rolled versions) are deleted.
- All files that imported the hand-rolled primitives are updated to import from shadcn/ui.
- Every component file gains the required header comment (library + path).
- Every existing Tailwind class that references a hardcoded color (e.g. `bg-blue-600`,
  `text-gray-500`, `border-gray-200`) is replaced with the CSS variable token class
  (e.g. `bg-primary`, `text-muted-foreground`, `border-border`).
- `dark:` variants are added to every element that currently has none.

**Components to migrate (in order)**
1. `components/auth/LoginForm.tsx` — `<form>` stays, `<button>` → `Button`, `<input>`
   (via `Input` component) → shadcn `Input`, error → shadcn `Alert`.
2. `components/auth/SignupForm.tsx` — same as LoginForm.
3. `components/auth/SignOutButton.tsx` — `<button>` → `Button variant="ghost"`.
4. `components/projects/NewProjectForm.tsx` — `Button`, `Input`, layout with `Card`.
5. `components/projects/ProjectCard.tsx` — wrap in shadcn `Card`, delete button →
   `Button variant="ghost" size="icon"`.
6. `components/projects/ProjectGrid.tsx` — no raw interactive elements, update token classes.
7. `components/scenes/SceneList.tsx` — scene rows → shadcn `Card`, add → `Button
   variant="dashed"` (custom variant), delete → `Button variant="ghost" size="icon"`.
8. `components/board/PdfExportButton.tsx` — `<button>` → `Button variant="outline"`.
9. `components/board/Board.tsx` — all `<button>` elements → `Button`, add dark variants
   to container classes.
10. `components/board/ShotCard.tsx` — metadata tags → `Badge`, action buttons →
    `Button variant="ghost" size="sm"`, wrap in shadcn `Card`.
11. `app/(auth)/layout.tsx` — card wrapper → shadcn `Card`.
12. `app/(app)/dashboard/page.tsx` — "New project" link → shadcn `Button asChild`.

**Relevant Context**
- `.bob/rules` → `rules.ui` block: install via `npx shadcn@latest add`, no manual recreation
- `lib/utils.ts` → `cn()` helper for class merging
- All files currently import from `@/components/ui/Button`, `@/components/ui/Input`,
  `@/components/ui/ErrorBanner` — these imports must be updated

**Status:** [ ] pending

---

## Sub-Task 3 — Replace SceneForm textarea with Tiptap script editor

**Intent**
The raw `<textarea>` in `SceneForm.tsx` is the screenplay input surface. Replace it with
a Tiptap editor configured for screenwriting, as mandated by `.bob/rules`. This adds
rich formatting, line-type awareness, and a proper document model for future extension.

**Expected Outcomes**
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder` installed.
- `components/editor/ScriptEditor.tsx` — the Tiptap editor instance as a Client Component.
  Accepts `value: string` (JSON) and `onChange: (json: string) => void`. Serialises via
  `.getJSON()` and restores via `editor.commands.setContent()`.
- `components/editor/extensions/` directory created with six Node extensions:
  `SceneHeading.ts`, `Action.ts`, `Character.ts`, `Dialogue.ts`, `Parenthetical.ts`,
  `Transition.ts`. Each extension adds a CSS class for screenplay formatting. For this
  pass, each is a minimal block node that applies font styling. Keyboard shortcuts
  (Tab-to-next-element, Enter behaviour) are deferred to a later pass.
- `components/editor/EditorToolbar.tsx` — a row of shadcn/ui `Toggle` buttons for
  activating each screenplay node type (Scene Heading, Action, Character, etc.).
- `components/scenes/SceneForm.tsx` updated — `<textarea>` replaced with `<ScriptEditor>`.
  The `script` state value is now a JSON string. Server Action `createScene` already
  accepts `string` — no schema change needed.
- The editor container has full dark mode support via `dark:` Tailwind classes.
- `components/editor/editor.css` (inside `src/styles/` or as a Tailwind plugin) defines
  `.tiptap` prose styles that reference design tokens only.

**Relevant Context**
- `components/scenes/SceneForm.tsx` — current textarea at line ~53; `script` state is
  passed directly to `createScene()` Server Action
- `lib/actions/scene-actions.ts` — `createScene` accepts `script: string` — no change
  needed at the action layer
- `.bob/rules` → `rules.editor` block

**Status:** [ ] pending

---

## Sub-Task 4 — Magic UI: animated landing page

**Intent**
The current landing page (`app/page.tsx`) is a static centred div with two links.
Replace it with a high-impact animated landing page using Magic UI components that
communicates what SceneWeaver is and drives sign-up conversion.

**Expected Outcomes**
- `components/magic/` directory created.
- The following Magic UI components copied from magicui.design and adapted to project tokens:
  - `components/magic/AnimatedGradientText.tsx` — hero headline treatment
  - `components/magic/Particles.tsx` or `components/magic/DotPattern.tsx` — background
  - `components/magic/BentoGrid.tsx` — feature showcase section
  - `components/magic/AnimatedBeam.tsx` or `components/magic/NumberTicker.tsx` —
    social proof / stats section (optional, include if it fits without overcrowding)
- `app/page.tsx` rebuilt with three sections, no navigation bar:
  1. **Hero** — `AnimatedGradientText` headline, one-line subheading, two shadcn/ui
     `Button` CTAs (Get started → `/signup`, Sign in → `/login`), `Particles` or
     `DotPattern` animated background
  2. **Features** — `BentoGrid` with four cells: AI shot generation, drag-and-drop
     storyboard, screenplay editor, PDF export. Each cell has a Lucide icon, title,
     and one-sentence description. No pricing tiers or marketing copy.
  3. **Footer** — single line: app name + "Built for the AI Builders Challenge"
- No navbar, no pricing section, no social links.
- Dark mode fully supported on all three sections.
- All animations wrapped in `prefers-reduced-motion` guards as required by `.bob/rules`.
- All hardcoded Magic UI colors replaced with `tailwind.config.ts` token classes.
- Each Magic UI file has the required header comment.

**Relevant Context**
- `app/page.tsx` — current 33-line static page, full replacement
- `components/magic/` — does not exist yet, create it
- Magic UI source: https://magicui.design/docs/components
- `.bob/rules` → `rules.visuals` block

**Status:** [ ] pending

---

## Sub-Task 5 — Magic UI: shot cards and board visual layer

**Intent**
The storyboard is the core UI surface. The current `ShotCard` is a plain white rounded
box. Upgrade the board and shot cards with Magic UI animated components to make the
storyboard feel premium and cinematic.

**Expected Outcomes**
- `components/magic/BorderBeam.tsx` copied and adapted — used as an overlay on the
  currently-generating or recently-generated `ShotCard` to show an animated border pulse.
- `components/magic/Shimmer.tsx` or `components/magic/Skeleton.tsx` (Magic UI variant)
  replaces `ShotCardSkeleton.tsx` with a more polished animated placeholder.
- `components/board/ShotCard.tsx` updated:
  - The card base uses shadcn/ui `Card` (from Sub-Task 2).
  - The shot number badge uses a shadcn/ui `Badge` with a `secondary` or custom variant.
  - The metadata row (angle/framing/movement) uses shadcn/ui `Badge variant="outline"`.
  - When `isRegenerating` is true, `BorderBeam` is overlaid on the card.
- `components/board/Board.tsx` updated:
  - The horizontal scroll container gets a subtle `DotPattern` or `GridPattern`
    background from Magic UI behind the cards.
  - All three action buttons ("Generate shots", "Continue scene", "Export PDF") use
    `ShimmerButton` for visual consistency — copy `components/magic/ShimmerButton.tsx`.
  - The toolbar area uses `components/magic/AnimatedGradientText.tsx` for the scene title.
- All Magic UI animations respect `prefers-reduced-motion`.
- All hardcoded Magic UI tokens replaced with `tailwind.config.ts` values.
- Dark mode variants present on all updated elements.

**Relevant Context**
- `components/board/ShotCard.tsx` — currently 96 lines; `isRegenerating` prop already exists
- `components/board/ShotCardSkeleton.tsx` — replace with Magic UI shimmer variant
- `components/board/Board.tsx` — `generate-shots` button at ~line 150
- `components/magic/` — partially populated by Sub-Task 4, add new components here

**Status:** [ ] pending

---

## Sub-Task 6 — Dark mode audit and global polish pass

**Intent**
After all components are updated, do a final sweep to catch any element that missed
dark mode variants, ensure the ThemeToggle works correctly end-to-end, and fix any
visual regressions introduced in Sub-Tasks 2–5.

**Expected Outcomes**
- Every component file has `dark:` variants on every background, border, text, and
  shadow class — no light-only classes remain in any file.
- `app/(app)/layout.tsx` header is visually coherent in both themes.
- `app/(auth)/layout.tsx` auth card is visually coherent in both themes.
- Dashboard, project detail, and board pages all render correctly in dark mode.
- The Tiptap editor (`ScriptEditor`) renders correctly in dark mode.
- `ThemeToggle` persists the user's preference across navigation (via `next-themes`
  cookie/localStorage).
- No TypeScript errors (`tsc --noEmit` passes).
- Production build succeeds with zero errors.

**Todo List**
1. Run the app in dark mode (set `defaultTheme="dark"` temporarily) and screenshot
   each page — note any elements with no dark variant.
2. Add missing `dark:` classes to all flagged elements.
3. Verify `ThemeToggle` renders in header and toggles correctly.
4. Verify Tiptap editor prose styles (`editor.css`) have dark variants.
5. Run `npx tsc --noEmit`.
6. Run `npx next build` — confirm zero errors.
7. Commit and push.

**Relevant Context**
- `app/(app)/layout.tsx` — ThemeToggle location
- `app/layout.tsx` — ThemeProvider location
- All files updated in Sub-Tasks 1–5

**Status:** [ ] pending

---

## Dependency Order

```
Sub-Task 1 (Foundation)
    ↓
Sub-Task 2 (shadcn/ui migration)  ←──────┐
    ↓                                     │
Sub-Task 3 (Tiptap editor)         Sub-Task 4 (Landing page)
    ↓                                     ↓
Sub-Task 5 (Board Magic UI — depends on Sub-Task 2)
    ↓
Sub-Task 6 (Dark mode audit — depends on all above)
```

Sub-Tasks 3 and 4 can run in parallel after Sub-Task 2 is complete.
Sub-Task 5 requires Sub-Task 2 (shadcn Card/Badge/Button on ShotCard).
Sub-Task 6 is always last.
