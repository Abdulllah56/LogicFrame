'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Sparkles, Download, ZoomIn, ZoomOut, MousePointer,
  Magnet, Layers, Eye, EyeOff, Trash2, Lock, Unlock, Settings,
  Copy, ChevronUp, ChevronDown, X, ChevronsLeft, Undo, Redo,
  Plus, Minus, Check, Brush, Eraser, PenTool, Square, Circle,
  Sliders, Info, Sun, Moon, Wand2, Scan, Target, Crosshair, Zap
} from 'lucide-react';

import { useImageProcessor } from './components/ImageProcessor';
import { useToast } from '../invoicemaker/client/hooks/useToast';
import TextDetectionPanel from './components/TextDetectionPanelComp';
import ColorPalettePanel from './components/ColorPalettePanelComp';
import ObjectDetectionPanel from './components/ObjectDetectionPanel';

export default function AIImageEditor() {
  const {
    dilate,
    erode,
    gaussianBlur,
    calculateSelectionBounds,
    improvedFloodFill,
    computeEdgeMap
  } = useImageProcessor();
  const { toast } = useToast();

  // Load ColorThief lazily only when this editor is mounted (reduces global script weight)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.ColorThief) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/colorthief@2.4.0/dist/color-thief.umd.js';
      s.defer = true;
      s.onload = () => console.log('ColorThief loaded');
      document.body.appendChild(s);
    }
  }, []);

  // --- STATE ---
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [activeTool, setActiveTool] = useState('move');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Selection state
  const [selection, setSelection] = useState({
    active: false,
    mask: null,
    mode: 'add',
    bounds: null
  });

  const [refinementMode, setRefinementMode] = useState('magic');
  const [brushSettings, setBrushSettings] = useState({
    size: 20,
    hardness: 80,
    opacity: 100
  });

  // Magic Grab settings
  const [magicGrabSettings, setMagicGrabSettings] = useState({
    tolerance: 32,
    edgeDetection: 75,
    smoothing: 40,
    feather: 2,
    minArea: 100
  });

  // Detected Objects State
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [detectedText, setDetectedText] = useState([]);
  const [showObjectHighlights, setShowObjectHighlights] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);
  const [hoveredObjectId, setHoveredObjectId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [colorPalette, setColorPalette] = useState([]);
  const [vectorizedSvg, setVectorizedSvg] = useState(null);
  const [isVectorizing, setIsVectorizing] = useState(false);

  const [showSelectionPreview, setShowSelectionPreview] = useState(true);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [rectangleStart, setRectangleStart] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(null);

  // Transform state
  const [transforming, setTransforming] = useState({
    active: false,
    type: null,
    handle: null,
    startX: 0,
    startY: 0,
    originalLayer: null
  });

  // Processing state
  const [processing, setProcessing] = useState({
    active: false,
    status: ''
  });

  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectionHistory, setSelectionHistory] = useState([]);
  const [selectionHistoryIndex, setSelectionHistoryIndex] = useState(-1);

  // Canvas dimensions
  const maxCanvasWidth = 1200;
  const maxCanvasHeight = 800;

  // --- REFS ---
  const fileInputRef = useRef(null);
  const mainCanvasRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const edgeMapCanvasRef = useRef(null);
  const objectHighlightCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // --- HELPER FUNCTIONS (Define these FIRST) ---


  const saveSelectionToHistory = useCallback((mask) => {
    const newHistory = selectionHistory.slice(0, selectionHistoryIndex + 1);
    newHistory.push(new Uint8ClampedArray(mask));
    setSelectionHistory(newHistory);
    setSelectionHistoryIndex(newHistory.length - 1);
  }, [selectionHistory, selectionHistoryIndex]);

  const saveToHistory = useCallback((layersList) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(layersList)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Decodes a run-length encoded (RLE) mask string into a Uint8ClampedArray
  const decodeRle = useCallback((rle) => {
    const { size, counts } = rle;
    const [height, width] = size;
    const mask = new Uint8ClampedArray(width * height);
    let p = 0;
    let i = 0;
    while (i < counts.length) {
      const is_mask = i % 2 === 0;
      const count = counts[i];
      for (let j = 0; j < count; j++) {
        mask[p] = is_mask ? 1 : 0;
        p++;
      }
      i++;
    }
    return mask;
  }, []);

  const handleObjectsDetected = (objects) => {
    setDetectedObjects(objects);
  };

  // --- IMAGE UPLOAD (defined later in file) ---

  // --- DRAW OBJECT HIGHLIGHTS ---
  const drawObjectHighlights = useCallback(() => {
    const canvas = objectHighlightCanvasRef.current;
    if (!canvas || !showObjectHighlights || detectedObjects.length === 0) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detectedObjects.forEach((obj, index) => {
      const { box, rle } = obj;
      const [x1, y1, x2, y2] = box;
      const isHovered = obj.id === hoveredObjectId;

      ctx.strokeStyle = isHovered
        ? 'rgba(139, 92, 246, 0.9)'
        : `hsla(${(index * 137.5) % 360}, 70%, 60%, 0.7)`;
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.setLineDash(isHovered ? [10, 5] : [8, 4]);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.setLineDash([]);

      if (isHovered) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      }
    });
  }, [detectedObjects, showObjectHighlights, hoveredObjectId]);

  useEffect(() => {
    drawObjectHighlights();
  }, [detectedObjects, showObjectHighlights, hoveredObjectId, drawObjectHighlights]);

  const extractColorPalette = (img) => {
    if (!window.ColorThief) {
      setTimeout(() => extractColorPalette(img), 100);
      return;
    }
    const colorThief = new window.ColorThief();
    const palette = colorThief.getPalette(img, 8);
    setColorPalette(palette);
  };

  // --- GET OBJECT AT POSITION ---
  const getObjectAtPosition = useCallback((x, y) => {
    if (!detectedObjects.length) return null;

    for (let i = detectedObjects.length - 1; i >= 0; i--) {
      const obj = detectedObjects[i];
      const { minX, minY, maxX, maxY } = obj.bounds;

      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        return obj;
      }
    }

    return null;
  }, [detectedObjects]);

  // --- AUTO-SELECT DETECTED OBJECT ---
  const handleMagicGrabClick = useCallback(async (x, y) => {
    if (!selection.mask) {
      return;
    }

    const clickedObject = getObjectAtPosition(x, y);

    // If an object is clicked, use its center for a more accurate grab
    const targetX = clickedObject ? clickedObject.bounds.minX + (clickedObject.bounds.maxX - clickedObject.bounds.minX) / 2 : x;
    const targetY = clickedObject ? clickedObject.bounds.minY + (clickedObject.bounds.maxY - clickedObject.bounds.minY) / 2 : y;

    setProcessing({ active: true, status: '🤖 AI is detecting object...' });

    try {
      const sourceCanvas = sourceCanvasRef.current;
      if (!sourceCanvas) {
        throw new Error('No source canvas found');
      }

      const imageBase64 = sourceCanvas.toDataURL('image/png');

      const response = await fetch('/api/sam-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          point: { x: Math.round(targetX), y: Math.round(targetY) },
          box: clickedObject ? [clickedObject.bounds.minX, clickedObject.bounds.minY, clickedObject.bounds.maxX, clickedObject.bounds.maxY] : [targetX, targetY, targetX, targetY]
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API failed');
      }

      if (result.mask) {
        const decodedMask = decodeRle(result.mask);
        const newMask = new Uint8ClampedArray(decodedMask.length);
        for (let i = 0; i < decodedMask.length; i++) {
          newMask[i] = decodedMask[i] * 255;
        }

        const finalMask = new Uint8ClampedArray(selection.mask);
        for (let i = 0; i < finalMask.length; i++) {
          if (selection.mode === 'add') {
            finalMask[i] = Math.max(finalMask[i], newMask[i]);
          } else {
            finalMask[i] = Math.max(0, finalMask[i] - newMask[i]);
          }
        }

        setSelection(prev => ({
          ...prev,
          mask: finalMask,
          bounds: calculateSelectionBounds(finalMask, sourceCanvas.width, sourceCanvas.height)
        }));

        saveSelectionToHistory(finalMask);
      } else {
        throw new Error('No mask returned from AI');
      }
    } catch (error) {
      setProcessing({ active: true, status: 'Using local detection...' });

      // Fallback to original magic grab method
      try {
        const sourceCanvas = sourceCanvasRef.current;
        if (!sourceCanvas) return;

        const sourceCtx = sourceCanvas.getContext('2d');
        const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

        const edgeCanvas = edgeMapCanvasRef.current;
        if (!edgeCanvas) return;

        const edgeCtx = edgeCanvas.getContext('2d');
        const edgeImageData = edgeCtx.getImageData(0, 0, edgeCanvas.width, edgeCanvas.height);
        const edgeMap = new Float32Array(edgeCanvas.width * edgeCanvas.height);

        for (let i = 0; i < edgeMap.length; i++) {
          edgeMap[i] = edgeImageData.data[i * 4];
        }

        const { mask: detectedMask } = improvedFloodFill(
          Math.floor(x), // Fallback should still use original click
          Math.floor(y),
          imageData,
          { edgeMap },
          magicGrabSettings
        );

        let processedMask = detectedMask;
        processedMask = erode(processedMask, sourceCanvas.width, sourceCanvas.height, 1);
        processedMask = dilate(processedMask, sourceCanvas.width, sourceCanvas.height, 2);

        if (magicGrabSettings.feather > 0) {
          processedMask = gaussianBlur(
            processedMask,
            sourceCanvas.width,
            sourceCanvas.height,
            magicGrabSettings.feather
          );
        }

        const newMask = new Uint8ClampedArray(selection.mask);
        for (let i = 0; i < newMask.length; i++) {
          if (selection.mode === 'add') {
            newMask[i] = Math.max(newMask[i], processedMask[i]);
          } else {
            newMask[i] = Math.max(0, newMask[i] - processedMask[i]);
          }
        }

        setSelection(prev => ({
          ...prev,
          mask: newMask,
          bounds: calculateSelectionBounds(newMask, sourceCanvas.width, sourceCanvas.height)
        }));

        saveSelectionToHistory(newMask);

      } catch (fallbackError) {
      }
    } finally {
      setProcessing({ active: false, status: '' });
    }
  }, [
    selection.mask,
    selection.mode,
    getObjectAtPosition,
    magicGrabSettings,
    improvedFloodFill,
    erode,
    dilate,
    gaussianBlur,
    calculateSelectionBounds,
    saveSelectionToHistory
  ]);
  // --- HELPER FUNCTIONS ---
  const getSelectedLayer = useCallback(() => {
    return layers.find(l => l.id === selectedLayerId);
  }, [layers, selectedLayerId]);

  const isPointInLayer = (x, y, layer) => {
    return x >= layer.x &&
      x <= layer.x + layer.width &&
      y >= layer.y &&
      y <= layer.y + layer.height;
  };

  const getTransformHandles = (layer) => {
    const handleSize = 8;
    return {
      topLeft: { x: layer.x - handleSize / 2, y: layer.y - handleSize / 2, cursor: 'nw-resize' },
      topRight: { x: layer.x + layer.width - handleSize / 2, y: layer.y - handleSize / 2, cursor: 'ne-resize' },
      bottomLeft: { x: layer.x - handleSize / 2, y: layer.y + layer.height - handleSize / 2, cursor: 'sw-resize' },
      bottomRight: { x: layer.x + layer.width - handleSize / 2, y: layer.y + layer.height - handleSize / 2, cursor: 'se-resize' },
      top: { x: layer.x + layer.width / 2 - handleSize / 2, y: layer.y - handleSize / 2, cursor: 'n-resize' },
      bottom: { x: layer.x + layer.width / 2 - handleSize / 2, y: layer.y + layer.height - handleSize / 2, cursor: 's-resize' },
      left: { x: layer.x - handleSize / 2, y: layer.y + layer.height / 2 - handleSize / 2, cursor: 'w-resize' },
      right: { x: layer.x + layer.width - handleSize / 2, y: layer.y + layer.height / 2 - handleSize / 2, cursor: 'e-resize' },
      rotate: { x: layer.x + layer.width / 2 - handleSize / 2, y: layer.y - 30, cursor: 'grab' }
    };
  };

  const isPointInHandle = (x, y, handle, size = 8) => {
    return x >= handle.x && x <= handle.x + size &&
      y >= handle.y && y <= handle.y + size;
  };

  // --- SELECTION DRAWING ---
  const drawSelection = useCallback(() => {
    const canvas = selectionCanvasRef.current;
    if (!canvas || !selection.mask) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const mask = selection.mask;

    for (let i = 0; i < mask.length; i++) {
      const value = mask[i];
      imageData.data[i * 4] = 0;
      imageData.data[i * 4 + 1] = 200;
      imageData.data[i * 4 + 2] = 255;
      imageData.data[i * 4 + 3] = value * 0.5;
    }

    ctx.putImageData(imageData, 0, 0);

    if (selection.bounds) {
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -Date.now() / 50;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        selection.bounds.minX,
        selection.bounds.minY,
        selection.bounds.maxX - selection.bounds.minX,
        selection.bounds.maxY - selection.bounds.minY
      );
      ctx.setLineDash([]);
    }

    if (isDrawingPath && currentPath.length > 0 && refinementMode !== 'magic') {
      ctx.strokeStyle = refinementMode === 'eraser' ? 'rgba(255, 140, 0, 0.8)' : 'rgba(0, 200, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      if (refinementMode === 'lasso') {
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
      } else if (refinementMode === 'rectangle' && rectangleStart && currentPath.length > 0) {
        const current = currentPath[currentPath.length - 1];
        const width = current.x - rectangleStart.x;
        const height = current.y - rectangleStart.y;
        ctx.strokeRect(rectangleStart.x, rectangleStart.y, width, height);
      } else if (refinementMode === 'ellipse' && rectangleStart && currentPath.length > 0) {
        const current = currentPath[currentPath.length - 1];
        const centerX = (rectangleStart.x + current.x) / 2;
        const centerY = (rectangleStart.y + current.y) / 2;
        const radiusX = Math.abs(current.x - rectangleStart.x) / 2;
        const radiusY = Math.abs(current.y - rectangleStart.y) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    if (cursorPosition && (refinementMode === 'brush' || refinementMode === 'eraser')) {
      ctx.beginPath();
      ctx.arc(cursorPosition.x, cursorPosition.y, brushSettings.size / 2, 0, 2 * Math.PI);
      ctx.strokeStyle = refinementMode === 'eraser' ? 'rgba(255, 140, 0, 0.8)' : 'rgba(0, 200, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (brushSettings.hardness > 0) {
        ctx.beginPath();
        const innerRadius = (brushSettings.size / 2) * (brushSettings.hardness / 100);
        ctx.arc(cursorPosition.x, cursorPosition.y, innerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = refinementMode === 'eraser' ? 'rgba(255, 140, 0, 0.4)' : 'rgba(0, 200, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cursorPosition.x, cursorPosition.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = refinementMode === 'eraser' ? 'rgba(255, 140, 0, 1)' : 'rgba(0, 200, 255, 1)';
      ctx.fill();
    }

    if (cursorPosition && refinementMode === 'magic') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(cursorPosition.x, cursorPosition.y, 15, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      const sparkles = [
        [10, -10], [-10, 10], [12, 0], [-12, 0], [0, 12], [0, -12]
      ];
      sparkles.forEach(([dx, dy]) => {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(cursorPosition.x + dx, cursorPosition.y + dy, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

      ctx.restore();
    }
  }, [selection, isDrawingPath, currentPath, rectangleStart, refinementMode, cursorPosition, brushSettings]);

  useEffect(() => {
    if (selection.active) {
      drawSelection();
    }
  }, [selection, drawSelection, cursorPosition, brushSettings]);

  // Continue to Part 4...
  // ... continuing from Part 3

  // --- CANVAS CURSOR ---
  // --- CANVAS CURSOR ---
  const canvasCursor = () => {
    if (!uploadedImage) return 'default';

    // Show processing cursor when AI is working
    if (processing.active) return 'wait';

    if (activeTool === 'move') {
      if (transforming.active) {
        if (transforming.type === 'move') return 'grabbing';
        if (transforming.type === 'rotate') return 'grabbing';
        if (transforming.handle) return transforming.handle.cursor;
      }

      const layer = getSelectedLayer();
      if (layer && !layer.locked) {
        return 'grab';
      }
      return 'move';
    }

    if (activeTool === 'select' && selection.active) {
      if (refinementMode === 'brush' || refinementMode === 'eraser' || refinementMode === 'magic') {
        return 'none';
      }
      if (refinementMode === 'lasso') return 'crosshair';
      if (refinementMode === 'rectangle' || refinementMode === 'ellipse') return 'crosshair';
      return 'crosshair';
    }
    if (activeTool === 'select') return 'crosshair';
    return 'default';
  };

  // --- IMAGE UPLOAD ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);

        const aspectRatio = img.width / img.height;
        let canvasWidth = maxCanvasWidth;
        let canvasHeight = maxCanvasHeight;

        if (aspectRatio > maxCanvasWidth / maxCanvasHeight) {
          canvasHeight = maxCanvasWidth / aspectRatio;
        } else {
          canvasWidth = maxCanvasHeight * aspectRatio;
        }

        const sourceCanvas = sourceCanvasRef.current;
        if (sourceCanvas) {
          sourceCanvas.width = canvasWidth;
          sourceCanvas.height = canvasHeight;
          const sourceCtx = sourceCanvas.getContext('2d');
          sourceCtx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

          const imageData = sourceCtx.getImageData(0, 0, canvasWidth, canvasHeight);
          const { edgeMap } = computeEdgeMap(imageData);

          const edgeCanvas = edgeMapCanvasRef.current;
          if (edgeCanvas) {
            edgeCanvas.width = canvasWidth;
            edgeCanvas.height = canvasHeight;
            const edgeCtx = edgeCanvas.getContext('2d');
            const edgeImageData = edgeCtx.createImageData(canvasWidth, canvasHeight);

            for (let i = 0; i < edgeMap.length; i++) {
              const value = Math.min(255, edgeMap[i]);
              edgeImageData.data[i * 4] = value;
              edgeImageData.data[i * 4 + 1] = value;
              edgeImageData.data[i * 4 + 2] = value;
              edgeImageData.data[i * 4 + 3] = 255;
            }
            edgeCtx.putImageData(edgeImageData, 0, 0);
          }

          const highlightCanvas = objectHighlightCanvasRef.current;
          if (highlightCanvas) {
            highlightCanvas.width = canvasWidth;
            highlightCanvas.height = canvasHeight;
          }

          const newLayer = {
            id: Date.now(),
            name: 'Background',
            src: sourceCanvas.toDataURL(),
            x: 0,
            y: 0,
            width: canvasWidth,
            height: canvasHeight,
            rotation: 0,
            opacity: 100,
            visible: true,
            locked: false,
            isBackground: true
          };

          setLayers([newLayer]);
          setSelectedLayerId(newLayer.id);
          renderCanvas([newLayer]);
          saveToHistory([newLayer]);
          extractColorPalette(img);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- RENDER CANVAS ---
  const renderCanvas = useCallback((layersList = layers) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridSize = 20;
    for (let y = 0; y < canvas.height; y += gridSize) {
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.fillStyle = (x / gridSize + y / gridSize) % 2 === 0 ? '#ffffff' : '#e5e5e5';
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }

    layersList.forEach(layer => {
      if (!layer.visible) return;

      const img = new Image();
      img.src = layer.src;

      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
      ctx.restore();
    });

    if (activeTool === 'move' && selectedLayerId) {
      const selectedLayer = layersList.find(l => l.id === selectedLayerId);
      if (selectedLayer && !selectedLayer.locked) {
        drawTransformHandles(ctx, selectedLayer);
      }
    }
  }, [layers, activeTool, selectedLayerId]);

  const drawTransformHandles = (ctx, layer) => {
    const handleSize = 8;
    const handles = getTransformHandles(layer);

    ctx.save();
    ctx.strokeStyle = '#00c8ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#00c8ff';
    ctx.lineWidth = 2;

    Object.entries(handles).forEach(([key, handle]) => {
      if (key === 'rotate') {
        ctx.beginPath();
        ctx.arc(handle.x + handleSize / 2, handle.y + handleSize / 2, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(layer.x + layer.width / 2, layer.y);
        ctx.lineTo(handle.x + handleSize / 2, handle.y + handleSize / 2);
        ctx.strokeStyle = '#00c8ff';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
      }
    });

    ctx.restore();
  };

  useEffect(() => {
    renderCanvas();
  }, [layers, renderCanvas]);

  // --- MOUSE HANDLERS ---
  const getCanvasCoordinates = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return { x, y };
  };

  const handleCanvasMouseDown = (e) => {
    if (!uploadedImage) return;

    const coords = getCanvasCoordinates(e);

    if (activeTool === 'move' && selectedLayerId) {
      const layer = getSelectedLayer();
      if (!layer || layer.locked) return;

      const handles = getTransformHandles(layer);

      if (isPointInHandle(coords.x, coords.y, handles.rotate, 12)) {
        setTransforming({
          active: true,
          type: 'rotate',
          handle: handles.rotate,
          startX: coords.x,
          startY: coords.y,
          originalLayer: { ...layer },
          centerX: layer.x + layer.width / 2,
          centerY: layer.y + layer.height / 2
        });
        return;
      }

      for (const [key, handle] of Object.entries(handles)) {
        if (key !== 'rotate' && isPointInHandle(coords.x, coords.y, handle, 8)) {
          setTransforming({
            active: true,
            type: 'resize',
            handle: { ...handle, name: key },
            startX: coords.x,
            startY: coords.y,
            originalLayer: { ...layer }
          });
          return;
        }
      }

      if (isPointInLayer(coords.x, coords.y, layer)) {
        setTransforming({
          active: true,
          type: 'move',
          handle: null,
          startX: coords.x,
          startY: coords.y,
          originalLayer: { ...layer }
        });
        return;
      }
    }

    if (activeTool === 'select' && selection.active) {
      if (refinementMode === 'magic') {
        handleMagicGrabClick(coords.x, coords.y);
      } else if (refinementMode === 'brush' || refinementMode === 'eraser') {
        setIsDrawingPath(true);
        applyBrushStroke(coords.x, coords.y);
      } else if (refinementMode === 'lasso') {
        setIsDrawingPath(true);
        setCurrentPath([coords]);
      } else if (refinementMode === 'rectangle' || refinementMode === 'ellipse') {
        setIsDrawingPath(true);
        setRectangleStart(coords);
        setCurrentPath([coords]);
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!uploadedImage) return;

    const coords = getCanvasCoordinates(e);

    if (activeTool === 'select' && selection.active) {
      setCursorPosition(coords);

      if (refinementMode === 'magic' && showObjectHighlights) {
        const hoveredObj = getObjectAtPosition(coords.x, coords.y);
        setHoveredObjectId(hoveredObj ? hoveredObj.id : null);
      }
    }

    if (transforming.active && activeTool === 'move') {
      const layer = getSelectedLayer();
      if (!layer) return;

      const dx = coords.x - transforming.startX;
      const dy = coords.y - transforming.startY;

      if (transforming.type === 'move') {
        updateLayer(layer.id, {
          x: transforming.originalLayer.x + dx,
          y: transforming.originalLayer.y + dy
        });
      } else if (transforming.type === 'resize') {
        handleResize(layer, coords, transforming);
      } else if (transforming.type === 'rotate') {
        handleRotate(layer, coords, transforming);
      }
    }

    if (activeTool === 'select' && selection.active && isDrawingPath && refinementMode !== 'magic') {
      if (refinementMode === 'brush' || refinementMode === 'eraser') {
        applyBrushStroke(coords.x, coords.y);
      } else if (refinementMode === 'lasso') {
        setCurrentPath(prev => [...prev, coords]);
      } else if (refinementMode === 'rectangle' || refinementMode === 'ellipse') {
        setCurrentPath([coords]);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawingPath && refinementMode !== 'magic') {
      if (refinementMode === 'lasso' && currentPath.length > 2) {
        applyPathToSelection(currentPath, 'lasso');
      } else if (refinementMode === 'rectangle' && rectangleStart && currentPath.length > 0) {
        applyPathToSelection([rectangleStart, currentPath[0]], 'rectangle');
      } else if (refinementMode === 'ellipse' && rectangleStart && currentPath.length > 0) {
        applyPathToSelection([rectangleStart, currentPath[0]], 'ellipse');
      }

      setIsDrawingPath(false);
      setCurrentPath([]);
      setRectangleStart(null);
    }

    if (transforming.active) {
      const layer = getSelectedLayer();
      if (layer) {
        saveToHistory(layers);
      }
      setTransforming({ active: false, type: null, handle: null, startX: 0, startY: 0, originalLayer: null });
    }
  };

  const handleCanvasMouseLeave = () => {
    setCursorPosition(null);
    setHoveredObjectId(null);
    handleCanvasMouseUp();
  };

  // Continue to Part 5...
  // ... continuing from Part 4

  // --- TRANSFORM HELPERS ---
  const handleResize = (layer, coords, transform) => {
    const { originalLayer, handle, startX, startY } = transform;
    const dx = coords.x - startX;
    const dy = coords.y - startY;

    let newX = originalLayer.x;
    let newY = originalLayer.y;
    let newWidth = originalLayer.width;
    let newHeight = originalLayer.height;

    switch (handle.name) {
      case 'topLeft':
        newX = originalLayer.x + dx;
        newY = originalLayer.y + dy;
        newWidth = originalLayer.width - dx;
        newHeight = originalLayer.height - dy;
        break;
      case 'topRight':
        newY = originalLayer.y + dy;
        newWidth = originalLayer.width + dx;
        newHeight = originalLayer.height - dy;
        break;
      case 'bottomLeft':
        newX = originalLayer.x + dx;
        newWidth = originalLayer.width - dx;
        newHeight = originalLayer.height + dy;
        break;
      case 'bottomRight':
        newWidth = originalLayer.width + dx;
        newHeight = originalLayer.height + dy;
        break;
      case 'top':
        newY = originalLayer.y + dy;
        newHeight = originalLayer.height - dy;
        break;
      case 'bottom':
        newHeight = originalLayer.height + dy;
        break;
      case 'left':
        newX = originalLayer.x + dx;
        newWidth = originalLayer.width - dx;
        break;
      case 'right':
        newWidth = originalLayer.width + dx;
        break;
    }

    if (newWidth > 10 && newHeight > 10) {
      updateLayer(layer.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleRotate = (layer, coords, transform) => {
    const { centerX, centerY } = transform;
    const angle = Math.atan2(coords.y - centerY, coords.x - centerX);
    const degrees = (angle * 180 / Math.PI) + 90;
    updateLayer(layer.id, { rotation: Math.round(degrees) });
  };

  // --- BRUSH STROKE APPLICATION ---
  const applyBrushStroke = (x, y) => {
    if (!selection.mask) return;

    const canvas = sourceCanvasRef.current;
    if (!canvas) return;

    const newMask = new Uint8ClampedArray(selection.mask);
    const radius = brushSettings.size / 2;
    const hardness = brushSettings.hardness / 100;
    const opacity = brushSettings.opacity / 100;

    const isEraser = refinementMode === 'eraser';
    const edgeMap = getEdgeMapData();

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radius) continue;

        const px = Math.round(x + dx);
        const py = Math.round(y + dy);

        if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;

        const idx = py * canvas.width + px;
        let strength = 1 - (distance / radius);

        if (hardness > 0) {
          strength = Math.pow(strength, 1 / hardness);
        }

        strength *= opacity;

        if (isEraser) {
          const edgeStrength = edgeMap ? edgeMap[idx] / 255 : 0;
          const snapFactor = hardness;
          const repelStrength = strength * (1 + edgeStrength * snapFactor);

          if (selection.mode === 'add') {
            newMask[idx] = Math.max(0, newMask[idx] - repelStrength * 255);
          } else {
            newMask[idx] = Math.min(255, newMask[idx] + repelStrength * 255);
          }
        } else {
          if (selection.mode === 'add') {
            newMask[idx] = Math.min(255, newMask[idx] + strength * 255);
          } else {
            newMask[idx] = Math.max(0, newMask[idx] - strength * 255);
          }
        }
      }
    }

    setSelection(prev => ({
      ...prev,
      mask: newMask,
      bounds: calculateSelectionBounds(newMask, canvas.width, canvas.height)
    }));

    saveSelectionToHistory(newMask);
  };

  const getEdgeMapData = () => {
    const edgeCanvas = edgeMapCanvasRef.current;
    if (!edgeCanvas) return null;

    const ctx = edgeCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, edgeCanvas.width, edgeCanvas.height);
    const edgeMap = new Float32Array(edgeCanvas.width * edgeCanvas.height);

    for (let i = 0; i < edgeMap.length; i++) {
      edgeMap[i] = imageData.data[i * 4];
    }

    return edgeMap;
  };

  const applyPathToSelection = (path, type) => {
    if (!selection.mask || path.length === 0) return;

    const canvas = sourceCanvasRef.current;
    if (!canvas) return;

    const newMask = new Uint8ClampedArray(selection.mask);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');

    ctx.beginPath();

    if (type === 'lasso') {
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.closePath();
    } else if (type === 'rectangle') {
      const x = Math.min(path[0].x, path[1].x);
      const y = Math.min(path[0].y, path[1].y);
      const w = Math.abs(path[1].x - path[0].x);
      const h = Math.abs(path[1].y - path[0].y);
      ctx.rect(x, y, w, h);
    } else if (type === 'ellipse') {
      const centerX = (path[0].x + path[1].x) / 2;
      const centerY = (path[0].y + path[1].y) / 2;
      const radiusX = Math.abs(path[1].x - path[0].x) / 2;
      const radiusY = Math.abs(path[1].y - path[0].y) / 2;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    }

    ctx.fillStyle = 'white';
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < newMask.length; i++) {
      const isInside = imageData.data[i * 4] > 128;
      if (selection.mode === 'add') {
        if (isInside) newMask[i] = 255;
      } else {
        if (isInside) newMask[i] = 0;
      }
    }

    setSelection(prev => ({
      ...prev,
      mask: newMask,
      bounds: calculateSelectionBounds(newMask, canvas.width, canvas.height)
    }));

    saveSelectionToHistory(newMask);
  };

  // --- HISTORY HANDLERS ---
  const handleUndo = () => {
    if (selection.active && selectionHistoryIndex > 0) {
      const newIndex = selectionHistoryIndex - 1;
      setSelectionHistoryIndex(newIndex);
      const canvas = sourceCanvasRef.current;
      if (canvas) {
        setSelection(prev => ({
          ...prev,
          mask: new Uint8ClampedArray(selectionHistory[newIndex]),
          bounds: calculateSelectionBounds(selectionHistory[newIndex], canvas.width, canvas.height)
        }));
      }
    } else if (!selection.active && historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayers(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const handleRedo = () => {
    if (selection.active && selectionHistoryIndex < selectionHistory.length - 1) {
      const newIndex = selectionHistoryIndex + 1;
      setSelectionHistoryIndex(newIndex);
      const canvas = sourceCanvasRef.current;
      if (canvas) {
        setSelection(prev => ({
          ...prev,
          mask: new Uint8ClampedArray(selectionHistory[newIndex]),
          bounds: calculateSelectionBounds(selectionHistory[newIndex], canvas.width, canvas.height)
        }));
      }
    } else if (!selection.active && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayers(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const handleRemoveBackground = async (layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    setProcessing({ active: true, status: 'Removing background...' });

    try {
      const response = await fetch('/api/background-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: layer.src })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API failed');
      }

      updateLayer(layerId, { src: result.image });

    } catch (error) {
      toast({
        title: "Error Removing Background",
        description: "Could not remove the background. Please try again.",
      });
    } finally {
      setProcessing({ active: false, status: '' });
    }
  };

  const handleVectorize = async () => {
    const sourceCanvas = sourceCanvasRef.current;
    if (!sourceCanvas) return;

    setIsVectorizing(true);
    setProcessing({ active: true, status: 'Vectorizing image...' });

    try {
      const imageBase64 = sourceCanvas.toDataURL('image/png');

      const response = await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
        })
      });

      const result = await response.json();

      if (response.ok) {
        setVectorizedSvg(result.svg);
      } else {
        throw new Error(result.error || 'API failed');
      }

    } catch (error) {
      toast({
        title: "Error Vectorizing Image",
        description: error.message || "Could not vectorize the image. Please try again.",
      });
    } finally {
      setIsVectorizing(false);
      setProcessing({ active: false, status: '' });
    }
  };


  // --- SELECTION MANAGEMENT ---
  const startSelection = () => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;

    const mask = new Uint8ClampedArray(canvas.width * canvas.height);

    setSelection({
      active: true,
      mask: mask,
      mode: 'add',
      bounds: null
    });

    setSelectionHistory([mask]);
    setSelectionHistoryIndex(0);
    setActiveTool('select');
    setRefinementMode('magic');
  };

  useEffect(() => {
    if (activeTool === 'select' && !selection.active && uploadedImage) {
      startSelection();
    }
  }, [activeTool, uploadedImage]);

  const extractFromSelection = async () => {
    if (!selection.mask || !selection.bounds) return;

    setProcessing({ active: true, status: 'Extracting object...' });

    await new Promise(resolve => setTimeout(resolve, 100));

    const sourceCanvas = sourceCanvasRef.current;
    if (!sourceCanvas) {
      setProcessing({ active: false, status: '' });
      return;
    }

    const sourceCtx = sourceCanvas.getContext('2d');
    const { minX, minY, maxX, maxY } = selection.bounds;

    const width = maxX - minX;
    const height = maxY - minY;

    const extractCanvas = document.createElement('canvas');
    extractCanvas.width = width;
    extractCanvas.height = height;
    const extractCtx = extractCanvas.getContext('2d');

    const sourceImageData = sourceCtx.getImageData(minX, minY, width, height);
    const extractImageData = extractCtx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sourceIdx = ((minY + y) * sourceCanvas.width + (minX + x));
        const maskValue = selection.mask[sourceIdx];
        const targetIdx = (y * width + x) * 4;
        const sourcePixelIdx = targetIdx;

        extractImageData.data[targetIdx] = sourceImageData.data[sourcePixelIdx];
        extractImageData.data[targetIdx + 1] = sourceImageData.data[sourcePixelIdx + 1];
        extractImageData.data[targetIdx + 2] = sourceImageData.data[sourcePixelIdx + 2];
        extractImageData.data[targetIdx + 3] = maskValue;
      }
    }

    extractCtx.putImageData(extractImageData, 0, 0);

    const newLayer = {
      id: Date.now(),
      name: `Extracted Object ${layers.length}`,
      src: extractCanvas.toDataURL(),
      x: minX,
      y: minY,
      width: width,
      height: height,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      isBackground: false
    };

    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setSelectedLayerId(newLayer.id);
    saveToHistory(newLayers);

    cancelSelection();
    setProcessing({ active: false, status: '' });
    setActiveTool('move');
  };

  const cancelSelection = () => {
    const canvas = selectionCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setSelection({
      active: false,
      mask: null,
      mode: 'add',
      bounds: null
    });
    setSelectionHistory([]);
    setSelectionHistoryIndex(-1);
    setActiveTool('move');
    setIsDrawingPath(false);
    setCurrentPath([]);
    setRectangleStart(null);
    setCursorPosition(null);
  };

  // --- LAYER MANAGEMENT ---
  const updateLayer = (id, updates) => {
    const newLayers = layers.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    );
    setLayers(newLayers);
    if (!transforming.active) {
      saveToHistory(newLayers);
    }
  };

  const deleteLayer = (id) => {
    const newLayers = layers.filter(layer => layer.id !== id);
    setLayers(newLayers);
    if (selectedLayerId === id) {
      setSelectedLayerId(newLayers[0]?.id || null);
    }
    saveToHistory(newLayers);
  };

  const duplicateLayer = (id) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;

    const newLayer = {
      ...layer,
      id: Date.now(),
      name: `${layer.name} Copy`,
      x: layer.x + 20,
      y: layer.y + 20
    };

    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setSelectedLayerId(newLayer.id);
    saveToHistory(newLayers);
  };

  const moveLayer = (id, direction) => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;

    const newLayers = [...layers];
    if (direction === 'up' && index > 0) {
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    } else if (direction === 'down' && index < layers.length - 1) {
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    }

    setLayers(newLayers);
    saveToHistory(newLayers);
  };

  // --- ZOOM HANDLERS ---
  const handleZoomIn = () => {
    setZoom(z => Math.min(3, z + 0.1));
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(0.1, z - 0.1));
  };

  // --- EXPORT ---
  const handleExport = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'ai-edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selection.active) {
        if (e.key === 'Shift') {
          setSelection(prev => ({ ...prev, mode: 'add' }));
        } else if (e.key === 'Alt') {
          e.preventDefault();
          setSelection(prev => ({ ...prev, mode: 'subtract' }));
        } else if (e.key === 'Escape') {
          cancelSelection();
        } else if (e.key === '0') {
          setRefinementMode('magic');
        } else if (e.key === '1') {
          setRefinementMode('brush');
        } else if (e.key === '2') {
          setRefinementMode('eraser');
        } else if (e.key === '3') {
          setRefinementMode('lasso');
        } else if (e.key === '4') {
          setRefinementMode('rectangle');
        } else if (e.key === '5') {
          setRefinementMode('ellipse');
        } else if (e.key === 'h' || e.key === 'H') {
          setShowObjectHighlights(prev => !prev);
        }
      }

      if (e.key === 'Delete' && selectedLayerId && activeTool === 'move') {
        const layer = getSelectedLayer();
        if (layer && !layer.isBackground && !layer.locked) {
          deleteLayer(selectedLayerId);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (selection.active) {
        if (e.key === 'Shift' && selection.mode === 'add') {
          setSelection(prev => ({ ...prev, mode: 'add' }));
        } else if (e.key === 'Alt' && selection.mode === 'subtract') {
          setSelection(prev => ({ ...prev, mode: 'add' }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selection.active, selection.mode, selectedLayerId, activeTool]);

  // --- PREVIEW UPDATE ---
  useEffect(() => {
    if (!showSelectionPreview || !selection.mask || !selection.bounds) return;

    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    const { minX, minY, maxX, maxY } = selection.bounds;
    const width = maxX - minX;
    const height = maxY - minY;

    const previewSize = 200;
    const scale = Math.min(previewSize / width, previewSize / height);

    previewCanvas.width = width * scale;
    previewCanvas.height = height * scale;

    const ctx = previewCanvas.getContext('2d');
    const sourceCanvas = sourceCanvasRef.current;
    if (!sourceCanvas) return;

    const sourceCtx = sourceCanvas.getContext('2d');

    const sourceImageData = sourceCtx.getImageData(minX, minY, width, height);
    const previewImageData = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sourceIdx = ((minY + y) * sourceCanvas.width + (minX + x));
        const maskValue = selection.mask[sourceIdx];
        const targetIdx = (y * width + x) * 4;

        previewImageData.data[targetIdx] = sourceImageData.data[targetIdx];
        previewImageData.data[targetIdx + 1] = sourceImageData.data[targetIdx + 1];
        previewImageData.data[targetIdx + 2] = sourceImageData.data[targetIdx + 2];
        previewImageData.data[targetIdx + 3] = maskValue;
      }
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(previewImageData, 0, 0);

    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(tempCanvas, 0, 0);
  }, [selection, showSelectionPreview]);

  // --- MAIN RENDER ---
  return (
    <div className={`flex flex-col h-screen w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans`}>
      <canvas ref={sourceCanvasRef} className="hidden" />
      <canvas ref={edgeMapCanvasRef} className="hidden" />

      {/* HEADER */}
      <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-cyan-600" />
          <h1 className="text-lg font-bold">AI Image Editor</h1>
          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-semibold">
            ✨ Magic Grab
          </span>
          {detectedObjects.length > 0 && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold flex items-center gap-1">
              <Target size={12} />
              {detectedObjects.length} Objects Detected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={(selection.active && selectionHistoryIndex <= 0) || (!selection.active && historyIndex <= 0)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button
            onClick={handleRedo}
            disabled={(selection.active && selectionHistoryIndex >= selectionHistory.length - 1) || (!selection.active && historyIndex >= history.length - 1)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <Redo size={20} />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-600 mx-2" />
          <button
            onClick={handleExport}
            disabled={layers.length === 0}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Export Image"
          >
            <Download size={20} />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-600 mx-2" />
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT TOOLBAR */}
        <aside className="w-20 bg-white dark:bg-slate-800 flex-shrink-0 border-r border-gray-200 dark:border-slate-700 flex flex-col items-center py-4 z-20">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex flex-col items-center justify-center h-16 w-16 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              title="Upload Image"
            >
              <Upload size={24} />
              <span className="text-xs mt-1">Upload</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
            <div className="w-full h-px bg-gray-200 dark:bg-slate-700 my-2" />
            <ToolButton icon={MousePointer} label="Move" tool="move" activeTool={activeTool} onClick={setActiveTool} />
            <ToolButton icon={Wand2} label="Magic Grab" tool="select" activeTool={activeTool} onClick={setActiveTool} color="purple" isDisabled={!uploadedImage} />
            <ToolButton icon={Zap} label="Vectorize" tool="vectorize" activeTool={activeTool} onClick={handleVectorize} color="yellow" isDisabled={!uploadedImage || isVectorizing} />

            {uploadedImage && (
              <>
                <div className="w-full h-px bg-gray-200 dark:bg-slate-700 my-2" />
                <button
                  onClick={analyzeImageForObjects}
                  disabled={isAnalyzing}
                  className="flex flex-col items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50"
                  title="Re-analyze Image"
                >
                  {isAnalyzing ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <Scan size={24} />
                  )}
                  <span className="text-xs mt-1">{isAnalyzing ? 'Analyzing' : 'Scan'}</span>
                </button>
              </>
            )}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              disabled={!uploadedImage || isDrawingPath}
              className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              disabled={!uploadedImage || isDrawingPath}
              className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">{Math.round(zoom * 100)}%</div>
          </div>
        </aside>

        {/* MAIN CANVAS AREA */}
        <main ref={containerRef} className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-slate-900 overflow-auto relative">
          {uploadedImage ? (
            <div
              className="relative shadow-lg"
              style={{
                cursor: canvasCursor(),
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out'
              }}
            >
              <canvas ref={mainCanvasRef} width={maxCanvasWidth} height={maxCanvasHeight} />
              <canvas ref={selectionCanvasRef} width={maxCanvasWidth} height={maxCanvasHeight} className="absolute top-0 left-0 pointer-events-none" />
              <canvas ref={objectHighlightCanvasRef} width={maxCanvasWidth} height={maxCanvasHeight} className="absolute top-0 left-0 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave} />
            </div>
          ) : (
            <EmptyState onClick={() => fileInputRef.current.click()} />
          )}

          {uploadedImage && (
            <ObjectDetectionPanel
              image={uploadedImageSrc}
              onObjectsDetected={handleObjectsDetected}
              showObjectHighlights={showObjectHighlights}
              setShowObjectHighlights={setShowObjectHighlights}
              onStartSelection={startSelection}
            />
          )}

          <TextDetectionPanel detectedText={detectedText} />
          <ColorPalettePanel palette={colorPalette} />

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 min-w-[300px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
                <span className="text-sm font-semibold">Analyzing Image...</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {analysisProgress}% complete
              </p>
            </div>
          )}

          {selection.active && (
            <SelectionToolbar
              processing={processing}
              mode={selection.mode}
              setMode={(mode) => setSelection(prev => ({ ...prev, mode }))}
              refinementMode={refinementMode}
              setRefinementMode={setRefinementMode}
              brushSettings={brushSettings}
              setBrushSettings={setBrushSettings}
              magicGrabSettings={magicGrabSettings}
              setMagicGrabSettings={setMagicGrabSettings}
              onConfirm={extractFromSelection}
              onCancel={cancelSelection}
              showPreview={showSelectionPreview}
              setShowPreview={setShowSelectionPreview}
              detectedObjectsCount={detectedObjects.length}
              showObjectHighlights={showObjectHighlights}
              setShowObjectHighlights={setShowObjectHighlights}
            />
          )}

          {showSelectionPreview && selection.active && selection.bounds && (
            <div className="absolute top-4 right-4 bg-slate-800 rounded-lg shadow-xl p-2">
              <div className="text-xs text-gray-400 mb-1">Preview</div>
              <canvas ref={previewCanvasRef} className="rounded" />
            </div>
          )}

          {processing.active && <ProcessingOverlay status={processing.status} />}
        </main>
        {/* RIGHT SIDEBAR - LAYERS PANEL */}
        <aside className={`flex-shrink-0 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 transition-all duration-300 z-20 ${isSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-semibold">Layers</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({layers.length})</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {layers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No layers yet</p>
                  <p className="text-xs mt-1">Upload an image to start</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {layers.map((layer, index) => (
                    <LayerItem
                      key={layer.id}
                      layer={layer}
                      isSelected={selectedLayerId === layer.id}
                      onSelect={() => setSelectedLayerId(layer.id)}
                      onToggleVisibility={() => updateLayer(layer.id, { visible: !layer.visible })}
                      onToggleLock={() => updateLayer(layer.id, { locked: !layer.locked })}
                      onDelete={() => deleteLayer(layer.id)}
                      onDuplicate={() => duplicateLayer(layer.id)}
                      onMoveUp={() => moveLayer(layer.id, 'up')}
                      onMoveDown={() => moveLayer(layer.id, 'down')}
                      onOpacityChange={(opacity) => updateLayer(layer.id, { opacity })}
                      onRemoveBackground={() => handleRemoveBackground(layer.id)}
                      canMoveUp={index > 0}
                      canMoveDown={index < layers.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>

            {selectedLayerId && (
              <div className="border-t border-gray-200 dark:border-slate-700 p-4">
                <LayerProperties
                  layer={layers.find(l => l.id === selectedLayerId)}
                  onUpdate={(updates) => updateLayer(selectedLayerId, updates)}
                />
              </div>
            )}
          </div>
        </aside>

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed right-4 top-1/2 -translate-y-1/2 bg-cyan-600 text-white p-2 rounded-l-lg shadow-lg hover:bg-cyan-700 transition-colors z-30"
          >
            <ChevronsLeft size={20} />
          </button>
        )}
      </div>
      {vectorizedSvg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-3xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Vectorized SVG</h3>
              <button onClick={() => setVectorizedSvg(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="bg-gray-100 dark:bg-slate-900 p-4 rounded-lg overflow-auto max-h-[60vh]">
              <pre className="text-sm whitespace-pre-wrap">
                <code>
                  {vectorizedSvg}
                </code>
              </pre>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => navigator.clipboard.writeText(vectorizedSvg)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Copy SVG
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([vectorizedSvg], { type: 'image/svg+xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'vectorized-image.svg';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Download SVG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Continue with sub-components (I'll provide them in a follow-up due to length)...
// --- SUB-COMPONENTS ---

const ToolButton = ({ icon: Icon, label, tool, activeTool, onClick, color, isDisabled }) => {
  const isActive = activeTool === tool;
  const colorClass = color === 'purple' ? 'text-purple-500' : '';
  const activeBg = 'bg-cyan-100 dark:bg-cyan-900/50';
  return (
    <button
      onClick={() => !isDisabled && onClick(tool)}
      disabled={isDisabled}
      className={`flex flex-col items-center justify-center h-16 w-16 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? activeBg : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
      title={label}
    >
      <Icon size={24} className={colorClass} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const SelectionToolbar = ({

  processing,

  mode, setMode,

  refinementMode,

  setRefinementMode,

  brushSettings,

  setBrushSettings,

  magicGrabSettings,

  setMagicGrabSettings,

  onConfirm,

  onCancel,

  showPreview,

  setShowPreview,

  detectedObjectsCount,

  showObjectHighlights,

  setShowObjectHighlights

}) => {
  const [showBrushSettings, setShowBrushSettings] = useState(false);
  const [showMagicSettings, setShowMagicSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white rounded-lg shadow-2xl p-3 z-30 max-w-[95vw]">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Mode Selection */}
        {refinementMode !== 'eraser' && refinementMode !== 'magic' && (
          <>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-400 mb-1">Mode</span>
              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setMode('add')}
                  className={`p-2 rounded transition-colors relative ${mode === 'add' ? 'bg-green-600' : 'hover:bg-slate-600'}`}
                  title="Add to selection (Hold Shift)"
                >
                  <Plus size={18} />
                  {mode === 'add' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </button>
                <button
                  onClick={() => setMode('subtract')}
                  className={`p-2 rounded transition-colors relative ${mode === 'subtract' ? 'bg-red-600' : 'hover:bg-slate-600'}`}
                  title="Subtract from selection (Hold Alt)"
                >
                  <Minus size={18} />
                  {mode === 'subtract' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            </div>
            <div className="w-px h-12 bg-slate-600" />
          </>
        )}

        {/* Tool Selection */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 mb-1">Selection Tools</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRefinementMode('magic')}
              className={`p-2 rounded transition-colors relative ${refinementMode === 'magic' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'hover:bg-slate-700'}`}
              title="Magic Grab - Click on object (0)"
            >
              <Wand2 size={18} />
              {refinementMode === 'magic' && (
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-purple-700 px-1 rounded">0</span>
              )}
              {detectedObjectsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[8px] flex items-center justify-center">
                  {detectedObjectsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setRefinementMode('brush')}
              className={`p-2 rounded transition-colors relative ${refinementMode === 'brush' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
              title="Selection Brush (1)"
            >
              <Brush size={18} />
              {refinementMode === 'brush' && (
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-cyan-700 px-1 rounded">1</span>
              )}
            </button>

            <button
              onClick={() => setRefinementMode('eraser')}
              className={`p-2 rounded transition-colors relative ${refinementMode === 'eraser' ? 'bg-orange-600' : 'hover:bg-slate-700'}`}
              title="Repel Eraser (2)"
            >
              <Eraser size={18} />
              {refinementMode === 'eraser' && (
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-orange-700 px-1 rounded">2</span>
              )}
            </button>

            <button
              onClick={() => setRefinementMode('lasso')}
              className={`p-2 rounded transition-colors relative ${refinementMode === 'lasso' ? 'bg-purple-600' : 'hover:bg-slate-700'}`}
              title="Lasso Tool (3)"
            >
              <PenTool size={18} />
              {refinementMode === 'lasso' && (
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-purple-700 px-1 rounded">3</span>
              )}
            </button>

            <button
              onClick={() => setRefinementMode('rectangle')}
              className={`p-2 rounded transition-colors relative ${refinementMode === 'rectangle' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              title="Rectangle (4)"
            >
              <Square size={18} />
              {refinementMode === 'rectangle' && (
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-blue-700 px-1 rounded">4</span>
              )}
            </button>

            <button
              onClick={() => setRefinementMode('ellipse')}
              className={`p-2 rounded transition-colors relative ${refinementMode === 'ellipse' ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
              title="Ellipse (5)"
            >
              <Circle size={18} />
              {refinementMode === 'ellipse' && (
                <span className="absolute -bottom-1 -right-1 text-[8px] bg-indigo-700 px-1 rounded">5</span>
              )}
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="w-px h-12 bg-slate-600" />
        {refinementMode === 'magic' ? (
          <>
            <button
              onClick={() => setShowMagicSettings(!showMagicSettings)}
              className={`p-2 rounded transition-colors ${showMagicSettings ? 'bg-slate-600' : 'hover:bg-slate-700'}`}
              title="Magic Grab settings"
            >
              <Sliders size={18} />
            </button>
            <button
              onClick={() => setShowObjectHighlights(!showObjectHighlights)}
              className={`p-2 rounded transition-colors ${showObjectHighlights ? 'bg-purple-600' : 'hover:bg-slate-700'}`}
              title="Toggle object highlights (H)"
            >
              <Target size={18} />
            </button>
          </>
        ) : (refinementMode === 'brush' || refinementMode === 'eraser') && (
          <button
            onClick={() => setShowBrushSettings(!showBrushSettings)}
            className={`p-2 rounded transition-colors ${showBrushSettings ? 'bg-slate-600' : 'hover:bg-slate-700'}`}
            title="Brush settings"
          >
            <Sliders size={18} />
          </button>
        )}

        {/* Additional Controls */}
        <div className="w-px h-12 bg-slate-600" />
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`p-2 rounded transition-colors ${showPreview ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
          title="Toggle preview"
        >
          <Eye size={18} />
        </button>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 rounded hover:bg-slate-700 transition-colors"
          title="Help"
        >
          <Info size={18} />
        </button>

        {/* Action Buttons */}
        <div className="w-px h-12 bg-slate-600" />
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            title="Cancel Selection (Esc)"
            className="px-3 py-2 rounded-md hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
          >
            <X size={18} />
            <span className="text-sm">Cancel</span>
          </button>
          <button
            onClick={onConfirm}
            title="Extract Selected Object"
            className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors flex items-center gap-1"
          >
            <Check size={18} />
            <span className="text-sm">Extract</span>
          </button>
        </div>
      </div>

      {/* Status Label */}
      {/* Status Label - Update this part */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1 rounded text-xs whitespace-nowrap flex items-center gap-2">
        {refinementMode === 'magic' ? (
          <>
            {processing.active && processing.status.includes('AI') && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            <span className="text-purple-400">
              ✨ Magic Grab - {processing.active && processing.status.includes('AI')
                ? 'AI is working...'
                : detectedObjectsCount > 0
                  ? `Click on any of ${detectedObjectsCount} detected objects`
                  : 'Click on any object'}
            </span>
          </>
        ) :
          refinementMode === 'eraser' ?
            <span className="text-orange-400">🔄 Repelling Selection</span> :
            refinementMode === 'rectangle' ?
              <span className="text-blue-400">▭ Rectangle Selection</span> :
              refinementMode === 'ellipse' ?
                <span className="text-indigo-400">⭕ Ellipse Selection</span> :
                refinementMode === 'lasso' ?
                  <span className="text-purple-400">✏️ Lasso Selection</span> :
                  mode === 'add' ?
                    <span className="text-green-400">➕ Adding to Selection</span> :
                    <span className="text-red-400">➖ Removing from Selection</span>
        }
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="absolute bottom-full mb-2 right-0 bg-slate-800 rounded-lg p-4 shadow-xl w-96">
          <h4 className="text-sm font-semibold mb-2 text-gray-300 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            AI Object Detection Guide
          </h4>
          <div className="text-xs space-y-2 text-gray-400">
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-3 rounded border border-purple-500/30">
              <div className="text-purple-300 font-semibold mb-1 flex items-center gap-1">
                <Scan size={14} /> Auto Object Detection
              </div>
              <p className="text-gray-300">The AI automatically analyzes your image and highlights all extractable objects with colored bounding boxes!</p>
            </div>

            <div className="text-gray-300 font-semibold mt-3 mb-1">✨ How it works:</div>
            <ol className="list-decimal list-inside space-y-1 text-gray-400">
              <li>Upload an image - AI scans automatically</li>
              <li>See highlighted objects with bounding boxes</li>
              <li>Click Magic Grab tool (or press <kbd className="bg-slate-700 px-1 rounded">0</kbd>)</li>
              <li>Click directly on any highlighted object</li>
              <li>AI instantly selects the entire object</li>
              <li>Refine with brush if needed</li>
              <li>Click "Extract" to create a new layer</li>
            </ol>

            <div className="text-gray-300 font-semibold mt-3 mb-1">⌨️ Shortcuts:</div>
            <div className="grid grid-cols-2 gap-1">
              <div><kbd className="bg-slate-700 px-1 rounded">0</kbd> Magic Grab</div>
              <div><kbd className="bg-slate-700 px-1 rounded">H</kbd> Toggle highlights</div>
              <div><kbd className="bg-slate-700 px-1 rounded">1</kbd> Brush</div>
              <div><kbd className="bg-slate-700 px-1 rounded">2</kbd> Eraser</div>
              <div><kbd className="bg-slate-700 px-1 rounded">Shift</kbd> Add mode</div>
              <div><kbd className="bg-slate-700 px-1 rounded">Alt</kbd> Subtract</div>
            </div>

            <hr className="border-slate-700 my-2" />
            <div className="text-cyan-400 bg-cyan-900/20 p-2 rounded flex items-start gap-2">
              <Target size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <strong>Pro Tip:</strong> Hover over detected objects to see them pulse. Click the Scan button to re-analyze!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Magic Grab Settings Panel */}
      {showMagicSettings && refinementMode === 'magic' && (
        <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-lg p-4 shadow-xl min-w-[340px]">
          <h4 className="text-sm font-semibold mb-3 text-gray-300 flex items-center gap-2">
            <Wand2 size={16} className="text-purple-400" />
            Magic Grab Settings
          </h4>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>🎨 Color Tolerance</span>
                <span className="text-purple-400 font-semibold">{magicGrabSettings.tolerance}</span>
              </label>
              <input
                type="range"
                min="8"
                max="80"
                value={magicGrabSettings.tolerance}
                onChange={(e) => setMagicGrabSettings(prev => ({ ...prev, tolerance: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Lower = exact colors | Higher = similar colors
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>📍 Edge Detection</span>
                <span className="text-purple-400 font-semibold">{magicGrabSettings.edgeDetection}</span>
              </label>
              <input
                type="range"
                min="40"
                max="95"
                value={magicGrabSettings.edgeDetection}
                onChange={(e) => setMagicGrabSettings(prev => ({ ...prev, edgeDetection: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Higher = respects edges more
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>✨ Edge Smoothing</span>
                <span className="text-purple-400 font-semibold">{magicGrabSettings.smoothing}</span>
              </label>
              <input
                type="range"
                min="0"
                max="80"
                value={magicGrabSettings.smoothing}
                onChange={(e) => setMagicGrabSettings(prev => ({ ...prev, smoothing: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Higher = smoother edges
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>🌟 Edge Feather</span>
                <span className="text-purple-400 font-semibold">{magicGrabSettings.feather}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={magicGrabSettings.feather}
                onChange={(e) => setMagicGrabSettings(prev => ({ ...prev, feather: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Blur for natural-looking edges
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <div className="text-xs text-purple-300 bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                <div className="font-semibold mb-1 flex items-center gap-1">
                  <Target size={12} />
                  {detectedObjectsCount > 0 ? `${detectedObjectsCount} objects detected` : 'No objects detected'}
                </div>
                <p className="text-gray-300">
                  {detectedObjectsCount > 0
                    ? 'Click on any highlighted object to select it instantly!'
                    : 'Upload a different image or try re-scanning'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brush Settings Panel */}
      {showBrushSettings && (refinementMode === 'brush' || refinementMode === 'eraser') && (
        <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-lg p-4 shadow-xl min-w-[280px]">
          <h4 className="text-sm font-semibold mb-3 text-gray-300">
            {refinementMode === 'eraser' ? '🔄 Repel Eraser Settings' : '🖌️ Brush Settings'}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>{refinementMode === 'eraser' ? 'Repel Range' : 'Size'}</span>
                <span className="text-cyan-400">{brushSettings.size}px</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={brushSettings.size}
                onChange={(e) => setBrushSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>{refinementMode === 'eraser' ? 'Edge Snap' : 'Hardness'}</span>
                <span className="text-cyan-400">{brushSettings.hardness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={brushSettings.hardness}
                onChange={(e) => setBrushSettings(prev => ({ ...prev, hardness: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>{refinementMode === 'eraser' ? 'Repel Strength' : 'Opacity'}</span>
                <span className="text-cyan-400">{brushSettings.opacity}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={brushSettings.opacity}
                onChange={(e) => setBrushSettings(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            {refinementMode === 'eraser' && (
              <div className="text-xs text-orange-400 mt-2 bg-orange-900/20 p-2 rounded">
                💡 Higher hardness = stronger edge snapping
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LayerItem = ({
  layer,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onOpacityChange,
  onRemoveBackground,
  canMoveUp,
  canMoveDown
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group relative p-2 rounded-lg transition-all cursor-pointer ${isSelected
          ? 'bg-cyan-100 dark:bg-cyan-900/30 ring-2 ring-cyan-500'
          : 'hover:bg-gray-100 dark:hover:bg-slate-700'
        }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0">
          {layer.src && (
            <img
              src={layer.src}
              alt={layer.name}
              className="w-full h-full object-contain"
              style={{ opacity: layer.visible ? layer.opacity / 100 : 0.3 }}
            />
          )}
          {layer.isBackground && (
            <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-[8px] text-center">
              BG
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium truncate">{layer.name}</p>
            {layer.locked && <Lock size={12} className="text-gray-500" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{Math.round(layer.width)}×{Math.round(layer.height)}</span>
            {layer.opacity < 100 && <span>{layer.opacity}%</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
          >
            {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
          >
            {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
            >
              <Settings size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveBackground(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Wand2 size={14} /> Remove BG
                </button>                {canMoveUp && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); setShowMenu(false); }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <ChevronUp size={14} /> Move Up
                  </button>
                )}
                {canMoveDown && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); setShowMenu(false); }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <ChevronDown size={14} /> Move Down
                  </button>
                )}
                {!layer.isBackground && (
                  <>
                    <div className="h-px bg-gray-200 dark:bg-slate-700 my-1" />
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LayerProperties = ({ layer, onUpdate }) => {
  if (!layer) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Settings size={16} />
        Layer Properties
      </h4>

      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 flex justify-between mb-1">
          <span>Opacity</span>
          <span>{layer.opacity}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={layer.opacity}
          onChange={(e) => onUpdate({ opacity: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">X Position</label>
          <input
            type="number"
            value={Math.round(layer.x)}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Y Position</label>
          <input
            type="number"
            value={Math.round(layer.y)}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Width</label>
          <input
            type="number"
            value={Math.round(layer.width)}
            onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 1 })}
            className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400">Height</label>
          <input
            type="number"
            value={Math.round(layer.height)}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 1 })}
            className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600 dark:text-gray-400 flex justify-between mb-1">
          <span>Rotation</span>
          <span>{layer.rotation}°</span>
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={layer.rotation}
          onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
};

const EmptyState = ({ onClick }) => (
  <div onClick={onClick} className="w-full max-w-2xl text-center p-8 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
    <Upload className="h-16 w-16 text-gray-400 dark:text-slate-500 mb-4 mx-auto" />
    <h2 className="text-xl font-bold mb-2">Upload Your Image</h2>
    <div className="flex items-center justify-center gap-2 mb-2">
      <Wand2 className="text-purple-500" size={20} />
      <p className="text-gray-500 dark:text-gray-400">
        AI will <span className="font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">automatically detect</span> all extractable objects!
      </p>
    </div>
    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
      Objects will be highlighted with colored bounding boxes ✨
    </p>
    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Scan size={14} />
        Auto-scan
      </span>
      <span className="flex items-center gap-1">
        <Target size={14} />
        Smart detection
      </span>
      <span className="flex items-center gap-1">
        <Crosshair size={14} />
        One-click select
      </span>
    </div>
  </div>
);

const ProcessingOverlay = ({ status }) => (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm pointer-events-none">
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl pointer-events-auto">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-cyan-600"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-600 animate-pulse" size={16} />
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-medium">{status}</p>
          {status.includes('AI') && (
            <p className="text-xs text-gray-500 mt-1">Powered by Segment Anything Model</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// --- GLOBAL STYLES ---
if (typeof document !== 'undefined') {
  const globalStyles = `
    .slider::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }
    
    .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }
    
    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
    
    .slider::-moz-range-thumb:hover {
      transform: scale(1.2);
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}
