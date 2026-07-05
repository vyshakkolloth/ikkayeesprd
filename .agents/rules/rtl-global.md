---
trigger: manual
---

# Antigravity Design System: Global Architecture Rules (Tailwind CSS Edition)

This document outlines the foundational, non-negotiable rules for modifying the Antigravity Design System using Tailwind CSS. Every design update, component refactor, or layout adjustment must strictly adhere to these principles to maintain visual harmony, structural integrity, and global accessibility.

---

## 1. The Global Rule of Design Modification
> **The Ripple Effect Rule:** No component or style variation shall be designed or coded in isolation. 

Whenever a design change is introduced, you must evaluate its impact across the entire ecosystem based on the following three pillars:
* **Token-First Dependency:** Never use arbitrary values (e.g., avoid `bg-[#333333]` or `p-[16px]`). You must utilize configuration-defined utility classes (e.g., `bg-neutral-800`, `p-4`). If a core Tailwind config value changes, all inheriting components must be visually verified.
* **Backward Compatibility:** Changes to foundational utility compositions must not break existing layouts. If a radical shift is required, introduce it as a new component variant class rather than overwriting core global styles.
* **Accessibility (A11y) Guardrail:** Any color, typography, or interactive state change must maintain a minimum contrast ratio of **4.5:1** for normal text and **3:1** for large text (WCAG AA compliance).

---

## 2. Mobile-First Responsiveness Rules

Antigravity employs Tailwind’s strict **Mobile-First** layout philosophy. Write the base classes for the smallest screens first, then layer on complexity using responsive modifiers.

### Fluid Layout Constraints
* **Breakpoints:** Standardize layout shifts using Tailwind's core responsive prefixes:
    * Base (no prefix): Mobile portrait (`< 640px`)
    * `sm:`: `640px` (Mobile landscape / small tablets)
    * `md:`: `768px` (Tablets)
    * `lg:`: `1024px` (Desktops)
    * `xl:`: `1280px` (Large monitors)
* **Touch Targets:** All interactive elements (buttons, links, form inputs) on mobile viewports must have a minimum interactive surface area of **48px × 48px**. Use utilities like `h-12 w-12` or explicitly set padding (e.g., `px-4 py-3`) to guarantee a compliant hit target regardless of visual size.
* **Flexibility Over Fixation:** Never use fixed widths on layout containers (avoid `w-[400px]`). Use fluid classes, max-widths, and percentages (e.g., `w-full max-w-md` or `w-1/2`) to ensure content gracefully scales without horizontal scrolling.

---

## 3. Bi-Directional & RTL (Right-to-Left) Rules

To support global audiences, layouts must seamlessly flip when switching from LTR (Left-to-Right) to RTL languages (such as Arabic or Hebrew). Tailwind natively supports directionality through logical properties and the `rtl:` modifier.

### The Logical Properties Mandate
Do not use directional physical properties (left/right utilities). You must use Tailwind's **Logical Property utilities** so the browser adjusts rendering automatically based on the HTML `dir="rtl"` attribute.

| Avoid This (Physical) | Use This (Logical Tailwind) | Description |
| :--- | :--- | :--- |
| `ml-4` (margin-left) | `ms-4` (margin-inline-start) | Margins adjust automatically |
| `pr-6` (padding-right) | `pe-6` (padding-inline-end) | Padding adjusts automatically |
| `left-0` | `start-0` | Absolute positioning flips sides |
| `text-left` | `text-start` | Text aligns to the reading origin |
| `border-r` | `border-e` | Outer border flips from right to left |

### Iconography and Directional Exceptions
* **Symmetric Icons:** Do not flip abstract shapes, branding logos, or symmetric icons (e.g., share icons, download buttons).
* **Directional Icons:** Icons indicating movement, progression, or time (e.g., back/forward arrows, sliders, undo/redo) **must** be mirrored in RTL mode using Tailwind’s `rtl:` modifier:
    ```html
    <svg class="w-6 h-6 rtl:-scale-x-100" ...></svg>
    ```
* **Media Controls:** Audio and video playback bars always progress from left to right globally, as they represent the physical passage of time, not text directionality. Do not apply `rtl:` modifiers or logical directional properties to media tracking wrappers.