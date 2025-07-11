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
