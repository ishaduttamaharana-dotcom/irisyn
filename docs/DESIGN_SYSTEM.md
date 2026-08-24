# IRISYN — Design System & Visual Specification

## 1. Design Direction & Tone
IRISYN is an AI-Powered Digital Twin and Predictive Operations Platform.

The visual system communicates:
$$\text{ENGINEERING} + \text{INTELLIGENCE} + \text{CONTROL} + \text{RELIABILITY}$$

It is built to look industrial, technical, intelligent, and calm under pressure — avoid gaming UI, flashy neon, excessive 3D decoration, or generic admin template appearances.

---

## 2. Color Palette & Tokens

### Base Palette
- **Background (`#070A0F`)**: Deep industrial dark workspace background.
- **Surface (`#0D121A`)**: Primary container, sidebar, and navbar surface.
- **Surface Elevated (`#111923`)**: Elevated card, drawer, and modal surface.
- **Border (`#1E2936`)**: Subtle 1px container boundaries.
- **Primary Purple (`#7C5CFF`)**: Branding, AI Copilot, Digital Twin features, active navigation.
- **Primary Bright (`#9A83FF`)**: Focused elements and hover highlights.
- **Secondary Cyan (`#35C9FF`)**: Telemetry metrics, live streams, technical data flow.
- **Text Primary (`#F5F7FA`)**: High-contrast body and title typography.
- **Text Secondary (`#A7B0BC`)**: Subtitles and metadata.
- **Text Muted (`#6F7B88`)**: Inactive labels and timestamps.

### Operational Colors
- **Healthy (`#22C55E`)**: Normal operations, 80–100% health score, online status.
- **Warning (`#F59E0B`)**: 55–79% health score, parameter drift, attention required.
- **Critical (`#EF4444`)**: 0–54% health score, component fault, urgent action required.
- **Info (`#38BDF8`)**: Informational system notices.
- **Unknown (`#94A3B8`)**: Offline or uninitialized state.

*Rule*: Operational colors are **never used alone**. They are always paired with:
1. Bullet dot indicator (`●`)
2. Lucide icon
3. Uppercase text label

---

## 3. Typography Scale & Fonts

### Font Families
- **Primary Body & Titles**: `Inter`, `system-ui`, `-apple-system`, `sans-serif`
- **Technical & Numerals**: `JetBrains Mono`, `monospace` (telemetry values, timestamps, IDs, logs, API paths)

### Scale
- **Page Title**: 28–36px (`font-weight: 600–700`)
- **Section Title**: 18–22px (`font-weight: 600`)
- **Card Title**: 14–16px (`font-weight: 600`)
- **Body Text**: 14–15px (`font-weight: 400–500`)
- **Metadata**: 12–13px (`font-weight: 500`)
- **Telemetry Value**: 24–36px (`font-weight: 600–700`, tabular numerals)

---

## 4. Spacing System
Built on an 8px grid system: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`, `64px`.

---

## 5. Dashboard Incident Timeline Guidelines
To prevent excessive page scrolling:
- Desktop height is fixed to **420px**.
- Tablet height is fixed to **380px**.
- Mobile height is fixed to **320px**.
- Includes internal `[ ↑ ] [ ↓ ]` button controls to scroll the feed internally.
