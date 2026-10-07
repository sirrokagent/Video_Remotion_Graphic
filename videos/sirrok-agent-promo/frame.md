---
version: alpha
name: Blue Professional — Frame (video / frame layer)
description: >
  Video-first companion to Blue Professional's design.md. The unit is the frame (1920×1080). Atoms
  are identical and sacred — the warm cream canvas, a single saturated cobalt (#1e2bfa) as the only
  accent, the three-step gray text ladder, Be Vietnam Pro (display/numerals/chrome) + Be Vietnam Pro (body),
  soft cobalt-tinted cards (4% fill / 20% border / 10–14px radius) with NO shadows, pill chrome, and
  the cobalt progress bar. Composition + frame scale rewritten. Motion out of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  bg: "#FAFAF8"
  primary: "#0E52B8"
  accent-fill: "#1877F2"
  text: "#0A0A0A"
  text-muted: "#52525B"
  text-light: "#6E6E76"
  accent-light: "rgba(24, 119, 242, 0.08)"
  accent-medium: "rgba(24, 119, 242, 0.15)"
  border: "rgba(24, 119, 242, 0.2)"
  card-bg: "rgba(24, 119, 242, 0.04)"
  positive: "#047857"
  negative: "#DC2626"

radii:
  pill: "100px"
  card-lg: "14px"
  card-md: "12px"
  card-sm: "10px"
  bar: "6px"
  circle: "50%"

typography:
  # — reading ramp (Be Vietnam Pro body + Be Vietnam Pro chrome) —
  body:    { fontFamily: "Be Vietnam Pro", cqw: 0.85, weight: 400, lineHeight: 1.6, color: "text-muted" }
  h4-eyebrow:{ fontFamily: "Be Vietnam Pro", cqw: 0.8, weight: 600, tracking: "0.08em", upper: true, color: "primary" }
  tag:     { fontFamily: "Be Vietnam Pro", px: 12, weight: 500, color: "primary" }
  counter: { fontFamily: "Be Vietnam Pro", px: 13, weight: 500, tracking: "0.05em", color: "text-muted" }
  # — display / numerical ramp (Be Vietnam Pro, near-black headings / cobalt numerals) —
  h3:      { fontFamily: "Be Vietnam Pro", cqw: 1.25, weight: 500, lineHeight: 1.3, tracking: "-0.02em", color: "text" }
  stat-num:{ fontFamily: "Be Vietnam Pro", cqw: 1.9, weight: 700, lineHeight: 1.0, color: "primary" }
  blockquote:{ fontFamily: "Be Vietnam Pro", cqw: 2.4, weight: 500, lineHeight: 1.35, color: "text" }
  h2:      { fontFamily: "Be Vietnam Pro", cqw: 2.6, weight: 600, lineHeight: 1.1, tracking: "-0.02em", color: "text" }
  metric-value:{ fontFamily: "Be Vietnam Pro", cqw: 3.0, weight: 700, lineHeight: 1.0, color: "primary" }
  h1:      { fontFamily: "Be Vietnam Pro", cqw: 4.2, weight: 700, lineHeight: 1.08, tracking: "-0.02em", color: "text" }
  quote-mark:{ fontFamily: "Be Vietnam Pro", cqw: 8.0, weight: 700, lineHeight: 0.5, color: "primary", opacity: 0.15 }

spacing:
  pad-x: "5cqw"
  pad-y-top: "5cqw"
  gap-cards: "1.4cqw"
  accent-line: "60px × 4px"

components:
  card-tinted:
    backgroundColor: "{colors.card-bg}"
    border: "1.5px solid {colors.border}"
    rounded: "{radii.card-lg}"
    shadow: "none"
    description: "Universal content card. Never solid-colored, never opaque-bordered, NO shadow."
  metric-card:
    backgroundColor: "{colors.card-bg}"
    border: "1.5px solid {colors.border}"
    rounded: "{radii.card-lg}"
    typography: "{typography.metric-value} ({colors.primary}) + {typography.metric-label} + {typography.metric-desc}"
    description: "+ optional inline ↑/↓ change chip ({colors.positive}/{colors.negative} text, no fill)."
  tag-pill:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.primary}"
    rounded: "{radii.pill}"
    typography: "{typography.tag}"
    description: "Top-right of the slide-header."
  cta-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{radii.pill}"
    typography: "Be Vietnam Pro 600"
    shadow: "soft cobalt on hover only — the system's only shadow"
    description: "The one solid element."
  accent-line:
    backgroundColor: "{colors.accent-fill}"
    size: "60×4, 2px radius"
    description: "Above cover titles / eyebrow separators."
  bar-track:
    backgroundColor: "{colors.accent-light}"
    fill: "{colors.accent-fill} (display:block so width resolves)"
    rounded: "{radii.bar}"
    description: "28px track; fill carries the value."
  step-circle:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "50%"
    size: "56px"
    description: "Sequential steps fade opacity 1.0→0.85→0.7→0.55."
  split-highlight:
    backgroundColor: "{colors.accent-light}"
    borderLeft: "4px solid {colors.accent-fill}"
    rounded: "{radii.card-md}"
    description: "Inline pull-quote callout."
  slide-header:
    typography: "{typography.h4-eyebrow} (cobalt) left, tag-pill right; {typography.h2} below"
    description: "Top band of every content frame."
  atmosphere:
    elements: "clipped diagonal cobalt-tint panel, 3×3 cobalt dot grid, concentric closing rings"
    description: "Cover/closing only. Never on content frames."
  progress-bar:
    backgroundColor: "{colors.accent-fill}"
    size: "3px tall, bottom edge, width grows with index"
    description: "Persistent progress strip."
