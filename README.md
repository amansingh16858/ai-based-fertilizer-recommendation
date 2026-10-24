# 🌾 AgroPulse AI — Smart Fertilizer & Crop Diagnostic System

> **AI-Powered Dual-Engine Precision Agriculture**: Fusing real-time soil telemetry with high-resolution computer vision to prescribe exact chemical (NPK) and organic fertilizer remedies.

---

## 🌟 Core Architecture: The 50/50 Dual-Engine

Unlike traditional crop apps that only inspect leaf photos or simple soil sensors that only read moisture, **AgroPulse AI** bridges the physical and visual divide:

1. **Input 1: Optical Leaf Scanner** (Gemini 1.5 Flash Vision)
   - Detects cellular chlorosis, blight spots, necrotic margins, and pest damage.
   - Built-in low-light hardware boost (+22% Brightness) for crisp indoor captures.
2. **Input 2: Physical Soil Telemetry** (Capacitive Agri-Probe)
   - Real-time soil moisture percentage streamed live over WiFi from an ESP32 edge microcontroller.
   - 3-State Honest Status: Live ESP32 Sensor, Verified Sample Field Data, or Calibrated Manual Slider.
3. **Agronomic Reasoning Engine** (DeepSeek V4 Flash)
   - Calculates custom N-P-K ratios, watering schedules, and organic compost recipes written in 4th-grade plain English.

---

## 🛠️ Hardware Specification (~₹910 / .00 BOM)

- **ESP32-CAM + MB Shield**: Edge microcontroller with OV2640 camera & WiFi.
- **Capacitive Soil Moisture Sensor v1.2**: Corrosion-resistant analog soil telemetry.
- **DHT11 Micro-Sensor**: Ambient humidity and temperature monitoring.

---

## 🚀 Quickstart

`ash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
`

---

## 📜 Changelog
See [CHANGELOG.md](./CHANGELOG.md) for full version history, architectural decisions, and release notes.
