# 🌾 AI-Based Smart Fertilizer Recommendation System
### *Detailed Engineering Blueprint & Technical Specification (3rd Semester Mini-Project)*

---

## 1. Executive Summary & Core Concept

This project is an **IoT-enabled Edge-to-Cloud Precision Agriculture System**. It diagnoses plant nutrient deficiencies and crop diseases by fusing **visual leaf symptoms** with **real-time soil telemetry**, then generates precise chemical (NPK) and organic fertilizer prescriptions using a **two-stage decoupled AI pipeline**.

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│     1. Smart IoT Probe    │      │    2. Vision Inspection   │      │ 3. Deep Agronomic Reason  │
│  ESP32-CAM + Soil Sensor  │ ───► │     (Gemini 1.5 Flash)    │ ───► │    (DeepSeek V4 Flash)    │
│  [Leaf Photo + Soil Data] │      │ [Extract Symptom Matrix]  │      │ [Calculate Exact Dosage]  │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
                                                                                    │
                                                                                    ▼
                                                                      ┌───────────────────────────┐
                                                                      │   4. Farmer Web Report    │
                                                                      │  (Interactive Dashboard)  │
                                                                      └───────────────────────────┘
```

---

## 2. Hardware Architecture (The Physical Agri-Probe)

### Bill of Materials & Cost Breakdown

| Component | Function | Why We Chose It | Approx Cost (INR) |
| :--- | :--- | :--- | :--- |
| **ESP32-CAM + MB Shield (OV2640 2MP)** | Microcontroller, WiFi, Camera, Flash LED | Built-in WiFi eliminates wires; MB shield gives plug-and-play Micro-USB programming (no messy FTDI jumpers). Flash LED ensures clear photos in dim light. | **₹700** (~$8.50) |
| **Capacitive Soil Moisture Sensor v1.2** | Measures soil moisture percentage | Unlike cheap resistive sensors, capacitive probes **do not rust or corrode** in wet, salted soil. | **₹120** (~$1.45) |
| **DHT11 Sensor** | Measures ambient temperature & air humidity | Humidity + Temp helps distinguish fungal disease risks from pure nutrient starvation. | **₹90** (~$1.10) |
| **5V USB Power Bank / Cable** | System power | Standard 5V power supply, highly portable for field testing. | ₹0 (Existing) |
| **Total Hardware Cost** | — | — | **~₹910 (~$11.00)** |

### Wiring & Pin Mapping

```
ESP32-CAM Pin          Connected To
─────────────          ────────────
5V                     VCC (Soil Sensor & DHT11)
GND                    GND (Soil Sensor & DHT11)
GPIO 33 / GPIO 14      Analog OUT (Capacitive Soil Sensor)
GPIO 13 / GPIO 12      DATA Pin (DHT11 Sensor)
Micro-USB (MB Shield)  Laptop / Power Bank
```

---

## 3. Two-Stage Decoupled AI Pipeline

Instead of relying on a single black-box model, we decouple the AI into two specialized tiers:

```
[Leaf Image + Soil Data] ──► [Stage 1: Gemini 1.5 Flash Vision]
                                         │
                                         ▼ (Structured JSON Symptoms)
                             [Stage 2: DeepSeek V4 Flash Reasoning]
                                         │
                                         ▼ (Prescription & Dosage)
                             [Streamlit / React Dashboard]
