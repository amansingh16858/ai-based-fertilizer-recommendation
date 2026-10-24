# 🌿 AGROPULSE AI — Product Research & Design Blueprint
### *Next-Generation Multimodal Agronomic Diagnostic & Prescription Platform*

---

## 1. Product Vision & Problem Space Analysis

### 1.1 The Real-World Problem
Modern agriculture suffers from a massive **diagnostic-to-action gap**:
1. **The Misdiagnosis Trap:** A farmer seeing yellowing leaves often assumes Nitrogen deficiency and buys expensive Urea. In reality, the cause is frequently root asphyxiation (overwatering), fungal vascular wilt, or Micronutrient (Iron/Zinc) lockout due to soil pH. Chemical over-application ruins soil microbiomes and wastes capital.
2. **The Laboratory Barrier:** Traditional agricultural soil testing laboratories take 10–14 days to return results, cost ₹800–₹2,500 per sample, and provide static chemical numbers without real-time visual crop context.
3. **The Generic AI Failure:** Standard single-prompt AI wrappers hallucinate or give vague advice (*"apply fertilizer regularly"*). Farmers require **exact, actionable, field-calibrated dosages** (e.g., *“18g DAP + 12g MOP per square meter dissolved in 5L water at 6:00 PM, followed by a 4-day dry cycle”*).

### 1.2 Target User Personas
* **Primary Persona: Smallholder Farmer & Field Agronomist**
  * *Needs:* Fast answers in sunlight-readable UI, vernacular terminology, clear chemical vs. organic cost trade-offs, step-by-step application instructions.
* **Secondary Persona: Academic Evaluator & Agriculture Student / Professor**
  * *Needs:* Technical rigor, transparent explainability (Chain of Thought), hardware telemetry validation, model latency/cost visibility.

### 1.3 Core Product Value Proposition
> **"Fusing Edge IoT Telemetry with Multimodal Two-Stage AI to deliver lab-grade crop pathology and exact fertilizer prescriptions in under 2.5 seconds at less than ₹0.05 per scan."**

---

## 2. Information Architecture (IA) & Product Hierarchy

```
AGROPULSE PLATFORM
├── 1. Diagnostic Studio (Primary Workbench)
│   ├── Edge Device Live Stream / Hardware Ingestion Hub
│   ├── Visual Leaf Viewport & Symptom Bounding Overlay
│   ├── Real-Time Microclimate & Soil Telemetry HUD
│   └── Trigger Action Controller ("Scan Crop & Diagnose")
├── 2. Agronomic Prescription Engine (Results Layer)
│   ├── Pathological Diagnosis & Confidence Breakdown
│   ├── Multimodal Root Cause Analysis (Image + Sensor Correlation)
│   ├── Dynamic Fertilizer Calculator (Chemical vs Bio-Organic)
│   ├── 14-Day Recovery & Irrigation Schedule
│   └── Exportable PDF Crop Health Card & WhatsApp Dispatcher
├── 3. System Architecture & Model Inspector (Academic / Pro Mode)
│   ├── Stage 1 Vision Token & Feature Map Inspector (Gemini 1.5 Flash)
│   ├── Stage 2 Reasoning Chain & Token Cost Metrics (DeepSeek V4 Flash)
│   └── ESP32-CAM Serial & Telemetry Diagnostic Log
└── 4. Historical Field Ledger & Farm Settings
    ├── Past Diagnoses Timeline & Crop Yield Tracking
    └── Farm Profile (Soil Type, Farm Area, Crop Type, Region)
```

---

## 3. Two-Stage AI Pipeline Architecture & Logic

