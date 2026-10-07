# Frame packet: 01-hook-28-nguoi

## Project inputs

- Project: D:\Video_Remotion_Graphic\videos\sirrok-agent-promo
- Design tokens: D:\Video_Remotion_Graphic\videos\sirrok-agent-promo\frame.md
- RULES_DIR: C:\Users\Admin\.claude\skills\hyperframes-animation\rules

## Assigned storyboard block

## Frame 1 — 20–30 người, hoặc một agent

- type: hook
- duration: 4.6s
- transition_in: cut
- status: built
- src: compositions/frames/01-hook-28-nguoi.html
- blueprint: dataviz-countup (Adapt)
- focal: count-up (component) — đếm 0 lên 28
- roles: headcount-stack = cutout · sirrok-agent-icon.svg = supporting (chỉ xuất hiện 1.5s cuối) · nền phẳng = background
- persuasion: Cold-open stat
- beat: nêu cái giá, mở ngay lối thoát
- scene: Lưới 28 glyph người đếm lên trên nền sáng, rồi cả lưới sụp lại thành một dome mark Sirrok
- vo_file: public/audio/vo-01.mp3 (3.06s, ElevenLabs Daniel)
- voiceover: "Hai mươi, ba mươi người. Hoặc... một agent."
- sfx: soft digital tick, low impact hit
- asset_candidates: "headcount-stack (tự dựng), assets/sirrok-agent-icon.svg, metric-value count-up"
- narrative_role: "Lands the value claim in beat 1 — nêu cái giá hiện tại rồi mở ra lối thoát trong cùng một hơi"
- handoff_out: "dome mark — center (960, 540), scale 1.0, opacity 1, đứng yên; chỉ còn nó trên canvas khi cắt"

Adapt: giữ signature move **value-scaled counter** của dataviz-countup, nhưng
vòng ring đổi thành lưới glyph người, và một stat thay vì ba. Lưới là thứ biến
hình, không phải thứ trang trí.

Scene 1 (0.0–1.9s): nền `bg` phẳng; eyebrow "ĐỂ MỘT HỆ THỐNG CHẠY ĐƯỢC" (`primary`, uppercase) nằm trên, số "28" dead-center **value-scaled counter** đếm 0 lên 28 — cỡ chữ lớn dần theo giá trị nên chính cú leo là cú escalate; lưới 14×2 glyph người mọc **đồng bộ từng glyph với bộ đếm**, không mọc sẵn. Centered, hero chiếm ~55% khung, 3 lớp (nền · lưới · số).
Scene 2 (1.9–2.5s): bộ đếm dừng ở 28, chữ "NGƯỜI" settle cạnh số. **Giữ yên hoàn toàn** — đây là khoảng lặng trong lời thoại trước chữ "Hoặc", stillness làm việc thay motion.
Scene 3 (2.5–3.1s): trên chữ "một agent", cả lưới bắt đầu **cluster to inward collapse** (nghịch đảo center-outward-expansion) — 28 glyph lao về tâm trong lockstep, kéo `motion-blur-streak` hướng tâm.
Scene 4 (3.1–4.6s): collapse đóng lại thành dome mark Sirrok bằng **scale-swap** (lưới co + mờ trong khi mark tới cùng một tâm), mark lock ở (960, 540) và **đứng tuyệt đối yên** tới lúc cắt. Centered, mark ~17% chiều rộng khung.

## Selected blueprint: dataviz-countup

# dataviz-countup — Data-Viz / Count-Up

**intent**: Make numbers and charts the hero — a count-up ring/number, a trend chart, a tilted stat/card grid — and traverse the data instruments with a camera that pushes THROUGH them (or scrolls across them) to land on one hero metric, so the data itself carries the argument.

**roles served**

- Problem (from `problem-dataviz-pushthrough`): quantifies the pain with real-looking instruments — a count-up ring → a trend chart → a stat grid — the camera pushing THROUGH each object into the next to dramatize a worsening / large-scale problem ("X% of people struggle with…").
- Product_Intro (from `product-intro-dataviz-scroll-reveal`): a confident "look at the result / the data" open — hard-cut from a hook word into a perspective-tilted grid of data-viz cards, then a hands-off camera scroll lands one glowing hero metric while a kinetic tagline assembles word-by-word.
- Hook (from `hook-counter-burst`): a cold-open hook on ONE dramatic statistic — the frame opens dark and empty, 3–5 thematic icons puncture in clustered at center, then the headline number EXPLODES upward in size as the icons fling outward to their marks (the count-up and the spread are one beat), closed by a slow camera lean-in. Kinetic from frame 1.
- Key_Feature (from dark-stat-scrub-montage): prove the feature with its own analytics — on a black canvas, kinetic headline beats alternate with self-drawing charts and a 3D-tilted dark dashboard that a cursor SCRUBS (tracking line + live tooltips), stitched by hard cuts and one zoom punch. The one variant where a cursor touches the data.
- Social_Proof (from `gauge-beat`): a single count-up instrument — radial gauge arc-draw + rapidly ticking metric + caption — embedded as ONE BEAT inside a kinetic-typography relay; entered and exited by element-level scale/blur push-throughs on a static frame. The instrument guest-stars; the relay itself belongs to kinetic-type-beats.

