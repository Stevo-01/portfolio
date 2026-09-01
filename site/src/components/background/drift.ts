/**
 * The drift loop. Owned by slice 02.
 *
 * One requestAnimationFrame loop drives every icon on the page. Not one per
 * element, and not a canvas: at ten sprites the DOM keeps the SVGs crisp at any
 * DPI, lets them inherit tokens so both themes work for free, and costs less
 * code than rasterising would.
 *
 * The loop only ever writes `transform`. No `left`, no `top`, no `width`, no
 * `filter` changes per frame. Those trigger layout or paint; a transform is
 * composited, which is the difference between 60fps and a visible stutter on
 * the one element a visitor is guaranteed to look at.
 */

import { EXCLUSION } from './seed';

interface Sprite {
  el: HTMLElement;
  /**
   * The seeded origin in px, read from the element's own laid-out position.
   * The sprite sits there via inline left/top percentages; `dx`/`dy` below are
   * the drift away from it. Keeping them separate is what lets the transform
   * stay a pure delta, which is the only thing cheap enough to write every
   * frame.
   */
  baseX: number;
  baseY: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  /**
   * The sprite's worst-case rotated footprint. A square rotated 45 degrees has
   * a bounding box sqrt(2) times its side, so clamping against `size` alone
   * lets the corners cross an edge. `overflow: hidden` clips that, but the
   * reflection should happen where the sprite visually meets the boundary
   * rather than where its unrotated box would have.
   */
  bbox: number;
}

const REDUCED = '(prefers-reduced-motion: reduce)';

