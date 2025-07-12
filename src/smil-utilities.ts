import {
  AllAnimations,
  AnimatedProperty,
  AnimationElement,
  AnimationTrigger,
  AnimationValidationError,
  EasingMap,
  EasingType,
  SMILConfig,
} from './types'

// Easing curves mapped to SMIL keySplines
const EASING_MAP: EasingMap = {
  linear: '0 0 1 1',
  ease: '0.25 0.1 0.25 1',
  'ease-in': '0.42 0 1 1',
  'ease-out': '0 0 0.58 1',
  'ease-in-out': '0.42 0 0.58 1',
  bounce: '0.68 -0.55 0.265 1.55',
  elastic: '0.175 0.885 0.32 1.275',
  back: '0.68 -0.55 0.265 1.55',
  'cubic-bezier': '0.25 0.1 0.25 1', // Default, users should provide custom keySplines
}

/**
 * Convert easing name(s) to keySplines string
 * @example
 * ```ts
 * easingToKeySplines('ease') // '0.25 0.1 0.25 1'
 * easingToKeySplines(['ease', 'ease-in']) // '0.25 0.1 0.25 1; 0.42 0 1 1'
 * ```
 */
function easingToKeySplines(easing: EasingType | EasingType[]): string {
  if (Array.isArray(easing)) {
    return easing.map((e) => EASING_MAP[e]).join('; ')
  }
  return EASING_MAP[easing]
}

/**
 * Validate animation configuration
 * @example
 * ```ts
 * validateAnimation({
 *   property: 'x',
 *   animation: { from: 0, to: 100, duration: '1s' },
 *   element: 'rect'
 * })
 * ```
 */
function validateAnimation({
  property,
  animation,
  element,
}: {
  property: string
  animation: AnimatedProperty
  element: string
}): void {
  const { values, easing, keyTimes } = animation

  // If values array is provided, validate related arrays
  if (values) {
    const transitionCount = values.length - 1

    // Validate easing array length
    if (Array.isArray(easing) && easing.length !== transitionCount) {
      throw new AnimationValidationError(
        `Easing array length (${easing.length}) must match number of transitions (${transitionCount})`,
        property,
        element
      )
    }

    // Validate keyTimes array length
    if (keyTimes && keyTimes.length !== values.length) {
      throw new AnimationValidationError(
        `keyTimes array length (${keyTimes.length}) must match values array length (${values.length})`,
        property,
        element
      )
    }

    // Validate keyTimes values are between 0 and 1 and ascending
    if (keyTimes) {
      for (let i = 0; i < keyTimes.length; i++) {
        if (keyTimes[i] < 0 || keyTimes[i] > 1) {
          throw new AnimationValidationError(
            `keyTimes values must be between 0 and 1, got ${keyTimes[i]} at index ${i}`,
            property,
            element
          )
        }
        if (i > 0 && keyTimes[i] <= keyTimes[i - 1]) {
          throw new AnimationValidationError(
            `keyTimes values must be in ascending order`,
            property,
            element
          )
        }
      }

      // First value must be 0, last must be 1
      if (keyTimes[0] !== 0) {
        throw new AnimationValidationError(
          `First keyTimes value must be 0, got ${keyTimes[0]}`,
          property,
          element
        )
      }
      if (keyTimes[keyTimes.length - 1] !== 1) {
        throw new AnimationValidationError(
          `Last keyTimes value must be 1, got ${keyTimes[keyTimes.length - 1]}`,
          property,
          element
        )
      }
    }
  }

  // Validate that we have either from/to or values
  if (
    !animation.values &&
    (animation.from === undefined || animation.to === undefined)
  ) {
    throw new AnimationValidationError(
      `Animation must have either 'values' array or both 'from' and 'to' properties`,
      property,
      element
    )
  }
}

/**
 * Convert trigger to SMIL begin attribute value
 * @param trigger - The animation trigger configuration
 * @param targetElementId - The ID of the target element
 * @returns The SMIL begin attribute value
 * @example
 * ```ts
 * triggerToBeginValue({
 *   trigger: { type: 'click', target: buttonRef },
 *   targetElementId: 'myButton'
 * }) // 'myButton.click'
 * ```
 */
function triggerToBeginValue({
  trigger,
  targetElementId,
}: {
  trigger: AnimationTrigger
  targetElementId: string
}): string {
  const { type } = trigger

  // If we have a target element with an ID, use it
  return `${targetElementId}.${type}`
}

/**
 * Generate SMIL animate element
 * @param config - The SMIL animation configuration
 * @returns The generated SMIL animate element as a string
 * @example
 * ```ts
 * const smilElement = generateSMILAnimation({
 *   element: 'rect',
 *   property: 'x',
 *   animation: {
 *     id: 'move-x',
 *     from: 0,
 *     to: 100,
 *     duration: '2s',
 *     easing: 'ease-in-out'
 *   },
 *   elementId: 'myRect'
 * })
 * // '<animate id="move-x" attributeName="x" dur="2s" from="0" to="100" keySplines="0.42 0 0.58 1" calcMode="spline" />'
 * ```
 */