**duration**: ~4–12s (Hook ~4s · Product_Intro ~6s · dark-scrub-montage ~7.3–7.75s · Problem ~11–12s · gauge-beat ~2.5s inside a ~10.8s relay)

**shot structure** Data-viz field on `[bg color]` (dark or light, soft corner glows); `[gradient A→B]` brand stroke on charts/rings; clean sans-serif white/dark text; a continuous camera move runs underneath that traverses 2–3 data instruments and resolves on a hero metric. One instrument per beat; the camera carries the cut.

- Scene 1 (0.0–Xs): the first data instrument establishes centered — a `[stat]` reads as the hero. A bold center number COUNTS UP `[start]`→`[end]` while its transform scale grows to the static final type size, with `[stat label]` below; its paired graphic (a circular progress RING sweeping to `[pct]` with a `[gradient]` stroke, or a bar/fill) animates in on the SAME ease so number + graphic land as one beat. Supporting `[avatar/object]` elements pop in with spring overshoot into a scattered glowing orbit; a `[headline]` fades up. A very slow continuous camera zoom-in runs throughout.
- Scene 2 (Xs–Ys): the camera traverses to the next instrument and that instrument animates — a `[gradient]` trend line / area chart DRAWS left→right on grid lines (Problem), or off-center cards SCROLL away as the layout glides (Product_Intro). The arriving `[stat-2]` number counts up / the chart resolves.
- Scene 3 / Scene N (…–end): the camera lands the `[hero metric card]` (big number + label + delta + rising chart) in dead-center; a soft `[accent]` glow blooms behind it; the move reaches its peak then eases to a settled, slightly wider composition with the hero centered and supporting cards flanking it. HOLD on the final frame.

- Variant — Problem (push-THROUGH, count-up → trend → grid): Scene 1 is a centered circular progress ring + count-up center number with scattered glowing `[avatar/object]` orbit. Scene 2 is a fast camera PUSH-IN straight through the center of the ring (ring, number, orbiting elements scale up and fly out of frame) into a rounded `[card]` holding `[stat-2 header]` over a `[gradient]` line chart with grid lines + translucent area fill that draws left→right; camera pushes through then settles. Scene 3: camera PANS to a second `[card]` whose number counts up, holding a grid of the `[avatar/object]` elements — a subset dim/blur while the rest receive `[accent]` circular checkmark badges that SPRING-POP; camera settles to the end. The traversal is z-depth push-through between instruments.
- Variant — Product_Intro (scroll-to-hero + word-by-word tagline): a brief opener — Scene 0 (~0.0–0.85s): a full-frame `[hero-color orb]` with a bold white `[hook phrase]` over it; static shimmer, then HARD CUT. Scene 1 cuts to a slightly perspective-TILTED grid of `[data-viz / product cards]` (charts, heatmaps, stat cards with deltas + source footers) with `[tagline word 1]` centered; the grid begins SCROLLING (e.g. toward upper-left) with its tilt held. Scene 2: the grid keeps scrolling so the `[hero metric card]` glides into dead-center as off-center cards slide away; `[tagline word 1]` translates out and `[word 2]` rises in from a frame edge. Scene 3: hero card settles centered, `[accent]` glow blooms behind it, camera PUSHES IN slightly; `[word 2]` holds near it. Scene 4: `[word 2]` slides out, the final `[tagline word]` drops in from the opposite edge above the still-glowing hero, push-in peaks. Scene 5: overlay type clears, camera eases BACK OUT to a settled wider tilted composition — hero centered with glow, supporting cards flanking. The traversal is a hands-off camera SCROLL across a tilted card plane (no cursor, no clicks) + a one-word-at-a-time kinetic headline + push-in-then-out bookend.
- Variant — Key_Feature (dark-scrub-montage: kinetic beats × instruments, cut-stitched): on black, `[kinetic word]` beats ALTERNATE with data instruments; hard cuts stitch the beats and the camera is locked per beat — the traversal is a montage, not a continuous move. Beat A: a bold `[heading]` holds while a thick `[trend line]` DRAWS itself left→right inside a dark chart band, rising to break above the band's edge; at the peak a `[accent]` dot pops and a pill tooltip springs in, its label building to `[value + delta]`. Beat B: ONE fast zoom PUNCH lands a close-up, slightly 3D-tilted dark `[analytics dashboard]` (metric cards with deltas, translucent oversized numerals floating behind); a white cursor SCRUBS a chart — a vertical tracking line follows it and `[date: value]` tooltips read out live, then a second chart ACTIVATES with a color flip and its own scrubbing tooltip — while the tilted plane drifts gently sideways; quick pull-away/fade to black. Beat C: a `[glowing wave / typed line / impact word]` beat lands the closing stat LOCKUP — `[title]` + big `[stat]` counting up + `[green delta arrow + context line]` — and holds static to the end. Kinetic words between instruments scale up violently past the frame as element-level push-through transitions (no camera).
- Variant — Social_Proof (gauge-beat inside a relay): a static-camera kinetic-type relay hosts ONE instrument beat — thin concentric `[accent]` arcs radiate from center, a thick `[accent]` progress arc draws clockwise over them, a large `[metric]` rapidly ticks up to `[big value]` with a `[caption]` below; the group slowly scales up (element-level drift), then hard-cuts out to the next text beat. Entry/exit for every beat is scale-up-from-blur in / scale-up-and-blur-past-frame out — a fake push-through with no camera anywhere. Use when social proof is one number and the surrounding beats are typography.

