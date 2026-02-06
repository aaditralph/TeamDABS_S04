import json
import os
from google import genai
from google.genai import types

# --- 1. CONFIGURATION ---
API_KEY = "AIzaSyDu0zWbInXxUC_gT6h8k1P4g8ACwxzc9gY"
REGISTERED_SERIALS = ["SN-12345", "SN-67890", "SN-99999"]
UNIT_THRESHOLD_KWH = 25  # Minimum required kWh to avoid flagging

client = genai.Client(api_key=API_KEY)

def analyze_meter_reading(image_path):
    # Security check: Does the file exist?
    if not os.path.exists(image_path):
        return json.dumps({"status": "Error", "message": "File not found at specified path."})

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Determine file type
    mime_type = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"

    # Precise Prompt for kWh and Serial Number
    prompt = """
    Identify the following from the electricity meter image:
    1. Serial Number: The unique identification number of the meter.
    2. Meter Reading: The current numerical value in kWh.
    Return ONLY a JSON object with keys: "serial_number" (string) and "reading_kwh" (number).
    """

    try:
        # Use 1.5-flash for reliability or 2.0-flash for speed
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )

        # Parse extracted data
        extracted = json.loads(response.text)
        sn = extracted.get("serial_number", "UNKNOWN")
        reading = extracted.get("reading_kwh", 0)

        # --- 2. LOGIC VALIDATION ---
        is_flagged = False
        reasons = []

        # Serial Check
        if sn not in REGISTERED_SERIALS:
            is_flagged = True
            reasons.append(f"Serial Number {sn} is not in the registered database.")

        # kWh Check
        if reading < UNIT_THRESHOLD_KWH:
            is_flagged = True
            reasons.append(f"Recorded reading of {reading} kWh is below the threshold of {UNIT_THRESHOLD_KWH} kWh.")

        # --- 3. FINAL JSON OUTPUT ---
        output = {
            "status": "Flagged" if is_flagged else "Verified",
            "meter_details": {
                "serial_number": sn,
                "reading_kwh": reading
            },
            "flagged_details": {
                "is_flagged": is_flagged,
                "reasons": reasons
            }
        }
        return json.dumps(output, indent=4)

    except Exception as e:
        return json.dumps({"status": "Error", "message": str(e)})

# --- 4. EXECUTION BLOCK ---
if __name__ == "__main__":
    # Use 'r' before the path to handle Windows backslashes correctly
    my_image_path = 
    
    print("--- Processing Meter Image ---")
    result = analyze_meter_reading(my_image_path)
    print(result)