```mermaid
flowchart TD
    subgraph "Input Layer"
        IMG[2MP Leaf Image (OV2640 / File)]
        SOIL[Soil Moisture % (Capacitive Probe)]
        DHT[Temp °C & Humidity % (DHT11/22)]
        FARM[Farm Profile: Crop, Soil Type, Area]
    end

    subgraph "Stage 1: Vision Extraction (Gemini 1.5 Flash / Grok Vision)"
        V_IN["Payload: Binary Leaf Image"]
        V_MODEL["Gemini 1.5 Flash Vision Model"]
        V_OUT["Structured JSON Symptom Matrix:<br>• Crop Identification<br>• Chlorosis / Necrosis Distribution<br>• Leaf Spot / Lesion Geometry<br>• Confidence Metric"]
        V_IN --> V_MODEL --> V_OUT
    end

    subgraph "Stage 2: Agronomic Reasoning (DeepSeek V4 Flash)"
        R_IN["Fused Payload: Symptom JSON + Soil Telemetry + Farm Profile"]
        R_MODEL["DeepSeek V4 Flash ($0.14/1M tokens)"]
        R_OUT["Structured Prescription Plan:<br>• Nutrient Deficit (N-P-K-Ca-Mg)<br>• Primary Chemical Formula & Weight (g/kg)<br>• 100% Organic Alternative<br>• Soil Hydration Directive<br>• Split-Dose Application Calendar"]
        R_IN --> R_MODEL --> R_OUT
    end

    subgraph "User Interface & Action"
        UI["High-Fidelity Agronomic Dashboard"]
        PDF["Downloadable Agronomist Prescription PDF"]
        BOT["Telegram / WhatsApp Alert"]
    end

    IMG --> V_IN
    SOIL --> R_IN
    DHT --> R_IN
    FARM --> R_IN
    V_OUT --> R_IN
    R_OUT --> UI
    R_OUT --> PDF
    R_OUT --> BOT
```

---

## 4. Design System & Visual Language

### 4.1 Design Philosophy: *Industrial Agritech Minimalism*
The interface blends the precision of modern developer tools (like Linear and Raycast) with high-utility agricultural readability. Every component prioritizes rapid glanceability, high contrast for outdoor field conditions, and zero unnecessary visual clutter.

### 4.2 Color Palette & Semantic Tokens

```
┌────────────────────────────────────────────────────────────────────────┐
│  Backgrounds & Surfaces                                                │
│  • Surface 0 (Canvas Base)      : #0A0F1D (Deep Slate Navy)            │
│  • Surface 1 (Card Background)  : #111827 (Milled Carbon Slate)        │
│  • Surface 2 (Interactive/Hover): #1F2937 (Elevated Surface)           │
│  • Surface Border               : rgba(255, 255, 255, 0.08)            │
├────────────────────────────────────────────────────────────────────────┤
│  Brand & Botanical Accents                                             │
│  • Primary Accent (Agri Green)  : #10B981 (Emerald 500 - Health)       │
│  • Primary Glow                 : rgba(16, 185, 129, 0.15)             │
│  • Secondary Accent (Bio Mint)  : #34D399 (Mint 400)                   │
├────────────────────────────────────────────────────────────────────────┤
│  Diagnostic Status Tokens                                              │
│  • Normal / Healthy             : #10B981 (Emerald)                    │
│  • Warning / Mild Deficiency    : #F59E0B (Amber 500 - Action Required)│
│  • Critical / Disease Outbreak  : #EF4444 (Rose 500 - Urgent Treatment)│
│  • Moisture / Telemetry Cyan    : #06B6D4 (Cyan 500 - Hydration Data)  │
├────────────────────────────────────────────────────────────────────────┤
│  Typography Tokens                                                     │
│  • Text Primary                 : #F9FAFB (98% Crisp White)            │
│  • Text Secondary               : #9CA3AF (Muted Subtitle Gray)        │
│  • Text Monospace (Metrics/Code): #A7F3D0 (Pale Mint Monospace)        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Typography Hierarchy
* **Display & Headings:** `Plus Jakarta Sans` or `Inter` (Font weights: 600 SemiBold, 700 Bold). Crisp geometric letterforms for readability.
* **Body & Labels:** `Inter` (Font weights: 400 Regular, 500 Medium). High legibility at 13px–15px sizes.
* **Data Values & Telemetry:** `JetBrains Mono` or `Space Mono` (Font weight: 500). Used for all numerical readings (percentages, temperatures, grams, API latencies).

---

## 5. Screen Layout & Component Blueprint

### 5.1 Hero & Navigation Header
* **Left:** Brand Lockup (`AgroPulse AI` with live green pulsating edge-sync badge: `● ESP32 EDGE PROBE ONLINE`).
* **Center:** Quick Farm Profile Selector (e.g., `Field: North Plot #2 (Tomato)` with edit modal).
* **Right:** 
  * Language Selector (`English`, `हिंदी`, `தமிழ்`, `తెలుగు`).
  * API / Model Inspector Drawer Toggle (`⚡ Stage 1: Gemini | Stage 2: DeepSeek`).
  * Manual Image Upload vs Hardware Probe toggle.

