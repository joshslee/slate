import { produce } from 'immer'
import isPlainObject from 'is-plain-object'
import { Operation, Path, Point } from '..'

/**
 * `Range` objects are a set of points that refer to a specific span of a Slate
 * document. They can define a span inside a single node or a can span across
 * multiple nodes.
 */

interface Range {
  anchor: Point
  focus: Point
  [key: string]: any
}

namespace Range {
  export const start = (range: Range): Point => {
    const [start] = Range.edges(range)
    return start
  }

  export const end = (range: Range): Point => {
    const [, end] = Range.edges(range)
    return end
  }

  export const intersection = (range: Range, another: Range): Range | null => {
    const { anchor, focus, ...rest } = range
    const [s1, e1] = Range.edges(range)
    const [s2, e2] = Range.edges(another)
    const start = Point.isBefore(s1, s2) ? s2 : s1
    const end = Point.isBefore(e1, e2) ? e1 : e2

    if (Point.isBefore(end, start)) {
      return null
    } else {
      return { anchor: start, focus: end, ...rest }
    }
  }

  /**
   * Check if a range is exactly equal to another.
   */

  export const equals = (range: Range, another: Range): boolean => {
    return (
      Point.equals(range.anchor, another.anchor) &&
      Point.equals(range.focus, another.focus)
    )
  }

  /**
   * Check if a range exists in a list or map of ranges.
   */

  export const exists = (
    range: Range,
    target: Range[] | Record<string, Range>
  ): boolean => {
    if (Range.isRangeList(target)) {
      return !!target.find(r => Range.equals(r, range))
    }

    if (Range.isRangeMap(target)) {
      for (const key in target) {
        if (Range.equals(range, target[key])) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Check if a range includes a path, a point or part of another range.
   */

  export const includes = (
    range: Range,
    target: Path | Point | Range
  ): boolean => {
    if (Range.isRange(target)) {
      if (
        Range.includes(range, target.anchor) ||
        Range.includes(range, target.focus)
      ) {
        return true
      }

      const [rs, re] = Range.edges(range)
      const [ts, te] = Range.edges(target)
      return Point.isBefore(rs, ts) && Point.isAfter(re, te)
    }

    const [start, end] = Range.edges(range)
    let isAfterStart = false
    let isBeforeEnd = false

    if (Point.isPoint(target)) {
      isAfterStart = Point.compare(target, start) >= 0
      isBeforeEnd = Point.compare(target, end) <= 0
    } else {
      isAfterStart = Path.compare(target, start.path) >= 0
      isBeforeEnd = Path.compare(target, end.path) <= 0
    }

    return isAfterStart && isBeforeEnd
  }

  /**
   * Check if a range is backward, meaning that its anchor point appears in the
   * document _after_ its focus point.
   */

  export const isBackward = (range: Range): boolean => {
    const { anchor, focus } = range
    return Point.isAfter(anchor, focus)
  }

  /**
   * Check if a range is collapsed, meaning that both its anchor and focus
   * points refer to the exact same position in the document.
   */

  export const isCollapsed = (range: Range): boolean => {
    const { anchor, focus } = range
    return Point.equals(anchor, focus)
  }

  /**
   * Check if a range is expanded.
   *
   * This is the opposite of [[Range.isCollapsed]] and is provided for legibility.
   */

  export const isExpanded = (range: Range): boolean => {
    return !isCollapsed(range)
  }

  /**
   * Check if a range is forward.
   *
   * This is the opposite of [[Range.isBackward]] and is provided for legibility.
   */

  export const isForward = (range: Range): boolean => {
    return !isBackward(range)
  }

  /**
   * Check if a value implements the [[Range]] interface.
   */

  export const isRange = (value: any): value is Range => {
    return (
      isPlainObject(value) &&
      Point.isPoint(value.anchor) &&
      Point.isPoint(value.focus)
    )
  }

  /**
   * Check if a value is an array of `Range` objects.
   */

  export const isRangeList = (value: any): value is Range[] => {
    return (
      Array.isArray(value) && (value.length === 0 || Range.isRange(value[0]))
    )
  }

  /**
   * Check if a value is a map of `Range` objects.
   */

  export const isRangeMap = (value: any): value is Record<string, Range> => {
    if (!isPlainObject(value)) {
      return false
    }

    for (const key in value) {
      return Range.isRange(value[key])
    }

    return true
  }

  /**
   * Get the start and end points of a range, in the order in which they appear
   * in the document.
   */

  export const edges = (
    range: Range,
    options: {
      reverse?: boolean
    } = {}
  ): [Point, Point] => {
    const { reverse = false } = options
    const { anchor, focus } = range
    return Range.isBackward(range) === reverse
      ? [anchor, focus]
      : [focus, anchor]
  }

  /**
   * Transform a range by an operation.
   */

  export const transform = (
    range: Range,
    op: Operation,
    options: { affinity: 'forward' | 'backward' | 'outward' | 'inward' | null }
  ): Range | null => {
    const { affinity = 'inward' } = options
    let affinityAnchor: 'forward' | 'backward' | null
    let affinityFocus: 'forward' | 'backward' | null

    if (affinity === 'inward') {
      if (Range.isForward(range)) {
        affinityAnchor = 'forward'
        affinityFocus = 'backward'
      } else {
        affinityAnchor = 'backward'
        affinityFocus = 'forward'
      }
    } else if (affinity === 'outward') {
      if (Range.isForward(range)) {
        affinityAnchor = 'backward'
        affinityFocus = 'forward'
      } else {
        affinityAnchor = 'forward'
        affinityFocus = 'backward'
      }
    } else {
      affinityAnchor = affinity
      affinityFocus = affinity
    }

    return produce(range, r => {
      const anchor = Point.transform(r.anchor, op, { affinity: affinityAnchor })
      const focus = Point.transform(r.focus, op, { affinity: affinityFocus })

      if (!anchor || !focus) {
        return null
      }

      r.anchor = anchor
      r.focus = focus
    })
  }
}

export { Range }
