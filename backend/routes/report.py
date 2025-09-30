from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Body
from db import db
from bson.objectid import ObjectId
import os
from datetime import datetime
import shutil
from ml.report_service import analyze_and_generate_report
from fastapi.concurrency import run_in_threadpool
from utils.auth_utils import get_current_user

# Cloudinary config
import cloudinary
import cloudinary.uploader
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

router = APIRouter(prefix="/report", tags=["report"])

TMP_DIR = "tmp_uploads"
os.makedirs(TMP_DIR, exist_ok=True)


# ========== UPLOAD ==========
@router.post("/upload")
async def upload_report(
    image: UploadFile = File(...),
    location: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Upload image, analyze, save in DB + Cloudinary."""
    tmp_image_path = os.path.join(TMP_DIR, f"{ObjectId()}_{image.filename}")
    with open(tmp_image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # analyze with YOLO inference
    analysis = await run_in_threadpool(analyze_and_generate_report, tmp_image_path, location)
    report_struct = analysis["report"]
    preds = analysis["predictions"]
    annotated_path = analysis.get("annotated_image", tmp_image_path)

    # upload annotated image to Cloudinary
    image_url = ""
    try:
        img_upload = cloudinary.uploader.upload(
            annotated_path,
            folder="textile_images",
            use_filename=True,
            unique_filename=False,
            overwrite=True,
        )
        image_url = img_upload.get("secure_url", "")
    except Exception as e:
        print("Cloudinary image upload failed:", e)

    # save DB (no pdf_url anymore)
    report_doc = {
        "user_id": str(current_user["_id"]),
        "image_url": image_url,
        "defect_type": [p[0] for p in preds],
        "predictions": preds,
        "description": report_struct,
        "created_at": datetime.utcnow(),
        "archived": False,
    }
    result = await db.reports.insert_one(report_doc)
    report_doc["_id"] = str(result.inserted_id)

    # cleanup
    for path in [tmp_image_path, annotated_path]:
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass

    return {"message": "Report saved", "report": report_doc}


# ========== LIST ==========
@router.get("/", summary="Get current user's reports")
async def list_reports(current_user: dict = Depends(get_current_user)):
    uid = str(current_user["_id"])
    cursor = db.reports.find({"user_id": uid}).sort("created_at", -1)
    out = []
    async for r in cursor:
        r["_id"] = str(r["_id"])
        if isinstance(r.get("created_at"), datetime):
            r["created_at"] = r["created_at"].isoformat()
        out.append(r)
    return {"reports": out}


# ========== UPDATE ==========
@router.patch("/{report_id}", summary="Update report fields")
async def update_report(
    report_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    try:
        obj_id = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report id")

    uid = str(current_user["_id"])
    existing = await db.reports.find_one({"_id": obj_id, "user_id": uid})
    if not existing:
        raise HTTPException(status_code=404, detail="Report not found")

    update_doc = {}
    if "summary" in payload:
        update_doc["description.summary"] = payload["summary"]
    if "archived" in payload:
        update_doc["archived"] = bool(payload["archived"])

    if not update_doc:
        raise HTTPException(status_code=400, detail="No fields provided")

    await db.reports.update_one({"_id": obj_id}, {"$set": update_doc})
    updated = await db.reports.find_one({"_id": obj_id})
    updated["_id"] = str(updated["_id"])
    if isinstance(updated.get("created_at"), datetime):
        updated["created_at"] = updated["created_at"].isoformat()
    return {"report": updated}


# ========== DELETE ==========
@router.delete("/{report_id}", summary="Delete a report")
async def delete_report(report_id: str, current_user: dict = Depends(get_current_user)):
    try:
        obj_id = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report id")

    uid = str(current_user["_id"])
    res = await db.reports.delete_one({"_id": obj_id, "user_id": uid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted"}
