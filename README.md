# Carousel — Landing Page Hero Section

Take-home assignment (Assignment 1: Full-stack build + design) for the AI Engineer role.

**Live demo:** [add your deployed URL here once published, e.g. Vercel or Netlify]
**Stack:** React 19, TypeScript, Vite, Tailwind v4, with a Three.js accent.

---

## Who the page is for, and why

**Who:** This hero targets the **credit desk at equipment and auto lessors**, the analysts
and credit managers who receive applications and have to verify income, identity, and bank
data before they can make a decision. Today that verification stalls for 24 to 72 hours while
they chase documents and wait on legacy vendors, which slows approvals and loses deals to
faster competitors.

**Why:** Carousel's value to this audience is speed without sacrificing rigor. An applicant
goes from a link to a verified, decision-ready file in minutes, on their phone, in one sitting.
The hero leads with that exact contrast ("in minutes", versus legacy "24 to 72 hours") because
it is the credit desk's biggest daily pain, and it drives to the single conversion goal:
**Book a demo**. I deliberately avoided generic "AI-powered" language and any invented
metrics; the only numbers shown live inside a clearly illustrative sample-application card.

I chose one focused, high-intent audience rather than mirroring the homepage's broad
"screen anyone" selector, so the copy and proof can speak one group's language directly.

---

## Running it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
  App.tsx        page structure and content (nav, points, card steps as data arrays)
  App.css        hero layout and components, brand-matched to oncarousel.com
  index.css      design tokens (cream, black, gold), base type (Fraunces and Inter)
  Icons.tsx      inline SVG icons (no icon-library dependency)
  motion.ts      pointer-motion helpers and hooks (tilt, cursor glow), reduced-motion aware
  PaperDrift.tsx Three.js paper-drift band (lazy-loaded)
```

## Design and engineering decisions

- **Brand match:** cream ground, black **Fraunces** serif display, black pill CTAs, gold
  accent, matched to oncarousel.com. Carousel is framed as intake and verification, **not a
  lender** (per its own footer).
- **Accessibility:** semantic landmarks, labelled controls, visible focus states, AA-contrast
  text, and every motion effect is disabled under `prefers-reduced-motion`.
- **Performance:** Three.js is **code-split and lazy-loaded** via dynamic `import()` behind an
  `IntersectionObserver`, so it never blocks first paint. The paper band is a single
  `InstancedMesh` (one draw call) and is disposed on unmount.
- **Motion:** staggered entrance, a cursor spotlight, a card parallax-tilt, a hero-CTA shine
  sweep, and the interactive paper drift, all tasteful and reduced-motion safe.
- **Code quality:** shared motion logic lives in one module (no duplication), repeated UI
  (nav links, value points, card steps) is data-driven, and responsibilities are split across
  small modules so another engineer can pick it up.

---

## AI log

**Tool:** Claude Code (Anthropic). Chosen for full control over clean, readable, handoff-ready
code and a real repository, rather than a black-box UI generator, and because the role is
about using coding agents well, not just shipping output.

**Key prompts**
1. "Build a landing-page hero for Carousel (intake and verification for lenders, lessors,
   landlords, **not** a lender) aimed at lending and leasing credit desks, one `Book a demo`
   CTA, React plus Vite plus TS plus Tailwind, responsive to 375px, accessible."
2. "Match the real oncarousel.com brand: warm cream, black Fraunces serif headline, black
   pill buttons, gold accent, not a generic purple SaaS template."
3. "Add a bottom paper-drift band in Three.js (the paperwork Carousel removes), lazy-loaded,
   one InstancedMesh, reduced-motion safe."

**Where the AI was wrong, and how I caught it**
- **Off-brand first pass.** The initial design used a purple palette with Inter, a template
  look. I caught it by comparing against the live oncarousel.com and rebuilt the tokens to the
  real cream, black, and serif identity.
- **Gray, spiky 3D paper.** The first Three.js pass rendered gray shards: the Euler rotation
  order tipped sheets upright, and physically-based lighting (divide by pi) left them gray. I
  fixed the rotation order (`YXZ`) and used a grazing key light to get flat, bright paper with
  depth.
- **CSS specificity bug.** A `.card__who span` rule overrode the avatar styles, so its initials
  rendered outside the circle. Caught by screenshotting the component; scoped the selector.
- **Inconsistent mock data.** The sample card showed a "Decision-ready" badge while a step was
  still "in progress", and repeated the phrase "decision-ready". I made the file genuinely
  complete and relabelled the status to "Verified".
- **Duplicated code.** The AI's output repeated the reduced-motion guard and rAF throttle
  across files and hand-wrote repeated list markup; I extracted shared helpers and made the
  lists data-driven.

---

## QA note

**Tested**
- Widths 375px (phone), 768px (tablet), 1240px (desktop): no horizontal scroll; the hero
  stacks to one column and the nav links collapse on narrow screens.
- Light theme on the cream ground (the design commits to one brand look).
- Keyboard focus visible on all links and buttons.
- `prefers-reduced-motion`: all motion (entrance, tilt, glow, shine, paper drift) turns off;
  a static paper pile still renders.
- Touch and coarse pointer: pointer effects are skipped.

**Lighthouse** [run on the deployed production URL, not the dev server, then paste scores]
- Performance: __ , Accessibility: __ , Best Practices: __ , SEO: __
- Note: run against the production build. The dev server's unminified bundle depresses the
  Performance metric.

**Known issues and trade-offs I did not change**
- The paper drift pulls in Three.js (about 170 KB gzipped) as a **lazy** chunk. It is an
  intentional brand moment loaded off the critical path; it can be removed for a leaner build
  if preferred.
- A few paper sheets sit near edge-on in the pile, intentional, to read as a messy stack.
- Nav links and the two secondary CTAs are placeholders (`#`) scoped to this hero exercise.