export function generateSMILAnimation(config: SMILConfig): string {
  const { element, property, animation, elementId } = config

  validateAnimation({ property, animation, element })

  const {
    from,
    to,
    values,
    duration,
    begin,
    keyTimes,
    easing,
    keySplines,
    calcMode,
    repeatCount,
    fill,
    restart,
  } = animation

  // Build SMIL attributes
  const attributes: string[] = [
    `id="${animation.id}"`,
    `attributeName="${property}"`,
    `dur="${duration}"`,
  ]

  // Values or from/to
  if (values) {
    attributes.push(`values="${values.join(';')}"`)
  } else {
    if (from !== undefined) attributes.push(`from="${from}"`)
    if (to !== undefined) attributes.push(`to="${to}"`)
  }

  // Begin attribute
  if (begin) {
    if (typeof begin === 'string') {
      attributes.push(`begin="${begin}"`)
    } else {
      // Handle trigger object
      const beginValue = triggerToBeginValue({
        trigger: begin,
        targetElementId: elementId,
      })
      attributes.push(`begin="${beginValue}"`)
    }
  }

  // KeyTimes
  if (keyTimes) {
    attributes.push(`keyTimes="${keyTimes.join(';')}"`)
  }

  // Easing/KeySplines
  if (keySplines) {
    // User provided raw keySplines
    attributes.push(`keySplines="${keySplines}"`)
    attributes.push(`calcMode="spline"`)
  } else if (easing) {
    // Convert easing to keySplines
    const splines = easingToKeySplines(easing)
    attributes.push(`keySplines="${splines}"`)
    attributes.push(`calcMode="spline"`)
  }

  // CalcMode (if not already set by easing)
  if (calcMode && !keySplines && !easing) {
    attributes.push(`calcMode="${calcMode}"`)
  }

  // Repeat count
  if (repeatCount !== undefined) {
    attributes.push(`repeatCount="${repeatCount}"`)
  }

  // Fill mode
  if (fill) {
    attributes.push(`fill="${fill}"`)
  }

  // Restart behavior
  if (restart) {
    attributes.push(`restart="${restart}"`)
  }

  return `<animate ${attributes.join(' ')} />`
}

/**
 * Generate all animations for an element
 * @param element - The SVG element type
 * @param animations - All animations configuration for the element
 * @param elementId - The ID of the element
 * @returns Array of SMIL animation elements as strings
 * @example
 * ```ts
 * const animations = generateElementAnimations({
 *   element: 'rect',
 *   animations: {
 *     x: { id: 'move-x', from: 0, to: 100, duration: '2s' },
 *     y: { id: 'move-y', from: 0, to: 50, duration: '1s' }
 *   },
 *   elementId: 'myRect'
 * })
 * // ['<animate id="move-x" attributeName="x" dur="2s" from="0" to="100" />', '<animate id="move-y" attributeName="y" dur="1s" from="0" to="50" />']
 * ```
 */
export function generateElementAnimations({
  element,
  animations,
  elementId,
}: {
  element: string
  animations: AllAnimations
  elementId: string
}): string[] {
  const animationElements: string[] = []

  for (const [property, animation] of Object.entries(animations)) {
    try {
      const smilConfig: SMILConfig = {
        element: element as AnimationElement,
        property,
        animation,
        elementId,
      }

      const animationElement = generateSMILAnimation(smilConfig)
      animationElements.push(animationElement)
    } catch (error) {
      // Re-throw with more context
      if (error instanceof AnimationValidationError) {
        throw error
      }
      throw new AnimationValidationError(
        `Failed to generate animation: ${error}`,
        property,
        element
      )
    }
  }

  return animationElements
}

/**
 * Helper to extract trigger references from animations
 * @param animations - All animations configuration
 * @returns Set of React refs used as animation triggers
 * @example
 * ```ts
 * const buttonRef = useRef<HTMLButtonElement>(null)
 * const animations = {
 *   x: {
 *     id: 'move-x',
 *     from: 0,
 *     to: 100,
 *     duration: '2s',
 *     begin: { type: 'click', target: buttonRef }
 *   }
 * }
 * const triggerRefs = extractTriggerRefs(animations)
 * // Set containing buttonRef
 * ```
 */
export function extractTriggerRefs(
  animations: AllAnimations
): Set<React.RefObject<SVGElement | HTMLElement>> {
  const triggerRefs = new Set<React.RefObject<SVGElement | HTMLElement>>()

  for (const animation of Object.values(animations)) {
    if (animation.begin && typeof animation.begin !== 'string') {
      triggerRefs.add(animation.begin.target)
    }
  }

  return triggerRefs
}

/**
 * Helper to assign IDs to trigger target elements
 * @param element - The HTML or SVG element to ensure has an ID
 * @returns The element's ID (existing or newly generated)
 * @example
 * ```ts
 * const buttonElement = document.querySelector('button')
 * const elementId = ensureElementId(buttonElement)
 * // If button had id="myButton", returns "myButton"
 * // If button had no id, generates and assigns unique ID like "smil-trigger-1640995200000-abc123def"
 * ```
 */
export function ensureElementId(element: HTMLElement | SVGElement): string {
  if (element.id) {
    return element.id
  }

  // Generate unique ID
  const id = `smil-trigger-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`
  element.id = id
  return id
}

/**
 * Utility to check if browser supports SMIL
 * @returns True if the browser supports SMIL animations, false otherwise
 * @example
 * ```ts
 * if (supportsSMIL()) {
 *   console.log('Browser supports SMIL animations')
 *   // Proceed with SMIL animations
 * } else {
 *   console.log('Browser does not support SMIL, use fallback')
 *   // Use CSS animations or other fallback
 * }
 * ```
 */
export function supportsSMIL(): boolean {
  const animate = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'animate'
  )
  return typeof animate.beginElement === 'function'
}

// Export validation function for external use
export { validateAnimation }
