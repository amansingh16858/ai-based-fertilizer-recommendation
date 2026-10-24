import { SoilTelemetry } from '../types';

let simulatedSoilMoisture = 28.5;
let simulatedTemperature = 31.4;
let simulatedHumidity = 66.0;

let lastDeliveredMoisture = 24.0;

export async function fetchESP32Telemetry(deviceIp?: string): Promise<SoilTelemetry> {
  // If user specified an IP, use that; otherwise auto-probe local USB bridge (127.0.0.1:5000)
  const targets = deviceIp && deviceIp.trim() !== '' 
    ? [deviceIp.trim()] 
    : ['127.0.0.1:5000', 'localhost:5000'];

  for (const target of targets) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const url = target.startsWith('http') ? `${target}/telemetry` : `http://${target}/telemetry`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.connected && json.soil_moisture !== null) {
          const rawM = Number(json.soil_moisture);
          
          // Industrial Deadband Filter (Noise Gate):
          // Real-world capacitive probes have +/- 2-3% natural AC/USB electrical noise.
          // Lock the reading rock-solid; only update when there is a genuine physical change (>= 4.5%).
          if (Math.abs(rawM - lastDeliveredMoisture) >= 4.5) {
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