**motion vocabulary** count-up number with transform-scale growth on the value; circular progress-ring sweep; growth bar / progress fill; gradient trend-line + area-fill left→right draw; spring-overshoot pop-in of scattered glowing avatar/object elements; perspective-tilted card grid; directional grid scroll (cards glide in/out of center); hero-card centering; soft accent glow bloom behind the hero; slow continuous zoom-in; fast camera push-IN / push-THROUGH the center of an instrument; lateral/vertical camera pan between cards; gentle push-in that peaks then eases back out to a wider settle; selective dim/blur of a subset + spring-pop checkmark badges; full-frame hook orb → hard cut; kinetic tagline assembled word-by-word (each word drops/rises from a frame edge, prior word slides out). Dark-scrub-montage additions: self-drawing chart line that breaks above its band; peak dot + pill tooltip spring-pop; cursor chart scrub with vertical tracking line + live date/value tooltip readouts; chart activation color flip; 3D-tilted dark dashboard plane with slow lateral drift; translucent oversized numerals floating behind cards; fast zoom punch-in; pull-away/fade-to-black beat exit; hard-cut beat stitching; kinetic word push-through (element scales up past the frame); typed line with blinking cursor; impact slam word + particle-dissolve punctuation; glowing wave draw; green delta arrow pop; stat lockup hold. Gauge-beat additions: concentric static arcs + thick clockwise progress-arc draw; rapid count-up tick; scale-up-from-blur entrance / scale-up-and-blur-past-frame exit (element-level fake push-through).

**rule mapping** (motion verb → `rules/<id>.md`)

