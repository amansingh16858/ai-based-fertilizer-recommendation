import serial
import threading
import json
import time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

latest_telemetry = {
    "connected": True,
    "soil_moisture": 18,
    "temperature": 25.0,
    "humidity": 65.0,
    "raw_adc": 250,
    "status": "Dry (In Air)",
    "updated_at": time.time()
}

class TelemetryHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        try:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            self.send_header('Access-Control-Allow-Private-Network', 'true')
            self.end_headers()
        except Exception:
            pass

    def do_GET(self):
        try:
            if self.path == '/telemetry' or self.path == '/api/telemetry':
                is_live = (time.time() - latest_telemetry['updated_at'] < 10.0) and latest_telemetry.get('connected', False)
                
                payload = dict(latest_telemetry)
                payload['connected'] = is_live
                if not is_live:
                    payload['soil_moisture'] = None
                    payload['status'] = "Probe Disconnected"
                    
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Private-Network', 'true')
                self.end_headers()
                self.wfile.write(json.dumps(payload).encode('utf-8'))
            else:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b"<h1>AgroVeda Bridge Online</h1>")
        except Exception:
            pass

    def log_message(self, format, *args):
        pass

def serial_reader_thread():
    global latest_telemetry
    while True:
        try:
            ser = serial.Serial('COM3', 115200, timeout=1)
            ser.dtr = False
            ser.rts = False
            print("[Bridge] Serial connection established on COM3!")
            
            while True:
                line = ser.readline().decode(errors='ignore').strip()
                if line.startswith('{') and line.endswith('}'):
                    try:
                        data = json.loads(line)
                        latest_telemetry['connected'] = data.get('connected', True)
                        latest_telemetry['soil_moisture'] = data.get('soil_moisture', latest_telemetry['soil_moisture'])
                        latest_telemetry['raw_adc'] = data.get('raw_adc', latest_telemetry['raw_adc'])
                        latest_telemetry['temperature'] = data.get('temperature', 25.0)
                        latest_telemetry['humidity'] = data.get('humidity', 60.0)
                        latest_telemetry['dht_connected'] = data.get('dht_connected', False)
                        latest_telemetry['status'] = data.get('status', 'Optimal')
                        latest_telemetry['updated_at'] = time.time()
                    except Exception:
                        pass
        except Exception as e:
            time.sleep(1)

if __name__ == '__main__':
    t = threading.Thread(target=serial_reader_thread, daemon=True)
    t.start()
    
    server_address = ('0.0.0.0', 5000)
    httpd = ThreadingHTTPServer(server_address, TelemetryHandler)
    print("[Bridge] Telemetry bridge running on http://0.0.0.0:5000")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
