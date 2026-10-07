# Frame packet: 05-do-chi-la-ai-chat

## Project inputs

- Project: D:\Video_Remotion_Graphic\videos\ai-agent-vs-ai-chat
- Design tokens: D:\Video_Remotion_Graphic\videos\ai-agent-vs-ai-chat\frame.md
- RULES_DIR: C:\Users\Admin\.claude\skills\hyperframes-animation\rules

## Assigned storyboard block

## Frame 5 — Đó chỉ là AI Chat

- status: built
- src: compositions/frames/05-do-chi-la-ai-chat.html
- scene: Màn hình tách đôi; nửa trái dán nhãn Chat, nửa phải còn trống đen
- duration: 5.61s
- transition_in: cut
- poster: 3s
- blueprint: comparison-split (Adapt)
- focal: hairline dọc chia đôi khung
- roles: cụm thẻ + nhãn AI CHAT + logo = foreground subject (nửa trái) · hairline dọc = supporting · nửa phải trống = background
- sfx: deep impact hit
- voiceover: "Thực ra, những gì mọi người đang phán xét chỉ là AI Chat thông thường — như ChatGPT hay Gemini."

Adapt: giữ signature split nhưng **cố tình bỏ trống một vế** — đó chính là nội dung.

Scene 1 (0.0–1.3s): 4 thẻ từ cảnh 04 vẫn còn, bị hút dồn về nửa trái bằng anchored-layout-expand chạy ngược, co nhỏ lại. Impact hit khi chúng chạm vị trí.
Scene 2 (1.3–2.4s): hairline dọc `#1877F2` svg-path-draw từ trên xuống, chia khung 50/50.
Scene 3 (2.4–3.8s): nhãn `label` **"AI CHAT"** hiện phía trên cụm thẻ, kèm logo OpenAI và Gemini (trắng đơn sắc) đứng trước nhãn.
Scene 4 (3.8–5.61s): **giữ tĩnh hoàn toàn.** Nửa phải vẫn đen trống. Beat giữ tĩnh có chủ đích — khoảng trống phải được nhìn đủ lâu để thành câu hỏi.

## Selected blueprint: comparison-split

# comparison-split — Comparison Split-Cards

**intent**: Two paired items of equal weight shown side-by-side with mirrored 3D "book-open" tilts — the eye reads them as a balanced comparison, then a pill badge lands at each card's inner edge to punctuate. The motion IS the symmetry: two cards arriving from opposite wings into a held spread.

**roles served**

- Key_Feature (from `comparison-split-cards`): when two complementary features / capabilities of equal weight should be presented **simultaneously, not sequentially** — an A/B, a "X + Y together," paired concepts the viewer must weigh side-by-side. Not for >2 items (use `grid-card-assemble`) or sequential steps.

**duration**: 4–6s

**shot structure** (a `[bg]` canvas carrying two faint ambient glow blooms — `[accent A]` near 30%, `[accent B]` near 70% — so each side owns a color identity across a 50% symmetry axis; equal-width cards under one shared perspective parent)

- **Scene 1 (0.0–~0.8s) — title sets the concept.** A centered `[title line]` with an `[accent keyword]` slides DOWN into place from just above (a short smooth settle). The downward arrival is deliberate: it forms a non-conflicting T-shape against the cards, which arrive from the sides next.
- **Scene 2 (~0.4–1.9s) — the split-tilt entry (signature move).** Two equal-width feature cards arrive from opposite wings — `[left card]` from the left, `[right card]` from the right ~0.2s behind — each carrying a **mirrored 3D `rotateY` tilt** (left faces right, right faces left, opening like a book) and scaling ~0.85→1 as it lands. The entry overlaps the title's tail so the whole thing reads as ONE arrival, not two beats. Each card holds `[image / label / subtitle]`; box-shadows fall **outward** from the tilt (left shadow right, right shadow left).
- **Scene 3 (~1.9–end) — badges punctuate, then hold.** A pill `[badge]` lands at each card's **inner edge** (left then right, ~0.3s apart), overlapping its card ~15% so it reads as attached, not orbiting. This is the lone overshoot in the shot — it earns the punctuation. Settles and holds.