- count-up number whose transform scale grows with the value → `counting-dynamic-scale` (primary text rule)
- circular progress-ring sweep (the ring fill) → `stat-bars-and-fills` (ring form) — its draw mechanics delegate to → `svg-path-draw`
- growth bars / progress fill paired beside a number → `stat-bars-and-fills` (primary data rule)
- gradient trend-line / area-chart left→right draw → `svg-path-draw` (a path/line draws itself)
- spring-overshoot pop-in of the avatar/object elements → `spring-pop-entrance` (elastic overshoot); the scattered-ring layout of glowing avatars/objects → `avatar-cloud-network`; if they keep drifting/orbiting → `orbit-3d-entry`
- spring-pop `[accent]` checkmark badges → `spring-pop-entrance`
- perspective-tilted card grid (tilt held static while content moves) → `3d-page-scroll`
- directional scroll across the tilted card plane (cards glide in/out of center) → `3d-page-scroll` (scroll) + `viewport-change` (lateral/vertical pan form)
- hero metric card centering (scroll/pan lands the target dead-center) → `coordinate-target-zoom` (target lands at viewport center) / `viewport-change`
- hard-cut from the hook orb into the grid → `scale-swap-transition`
- kinetic tagline assembled word-by-word → `kinetic-beat-slam` (one onset grid, distinct per-word entrances)
- slow continuous zoom-in + push-THROUGH the instruments + lateral/vertical pan between cards + push-in-then-out bookend → `multi-phase-camera` (see camera modifier)
- soft accent glow BLOOM behind the hero card → `ambient-glow-bloom` (un-triggered soft glow/bloom behind the static hero element — distinct from `press-release-spring`'s press-triggered glow and `asr-keyword-glow`'s word-timed envelope)
- selective dim/blur of a SUBSET of grid items (focus-falloff on the non-highlighted cards) → `depth-of-field-blur` (selective per-element blur/dim to spotlight the highlighted cards — the same focus-falloff rule used in `constellation-hub`)
- cursor chart scrub (cursor-tied vertical tracking line + live data readout in a tooltip) → `chart-scrub-readout` (the tracking line, tooltip pop, and seek-safe live value readout driven by cursor x)
- chart activation color flip (second chart lights up under the scrub) → `gsap-effects` (color/opacity chord at the scrub handoff — basic tween, no dedicated rule needed)
- 3D-tilted dashboard plane + slow lateral drift → `3d-page-scroll` (the tilt framing) + `sine-wave-loop` (the drift; keep amplitude tiny so the scrub stays legible)
- fast zoom punch-in to the dashboard → `multi-phase-camera` (one short aggressive push phase) aimed via `coordinate-target-zoom`; add `motion-blur-streak` at peak velocity
- kinetic word push-through / scale-up-and-blur-past-frame exit / scale-up-from-blur entrance → `kinetic-beat-slam` (the beat grammar) + `motion-blur-streak` (blur peaks at max speed, resolves at the settle — its entrance form runs the blur-in, its exit form the blow-past)
- typed line with blinking cursor → `discrete-text-sequence` + `context-sensitive-cursor` (square-wave blink)
- impact slam word → `kinetic-beat-slam`; its particle-dissolve punctuation → `particle-burst` (glyph→particles dissolve, deterministic)
- glowing wave draw → `svg-path-draw` (the draw) + `ambient-glow-bloom` (the glow envelope)
- green delta arrow pop / peak dot + pill tooltip → `spring-pop-entrance`
- concentric static arcs + clockwise progress-arc draw (gauge beat) → `stat-bars-and-fills` (ring form) → draw mechanics `svg-path-draw` (both already mapped above — the gauge is the existing ring with static concentric chrome behind it)

**camera modifier**: The camera is the through-line that traverses the data instruments — one camera wrapper sequenced by `multi-phase-camera`, with each stop targeted via `coordinate-target-zoom` onto the focal instrument/card.

- Problem — push-THROUGH: a slow continuous zoom-in (drift overlay) plus a fast PUSH-IN straight through the center of one instrument into the next (`multi-phase-camera`, Steady-push pattern), then a lateral/vertical PAN to the final card. Z-depth push-through is the signature (distinguishes it from a flat pan-tour).
- Product_Intro — scroll-to-hero + bookend push: a hands-off directional SCROLL across the tilted card plane (`3d-page-scroll` scroll / `viewport-change` pan) that lands the hero card center, then a gentle push-in that PEAKS and eases BACK OUT to a wider settle (`multi-phase-camera`, Bookend-pull pattern). No cursor, no clicks — the camera does the navigating.
- Key_Feature — montage-cut: the camera is NOT the through-line — hard cuts stitch the instrument beats, the frame is locked inside each beat, and exactly ONE fast zoom punch (`multi-phase-camera` single push phase + `coordinate-target-zoom`) lands the dashboard close-up; exits are pull-away/fade-to-black. Between instruments, ELEMENTS fake the push: kinetic words scale up past the frame (`kinetic-beat-slam` + `motion-blur-streak`). Gauge-beat form drops even the punch — fully static, all push-through element-level. Reach for this mode when the dialect is a dark rapid montage; the Problem/Product_Intro modes remain the default for a single continuous argument.

## Selected motion rule: center-outward-expansion

---
name: center-outward-expansion
description: Elements start clustered at screen center and expand outward to their final positions, driven by a shared progress value.
metadata:
  tags: expansion, scatter, center, reveal, layout, sync, burst
---

# Center-Outward Expansion

Elements begin at one shared center point and radiate outward to their final positions — the entry beat itself, or motion driven by another animation's progress (a counting number, a beat). Flat 2D cousin of [depth-scatter-assemble.md](depth-scatter-assemble.md) (per-element 3D cloud): here every element shares the SAME origin.

## How It Works

Each element carries its final offset as `data-target-x/y`. Its position lerps between center and target: `x = targetX × progress`. Self-centering is baked as `xPercent/yPercent: -50` so the tweened `x`/`y` are pure offsets from the stage center. Standalone burst = per-item staggered `fromTo`; driven burst = one shared proxy (see Variations).

## Recipe

```html
<!-- inside a standard scene clip (hyperframes-core) -->
<div class="burst-wrap">
  <div class="burst-item" data-target-x="-360" data-target-y="-180">{itemA}</div>
  <div class="burst-item" data-target-x="360" data-target-y="-180">{itemB}</div>
  <div class="burst-item" data-target-x="0" data-target-y="360">{itemC}</div>
</div>
```

