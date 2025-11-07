# 🛰️ Satellite Small Object Detection

This repository contains a **Google Colab–ready training pipeline** for small object detection in satellite imagery and a **Flask-based web application** for visualizing detections.  
The pipline is optimized for quick experimentation, dataset customization, and end-to-end model training on Colab GPUs.

> ⚠️ **Note:** The training pipline notebook is designed **exclusively for Google Colab** and may not function correctly in local environments without modification.

---

## 🚀 Features

- ✅ Pre-configured for **Google Colab**
- ✅ **Faster R-CNN**–based small object detection pipeline  
- ✅ Support for **custom satellite datasets** (e.g., DOTA)  
- ✅ Integrated **training, validation, and inference** workflow  
- ✅ **Flask-based frontend** for result visualization and testing  
- ✅ Automatic environment setup and dataset handling  
- ✅ Model weights available via **Git LFS (Large File Storage)**  

---

## 📘 Getting Started

### 1️⃣ Open in Google Colab  
Click the button below to open and run the notebook directly in Colab:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/RonitPG19/Small-Object-Detection/blob/main/TrainingPipelineSmallObjectDetection.ipynb)

---

### 2️⃣ Upload the Notebook  
Alternatively, you can upload `TrainingPipelineSmallObjectDetection.ipynb` manually to your Google Drive and open it in Colab.

---

## 🧰 Requirements  

These dependencies are automatically installed in the notebook or required for the Flask web app:

- `torch`, `torchvision`
- `flask`
- `opencv-python`
- `matplotlib`
- `Pillow`
- `numpy`
- `tqdm`
- `git-lfs` (for downloading model weights)

---

## 📦 Model Weights (Git LFS)

This repository uses **Git Large File Storage (LFS)** to manage and store large model files such as trained `.pth` weights.

### To clone the repository along with model weights and run the web-app:
```bash
# Install Git LFS if not already installed
git lfs install

# Clone the repository and pull large files
git clone https://github.com/RonitPG19/Small-Object-Detection.git
cd Small-Object-Detection
git lfs pull
```
- ⚠️ Skipping git lfs pull may result in placeholder text files instead of actual model weights.

## 🌐 Flask Web Application

After training your model using the Colab notebook, you can use the Flask app provided in this repository to test and visualize detections locally.

## ▶️ Run the Web App

1. Clone this repository (with Git LFS enabled):
```bash
git clone https://github.com/RonitPG19/Small-Object-Detection.git
cd Small-Object-Detection
git lfs pull
```
2. Start The Flask Server:
```bash
python app.py
```
## 🧪 Project Workflow

1 .Train the model using the Colab notebook on your dataset.

2. Export the trained weights (e.g., model.pth).

3. Place the weights in the Flask app directory (or modify app.py to point to your weight file).

4. Run the Flask app to visualize detections interactively.

## 🎥 Demo Video

- Watch the full walkthrough of the system below:

https://www.loom.com/share/8f5a3d7de27d416b9336fbe258a40b05

## 👨‍💻 Author

- Ronit Girglani
- Kenil Patel
- Kirtan Visanagara
- Shubham Pathak
- Bhuvan Rathod