---

### 5.2 Studio Grid Layout (Desktop 3-Column Orchestration)

```
┌─────────────────────────┬───────────────────────────────┬─────────────────────────┐
│ COLUMN 1: EDGE HUD      │ COLUMN 2: DIAGNOSTIC VIEWPORT │ COLUMN 3: PRESCRIPTION  │
│ (Width: 28%)            │ (Width: 42%)                  │ (Width: 30%)            │
├─────────────────────────┼───────────────────────────────┼─────────────────────────┤
│ • Hardware Status Card  │ • High-Res Leaf Viewport      │ • Primary Diagnosis     │
│   (Battery, WiFi dBm)   │   (Bounding box overlay)      │   (Crop, Deficit, Conf.)│
│ • Soil Moisture Gauge   │ • Mode Switcher               │ • Multimodal Reason Card│
│   (Live 0-100% Arc)     │   (ESP32 / Webcam / Upload)   │   (Image + Sensor sync) │
│ • DHT Microclimate HUD  │ • Primary Action CTA:         │ • Chemical Rx (NPK)     │
│   (Temp °C / Humidity %)│   [⚡ RUN AI DIAGNOSIS]        │ • Bio-Organic Option    │
│ • Farm Profile Context  │ • Live Edge Logs Feed         │ • 14-Day Timeline       │
│   (Area, Soil Type)     │   (HTTP 200 / Inference ms)   │ • [Export PDF / Share]  │
└─────────────────────────┴───────────────────────────────┴─────────────────────────┘
```

---

### 5.3 Detailed Component Specifications

#### Component A: Live Telemetry Gauges (Column 1)
* **Soil Moisture Radial Meter:**
  * Displays dynamic value (e.g., `28.5%`).
  * Color changes dynamically: 
    * `0% – 30%` $\rightarrow$ Amber (`Deficient / Dry Soil`).
    * `31% – 70%` $\rightarrow$ Green (`Optimal Moisture Band`).
    * `71% – 100%` $\rightarrow$ Cyan/Blue (`Waterlogged / Hypoxia Risk`).
* **Ambient Sensor Pill Cards:**
  * Temperature: `31.2 °C` with subtle thermal heat indicator.
  * Humidity: `68.0% RH` with vapor saturation status (`Fungal Risk: Moderate`).

#### Component B: Diagnostic Leaf Viewport (Column 2)
* **Optical Framing Area:** 16:9 or 4:3 high-contrast viewfinder with subtle edge alignment crosshairs.
* **Active State:** Highlights detected necrotic spots or chlorotic veins with semi-transparent glowing bounding chips (`Chlorosis [94%]`, `Vein Purpling [89%]`).
* **Source Switcher Segmented Control:**
  1. `📡 ESP32 Probe Stream` (Pulls live snapshot from `http://192.168.x.x/capture`).
  2. `📸 Laptop Webcam` (Instant live capture for indoor classroom demo).
  3. `📁 High-Res File Upload` (Drag-and-drop support for PNG/JPG/WEBP).

#### Component C: Prescription & Formulation Card (Column 3)
* **Diagnosis Header:** 
  * Badge: `Phosphorus (P) & Nitrogen (N) Starvation` (Color: Amber / Red).
  * Confidence: `94.2% AI Certainty`.
