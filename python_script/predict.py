import sys
import json
from ultralytics import YOLO
import os

model = YOLO(r"../Weights/compost_yolo_v1.pt")

def detect_composter(image_path):
    if not os.path.exists(image_path):
        return json.dumps({"status": "error", "message": "Image file not found"})

    results = model.predict(image_path, save=False, conf=0.5)

    detections = []
    for result in results:
        for box in result.boxes:
            detection = {
                "class": int(box.cls[0]),
                "class_name": result.names[int(box.cls[0])],
                "confidence": float(box.conf[0]),
                "bbox": {
                    "x1": float(box.xyxy[0][0]),
                    "y1": float(box.xyxy[0][1]),
                    "x2": float(box.xyxy[0][2]),
                    "y2": float(box.xyxy[0][3])
                }
            }
            detections.append(detection)

    output = {
        "status": "success",
        "image_path": image_path,
        "total_detections": len(detections),
        "detections": detections
    }

    return json.dumps(output, indent=2)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = detect_composter(image_path)
    print(result)
