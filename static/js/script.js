document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const canvasArea = document.getElementById("canvasArea");
  const uploadPrompt = document.getElementById("uploadPrompt");
  const previewCanvas = document.getElementById("previewCanvas");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resetBtn = document.getElementById("resetBtn");
  const loadingState = document.getElementById("loadingState");
  const resultsList = document.getElementById("resultsList");
  const objectCount = document.getElementById("objectCount");
  const avgConfidence = document.getElementById("avgConfidence");
  const statusValue = document.getElementById("statusValue");

  let uploadedFile = null;

  // -----------------------------
  // DRAG & DROP FUNCTIONALITY
  // -----------------------------
  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    canvasArea.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  ["dragenter", "dragover"].forEach(eventName => {
    canvasArea.addEventListener(eventName, () => {
      canvasArea.classList.add("hovered");
    });
  });

  ["dragleave", "drop"].forEach(eventName => {
    canvasArea.addEventListener(eventName, () => {
      canvasArea.classList.remove("hovered");
    });
  });

  canvasArea.addEventListener("drop", e => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  canvasArea.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", e => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  // -----------------------------
  // HANDLE FILE SELECTION
  // -----------------------------
  function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPEG, WEBP).");
      return;
    }

    uploadedFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      previewCanvas.src = e.target.result;
      previewCanvas.style.display = "block";
      uploadPrompt.classList.add("hidden");
      canvasArea.classList.add("has-image");
      analyzeBtn.disabled = false;
      resetBtn.style.display = "inline-block";
    };
    reader.readAsDataURL(file);
  }

  // -----------------------------
  // RUN DETECTION
  // -----------------------------
  analyzeBtn.addEventListener("click", async () => {
    if (!uploadedFile) return;
    analyzeBtn.disabled = true;
    loadingState.classList.add("active");
    statusValue.textContent = "Processing...";

    const formData = new FormData();
    formData.append("image", uploadedFile);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        throw new Error(data.error);
      }

      // Update image with detection output
      previewCanvas.src = data.result_image;
      updateMetrics(data);

      statusValue.textContent = "Completed ✅";
    } catch (err) {
      console.error("Error:", err);
      statusValue.textContent = "Error ❌";
    } finally {
      loadingState.classList.remove("active");
      analyzeBtn.disabled = false;
    }
  });

  // -----------------------------
  // UPDATE DETECTION RESULTS
  // -----------------------------
  function updateMetrics(data) {
    const boxes = data.boxes || [];
    const scores = data.scores || [];
    const count = boxes.length;
    const avgScore = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length) * 100
      : 0;

    objectCount.textContent = count;
    avgConfidence.textContent = `${avgScore.toFixed(1)}%`;

    resultsList.innerHTML = "";

    if (count === 0) {
      resultsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛰️</div>
          <div class="empty-text">No objects detected</div>
        </div>`;
      return;
    }

    boxes.forEach((_, i) => {
      const conf = (scores[i] * 100).toFixed(1);
      const item = document.createElement("div");
      item.classList.add("result-item");
      item.innerHTML = `
        <div class="result-info">
          <div class="result-icon">📦</div>
          <div class="result-name">Object ${i + 1}</div>
        </div>
        <div class="result-confidence">${conf}%</div>
      `;
      resultsList.appendChild(item);
    });
  }

  // -----------------------------
  // RESET EVERYTHING
  // -----------------------------
  resetBtn.addEventListener("click", () => {
    uploadedFile = null;
    previewCanvas.src = "";
    previewCanvas.style.display = "none";
    uploadPrompt.classList.remove("hidden");
    canvasArea.classList.remove("has-image");
    analyzeBtn.disabled = true;
    resetBtn.style.display = "none";
    statusValue.textContent = "—";
    resultsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛰️</div>
        <div class="empty-text">Awaiting image input and analysis</div>
      </div>`;
    objectCount.textContent = "0";
    avgConfidence.textContent = "0%";
  });
});
