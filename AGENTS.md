<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI Design Standards

## shadcn/ui Usage

* Use **shadcn/ui** as the default UI component library for all interfaces.
* Prefer existing shadcn/ui components before creating custom ones.
* Compose complex UIs by combining shadcn/ui components rather than building them from scratch.
* Customize components through Tailwind CSS, CSS variables, and the design system instead of modifying the component source unless necessary.
* Maintain consistent spacing, typography, colors, and border radius across the application.
* Follow shadcn/ui accessibility patterns and preserve keyboard navigation and ARIA attributes.
* Use `lucide-react` for icons unless a different icon set is explicitly required.
* Keep components reusable, composable, and easy to maintain.
* Ensure all components are fully responsive, mobile-first, and compatible with both LTR and RTL layouts.
* Avoid introducing additional UI libraries unless explicitly requested. Prefer extending shadcn/ui over mixing multiple design systems.
* When implementing dialogs, sheets, dropdowns, popovers, forms, tables, navigation menus, and other common UI patterns, use the corresponding shadcn/ui components whenever available.
* Ensure all custom components visually match the shadcn/ui design language for a consistent user experience throughout the application.