**motion vocabulary**: title slide-down from above; mirrored opposite-wing card entry; static book-open `rotateY` tilt (`+tilt` left, `−tilt` right); tilt-matched outward box-shadow; inner-edge badge spring-pop; gentle phase-opposed idle float (left vs right, never synchronized) registered as subtle jitter; dual side-glow ambient.

**rule mapping**

- two cards entering from opposite wings with mirrored `rotateY` tilts + tilt-matched shadow → `split-tilt-cards` (the signature; keep the two-layer split so the entry `x`/`scale` and the idle never collide on one alias)
- title slide-down settle → `gsap-effects` (translate + opacity on a long-tail `power3`)
- inner-edge pill badge pop (the one overshoot) → `spring-pop-entrance` (overshoot register — earns the punctuation)
- phase-opposed idle float on the pair → `sine-wave-loop` (low-amplitude register — subtle jitter, NOT lazy breathing; left `sin(t)`, right `sin(t+π)` so they never conveyor-belt)
- the two faint side glows behind the cards → `ambient-glow-bloom` (un-triggered soft bloom, one per accent)

**camera modifier**: camera-static by default — the symmetry is the subject and a move would break the balance.

## Selected motion rule: anchored-layout-expand

---
name: anchored-layout-expand
description: Edge-pinned container grows (or collapses) along ONE axis and in-flow content reflows with it — a pill springs open downward into a dropdown, a panel grows a sub-task stack, an input card stretches as typed text wraps, a pane expands over a neighbor. Transform-only (mask + slide, or proxy-driven scaleY + counter-scale) because width/height tweens are forbidden; the push on subsequent content is a matched translate on the same tween.
metadata:
  tags: expand, collapse, anchored, dropdown, menu, accordion, panel, reflow, push, mask, counter-scale, layout
---

# Anchored Layout Expand

> The law: **author the layout at its final (expanded) state in CSS, then fake the collapsed state with transforms.** The container never changes size — the _visible_ region does — and everything downstream rides a matched translate. The browser computes layout ONCE; every intermediate frame is pure transform.

THE one-axis growth primitive: a container pinned at one edge appears to grow along a single axis, and the in-flow content after it moves in perfect contact with the traveling edge — dropdown, sub-task stack, growing composer card, pane widening over a neighbor. Growth and push are ONE motion: if the panel's bottom edge and the pushed content ever separate or overlap, the illusion dies.

Distinct from [card-morph-anchor.md](card-morph-anchor.md) (a free-floating two-shot morph with no neighbors to push — this rule's container is a live layout participant), [spring-pop-entrance.md](spring-pop-entrance.md) (arrival at a point, no edge travel or reflow), and [reactive-displacement.md](reactive-displacement.md) (displacement by a colliding intruder; here content moves because the container's edge reached it — layout causality, not collision).

## How It Works

1. **Mask** — a wrapper at the final body height (`BODY_H`), `overflow: hidden`. Never tweened.
2. **Sheet** — the panel surface + content inside the mask, starting at `y: -BODY_H` (tucked above the mask window, behind the pinned header).
3. **Below** — ONE wrapper holding everything after the container, also starting at `y: -BODY_H`.
4. **Grow** — ONE `fromTo` drives sheet AND below from `y: -BODY_H → 0`. Shared tween ⇒ the descending bottom edge and the pushed content stay in exact contact by construction. Collapse = the same pair tweened back.

When the surface must visibly **stretch in place** (rows revealed top-first, or a pane growing sideways), use the proxy counter-scale variant below instead.

## Recipe

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="stack">
  <div class="expander">
    <div class="expander-head">{headerLabel}</div>
    <div class="expand-mask" id="expand-mask" data-layout-allow-overflow>
      <div class="expand-sheet" id="expand-sheet">
        <div class="expand-row">{rowA}</div>
        <div class="expand-row">{rowB}</div>
      </div>
    </div>
  </div>
  <!-- EVERYTHING that must be pushed lives in this one wrapper -->
  <div class="below" id="below">{followingContent}</div>
