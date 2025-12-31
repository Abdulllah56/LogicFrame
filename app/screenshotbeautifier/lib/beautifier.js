// /app/lib/beautifier.js
import JSZip from "jszip";
import hljs from "highlight.js";
import html2canvas from "html2canvas";



// Full Screenshot Beautifier logic for Next.js + React (Tailwind UI)
// Call initBeautifier(canvasRef) from a client component/useEffect.

export function initBeautifier(canvasRef) {
  if (!canvasRef.current) return;

  // Add Sharpen SVG Filter
  if (typeof document !== 'undefined' && !document.getElementById('sb_sharpen_svg')) {
    const svg = document.createElement('div');
    svg.id = 'sb_sharpen_svg';
    svg.innerHTML = `<svg width="0" height="0" style="position:absolute;z-index:-1;visibility:hidden;width:0;height:0;overflow:hidden;">
        <defs>
            <filter id="sb_sharpen_filter">
                <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"/>
            </filter>
        </defs>
     </svg>`;
    document.body.appendChild(svg);
  }

  // ---------- State ----------
  const state = {
    image: null,
    width: 1200,
    height: 628,
    backgroundType: "solid", // solid, gradient
    backgroundColor: "#0f1729",
    backgroundGradient: "linear-gradient(135deg, #FF0080 0%, #7928CA 100%)",
    gradientDirection: "to-br", // to-br, to-r, to-b, radial
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
    highQuality: true,
    lockRatio: false,
    aspectRatio: null,
    decoration: {
      style: 'mac_dark',
      shadow: 'medium',
      roundness: 12
    },
    exportOptions: {
      format: "image/png",
      quality: 0.9,
      scale: 1
    },
    recentUrls: [],
    queue: [],
    activeIndex: -1,
    enhancement: {
      brightness: 100,
      contrast: 100,
      sharpen: false,
      blurToolActive: false,
      blurIntensity: 20,
      blurRegions: [] // {x, y, w, h} relative to image
    },
    history: {
      undo: [],
      redo: []
    },
    showGrid: false,
    watermark: {
      enabled: false,
      text: "",
      position: "bottom-right", // top-left, top-right, bottom-left, bottom-right, custom
      x: 0.95, // normalized 0-1
      y: 0.95, // normalized 0-1
      lastBounds: null, // for hit testing
      fontSize: 24,
      fontWeight: "normal"
    }
  };

  // ---------- Presets ----------
  const PRESETS = {
    linkedin: { w: 1200, h: 628 },
    twitter: { w: 1200, h: 675 },
    instagram: { w: 1080, h: 1080 },
    github: { w: 1280, h: 640 },
    facebook: { w: 1200, h: 630 },
    youtube: { w: 1280, h: 720 },
    reddit: { w: 1200, h: 800 },
    devto: { w: 1000, h: 420 },
  };

  const PLATFORM_SPECS = {
    linkedin: { text: "LinkedIn recommends 1200×628 or 1.91:1 ratio." },
    twitter: { text: "Twitter posts optimal at 16:9 (1200×675) or 1:1." },
    instagram: { text: "Instagram Square (1:1) is 1080×1080." },
    facebook: { text: "Facebook Link images usually 1200×630." },
    youtube: { text: "YouTube Thumbnails must be 1280×720 (16:9)." },
    github: { text: "GitHub Social preview is 1280×640 (2:1)." },
  };

  const GRADIENTS = [
    "linear-gradient(135deg, #FF0080 0%, #7928CA 100%)", // Magenta
    "linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)", // Cyan
    "linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)", // Sunrise
    "linear-gradient(135deg, #7928CA 0%, #FF0080 100%)", // Reverse Magenta
    "linear-gradient(135deg, #2D3748 0%, #1A202C 100%)", // Dark Gray
    "linear-gradient(135deg, #ffffff 0%, #f1f1f1 100%)", // Light
    "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)", // Pastel Pink
    "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)" // Mint Blue
  ];

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

  const copyBtn = document.getElementById("copy-image");
  const messageEl = document.getElementById("message");

  const startCropBtn = document.getElementById("start-crop");
  const applyCropBtn = document.getElementById("apply-crop");
  const cancelCropBtn = document.getElementById("cancel-crop");

  const cropHintEl = document.getElementById("crop-hint");

  // Readability elements
  const readContainer = document.getElementById("readability-container");
  const readBadge = document.getElementById("readability-badge");
  const readText = document.getElementById("readability-text");

  let watermarkDragging = false;
  let watermarkDragOffset = { x: 0, y: 0 };

  const highQualityToggle = document.getElementById("high-quality-toggle");
  const fileSizeEl = document.getElementById("filesize-estimate");

  const lockRatioToggle = document.getElementById("lock-ratio-toggle");
  const aspectRatiosContainer = document.getElementById("aspect-ratios");
  const dimWarningContainer = document.getElementById("dimension-warning");
  const dimWarningText = document.getElementById("dimension-warning-text");

  // Style elements
  // Style elements
  const windowStyleGroup = document.getElementById("window-style-group");
  const shadowSelect = document.getElementById("shadow-select");
  const roundnessSlider = document.getElementById("roundness-slider");

  // Background Elements
  const bgTypeGroup = document.getElementById("bg-type-group");
  const gradientsContainer = document.getElementById("gradients-container");
  const gradientColor1 = document.getElementById("gradient-color-1");
  const gradientColor2 = document.getElementById("gradient-color-2");
  const applyCustomGradient = document.getElementById("apply-custom-gradient");
  const gradientDirectionGroup = document.getElementById("gradient-direction-group");

  // Watermark Elements
  const watermarkToggle = document.getElementById("watermark-toggle");
  const watermarkText = document.getElementById("watermark-text");
  const watermarkPositionGroup = document.getElementById("watermark-position-group");
  const watermarkSizeSlider = document.getElementById("watermark-size-slider");
  const watermarkBoldToggle = document.getElementById("watermark-bold-toggle");

  // Batch Elements
  const batchQueueContainer = document.getElementById("batch-queue-container");
  const batchList = document.getElementById("batch-list");
  const queueCount = document.getElementById("queue-count");
  const clearQueueBtn = document.getElementById("clear-queue-btn");

  const exportBatchBtn = document.getElementById("export-batch");

  // Developer Tools
  const fitImageBtn = document.getElementById("fit-image-btn");
  const gridToggle = document.getElementById("grid-toggle");
  const exportJsonBtn = document.getElementById("export-json-btn");
  const importJsonBtn = document.getElementById("import-json-btn");
  const importJsonInput = document.getElementById("import-json-input");

  // Code Snippet Tools
  const codeInput = document.getElementById("code-input");
  const codeLanguage = document.getElementById("code-language");
  const renderCodeBtn = document.getElementById("render-code-btn");

  // Enhancements & History
  const brightnessSlider = document.getElementById("brightness-slider");
  const contrastSlider = document.getElementById("contrast-slider");
  const sharpenToggle = document.getElementById("sharpen-toggle");
  const blurToolBtn = document.getElementById("blur-tool-btn");
  const clearBlursBtn = document.getElementById("clear-blurs-btn");
  const blurIntensitySlider = document.getElementById("blur-intensity-slider");
  const blurIntensityVal = document.getElementById("blur-intensity-val");

  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  const resetBtn = document.getElementById("reset-btn");

  // Export Settings
  const exportFormatSelect = document.getElementById("export-format");
  const exportQualityInput = document.getElementById("export-quality");
  const qualityContainer = document.getElementById("quality-container");
  const qualityValue = document.getElementById("quality-value");
  const exportScaleGroup = document.getElementById("export-scale-group");
  const exportBtn = document.getElementById("export-btn");

  // URL & Loading
  const urlInput = document.getElementById("url-input");
  const urlSubmitBtn = document.getElementById("url-submit");
  const recentUrlsList = document.getElementById("recent-urls-list");
  const loadingOverlay = document.getElementById("loading-overlay");

  const loadingText = document.getElementById("loading-text");

  // ---------- Persistence ----------
  function getItemSettings() {
    return {
      width: state.width,
      height: state.height,
      backgroundType: state.backgroundType,
      backgroundColor: state.backgroundColor,
      backgroundGradient: state.backgroundGradient,
      gradientDirection: state.gradientDirection,
      padding: state.padding,
      presetName: state.presetName,
      decoration: JSON.parse(JSON.stringify(state.decoration)),
      enhancement: JSON.parse(JSON.stringify(state.enhancement)),
      watermark: JSON.parse(JSON.stringify(state.watermark)),
      aspectRatio: state.aspectRatio,
      lockRatio: state.lockRatio
    };
  }

  function applyItemSettings(settings) {
    if (!settings) return;
    state.width = settings.width ?? 1200;
    state.height = settings.height ?? 628;
    state.backgroundType = settings.backgroundType ?? "solid";
    state.backgroundColor = settings.backgroundColor ?? "#0f1729";
    state.backgroundGradient = settings.backgroundGradient ?? "linear-gradient(135deg, #FF0080 0%, #7928CA 100%)";
    state.gradientDirection = settings.gradientDirection ?? "to-br";
    state.padding = settings.padding ?? 60;
    state.presetName = settings.presetName ?? "custom";
    state.decoration = settings.decoration ? JSON.parse(JSON.stringify(settings.decoration)) : state.decoration;
    state.enhancement = settings.enhancement ? JSON.parse(JSON.stringify(settings.enhancement)) : state.enhancement;
    state.watermark = settings.watermark ? JSON.parse(JSON.stringify(settings.watermark)) : state.watermark;
    state.aspectRatio = settings.aspectRatio;
    state.lockRatio = settings.lockRatio ?? false;

    // Reset transient flags
    state.enhancement.blurToolActive = false;
  }

  function syncUI() {
    if (customWidthInput) customWidthInput.value = state.width;
    if (customHeightInput) customHeightInput.value = state.height;
    if (bgColorInput) bgColorInput.value = state.backgroundColor;
    if (paddingSlider) paddingSlider.value = state.padding;
    if (paddingValueLabel) paddingValueLabel.innerText = state.padding;
    if (highQualityToggle) highQualityToggle.checked = state.highQuality;
    if (lockRatioToggle) lockRatioToggle.checked = state.lockRatio;

    updateWindowStyleUI();
    updatePresetHighlight();
    updateBackgroundUI();
    syncWatermarkUI();

    if (shadowSelect) shadowSelect.value = state.decoration.shadow;
    if (roundnessSlider) roundnessSlider.value = state.decoration.roundness;
    if (brightnessSlider) brightnessSlider.value = state.enhancement.brightness;
    if (contrastSlider) contrastSlider.value = state.enhancement.contrast;
    if (sharpenToggle) sharpenToggle.checked = state.enhancement.sharpen;
    if (blurIntensitySlider) blurIntensitySlider.value = state.enhancement.blurIntensity;
    if (blurIntensityVal) blurIntensityVal.textContent = state.enhancement.blurIntensity + "px";

    if (blurToolBtn) blurToolBtn.dataset.active = "false";
  }

  function saveSettings() {
    try {
      const settings = {
        width: state.width,
        height: state.height,
        backgroundColor: state.backgroundColor,
        padding: state.padding,
        presetName: state.presetName,
        highQuality: state.highQuality,
        lockRatio: state.lockRatio,
        aspectRatio: state.aspectRatio,
        decoration: state.decoration,
        exportOptions: state.exportOptions,
        recentUrls: state.recentUrls,
        enhancement: {
          brightness: state.enhancement.brightness,
          contrast: state.enhancement.contrast,
          sharpen: state.enhancement.sharpen,
          blurIntensity: state.enhancement.blurIntensity,
          blurRegions: state.enhancement.blurRegions
        },
        watermark: state.watermark
      };
      localStorage.setItem("sb_settings", JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save settings", e);
    }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem("sb_settings");
      if (!raw) return;
      const settings = JSON.parse(raw);

      Object.assign(state, settings);
      // Restore nested objects if overwritten by assign (though assign works for top level, nested needs care if structure changed, but here it matches)
      if (settings.decoration) state.decoration = settings.decoration;
      if (settings.exportOptions) state.exportOptions = settings.exportOptions;
      if (settings.recentUrls) state.recentUrls = settings.recentUrls;
      if (settings.enhancement) {
        state.enhancement.brightness = settings.enhancement.brightness ?? 100;
        state.enhancement.contrast = settings.enhancement.contrast ?? 100;
        state.enhancement.sharpen = settings.enhancement.sharpen ?? false;
        state.enhancement.blurIntensity = settings.enhancement.blurIntensity ?? 20;
        state.enhancement.blurRegions = settings.enhancement.blurRegions ?? [];
        state.enhancement.blurToolActive = false; // Always start inactive
      } else {
        // Ensure defaults if no enhancement settings at all
        state.enhancement.blurRegions = [];
        state.enhancement.blurToolActive = false;
      }

      // Sync UI
      syncUI();

      updateExportScaleUI();
      updateQualityVisibility();
      updateRecentUrlsUI();

      render();
    } catch (e) {
      console.warn("Failed to load settings", e);
    }
  }

  function drawGrid() {
    if (!state.showGrid) return;
    ctx.save();
    ctx.strokeStyle = "rgba(0, 217, 255, 0.3)";
    ctx.lineWidth = 1;

    const step = 50;
    // Vertical
    for (let x = 0; x <= state.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }
    // Horizontal
    for (let y = 0; y <= state.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }

    // Center lines
    ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
    ctx.beginPath(); ctx.moveTo(state.width / 2, 0); ctx.lineTo(state.width / 2, state.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, state.height / 2); ctx.lineTo(state.width, state.height / 2); ctx.stroke();

    ctx.restore();
  }

  // ---------- Helpers ----------
  const showMessage = (text, timeout = 2500) => {
    if (!messageEl) return;
    messageEl.textContent = text;
    if (timeout > 0) {
      clearTimeout(showMessage._t);
      showMessage._t = setTimeout(() => (messageEl.textContent = ""), timeout);
    }
  };

  const setLoading = (active, text = "Processing...") => {
    if (!loadingOverlay) return;
    if (active) {
      loadingOverlay.classList.remove("hidden");
      loadingOverlay.style.display = "flex";
      if (loadingText) loadingText.textContent = text;
    } else {
      loadingOverlay.classList.add("hidden");
      loadingOverlay.style.display = "none";
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



  function updateReadability(info) {
    if (!readContainer || !readBadge || !readText) return;

    if (!state.image) {
      readContainer.classList.add("hidden");
      return;
    }

    readContainer.classList.remove("hidden");
    const scale = info ? info.scale : 1;
    let status = "";
    let colorClass = "";
    let message = "";

    // Determine status based on scale
    if (scale > 1.2) {
      status = "poor";
      colorClass = "bg-red-500";
      message = "Blurry (Upscaled)";
    } else if (scale >= 0.8) {
      status = "perfect";
      colorClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
      message = "Perfect Clarity";
    } else if (scale >= 0.5) {
      status = "good";
      colorClass = "bg-green-500";
      message = "Good Readable";
    } else if (scale >= 0.3) {
      status = "fair";
      colorClass = "bg-yellow-500";
      message = "Fair (Small Text)";
    } else {
      status = "poor";
      colorClass = "bg-red-500";
      message = "Poor (Too Small)";
    }

    // Reset classes
    readBadge.className = `w-2.5 h-2.5 rounded-full shadow-sm transition-colors duration-300 ${colorClass}`;
    readText.textContent = `${message} (${Math.round(scale * 100)}%)`;
  }

  function updateDimensionWarning() {
    if (!dimWarningContainer || !dimWarningText) return;

    // Logic: if current dimensions deviate significantly (>5px) from a selected preset's norm 
    // OR if simply providing general advice for 'custom'
    let warning = "";

    // If a specific preset is active, check if we drifted
    if (state.presetName && state.presetName !== "custom" && PRESETS[state.presetName]) {
      const p = PRESETS[state.presetName];
      if (state.width !== p.w || state.height !== p.h) {
        // We are in 'custom' mode effectively if size changed, but maybe user just adjusted slightly
        // Actually, usually we switch to 'custom' on edit. 
        // Let's just check if the current size matches the *intention* of the platform if KNOWN
        if (PLATFORM_SPECS[state.presetName]) {
          warning = `Note: ${PLATFORM_SPECS[state.presetName].text}`;
        }
      }
    } else if (state.presetName === "custom" || !state.presetName) {
      // Try to reverse match or give generic advice? 
      // For now, let's just show info if we match a platform spec Loosely? 
      // Or better, if they clicked a Preset, we show the spec if they change it?
      // Let's keep it simple: If state.presetName maps to a platform, enable warning if dimensions change. 
      // BUT wait, input listeners change presetName to 'custom'. 
      // So let's look for a key in PRESETS that matches current dimensions
    }

    // Actually, user requested "Platform-specific dimension warnings". 
    // If I selected "Twitter" then changed width, I am now "Custom" but I might have broken Twitter spec.
    // Let's rely on valid platform keys.
    const platformKey = Object.keys(PRESETS).find(k => PRESETS[k].w === state.width && PRESETS[k].h === state.height);
    if (!platformKey && state.presetName !== 'custom' && PLATFORM_SPECS[state.presetName]) {
      warning = `Modified from ${state.presetName}: ${PLATFORM_SPECS[state.presetName].text}`;
    }

    if (warning) {
      dimWarningContainer.classList.remove("hidden");
      dimWarningText.textContent = warning;
    } else {
      dimWarningContainer.classList.add("hidden");
    }
  }

  // ---------- Render ----------
  function render() {
    saveSettings(); // Auto-save on every render (debouncing would be better but this is low freq enough)
    if (!ctx) return;

    // Keep UI inputs in sync if they exist
    if (customWidthInput) customWidthInput.value = state.width;
    if (customHeightInput) customHeightInput.value = state.height;
    if (bgColorInput) bgColorInput.value = state.backgroundColor;
    if (paddingSlider) paddingSlider.value = state.padding;
    if (paddingValueLabel) paddingValueLabel.textContent = state.padding;
    if (highQualityToggle) highQualityToggle.checked = state.highQuality;
    if (lockRatioToggle) lockRatioToggle.checked = state.lockRatio;
    if (gridToggle) gridToggle.checked = state.showGrid;


    // Sync styles
    if (shadowSelect) shadowSelect.value = state.decoration.shadow;
    if (roundnessSlider) roundnessSlider.value = state.decoration.roundness;
    updateWindowStyleUI();

    setCanvasLogicalSize(state.width, state.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = state.highQuality ? 'high' : 'low';

    ctx.clearRect(0, 0, state.width, state.height);

    // Background Drawing
    if (state.backgroundType === "solid") {
      ctx.fillStyle = state.backgroundColor;
      ctx.fillRect(0, 0, state.width, state.height);
    } else if (state.backgroundType === "gradient") {
      const gradStr = state.backgroundGradient;

      // Extract colors using a robust regex
      const colorRegex = /#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsl\([^)]+\)/g;
      const colors = gradStr.match(colorRegex) || ["#000", "#fff"];

      let gradient;

      // Create gradient based on direction
      if (state.gradientDirection === "radial") {
        // Radial gradient from center
        const centerX = state.width / 2;
        const centerY = state.height / 2;
        const radius = Math.max(state.width, state.height) / 2;
        gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      } else if (state.gradientDirection === "to-r") {
        // Horizontal: left to right
        gradient = ctx.createLinearGradient(0, 0, state.width, 0);
      } else if (state.gradientDirection === "to-b") {
        // Vertical: top to bottom
        gradient = ctx.createLinearGradient(0, 0, 0, state.height);
      } else {
        // Default diagonal: top-left to bottom-right
        gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
      }

      if (colors.length > 0) {
        colors.forEach((c, i) => {
          const stop = i / (colors.length - 1);
          const validStop = Math.max(0, Math.min(1, isNaN(stop) ? 0 : stop));
          try {
            gradient.addColorStop(validStop, c);
          } catch (e) {
            console.error("Invalid color stop", validStop, c);
          }
        });
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = "#000";
      }
      ctx.fillRect(0, 0, state.width, state.height);
    }



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
      updateReadability(null);
      drawGrid(); // Draw grid even if no image
      return;
    }

    const info = getImageDrawInfo();

    updateReadability(info);
    updateDimensionWarning();

    // Draw decorated image instead of raw
    drawDecoratedImage(info);

    if (state.crop.active && state.crop.sel) drawCropOverlay(info);

    drawGrid();
    drawWatermark();
    updateFileSize();
  }

  function drawDecoratedImage(info) {
    if (!info) return;
    const { x, y, w, h } = info;
    const { style, shadow, roundness } = state.decoration;

    ctx.save();

    // Shadow config
    if (shadow !== 'none') {
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      if (shadow === 'small') { ctx.shadowBlur = 10; ctx.shadowOffsetY = 5; }
      else if (shadow === 'medium') { ctx.shadowBlur = 20; ctx.shadowOffsetY = 10; }
      else if (shadow === 'large') { ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; }
      else if (shadow === 'xl') { ctx.shadowBlur = 60; ctx.shadowOffsetY = 30; }
    }

    const r = roundness;

    // Draw Window Shape (for shadow and bg of frame)
    beginPathRoundedRect(ctx, x, y, w, h, r);
    // Fill color based on style
    ctx.fillStyle = (style === 'mac_light') ? '#ffffff' : (style === 'mac_dark' ? '#1e1e1e' : '#000000');

    // Only fill if it's a window style or if we have a shadow that needs a body
    if (style !== 'none' || shadow !== 'none') {
      // If style is none but shadow is on, what triggers shadow? The fill.
      // But if style is none, we usually just want shadow on image.
      // If image has transparency, shadow on rect looks bad.
      // But "Screenshot Beautifier" usually implies rectangular screenshots.
      if (style === 'none' && shadow !== 'none') {
        // If none, we trust the image is rectangular for the shadow to look right with this rect fill
        // OR we just use image to cast shadow? (expensive/complex for canvas if not same domain/tainted).
        // Let's assume rectangular screenshot.
        // We won't fill with color if 'none', maybe just cast shadow?
        // Canvas shadow works on whatever you draw.
        // If we draw image directly with shadow, it works.
      } else {
        // Draw the "Window" background
        ctx.fill();
      }
    }

    // Turn off shadow for subsequent operations so we don't double shadow
    ctx.shadowColor = "transparent";

    // Clip for Image
    beginPathRoundedRect(ctx, x, y, w, h, r);
    ctx.clip();

    // If style was 'none' but shadow was on, we haven't drawn shadow yet.
    // We can enable shadow just for image draw?
    if (style === 'none' && shadow !== 'none') {
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      if (shadow === 'small') { ctx.shadowBlur = 10; ctx.shadowOffsetY = 5; }
      else if (shadow === 'medium') { ctx.shadowBlur = 20; ctx.shadowOffsetY = 10; }
      else if (shadow === 'large') { ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; }
      else if (shadow === 'xl') { ctx.shadowBlur = 60; ctx.shadowOffsetY = 30; }
    }

    // Draw image with filters
    const { brightness, contrast, sharpen, blurRegions } = state.enhancement;

    ctx.save();
    const bVal = brightness; // 100 is default
    const cVal = contrast;
    let filterStr = "";

    if (bVal !== 100 || cVal !== 100) {
      filterStr += `brightness(${bVal}%) contrast(${cVal}%) `;
    }
    if (sharpen) {
      filterStr += `url(#sb_sharpen_filter) `;
    }

    if (filterStr) ctx.filter = filterStr.trim();

    ctx.drawImage(state.image, info.x, info.y, info.w, info.h);
    ctx.filter = 'none';

    // Blur Regions (Applied ON TOP of filtered image)
    if (blurRegions && blurRegions.length > 0) {
      blurRegions.forEach(reg => {
        const bx = info.x + reg.x * info.w;
        const by = info.y + reg.y * info.h;
        const bw = reg.w * info.w;
        const bh = reg.h * info.h;

        ctx.save();
        ctx.beginPath();
        ctx.rect(bx, by, bw, bh);
        ctx.clip(); // Clip to the region

        // Apply heavy blur
        // Re-apply brightness/contrast so it matches the background!
        const blurAmount = state.enhancement.blurIntensity;
        let filter = `blur(${blurAmount}px)`;
        if (bVal !== 100 || cVal !== 100) {
          filter += ` brightness(${bVal}%) contrast(${cVal}%)`;
        }
        ctx.filter = filter;

        ctx.drawImage(state.image, info.x, info.y, info.w, info.h);
        ctx.restore();
      });
    }

    ctx.restore();

    // Draw header overlay if needed
    if ((style === 'mac_dark' || style === 'mac_light')) {
      const headH = 32;
      ctx.fillStyle = (style === 'mac_light') ? '#f1f1f1' : '#1e1e1e';
      ctx.beginPath();
      ctx.rect(x, y, w, headH);
      ctx.fill();

      const dots = [
        { c: '#FF5F56', px: 18 },
        { c: '#FFBD2E', px: 38 },
        { c: '#27C93F', px: 58 }
      ];
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(x + d.px, y + headH / 2, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = d.c;
        ctx.fill();
      });
    }

    ctx.restore();
  }

  function beginPathRoundedRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function updateWindowStyleUI() {
    if (!windowStyleGroup) return;
    const btns = windowStyleGroup.querySelectorAll("button");
    btns.forEach(btn => {
      const s = btn.dataset.style;
      if (s === state.decoration.style) {
        btn.classList.add("ring-2", "ring-[#00D9FF]", "text-[#00D9FF]");
      } else {
        btn.classList.remove("ring-2", "ring-[#00D9FF]", "text-[#00D9FF]");
      }
    });
  }



  function updateFileSize() {
    if (!fileSizeEl) return;
    try {
      // Create a temporary canvas if scale != 1? 
      // Actually, standard `toDataURL` uses current canvas density.
      // If we want accurate file size for the EXPORT, we should use the export logic.
      // But creating a scaled canvas on every frame is heavy.
      // Let's just estimate base size or use current canvas.

      // If scale > 1, size will be bigger.
      // Rough estimator for UI speed:
      const format = state.exportOptions.format;
      const quality = state.exportOptions.quality;

      const dataUrl = canvas.toDataURL(format, quality);
      const head = `data:${format};base64,`;
      let sizeBytes = Math.round((dataUrl.length - head.length) * 3 / 4);

      // If scale is set, we can roughly multiply pixels?
      // JPEG/PNG scaling isn't linear with pixels but let's approximate if we don't resize.
      // Actually, `toDataURL` returns the size of the CURRENT canvas buffer.
      // `render` functionality sets canvas size based on `state.width` and `state.height` (logical).
      // `setCanvasLogicalSize` handles DPI.
      // So `canvas.width` is already physical pixels (likely 2x on retina).
      // If we export at 1x, we might be downscaling or using raw.
      // Let's assume the canvas buffer is what we export for now, or just show estimating for 1x.

      const kb = Math.round(sizeBytes / 1024);
      const span = fileSizeEl.querySelector("span");
      if (span) span.textContent = `${kb} KB (${format.split('/')[1].toUpperCase()})`;
    } catch (e) {
      console.error(e);
    }
  }

  function updateQualityVisibility() {
    if (!qualityContainer) return;
    if (state.exportOptions.format === "image/png") {
      qualityContainer.classList.add("hidden");
    } else {
      qualityContainer.classList.remove("hidden");
      qualityContainer.classList.remove("opacity-50", "pointer-events-none");
    }
  }

  function updateExportScaleUI() {
    if (!exportScaleGroup) return;
    const btns = exportScaleGroup.querySelectorAll("button");
    btns.forEach(btn => {
      const s = parseInt(btn.dataset.scale);
      if (s === state.exportOptions.scale) {
        btn.classList.add("bg-slate-800", "dark:bg-white", "text-white", "dark:text-slate-900");
        btn.classList.remove("bg-white", "dark:bg-white/20", "text-slate-800", "dark:text-white");
      } else {
        btn.classList.remove("bg-slate-800", "dark:bg-white", "text-white", "dark:text-slate-900");
        btn.classList.add("bg-white", "dark:bg-white/20", "text-slate-600", "dark:text-gray-300");
      }
    });
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
    ctx.strokeStyle = "#00D9FF";
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

  // ---------- Batch & Queue Logic ----------

  function drawWatermark() {
    if (!state.watermark.enabled || !state.watermark.text) {
      state.watermark.lastBounds = null;
      return;
    }

    ctx.save();

    // Watermark styling
    const fontSize = state.watermark.fontSize || Math.max(12, Math.min(state.width, state.height) * 0.025);
    const fontWeight = state.watermark.fontWeight || "normal";

    ctx.font = `${fontWeight} ${fontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textBaseline = "alphabetic";

    const padding = 20;
    const text = state.watermark.text;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    let x, y;
    let align = "right";

    if (state.watermark.position === "custom") {
      x = state.watermark.x * state.width;
      y = state.watermark.y * state.height;
      align = "center";
    } else {
      switch (state.watermark.position) {
        case "top-left":
          align = "left";
          x = padding;
          y = padding + textHeight;
          break;
        case "top-right":
          align = "right";
          x = state.width - padding;
          y = padding + textHeight;
          break;
        case "bottom-left":
          align = "left";
          x = padding;
          y = state.height - padding;
          break;
        case "bottom-right":
        default:
          align = "right";
          x = state.width - padding;
          y = state.height - padding;
          break;
      }
      // Update the normalized coordinates so we can switch to 'custom' smoothly
      state.watermark.x = x / state.width;
      state.watermark.y = y / state.height;
    }

    ctx.textAlign = align;

    // Calculate bounding box for hit testing (approximate)
    let bx = x;
    if (align === "right") bx = x - textWidth;
    if (align === "center") bx = x - textWidth / 2;

    // For alphabetic baseline, y is the baseline. 
    // We want the box to cover from top to bottom.
    const by = y - textHeight * 0.8;
    const bh = textHeight * 1.1;
    const paddingHit = 10; // Extra padding for easier clicking

    state.watermark.lastBounds = {
      x: bx - paddingHit,
      y: by - paddingHit,
      w: textWidth + paddingHit * 2,
      h: bh + paddingHit * 2
    };

    // If custom/dragging, we can show a subtle indicator (optional)
    if (watermarkDragging) {
      ctx.save();
      ctx.strokeStyle = "rgba(0, 217, 255, 0.4)";
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(bx - 4, by - 4, textWidth + 8, bh + 8);
      ctx.restore();
    }

    // Draw text with subtle shadow and stroke for visibility
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Subtle stroke for visibility on light backgrounds
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeText(text, x, y);

    ctx.fillText(text, x, y);

    // If custom, show a ghost border when hovering/dragging (optional polish)

    ctx.restore();
  }

  function handleBatchUpload(files) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setLoading(true, `Processing ${fileArray.length} images...`);

    let loaded = 0;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit

    fileArray.forEach(file => {
      if (file.size > MAX_SIZE) {
        showMessage(`Skipped ${file.name}: Too large (>10MB)`, 4000);
        loaded++;
        if (loaded === fileArray.length) setLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const item = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            file: file,
            imgElement: img,
            name: file.name,
            settings: getItemSettings() // Initialize with current global settings
          };
          state.queue.push(item);
          loaded++;

          // Update progress
          if (loadingText) loadingText.textContent = `Processed ${loaded}/${fileArray.length}`;

          if (state.image === null || state.queue.length === 1) {
            setActiveImage(item);
          }
          if (loaded === fileArray.length) {
            renderQueueUI();
            showMessage(`${state.queue.length} image(s) ready`);
            setLoading(false);
          }
        };
        img.onerror = () => {
          console.error("Failed to load image", file.name);
          loaded++;
          if (loaded === fileArray.length) setLoading(false);
        }
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function setActiveImage(item) {
    // Save current settings into the outgoing item
    if (state.activeIndex !== -1 && state.queue[state.activeIndex]) {
      state.queue[state.activeIndex].settings = getItemSettings();
    }

    state.image = item.imgElement;
    state.activeIndex = state.queue.indexOf(item);

    // Load settings from incoming item
    if (item.settings) {
      applyItemSettings(item.settings);
    }

    exitCropMode(false);
    syncUI();
    render();
    renderQueueUI();
    updateDimensionWarning();
  }

  function renderQueueUI() {
    if (!batchQueueContainer || !batchList) return;
    if (state.queue.length > 0) {
      batchQueueContainer.classList.remove("hidden");
      batchQueueContainer.classList.add("flex");
      if (exportBatchBtn) exportBatchBtn.classList.remove("hidden");
    } else {
      batchQueueContainer.classList.add("hidden");
      batchQueueContainer.classList.remove("flex");
      if (exportBatchBtn) exportBatchBtn.classList.add("hidden");
    }
    if (queueCount) queueCount.textContent = state.queue.length;

    batchList.innerHTML = "";
    state.queue.forEach((item, idx) => {
      const isActive = state.image === item.imgElement;
      const div = document.createElement("div");
      div.className = `flex items-center justify-between p-1.5 rounded cursor-pointer transition ${isActive ? 'bg-[#00D9FF]/10 border border-[#00D9FF]/30' : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'}`;

      const info = document.createElement("div");
      info.className = "flex items-center gap-2 overflow-hidden";
      const thumb = document.createElement("img");
      thumb.src = item.imgElement.src;
      thumb.className = "w-8 h-8 object-cover rounded bg-slate-200 dark:bg-black";
      const name = document.createElement("span");
      name.className = `text-xs truncate max-w-[140px] ${isActive ? 'text-[#00D9FF] font-medium' : 'text-slate-600 dark:text-gray-300'}`;
      name.textContent = item.name;
      info.append(thumb, name);

      const delBtn = document.createElement("button");
      delBtn.innerHTML = "&times;";
      delBtn.className = "text-slate-400 hover:text-red-500 px-2 text-lg leading-none";
      delBtn.onclick = (e) => { e.stopPropagation(); removeFromQueue(idx); };
      div.onclick = () => setActiveImage(item);
      div.appendChild(info); div.appendChild(delBtn);
      batchList.appendChild(div);
    });
  }

  function removeFromQueue(idx) {
    if (idx < 0 || idx >= state.queue.length) return;
    const wasActive = state.activeIndex === idx;
    state.queue.splice(idx, 1);
    if (state.queue.length === 0) {
      state.image = null; state.activeIndex = -1; render();
    } else if (wasActive) {
      const next = Math.min(idx, state.queue.length - 1);
      setActiveImage(state.queue[next]);
    } else {
      state.activeIndex = state.queue.indexOf(state.image);
      renderQueueUI();
    }
    renderQueueUI();
  }

  uploadInput?.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length) handleBatchUpload(e.target.files);
    uploadInput.value = "";
  });

  exportBatchBtn?.addEventListener("click", async () => {
    if (state.queue.length === 0) return;
    setLoading(true, "Preparing batch zip...");

    try {
      const zip = new JSZip();
      // Just export current queue items? 
      // We need to render each one? 
      // This is tricky. The canvas currently only draws the ACTIVE image.
      // To export ALL, we need to loop through queue, set active, render, export to blob, add to zip.
      // But `render` uses `requestAnimationFrame` style or immediate? Instant.

      let processed = 0;
      const orgImage = state.image; // restore later
      const orgActive = state.activeIndex;

      for (let i = 0; i < state.queue.length; i++) {
        const item = state.queue[i];

        // Set active temporarily (without full UI update to save perf)
        state.image = item.imgElement;
        state.activeIndex = i;

        // Force render to canvas
        render();

        // Now export canvas
        const scale = state.exportOptions.scale;
        const format = state.exportOptions.format;
        const quality = state.exportOptions.quality;
        const targetW = state.width * scale;
        const targetH = state.height * scale;

        // Offscreen
        const offCanvas = document.createElement("canvas");
        offCanvas.width = targetW;
        offCanvas.height = targetH;
        const offCtx = offCanvas.getContext("2d");
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = "high";
        offCtx.drawImage(canvas, 0, 0, targetW, targetH); // Canvas has the rendered image now

        await new Promise(resolve => {
          offCanvas.toBlob(blob => {
            if (blob) {
              const ext = format.split('/')[1];
              zip.file(`${item.name.split('.')[0]}_${state.presetName}.${ext}`, blob);
            }
            resolve();
          }, format, quality);
        });

        processed++;
        if (loadingText) loadingText.textContent = `Zipping ${processed}/${state.queue.length}`;
      }

      // Restore
      state.image = orgImage;
      state.activeIndex = orgActive;
      render();

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch_export_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showMessage("Batch export complete");

    } catch (e) {
      console.error(e);
      showMessage("Batch export failed");
    } finally {
      setLoading(false);
    }
  });
  async function handleUrlFetch() {
    if (!urlInput) return;
    const url = urlInput.value.trim();
    if (!url) {
      showMessage("Please enter a URL");
      return;
    }

    setLoading(true, "Fetching image...");
    try {
      // Use our proxy API
      const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Failed to fetch image");

      const blob = await res.blob();
      const file = new File([blob], "image.png", { type: blob.type });

      // Reuse batch upload logic or single load?
      // Let's treat as a single load for now, or add to queue? 
      // Default to single replacement for "Fetch" button
      handleBatchUpload([file]);

      // Add to recent URLs
      if (!state.recentUrls.includes(url)) {
        state.recentUrls.unshift(url);
        if (state.recentUrls.length > 5) state.recentUrls.pop();
        updateRecentUrlsUI();
      }

      urlInput.value = "";
    } catch (err) {
      console.error(err);
      showMessage("Error loading image from URL");
    } finally {
      setLoading(false);
    }
  }

  function updateRecentUrlsUI() {
    if (!recentUrlsList) return;
    recentUrlsList.innerHTML = ''; // Clear existing options
    state.recentUrls.forEach(url => {
      const option = document.createElement('option');
      option.value = url;
      recentUrlsList.appendChild(option);
    });
  }

  urlSubmitBtn?.addEventListener("click", handleUrlFetch);
  urlInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleUrlFetch();
  });

  // ---------- Global Shortcuts ----------
  window.addEventListener("paste", (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        files.push(items[i].getAsFile());
      }
    }
    if (files.length > 0) {
      handleBatchUpload(files);
      showMessage("Image pasted from Clipboard");
    }
  });

  window.addEventListener("keydown", (e) => {
    // Ignore if input focused
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    // Ctrl+S: Save/Export
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      exportBtn?.click();
    }

    // Ctrl+Z: Undo
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      undoBtn?.click();
    }

    // Ctrl+Y or Ctrl+Shift+Z: Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
      e.preventDefault();
      redoBtn?.click();
    }

    // Esc: Cancel Crop or Blur
    if (e.key === "Escape") {
      if (state.crop.active) {
        exitCropMode();
      }
      if (state.enhancement.blurToolActive) {
        state.enhancement.blurToolActive = false;
        if (blurToolBtn) {
          blurToolBtn.dataset.active = "false";
          canvas.style.cursor = "default";
        }
        showMessage("Blur tool cancelled");
      }
    }
  });

  // ---------- Batch & Queue Logic ----------

  // ---------- History System ----------
  // We record specific properties: presetName, width, height, backgroundColor, padding, decoration, exportOptions, enhancement.
  // We do NOT record 'image' (heavy) or 'crop' (handled separately usually, or could undo crop?)

  function getSnapshot() {
    // Deep clone simple objects
    return JSON.parse(JSON.stringify({
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
      padding: state.padding,
      presetName: state.presetName,
      decoration: state.decoration,
      enhancement: state.enhancement,
      exportOptions: state.exportOptions,
      crop: state.crop // heavy?
    }));
  }

  function restoreSnapshot(snap) {
    if (!snap) return;
    // Copy back
    state.width = snap.width;
    state.height = snap.height;
    state.backgroundColor = snap.backgroundColor;
    state.padding = snap.padding;
    state.presetName = snap.presetName;
    state.decoration = snap.decoration;
    state.enhancement = snap.enhancement;
    state.exportOptions = snap.exportOptions;
    // crop?
    render();
  }

  function pushHistory() {
    // Limit history
    if (state.history.undo.length > 20) state.history.undo.shift();
    state.history.undo.push(getSnapshot());
    state.history.redo = []; // Clear redo on new action
    updateHistoryUI();
  }

  function updateHistoryUI() {
    if (undoBtn) undoBtn.disabled = state.history.undo.length === 0;
    if (redoBtn) redoBtn.disabled = state.history.redo.length === 0;
  }

  undoBtn?.addEventListener("click", () => {
    if (state.history.undo.length === 0) return;
    const current = getSnapshot();
    state.history.redo.push(current);
    const prev = state.history.undo.pop();
    restoreSnapshot(prev);
    updateHistoryUI();
  });

  redoBtn?.addEventListener("click", () => {
    if (state.history.redo.length === 0) return;
    const current = getSnapshot();
    state.history.undo.push(current);
    const next = state.history.redo.pop();
    restoreSnapshot(next);
    updateHistoryUI();
  });

  resetBtn?.addEventListener("click", () => {
    if (confirm("Reset all settings to default?")) {
      pushHistory();
      state.width = 1200; state.height = 628;
      state.backgroundColor = "#0f1729";
      state.padding = 60;
      state.presetName = "linkedin";
      state.decoration = { style: 'mac_dark', shadow: 'medium', roundness: 12 };
      state.enhancement = { brightness: 100, contrast: 100, sharpen: false, blurToolActive: false, blurRegions: [] };
      render();
    }
  });

  // ---------- Enhancement Listeners ----------
  // Wrap these inputs to trigger pushHistory on 'change' (commit), update render on 'input'

  brightnessSlider?.addEventListener("mousedown", () => pushHistory()); // Save state BEFORE start dragging
  brightnessSlider?.addEventListener("input", (e) => {
    state.enhancement.brightness = parseInt(e.target.value, 10);
    render();
  });

  contrastSlider?.addEventListener("mousedown", () => pushHistory());
  contrastSlider?.addEventListener("input", (e) => {
    state.enhancement.contrast = parseInt(e.target.value, 10);
    render();
  });

  sharpenToggle?.addEventListener("change", (e) => {
    pushHistory();
    state.enhancement.sharpen = e.target.checked;
    render();
  });

  // Blur Tool
  blurToolBtn?.addEventListener("click", () => {
    state.enhancement.blurToolActive = !state.enhancement.blurToolActive;
    if (state.enhancement.blurToolActive) {
      blurToolBtn.dataset.active = "true";
      canvas.style.cursor = "crosshair";
      showMessage("Blur Tool Active: Click and drag on image to blur.");
    } else {
      blurToolBtn.dataset.active = "false";
      canvas.style.cursor = "default";
    }
  });

  clearBlursBtn?.addEventListener("click", () => {
    if (state.enhancement.blurRegions.length === 0) return;
    pushHistory();
    state.enhancement.blurRegions = [];
    render();
    showMessage("All blurs removed");
  });

  blurIntensitySlider?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    state.enhancement.blurIntensity = val;
    if (blurIntensityVal) blurIntensityVal.textContent = val + "px";
    render();
  });

  blurIntensitySlider?.addEventListener("change", () => {
    pushHistory();
  });

  // Consolidated Blur logic moved to onCanvasMouseDown/Move/Up handlers below
  let blurStart = null;
  let draggingBlurIdx = -1;
  let blurDragOffset = { dx: 0, dy: 0 };
  let tempRegion = null;

  clearQueueBtn?.addEventListener("click", () => {
    state.queue = []; state.image = null; state.activeIndex = -1;
    render(); renderQueueUI();
  });

  // ---------- Export Settings Listeners ----------
  exportFormatSelect?.addEventListener("change", (e) => {
    state.exportOptions.format = e.target.value;
    updateQualityVisibility();
    render(); // To update file size estimate
  });

  exportQualityInput?.addEventListener("input", (e) => {
    state.exportOptions.quality = parseInt(e.target.value, 10) / 100;
    if (qualityValue) qualityValue.textContent = Math.round(state.exportOptions.quality * 100);
    render(); // Update file size
  });

  exportScaleGroup?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-scale]");
    if (!btn) return;
    state.exportOptions.scale = parseInt(btn.dataset.scale, 10);
    updateExportScaleUI();
  });

  // ---------- Developer Tools Listeners ----------
  gridToggle?.addEventListener("change", (e) => {
    state.showGrid = e.target.checked;
    render();
  });

  fitImageBtn?.addEventListener("click", () => {
    if (!state.image) { showMessage("Load an image first"); return; }
    // Set canvas size to image size + padding
    const pad = state.padding * 2;
    state.width = state.image.naturalWidth + pad;
    state.height = state.image.naturalHeight + pad;
    state.presetName = "custom";
    state.aspectRatio = state.width / state.height; // unlock or reset ratio

    // Update inputs
    if (customWidthInput) customWidthInput.value = state.width;
    if (customHeightInput) customHeightInput.value = state.height;

    render();
    showMessage("Canvas fit to image");
  });

  exportJsonBtn?.addEventListener("click", () => {
    const config = { ...state };
    // Remove heavy/circular objects
    delete config.image;
    delete config.queue;
    delete config.history;
    delete config.crop.selStart;

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sb_config_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showMessage("Config exported");
  });

  importJsonBtn?.addEventListener("click", () => importJsonInput?.click());

  importJsonInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const config = JSON.parse(evt.target.result);
        // Merge config into state (carefully)
        if (config.width) state.width = config.width;
        if (config.height) state.height = config.height;
        if (config.backgroundColor) state.backgroundColor = config.backgroundColor;
        if (config.padding !== undefined) state.padding = config.padding;
        if (config.presetName) state.presetName = config.presetName;
        if (config.decoration) state.decoration = { ...state.decoration, ...config.decoration };
        if (config.enhancement) state.enhancement = { ...state.enhancement, ...config.enhancement };
        if (config.exportOptions) state.exportOptions = { ...state.exportOptions, ...config.exportOptions };

        // Restore image? No, keep current image.

        render();
        showMessage("Config loaded");
      } catch (err) {
        console.error(err);
        showMessage("Failed to load config");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
        if (files && files.length) handleBatchUpload(files);
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
    // Update ratio state
    state.aspectRatio = state.width / state.height;
    render();
    updatePresetHighlight();
    showMessage(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset selected`);
  });

  function updatePresetHighlight() {
    const buttons = presetsContainer.querySelectorAll("button[data-preset]");
    buttons.forEach(btn => {
      const isSelected = btn.dataset.preset === state.presetName;
      if (isSelected) {
        btn.classList.add("ring-2", "ring-[#00D9FF]", "bg-slate-100", "dark:bg-white/10");
        btn.classList.remove("border-slate-200", "dark:border-[rgba(0,217,255,0.2)]");
      } else {
        btn.classList.remove("ring-2", "ring-[#00D9FF]", "bg-slate-100", "dark:bg-white/10");
        btn.classList.add("border-slate-200", "dark:border-[rgba(0,217,255,0.2)]");
      }
    });
  }



  // ---------- Code Rendering ----------
  renderCodeBtn?.addEventListener("click", async () => {
    const code = codeInput?.value;
    const lang = codeLanguage?.value || "javascript";
    if (!code || !code.trim()) { showMessage("Enter some code first"); return; }

    setLoading(true, "Highlighting code...");

    // Inject CSS if needed (One Dark)
    if (typeof document !== 'undefined' && !document.getElementById('hljs-style')) {
      const link = document.createElement('link');
      link.id = 'hljs-style';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
      document.head.appendChild(link);
      // Wait for CSS load? 
      await new Promise(r => setTimeout(r, 100));
    }

    try {
      // Create hidden container
      // Create hidden container
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "fit-content";
      container.style.minWidth = "600px"; // Wider base
      container.style.maxWidth = "2400px"; // Allow wider code
      container.style.background = "#282c34";
      container.style.padding = "40px"; // More breathing room
      container.style.borderRadius = "0px";
      container.style.fontFamily = "'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace";
      container.style.fontSize = "24px"; // 50% larger font
      container.style.lineHeight = "1.5";
      container.style.color = "#abb2bf";
      container.style.whiteSpace = "pre";
      container.className = "hljs"; // inherit theme styles

      const codeEl = document.createElement("div");
      codeEl.textContent = code;
      codeEl.className = `language-${lang}`;
      // Remove background from inner so container handles it
      codeEl.style.background = "transparent";
      codeEl.style.padding = "0";

      container.appendChild(codeEl);
      document.body.appendChild(container);

      // Highlight
      hljs.highlightElement(codeEl);

      // Wait a bit for fonts/styles?
      await new Promise(r => setTimeout(r, 50));

      // Render to canvas
      const codeCanvas = await html2canvas(container, {
        scale: 2.5, // Higher scale for crisp text
        backgroundColor: "#282c34",
        logging: false
      });

      // Convert to blob
      codeCanvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `code_snippet_${lang}.png`, { type: "image/png" });

          // Load it
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              state.image = img;
              state.activeIndex = -1; // Reset queue selection

              // Auto-fit to the code snippet for best result
              const pad = state.padding * 2;
              state.width = img.naturalWidth + pad;
              state.height = img.naturalHeight + pad;
              state.presetName = "custom";
              state.aspectRatio = state.width / state.height;
              if (customWidthInput) customWidthInput.value = state.width;
              if (customHeightInput) customHeightInput.value = state.height;

              render();
              showMessage("Code successfully rendered & fitted!");
              setLoading(false);
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);

        } else {
          showMessage("Failed to generate image");
          setLoading(false);
        }
        document.body.removeChild(container);
      }, "image/png");



    } catch (e) {
      console.error("Code render error", e);
      showMessage("Error processing code");
      setLoading(false);
    }
  });

  // ---------- Inputs ----------
  customWidthInput?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isFinite(val) && val > 0) {
      state.width = val;
      state.presetName = "custom";
      if (state.lockRatio && state.aspectRatio) {
        state.height = Math.round(state.width / state.aspectRatio);
      } else {
        state.aspectRatio = state.width / state.height;
      }
      render();
    }
  });

  customHeightInput?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isFinite(val) && val > 0) {
      state.height = val;
      state.presetName = "custom";
      if (state.lockRatio && state.aspectRatio) {
        state.width = Math.round(state.height * state.aspectRatio);
      } else {
        state.aspectRatio = state.width / state.height;
      }
      render();
    }
  });

  bgColorInput?.addEventListener("input", (e) => {
    state.backgroundColor = e.target.value;
    state.backgroundType = "solid";
    render();
    updateBackgroundUI();
  });

  bgTypeGroup?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-bg-type]");
    if (!btn) return;
    state.backgroundType = btn.dataset.bgType;
    render();
    updateBackgroundUI();
  });

  gradientsContainer?.addEventListener("click", e => {
    const btn = e.target.closest("button[data-gradient]");
    if (!btn) return;
    state.backgroundGradient = btn.dataset.gradient;
    state.backgroundType = "gradient";
    render();
    updateBackgroundUI();
  });

  applyCustomGradient?.addEventListener("click", () => {
    const color1 = gradientColor1?.value || "#FF0080";
    const color2 = gradientColor2?.value || "#7928CA";
    // Direction is already stored in state.gradientDirection
    state.backgroundGradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    state.backgroundType = "gradient";
    render();
    updateBackgroundUI();
    showMessage("Custom gradient applied");
  });

  gradientDirectionGroup?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-direction]");
    if (!btn) return;
    state.gradientDirection = btn.dataset.direction;

    // Update UI
    gradientDirectionGroup.querySelectorAll("button").forEach(b => {
      if (b.dataset.direction === state.gradientDirection) {
        b.classList.add("bg-white", "dark:bg-white/20");
      } else {
        b.classList.remove("bg-white", "dark:bg-white/20");
      }
    });

    // Re-render if gradient is active
    if (state.backgroundType === "gradient") {
      render();
      showMessage(`Direction: ${btn.title}`);
    }
  });

  // ---------- Watermark Listeners ----------
  watermarkToggle?.addEventListener("change", (e) => {
    state.watermark.enabled = e.target.checked;
    render();
    saveSettings();
    showMessage(state.watermark.enabled ? "Watermark enabled" : "Watermark disabled");
  });

  watermarkText?.addEventListener("input", (e) => {
    state.watermark.text = e.target.value;
    if (state.watermark.enabled) {
      render();
    }
    saveSettings();
  });

  watermarkPositionGroup?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-position]");
    if (!btn) return;
    state.watermark.position = btn.dataset.position;

    // Update UI
    watermarkPositionGroup.querySelectorAll("button").forEach(b => {
      if (b.dataset.position === state.watermark.position) {
        b.classList.add("bg-white", "dark:bg-white/20");
      } else {
        b.classList.remove("bg-white", "dark:bg-white/20");
      }
    });

    if (state.watermark.enabled) {
      render();
      showMessage(`Position: ${btn.title}`);
    }
    saveSettings();
  });

  watermarkSizeSlider?.addEventListener("input", (e) => {
    state.watermark.fontSize = parseInt(e.target.value, 10);
    if (state.watermark.enabled) render();
    saveSettings();
  });

  watermarkBoldToggle?.addEventListener("change", (e) => {
    state.watermark.fontWeight = e.target.checked ? "bold" : "normal";
    if (state.watermark.enabled) render();
    saveSettings();
  });

  function syncWatermarkUI() {
    if (watermarkToggle) watermarkToggle.checked = state.watermark.enabled;
    if (watermarkText) watermarkText.value = state.watermark.text;
    if (watermarkSizeSlider) watermarkSizeSlider.value = state.watermark.fontSize;
    if (watermarkBoldToggle) watermarkBoldToggle.checked = state.watermark.fontWeight === "bold";
    if (watermarkPositionGroup) {
      watermarkPositionGroup.querySelectorAll("button").forEach(b => {
        if (b.dataset.position === state.watermark.position) {
          b.classList.add("bg-white", "dark:bg-white/20");
        } else {
          b.classList.remove("bg-white", "dark:bg-white/20");
        }
      });
    }
  }

  function updateBackgroundUI() {
    if (bgTypeGroup) {
      bgTypeGroup.querySelectorAll("button").forEach(btn => {
        if (btn.dataset.bgType === state.backgroundType) {
          btn.classList.add("bg-white", "dark:bg-white/20", "shadow-sm");
          btn.classList.remove("text-slate-500");
        } else {
          btn.classList.remove("bg-white", "dark:bg-white/20", "shadow-sm");
          btn.classList.add("text-slate-500");
        }
      });
    }
    if (gradientsContainer) {
      if (state.backgroundType === 'gradient') {
        gradientsContainer.classList.remove("hidden");
        if (bgColorInput?.parentElement) bgColorInput.parentElement.classList.add("hidden");
      } else {
        gradientsContainer.classList.add("hidden");
        if (bgColorInput?.parentElement) bgColorInput.parentElement.classList.remove("hidden");
      }
    }
  }

  paddingSlider?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    state.padding = Number.isFinite(val) ? val : 0;
    if (paddingValueLabel) paddingValueLabel.textContent = state.padding;
    render();
  });

  highQualityToggle?.addEventListener("change", (e) => {
    state.highQuality = e.target.checked;
    render();
  });

  // ---------- Styling Listeners ----------
  windowStyleGroup?.addEventListener("click", e => {
    const btn = e.target.closest("button[data-style]");
    if (!btn) return;
    state.decoration.style = btn.dataset.style;
    render();
  });

  shadowSelect?.addEventListener("change", e => {
    state.decoration.shadow = e.target.value;
    render();
  });

  roundnessSlider?.addEventListener("input", e => {
    state.decoration.roundness = parseInt(e.target.value, 10);
    render();
  });

  lockRatioToggle?.addEventListener("change", (e) => {
    state.lockRatio = e.target.checked;
    if (state.lockRatio) {
      state.aspectRatio = state.width / state.height;
      showMessage("Aspect ratio locked");
    } else {
      showMessage("Aspect ratio unlocked");
    }
    render();
  });

  aspectRatiosContainer?.addEventListener("click", e => {
    const btn = e.target.closest("button[data-ratio]");
    if (!btn) return;
    const r = parseFloat(btn.dataset.ratio);
    if (r > 0) {
      // Keep width, adjust height
      state.height = Math.round(state.width / r);
      state.aspectRatio = r;
      state.presetName = "custom";
      state.lockRatio = true; // Auto-lock when selecting a specific ratio? User choice. Let's do it.
      render();
      showMessage(`Ratio set to ${btn.textContent}`);
    }
  });

  // ---------- Export Settings Listeners ----------
  exportFormatSelect?.addEventListener("change", (e) => {
    state.exportOptions.format = e.target.value;
    render(); // To update file size estimate and UI
  });

  exportQualityInput?.addEventListener("input", (e) => {
    state.exportOptions.quality = parseInt(e.target.value, 10) / 100;
    if (qualityValue) qualityValue.textContent = Math.round(state.exportOptions.quality * 100);
    render(); // Update file size
  });

  exportScaleGroup?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-scale]");
    if (!btn) return;
    state.exportOptions.scale = parseInt(btn.dataset.scale, 10);
    updateExportScaleUI();
    // We don't need to re-render canvas for scale update unless we want to show visual feedback (we don't)
    // But file size estimate might change if we implemented scaled estimation.
    // For now, just update UI.
  });

  exportBatchBtn?.addEventListener("click", async () => {
    if (state.queue.length === 0) return;

    // Save current active state before batch processing
    const originalSettings = getItemSettings();
    const originalImage = state.image;
    const originalActive = state.activeIndex;

    setLoading(true, "Generating batch export...");

    // Allow UI to update
    setTimeout(async () => {
      try {
        const zip = new JSZip();
        const folder = zip.folder("screenshots");

        for (let i = 0; i < state.queue.length; i++) {
          if (loadingText) loadingText.textContent = `Processing image ${i + 1}/${state.queue.length}...`;

          const item = state.queue[i];
          state.image = item.imgElement;
          state.activeIndex = i;

          // Apply this item's specific settings for rendering
          if (item.settings) {
            applyItemSettings(item.settings);
          }

          render();

          const scale = state.exportOptions.scale;
          const targetW = state.width * scale;
          const targetH = state.height * scale;
          const format = state.exportOptions.format;
          const quality = state.exportOptions.quality;
          const ext = format.split('/')[1];

          let blob;
          if (scale === 1) {
            blob = await new Promise(r => canvas.toBlob(r, format, quality));
          } else {
            const offCanvas = document.createElement("canvas");
            offCanvas.width = targetW;
            offCanvas.height = targetH;
            const offCtx = offCanvas.getContext("2d");
            offCtx.imageSmoothingEnabled = true;
            offCtx.imageSmoothingQuality = "high";
            offCtx.drawImage(canvas, 0, 0, targetW, targetH);
            blob = await new Promise(r => offCanvas.toBlob(r, format, quality));
          }

          folder.file(`beautified_${item.name.replace(/\.[^/.]+$/, "")}@${scale}x.${ext}`, blob);
          await new Promise(r => setTimeout(r, 10));
        }

        if (loadingText) loadingText.textContent = "Compressing zip...";
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url; a.download = `screenshots_batch_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        // Restore original active state
        applyItemSettings(originalSettings);
        state.image = originalImage;
        state.activeIndex = originalActive;
        syncUI();
        render();

        showMessage("Batch export downloaded!");
      } catch (e) {
        console.error(e);
        showMessage("Batch export failed");
      } finally {
        setLoading(false);
      }
    }, 50);
  });

  // ---------- Export Actions ----------
  exportBtn?.addEventListener("click", () => {
    setLoading(true, "Exporting image...");

    // Delay to allow UI to render loading state
    setTimeout(() => {
      try {
        // For Scale, we need to create a temporary canvas if scale is different from 1 (or match requested scale)
        // Current canvas is already rendered at high resolution if devicePixelRatio is high AND highQuality is on.
        // But precise 1x, 2x, 3x export needs explicit resizing.

        // Quick implementation:
        // 1. Create offscreen canvas of desired size.
        // 2. Draw current canvas into it.
        // 3. Export.

        const scale = state.exportOptions.scale;
        const format = state.exportOptions.format;
        const quality = state.exportOptions.quality;

        const targetW = state.width * scale;
        const targetH = state.height * scale;

        const offCanvas = document.createElement("canvas");
        offCanvas.width = targetW;
        offCanvas.height = targetH;
        const offCtx = offCanvas.getContext("2d");

        // Draw!
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = "high";
        offCtx.drawImage(canvas, 0, 0, targetW, targetH);

        offCanvas.toBlob((blob) => {
          if (!blob) {
            showMessage("Export failed.");
            setLoading(false);
            return;
          }
          const ext = format.split('/')[1];
          const name = `screenshot-${state.presetName || "export"}-${Date.now()}@${scale}x.${ext}`;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          showMessage("Image exported");
          setLoading(false);
        }, format, quality);
      } catch (e) {
        console.error(e);
        showMessage("Export failed");
        setLoading(false);
      }
    }, 50);
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

  function getLogicalPos(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Convert CSS pixels (cx, cy) to logical canvas pixels (lx, ly)
    // based on state.width and state.height
    const lx = (cx / rect.width) * state.width;
    const ly = (cy / rect.height) * state.height;

    return { lx, ly, cx, cy };
  }

  function mouseToImageSpace(e, info) {
    const { lx, ly, cx, cy } = getLogicalPos(e);
    const ix = (lx - info.x) / info.scale;
    const iy = (ly - info.y) / info.scale;
    return { x: ix, y: iy, lx, ly, cx, cy };
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
    if (h === "watermark") {
      canvas.style.cursor = "move";
      return;
    }
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



  function isMouseOverWatermark(lx, ly) {
    if (!state.watermark.enabled || !state.watermark.lastBounds) return false;
    const b = state.watermark.lastBounds;
    return lx >= b.x && lx <= b.x + b.w && ly >= b.y && ly <= b.y + b.h;
  }

  function onCanvasMouseDown(e) {
    const { lx, ly, cx, cy } = getLogicalPos(e);

    // Check Watermark dragging first (it's often small and specific)
    if (state.watermark.enabled && isMouseOverWatermark(lx, ly)) {
      watermarkDragging = true;
      state.watermark.position = "custom";
      const wx = state.watermark.x * state.width;
      const wy = state.watermark.y * state.height;
      watermarkDragOffset = { x: lx - wx, y: ly - wy };
      syncWatermarkUI();
      return;
    }

    // Blur Tool Logic
    const info = getImageDrawInfo();
    if (state.enhancement.blurToolActive && info && state.image) {
      const { x: imgX, y: imgY, w: imgW, h: imgH } = info;
      const nx = (lx - imgX) / imgW;
      const ny = (ly - imgY) / imgH;

      // Hit test existing blurs first (last drawn is top)
      for (let i = state.enhancement.blurRegions.length - 1; i >= 0; i--) {
        const r = state.enhancement.blurRegions[i];
        if (nx >= r.x && nx <= r.x + r.w && ny >= r.y && ny <= r.y + r.h) {
          draggingBlurIdx = i;
          blurDragOffset = { dx: nx - r.x, dy: ny - r.y };
          pushHistory();
          return;
        }
      }

      // If not dragging, start creating new
      if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
        blurStart = { x: nx, y: ny };
        pushHistory();
        return;
      }
    }

    if (!state.crop.active || !state.image) return;
    // Use existing 'info' from above
    const m = mouseToImageSpace(e, info);
    // Ignore outside image area
    if (m.x < 0 || m.y < 0 || m.x > state.image.naturalWidth || m.y > state.image.naturalHeight) return;

    const hover = getHoverHandle(m.lx, m.ly, info);
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
    const { lx, ly, cx, cy } = getLogicalPos(e);

    if (watermarkDragging) {
      state.watermark.x = clamp((lx - watermarkDragOffset.x) / state.width, 0, 1);
      state.watermark.y = clamp((ly - watermarkDragOffset.y) / state.height, 0, 1);
      render();
      return;
    }

    const info = getImageDrawInfo();

    // Blur Tool dragging or creating
    if (state.image && info) {
      const { x: imgX, y: imgY, w: imgW, h: imgH } = info;
      const nx = clamp((lx - imgX) / imgW, 0, 1);
      const ny = clamp((ly - imgY) / imgH, 0, 1);

      if (draggingBlurIdx !== -1) {
        const r = state.enhancement.blurRegions[draggingBlurIdx];
        // Ensure within bounds
        r.x = clamp(nx - blurDragOffset.dx, 0, 1 - r.w);
        r.y = clamp(ny - blurDragOffset.dy, 0, 1 - r.h);
        render();
        return;
      }

      if (blurStart) {
        tempRegion = {
          x: Math.min(blurStart.x, nx),
          y: Math.min(blurStart.y, ny),
          w: Math.abs(nx - blurStart.x),
          h: Math.abs(ny - blurStart.y)
        };
        render();
        // Draw preview overlay
        ctx.save();
        const bx = imgX + tempRegion.x * imgW;
        const by = imgY + tempRegion.y * imgH;
        const bw = tempRegion.w * imgW;
        const bh = tempRegion.h * imgH;

        ctx.save();
        ctx.beginPath();
        ctx.rect(bx, by, bw, bh);
        ctx.clip();
        const bVal = state.enhancement.brightness;
        const cVal = state.enhancement.contrast;
        const blurAmount = state.enhancement.blurIntensity;
        let filter = `blur(${blurAmount}px)`;
        if (bVal !== 100 || cVal !== 100) filter += ` brightness(${bVal}%) contrast(${cVal}%)`;
        ctx.filter = filter;
        ctx.drawImage(state.image, imgX, imgY, imgW, imgH);
        ctx.restore();

        ctx.strokeStyle = "#00D9FF";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = "rgba(0, 217, 255, 0.15)";
        ctx.fillRect(bx, by, bw, bh);
        ctx.restore();
        return;
      }
    }

    // If crop not active, just show appropriate cursor (if over selection or watermark or blurs)
    if (!state.crop.active || !state.image) {
      if (state.watermark.enabled && isMouseOverWatermark(lx, ly)) {
        setCursorForHandle("watermark");
      } else if (state.enhancement.blurToolActive && info) {
        const { x: imgX, y: imgY, w: imgW, h: imgH } = info;
        const nx = (lx - imgX) / imgW;
        const ny = (ly - imgY) / imgH;
        let overBlur = false;
        for (const r of state.enhancement.blurRegions) {
          if (nx >= r.x && nx <= r.x + r.w && ny >= r.y && ny <= r.y + r.h) {
            overBlur = true; break;
          }
        }
        canvas.style.cursor = overBlur ? "move" : "crosshair";
      } else {
        if (!info) {
          canvas.style.cursor = "default";
          return;
        }
        const hover = state.crop.sel ? getHoverHandle(lx, ly, info) : null;
        setCursorForHandle(hover);
      }
      return;
    }

    // Use existing 'info' from above
    const m = mouseToImageSpace(e, info);
    const imgW = state.image.naturalWidth;
    const imgH = state.image.naturalHeight;

    if (state.crop.dragMode === "none") {
      // Set cursor based on hover
      const hover = getHoverHandle(lx, ly, info);
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
    watermarkDragging = false;

    if (draggingBlurIdx !== -1) {
      draggingBlurIdx = -1;
      showMessage("Blur moved");
    }

    if (blurStart && tempRegion) {
      if (tempRegion.w > 0.01 && tempRegion.h > 0.01) {
        state.enhancement.blurRegions.push(tempRegion);
        showMessage("Blur Added");
      }
    }
    blurStart = null;
    tempRegion = null;

    saveSettings();
    render();

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
    loadSettings();

    if (customWidthInput) customWidthInput.value = state.width;
    if (customHeightInput) customHeightInput.value = state.height;
    if (bgColorInput) bgColorInput.value = state.backgroundColor;
    if (paddingSlider) paddingSlider.value = state.padding;
    if (paddingValueLabel) paddingValueLabel.textContent = state.padding;

    syncWatermarkUI();

    updateCropUI();
    updatePresetHighlight();
    render();
  }

  init();

  // Return a small API (optional) so consumers can call functions if needed
  return {
    getState: () => state,
    render,
  };
}
