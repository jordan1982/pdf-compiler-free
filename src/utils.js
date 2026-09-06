// Vertical offset (as a fraction of font size) subtracted from the box's
// top edge to get the PDF baseline. In theory Helvetica's cap-height is
// ~0.72 of the font size, but browsers render text with extra line-height
// leading above the glyph even at `line-height: 1`, so the on-screen box's
// top edge sits noticeably above the visible glyph. This value is tuned
// empirically to match what you see in the preview; nudge it up/down a
// little (in 0.02 steps) if text still lands slightly high or low in the
// exported PDF.
export const CAP_HEIGHT_RATIO = 0.85;

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function getPointerPos(e) {
  if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}