</div>
```

```css
/* Layout is the EXPANDED end state — no collapsed geometry exists in CSS. */
.expander-head {
  position: relative;
  z-index: 2; /* the sheet slides out from UNDER the header */
}
.expand-mask {
  height: BODY_H; /* authored final height — NEVER tweened */
  overflow: hidden;
}
.expand-sheet {
  height: BODY_H;
  border-radius: 0 0 SHEET_RADIUS SHEET_RADIUS; /* bottom-only — header + sheet read as one grown card */
  will-change: transform; /* + on .below */
}
```

```js
// BODY_H must equal the mask's CSS height exactly — measure once at build.
// (Montage caveat: per the contract, in a multi-scene master use an authored
// CSS-matched constant instead — later clips may not be laid out yet.)
const BODY_H = document.querySelector("#expand-mask").offsetHeight;

// The grow: ONE tween, BOTH sides of the seam.
tl.fromTo(
  ["#expand-sheet", "#below"],
  { y: -BODY_H },
  { y: 0, duration: GROW_DUR, ease: GROW_EASE },
  GROW_AT,
);

// Garnish: rows already ride the sheet; the fade stagger makes them read as "options arriving".
tl.fromTo(
  ".expand-row",
  { opacity: 0 },
  { opacity: 1, duration: ROW_FADE_DUR, stagger: ROW_STAGGER, ease: "power2.out" },
  GROW_AT + GROW_DUR * 0.25,
);

// Collapse — same machinery back; faster (closing is a snap decision).
tl.fromTo(
  ["#expand-sheet", "#below"],
  { y: 0 },
  { y: -BODY_H, duration: COLLAPSE_DUR, ease: "power3.in", immediateRender: false },
  COLLAPSE_AT,
);
```

## Variations

- **Proxy counter-scale — surface stretches in place** (rows revealed top-first holding their screen positions; the "payload card expands from the tool-call line"). Drive mask `scaleY` and the sheet's exact inverse from ONE proxy — two independent tweens are wrong: eased midpoints of `s` and `1/s` are not inverses and the content squashes mid-grow. Net content scale is `s × 1/s = 1` every frame; seek-safe because everything derives from the one interpolated proxy.

  ```js
  const grow = { h: COLLAPSED_H }; // 0 for fully collapsed
  tl.fromTo(
    grow,
    { h: COLLAPSED_H },
    {
      h: BODY_H,
      duration: GROW_DUR,
      ease: GROW_EASE,
      onUpdate: () => {
        const s = Math.max(grow.h / BODY_H, 0.0001); // clamp: no divide-by-zero
        gsap.set("#expand-mask", { scaleY: s, transformOrigin: "50% 0%" });
        gsap.set("#expand-sheet", { scaleY: 1 / s, transformOrigin: "50% 0%" });
        gsap.set("#below", { y: grow.h - BODY_H });
      },
    },
    GROW_AT,
  );
  ```

- **One-axis pane expand (X)**: same machinery rotated 90° — pin the left edge, sheet from `x: -PANE_W` (or proxy `scaleX` + counter-scale, origin `0% 50%`). Decide the neighbor's fate explicitly: **overlap** (pane paints over it, no neighbor tween) or **push** (neighbor rides the same tween). Never both.
- **Typed-wrap growth** — the composer card gets taller as typed text wraps. Quantize: one short step per wrap boundary, each moving the pair by one `LINE_H`; wrap times come from the deterministic typing schedule ([discrete-text-sequence.md](discrete-text-sequence.md)), never measured at render time. Two battle-tested traps:
  - **Composer cards have no pinned header** — a composer grows from its TOP edge (the send-button footer stays put), so a plain y-step clips the card's top out of the mask. Combine the proxy counter-scale with the wrap quantization (step the proxy by `LINE_H` at each wrap time) and split the surface into a **sheet** (carries the top radius) + **footer** (carries the bottom radius) so the growth seam stays invisible.
  - **Wrap TIME vs wrap POSITION are two different authorities** — the typing schedule decides _when_ a wrap fires, the browser's line-breaking decides _where_ text actually wraps, and with proportional fonts they silently disagree. Author an explicit `\n` in the typed string (with `white-space: pre-wrap`) at the chosen split point so both derive from the same authored fact.
- **Springy open** (rare, explicitly-playful): `back.out(1.2)` — the edge overshoots a few px; the pushed content bounces with the panel (correct — they're in contact). Default stays `power3.out`.
- **Row grows a sub-task stack**: the row is the pinned header, the stack is the sheet, every later row lives in `#below`; chain several scopes for progressive disclosure.
- **FLIP hand-off**: if the container also TRAVELS to a new layout slot while resizing (prompt promoted to heading, card docking into a sidebar), that's a FLIP problem — `/hyperframes-keyframes` (FLIP recipes). This rule stays the in-place one-axis specialist.

