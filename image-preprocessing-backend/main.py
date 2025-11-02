from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, ImageFilter, ImageEnhance
import io
import base64
import uuid
from datetime import datetime
import numpy as np

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
images_store = {}

# ----------------------
# Helper Functions
# ----------------------
def image_to_base64(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"

def calculate_histogram(image: Image.Image) -> dict:
    if image.mode != "RGB":
        image = image.convert("RGB")
    r, g, b = image.split()
    gray = image.convert("L")
    return {
        "red": r.histogram(),
        "green": g.histogram(),
        "blue": b.histogram(),
        "grayscale": gray.histogram()
    }

# ----------------------
# Image Endpoints
# ----------------------
@app.post("/images")
async def upload_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_id = str(uuid.uuid4())
        images_store[image_id] = {
            "original": image.copy(),
            "image": image.copy(),
            "filename": file.filename,
            "created_at": datetime.now().isoformat(),
            "size": image.size,
            "history": []
        }
        return {
            "id": image_id,
            "filename": file.filename,
            "data": image_to_base64(image),
            "size": image.size,
            "created_at": images_store[image_id]["created_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/images")
async def list_images():
    images = []
    for image_id, img_data in images_store.items():
        images.append({
            "id": image_id,
            "filename": img_data["filename"],
            "data": image_to_base64(img_data["image"]),
            "size": img_data["size"],
            "created_at": img_data["created_at"]
        })
    return {"images": images}

@app.get("/images/{image_id}")
async def get_image(image_id: str):
    if image_id not in images_store:
        raise HTTPException(status_code=404, detail="Image not found")
    img_data = images_store[image_id]
    return {
        "id": image_id,
        "filename": img_data["filename"],
        "data": image_to_base64(img_data["image"]),
        "size": img_data["size"],
        "created_at": img_data["created_at"]
    }

@app.delete("/images/{image_id}")
async def delete_image(image_id: str):
    if image_id not in images_store:
        raise HTTPException(status_code=404, detail="Image not found")
    del images_store[image_id]
    return {"message": "Image deleted"}

# ----------------------
# Preview Endpoint
# ----------------------
@app.post("/images/{image_id}/preview")
async def preview_transform(image_id: str, transformations: dict):
    if image_id not in images_store:
        raise HTTPException(status_code=404, detail="Image not found")

    image = images_store[image_id]["original"].copy()
    applied_params = {}

    # ----------------- Transformations -----------------
    # Grayscale
    if transformations.get("grayscale"):
        image = ImageOps.grayscale(image)
        applied_params["grayscale"] = True

    # Blur
    if "blur" in transformations:
        radius = transformations["blur"]
        image = image.filter(ImageFilter.GaussianBlur(radius=radius))
        applied_params["blur"] = radius

    # Brightness
    if "brightness" in transformations:
        factor = transformations["brightness"]
        image = ImageEnhance.Brightness(image).enhance(factor)
        applied_params["brightness"] = factor

    # Contrast
    if "contrast" in transformations:
        factor = transformations["contrast"]
        image = ImageEnhance.Contrast(image).enhance(factor)
        applied_params["contrast"] = factor

    # Saturation
    if "saturation" in transformations:
        factor = transformations["saturation"]
        image = ImageEnhance.Color(image).enhance(factor)
        applied_params["saturation"] = factor

    # Threshold
    if "threshold" in transformations:
        threshold = transformations["threshold"]
        image = image.convert("L")
        image = image.point(lambda x: 255 if x > threshold else 0, "1")
        applied_params["threshold"] = threshold

    # Rotate
    if "rotate" in transformations:
        angle = transformations["rotate"]
        image = image.rotate(angle, expand=True)
        applied_params["rotate"] = angle

    # Flip Horizontal / Vertical
    if transformations.get("flip_horizontal"):
        image = ImageOps.mirror(image)
        applied_params["flip_horizontal"] = True
    if transformations.get("flip_vertical"):
        image = ImageOps.flip(image)
        applied_params["flip_vertical"] = True

    # Resize
    if "resize" in transformations:
        width, height = transformations["resize"]
        image = image.resize((int(width), int(height)), Image.Resampling.LANCZOS)
        applied_params["resize"] = {"width": int(width), "height": int(height)}

    # Normalize
    if transformations.get("normalize"):
        arr = np.array(image)
        if len(arr.shape) == 3:
            for i in range(arr.shape[2]):
                ch = arr[:, :, i]
                min_c, max_c = ch.min(), ch.max()
                if max_c > min_c:
                    arr[:, :, i] = ((ch - min_c) / (max_c - min_c) * 255).astype(np.uint8)
        image = Image.fromarray(arr)
        applied_params["normalize"] = True

    # Histogram Equalization
    if transformations.get("histogram_equalization"):
        if image.mode != "RGB":
            image = image.convert("RGB")
        r, g, b = image.split()
        image = Image.merge("RGB", (ImageOps.equalize(r), ImageOps.equalize(g), ImageOps.equalize(b)))
        applied_params["histogram_equalization"] = True

    # Channel Split
    if "channel_split" in transformations:
        channel = transformations["channel_split"].lower()
        if image.mode != "RGB":
            image = image.convert("RGB")
        r, g, b = image.split()
        zero = Image.new("L", image.size)
        if channel == "red":
            image = Image.merge("RGB", (r, zero, zero))
        elif channel == "green":
            image = Image.merge("RGB", (zero, g, zero))
        elif channel == "blue":
            image = Image.merge("RGB", (zero, zero, b))
        else:
            raise HTTPException(status_code=400, detail="Invalid channel for channel_split")
        applied_params["channel_split"] = channel

    # ----------------- Return -----------------
    return {
        "id": image_id,
        "data": image_to_base64(image),
        "size": image.size,
        "applied_params": applied_params
    }

# ----------------------
# Transform Endpoint (save permanently)
# ----------------------
@app.post("/images/{image_id}/transform")
async def transform_image(image_id: str, transformations: dict):
    if image_id not in images_store:
        raise HTTPException(status_code=404, detail="Image not found")

    # Use preview logic to get transformed image and applied_params
    preview_response = await preview_transform(image_id, transformations)
    image_base64 = preview_response["data"]

    # Save transformed image
    image = Image.open(io.BytesIO(base64.b64decode(image_base64.split(",")[1])))
    images_store[image_id]["image"] = image
    images_store[image_id]["size"] = image.size

    # Save history
    images_store[image_id]["history"].append({
        "params": preview_response["applied_params"],
        "applied_at": datetime.now().isoformat()
    })

    return {
        "id": image_id,
        "data": image_base64,
        "size": image.size,
        "applied_params": preview_response["applied_params"]
    }

# ----------------------
# History Endpoint
# ----------------------
@app.get("/images/{image_id}/history")
async def get_history(image_id: str):
    if image_id not in images_store:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"history": images_store[image_id].get("history", [])}

# ----------------------
# Histograms Endpoint
# ----------------------
@app.get("/images/{image_id}/histograms")
async def get_both_histograms(image_id: str):
    if image_id not in images_store:
        raise HTTPException(status_code=404, detail="Image not found")
    return {
        "original": calculate_histogram(images_store[image_id]["original"]),
        "processed": calculate_histogram(images_store[image_id]["image"])
    }

# ----------------------
# Run server
# ----------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