```

---

### Stage 1: Visual Symptom Extraction (Gemini 1.5 Flash / Grok Vision)

* **Primary Model:** **Gemini 1.5 Flash** *(Fallback: Grok Vision / GPT-4o-mini)*
* **Role:** Acts as the *Botanical Eye*. It performs image-to-text semantic extraction, classifying the crop species and visual symptoms into a strict JSON schema.
* **Why Gemini 1.5 Flash:**
  1. Sub-second latency (~1.0s).
  2. Free tier available / ~$0.075 per 1M tokens (practically free).
  3. High sensitivity to micro-symptoms like interveinal chlorosis, marginal leaf burn, and rust pustules.

#### Stage 1 Prompt:
```text
You are an expert plant pathologist. Inspect this crop leaf image.
Return ONLY a valid JSON response with this exact structure:
{
  "crop_identified": "Tomato",
  "leaf_condition": "Nutrient Deficient",
  "visual_symptoms": [
    "Interveinal chlorosis (yellowing between leaf veins)",
    "Older leaves show purplish tint on undersides"
  ],
  "suspected_deficiency": "Phosphorus (P) and Nitrogen (N)",
  "pest_or_fungus_detected": false,
  "confidence_score": 0.93
}
```

---

### Stage 2: Agronomic Reasoning & Dosage Engine (DeepSeek V4 Flash)

* **Primary Model:** **DeepSeek V4 Flash**
* **Role:** Acts as the *Agronomic Brain*. It takes the visual symptoms from Stage 1 along with real-time soil telemetry from the ESP32 and calculates exact fertilizer proportions.
* **Pricing & Efficiency:**
  * **Input Tokens (Cache Miss):** **$0.14 / 1M tokens** (~₹0.000012 per scan)
  * **Input Tokens (Cache Hit):** **$0.0028 / 1M tokens**
  * **Output Tokens:** **$0.28 / 1M tokens** (~₹0.000024 per scan)
  * Total AI cost per crop diagnosis is less than **₹0.02 ($0.0002)**!

#### Stage 2 Prompt Fed to DeepSeek V4 Flash:
```text
Context:
- Visual Diagnosis: { "crop": "Tomato", "deficiency": "Phosphorus (P)", "symptoms": "Purpling of lower leaf veins" }
- Soil Telemetry: Moisture = 32%, Temperature = 29°C, Humidity = 65%
- Farm Scale: Smallholder (10 potted plants / 0.5 acre)

Task:
Calculate an actionable, safe fertilizer prescription. Provide:
1. Primary Chemical Fertilizer (e.g., DAP / SSP / Urea) with exact weight dosage (g/plant or kg/acre).
2. Organic Bio-Fertilizer Alternative (e.g., Bone meal, Rock phosphate, Vermicompost).
3. Soil & Irrigation Instruction based on the 32% moisture reading.
4. Application schedule and safety warnings.
```

---

## 4. Software Architecture & Stack

```
[ ESP32-CAM Firmware ] (C++ / Arduino IDE)
       │ HTTP POST (multipart/form-data)
       ▼
[ Python FastAPI Backend ] (Localhost / Cloud)
       ├─► Gemini 1.5 Flash API (google-generativeai SDK)
       └─► DeepSeek V4 Flash API (OpenAI-compatible client)
       │ JSON Response
       ▼
[ Web Dashboard ] (Streamlit / React)
       ├─ Live Soil Moisture & Temp Gauges
       ├─ Crop Leaf Camera Snapshot Preview
       ├─ Diagnosis Card (Deficiency & Confidence)
       └─ Downloadable PDF "Fertilizer Prescription"
```

---

## 5. Why This Impresses the Professor (Key Selling Points)

1. **Multimodal Fusion (Image + Sensor):**
   * *Professor Question:* "Why not just use an image?"
   * *Answer:* "A yellow leaf can mean Nitrogen deficiency OR root suffocation from overwatering. By combining the soil moisture sensor with computer vision, our AI avoids misdiagnosis."
2. **Cost-Optimized Architecture:**
   * Uses low-power edge hardware (< ₹1,000) and ultra-efficient flash APIs (< ₹0.05 per scan).
3. **Decoupled 2-Stage Design:**
   * Demonstrates modular software design: Computer Vision for feature extraction + LLM for quantitative reasoning.
4. **Offline / Fallback Resilience:**
   * If WiFi fails during class presentation, the dashboard includes a `"Upload Image from Phone/PC"` button for a 100% fail-proof demo.

---

## 6. Project Directory Structure

```text
Fertiliser recommendation/
├── PROJECT_BLUEPRINT.md          <-- Complete System Blueprint & Architecture
├── README.md                     <-- Quick Start Guide
├── backend/                      <-- FastAPI server
│   ├── main.py                   <-- API endpoints & routing
│   ├── vision_service.py         <-- Stage 1: Gemini 1.5 Flash
│   └── reasoning_service.py      <-- Stage 2: DeepSeek V4 Flash
├── dashboard/                    <-- Streamlit / Web UI
│   └── app.py                    <-- Frontend interface
└── firmware/                     <-- ESP32-CAM Arduino C++ code
    └── esp32_camera_sensor.ino   <-- Camera capture & sensor reading
```