```css
.burst-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.burst-item {
  position: absolute;
  top: 50%;
  left: 50%; /* GSAP xPercent/yPercent -50 bakes the centering; x/y tween the offset */
  will-change: transform;
}
```

```js
document.querySelectorAll(".burst-item").forEach((el, i) => {
  tl.fromTo(
    el,
    { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.6, opacity: 0 },
    {
      x: Number(el.dataset.targetX),
      y: Number(el.dataset.targetY),
      scale: 1,
      opacity: 1,
      duration: EXPAND_DUR,
      ease: EXPAND_EASE,
    },
    ENTRY_AT + i * STAGGER,
  );
});
```

## Variations

- **Synced to a driver (chord)**: when the burst shadows a counter / beat, drop the stagger and drive all items from ONE 0→1 proxy tween with the driver's exact duration AND ease; `onUpdate` writes `translate(-50%,-50%) translate(targetX*p, targetY*p)` per item — the two read as one beat.
- **Partially-spread start**: with 6+ items the full cluster piles up — start from `{ x: targetX * START_PROGRESS, ... }`.
- **Idle micro-float**: hand off to [sine-wave-loop.md](sine-wave-loop.md) after landing instead of freezing.

## Values

| token          | range                | notes                                                            |
| -------------- | -------------------- | ---------------------------------------------------------------- |
| ITEM_COUNT     | 3–8                  | > 8 = visual chaos mid-expansion; low counts want wider spread   |
| EXPAND_DUR     | 1.0–1.8s             | must equal the driver's duration in the synced variant           |
| EXPAND_EASE    | `power3.out` default | `power2.out` gentler, `expo.out` dramatic stop; NEVER `in` eases |
| STAGGER        | 0.04–0.08s           | tighter = chord; looser = lazy arpeggio                          |
| ENTRY_AT       | 0–0.5s               | a beat of compositional quiet before the burst                   |
| START_PROGRESS | 0–0.5                | 0 = dramatic full cluster; ~0.3 avoids the pile-up               |

## Critical Constraints

- **Tween `x`/`y` over the baked `xPercent/yPercent: -50`** — mutating `left`/`top` fights the centering and causes pixel jitter.
- **Out-easing only** — `in` easings read as items being sucked back mid-air.
- **No other absolute-positioned siblings inside `.burst-wrap`** — they'd steal the centered baseline.
- **❗ The burst IS the beat** — don't park a "real headline" label below it (the eye snaps to the label and ignores the burst). If a label is needed, reveal it post-burst in the same stack.
- Synced variant: identical duration + ease as the driver, or the chord falls apart.

## See also

`counting-dynamic-scale` (the classic chord driver) · `depth-scatter-assemble` (3D per-element cloud) · `card-morph-anchor` (burst out of a morphed card) · `sine-wave-loop` (post-landing life).

## Selected motion rule: motion-blur-streak

---
name: motion-blur-streak
description: Fake directional velocity blur on a fast entrance or camera push-through — blur peaks at max speed and resolves to 0 at the settle, so the element streaks in then snaps sharp. Two paths — SVG feGaussianBlur on the motion axis, or an echo/ghost trail that collapses into the lead. Plus a per-frame-driven form for an element riding a baked track (tracked insert, shake-matched title): velocity-gated text-free silhouette ghosts (or a rotate/blur/counter-rotate filter sandwich when a true blur is the look), streak axis from the track delta.
metadata:
  tags: motion-blur, velocity, streak, entrance, fly-in, ghost, echo, svg-filter, kinetic, camera, snap, driven, tracked, baked-track
---

# Motion-Blur Streak

Real motion blur isn't available to a seeked renderer (it integrates over shutter time), so this rule **fakes** it for a fast fly-in or hard camera push-through. The whole point is the _coupling_: the blur envelope rides the **same ease and window** as the position tween, so peak blur lands exactly on peak speed and the element is razor-sharp the instant it stops. Two paths:

- **(A) Directional SVG blur** — inline `<feGaussianBlur stdDeviation="X 0">` (X on the motion axis, 0 across it), tweened via a proxy. Cleanest; a true directional smear.
- **(B) Echo / ghost trail** — 2–4 duplicates at decreasing opacity, offset backward along the motion vector, collapsing into the lead as it settles. No filter cost; a stylized "speed-line" trail.

Both paths assume a **tween window** — an element driven per frame from a baked track has none; that form is the Per-Frame-Driven Carve-In below.

**Entrances and mid-shot moves only — never a mid-composition exit.** A blurred element fleeing off-frame mid-composition reads as a glitch; a hard exit between scenes is the transition's job (`../transitions/overview.md`). Two sanctioned scope extensions: the envelope may ride the **camera wrapper** during a travel leg (Camera-Travel Carve-Out), or become a per-frame function of a baked track for a **driven element** (Per-Frame-Driven Carve-In).

