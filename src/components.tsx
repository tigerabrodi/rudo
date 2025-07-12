import React, { useEffect, useRef } from 'react'
import {
  ensureElementId,
  extractTriggerRefs,
  generateElementAnimations,
  supportsSMIL,
} from './smil-utilities'
import {
  AllAnimations,
  CircleProps,
  LineProps,
  PathProps,
  PolylineProps,
  RectProps,
} from './types'

// Generic animated SVG component logic
function useAnimatedElement<T extends SVGElement>({
  elementType,
  animations,
}: {
  elementType: string
  animations?: AllAnimations
}) {
  const elementRef = useRef<T>(null)
  const triggerRefs: Set<React.RefObject<SVGElement | HTMLElement>> = animations
    ? extractTriggerRefs(animations)
    : new Set()

  useEffect(() => {
    if (!animations || !elementRef.current || !supportsSMIL()) {
      return
    }

    const element = elementRef.current
    let elementId = element.id

    if (!elementId) {
      elementId = ensureElementId(element)
    }

    // Ensure trigger target elements have IDs
    triggerRefs.forEach((ref) => {
      if (ref.current) {
        ensureElementId(ref.current)
      }
    })

    try {
      // Generate SMIL animation elements
      const animationElements = generateElementAnimations({
        element: elementType,
        animations,
        elementId,
      })

      // Insert animations into the SVG element
      animationElements.forEach((animationHTML) => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = animationHTML
        const animationElement = tempDiv.firstChild as Element
        if (animationElement) {
          element.appendChild(animationElement)
        }
      })

      // Cleanup function
      return () => {
        // Remove all animate elements from this component
        const animateElements = element.querySelectorAll('animate')
        animateElements.forEach((el) => el.remove())
      }
    } catch (error) {
      console.error(`Failed to setup animations for ${elementType}:`, error)
    }
  }, [elementType, animations, triggerRefs])

  return elementRef
}

// Rect component
export const Rect = ({ animate, ...props }: RectProps) => {
  const ref = useAnimatedElement<SVGRectElement>({
    elementType: 'rect',
    animations: animate,
  })

  return <rect {...props} ref={ref} />
}

// Circle component
export const Circle = ({ animate, ...props }: CircleProps) => {
  const ref = useAnimatedElement<SVGCircleElement>({
    elementType: 'circle',
    animations: animate,
  })

  return <circle {...props} ref={ref} />
}

// Line component
export const Line = ({ animate, ...props }: LineProps) => {
  const ref = useAnimatedElement<SVGLineElement>({
    elementType: 'line',
    animations: animate,
  })

  return <line {...props} ref={ref} />
}

// Polyline component
export const Polyline = ({ animate, ...props }: PolylineProps) => {
  const ref = useAnimatedElement<SVGPolylineElement>({
    elementType: 'polyline',
    animations: animate,
  })

  return <polyline {...props} ref={ref} />
}

/**
 * PathBuilder class for fluent SVG path construction.
 *
 * This class provides a fluent API for building SVG path data strings.
 * It is designed to be used in conjunction with the <Path> component for a concise and expressive experience.
 *
 * @example
 * ```tsx
 * <Path
 *   stroke="blue"
 *   fill="none"
 *   animate={{
 *     strokeDashoffset: { from: 100, to: 0, duration: '2s', id: 'draw' }
 *   }}
 * >
 *   {path =>
 *     path
 *       .moveTo({ x: 10, y: 10 })
 *       .quadraticCurve({ control: { x: 50, y: 50 }, end: { x: 100, y: 10 } })
 *       .close()
 *   }
 * </Path>
 * ```
 */
class PathBuilder {
  private commands: string[] = []

  moveTo({ x, y }: { x: number; y: number }) {
    this.commands.push(`M ${x},${y}`)
    return this
  }

  lineTo({ x, y }: { x: number; y: number }) {
    this.commands.push(`L ${x},${y}`)
    return this
  }

  quadraticCurve({
    control,
    end,
  }: {
    control: { x: number; y: number }
    end: { x: number; y: number }
  }) {
    this.commands.push(`Q ${control.x},${control.y} ${end.x},${end.y}`)
    return this
  }

  cubicCurve({
    control1,
    control2,
    end,
  }: {
    control1: { x: number; y: number }
    control2: { x: number; y: number }
    end: { x: number; y: number }
  }) {
    this.commands.push(
      `C ${control1.x},${control1.y} ${control2.x},${control2.y} ${end.x},${end.y}`
    )
    return this
  }

  arc({
    rx,
    ry,
    rotation = 0,
    largeArc = false,
    sweep = false,
    end,
  }: {
    rx: number
    ry: number
    rotation?: number
    largeArc?: boolean
    sweep?: boolean
    end: { x: number; y: number }
  }) {
    const largeFlag = largeArc ? 1 : 0
    const sweepFlag = sweep ? 1 : 0
    this.commands.push(
      `A ${rx},${ry} ${rotation} ${largeFlag},${sweepFlag} ${end.x},${end.y}`
    )
    return this
  }

  horizontalLine({ x }: { x: number }) {
    this.commands.push(`H ${x}`)
    return this
  }

  verticalLine({ y }: { y: number }) {
    this.commands.push(`V ${y}`)
    return this
  }

  close() {
    this.commands.push('Z')
    return this
  }

  build() {
    return this.commands.join(' ')
  }
}

export const Path = ({
  animate,
  children,
  ...props
}: PathProps & {
  children?: (builder: PathBuilder) => PathBuilder
}) => {
  const ref = useAnimatedElement<SVGPathElement>({
    elementType: 'path',
    animations: animate,
  })

  // Generate d attribute from fluent API if children provided
  const pathData = children ? children(new PathBuilder()).build() : props.d

  return <path {...props} d={pathData} ref={ref} />
}