export function startDrift(host: HTMLElement): () => void {
  const media = window.matchMedia(REDUCED);

  let sprites: Sprite[] = [];
  let frame = 0;
  let last = 0;
  let width = 0;
  let height = 0;
  let onScreen = true;

  function measure(): void {
    const rect = host.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }

  function build(): void {
    measure();
    sprites = [...host.querySelectorAll<HTMLElement>('[data-drift]')].map((el) => ({
      el,
      // offsetLeft/offsetTop resolve the inline percentage against the host, so
      // the seed survives any viewport width without recomputing it here.
      baseX: el.offsetLeft,
      baseY: el.offsetTop,
      dx: 0,
      dy: 0,
      vx: Number(el.dataset.vx ?? 0),
      vy: Number(el.dataset.vy ?? 0),
      rotation: Number(el.dataset.rotation ?? 0),
      spin: Number(el.dataset.spin ?? 0),
      size: Number(el.dataset.size ?? 32),
      bbox: Number(el.dataset.size ?? 32) * Math.SQRT2,
    }));
  }

  function write(s: Sprite): void {
    s.el.style.transform = `translate3d(${s.dx.toFixed(1)}px, ${s.dy.toFixed(1)}px, 0) rotate(${s.rotation.toFixed(1)}deg)`;
  }

  /**
   * Keeps sprites out of the headline.
   *
   * The seed filter only decides where a sprite starts; over a minute of drift
   * one will cross the H1 without this, and an icon sliding behind a headline
   * reads as a bug rather than as atmosphere.
   *
   * The box is treated as solid: whichever edge the sprite is nearest is the
   * one it gets pushed back out through, and that velocity component flips.
   * Pushing out along the shortest axis avoids the sprite skimming the long
   * edge and looking like it is stuck to it.
   */
  function deflectFromHeadline(s: Sprite): void {
    const bx0 = (EXCLUSION.x0 / 100) * width;
    const bx1 = (EXCLUSION.x1 / 100) * width;
    const by0 = (EXCLUSION.y0 / 100) * height;
    const by1 = (EXCLUSION.y1 / 100) * height;

    const x = s.baseX + s.dx;
    const y = s.baseY + s.dy;
    const r = s.bbox;

    const inside = x + r > bx0 && x < bx1 && y + r > by0 && y < by1;
    if (!inside) return;

    // Distance to each edge; smallest wins.
    const outLeft = x + r - bx0;
    const outRight = bx1 - x;
    const outTop = y + r - by0;
    const outBottom = by1 - y;
    const min = Math.min(outLeft, outRight, outTop, outBottom);

    if (min === outLeft) {
      s.dx = bx0 - r - s.baseX;
      s.vx = -Math.abs(s.vx);
    } else if (min === outRight) {
      s.dx = bx1 - s.baseX;
      s.vx = Math.abs(s.vx);
    } else if (min === outTop) {
      s.dy = by0 - r - s.baseY;
      s.vy = -Math.abs(s.vy);
    } else {
      s.dy = by1 - s.baseY;
      s.vy = Math.abs(s.vy);
    }
  }

  function step(ts: number): void {
    // Delta time, not a fixed per-frame increment. Without this the field
    // travels at double speed on a 120Hz display.
    const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
    last = ts;

    // Read phase. Nothing here touches the DOM, so there is no interleaved
    // read/write and therefore no forced synchronous layout.
    for (const s of sprites) {
      s.dx += s.vx * dt;
      s.dy += s.vy * dt;
      s.rotation += s.spin * dt;

      // Collision is tested against the absolute position (origin + drift),
      // then the velocity component is reflected. Clamping as well as
      // reflecting means a resize that leaves a sprite out of bounds recovers
      // instead of drifting away forever.
      const absX = s.baseX + s.dx;
      const absY = s.baseY + s.dy;

      // A rotated square's bounding box grows around its CENTRE, so it
      // overhangs by half the difference on every side. Clamping the left edge
      // to 0 would still let a corner poke out by that pad.
      const pad = (s.bbox - s.size) / 2;
      const minX = pad;
      const minY = pad;
      const maxX = width - s.size - pad;
      const maxY = height - s.size - pad;

      if (absX <= minX) { s.dx = minX - s.baseX; s.vx = Math.abs(s.vx); }
      else if (absX >= maxX) { s.dx = maxX - s.baseX; s.vx = -Math.abs(s.vx); }
      if (absY <= minY) { s.dy = minY - s.baseY; s.vy = Math.abs(s.vy); }
      else if (absY >= maxY) { s.dy = maxY - s.baseY; s.vy = -Math.abs(s.vy); }

      deflectFromHeadline(s);
    }

    // Write phase, batched after every read.
    for (const s of sprites) write(s);

    frame = requestAnimationFrame(step);
  }

  function play(): void {
    if (frame || media.matches || !onScreen || document.hidden) return;
    last = 0;
    frame = requestAnimationFrame(step);
  }

  function pause(): void {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  /**
   * Reduced motion is checked before the loop is ever scheduled, not after.
   * Starting a rAF loop and cancelling it still burns a frame and still moves
   * the sprites once, which is exactly what the preference asks you not to do.
   */
  function applyPreference(): void {
    if (media.matches) {
      pause();
      // Return to the seeded arrangement so the field looks composed rather
      // than frozen mid-drift. dx/dy are zero after build(), so this writes the
      // origin positions back.
      build();
      for (const s of sprites) write(s);
    } else {
      build();
      play();
    }
  }

  // Off-screen work is wasted work. The hero scrolls away within one viewport
  // on every page, so this halts the loop for most of a visit.
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) play();
    else pause();
  });
  io.observe(host);

  const onVisibility = () => (document.hidden ? pause() : play());
  document.addEventListener('visibilitychange', onVisibility);

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const wasRunning = Boolean(frame);
      pause();
      build();
      if (wasRunning) play();
    }, 150);
  };
  window.addEventListener('resize', onResize);

  // A mid-session flip of the OS preference is honoured, not ignored until
  // reload.
  media.addEventListener('change', applyPreference);

  applyPreference();

  return () => {
    pause();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', onResize);
    media.removeEventListener('change', applyPreference);
    window.clearTimeout(resizeTimer);
  };
}
