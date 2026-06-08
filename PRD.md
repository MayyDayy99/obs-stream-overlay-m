# Planning Guide

OBS Browser Source Manager for managing essential stream overlays including looping backgrounds, starting soon screens, break intermissions, and closing messages.

**Experience Qualities**: 
1. **Effortless** - Switching between stream states should be instantaneous with large, clear buttons
2. **Professional** - Visual transitions and overlays should feel polished and broadcast-ready
3. **Reliable** - Controls must be responsive and always accessible, even during live streams

**Complexity Level**: Light Application (multiple features with basic state)
This is a control panel with several preset overlay states that need to persist and be easily toggled during live streaming sessions.

## Essential Features

### Scene Management
- **Functionality**: Toggle between different stream states (Starting Soon, Live, Break, Coffee Break, Ending)
- **Purpose**: Quick access to common stream overlays without fumbling through OBS scenes
- **Trigger**: Large button clicks from the control panel OR keyboard shortcuts (1-5 keys)
- **Progression**: Click scene button / Press hotkey → Immediate full-screen overlay transition → Background animation loops → Return to Live when ready
- **Success criteria**: Overlay changes within 100ms, animations loop smoothly, previous state is remembered, hotkeys work from anywhere in the control panel

### Keyboard Shortcuts
- **Functionality**: Global keyboard shortcuts for instant scene switching without needing to click
- **Purpose**: Enables streamers to change scenes rapidly during live broadcasts without taking focus away from content
- **Trigger**: Number keys 1-5 for scenes, T for timer, Ctrl+Z for undo, ? for help
- **Progression**: Press hotkey → Visual feedback via toast → Scene changes instantly → Confirmation shown briefly
- **Success criteria**: Hotkeys work when not focused on input fields, ? key opens comprehensive hotkey reference dialog, all shortcuts are discoverable

### Custom Message Display
- **Functionality**: Add custom text overlays for announcements
- **Purpose**: Communicate schedule changes, technical issues, or special messages
- **Trigger**: Input field with instant preview
- **Progression**: Type message → See live preview → Message displays over current scene → Clear when done
- **Success criteria**: Text is readable at 1080p, updates in real-time, persists across refreshes

### Background Animation Library
- **Functionality**: Multiple looping background options for different moods
- **Purpose**: Visual variety prevents viewer fatigue during breaks
- **Trigger**: Select from preset background patterns
- **Progression**: Choose background style → Applies to active overlay → Loops seamlessly → Persists for session
- **Success criteria**: Smooth 60fps animations, no visible loop seam, works on all scenes

### Timer Display
- **Functionality**: Countdown timer for breaks
- **Purpose**: Sets viewer expectations for return time
- **Trigger**: Set duration and start countdown OR press T hotkey to toggle
- **Progression**: Enter minutes → Start timer / Press T → Large on-screen countdown → Optional alert at completion
- **Success criteria**: Accurate to the second, visible against all backgrounds, persists if page refreshes, hotkey toggles timer state

## Edge Case Handling

- **Accidental Scene Switch**: Quick undo button returns to previous scene within 3 seconds, also accessible via Ctrl+Z hotkey
- **Browser Source Refresh**: State persists via KV store - scene and settings restore automatically
- **Multiple Instances**: Only control panel needs interaction, actual overlay window is view-only
- **Long Break Extensions**: Timer can be extended mid-countdown without resetting, toggled via T hotkey
- **Custom Message Overflow**: Text auto-scales to fit screen, warns if too long
- **Hotkey Conflicts**: Hotkeys disabled when typing in input fields or textareas to prevent accidental scene switches
- **Hotkey Discovery**: ? key opens comprehensive reference dialog showing all available shortcuts

## Design Direction

The design should feel like a professional broadcast control room - confident, precise, and unambiguous. Think mission control aesthetics with bold typography, high contrast elements, and tactile button interactions that feel satisfying to press repeatedly during a live stream.

## Color Selection

A bold, high-energy palette that evokes professional broadcasting equipment with LED indicators and control panels.

- **Primary Color**: Deep Electric Blue (oklch(0.45 0.18 250)) - Represents the "live" state, commands attention like broadcast indicator lights
- **Secondary Colors**: 
  - Dark Slate Background (oklch(0.15 0.01 250)) - Professional control panel aesthetic
  - Bright Cyan Accent (oklch(0.75 0.15 200)) - Active states and highlights
- **Accent Color**: Vibrant Orange (oklch(0.68 0.19 45)) - Break states, warnings, and call-to-action buttons
- **Foreground/Background Pairings**: 
  - Primary Blue (oklch(0.45 0.18 250)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Dark Slate (oklch(0.15 0.01 250)): White text (oklch(0.98 0 0)) - Ratio 13.5:1 ✓
  - Vibrant Orange (oklch(0.68 0.19 45)): Black text (oklch(0.15 0 0)) - Ratio 7.1:1 ✓
  - Bright Cyan (oklch(0.75 0.15 200)): Black text (oklch(0.15 0 0)) - Ratio 9.8:1 ✓

## Font Selection

Typography should be bold, geometric, and instantly readable - like airport departure boards or stadium scoreboards that communicate information at a glance.

- **Typographic Hierarchy**:
  - H1 (Scene Labels): Space Grotesk Bold/48px/tight tracking for maximum impact
  - H2 (Overlay Messages): Space Grotesk Bold/96px/tight tracking for on-stream visibility
  - Body (Controls): Space Grotesk Medium/16px/normal tracking for UI clarity
  - Timer Display: JetBrains Mono Bold/120px/monospace for digital clock aesthetic

## Animations

Animations should feel mechanical and precise - like broadcast equipment switching feeds. Scene transitions use quick fades (200ms) to avoid jarring cuts. Background patterns use subtle, hypnotic motion (slow rotation, gentle pulse) that loops seamlessly. Button presses have satisfying haptic-style feedback with scale and glow effects (150ms).

## Component Selection

- **Components**: 
  - Large Button variants for scene switching (custom oversized with glow effects)
  - Card components for the control panel layout with subtle borders
  - Input and Textarea for custom messages with live character count
  - Badge components for status indicators (LIVE, BREAK, etc.)
  - Tabs for organizing backgrounds, messages, and timer controls
  - Dialog for timer configuration
  - Progress component for timer countdown visualization
- **Customizations**: 
  - Custom full-screen overlay component that renders behind controls
  - Animated background canvas using CSS gradients and transforms
  - Large format timer display component with glow effects
  - Scene preset buttons that are 3x normal size with icon + label
- **States**: 
  - Buttons: Default has subtle border glow, hover scales 1.05 with brighter glow, active has pressed shadow, selected state has persistent bright glow
  - Inputs: Focus state has cyan border glow matching broadcast aesthetic
  - Timer: Pulsing animation when under 1 minute remaining
- **Icon Selection**: 
  - Play (starting soon), Broadcast (live), Coffee (coffee break), ForkKnife (lunch break), HandWaving (ending), Clock (timer), TextT (custom message), Keyboard (hotkeys), ArrowCounterClockwise (undo)
- **Spacing**: 
  - Control panel uses generous padding (p-8) with gap-6 between sections
  - Scene buttons in a 2x3 grid with gap-4
  - Overlay text has massive margins (p-16) to stay clear of typical OBS crop areas
- **Mobile**: 
  - Control panel optimized for tablet/iPad use during streaming
  - Scene buttons stack vertically on mobile with full width
  - Timer controls reorganize to single column
  - Overlay view is always full-screen regardless of device