## Values

| token                    | range                       | notes                                                                 |
| ------------------------ | --------------------------- | --------------------------------------------------------------------- |
| BODY_H                   | measured / authored         | drift from the CSS height = visible gap or overlap at full open       |
| GROW_AT                  | trigger beat + 0–0.1s       | growth needs a cause (click / wrap / status beat) or it reads haunted |
| GROW_DUR                 | 0.35–0.6s                   | below ~0.3s the pushed content appears to teleport                    |
| GROW_EASE                | `power3.out` default        | `back.out(1.1–1.3)` only for the playful register                     |
| ROW_STAGGER / \_FADE_DUR | 0.04–0.08s / 0.2–0.3s       | start rows ~25% into the grow so none flash inside a closed panel     |
| COLLAPSE_DUR             | 0.2–0.35s, `power3.in`      | faster than open                                                      |
| STEP_DUR / LINE_H        | 0.12–0.2s / CSS line-height | typed-wrap variant; WRAP_TIMES from the typing script                 |

## Critical Constraints

- **NEVER tween `width` / `height` / `top` / `left` / `margin` / `padding`** — the mask's height is a CSS constant; only its children transform. Tweening the mask IS the forbidden move this rule replaces.
- **`data-layout-allow-overflow` on the mask** — the collapsed phase parks the sheet outside the mask's box by construction, which trips the `hyperframes check` layout gate (`container_overflow`). The flag is the sanctioned waiver: this overflow is the technique working as designed, not a bug.
- **Sheet + below share one tween (or one proxy)** — matched-but-separate tweens on the two sides of the contact edge are the classic seam bug.
- **Everything downstream rides `#below`** — content outside the wrapper is overlapped at t=0 and orphaned during the grow.
- **`overflow: hidden` on the mask** — without it the tucked sheet is visible above the header at t=0.
- **Counter-scale needs a proxy**, clamped `s ≥ 0.0001` (a fully-collapsed body divides by zero).
- **Deterministic sizes** — `BODY_H`, `LINE_H`, `WRAP_TIMES` are build-time constants or one-time measurements, never per-frame layout reads.

## See also

