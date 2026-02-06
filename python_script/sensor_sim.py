import requests
import time
import random
import json

# CONFIGURATION
# ------------------------------------------------------
# If n8n is on the same laptop, use localhost. 
# If n8n is on another machine, use the ngrok URL.
WEBHOOK_URL = "http://localhost:5678/webhook/compost-monitor"
SOCIETY_ID = "SOC_HACKATHON_01"

def generate_sensor_data(day, scenario="NORMAL"):
    """
    Generates fake sensor readings.
    Scenario 'NORMAL': Ideal conditions.
    Scenario 'CRITICAL_DRY': Moisture drops dangerous low.
    Scenario 'CRITICAL_HOT': Temp goes too high.
    """
    
    # Base values for a healthy pile
    temp = random.uniform(55, 65)  # Ideal thermophilic temp
    moisture = random.uniform(45, 55) # Ideal moisture
    ph = random.uniform(6.5, 7.5)   # Ideal pH

    if scenario == "CRITICAL_DRY":
        moisture = random.uniform(10, 15) # Way too dry
        temp = random.uniform(25, 30)     # Temp drops because bacteria die
        
    elif scenario == "CRITICAL_HOT":
        temp = random.uniform(75, 80)     # Fire risk!
        
    return {
        "society_id": SOCIETY_ID,
        "sensors": {
            "temperature_c": round(temp, 1),
            "moisture_percent": round(moisture, 1),
            "ph_level": round(ph, 1),
            "day_of_cycle": day
        }
    }

def main():
    print(f"--- STARTING VIRTUAL SENSOR FOR {SOCIETY_ID} ---")
    print(f"Target: {WEBHOOK_URL}")
    print("Press Ctrl+C to stop.\n")

    day_counter = 5
    
    while True:
        # HACKATHON TRICK: 
        # Randomly trigger a 'CRITICAL_DRY' event 20% of the time 
        # so judges see the alert system work.
        current_scenario = "NORMAL"
        if random.random() < 0.2: 
            current_scenario = "CRITICAL_DRY"
            print(">>> SIMULATING FAILURE EVENT! <<<")

        # 1. Generate Data
        payload = generate_sensor_data(day_counter, current_scenario)
        
        # 2. Send to n8n
        try:
            response = requests.post(WEBHOOK_URL, json=payload)
            
            if response.status_code == 200:
                print(f"[Day {day_counter}] Sent {current_scenario} data: {payload['sensors']}")
            else:
                print(f"Error: Server returned {response.status_code}")
                
        except Exception as e:
            print(f"Connection Failed: {e}")

        # 3. Wait before next reading
        # In real life: 30 mins. For Hackathon: 5 seconds.
        time.sleep(60)
        
        # Increment day slowly to simulate time passing
        if random.random() < 0.1: # Every ~10 readings, advance a day
            day_counter += 1

if __name__ == "__main__":
    main()