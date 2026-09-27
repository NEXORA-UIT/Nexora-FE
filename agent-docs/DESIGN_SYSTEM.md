# Nexora Frontend — Design System

## 1. Status

This document is the single source of truth for Nexora visual foundations.

Do not introduce a second design system.

---

# 2. Typography

## Font Family

```css
font-family: Inter, sans-serif;
```

Inter is the only approved typeface.

## Supported Weights

| Weight | Usage    |
| ------ | -------- |
| 400    | Regular  |
| 500    | Medium   |
| 600    | Semibold |
| 700    | Bold     |

## Typography Scale

| Token        | Size / Line Height | Weight |
| ------------ | -----------------: | -----: |
| Display      |            32 / 40 |    700 |
| H1           |            28 / 36 |    700 |
| H2           |            24 / 32 |    600 |
| H3           |            20 / 28 |    600 |
| H4           |            16 / 24 |    600 |
| Body Large   |            16 / 24 |    400 |
| Body         |            14 / 20 |    400 |
| Body Medium  |            14 / 20 |    500 |
| Small        |            12 / 16 |    400 |
| Small Medium |            12 / 16 |    500 |

---

# 3. Primary Color

Primary brand:

```text
#2563EB
```

## Primary Scale

| Token       | Value   |
| ----------- | ------- |
| primary-50  | #EFF6FF |
| primary-100 | #DBEAFE |
| primary-200 | #BFDBFE |
| primary-300 | #93C5FD |
| primary-400 | #60A5FA |
| primary-500 | #2563EB |
| primary-600 | #1D4ED8 |
| primary-700 | #1E40AF |
| primary-800 | #1E3A8A |
| primary-900 | #172554 |

Primary 500 is the main CTA color.

Primary 600 is the hover state.

Primary 700 is the pressed state.

---

# 4. Neutral Colors

| Token       | Value   |
| ----------- | ------- |
| neutral-50  | #F9FAFB |
| neutral-100 | #F3F4F6 |
| neutral-200 | #E5E7EB |
| neutral-300 | #D1D5DB |
| neutral-400 | #9CA3AF |
| neutral-500 | #6B7280 |
| neutral-600 | #4B5563 |
| neutral-700 | #374151 |
| neutral-800 | #1F2937 |
| neutral-900 | #111827 |

## Surface

```text
White: #FFFFFF
Page background: #F9FAFB
```

---

# 5. Text

Primary text:

```text
#111827
```

Secondary text:

```text
#6B7280
```

Muted text:

```text
#9CA3AF
```

---

# 6. Semantic Colors

## Success

```text
success-500: #16A34A
```

Used for:

* On Track
* Done
* successful operations

## Error

```text
error-500: #DC2626
```

Used for:

* Overdue
* Blocker
* destructive actions

## Warning

```text
warning-500: #D97706
```

Used for:

* At Risk
* Review
* dependency warnings

## Info

```text
info-500: #2563EB
```

Used for:

* In Progress
* informational state
* AI suggestions
* processing state

---

# 7. Priority Mapping

Priority must reuse semantic tokens.

| Priority | Color family    |
| -------- | --------------- |
| Low      | Neutral         |
| Medium   | Info / Blue     |
| High     | Warning / Amber |
| Urgent   | Error / Red     |

Do not create custom priority colors.

---

# 8. Spacing

The entire interface follows a 4px baseline.

Approved spacing:

| Token    | Value |
| -------- | ----: |
| space-1  |   4px |
| space-2  |   8px |
| space-3  |  12px |
| space-4  |  16px |
| space-6  |  24px |
| space-8  |  32px |
| space-10 |  40px |
| space-12 |  48px |
| space-16 |  64px |

Do not introduce arbitrary spacing values.

---

# 9. Border Radius

| Token       |  Value |
| ----------- | -----: |
| radius-sm   |    6px |
| radius-md   |    8px |
| radius-lg   |   12px |
| radius-xl   |   16px |
| radius-full | 9999px |

Use:

* 6px for compact controls/chips
* 8px for buttons/inputs
* 12px for cards/panels
* 16px for large dialogs
* full for avatars/pills

---

# 10. Zero Gradient Rule

Gradients are prohibited.

Do not use:

```css
linear-gradient(...)
radial-gradient(...)
conic-gradient(...)
```

Do not introduce gradient backgrounds as decorative effects.

Use solid colors and subtle borders/surfaces.

---

# 11. Buttons

Default radius:

```text
8px
```

States:

* Default
* Hover
* Pressed
* Disabled
* Destructive

Primary:

```text
background: primary-500
```

Hover:

```text
background: primary-600
```

Pressed:

```text
background: primary-700
```

---

# 12. Inputs

States:

* Default
* Focus
* Error
* Disabled

Default border:

```text
neutral-300
```

Focus:

```text
primary-500
```

Error:

```text
error-500
```

Disabled:

```text
neutral-100
```

---

# 13. Navigation

Navigation uses:

* neutral default states
* primary blue for active states
* primary-50 for active backgrounds where appropriate

Avoid excessive color.

---

# 14. Visual Philosophy

Nexora should feel:

* professional
* modern
* clean
* structured
* SaaS-oriented
* productivity-focused

Avoid:

* excessive decoration
* excessive shadows
* childish rounded UI
* neon colors
* gradients
* unnecessary animations
* visual clutter

The interface may use subtle decorative shapes/background elements, but they must not compete with the project-management content.

---

# 15. Accessibility

Maintain WCAG 2.1 AA contrast requirements where applicable.

Do not communicate important state using color alone.

Interactive elements must remain understandable through:

* text
* icons
* labels
* accessible states