`cursor-click-ripple` (the igniting click) · `spring-pop-entrance` (richer per-row arrivals) · `discrete-text-sequence` (the typing that drives stepped growth) · `scale-swap-transition` (the grown menu's exit) · `/hyperframes-keyframes` FLIP (grow + travel).

## Selected motion rule: svg-path-draw

---
name: svg-path-draw
description: Animate SVG paths drawing progressively using stroke-dasharray and stroke-dashoffset.
metadata:
  tags: svg, stroke, draw, path, reveal, icon, vector
---

# SVG Path Draw

Reveals an SVG shape by animating its stroke as if a pen were tracing it. Two stroke properties together: **`stroke-dasharray = <pathLength>`** makes the entire path one dash; **`stroke-dashoffset`** starts at the path length (dash shifted fully out of view → invisible) and tweens to `0` (fully drawn). The length comes from the DOM API `path.getTotalLength()` — measured, never guessed.

Works on anything with a stroke: `<path>`, `<circle>`, `<rect>`, `<line>`, `<polyline>`, `<polygon>`, `<ellipse>`.

## Recipe

```html
<!-- inside a standard scene clip -->
<svg class="logo-mark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path id="bar-left" d="M 60 40 L 60 160" />
  <path id="bar-right" d="M 140 40 L 140 160" />
  <path id="bar-mid" d="M 60 100 L 140 100" />
</svg>
```

```css
.logo-mark path {
  fill: none; /* outline-only draw — a fill would appear immediately and ruin the reveal */
  stroke: {accentColor};
  stroke-width: 12;
  stroke-linecap: round; /* softer endpoints */
  stroke-linejoin: round;
}
```

```js
// Setup: measure each path and set its dash pattern. Real measured geometry, not a magic number.
document.querySelectorAll(".logo-mark path").forEach((p) => {
  const len = p.getTotalLength();
  p.style.strokeDasharray = `${len}`;
  p.style.strokeDashoffset = `${len}`;
});

// Stagger draws so the eye reads continuous motion — each segment starts at
// ~70-80% of the previous segment's duration, before it finishes.
tl.to(
  "#bar-left",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_1_START,
);
tl.to(
  "#bar-right",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_2_START,
);
tl.to(
  "#bar-mid",
  { strokeDashoffset: 0, duration: FINAL_SEGMENT_DUR, ease: "power2.out" },
  SEG_3_START,
);

// Companion wordmark fades in only after the last stroke settles.
tl.to(
  ".brand-line",
  { opacity: 1, duration: BRAND_FADE_DUR, ease: "power1.out" },
  BRAND_FADE_START,
);
```

## Variations

- **Ring starting at 12 o'clock** — `<circle>` / `<rect>` strokes start at 3 o'clock by default; rotate the element `-90deg` so a progress ring draws from the top:

```html
<circle
  cx="100"
  cy="100"
  r="60"
  id="ring"
  style="transform-origin: 100px 100px; transform: rotate(-90deg)"
/>
```

- **Linear (constant-speed) draw** — `ease: "none"` for a steady-rate "real pen" trace.
- **Draw then fill** — for filled shapes, tween `fillOpacity: 0 → 1` AFTER the stroke completes (requires `fill-opacity: 0` initially and a real `fill` in CSS):

```js
tl.to(
  "#path",
  { strokeDashoffset: 0, duration: SEGMENT_DRAW_DUR, ease: "power2.out" },
  SEG_1_START,
);
tl.to(
  "#path",
  { fillOpacity: 1, duration: FILL_FADE_DUR, ease: "power1.out" },
  SEG_1_START + SEGMENT_DRAW_DUR,
);
```

## Values

| token             | range                                   | notes                                                                                              |
| ----------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| SEGMENT_DRAW_DUR  | 0.3–0.8s                                | fast snap vs deliberate pen trace; >~1s feels sluggish for a logo reveal                           |
| FINAL_SEGMENT_DUR | 60–80% of SEGMENT_DRAW_DUR              | proportional to segment length — a short connector at full duration reads slower than its siblings |
| SEG_N_START       | previous start + 70–80% of its duration | reads as continuous motion, not N isolated animations                                              |
| SEG_1_START       | 0–0.4s                                  | a small ~0.2s lead-in lets the viewer settle before motion                                         |
| BRAND_FADE_START  | ≥ last stroke end (+ ~0.2s beat)        | earlier and the wordmark competes with the draw                                                    |
| BRAND_FADE_DUR    | 0.3–0.8s                                | snap (urgent) vs glide (premium)                                                                   |

Ease families are discrete choices: **stroke draws** use `power2.out` (a hand lifting at end of stroke) or `none` for constant speed — never `back.out` / `elastic.out` (pens don't bounce). **Fades** use `power1.out`.

## Critical Constraints

- **`fill: none`** for outline-only draws — otherwise the fill appears immediately.
- **Dasharray/dashoffset = the measured `getTotalLength()`**, set at setup; requires the SVG in the DOM (inline SVG is fine; a loaded `<image>` SVG is not).
- **Complex paths**: if `getTotalLength()` looks wrong, overestimate slightly (`len * 1.05`) — too large is invisible at animation start; too small clips the end.
- **Stagger multi-path draws at ~70–80%** of the previous segment's duration.
- **A drawn line must land on something.** When the path is a connector (rail, beam, underline, callout) rather than a shape, both endpoints must sit on real elements and the draw must do a job — reveal, route, validate, or emphasize. A stroke that only decorates empty space reads as filler; attach it or cut it.

## See also

`svg-icon-enrichment` (internal parts animate after the outline draws) · `counting-dynamic-scale` (stroke draws an icon while a number counts up) · `hacker-flip-3d` (logo draws, wordmark decodes beneath).
