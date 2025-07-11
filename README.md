# Rudo

A modern SMIL animation library for React. Write beautiful SVG animations without the SMIL syntax hell.

## ✨ Features

- 🎯 **4 Animated SVG Components** -> Rect, Circle, Line, and Polyline with animation props
- 🚀 **Native SMIL Power** -> Leverages browser's native SVG animation engine for smooth performance
- 🎨 **9 Built-in Easings** -> From linear to bounce, with automatic keySplines conversion
- 📦 **Type-Safe** -> Fully typed API with literal unions and ComponentProps inheritance
- 🔗 **Ref-Based Triggers** -> Connect animations to user interactions without ID management
- ⚡ **Zero Dependencies** -> Pure React with native browser APIs
- 🛡️ **Runtime Validation** -> Helpful error messages for animation configuration

## 📦 Installation

```bash
npm install @tigerabrodioss/rudo
```

## 🚀 Usage

```tsx
import { Rect } from '@tigerabrodioss/rudo'
import { useRef } from 'react'

function AnimatedCard() {
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div>
      <svg viewBox="0 0 200 100">
        <Rect
          x={10}
          y={10}
          width={50}
          height={50}
          fill="blue"
          animate={{
            width: {
              id: 'expand',
              from: 50,
              to: 150,
              duration: '0.6s',
              easing: 'bounce',
              begin: { type: 'click', target: buttonRef },
            },
          }}
        />
      </svg>
      <button ref={buttonRef}>Click to expand!</button>
    </div>
  )
}
```

## 🎭 Components & Easings

**Components:** `Rect` | `Circle` | `Line` | `Polyline`

**Easings:** `linear` | `ease` | `ease-in` | `ease-out` | `ease-in-out` | `bounce` | `elastic` | `back` | `cubic-bezier`

## 📖 API

### Component Props

All components extend native SVG props and add an `animate` prop:

```tsx
<Rect
  x={10}
  y={10}
  width={50}
  height={50} // Native SVG props
  animate={{
    // Animation config
    width: { id: 'expand', from: 50, to: 100, duration: '1s' },
    opacity: { id: 'fade', from: 1, to: 0.5, duration: '0.5s' },
  }}
/>
```

### Animation Properties

```tsx
{
  id: string;                    // Required: unique animation identifier
  from?: number;                 // Start value
  to?: number;                   // End value
  values?: number[];             // Multi-step animation values
  duration: string;              // Animation duration (e.g., "1s", "500ms")
  begin?: string | {             // When to start
    type: "click" | "mouseenter" | "mouseleave" | "focus" | "blur";
    target: React.RefObject<Element>;
  };
  easing?: EasingType | EasingType[];  // Easing function(s)
  keyTimes?: number[];           // Custom timing for values
  repeatCount?: number | "indefinite";
  fill?: "freeze" | "remove";
}
```

## 🌐 Browser Support

Works in all browsers that support SMIL animations. See [caniuse.com/svg-smil](https://caniuse.com/svg-smil).

## 📄 License

MIT License.
