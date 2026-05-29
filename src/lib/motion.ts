// Motion for the techo: unhurried, deliberate, paper-like.
//
// The metaphors are physical. Navigating through time *turns a page* —
// content arrives from the side you're heading toward. Changing scale
// (day/week/month) *focuses* — a soft rise and settle. And a day *writes
// itself in*: sections reveal in a gentle stagger, like ink laid line by
// line, with the daily quote settling last.
//
// All entrance motion is gated behind `prefers-reduced-motion`. Keyframes
// (`techo-*`) are defined once globally in the theme's CssBaseline.

/** A soft, deeply decelerating settle — the heart of the app's feel. */
export const ease = 'cubic-bezier(0.16, 1, 0.3, 1)'

const guard = '@media (prefers-reduced-motion: no-preference)'

export type PageKind = 'forward' | 'backward' | 'zoom'

/** A snappier ease for the horizontal page turn — quick out, gentle land. */
export const easeTurn = 'cubic-bezier(0.33, 0, 0.2, 1)'

/**
 * The whole-page transition between navigations. Turning to a later page
 * slides in horizontally from the right; an earlier page from the left —
 * snappy, like flipping a paper page. A change of scale rises and settles
 * into focus, a touch slower and more deliberate.
 */
export function pageMotion(kind: PageKind) {
  if (kind === 'zoom') {
    return { [guard]: { animation: `techo-zoom 480ms ${ease} both` } } as const
  }
  const name = kind === 'forward' ? 'techo-page-next' : 'techo-page-prev'
  return { [guard]: { animation: `${name} 280ms ${easeTurn} both` } } as const
}

/** A gentle rise + fade. For sections settling onto the page. */
export function rise(duration = 620, delay = 0) {
  return {
    [guard]: { animation: `techo-rise ${duration}ms ${ease} ${delay}ms both` },
  } as const
}

/** Pure opacity — like ink soaking into paper. For the daily quote. */
export function fadeIn(duration = 900, delay = 0) {
  return {
    [guard]: { animation: `techo-fade ${duration}ms ${ease} ${delay}ms both` },
  } as const
}

/**
 * A staggered rise for the nth element in a sequence. `base` is the lead-in
 * before the first item; `step` is the spacing between successive items.
 */
export function stagger(
  index: number,
  { base = 80, step = 90, duration = 620 }: { base?: number; step?: number; duration?: number } = {},
) {
  return rise(duration, base + index * step)
}
