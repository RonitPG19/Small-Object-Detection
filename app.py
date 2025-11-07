from flask import Flask, render_template, request, jsonify
import torch
import torchvision
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import io
import uuid
import os

# ---------------------------
# Flask setup
# ---------------------------
app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "static/uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# ---------------------------
# Model Setup
# ---------------------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_SAVE_PATH = "models/fasterrcnn_dota.pth"  # Adjust path as needed

def get_model(num_classes=2):
    """Recreate the Faster R-CNN model from your training pipeline"""
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights="DEFAULT")
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)
    return model

# Initialize and load weights
model = get_model(num_classes=2)
model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# ---------------------------
# Helper: Draw predictions
# ---------------------------
def draw_predictions(img_tensor, pred, threshold=0.5):
    img = img_tensor.permute(1, 2, 0).cpu().numpy()
    pred = {k: v.cpu() for k, v in pred.items()}

    fig, ax = plt.subplots(1, figsize=(10, 8))
    ax.imshow(img)

    for box, score in zip(pred['boxes'], pred['scores']):
        if score > threshold:
            xmin, ymin, xmax, ymax = box
            rect = patches.Rectangle((xmin, ymin),
                                     xmax - xmin,
                                     ymax - ymin,
                                     linewidth=2,
                                     edgecolor='red',
                                     facecolor='none')
            ax.add_patch(rect)
            ax.text(xmin, ymin - 5, f'{score:.2f}',
                    bbox=dict(facecolor='red', alpha=0.5, pad=0),
                    color='white', fontsize=8)

    buf = io.BytesIO()
    plt.axis('off')
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    return buf

# ---------------------------
# Routes
# ---------------------------
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Save uploaded image
    filename = f"{uuid.uuid4().hex}.jpg"
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(img_path)

    # Open and preprocess image
    img = Image.open(img_path).convert("RGB")
    transform = torchvision.transforms.Compose([
        torchvision.transforms.ToTensor()
    ])
    img_tensor = transform(img)

    # Run inference
    with torch.no_grad():
        pred = model([img_tensor.to(DEVICE)])[0]

    # ---------------------------
    # Filter predictions by confidence threshold
    # ---------------------------
    threshold = 0.5  # 70%
    keep = pred["scores"] >= threshold
    filtered_boxes = pred["boxes"][keep]
    filtered_scores = pred["scores"][keep]

    filtered_pred = {
        "boxes": filtered_boxes,
        "scores": filtered_scores
    }

    # Draw predictions only for filtered results
    annotated = draw_predictions(img_tensor, filtered_pred, threshold=threshold)
    out_filename = f"annotated_{uuid.uuid4().hex}.png"
    out_path = os.path.join(app.config['UPLOAD_FOLDER'], out_filename)
    with open(out_path, "wb") as f:
        f.write(annotated.getbuffer())

    # Return image URL to frontend
    return jsonify({
    "result_image": f"/static/uploads/{out_filename}",
    "boxes": filtered_pred["boxes"].cpu().numpy().astype(float).tolist(),
    "scores": filtered_pred["scores"].cpu().numpy().astype(float).tolist() })



if __name__ == "__main__":
    app.run(debug=True)
