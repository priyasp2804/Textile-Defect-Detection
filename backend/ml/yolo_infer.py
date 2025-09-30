# ml/yolo_infer.py
import os, uuid
from roboflow import Roboflow

RF_API_KEY = os.getenv("ROBOFLOW_API_KEY")
WORKSPACE = "projects-5kp6j"      # check your workspace slug
PROJECT = "fabric-defect-x4mc4-qiwir"
VERSION = 1

rf = Roboflow(api_key=RF_API_KEY)
project = rf.workspace(WORKSPACE).project(PROJECT)
model = project.version(VERSION).model

def predict_image(img_path: str, conf: float = 0.5, out_dir: str = "predicted_outputs"):
    os.makedirs(out_dir, exist_ok=True)
    save_path = os.path.join(out_dir, f"pred_{uuid.uuid4().hex}.jpg")

    # Save annotated image
    model.predict(img_path, confidence=conf).save(save_path)

    # JSON response
    result = model.predict(img_path, confidence=conf).json()
    preds = result.get("predictions", [])

    if not preds:
        return ["defect free"], save_path
    else:
        return ["defect detected"], save_path
