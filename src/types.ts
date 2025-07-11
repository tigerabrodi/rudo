import { ComponentProps } from 'react'

export type EasingType =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'
  | 'back'
  | 'cubic-bezier'

export type TriggerType =
  | 'click'
  | 'mouseenter'
  | 'mouseleave'
  | 'focus'
  | 'blur'
  | 'load'

// Trigger interface for ref-based animations
export interface AnimationTrigger {
  type: TriggerType
  target: React.RefObject<SVGElement | HTMLElement>
}

export type CalcMode = 'linear' | 'discrete' | 'paced' | 'spline'

export type FillMode = 'freeze' | 'remove'

// Core animated property interface
export interface AnimatedProperty {
  // Value definitions
  from?: number
  to?: number
  values?: number[]

  // Timing control
  duration: string
  begin?: string | AnimationTrigger
  keyTimes?: number[] // Must match values array length if provided

  // Easing and interpolation
  easing?: EasingType | EasingType[] // Array length must match transitions count
  keySplines?: string // Raw keySplines - overrides easing
  calcMode?: CalcMode

  // Animation behavior
  repeatCount?: number | 'indefinite'
  fill?: FillMode
  restart?: 'always' | 'whenNotActive' | 'never'
}

export interface RectAnimations {
  x?: AnimatedProperty
  y?: AnimatedProperty
  width?: AnimatedProperty
  height?: AnimatedProperty
  rx?: AnimatedProperty
  ry?: AnimatedProperty
  opacity?: AnimatedProperty
  fill?: AnimatedProperty // For color animations (though more complex)
  stroke?: AnimatedProperty
  strokeWidth?: AnimatedProperty
}

export interface CircleAnimations {
  cx?: AnimatedProperty
  cy?: AnimatedProperty
  r?: AnimatedProperty
  opacity?: AnimatedProperty
  fill?: AnimatedProperty
  stroke?: AnimatedProperty
  strokeWidth?: AnimatedProperty
}

export interface LineAnimations {
  x1?: AnimatedProperty
  y1?: AnimatedProperty
  x2?: AnimatedProperty
  y2?: AnimatedProperty
  opacity?: AnimatedProperty
  stroke?: AnimatedProperty
  strokeWidth?: AnimatedProperty
}

export interface PolylineAnimations {
  points?: AnimatedProperty // Note: points animation is complex in SMIL
  opacity?: AnimatedProperty
  fill?: AnimatedProperty
  stroke?: AnimatedProperty
  strokeWidth?: AnimatedProperty
}

// Component prop interfaces extending native SVG props
export interface RectProps extends ComponentProps<'rect'> {
  animate?: RectAnimations
}

export interface CircleProps extends ComponentProps<'circle'> {
  animate?: CircleAnimations
}

export interface LineProps extends ComponentProps<'line'> {
  animate?: LineAnimations
}

export interface PolylineProps extends ComponentProps<'polyline'> {
  animate?: PolylineAnimations
}

export class AnimationValidationError extends Error {
  constructor(message: string, property: string, element: string) {
    super(`Animation validation error for ${element}.${property}: ${message}`)
    this.name = 'AnimationValidationError'
  }
}

// Utility types for internal use
export type AnimationElement = 'rect' | 'circle' | 'line' | 'polyline'

// Configuration for SMIL generation
export interface SMILConfig {
  element: AnimationElement
  property: string
  animation: AnimatedProperty
  elementId?: string // For targeting specific elements
}

// Easing to keySplines mapping type
export type EasingMap = Record<EasingType, string>

// Export all animation interfaces as a union for utility functions
export type AllAnimations =
  | RectAnimations
  | CircleAnimations
  | LineAnimations
  | PolylineAnimations
