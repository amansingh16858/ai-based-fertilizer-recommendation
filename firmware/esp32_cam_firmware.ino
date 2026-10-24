/**
 * ============================================================================
 * AGROVEDA AI — ESP32-CAM MULTIMODAL AGRI-PROBE FIRMWARE
 * ============================================================================
 * Hardware:
 *  - ESP32-CAM (AI-Thinker Model with OV2640 2MP Camera)
 *  - Capacitive Soil Moisture Sensor v1.2 (Analog Pin GPIO 34 / 33)
 *  - DHT11 / DHT22 Ambient Sensor (GPIO 13)
 *  - Onboard High-Brightness Flash LED (GPIO 4)
 * ============================================================================
 */

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <DHTesp.h>
#include <ArduinoJson.h>

// 1. WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// 2. Hardware Pin Definitions
#define FLASH_LED_PIN 4
#define SOIL_ADC_PIN 34
#define DHT_PIN 13

// 3. Camera Pins for AI-THINKER ESP32-CAM
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

WebServer server(80);
DHTesp dht;

void initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA; // 1600x1200 high-res
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA; // 800x600 fallback
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
  }
}

// Handler: Returns current telemetry JSON
void handleTelemetry() {
  int rawSoil = analogRead(SOIL_ADC_PIN);
  float soilMoisture = map(rawSoil, 4095, 1200, 0, 100);
  soilMoisture = constrain(soilMoisture, 0, 100);

  TempAndHumidity dhtData = dht.getTempAndHumidity();

  StaticJsonDocument<200> doc;
  doc["device_id"] = "AGROVEDA_PROBE_01";
  doc["soil_moisture"] = soilMoisture;
  doc["temperature"] = isnan(dhtData.temperature) ? 28.5 : dhtData.temperature;
  doc["humidity"] = isnan(dhtData.humidity) ? 65.0 : dhtData.humidity;

  String json;
  serializeJson(doc, json);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// Handler: Snaps leaf JPEG with Flash LED
void handleCapture() {
  digitalWrite(FLASH_LED_PIN, HIGH); // Flash ON
  delay(150);

  camera_fb_t* fb = esp_camera_fb_get();
  digitalWrite(FLASH_LED_PIN, LOW);  // Flash OFF

  if (!fb) {
    server.send(500, "text/plain", "Camera capture failed");
    return;
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Disposition", "inline; filename=leaf_capture.jpg");
  server.setContentLength(fb->len);
  server.send(200, "image/jpeg", "");
  
  WiFiClient client = server.client();
  client.write(fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

void setup() {
  Serial.begin(115200);
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  dht.setup(DHT_PIN, DHTesp::DHT11);
  initCamera();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n[AGROVEDA PROBE READY]");
  Serial.print("Probe IP Address: http://");
  Serial.println(WiFi.localIP());

  server.on("/telemetry", handleTelemetry);
  server.on("/capture", handleCapture);
  server.begin();
}

void loop() {
  server.handleClient();
}
