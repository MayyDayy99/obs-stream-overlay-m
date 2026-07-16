# Óbudai Egyetem - Stream Vezérlő

Professional OBS streaming overlay manager for Óbuda University broadcasts with dedicated controller interface and real-time scene management.

## 🎯 Features

- **Dedicated Controller Interface**: Separate `/controller` page for managing overlays while OBS displays the clean overlay view
- **University Branding**: Professional Óbuda University branding with official color scheme
- **Instant Scene Switching**: Quick access to common stream states (Live, Starting Soon, Break, Coffee Break, Ending)
- **Keyboard Shortcuts**: Full hotkey support for rapid scene changes during live streams
- **Custom Messages**: Display custom text overlays for announcements
- **Animated Backgrounds**: Multiple background animation options (Gradient Wave, Geometric, Pulse, Particles)
- **Countdown Timer**: Built-in timer for breaks with visual countdown
- **State Persistence**: All settings persist across sessions

## 🚀 Quick Start

1. **Setup OBS Browser Sources (Layers)**:
   - Navigate to `/controller` in your browser
   - The top card shows the layer URLs (each carries the shared `?room=` id)
   - **Top layer (`#/l2`)** — add as a Browser Source (1920x1080) **above** your camera/content. Renders the break covers (Starting Soon, Break, …) and the live graphics (lower thirds, footer, schedule, social rotator).
   - **Bottom layer (`#/l1`)** — add as a Browser Source (1920x1080) **below** your camera/content. Renders the branded animated background that sits behind a framed/non-fullscreen camera during Live.
   - Prefer a single source? Use **`#/`**, which renders everything in one overlay placed above the camera.

2. **Control Your Stream**:
   - Keep `/controller` open on a separate screen
   - Use buttons or keyboard shortcuts to change scenes
   - All changes sync instantly to the OBS overlay

## ⌨️ Keyboard Shortcuts

- `1` - ÉLŐ (Live)
- `2` - HAMAROSAN (Starting Soon)
- `3` - EBÉDSZÜNET (Lunch Break)
- `4` - KÁVÉSZÜNET (Coffee Break)
- `5` - VÉGE (Ending)
- `6` - TECHNIKAI SZÜNET (Technical Issue)
- `T` - Toggle timer
- `Ctrl+Z` - Undo scene change
- `?` - Show hotkey reference

## 🎨 Customization

- **Custom Messages**: Type any text in the control panel to override default scene messages
- **Background Styles**: Choose from 4 different animated background styles
- **Timer Duration**: Set custom break duration in minutes

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
