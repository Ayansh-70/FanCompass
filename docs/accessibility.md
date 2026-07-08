# FanCompass Accessibility Documentation

This document outlines the accessibility strategies implemented in the FanCompass frontend, mapped directly to WCAG 2.1 AA criteria.

## 1. Contrast & Color

### High-Contrast Mode & WCAG Ratios (1.4.3 Contrast Minimum)
WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text. We exceed this in both our standard theme and our explicit High Contrast mode. 

**Standard Theme Calculations:**
- Background (`#0f172a`, Luminance ~0.007) vs Primary Text (`#f8fafc`, Luminance ~0.95): **~17.4:1**
- Background (`#0f172a`, Luminance ~0.007) vs Secondary Text (`#cbd5e1`, Luminance ~0.65): **~12.2:1**

**High Contrast Theme Calculations:**
- Background (`#000000`, Luminance 0) vs Primary Text (`#ffffff`, Luminance 1): **21:1**
- Background (`#000000`, Luminance 0) vs Accent/Secondary Text (`#ffff00`, Luminance 0.927): **19.5:1**

*Both themes achieve and exceed WCAG AAA standards (7:1).*

### Color is Never the Only Signal (1.4.1 Use of Color)
- Urgency badges (Low, Medium, High) utilize distinct background colors but always include the explicit text label (e.g., "Urgency: HIGH").
- The High Contrast toggle explicitly changes text styling and includes `aria-pressed`.

## 2. Text Scaling (1.4.4 Resize Text)
A global font-scaling control (`A- / A+`) is provided in the persistent top bar. It adjusts the root `font-size` on the `html` element dynamically (from `-4px` up to `+8px` of the base size). The layout utilizes `rem` units across all padding, margins, and font sizes, ensuring the entire UI scales gracefully without loss of content or functionality.

## 3. Keyboard Navigation (2.1.1 Keyboard)
- **Focus Rings**: A strict `*:focus-visible` rule is applied globally (`outline: 3px solid var(--accent-color); outline-offset: 2px;`). Default browser outlines were not removed without this superior replacement.
- **Focus Management**: When the user submits the `ContextSetup` onboarding form, the DOM completely swaps to the `FanChat` component. To prevent the user's focus from dropping to the document `<body>`, we utilize a React `useRef` to explicitly call `.focus()` on the primary "Stadium Assistant" `<h2>` heading the moment the chat view mounts.

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
- Toggle buttons (High Contrast, Read Aloud) utilize `aria-pressed={isActive}` to convey their active boolean state rather than just relying on visual CSS classes.

---
### Simulated Screen Reader Walkthrough (VoiceOver/NVDA)
1. **Entering the App**: User tabs into the `<select>` for Language. Screen reader announces *"Language, pop-up button, English"*.
2. **Checkboxes**: User tabs to the accessibility grid. Screen reader announces *"Accessibility Needs, group. Wheelchair, checkbox, unchecked"*. Spacebar toggles it. *"Checked"*.
3. **Submit Error**: User submits without a seat section. The inline error renders. Screen reader announces immediately: *"Alert: Please enter a seat section."*
4. **Transition to Chat**: User inputs seat and submits. The view swaps. Focus is immediately forced to the heading. Screen reader announces *"Heading level 2, Stadium Assistant"*.
5. **Receiving a Message**: User types "Where is my seat?" and sends. Loading spinner appears. When the response arrives, the `aria-live` region updates. Screen reader automatically announces over the background: *"Assistant says: To reach your seat, please head towards Gate G6. Recommended Gate is G6. Urgency is high."*
