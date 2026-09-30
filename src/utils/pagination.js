export const ELLIPSIS = 'ellipsis'

function range(start, end) {
  const items = []
  for (let value = start; value <= end; value++) items.push(value)
  return items
}

// Anchors first/last page and keeps a fixed-size sibling window around the
// current page, collapsing the gaps into a single "…" — the window shifts
// (not shrinks) near either edge, so it's always the same width:
//   near the start:  1 2 3 4 5 … 20
//   in the middle:   1 … 7 8 9 10 11 … 20
//   near the end:    1 … 16 17 18 19 20
export function getPageItems(current, total, siblingCount) {
  const windowSize = siblingCount * 2 + 1
  if (total <= windowSize + 2) return range(1, total)

  const leftSibling = Math.max(current - siblingCount, 1)
  const rightSibling = Math.min(current + siblingCount, total)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < total - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, windowSize), ELLIPSIS, total]
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, ELLIPSIS, ...range(total - windowSize + 1, total)]
  }
  return [1, ELLIPSIS, ...range(leftSibling, rightSibling), ELLIPSIS, total]
}