## How It Works

A fast `out`-eased move front-loads velocity — fastest off the start, bleeding to zero at the settle. Map the blur/echo envelope onto that same curve: position travels from an off-frame / pushed-back start to rest over `MOVE_DUR`; in lockstep on the same window and ease the smear goes `PEAK_BLUR → 0` (A) or the ghosts collapse onto the lead (B). By the settle the element is fully crisp and dwells ≥1 s — the contrast between violent streak and still, sharp settle IS the effect. GSAP can't tween an SVG attribute directly: tween a plain `{ v }` proxy and write `setAttribute("stdDeviation", …)` in `onUpdate`, seeding it once at setup so a seek to t=0 shows the streaked start.

## Recipe

```html
<!-- inside a standard scene clip; overflow: hidden on the scene (the smear extends past rest) -->
<svg width="0" height="0" aria-hidden="true" style="position: absolute">
  <filter id="streak" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur id="streak-blur" in="SourceGraphic" stdDeviation="0 0" />
  </filter>
</svg>
<div class="streak-el" id="streak-el" style="filter: url(#streak)">{phrase}</div>
<!-- Path B instead: N-1 aria-hidden .streak-ghost duplicates BEHIND the lead, no filter -->
```

```js
// Path A — proxy-tweened directional blur.
const blurNode = document.getElementById("streak-blur");
const blurProxy = { v: PEAK_BLUR };
const writeBlur = () => blurNode.setAttribute("stdDeviation", `${blurProxy.v} 0`); // X axis only
writeBlur(); // seed frame 0 — a seek to t=0 must show the streaked start, not a sharp pre-frame

tl.fromTo(
  "#streak-el",
  { x: ENTER_FROM_X, opacity: 0 },
  { x: 0, opacity: 1, duration: MOVE_DUR, ease: MOVE_EASE },
  MOVE_START,
);
tl.to(blurProxy, { v: 0, duration: MOVE_DUR, ease: MOVE_EASE, onUpdate: writeBlur }, MOVE_START);

// Path B — ghosts on the SAME window/ease; per-ghost variation by index.
gsap.utils.toArray(".streak-ghost").forEach((g) => {
  const i = Number(g.dataset.i); // 1..N-1, set in HTML
  tl.fromTo(
    g,
    { x: ENTER_FROM_X - i * ECHO_STEP_PX, opacity: GHOST_BASE_OPACITY / i },
    { x: 0, opacity: 0, duration: MOVE_DUR, ease: MOVE_EASE },
    MOVE_START,
  );
});
```

## Variations

- **Vertical streak** — swap axes: `y`, `stdDeviation="0 Y"`, vertical echo offsets.
- **Camera push-through** — `scale: SCALE_FROM → 1` with a symmetric `"B B"` envelope (depth-wise smear, not directional): the wordmark punches out of soft focus and snaps crisp at the lock.
- **Staggered grid streak-in** — each card streaks into its slot at `MOVE_START + i * CARD_STAGGER` with its own blur proxy / ghosts; sharp the instant it lands.
- **Hold-the-streak** — blur on a marginally slower curve than position (position `expo.out`, blur `power3.out`) so the last wisp resolves just after arrival. Sparingly; default is locked envelopes.

## Camera-Travel Carve-Out

The envelope is also sanctioned at **wrapper level**: on the `.world` / camera wrapper of a virtual-camera scene ([viewport-change.md](viewport-change.md), [multi-phase-camera.md](multi-phase-camera.md), [3d-camera-flight.md](3d-camera-flight.md)) during a **travel leg** — a dive, a whip sweep, a violent final push. This does **not** violate "never a mid-composition exit": the world never leaves frame — the camera travels _through_ it, and every leg ends with the world at rest, sharp, inside the frame. Each leg is an **arrival** at the next pose, so the entrance doctrine applies leg by leg. Three deltas from the element-level recipe:

- **Envelope follows the leg's ease.** An `out` leg (dive, final push) uses the base recipe unchanged. An `inOut` repositioning leg peaks mid-leg: split the envelope at the velocity peak — `0 → PEAK` on the in-half ease over the first half, `PEAK → 0` on the out-half over the second. Seed the proxy at **0** for these (the streaked state lives mid-leg, not at t=0; seed-at-`PEAK_BLUR` belongs to the entrance shape, where the first frame IS the fastest).
- **Filter placement.** 2D camera: `filter: url(#streak)` on the `.world` wrapper. 3D flight: on the **perspective stage** above the 3D context — a `filter` on a `preserve-3d` element flattens it and collapses every `translateZ`. Never per-element inside the world: one frame-wide envelope, not N desynced ones.
- **Full-frame blur is heavy** — cap `PEAK_BLUR` ~18–20 at wrapper level (vs 30 for one element); a brief whip may touch ~24. Axis rule as usual: `"X 0"` for a lateral whip/pan, `"B B"` for a dive/push.

