# routes/inspection.py
from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil, os, uuid
from fastapi.concurrency import run_in_threadpool
from ml.report_service import analyze_and_generate_report

router = APIRouter(prefix="/inspection", tags=["Inspection"])

# Temp folder for uploaded images
UPLOAD_TMP = "tmp_uploads"
os.makedirs(UPLOAD_TMP, exist_ok=True)


@router.post("/analyze")
async def analyze(file: UploadFile = File(...), location: str = None):
    """
    Accepts an image, runs model inference, 
    and generates an NLP-based quality report.
    """
    # unique filename to avoid overwrite
    tmp_filename = f"{uuid.uuid4().hex}_{file.filename}"
    tmp_path = os.path.join(UPLOAD_TMP, tmp_filename)

    try:
        # Save uploaded file to disk
        with open(tmp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run ML + NLP pipeline (blocking → threadpool)
        result = await run_in_threadpool(analyze_and_generate_report, tmp_path, location)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    finally:
        # Cleanup temp file
        try:
            file.file.close()
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass

    return result
