# Holofex Studio — Mobile App UI Prototype

A high-fidelity, mobile-first UI prototype for the **Holofex Studio** app: an AI hologram
generator for 3D holographic fan displays, based on [holofex.studio](https://holofex.studio)
and the Holofex brand kit.

## Run it

No build step — it's a static prototype.

```bash
# any static server works, e.g.
npx serve .
# or
python3 -m http.server 8000
```

Open it on a phone (or a desktop browser, where it renders inside a phone frame).

## Screens

| Screen | Purpose |
|---|---|
| Splash | Animated wireframe hex-cube mark, tagline, loading bar |
| Home | Hero CTA, three generator modes, recent creations, connected-display banner |
| Create | Mode tabs (Logo / Product / Scene), upload zone, prompt with AI enhance, style presets, output settings, generate CTA |
| Generating | Animated orb, staged progress (model → render → colour-grade → loop) |
| Preview | Simulated holographic fan playback, output metadata, send-to-display / export MP4 / save / remix |
| Library | Filterable grid of saved holograms |
| Displays | Paired fan devices, status, brightness/speed quick controls |
| Profile | Plan + credits, defaults, settings |

## Brand system

- **Type:** Exo 2 (SemiBold emphasis), wide letter-spacing for wordmarks/labels
- **Palette:** `#00E0FF` cyan · `#7F5BFF` purple · `#FF2DFF` magenta · `#FF8A00` orange · `#00FFD1` teal on near-black
- **Gradients:** cyan → purple → magenta → orange (primary CTA), orange → magenta → purple → teal (secondary)
- **Tagline:** “Bringing content to life in stunning 3D”

## Structure

```
index.html   # all screens + bottom tab navigation
styles.css   # brand tokens, components, animations
app.js       # screen routing, tabs/chips/toggles, demo generation flow
```

The prototype is intentionally framework-free so the screens can be translated 1:1
into React Native / Expo (or any stack) when the real app is built.