### Whip sweep (named composition)

The heavily-blurred lateral whip that resolves into the next region — two rules on one window:

1. **Position** — [nudge-curve.md](nudge-curve.md)'s three-phase chain on the camera state, tuned burst-dominant (tail still ≥3× ramp-in in time).
2. **Blur** — `0 → PEAK` across the ramp-in, held at `PEAK` through the linear burst (constant velocity = constant smear), `PEAK → 0` across the tail.

Swap or reveal the next region's content DURING the burst — the smear masks the change; the `power4.out` tail lands it sharp. Reveal during the burst, read after the tail.

```js
tl.to(cam, { x: WHIP_X * 0.1, duration: 0.12, ease: "power3.in", onUpdate: applyCamera }, WHIP_AT);
tl.to(
  cam,
  { x: WHIP_X * 0.75, duration: 0.1, ease: "none", onUpdate: applyCamera },
  WHIP_AT + 0.12,
);
tl.to(
  cam,
  { x: WHIP_X, duration: 0.35, ease: "power4.out", onUpdate: applyCamera },
  WHIP_AT + 0.22,
);

tl.to(blurProxy, { v: PEAK_BLUR, duration: 0.12, ease: "power3.in", onUpdate: writeBlur }, WHIP_AT);
// blur holds at PEAK through the linear burst (no tween needed — value rests at PEAK)
tl.to(blurProxy, { v: 0, duration: 0.35, ease: "power4.out", onUpdate: writeBlur }, WHIP_AT + 0.22);
```

## Per-Frame-Driven Carve-In (baked tracks)

When the element is not tweened but **driven** — a tracked insert or callout riding a baked per-frame track, a title matched to camera shake — there is no move window to share. The envelope becomes a per-frame function of the track's own delta, computed in the same `onUpdate` that applies the position.

One element per transform, so no write clobbers another:

```html
<!-- .track: position + any fade, the only element either touches -->
<div class="track">
  <!-- ×2, the lead's box -->
  <div class="streak-ghost" aria-hidden="true" data-layout-allow-overlap></div>
  <!-- Path A only: rotate onto the travel axis; same box as .lead so both rotate about one center -->
  <div class="blur-wrap" style="filter: url(#streak)">
    <!-- counter-rotate only; no GSAP transform tweens on it -->
    <div class="lead">…</div>
  </div>
</div>
```

```js
// inside the frame-lookup driver (an ease:"none" proxy → frames[i]); TRACK.x / TRACK.y are baked arrays
const j = Math.max(1, i); // frame 0 borrows the frame-1 delta so a seek to t=0 has a defined state
const dx = TRACK.x[j] - TRACK.x[j - 1];
const dy = TRACK.y[j] - TRACK.y[j - 1];
const speed = Math.hypot(dx, dy); // px per frame
const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // the streak axis IS the travel direction
track.style.transform = `translate(${TRACK.x[i]}px, ${TRACK.y[i]}px)`;

// Path B, driven form (the default here): text-free silhouette clones trail the lead along −delta.
const base = speed > TRAIL_GATE ? Math.min(TRAIL_MAX, TRAIL_K * speed) : 0;
ghost1.style.transform = `translate(${-dx * 0.25}px, ${-dy * 0.25}px)`;
ghost2.style.transform = `translate(${-dx * 0.5}px, ${-dy * 0.5}px)`;
ghost1.style.opacity = String(base); // a fade on .track multiplies in; never read another tween's value
ghost2.style.opacity = String(base * 0.5);

// Path A, driven form: rotate a filter wrapper onto the travel axis, blur along X only, counter-rotate the content.
const sigma = speed > TRAIL_GATE ? Math.min(SIGMA_MAX, 0.5 * speed) : 0;
blurWrap.style.transform = `rotate(${angle}deg)`;
lead.style.transform = `rotate(${-angle}deg)`;
blurNode.setAttribute("stdDeviation", `${sigma} 0`);
```

Three deltas from the tweened recipe:

- **Ghosts are text-free silhouettes** — the lead's box, border, radius and fill with **no content** (`aria-hidden="true"`, `data-layout-allow-overlap`). A 25–50%-opacity clone reads as shape; a clone carrying the text reads as a duplicate element, and content-free clones give the layout and contrast checkers nothing to flag.
- **Velocity-gated, not window-shaped** — the trail exists only above `TRAIL_GATE` px/frame and scales with speed (`min(TRAIL_MAX, TRAIL_K × speed)`): a slow drift shows nothing, a whip shows a 180°-shutter smear. Fade `.track`, never `.lead`: group opacity takes the trail with it, and the ghost opacity stays a pure function of the frame index whatever order frames are seeked in.
- **Axis from the baked delta** — `atan2(dy, dx)` per frame; the streak follows the track around corners with nothing to seed at setup.

