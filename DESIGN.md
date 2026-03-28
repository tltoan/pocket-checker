# High-Contrast Simple Pocket Checker

## Product Overview
**The Pitch:** A high-visibility, zero-friction utility app that actively monitors your location and transit state to trigger full-screen, unmissable alerts reminding you to check your pockets before you leave a location behind.

**For:** Commuters, travelers, and the forgetful who need aggressive, foolproof reminders rather than passive notifications.

**Device:** Mobile

**Design Direction:** Brutalist utility. Pitch black backgrounds, retina-searing neon accents, and massive typography. Designed to be read in glaring sunlight or instantly recognized in the dark.

**Inspired by:** Apple Find My (mechanics), Nothing OS (aesthetic), industrial warning interfaces.

---

## Screens

- **Status Dashboard:** Live view of monitoring status and current checklist.
- **Full-Screen Alert:** The high-visibility trigger screen demanding interaction.
- **Inventory Setup:** Simple toggle list of essential pocket items.
- **Trigger Rules:** Location and motion settings (30+ min dwell, driving/biking).

---

## Key Flows

**The Departure Alert:** User leaves a location after dwelling.
1. User is on [Background / Phone Locked] -> sees [Full-Screen Alert notification]
2. User taps [Notification] -> sees [Full-Screen Alert]
3. User swipes [Acknowledge Slider] -> dismisses alert, logs successful check.

---

## Design System

### Color Palette
- **Primary:** `#FFFFFF` (Pure White) - Main CTAs, active states, progress bars.
- **Background:** `#050505` (Vanta Black) - App background, maximizes OLED contrast.
- **Surface:** `#1A1A1A` (Asphalt) - Cards, list items, unselected toggles.
- **Surface High:** `#262626` - Elevated surfaces, borders.
- **Text:** `#FFFFFF` (Pure White) - Primary headings, numbers.
- **Muted:** `#808080` (Concrete) - Secondary text, inactive icons.
- **Accent:** `#FF0055` (Neon Pink) - Destructive actions, missed checks, urgent warnings.

### Typography
Utilitarian, geometric, and aggressive. No soft curves.

- **Headings:** System Sans-Serif, 700, 32-64px
- **Body:** System Sans-Serif, 500, 18px
- **Small text:** System Monospace, 400, 14px (uppercase)
- **Buttons:** System Sans-Serif, 700, 20px (uppercase)

**Style notes:** Hard edges (`0px` border radius everywhere). Thick borders (`2px` solid). High-contrast focus states (inverted colors). No drop shadows, purely flat and brutalist.

### Design Tokens
```
Primary:    #FFFFFF
Background: #050505
Surface:    #1A1A1A
SurfaceHi:  #262626
Text:       #FFFFFF
Muted:      #808080
Accent:     #FF0055
Radius:     0px
Border:     2px solid
```

---

## Screen Specifications

### Status Dashboard
**Purpose:** Provide immediate reassurance that the app is monitoring, and show what will be checked.

**Layout:** Massive status indicator top, active items middle, settings row bottom.

**Key Elements:**
- **Status Ring:** `100px` square, `3px` Pure White border. Inside: "TRACKING ACTIVE" in monospace, center-aligned.
- **Location Text:** `32px`, Pure White. "AT HOME" or "IN TRANSIT".
- **Item Ticker:** Horizontal scrolling marquee of active items, Concrete.
- **Secured Items:** Large count display with "ALL DETECTED" footer.
- **Beacon Power:** Percentage with segmented bar visualization.
- **Active Ruleset:** "MANDATORY EXODUS CHECK" card with arrow.
- **Recent Logs:** List of recent check-in successes with timestamps.

### Full-Screen Alert
**Purpose:** Grab maximum attention when the user breaks a geofence or starts driving.

**Layout:** Full bleed Pure White background, huge typography, heavy interaction required to dismiss.

**Key Elements:**
- **Background:** Solid Pure White (`#FFFFFF`).
- **Warning Text:** "CHECK POCKETS", `64px`, Vanta Black, uppercase, tight leading.
- **Item Grid:** `2x2` grid with emoji icons and labels, `4px` Vanta Black borders.
- **Acknowledge Slider:** Vanta Black track, Pure White thumb, Neon Pink fill. Text: "SLIDE TO CONFIRM".

### Inventory Setup
**Purpose:** Configure the core checklist of items.

**Layout:** Vertical scrolling list, large hit areas, brutalist checkboxes.

**Key Elements:**
- **Header:** "INVENTORY", `32px`, Pure White.
- **Profile Chips:** Selectable profile buttons with border states.
- **List Items:** Numbered rows with square Pure White checkboxes.
- **Add Item:** Input field with brutalist styling, dashed "APPEND NEW ASSET" button.

### Trigger Rules
**Purpose:** Configure when alerts fire based on context.

**Layout:** Stacked parameter cards with brutalist controls.

**Key Elements:**
- **Dwell Time Card:** Large `72px` number display, DECREASE/INCREASE buttons.
- **Monitoring Toggle:** Active/Offline state with slider track.
- **Transit Cards:** BIKING and DRIVING toggles with ON/OFF states.
- **Sensitivity Scale:** 10-segment bar, tappable, with LVL display.

---

## Build Guide

**Stack:** React Native + Expo + TypeScript

**Architecture:**
- Expo Router (file-based tabs)
- React Context for state management
- AsyncStorage for persistence
- expo-location, expo-notifications, expo-haptics for native features

**Tabs:** STATUS | ITEMS | RULES
