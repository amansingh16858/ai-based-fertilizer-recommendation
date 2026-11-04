import { SoilTelemetry } from '../types';

let simulatedSoilMoisture = 48.0;
let simulatedTemperature = 26.0;
let simulatedHumidity = 62.0;

let lastDeliveredMoisture = 18.0;

export async function fetchESP32Telemetry(deviceIp?: string): Promise<SoilTelemetry> {
  // Priority: 1) user IP if provided, 2) Vite proxy (/telemetry), 3) direct USB bridge
  const targets = deviceIp && deviceIp.trim() !== '' 
    ? [deviceIp.trim()] 
    : ['/telemetry', 'http://127.0.0.1:5000/telemetry', 'http://localhost:5000/telemetry'];

  for (const target of targets) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const url = target.startsWith('http') || target.startsWith('/')
        ? target 
        : `http://${target}/telemetry`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.connected && json.soil_moisture !== null) {
          const rawM = Number(json.soil_moisture);
          
          // Industrial Deadband Filter (Noise Gate):
          // Real-world capacitive probes have +/- 2-3% natural AC/USB electrical noise.
          // Lock the reading rock-solid; only update when there is a genuine physical change (>= 2%).
          if (Math.abs(rawM - lastDeliveredMoisture) >= 2.0) {
            lastDeliveredMoisture = Math.round(rawM);
          }
          
          return {
            moisturePercent: Math.round(lastDeliveredMoisture),
            temperatureC: Number((json.temperature ?? 27.5).toFixed(1)),
            humidityPercent: Number((json.humidity ?? 62).toFixed(1)),
            timestamp: new Date().toLocaleTimeString(),
            isSimulated: false,
            isDhtLive: Boolean(json.dht_connected)
          };
        }
      }
    } catch {
      // Try next target or fallback to simulation
    }
  }

  // Stable baseline when probe is offline (no wild jitter)
  return {
    moisturePercent: Number(simulatedSoilMoisture.toFixed(1)),
    temperatureC: Number(simulatedTemperature.toFixed(1)),
    humidityPercent: Number(simulatedHumidity.toFixed(1)),
    timestamp: new Date().toLocaleTimeString(),
    isSimulated: true
  };
}

export async function captureESP32Image(deviceIp: string): Promise<string> {
  const res = await fetch(`http://${deviceIp}/capture`);
  if (!res.ok) throw new Error('ESP32-CAM capture failed');
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
