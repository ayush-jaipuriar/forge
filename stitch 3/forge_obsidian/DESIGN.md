# Design System Strategy: The Nocturnal Gate

## 1. Overview & Creative North Star
The "Nocturnal Gate" is the Creative North Star for this design system. It moves beyond standard "dark mode" by treating the interface as a physical, sophisticated architectural entry point. The aesthetic is inspired by premium obsidian-glass surfaces and high-end automotive interiors—minimalist but rich in texture.

This system rejects the "flat" web. Instead, it uses **Atmospheric Depth**, where content doesn't just sit on a screen; it emerges from a deep navy abyss through intentional layering, light-catching gradients, and technical precision. We prioritize a "Less, but Better" editorial approach, using expansive negative space to frame high-impact typography and focused call-to-actions.

---

## 2. Colors: Tonal Architecture
Our palette is built on high-contrast drama between deep, ink-like foundations and embers of warmth.

### Core Palette
- **Primary Foundation:** `primary` (#ffb68d) and `primary_container` (#e87b32). These are our "embers"—used to guide the eye and signify action.
- **The Abyss (Neutral):** `surface` (#10131e) and `background` (#10131e). This is the base upon which all layers are built.
- **Accents:** `secondary` (#adc6ff) provides a cool, technical contrast to the warmth of the primary orange.

### The Rules of Surface
*   **The "No-Line" Rule:** Explicitly prohibit the use of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. Use `surface_container_low` for sections and `surface_container` for the background to create distinction.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers.
    *   *Level 0:* `surface_container_lowest` (#0b0e19) - The furthest background.
    *   *Level 1:* `surface` (#10131e) - The standard workspace.
    *   *Level 2:* `surface_container_high` (#262936) - Elevated cards and interactive modules.
*   **The "Glass & Gradient" Rule:** Floating elements should utilize `surface_bright` at 60% opacity with a `backdrop-filter: blur(20px)`. 
*   **Signature Textures:** For primary CTAs, do not use flat fills. Use a linear gradient from `primary` (#ffb68d) to `primary_container` (#e87b32) at a 135-degree angle to provide a metallic, light-catching "soul."

---

## 3. Typography: Editorial Authority
The typographic system utilizes a "High-Contrast Scale." We pair the technical precision of **Space Grotesk** for labels with the approachable luxury of **Plus Jakarta Sans** for displays.

*   **Display (Plus Jakarta Sans):** Oversized and confident. Use `display-lg` (3.5rem) for hero moments to establish immediate authority.
*   **Headlines (Plus Jakarta Sans):** These are the "Entry Gates." `headline-md` (1.75rem) should be used for card titles, providing a clear, bold hierarchy.
*   **Body (Inter):** While headers are expressive, body text must be functional. Use `body-md` (0.875rem) for maximum legibility against dark surfaces.
*   **Labels (Space Grotesk):** These are our "Technical Annotations." Use `label-md` (#0.75rem) in uppercase with a 0.05em letter-spacing for meta-data and small headers like "ENTRY GATE."

---

## 4. Elevation & Depth: Tonal Layering
In this system, shadows are light, and surfaces are volume.

*   **The Layering Principle:** Depth is achieved by "stacking." A card using `surface_container_highest` (#313441) placed on a `surface` (#10131e) background creates a natural lift without structural lines.
*   **Ambient Shadows:** For floating modals, use a shadow with a blur of `40px` and a color of `rgba(0, 0, 0, 0.4)`. The shadow must feel like it is part of the atmosphere, not a drop-shadow effect.
*   **The "Ghost Border" Fallback:** If containment is absolutely required for accessibility, use the `outline_variant` (#564338) at **15% opacity**. This creates a "glint" on the edge of a container rather than a box.
*   **Glassmorphism:** Apply to navigation bars or sidebars. Use `surface_container_low` at 70% opacity with a heavy blur to maintain context of the content underneath.

---

## 5. Components: The Primitive Units

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary_container`), `rounded-md` (0.75rem). Text should be `on_primary_fixed` (#321200) for high contrast.
*   **Tertiary:** No background. Use `primary` text. Upon hover, transition to a subtle `surface_variant` (#313441) background with a 0.2s ease.

### Cards & Modules
*   **Construction:** Use `surface_container_high` (#262936) with `rounded-xl` (1.5rem). 
*   **Spacing:** Content within cards must have generous breathing room (minimum 2rem padding).
*   **Separation:** Forbid the use of horizontal divider lines. Use vertical white space or a shift to `surface_container_highest` for internal sections.

### Input Fields
*   **States:** Default background is `surface_container_lowest` (#0b0e19). Focus state should replace the "ghost border" with a 1px solid `primary` (#ffb68d) glow.
*   **Labels:** Always use `label-md` (Space Grotesk) positioned above the field, never inside.

### Tooltips & Overlays
*   Use `surface_bright` (#363945) with `on_surface` (#e0e1f2) text. Apply a `xl` (1.5rem) corner radius to keep the "soft tech" feel consistent.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `primary` sparingly. It is a "light source" in the dark, not a paint color.
*   **Do** allow elements to overlap slightly (e.g., a card bleeding into a header) to break the rigid grid and create a custom editorial feel.
*   **Do** use high-quality, desaturated imagery that feels "nocturnal" to match the background values.

### Don't
*   **Don't** use pure black (#000000). Always use the `surface` or `background` tokens to keep the depth "inky" rather than "dead."
*   **Don't** use 100% white for body text. Use `on_surface_variant` (#ddc1b3) to reduce eye strain and maintain the sophisticated mood.
*   **Don't** use standard "drop shadows" on small elements like buttons; let the color contrast do the work.