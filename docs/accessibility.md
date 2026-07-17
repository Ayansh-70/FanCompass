# FanCompass Accessibility Documentation

This document outlines the accessibility strategies implemented in the FanCompass frontend, mapped directly to WCAG 2.1 AA criteria.

## 1. Contrast & Color

### WCAG Ratios (1.4.3 Contrast Minimum)
WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text. We exceed this across the board in our cinematic dark theme.

**Current Palette Contrast Calculations:**
- Foreground White text on Background: **18.4:1**
- Primary Cyan text on Background: **10.0:1**
- Primary Cyan text on Hero Background: **10.2:1**
- Primary-Foreground text on Primary Cyan buttons: **9.6:1**
- Muted-Foreground text on Background: **7.6:1**
- Accent-Foreground White text on Accent Purple buttons: **4.7:1** *(Note: This passes WCAG AA requirements, but not AAA)*
- Accent Purple as text on Background: **No longer used as body text.**

### Color is Never the Only Signal (1.4.1 Use of Color)
- Urgency badges (Low, Medium, High) utilize distinct background colors but always include the explicit text label (e.g., "Urgency: HIGH").

## 2. Text Scaling (1.4.4 Resize Text)
A global font-scaling control (`A- / A+`) is provided in the persistent top bar. It adjusts the root `font-size` on the `html` element dynamically (from `-4px` up to `+8px` of the base size). The layout utilizes `rem` units across all padding, margins, and font sizes, ensuring the entire UI scales gracefully without loss of content or functionality.

## 3. Keyboard Navigation (2.1.1 Keyboard)
- **Focus Rings**: A strict `*:focus-visible` rule is applied globally (`outline: 2px solid var(--ring); outline-offset: 4px; box-shadow: 0 0 12px var(--primary-glow);`). Default browser outlines were not removed without this superior replacement.
- **Focus Management**: When the user submits the `SetupWizard` onboarding form, the DOM completely swaps to the `FanChat` component. To prevent the user's focus from dropping to the document `<body>`, we utilize a React `useRef` to explicitly call `.focus()` on the primary "Stadium Assistant" `<h2>` heading the moment the chat view mounts.

## 4. Screen Reader Experience (ARIA)

### Semantic Forms (3.3.1 Error Identification & 3.3.2 Labels or Instructions)
- Checkboxes in the setup view are grouped within a semantic `<fieldset>` and labeled via `<legend>`.
- Form validation errors inject directly into the DOM using a `<div role="alert" aria-live="assertive">` rather than relying on browser `alert()` popups, which can trap keyboard users.
- Every `<input>` element is tied to a corresponding `<label>` using the `htmlFor` and `id` attributes.

### Real-time Announcements (4.1.3 Status Messages)
The chat interface dynamically loads new data from the assistant. Rather than forcing screen readers to parse complex visual structures (like details tags and nested badges) when a message arrives:
1. We utilize a `.sr-only` (visually hidden) `div` with `aria-live="polite"`.
2. When the API returns a response, we synthesize a clean string: *"Assistant says: [Answer]. Recommended Gate is [Gate]. Urgency is [Level]. Accessibility notes: [Notes]."*.
3. This guarantees the screen reader announces the critical routing information cleanly and linearly the moment it arrives.

### Button Labels (4.1.2 Name, Role, Value)
- Icon-only controls utilize descriptive `aria-label`s (e.g., the microphone button is `aria-label="Toggle voice input"`).
- Toggle buttons (Read Aloud) utilize `aria-pressed={isActive}` to convey their active boolean state rather than just relying on visual CSS classes.

---
### Accessible Component Walkthroughs

**Landing Screen (`Landing.tsx`)**
The landing page establishes the app's accessible foundation. The hero section utilizes semantic heading hierarchy (`<h1>` followed by `<h2>`) to clearly outline the page structure. The background visuals include `aria-hidden="true"` to explicitly hide decorative elements (like the compass rings) from screen readers, while all call-to-action buttons use clear, high-contrast text and are fully navigable via the keyboard.

**Setup Wizard (`SetupWizard.tsx`)**
The language selector and accessibility checkboxes in the `SetupWizard` are fully keyboard-navigable. Screen readers announce the grouping of accessibility needs properly via semantic fieldsets. If form submission fails (e.g., missing seat section), an inline error is immediately announced using `aria-live="assertive"`, preventing confusion and ensuring the user knows exactly what to fix before proceeding.

**Staff Dashboard Login (`StaffDashboard.tsx`)**
The staff portal's login screen implements a semantic `<form>` structure with distinct inputs and labels. Any login failure triggers a high-contrast inline error message wrapped in an ARIA alert role, ensuring that failed authentication attempts are automatically brought to the screen reader user's attention without relying on visual-only red text or disruptive browser alerts.

**Chat Interface (`FanChat.tsx`)**
Once setup is complete, focus is immediately forced to the chat heading. When messages arrive from the AI, an invisible `aria-live="polite"` region reads out a linear, clean summary of the route and gate assignment so visually impaired users don't have to manually navigate the complex message bubble structure to find their gate.
