// /app/lib/beautifier.js
// Full Screenshot Beautifier logic for Next.js + React (Tailwind UI)
// Call initBeautifier(canvasRef) from a client component/useEffect.

export function initBeautifier(canvasRef) {
  if (!canvasRef.current) return;

  // ---------- State ----------
  const state = {
    image: null,
    width: 1200,
    height: 628,
    backgroundColor: "#2d3436",
    padding: 60,
    presetName: "linkedin",
    crop: {
      active: false,
      sel: null,
      dragMode: "none",
      handle: null,
      start: { mx: 0, my: 0 },
      selStart: null,
    },
  };

  // ---------- Presets ----------
  const PRESETS = {
    linkedin: { w: 1200, h: 628 },
    instagram: { w: 1080, h: 1080 },
    facebook: { w: 1200, h: 630 },
    reddit: { w: 1200, h: 800 },
  };

  // ---------- DOM Refs ----------
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const uploadInput = document.getElementById("upload-image");
  const dropZone = document.getElementById("drop-zone");
  const dropHint = document.getElementById("drop-hint");
  const presetsContainer = document.getElementById("presets");
  const customWidthInput = document.getElementById("custom-width");
  const customHeightInput = document.getElementById("custom-height");
  const bgColorInput = document.getElementById("bg-color");
  const paddingSlider = document.getElementById("padding-slider");
  const paddingValueLabel = document.getElementById("padding-value");
  const exportBtn = document.getElementById("export-png");
  const copyBtn = document.getElementById("copy-image");
  const messageEl = document.getElementById("message");

  const startCropBtn = document.getElementById("start-crop");
  const applyCropBtn = document.getElementById("apply-crop");
  const cancelCropBtn = document.getElementById("cancel-crop");
  const cropHintEl = document.getElementById("crop-hint");

  // ---------- Helpers ----------
  const showMessage = (text, timeout = 2500) => {
    if (!messageEl) return;
    messageEl.textContent = text;
    if (timeout > 0) {
      clearTimeout(showMessage._t);
      showMessage._t = setTimeout(() => (messageEl.textContent = ""), timeout);
    }
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function setCanvasLogicalSize(width, height) {
    const ratio = window.devicePixelRatio || 1;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function fitImageToArea(imgW, imgH, areaW, areaH) {
    const scale = Math.min(areaW / imgW, areaH / imgH);
    return { w: imgW * scale, h: imgH * scale, scale };
  }

  function getImageDrawInfo() {
    if (!state.image) return null;
    const maxW = Math.max(1, state.width - 2 * state.padding);
    const maxH = Math.max(1, state.height - 2 * state.padding);
    const fit = fitImageToArea(
      state.image.naturalWidth,
      state.image.naturalHeight,
      maxW,
      maxH
    );
    const x = Math.round((state.width - fit.w) / 2);
    const y = Math.round((state.height - fit.h) / 2);
    return { x, y, w: fit.w, h: fit.h, scale: fit.scale };
  }

  // ---------- Render ----------
  function render() {
    if (!ctx) return;

    // Keep UI inputs in sync if they exist
    if (customWidthInput) customWidthInput.value = state.width;
    if (customHeightInput) customHeightInput.value = state.height;
    if (bgColorInput) bgColorInput.value = state.backgroundColor;
    if (paddingSlider) paddingSlider.value = state.padding;
    if (paddingValueLabel) paddingValueLabel.textContent = state.padding;

    setCanvasLogicalSize(state.width, state.height);

    ctx.clearRect(0, 0, state.width, state.height);
    ctx.fillStyle = state.backgroundColor;
    ctx.fillRect(0, 0, state.width, state.height);

    if (!state.image) {
      const innerW = Math.max(0, state.width - 2 * state.padding);
      const innerH = Math.max(0, state.height - 2 * state.padding);
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1;
      ctx.strokeRect(state.padding + 0.5, state.padding + 0.5, innerW - 1, innerH - 1);
      ctx.restore();

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = '14px system-ui, "Segoe UI", Roboto';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Upload an image or drop it here", state.width / 2, state.height / 2);
      return;
    }

    const info = getImageDrawInfo();
    try {
      ctx.drawImage(state.image, info.x, info.y, info.w, info.h);
    } catch (err) {
      console.error("drawImage error", err);
      showMessage("Failed to render image", 3000);
    }

    if (state.crop.active && state.crop.sel) drawCropOverlay(info);
  }

  function drawCropOverlay(info) {
    const { x, y, scale } = info;
    const sel = state.crop.sel;
    const sx = x + sel.x * scale;
    const sy = y + sel.y * scale;
    const sw = sel.w * scale;
    const sh = sel.h * scale;

    ctx.save();
    // dim outside
    ctx.fillStyle = "rgba(5,10,20,0.45)";
    ctx.beginPath();
    ctx.rect(0, 0, state.width, state.height);
    ctx.rect(sx, sy, sw, sh);
    ctx.fill("evenodd");

    // border
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(Math.round(sx) + 1, Math.round(sy) + 1, Math.round(sw) - 2, Math.round(sh) - 2);

    // handles
    ctx.setLineDash([]);
    const hs = 8;
    ctx.fillStyle = "#e6eef6";
    const handles = [
      [sx, sy], [sx + sw, sy], [sx, sy + sh], [sx + sw, sy + sh],
      [sx + sw / 2, sy], [sx + sw / 2, sy + sh], [sx, sy + sh / 2], [sx + sw, sy + sh / 2]
    ];
    handles.forEach(([hx, hy]) => {
      ctx.fillRect(Math.round(hx - hs / 2), Math.round(hy - hs / 2), hs, hs);
    });

    // size label
    const label = `${Math.round(sel.w)} × ${Math.round(sel.h)} px`;
    ctx.font = '12px system-ui, "Segoe UI", Roboto';
    const textW = ctx.measureText(label).width;
    const labelX = Math.min(state.width - textW - 16, Math.max(8, sx + 6));
    const labelY = Math.max(22, sy - 8);
    ctx.fillStyle = 'rgba(6, 25, 60, 0.9)';
    ctx.fillRect(labelX - 6, labelY - 18, textW + 14, 18);
    ctx.fillStyle = '#e6eef6';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText(label, labelX, labelY - 6);

    ctx.restore();
  }

  // ---------- Image Upload ----------
  function loadImageFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showMessage("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        exitCropMode(false);
        render();
        showMessage("Image loaded");
      };
      img.onerror = () => showMessage("Invalid image file");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  uploadInput?.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) loadImageFile(file);
    uploadInput.value = "";
  });

  // ---------- Drag & Drop ----------
  ["dragenter", "dragover"].forEach((evt) => {
    dropZone?.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("dragover");
      if (dropHint) dropHint.textContent = "Release to drop";
    });
  });

  ["dragleave", "dragend", "drop"].forEach((evt) => {
    dropZone?.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (evt === "drop") {
        dropZone.classList.remove("dragover");
        if (dropHint) dropHint.textContent = "";
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length) loadImageFile(files[0]);
      } else {
        dropZone.classList.remove("dragover");
        if (dropHint) dropHint.textContent = 'Drop image here or use "Upload image"';
      }
    });
  });

  // ---------- Presets ----------
  presetsContainer?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-preset]");
    if (!btn) return;
    const preset = btn.dataset.preset;
    if (!PRESETS[preset]) return;
    state.width = PRESETS[preset].w;
    state.height = PRESETS[preset].h;
    state.presetName = preset;
    render();
    showMessage(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset selected`);
  });

  // ---------- Inputs ----------
  customWidthInput?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isFinite(val) && val > 0) {
      state.width = val;
      state.presetName = "custom";
      render();
    }
  });

  customHeightInput?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isFinite(val) && val > 0) {
      state.height = val;
      state.presetName = "custom";
      render();
    }
  });

  bgColorInput?.addEventListener("input", (e) => {
    state.backgroundColor = e.target.value;
    render();
  });

  paddingSlider?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    state.padding = Number.isFinite(val) ? val : 0;
    if (paddingValueLabel) paddingValueLabel.textContent = state.padding;
    render();
  });

  // ---------- Export ----------
  exportBtn?.addEventListener("click", () => {
    canvas.toBlob((blob) => {
      if (!blob) {
        showMessage("Export failed.");
        return;
      }
      const name = `screenshot-${state.presetName || "export"}-${Date.now()}.png`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showMessage("PNG exported");
    }, "image/png");
  });

  // ---------- Copy to clipboard ----------
  copyBtn?.addEventListener("click", async () => {
    if (!navigator.clipboard || !canvas.toBlob) {
      showMessage("Clipboard API not supported in this browser.");
      return;
    }
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showMessage("Failed to copy.");
          return;
        }
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        const original = copyBtn.textContent;
        copyBtn.textContent = "Copied ✓";
        setTimeout(() => (copyBtn.textContent = original), 1600);
        showMessage("Image copied to clipboard");
      }, "image/png");
    } catch (err) {
      console.error("Clipboard write error", err);
      showMessage("Copy failed: permission or browser issue");
    }
  });

  // ---------- Crop Logic ----------
  function enterCropMode() {
    if (!state.image) {
      showMessage("Load an image first.");
      return;
    }
    state.crop.active = true;
    if (!state.crop.sel) {
      state.crop.sel = {
        x: 0,
        y: 0,
        w: state.image.naturalWidth,
        h: state.image.naturalHeight,
      };
    }
    state.crop.dragMode = "none";
    state.crop.handle = null;
    updateCropUI();
    render();
    showMessage("Crop mode: drag handles or draw a new area");
  }

  function exitCropMode(showMsg = true) {
    state.crop.active = false;
    state.crop.dragMode = "none";
    state.crop.handle = null;
    updateCropUI();
    render();
    if (showMsg) showMessage("Crop cancelled");
  }

  function updateCropUI() {
    if (startCropBtn && applyCropBtn && cancelCropBtn && cropHintEl) {
      if (state.crop.active) {
        startCropBtn.style.display = "none";
        applyCropBtn.style.display = "";
        cancelCropBtn.style.display = "";
        cropHintEl.style.display = "";
      } else {
        startCropBtn.style.display = "";
        applyCropBtn.style.display = "none";
        cancelCropBtn.style.display = "none";
        cropHintEl.style.display = "none";
        canvas.style.cursor = "default";
      }
    }
  }

  function mouseToImageSpace(e, info) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const ix = (cx - info.x) / info.scale;
    const iy = (cy - info.y) / info.scale;
    return { x: ix, y: iy, cx, cy };
  }

  function isPointInSelImageSpace(px, py) {
    const s = state.crop.sel;
    if (!s) return false;
    return px >= s.x && py >= s.y && px <= s.x + s.w && py <= s.y + s.h;
  }

  function getHoverHandle(cx, cy, info) {
    const s = state.crop.sel;
    if (!s) return null;
    const sx = info.x + s.x * info.scale;
    const sy = info.y + s.y * info.scale;
    const sw = s.w * info.scale;
    const sh = s.h * info.scale;
    const tol = 8; // pixels
    const near = (v, t) => Math.abs(v - t) <= tol;

    const onLeft = near(cx, sx);
    const onRight = near(cx, sx + sw);
    const onTop = near(cy, sy);
    const onBottom = near(cy, sy + sh);

    const insideX = cx > sx + tol && cx < sx + sw - tol;
    const insideY = cy > sy + tol && cy < sy + sh - tol;

    if (onLeft && onTop) return "nw";
    if (onRight && onTop) return "ne";
    if (onLeft && onBottom) return "sw";
    if (onRight && onBottom) return "se";
    if (onTop && insideX) return "n";
    if (onBottom && insideX) return "s";
    if (onLeft && insideY) return "w";
    if (onRight && insideY) return "e";

    if (insideX && insideY) return "move";
    return null;
  }

  function setCursorForHandle(h) {
    const cursors = {
      n: "ns-resize",
      s: "ns-resize",
      e: "ew-resize",
      w: "ew-resize",
      ne: "nesw-resize",
      sw: "nesw-resize",
      nw: "nwse-resize",
      se: "nwse-resize",
      move: "move",
    };
    canvas.style.cursor = h ? cursors[h] || "default" : "crosshair";
  }

  function onCanvasMouseDown(e) {
    if (!state.crop.active || !state.image) return;
    const info = getImageDrawInfo();
    const m = mouseToImageSpace(e, info);
    // Ignore outside image area
    if (m.x < 0 || m.y < 0 || m.x > state.image.naturalWidth || m.y > state.image.naturalHeight) return;

    const hover = getHoverHandle(m.cx, m.cy, info);
    if (hover === "move") {
      state.crop.dragMode = "moving";
      state.crop.handle = "move";
      state.crop.start = { mx: m.x, my: m.y };
      state.crop.selStart = { ...state.crop.sel };
    } else if (hover) {
      state.crop.dragMode = "resizing";
      state.crop.handle = hover;
      state.crop.start = { mx: m.x, my: m.y };
      state.crop.selStart = { ...state.crop.sel };
    } else {
      // start creating a new selection
      state.crop.dragMode = "creating";
      state.crop.handle = null;
      state.crop.start = { mx: m.x, my: m.y };
      state.crop.sel = { x: m.x, y: m.y, w: 0, h: 0 };
    }
    render();
  }

  function onCanvasMouseMove(e) {
    // If crop not active, just show appropriate cursor (if over selection)
    if (!state.crop.active || !state.image) {
      const info = getImageDrawInfo();
      if (!info) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const hover = state.crop.sel ? getHoverHandle(cx, cy, info) : null;
      setCursorForHandle(hover);
      return;
    }

    const info = getImageDrawInfo();
    const m = mouseToImageSpace(e, info);
    const imgW = state.image.naturalWidth;
    const imgH = state.image.naturalHeight;

    if (state.crop.dragMode === "none") {
      // Set cursor based on hover
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const hover = getHoverHandle(cx, cy, info);
      setCursorForHandle(hover);
      return;
    }

    const minSize = 1; // image pixels
    const s0 = state.crop.selStart || { x: 0, y: 0, w: 0, h: 0 };
    let s = { ...state.crop.sel };

    if (state.crop.dragMode === "creating") {
      const x0 = clamp(state.crop.start.mx, 0, imgW);
      const y0 = clamp(state.crop.start.my, 0, imgH);
      const x1 = clamp(m.x, 0, imgW);
      const y1 = clamp(m.y, 0, imgH);
      s.x = Math.min(x0, x1);
      s.y = Math.min(y0, y1);
      s.w = Math.max(minSize, Math.abs(x1 - x0));
      s.h = Math.max(minSize, Math.abs(y1 - y0));
    } else if (state.crop.dragMode === "moving") {
      const dx = m.x - state.crop.start.mx;
      const dy = m.y - state.crop.start.my;
      s.x = clamp(s0.x + dx, 0, imgW - s0.w);
      s.y = clamp(s0.y + dy, 0, imgH - s0.h);
      s.w = s0.w;
      s.h = s0.h;
    } else if (state.crop.dragMode === "resizing") {
      const handle = state.crop.handle;
      let x = s0.x, y = s0.y, w = s0.w, h = s0.h;
      let right = x + w;
      let bottom = y + h;

      if (handle.includes("w")) x = clamp(m.x, 0, right - minSize);
      if (handle.includes("e")) right = clamp(m.x, x + minSize, imgW);
      if (handle.includes("n")) y = clamp(m.y, 0, bottom - minSize);
      if (handle.includes("s")) bottom = clamp(m.y, y + minSize, imgH);

      s.x = Math.min(x, right - minSize);
      s.y = Math.min(y, bottom - minSize);
      s.w = Math.max(minSize, right - x);
      s.h = Math.max(minSize, bottom - y);
    }

    state.crop.sel = s;
    render();
  }

  function onCanvasMouseUp() {
    if (!state.crop.active) return;
    state.crop.dragMode = "none";
    state.crop.selStart = null;
  }

  function onKeyDown(e) {
    if (!state.crop.active) return;
    if (e.key === "Escape") {
      exitCropMode();
    }
  }

  function applyCrop() {
    if (!state.crop.active || !state.image || !state.crop.sel) return;
    const sel = state.crop.sel;
    const sx = Math.round(clamp(sel.x, 0, state.image.naturalWidth - 1));
    const sy = Math.round(clamp(sel.y, 0, state.image.naturalHeight - 1));
    const sw = Math.round(clamp(sel.w, 1, state.image.naturalWidth - sx));
    const sh = Math.round(clamp(sel.h, 1, state.image.naturalHeight - sy));
    if (sw <= 0 || sh <= 0) { showMessage("Nothing to crop."); return; }

    const off = document.createElement("canvas");
    off.width = sw; off.height = sh;
    const octx = off.getContext("2d");
    octx.drawImage(state.image, sx, sy, sw, sh, 0, 0, sw, sh);

    const dataURL = off.toDataURL("image/png");
    const img = new Image();
    img.onload = () => {
      state.image = img;
      state.crop.sel = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
      exitCropMode(false);
      render();
      showMessage("Crop applied");
    };
    img.onerror = () => showMessage("Failed to apply crop");
    img.src = dataURL;
  }

  // ---------- Wire crop controls ----------
  startCropBtn?.addEventListener("click", enterCropMode);
  cancelCropBtn?.addEventListener("click", () => exitCropMode());
  applyCropBtn?.addEventListener("click", applyCrop);

  // Canvas interactions for cropping
  canvas.addEventListener("mousedown", onCanvasMouseDown);
  window.addEventListener("mousemove", onCanvasMouseMove);
  window.addEventListener("mouseup", onCanvasMouseUp);
  window.addEventListener("keydown", onKeyDown);

  // ---------- Initialize defaults & render ----------
  function init() {
    if (customWidthInput) customWidthInput.value = state.width;
    if (customHeightInput) customHeightInput.value = state.height;
    if (bgColorInput) bgColorInput.value = state.backgroundColor;
    if (paddingSlider) paddingSlider.value = state.padding;
    if (paddingValueLabel) paddingValueLabel.textContent = state.padding;

    updateCropUI();
    render();
  }

  init();

  // Return a small API (optional) so consumers can call functions if needed
  return {
    getState: () => state,
    render,
  };
}
