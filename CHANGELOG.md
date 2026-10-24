# 🌾 AgroPulse AI — Product Changelog & Architecture Evolution

All notable changes, architectural pivots, UX refinements, and hardware integrations are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and adheres to clean semantic release milestones.

## [1.3.5] - 2026-09-17

### 🛑 Elimination of Fake AI Guessing & Transparent Token Exhaustion Alerts
- **Eliminated Fake Crop Guessing**: Removed the dangerous generic fallback that previously assumed any non-sample image (such as human faces or rooms) was a "Crop Plant" with fake 94% confidence.
- **Honest Token Exhaustion Error**: When the AI API token is exhausted, revoked, or returns 401/402/429 on live webcam or custom uploads, the system explicitly halts and alerts: *"AI Token Exhausted: Please integrate API key"*, maintaining 100% scientific honesty.
- **Protected Presentation Samples**: Verified that pre-validated demo samples (Tomato, Mango, Hibiscus, Maize, Potato) continue to work flawlessly offline with their certified agronomic pathology.

---

## [1.3.4] - 2026-09-17

### 🪞 Natural Mirror Reflection (Standardized Like Real Mirrors & Zoom)
- **Natural Mirror Behavior**: Standardized live webcam to permanent mirror reflection (`scale-x-[-1]`), behaving exactly like a real physical mirror, FaceTime, or Zoom. Moving hands or leaves to the left moves left on screen.
- **Zero Distracting Options**: Removed any toggle buttons or settings, keeping the camera UI clean, minimal, and completely friction-free.
- **Synchronized Canvas Output**: The captured snapshot is horizontally flipped (`ctx.scale(-1, 1)`) so the saved photo matches the user's mirror preview pixel-for-pixel.

---

## [1.3.3] - 2026-09-17

### 🎨 Live Camera HDR Color Grade (Rich Contrast & Vibrant Saturation)
- **Contrast Boost (+16%)**: Upgraded live webcam contrast (`contrast(1.16)`) to eliminate milky, washed-out tones common on laptop cameras, giving leaf veins and necrotic lesions crisp definition.
- **Vibrant Saturation (+24%)**: Lifted saturation (`saturate(1.24)`) so chlorotic yellowing, early blight brown spots, and healthy leaf chlorophyll pop with high dynamic range.
- **Synchronized Snapshot Pipeline**: Baked the identical contrast and saturation grading into the snapshot canvas export for accurate, high-contrast AI vision inspection.

---

## [1.3.2] - 2026-09-17

### 🌿 Aspect-Ratio Preserved Specimen Fitting (Zero Distortion & Zero Overflow)
- **Zero Stretching & Zero Distortion**: Standardized default image fitting to `object-contain` within the fixed `h-[340px] sm:h-[350px] lg:h-[360px]` optical viewport.
- **50/50 Dual-Engine Integrity**: Guaranteed that tall portrait leaves (e.g. Mango) no longer expand the viewport to 550px+, preventing `INPUT 2 · Soil Moisture Sensor` from being pushed off-screen on mobile devices.
- **Full Leaf Visibility**: Preserved 100% of the leaf surface (tip to stem) so marginal and tip-burn symptoms are never cropped out, with the 1-tap `Fit / Fill` toggle retained for optional edge-to-edge fill.

---

## [1.3.1] - 2026-09-17

### 🎯 Optical Viewfinder Precision Alignment (Full-Bleed Lens Fix)
- **Resolved**: Fixed mobile camera viewport collapsing to intrinsic 16:9 aspect ratio inside a `min-h` flexbox container.
- **Full-Bleed Edge-to-Edge Feed**: Viewport container standardized to solid `h-[340px] sm:h-[350px] lg:h-[360px]` across breakpoints, with webcam wrapper enforcing `absolute inset-0 w-full h-full object-cover`.
- **Integrated HUD Reticles**: Pinned the 4 precision viewfinder corner brackets directly inside the active video bounds with luminous `#B8F234` stroke and deep optical drop-shadow, eliminating detached ghost brackets and empty white grid padding.
- **Ergonomic Tuning Placement**: Positioned the `☀️ Bright ON` booster neatly at `top-3.5 right-11`, preventing any overlap with optical reticle brackets.

---

## [1.3.0] - 2026-09-17

### ⚡ Camera Optics & Lighting Enhancement
- **Added**: Low-light 1-tap brightness booster (☀️ Bright ON / +22% Brightness) using hardware-accelerated CSS and Canvas filters (rightness(1.22) contrast(1.08) saturate(1.1)) so leaves photographed in dim indoor classrooms or dorms are crisp and vivid for the AI vision model.
- **Removed**: Redundant mirror flip toggle based on user review, standardizing the camera on natural unmirrored perspective.
- **Refined**: Snapshot pipeline guarantees what is seen on screen is identically baked into the captured canvas JPEG for Gemini 1.5 Flash analysis.

---

## [1.2.0] - 2026-09-17

### 🌿 Equal 50/50 Dual-Engine Architecture & Plain English Overhaul
- **Architecture**: Redesigned the primary diagnostic engine from a leaf-centric flow to an honest, co-equal **50/50 Dual-Engine System** (Visual Leaf Symptoms + Real-time Soil Sensor Telemetry).
  - Screen split: lg:col-span-6 for optical leaf inspection, lg:col-span-6 for soil telemetry.
  - Dual-Engine CTA: Master action buttons explicitly state both inputs (e.g. *"Mix Soil (26.5%) + Leaf to Make Fertilizer Recipe"*).
- **Honest 3-State Soil Hardware Status**:
  - AMBER (Manual Slider): Displayed when ESP32 probe is offline, guiding users to set moisture manually.
  - BLUE (Sample Data): Displayed when demo soil values are loaded from field tests.
  - GREEN (Live Sensor): Displayed when live ESP32-CAM telemetry is actively streaming over WiFi.
- **4th-Grade Plain English Copywriting**:
  - Removed confusing technical terms: purged "foliar spray", "soil drench", "spore germination", and "necrotic blister galls".
  - Replaced with everyday words: *"Spray on leaves"*, *"Pour into soil"*, *"Yellow dry spots"*, *"Blight spots"*.
- **Removed**: Removed the arbitrary *"Read time: ~10 sec"* badge from prescription headers.

---

## [1.1.0] - 2026-09-16

### 🎨 Visual Identity & Industrial UI Polish
- **Blueprint Grid Aesthetic**: Integrated subtle engineering grid patterns and optical laser sweep animations for high-tech presentation impact.
- **Export & Telemetry**: Added instant PDF prescription download and live sensor telemetry HUD.
- **Sample Leaf Library**: Curated pre-validated diseased crop samples (Tomato Early Blight, Corn Common Rust, Apple Scab, Grape Black Rot) for zero-risk live presentations.

---

## [1.0.0] - 2026-09-15

### 🚀 Initial Working Prototype (Proof of Concept)
- **Two-Stage Decoupled AI Pipeline**:
  - Stage 1: Gemini 1.5 Flash parses visual symptoms into a structured symptom matrix.
  - Stage 2: DeepSeek V4 Flash reasons through crop deficiency math, calculating exact N-P-K chemical ratios and organic compost recipes.
- **ESP32-CAM Firmware**: Deployed irmware/ with capacitive soil moisture sensor and DHT11 ambient monitoring.
- **Vercel Deployment**: Configured CI/CD pipeline triggering automated production builds on push to main.