---

# Blue Professional — Frame (video / frame layer)

## Brand adaptation (READ FIRST — the frontmatter is the source of truth)

This is the **blue-professional** preset remixed onto the captured brand. The YAML frontmatter above (colors · typography · components) is **normative and already correct — use it verbatim.** The prose below is the ORIGINAL preset's intent; read it THROUGH the frontmatter:

- **Fonts** — already set to **Be Vietnam Pro** (display) / **Be Vietnam Pro** (body); ignore any preset font name lingering in prose.
- **Colors** — use the frontmatter hex; preset color NAMES in prose (e.g. "cobalt", "cream") mean the remapped brand values.

## Contrast floor — project rule, overrides the preset prose

This project requires **≥ 4.5:1 against `bg` (#FAFAF8) for every piece of text**, and the brand
brief forbids light text on a pale ground. The preset's palette did not satisfy that, so three
tokens were hand-corrected after the remix. These are **not** suggestions:

| Token | Value | On `bg` | Role |
|---|---|---|---|
| `text` | `#0A0A0A` | 19.1:1 | every headline and body line by default |
| `text-muted` | `#52525B` | 7.4:1 | secondary copy (was `#0E52B8` — blue body text, a remix artifact) |
| `text-light` | `#6E6E76` | 4.9:1 | tertiary / colophon (was `#9A9A9A` — **2.7:1, failed**) |
| `primary` | `#0E52B8` | 6.9:1 | **the only blue allowed as text** — eyebrows, numerals, tags, CTA fill |
| `accent-fill` | `#1877F2` | 4.1:1 | **NEVER text.** Fills only: bars, progress, waveform, glow, left-rules, device accents |
| `positive` | `#047857` | 5.3:1 | inline ✓ / up-chips (was `#059669` — **3.6:1, failed**) |
| `negative` | `#DC2626` | 4.7:1 | inline ✗ / down-chips |

Hard rules for every frame:

- **`#1877F2` is a fill, not an ink.** The vivid brand blue carries the waveform, the progress bar,
  the Dynamic Island glow, device accents, and tinted panels. The moment it becomes a glyph color
  it fails. Blue type uses `primary` (`#0E52B8`).
- **White text is only legal on a `primary` (#0E52B8) fill** — 6.9:1. White on `accent-fill`
  (#1877F2) is 4.2:1 and is **forbidden**. A vivid-blue pill carries `text` (#0A0A0A) instead.
- Headline ≥ **64px**, secondary text ≥ **36px** at 1920×1080.
- **≤ 6 words on screen at once** (brand brief). Keyword cards, never full-sentence subtitles.

## The Sirrok mascot — `assets/sirrok-agent-icon.svg` (official, do not redraw)

The one supplied brand asset, and A Hít's recurring **Agent mascot** — not a static logo. A black
ghost body: 344px wide at y=420, swelling to 912px at y=1000 (its widest), tapering to 706px at
the base; body bbox 912×784 inside a 1536 viewBox. The two white shapes inside the body
(140×182 at x 682–822, and 128×170 at x 894–1022) are its **eyes**.

- **Crop before use.** The artwork occupies only x 310–1225, y 377–1167 of the 1536 viewBox —
  use `viewBox="286 291 963 963"` or the mascot renders small and off-centre. This frame places
  it with explicit width/left instead, which is equivalent for a static placement.
- **Its feet sit at 91% of that square box.** Any squash-and-stretch needs
  `transformOrigin: "50% 91%"` so it flattens onto the ground, not about its middle.
- **A blink is `scaleY 1 → 0.06 → 1` on the eyes** — they are white shapes ON the body, not holes
  through it. Blinking them `0 → 1 → 0` (the pattern for black lids over cut-outs) leaves the
  eyes invisible.
- **Its "3D" is shading, never geometry** — a radial gradient for volume plus a translucent
  highlight ellipse. Do not extrude the silhouette in Three.js: a flat organic ghost extruded
  reads as a cookie cutter, and it is far too expensive on this 4-core / 8 GB machine.

- **Never redraw it, never edit its paths, never change its hex.** Reference the file.
- Its body is hard-coded `#000000`, not `currentColor` → **19.2:1 on `bg`, perfect.** On a dark
  surface the body vanishes. To place it on the dark island pill or any dark fill, seat it inside a
  `bg` (#FAFAF8) disc first.
- Aspect is 912:784 (≈1.16:1, wider than tall). Preserve it — a squashed dome loses the gloss.
- When the mascot reacts (a blink, a small bob as the agent takes a command), animate the eyes or
  the whole body — never deform the silhouette.

## Sirrok components (project addendum — shared vocabulary across frames)

Parallel frame workers must build these the SAME way; they recur across frames.

- **`mac-window`** — `bg` surface, 1.5px `border`, 14px radius, no shadow. 44px title bar with
  three 12px dots (`#6E6E76` at 0.35 opacity — decorative, never the red/yellow/green cliché), a
  `tag`-styled filename, and a 220px left sidebar of `card-bg` holding agent rows.
- **`device-tablet`** — 13px-radius outer shell in `text` at 0.9 opacity, 10px bezel, inner screen
  `bg`. Same shell serves **iPad and the Android tablet**; the UI inside differentiates them (iPad:
  pill tab bar bottom-center; Android: a 3-dot overflow top-right).
- **`device-phone`** — 28px-radius shell, 8px bezel. **iPhone** gets the Dynamic Island pill at
  top-center; **Android** gets a 10px punch-hole circle.
- **`island-pill`** — the hero component. Collapsed: 126×37 fully-rounded `text` solid, a 7px
  `accent-fill` dot pulsing at left. Expanded: 420×128, same radius family, holding one running
  Sirrok task (label in `bg` color on the dark pill — 19:1, legal) + a 3px `accent-fill` progress
  bar. The collapsed→expanded change is a **morph of one element**, never a cut between two.
- **`voice-wave`** — 24–40 vertical bars, 3px wide, 2px radius, `accent-fill`, heights driven by a
  fixed deterministic envelope array (NO `Math.random()`). This is how "ra lệnh bằng giọng nói"
  becomes visible; a static microphone glyph is not acceptable.
- **`agent-row`** — a `card-tinted` row: 28px circle avatar in `accent-light` holding the Sirrok
  dome mark, an agent job name in `text`, a `tag-pill` status, and a `positive` ✓ when its task closes.
- **`headcount-stack`** — the 20–30 → 1 proof. A grid of small person glyphs in `text-light`
  collapsing into one Sirrok dome mark; the count runs as a `metric-value` count-up.

## Overview

Blue Professional at frame scale is a **consulting-grade system: restraint with one strong
commitment.** A warm cream canvas and a single saturated cobalt that carries every accent —
eyebrow, metric, CTA, chart fill, progress bar. No secondary brand color, no pastels, just cream,
cobalt, and a tight ladder of grays. The register is investment-research / McKinsey briefing:
measured, data-dense without crowding, executive-readable at distance.

The voice is two faces in fixed roles: **Be Vietnam Pro** (display, every numeral, all chrome —
eyebrows uppercase 0.08em) and **Be Vietnam Pro** (body, muted gray, line 1.6). Headlines are near-black;
cobalt is reserved for accent moments. Depth is **soft and tinted** — 4% cobalt card fills with 20%
cobalt borders and 10–14px radii — never shadowed. The lack of harsh shadows is the premium signal.

**Key characteristics at frame scale:**

- **Warm cream ground** on every frame; **single cobalt** as the only accent.
- **Be Vietnam Pro** (display/numerals/chrome) + **Be Vietnam Pro** (body) — near-black headlines, cobalt numerals.
- **Tinted cards** — cobalt 4% fill, cobalt 20% 1.5px border, 10–14px radius, **no shadow**.
- **Pill chrome** (100px) — tag pills + the one solid cobalt CTA; cobalt **progress bar**.
- **Soft rounded corners everywhere** (no square corners save the progress bar).
- **Atmosphere** (diagonal panel, dot grid, concentric rings) on cover/closing only.

## The Frame

### Frame Craft Bar

Three eyeball tests gate every frame before any structural check:

- **Squint** — one **near-black headline or cobalt numeral** dominates at 3–6× its neighbor.
- **Silence** — content frames read **balanced, not crowded**; the **dashboard is the one dense exception**.
- **Restraint** — a **single cobalt accent** carries everything; headlines stay near-black (never cobalt); no shadows (tinted cards do the lift); positive/negative inline-text only.
- **Reference** — aim at an **investment-research / McKinsey quarterly briefing**; failure looks like a **heavy-outlined, multi-color dashboard**.

- **Primary:** 1920×1080 (16:9). Display authored in **`cqw`** (`px ÷ 1920 × 100 = cqw`).
- **Vertical:** 1080×1920 (9:16). **Square:** 1080×1080 (1:1).
- **Safe area:** `pad-x` 5cqw; bottom reserves room for the counter + progress bar.

**The container law (load-bearing).** Every frame ground sets `container-type: size`; ALL
frame-relative units are `cqw`/`cqh` against it — never `vw`. Card radii stay px (10–14px); the
pill radius stays 100px; borders stay 1–1.5px.

## Colors

Tokens identical to the source. `{colors.bg}` cream is the universal ground; `{colors.primary}`
cobalt is the **only** accent — every eyebrow, numeral, CTA, chart fill, progress bar, and the 4px
highlight left-rule. Headlines are `{colors.text}` near-black (never cobalt); body is
`{colors.text-muted}`; tertiary is `{colors.text-light}`. Cards fill `{colors.card-bg}` (4%) with
`{colors.border}` (20%) borders. `{colors.positive}`/`{colors.negative}` appear **only inline** on
directional change chips — never as fills. **No second accent color.**

## Typography

Two ramps. The **reading ramp** (Be Vietnam Pro body 0.85cqw muted; Be Vietnam Pro eyebrow uppercase 0.08em
cobalt) carries copy + chrome; the **display/numerical ramp** (Be Vietnam Pro `h3` 1.25cqw → `h1`
4.2cqw near-black; numerals `stat-num`/`metric-value` in cobalt) carries headings and figures.

- **Legibility floor:** any load-bearing line ≥ **1.4cqw**; px chrome (tag/counter) is colophon only.
- **Fit-to-measure:** size the headline to its length. Cap the block at **≤ 78cqw**; ≤3 words → `h1`; 4–6 → `h2`; 7+ → `h3`. Cobalt numerals scale `metric-value`→`stat-num` by card size.
- **Headlines near-black, −0.02em**; **eyebrows cobalt, uppercase, 0.08em**; **numerals cobalt 600–700**; **body Be Vietnam Pro 400 muted, line 1.6**. No italic, no uppercase body, no cobalt headline.

## Depth & Surface

Soft and tinted — never offset. Depth from:

- **Tinted cards** — 4% cobalt fill + 20% cobalt 1.5px border + 10–14px radius reads as lifted without offset.
- **Border-left accent** — the 4px cobalt rule on split-highlight blocks pulls a callout forward.
- **Rounded corners** — the 10–14px radius is part of the softness; square corners break it.

**Ceiling:** zero box-shadow on content (the only shadow is a soft cobalt CTA _hover_); no opaque cobalt borders; no harsh outlines.

## Shapes

- **100px** — tag pills, CTA, nav buttons (pill chrome).
- **14/12/10px** — cards by size (large metric / standard stat / detail + mini).
- **6px** — bar tracks + fills. **50%** — step circles, nav circles, dots, closing rings.
- **0** — only the progress bar. No square-cornered content.

## Components

- **card-tinted / metric-card** — the universal soft-tint content cards (no shadow).
- **tag-pill / cta-button / accent-line** — the cobalt pill chrome + the one solid CTA + the 60×4 rule.
- **bar-track / step-circle / split-highlight** — cobalt data + sequence + callout patterns.
- **slide-header** (eyebrow + tag pill) — the structural rhythm; **atmosphere** (diagonal/dots/rings) on cover/closing only; **progress-bar** on every frame.

## Frame Treatments

> Recipe: ground · container · composes · focal · chrome · accent · silence · Fixed/Free · density.
> Atmosphere only on cover/closing; content frames carry the slide-header rhythm.

### 1 · Cover (identity · move: diagonal accent · left)

**Ground** cream + the clipped diagonal cobalt-tint panel (right ~36%) + a 3×3 cobalt dot grid.
**Composes** accent-line, meta, h1, body sub. **Focal** a 2-line Be Vietnam Pro `h1` near-black, left,
under a cobalt accent-line + meta. **Chrome** counter + progress bar. **Accent** the cobalt line +
diagonal panel. **Silence** the diagonal panel holds the right third. **Fixed** near-black h1, cobalt
accents, atmosphere here only. **Free** title, meta. **Density** low.

### 2 · Dashboard (data · move: 3-up metric grid · the dense frame)

**Ground** cream, `pad-x`. **Composes** slide-header (eyebrow + tag-pill), h2, 3× metric/tinted card.
**Focal** a row of tinted cards — cobalt `metric-value` + Be Vietnam Pro label + muted desc + optional
green/red change chip. **Chrome** eyebrow left, tag-pill right; progress bar. **Accent** the cobalt
numerals. **Silence** tight — the density exception. **Fixed** 4% tint cards, 20% borders, no shadow,
cobalt numerals. **Free** figures (from script), labels. **Density** dense-exception.

### 3 · Bar Ranking (data · move: cobalt bars · left)

**Ground** cream, `pad-x`. **Composes** eyebrow, h2, bar-track rows. **Focal** 3–5 labeled
cobalt-fill bars on cobalt-8% tracks with cobalt percentages. **Chrome** eyebrow; progress bar.
**Accent** the cobalt fills + figures. **Silence** moderate. **Fixed** 6px tracks, cobalt fills.
**Free** rows, values (from script). **Density** standard.

### 4 · Pull Quote (quote · move: concentric rings · centered)

**Ground** cream, centered, with faint concentric closing-rings behind. **Composes** quote-mark,
blockquote, cite. **Focal** a Be Vietnam Pro `blockquote` near-black under a 15%-opacity cobalt
quote-mark; an uppercase cobalt-muted cite beneath. **Accent** the faint rings + quote-mark. **Silence**
~55%. **Fixed** near-black quote, soft rings. **Free** quote, cite. **Density** low.

### 5 · Split + Highlight (content · move: asymmetric split · left)

**Ground** cream, two columns. **Composes** eyebrow, h2, body, split-highlight block. **Focal** an
Be Vietnam Pro body column beside a cobalt-8% highlight block (4px cobalt left rule) carrying an inline pull
quote. **Accent** the highlight's left rule. **Silence** generous gutter. **Fixed** tinted highlight,
4px cobalt rule. **Free** body, callout. **Density** standard.

### 6 · Closing / CTA (closer · move: centered rings + CTA)

**Ground** cream + concentric closing-rings. **Composes** accent-line, h1, body, cta-button. **Focal**
a Be Vietnam Pro `h1` near-black, centered, with the one solid cobalt `cta-button` pill below. **Accent**
the CTA + rings. **Silence** ~60%. **Fixed** one CTA, near-black h1, soft rings. **Free** sign-off, CTA
label. **Density** low.

## Composition Rules

### Do

- Start every frame on **warm cream**; let **cobalt carry every accent** (eyebrow, numeral, CTA, bar, progress).
- Set headlines **near-black, −0.02em**; eyebrows **cobalt uppercase 0.08em**; numerals **cobalt 600–700**.
- Use **tinted cards** (4% fill, 20% border, 10–14px radius, no shadow); body Be Vietnam Pro 400 muted, line 1.6.
- Keep all chrome **pill-shaped (100px)**; one solid cobalt CTA per closing frame.
- Reserve **atmosphere** (diagonal panel, dots, rings) for cover/closing; content frames keep the slide-header rhythm.
- Lean left on cover/dashboard/split, centered on quote/closer.

### Don't

- No second accent color; no cobalt headlines.
- No drop shadows on content (only the soft cobalt CTA hover); no opaque cobalt borders.
- No square corners (save the progress bar); no font substitutes; no uppercase body.
- Don't use the green/red change chips as general accents — directional comparisons only.
- Don't fill space with heavier borders — add substance; don't blow a headline edge-to-edge.

## Aspect-Ratio Behavior

| Treatment         | 16:9                       | 9:16                           | 1:1                      |
| ----------------- | -------------------------- | ------------------------------ | ------------------------ |
| Cover             | title left, diagonal right | title top, diagonal band below | title upper, dots corner |
| Dashboard         | 3 cards across             | 3 stacked                      | 2×2                      |
| Bar Ranking       | 3–5 bars                   | 3–5 bars (tighter)             | 3 bars                   |
| Pull Quote        | centered, rings behind     | centered, taller               | centered                 |
| Split + Highlight | side-by-side               | stacked                        | stacked                  |
| Closing / CTA     | centered + CTA             | centered + CTA                 | centered + CTA           |

`pad-x` holds on the short edge; re-step display above the 1.4cqw floor. The diagonal cover panel
becomes a top/bottom band on 9:16. Numerals stay Latin Arabic digits in CJK builds.

## Approved Entities

No real customers, logos, or vendors are defined in the source — render any such mark as a
placeholder. Figures, metrics, and quotes are content; the system supplies cream + cobalt + grays.

## Numerals & Claims (hard rule)

Never invent figures, financials, percentages, or dates at frame scale. Render slots as `— figure —`,
`{metric}`, `+NN%`, `↑ —`. Metric cards, bar values, and stat cells especially carry placeholders
until the script supplies them. Directional chips require a real comparison from the script.

## Pre-Render Self-Audit

- **Squint** — one near-black headline or cobalt numeral dominates per frame.
- **Silence** — content frames balanced, not crowded; only the dashboard runs dense.
- **Single accent** — cobalt only; headlines near-black; positive/negative inline only.
- **Type** — Be Vietnam Pro headings −0.02em near-black, cobalt eyebrows 0.08em + numerals; Be Vietnam Pro body muted line 1.6; ≥1.4cqw floor.
- **Depth** — tinted cards (no shadow), soft rounded corners, 20% cobalt borders; no square content corners.
- **Anchor** — left on cover/dashboard/split, centered on quote/closer; atmosphere on cover/closing only.
- **Fabrication** — every numeral traces to the script, else placeholder.

## Known Gaps

- **Motion intentionally out of scope.** frame.md specifies composition only; the source's 500ms translateX transitions + bar-fill animations are deck mechanics.
- **Be Vietnam Pro + Be Vietnam Pro via Google Fonts.** CJK pairing (Noto Sans SC 700 display / Noto Serif SC 400 body) carries over; the eyebrow's uppercase+tracking signal weakens in CJK — pair it with the accent-line.
- **9:16 / 1:1 are guidance**; verify the floor and that the diagonal panel reflows to a band.
- Diagonal panel (clip-path), dot grid, concentric rings, and bars are CSS-only; no external imagery is required.
