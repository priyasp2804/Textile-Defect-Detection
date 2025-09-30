# ml/report_service.py
from ml.yolo_infer import predict_image

def analyze_and_generate_report(img_path: str, location: str = None, prob_threshold: float = 0.20):
    """
    Runs YOLO API inference and returns:
    {
      "predictions": [("defect free" | "defect detected", 1.0)],
      "report": { "summary": ..., "overall_severity": ..., "details": [...] },
      "annotated_image": "path/to/annotated.jpg"
    }
    """
    labels, annotated_path = predict_image(img_path)

    if labels == ["defect free"]:
        report = {
            "summary": "No defects detected",
            "overall_severity": "none",
            "details": [{
                "title": "No defect detected",
                "severity": "none",
                "description": "No defects detected. Fabric quality appears normal.",
                "recommendation": "No action required."
            }]
        }
    else:
        report = {
            "summary": "Defect(s) detected",
            "overall_severity": "high",
            "details": [{
                "title": "Fabric defect detected",
                "severity": "high",
                "description": "Defects were detected in the fabric.",
                "recommendation": "Inspect and reprocess the affected area."
            }]
        }

    preds = [(labels[0], 1.0)]
    return {"predictions": preds, "report": report, "annotated_image": annotated_path}