* **Multimodal Correlation Callout (The Professor Favorite):**
  * Alert Box: *"Soil moisture is at 28.5% (Low). Leaf yellowing is confirmed as genuine Nitrogen starvation rather than overwatering root damage."*
* **Prescription Tab Switcher:**
  * **Tab 1: Commercial / Chemical Formulation:**
    * Primary Input: `DAP (Di-Ammonium Phosphate) — 22g / plant`.
    * Secondary Input: `Urea (Top-Dress) — 15g / plant after 7 days`.
    * Estimated Cost: `~₹18.50 for current plot`.
  * **Tab 2: 100% Organic Alternative:**
    * Primary Input: `Steamed Bone Meal + Well-Rotted Vermicompost (250g / plant)`.
    * Bio-Stimulant: `Neem Cake Tea (drench around root zone to prevent fungal entry)`.
* **Action Buttons:**
  * Primary: `[📥 Download Prescription PDF]` (Generates branded, print-ready agronomist report).
  * Secondary: `[📲 Send WhatsApp Summary]`.

---

## 6. Edge States, Error Handling & Resilience

| Scenario / Edge State | UX & System Behavior | User Feedback |
| :--- | :--- | :--- |
| **ESP32 WiFi Connection Lost** | Automatically switches to **Fallback Mock Mode** with a soft banner. | `"Hardware probe disconnected. Switched to Local Emulation mode. Click to retry."` |
| **Blurry / Out-of-Focus Leaf Photo** | Stage 1 Gemini Vision detects `confidence_score < 0.60`. | Visual toast: `"Image quality low. Please hold the camera 10–15cm from the leaf surface."` |
| **Non-Plant Image Uploaded** | Vision model rejects object. | Rejection state: `"No crop leaf detected. Please photograph a plant leaf."` |
| **Zero Internet / Offline Presentation** | UI serves pre-cached baseline prescriptions for common crops (Tomato, Wheat, Rice, Potato). | `"Offline Mode Active: Serving calibrated local agronomy database."` |

---

## 7. Mobile-First Experience (Field Worker Ergonomics)

Unlike desktop dashboards that get squeezed onto phones, the mobile layout is purposefully engineered for one-handed operation in field sunlight:
1. **Bottom Sheet Navigation:** The prescription card slides up smoothly from the bottom, letting the user pull up full dosages while keeping the camera viewport visible.
2. **High-Contrast Sunlight Mode:** Dedicated high-contrast toggle that boosts background contrast and text boldness for outdoor readability in direct sun.
3. **Large Touch Targets:** All trigger buttons, source switches, and toggles have a minimum height of **52px** to allow effortless tapping with field gloves or dirty hands.

---

## 8. Technical Implementation Roadmap

```
Phase 1: Backend Services & API Integrations (Days 1–3)
├── Setup Python FastAPI Server
├── Build Gemini 1.5 Flash Vision Client (Structured JSON schema parser)
└── Build DeepSeek V4 Flash Client (Agronomic reasoning & dosage prompts)

Phase 2: Modern Frontend Application (Days 4–7)
├── Implement Interactive Streamlit / Web UI with Design System tokens
├── Implement Camera Snapshot + File Upload + Sensor Gauges
└── Connect WebSocket/HTTP pipeline to FastAPI endpoints

Phase 3: Hardware Edge & Wokwi Firmware (Days 8–10)
├── Flash ESP32-CAM (OV2640 Driver + WiFi + Sensor reading loop)
├── Verify multipart/form-data binary upload to backend
└── Package in physical probe enclosure for live demo

Phase 4: Polish, PDF Export & Presentation Prep (Days 11–12)
├── Build 1-click PDF Prescription Generator (ReportLab / WeasyPrint)
└── Rehearse Viva defense questions and multimodal metrics
```

---
*Created by AgroPulse AI Engineering & Product Design Team.*