**Which path for a driven subtree.** Path B is the default: it costs no filter raster (a full filter region re-rasterizes every frame under per-frame drive), its clones carry no text so the layout and contrast checkers see nothing new, and it degrades to nothing when the track is still. Path A in the driven form is legitimate when a true blur is the look. Both forms measured deterministic on the reference host (2026-09-08: single-card 120-frame and three-card 450-frame drives of each path, hardware-GL and software lanes, every double render bit-identical) — but a per-frame-driven filter is the first thing to re-measure on a new host: keep the double-render frame-hash comparison (`--format png-sequence` twice) in the pipeline rather than trusting one clean run. One earlier build (2026-08) observed 1-LSB `feGaussianBlur` jitter under per-frame load and shipped Path B for that reason.

## Values

| token               | range                                              | notes                                                                                           |
| ------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| MOVE_EASE           | `expo.out` / `power4.out` (default) / `power3.out` | `out`-family ONLY — `in`/`inOut` puts peak speed in the wrong place; position and blur share it |
| MOVE_DUR            | 0.25–0.6s                                          | over ~0.7s reads as a focus pull, not velocity                                                  |
| ENTER_FROM_X/Y      | 40–120% of the element's own dimension             | enough runway for the streak to read                                                            |
| PEAK_BLUR           | 8–30 (default 18)                                  | >30 erases the glyph at the start; ~18–20 cap at wrapper level                                  |
| SCALE_FROM          | 1.3–2.5                                            | push-through variation                                                                          |
| N (ghosts)          | 2–4                                                | >4 reads as strobe, not streak                                                                  |
| ECHO_STEP_PX        | 12–40px                                            | `N × step ≲ ENTER_FROM` so the furthest ghost starts inside the runway                          |
| GHOST_BASE_OPACITY  | 0.3–0.6                                            | opaque ghosts read as duplicate elements                                                        |
| CARD_STAGGER        | 0.05–0.12s                                         | one assembling wave, not separate arrivals                                                      |
| TRAIL_GATE          | 3–6 px/frame (default 4)                           | driven form: below it the track counts as still — no trail, no blur                             |
| TRAIL_K · TRAIL_MAX | 0.05 · 0.32                                        | driven form: ghost opacity `min(TRAIL_MAX, TRAIL_K × speed)` — hits the cap at ~6 px/frame      |
| TRAIL_OFFSETS       | 0.25 / 0.5 of the per-frame delta                  | two clones = a discrete 180° shutter; a third at 0.75 only for a long whip                      |
| SIGMA_MAX           | 8–12                                               | driven Path A: `σ = min(SIGMA_MAX, 0.5 × speed)` along the travel axis                          |

## Critical Constraints

- Blur peaks at peak speed and resolves to 0 at the settle — share the ease and window between position and envelope. A blur that lingers after the stop reads as a focus pull.
- Entrances / mid-shot arrivals only — never a mid-composition exit; wrapper-level use only per the Camera-Travel Carve-Out, per-frame-driven use only per the Per-Frame-Driven Carve-In.
- Seed `stdDeviation` at setup: at `PEAK_BLUR` for the entrance shape, at 0 for a whip / `inOut` leg.
- Generous filter region (`x="-50%" y="-50%" width="200%" height="200%"`) or the smear clips at the element's box edge.
- Directional axis: `"X 0"` horizontal, `"0 Y"` vertical, `"B B"` only for a depth/scale move — symmetric blur on a sideways move looks like defocus.
- Dwell ≥1 s sharp after the snap; a streak landing at the last beat reads as "flashed and gone".
- Heavy element on a solid field — thin type (< ~120px / 800 weight) or a busy backdrop swallows the smear.
- `overflow: hidden` on the scene — the smear / furthest ghost extends past the resting position during travel.
- Driven form: clones are text-free silhouettes (`aria-hidden`, `data-layout-allow-overlap`) inside the faded `.track`, axis from the baked delta; nothing is seeded at setup except the structural frame-0 state.

## See also

`kinetic-beat-slam` (streak as one beat's entrance) · `center-outward-expansion` (grid streak-in) · `scale-swap-transition` (same-footprint morph — not an arrival) · `nudge-curve` (the whip sweep's position half) · `3d-camera-flight` / `viewport-change` (the Camera-Travel Carve-Out's wrappers).
