import requests
import json
from ultralytics import YOLO

# --- CONFIGURATION ---
N8N_URL = "http://localhost:5678/webhook/89774501-6fa5-4a2c-9aaa-808cb694cda3"
COMPOST_IMG_PATH = r"E:\GreenTaxProject\data\raw\val\images\TMK-500-Organic-Waste-Composting-Machine-with-Built-in-Crusher-640x360-avc1-mp4a_mp4-0006_jpg.rf.1738db6e35c25912a4ae07b547fe46be.jpg"
METER_IMG_PATH = r"E:\GreenTaxProject\data\raw\val\images\e:\Downloads\WhatsApp Image 2026-02-07 at 01.23.43.jpeg"
YOLO_PATH = r"E:\GreenTaxProject\runs\detect\green_tax_model\weights\compost_yolo_v1.pt"

def main():
    # 1. Run YOLO locally on the COMPOST image only
    model = YOLO(YOLO_PATH)
    results = model.predict(COMPOST_IMG_PATH, save=False, verbose=False, conf=0.5)
    machine_found = len(results[0].boxes) > 0

    # 2. Prepare the JSON Payload
    payload = {
        "reportId": "RPT-DUAL-001",
        "societyId": "SOC-MUM-04",
        "machine_exists": str(machine_found), # Result of local YOLO
        "submittedBy": "Secretary_01"
    }

    # 3. Prepare BOTH files for upload
    # We use distinct keys: 'compost_file' and 'meter_file'
    files = {
        'compost_file': ('machine.jpg', open(COMPOST_IMG_PATH, 'rb'), 'image/jpeg'),
        'meter_file': ('meter.jpg', open(METER_IMG_PATH, 'rb'), 'image/jpeg')
    }

    # 4. Send the Request
    print(f"Sending Dual Images... Machine Found: {machine_found}")
    try:
        requests.post(N8N_URL, data={'json_payload': json.dumps(payload)}, files=files)
        print("Upload Complete.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()