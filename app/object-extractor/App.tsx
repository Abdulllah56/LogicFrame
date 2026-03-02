import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, MousePointer2, Sun, Moon, 
  Undo, Redo, Download, Trash2, Eye, EyeOff, Lock, Unlock, 
  Image as ImageIcon, Target, Crop, Check, X,
  Sliders, Sparkles, Wand2, Paintbrush, Plus, Minus,
  Magnet,
  Feather,
  Scan,
  Settings,
  BrainCircuit,
  Scissors,
  Layers as LayersIcon,
  BoxSelect,
  Eraser,
  Square,
  Circle
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Tool, Theme, Layer } from './types';

// Constants
const MAX_CANVAS_WIDTH = 800;
const MAX_CANVAS_HEIGHT = 600;

interface DetectedObject {
  label: string;
  box: [number, number, number, number]; // ymin, xmin, ymax, xmax (0-1000 scale)
}

type SelectionMode = 'color' | 'ai' | 'brush' | 'lasso' | 'rect' | 'ellipse';

// --- Helper Functions ---

const calculateColorDifference = (r1: number, g1: number, b1: number, a1: number, r2: number, g2: number, b2: number, a2: number): number => {
  if (a1 === 0 && a2 === 0) return 0;
  if ((a1 === 0) !== (a2 === 0)) return 255; 
  const rMean = (r1 + r2) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;
  const alphaDiff = Math.abs(a1 - a2) / 255;
  const colorDist = Math.sqrt((((512 + rMean) * r * r) >> 8) + 4 * g * g + (((767 - rMean) * b * b) >> 8));
  return Math.max(colorDist, alphaDiff * 255);
};

const fillHoles = (mask: Uint8Array, width: number, height: number): Uint8Array => {
    const filled = new Uint8Array(mask);
    const visited = new Uint8Array(width * height);
    const queue: [number, number][] = [];
    for (let x = 0; x < width; x++) {
        if (mask[x] === 0) queue.push([x, 0]);
        if (mask[(height - 1) * width + x] === 0) queue.push([x, height - 1]);
    }
    for (let y = 0; y < height; y++) {
        if (mask[y * width] === 0) queue.push([0, y]);
        if (mask[y * width + (width - 1)] === 0) queue.push([width - 1, y]);
    }
    while (queue.length > 0) {
        const [x, y] = queue.pop()!;
        const idx = y * width + x;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (!visited[nIdx] && mask[nIdx] === 0) queue.push([nx, ny]);
            }
        }
    }
    for (let i = 0; i < mask.length; i++) {
        if (visited[i] === 0) filled[i] = 1;
    }
    return filled;
};

const refineMaskBoundaries = (mask: Uint8Array, imgData: Uint8ClampedArray, width: number, height: number) => {
    const refined = new Uint8Array(mask);
    const iterations = 2; 
    for (let it = 0; it < iterations; it++) {
        const current = new Uint8Array(refined);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                let isBoundary = false;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (current[(y + dy) * width + (x + dx)] !== current[i]) {
                            isBoundary = true; break;
                        }
                    }
                    if (isBoundary) break;
                }
                if (isBoundary) {
                    let fgR = 0, fgG = 0, fgB = 0, fgCount = 0;
                    let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
                    const r_radius = 1;
                    for (let dy = -r_radius; dy <= r_radius; dy++) {
                        for (let dx = -r_radius; dx <= r_radius; dx++) {
                            const ni = (y + dy) * width + (x + dx);
                            const pr = imgData[ni * 4], pg = imgData[ni * 4 + 1], pb = imgData[ni * 4 + 2];
                            if (current[ni] === 1) { fgR += pr; fgG += pg; fgB += pb; fgCount++; }
                            else { bgR += pr; bgG += pg; bgB += pb; bgCount++; }
                        }
                    }
                    if (fgCount > 0 && bgCount > 0) {
                        fgR /= fgCount; fgG /= fgCount; fgB /= fgCount;
                        bgR /= bgCount; bgG /= bgCount; bgB /= bgCount;
                        const pr = imgData[i * 4], pg = imgData[i * 4 + 1], pb = imgData[i * 4 + 2];
                        const dFg = Math.sqrt((pr - fgR) ** 2 + (pg - fgG) ** 2 + (pb - fgB) ** 2);
                        const dBg = Math.sqrt((pr - bgR) ** 2 + (pg - bgG) ** 2 + (pb - bgB) ** 2);
                        refined[i] = dFg < dBg * 0.95 ? 1 : 0;
                    }
                }
            }
        }
    }
    return refined;
};

const smoothMask = (mask: Uint8Array, width: number, height: number): Uint8Array => {
    const result = new Uint8Array(mask.length);
    const radius = 1;
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    sum += mask[(y + dy) * width + (x + dx)];
                }
            }
            result[y * width + x] = sum >= 5 ? 1 : 0;
        }
    }
    return result;
};

const blurMask = (mask: Uint8Array, width: number, height: number, radius: number): Uint8Array => {
    const output = new Uint8Array(width * height);
    if (radius === 0) {
        for(let i=0; i<mask.length; i++) output[i] = mask[i] * 255;
        return output;
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0, count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        sum += mask[ny * width + nx];
                        count++;
                    }
                }
            }
            const val = sum / count;
            output[y * width + x] = Math.round(Math.min(1.0, val * 1.5) * 255);
        }
    }
    return output;
};

const useHistory = <T,>(initialState: T) => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [index, setIndex] = useState(0);
    const setState = (action: React.SetStateAction<T>, overwrite = false) => {
        const newState = typeof action === 'function' ? (action as (prevState: T) => T)(history[index]) : action;
        if (overwrite) {
            const newHistory = [...history];
            newHistory[index] = newState;
            setHistory(newHistory);
        } else {
            const newHistory = history.slice(0, index + 1);
            newHistory.push(newState);
            setHistory(newHistory);
            setIndex(newHistory.length - 1);
        }
    };
    const undo = () => index > 0 && setIndex(index - 1);
    const redo = () => index < history.length - 1 && setIndex(index + 1);
    return [history[index], setState, undo, redo, index > 0, index < history.length - 1] as const;
};

const ToolButton = ({ tool, label, icon, currentTool, setTool }: { tool: Tool, label: string, icon: React.ReactNode, currentTool: Tool, setTool: (t: Tool) => void }) => (
  <button
      onClick={() => setTool(tool)}
      className={`w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 group relative ${currentTool === tool ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
      {icon}
      <span className="text-[10px] mt-1.5 font-medium">{label}</span>
      {currentTool === tool && tool === 'select' && (
          <span className="absolute top-2 right-2 h-2 w-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
      )}
  </button>
);

// --- Main Component ---

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [layers, setLayers, undo, redo, canUndo, canRedo] = useHistory<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('move');
  const [zoom, setZoom] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [theme, setTheme] = useState<Theme>('dark');
  const [rightPanel, setRightPanel] = useState<'layers' | 'objects'>('layers');
  
  const [selectionMask, setSelectionMask] = useState<Uint8Array | null>(null); 
  const [tolerance, setTolerance] = useState(40);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('ai');
  const [feather, setFeather] = useState(2); 
  const [brushSize, setBrushSize] = useState(30);
  const [brushType, setBrushType] = useState<'add' | 'subtract'>('add');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [hoveredObjectIdx, setHoveredObjectIdx] = useState<number | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  const [lassoPath, setLassoPath] = useState<{x: number, y: number}[]>([]);
  const [shapeStart, setShapeStart] = useState<{x: number, y: number} | null>(null);
  const [shapeRect, setShapeRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  const [cropStart, setCropStart] = useState<{x: number, y: number} | null>(null);
  const [cropRect, setCropRect] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: MAX_CANVAS_WIDTH, height: MAX_CANVAS_HEIGHT });

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
      if (uploadedImage && process.env.API_KEY && !hasAnalyzed) {
          setTimeout(() => {
             analyzeImage();
             setActiveTool('select');
             setSelectionMode('ai');
          }, 500);
      }
  }, [uploadedImage, hasAnalyzed]);

  useEffect(() => {
    if (activeTool !== 'crop') { setCropRect(null); setCropStart(null); }
    if (activeTool !== 'select') { setSelectionMask(null); setLassoPath([]); setShapeRect(null); }
  }, [activeTool]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
          setHasAnalyzed(false);
          const aspectRatio = img.width / img.height;
          let newWidth = MAX_CANVAS_WIDTH;
          let newHeight = newWidth / aspectRatio;
          if (newHeight > MAX_CANVAS_HEIGHT) {
            newHeight = MAX_CANVAS_HEIGHT;
            newWidth = newHeight * aspectRatio;
          }
          setCanvasSize({ width: newWidth, height: newHeight });
          const initialLayer: Layer = {
            id: Date.now(), name: 'Background', type: 'image', src: img.src,
            x: 0, y: 0, width: newWidth, height: newHeight, rotation: 0,
            visible: true, locked: false, isExtracted: false,
            originalWidth: img.width, originalHeight: img.height,
          };
          setLayers([initialLayer]);
          setSelectedLayerId(initialLayer.id);
          setDetectedObjects([]);
          setActiveTool('move');
        };
        img.src = event.target.result as string;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const drawLayersOnContext = (ctx: CanvasRenderingContext2D, compositionLayers: Layer[]) => {
      compositionLayers.forEach(layer => {
          if (!layer.visible) return;
          ctx.save();
          ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
          ctx.rotate(layer.rotation * Math.PI / 180);
          ctx.translate(-(layer.x + layer.width / 2), -(layer.y + layer.height / 2));
          if (layer.type === 'image' && layer.src) {
              const img = new Image();
              img.src = layer.src;
              if (img.complete) ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
          }
          ctx.restore();
      });
  };
  
  const drawLayers = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawLayersOnContext(ctx, layers);

    if (activeTool === 'select') {
        if (selectionMask) {
            const mCanvas = document.createElement('canvas');
            mCanvas.width = canvas.width; mCanvas.height = canvas.height;
            const mCtx = mCanvas.getContext('2d');
            if (mCtx) {
                const imgData = mCtx.createImageData(canvas.width, canvas.height);
                for (let i = 0; i < selectionMask.length; i++) {
                    if (selectionMask[i] === 1) {
                        const idx = i * 4;
                        imgData.data[idx] = 34; imgData.data[idx+1] = 211; imgData.data[idx+2] = 238; imgData.data[idx+3] = 160;
                    }
                }
                mCtx.putImageData(imgData, 0, 0);
                ctx.drawImage(mCanvas, 0, 0);
            }
        }
        if (selectionMode === 'lasso' && lassoPath.length > 0) {
            ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lassoPath[0].x, lassoPath[0].y);
            lassoPath.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }
        if ((selectionMode === 'rect' || selectionMode === 'ellipse') && shapeRect) {
            ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            if (selectionMode === 'rect') ctx.strokeRect(shapeRect.x, shapeRect.y, shapeRect.w, shapeRect.h);
            else {
                ctx.beginPath();
                ctx.ellipse(shapeRect.x + shapeRect.w/2, shapeRect.y + shapeRect.h/2, Math.abs(shapeRect.w/2), Math.abs(shapeRect.h/2), 0, 0, 2*Math.PI);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }
        if (selectionMode === 'ai' && detectedObjects.length > 0) {
            detectedObjects.forEach((obj, idx) => {
                const isHovered = hoveredObjectIdx === idx;
                const y1 = (obj.box[0] / 1000) * canvas.height, x1 = (obj.box[1] / 1000) * canvas.width;
                const y2 = (obj.box[2] / 1000) * canvas.height, x2 = (obj.box[3] / 1000) * canvas.width;
                ctx.strokeStyle = isHovered ? '#ec4899' : '#22d3ee55';
                ctx.lineWidth = isHovered ? 2 : 1;
                ctx.setLineDash(isHovered ? [] : [5, 5]);
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            });
        }
    }
  }, [layers, selectedLayerId, activeTool, selectionMask, selectionMode, lassoPath, detectedObjects, hoveredObjectIdx, shapeRect]);

  useEffect(() => { drawLayers(); }, [drawLayers, zoom]);

  const getCanvasCoordinates = (e: React.MouseEvent | MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const analyzeImage = async () => {
      const canvas = mainCanvasRef.current;
      if (!canvas || !process.env.API_KEY) return;
      setIsProcessing(true);
      setProcessingStatus('AI Mapping Objects...');
      try {
          const base64Image = getCanvasBase64(canvas);
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-3-pro-preview',
              contents: {
                  parts: [
                      { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                      { text: `List distinct objects. Return JSON array with: label, box [ymin, xmin, ymax, xmax] (0-1000).` }
                  ]
              },
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING },
                            box: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        },
                        required: ['label', 'box']
                    }
                }
              }
          });
          const raw = JSON.parse(response.text.replace(/```json|```/g, '').trim());
          setDetectedObjects(raw);
          setHasAnalyzed(true);
          setRightPanel('objects');
      } catch (e) {
          console.error(e);
          setProcessingStatus('Mapping Failed');
      } finally { setIsProcessing(false); setProcessingStatus(''); }
  };

  const handleQuickExtract = async (idx: number) => {
    const obj = detectedObjects[idx];
    if (!obj || !mainCanvasRef.current) return;
    setIsProcessing(true);
    setProcessingStatus(`Extracting ${obj.label}...`);
    try {
        const canvas = mainCanvasRef.current;
        const data = prepareSourceCanvas();
        if (!data) throw new Error("Source data unavailable");
        let mask = await runGeminiSegmentation(0, 0, canvas, obj);
        if (mask) {
            mask = fillHoles(mask, canvas.width, canvas.height);
            mask = refineMaskBoundaries(mask, data, canvas.width, canvas.height);
            mask = smoothMask(mask, canvas.width, canvas.height);
            await finalizeExtraction(mask);
        }
        setProcessingStatus('');
    } catch (e: any) {
        console.error(e);
        setProcessingStatus(e.message || "Failed");
        setTimeout(() => setProcessingStatus(""), 2000);
    } finally { setIsProcessing(false); }
  };

  const runGeminiSegmentation = async (x: number, y: number, canvas: HTMLCanvasElement, boxContext?: DetectedObject): Promise<Uint8Array | null> => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      let regionData = "";
      let xOffset = 0, yOffset = 0;
      if (boxContext) {
          const y1 = (boxContext.box[0] / 1000) * canvas.height, x1 = (boxContext.box[1] / 1000) * canvas.width;
          const y2 = (boxContext.box[2] / 1000) * canvas.height, x2 = (boxContext.box[3] / 1000) * canvas.width;
          const pad = 40;
          xOffset = Math.max(0, x1 - pad); yOffset = Math.max(0, y1 - pad);
          const w = Math.min(canvas.width - xOffset, x2 - x1 + pad * 2);
          const h = Math.min(canvas.height - yOffset, y2 - y1 + pad * 2);
          const crop = document.createElement('canvas'); crop.width = w; crop.height = h;
          crop.getContext('2d')?.drawImage(canvas, xOffset, yOffset, w, h, 0, 0, w, h);
          regionData = getCanvasBase64(crop);
      } else {
          regionData = getCanvasBase64(canvas);
      }
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
              parts: [{ inlineData: { mimeType: 'image/jpeg', data: regionData } }, { text: `Generate a SOLID high-precision binary segmentation mask. WHITE = object, BLACK = background. Solid fill, no holes.` }]
          }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
              const img = new Image();
              img.src = `data:image/png;base64,${part.inlineData.data}`;
              await new Promise(r => img.onload = r);
              const maskCanvas = document.createElement('canvas');
              maskCanvas.width = canvas.width; maskCanvas.height = canvas.height;
              const ctx = maskCanvas.getContext('2d');
              if (!ctx) return null;
              if (boxContext) {
                  const y1 = (boxContext.box[0] / 1000) * canvas.height, x1 = (boxContext.box[1] / 1000) * canvas.width;
                  const y2 = (boxContext.box[2] / 1000) * canvas.height, x2 = (boxContext.box[3] / 1000) * canvas.width;
                  const pad = 40;
                  ctx.drawImage(img, Math.max(0, x1 - pad), Math.max(0, y1 - pad), Math.min(canvas.width - xOffset, x2 - x1 + pad * 2), Math.min(canvas.height - yOffset, y2 - y1 + pad * 2));
              } else ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
              const mask = new Uint8Array(canvas.width * canvas.height);
              for (let i = 0; i < mask.length; i++) if (data[i * 4] > 128) mask[i] = 1;
              return mask;
          }
      }
      return null;
  };

  const finalizeExtraction = async (maskOverride?: Uint8Array) => {
      const mask = maskOverride || selectionMask;
      if (!mask) return;
      const data = prepareSourceCanvas();
      if (!data) return;
      const width = canvasSize.width, height = canvasSize.height;
      const alphaMask = blurMask(mask, width, height, feather);
      let minX = width, minY = height, maxX = 0, maxY = 0, hasPixels = false;
      for (let i = 0; i < mask.length; i++) {
          if (mask[i] === 1) {
              const x = i % width, y = Math.floor(i / width);
              minX = Math.min(minX, x); maxX = Math.max(maxX, x);
              minY = Math.min(minY, y); maxY = Math.max(maxY, y);
              hasPixels = true;
          }
      }
      if (!hasPixels) return;
      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      const out = document.createElement('canvas'); out.width = bw; out.height = bh;
      const oCtx = out.getContext('2d');
      if (!oCtx) return;
      const oData = oCtx.createImageData(bw, bh);
      for (let y = 0; y < bh; y++) {
          for (let x = 0; x < bw; x++) {
              const si = (y + minY) * width + (x + minX);
              const ti = (y * bw + x) * 4;
              const alpha = alphaMask[si];
              oData.data[ti] = data[si*4]; oData.data[ti+1] = data[si*4+1]; oData.data[ti+2] = data[si*4+2];
              oData.data[ti+3] = Math.round(data[si*4+3] * (alpha / 255));
          }
      }
      oCtx.putImageData(oData, 0, 0);
      const newLayer: Layer = {
        id: Date.now(), name: `Extracted Obj`, type: 'image', src: out.toDataURL(),
        x: minX, y: minY, width: bw, height: bh, rotation: 0, visible: true,
        locked: false, isExtracted: true, originalWidth: bw, originalHeight: bh
      };
      setLayers([...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
      setSelectionMask(null);
      setActiveTool('move');
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const coords = getCanvasCoordinates(e, canvas);
      if (activeTool === 'select') {
          if (selectionMode === 'brush') { setIsDrawing(true); applyBrush(coords.x, coords.y); }
          else if (selectionMode === 'lasso') { setIsDrawing(true); setLassoPath([{x: coords.x, y: coords.y}]); }
          else if (selectionMode === 'rect' || selectionMode === 'ellipse') {
              setIsDrawing(true); setShapeStart({x: coords.x, y: coords.y}); setShapeRect({x: coords.x, y: coords.y, w: 0, h: 0});
          }
      } else if (activeTool === 'crop') {
          setCropStart(coords); setCropRect({x: coords.x, y: coords.y, width: 0, height: 0});
      }
  };

  const applyBrush = (cx: number, cy: number) => {
      const mask = selectionMask ? new Uint8Array(selectionMask) : new Uint8Array(canvasSize.width * canvasSize.height);
      const radius = brushSize / 2;
      for (let y = Math.max(0, Math.floor(cy - radius)); y < Math.min(canvasSize.height, Math.ceil(cy + radius)); y++) {
          for (let x = Math.max(0, Math.floor(cx - radius)); x < Math.min(canvasSize.width, Math.ceil(cx + radius)); x++) {
              if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) <= radius) mask[y * canvasSize.width + x] = brushType === 'add' ? 1 : 0;
          }
      }
      setSelectionMask(mask);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const coords = getCanvasCoordinates(e, canvas);
    if (activeTool === 'select') {
        if (isDrawing) {
            if (selectionMode === 'brush') applyBrush(coords.x, coords.y);
            else if (selectionMode === 'lasso') setLassoPath(prev => [...prev, {x: coords.x, y: coords.y}]);
            else if (shapeStart) setShapeRect({ x: Math.min(shapeStart.x, coords.x), y: Math.min(shapeStart.y, coords.y), w: Math.abs(shapeStart.x - coords.x), h: Math.abs(shapeStart.y - coords.y) });
        } else if (selectionMode === 'ai') {
            let found = -1;
            detectedObjects.forEach((obj, i) => {
                const y1 = (obj.box[0] / 1000) * canvas.height, x1 = (obj.box[1] / 1000) * canvas.width, y2 = (obj.box[2] / 1000) * canvas.height, x2 = (obj.box[3] / 1000) * canvas.width;
                if (coords.x >= x1 && coords.x <= x2 && coords.y >= y1 && coords.y <= y2) found = i;
            });
            setHoveredObjectIdx(found);
        }
    } else if (activeTool === 'crop' && cropStart) setCropRect({ x: Math.min(cropStart.x, coords.x), y: Math.min(cropStart.y, coords.y), width: Math.abs(cropStart.x - coords.x), height: Math.abs(cropStart.y - coords.y) });
  };

  const handleMouseUp = () => {
      if (isDrawing) {
          if (selectionMode === 'lasso' && lassoPath.length > 2) {
              const mask = selectionMask ? new Uint8Array(selectionMask) : new Uint8Array(canvasSize.width * canvasSize.height);
              const temp = document.createElement('canvas'); temp.width = canvasSize.width; temp.height = canvasSize.height;
              const tCtx = temp.getContext('2d');
              if (tCtx) {
                  tCtx.beginPath(); tCtx.moveTo(lassoPath[0].x, lassoPath[0].y); lassoPath.forEach(p => tCtx.lineTo(p.x, p.y)); tCtx.closePath(); tCtx.fill();
                  const d = tCtx.getImageData(0,0,canvasSize.width, canvasSize.height).data;
                  for(let i=0; i<mask.length; i++) if(d[i*4+3] > 0) mask[i] = 1;
                  setSelectionMask(mask);
              }
              setLassoPath([]);
          } else if (shapeRect) {
              const mask = selectionMask ? new Uint8Array(selectionMask) : new Uint8Array(canvasSize.width * canvasSize.height);
              const temp = document.createElement('canvas'); temp.width = canvasSize.width; temp.height = canvasSize.height;
              const tCtx = temp.getContext('2d');
              if (tCtx) {
                  if (selectionMode === 'rect') tCtx.fillRect(shapeRect.x, shapeRect.y, shapeRect.w, shapeRect.h);
                  else { tCtx.beginPath(); tCtx.ellipse(shapeRect.x + shapeRect.w/2, shapeRect.y + shapeRect.h/2, Math.abs(shapeRect.w/2), Math.abs(shapeRect.h/2), 0, 0, 2*Math.PI); tCtx.fill(); }
                  const d = tCtx.getImageData(0,0,canvasSize.width, canvasSize.height).data;
                  for(let i=0; i<mask.length; i++) if(d[i*4+3] > 0) mask[i] = 1;
                  setSelectionMask(mask);
              }
              setShapeRect(null); setShapeStart(null);
          }
      }
      setIsDrawing(false); setCropStart(null);
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'select' || isProcessing || !uploadedImage) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const coords = getCanvasCoordinates(e, canvas);
    if (selectionMode === 'ai' && hoveredObjectIdx !== null) handleQuickExtract(hoveredObjectIdx);
    else if (selectionMode === 'color') {
        const data = prepareSourceCanvas(); if (!data) return;
        setIsProcessing(true);
        const startIdx = (Math.round(coords.y) * canvas.width + Math.round(coords.x)) * 4;
        const sR = data[startIdx], sG = data[startIdx+1], sB = data[startIdx+2], sA = data[startIdx+3];
        const mask = selectionMask ? new Uint8Array(selectionMask) : new Uint8Array(canvas.width * canvas.height);
        const stack: [number, number][] = [[Math.round(coords.x), Math.round(coords.y)]];
        const visited = new Uint8Array(canvas.width * canvas.height);
        while (stack.length > 0) {
            const [cx, cy] = stack.pop()!;
            const i = cy * canvas.width + cx;
            if (visited[i]) continue; visited[i] = 1;
            if (calculateColorDifference(sR, sG, sB, sA, data[i*4], data[i*4+1], data[i*4+2], data[i*4+3]) <= tolerance) {
                mask[i] = 1;
                if (cx > 0) stack.push([cx-1, cy]); if (cx < canvas.width-1) stack.push([cx+1, cy]);
                if (cy > 0) stack.push([cx, cy-1]); if (cy < canvas.height-1) stack.push([cx, cy+1]);
            }
        }
        setSelectionMask(fillHoles(smoothMask(mask, canvas.width, canvas.height), canvas.width, canvas.height));
        setIsProcessing(false);
    }
  };

  const prepareSourceCanvas = () => {
      const sourceCtx = sourceCanvasRef.current?.getContext('2d', { willReadFrequently: true });
      if (!sourceCtx) return null;
      sourceCanvasRef.current!.width = canvasSize.width;
      sourceCanvasRef.current!.height = canvasSize.height;
      drawLayersOnContext(sourceCtx, layers);
      return sourceCtx.getImageData(0, 0, canvasSize.width, canvasSize.height).data;
  };

  const getCanvasBase64 = (canvas: HTMLCanvasElement) => {
      const temp = document.createElement('canvas'); temp.width = canvas.width; temp.height = canvas.height;
      temp.getContext('2d')?.drawImage(canvas, 0, 0);
      return temp.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  const handleExport = async () => {
      if (layers.length === 0) return;
      setIsProcessing(true);
      setProcessingStatus('Exporting...');
      
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setIsProcessing(false); return; }

      const visibleLayers = layers.filter(l => l.visible);
      const imgPromises = visibleLayers.map(l => {
          return new Promise<void>((resolve) => {
              if (!l.src) return resolve();
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = l.src;
          });
      });
      
      await Promise.all(imgPromises);
      drawLayersOnContext(ctx, layers);

      const link = document.createElement('a');
      link.download = `composition-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      setIsProcessing(false);
      setProcessingStatus('');
  };

  const deleteLayer = (id: number) => setLayers(layers.filter(l => l.id !== id));
  const toggleLayerVisibility = (id: number) => setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0B1120] text-slate-100' : 'bg-gray-50 text-gray-900'} flex flex-col font-sans selection:bg-cyan-500/30`}>
      <header className="h-18 border-b border-slate-800/60 bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 py-3">
        <div className="flex items-center space-x-3">
          <div className="relative bg-slate-950 p-2 rounded-full border border-slate-800"><ImageIcon className="text-cyan-400 h-6 w-6" /></div>
          <h1 className="text-xl font-bold tracking-tight"><span className="text-slate-100">Object</span><span className="text-cyan-400">Extractor</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
             <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-20 transition-all"><Undo size={18} /></button>
             <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-20 transition-all"><Redo size={18} /></button>
          </div>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={handleExport} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 rounded-full font-bold flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95">
            <Download size={18} /><span>Export</span>
          </button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-20 border-r border-slate-800/60 bg-[#0B1120]/50 backdrop-blur-sm flex flex-col items-center py-6 space-y-6">
           <ToolButton tool="move" label="Move" icon={<MousePointer2 size={24} />} currentTool={activeTool} setTool={setActiveTool} />
           <ToolButton tool="select" label="Select" icon={<Target size={24} />} currentTool={activeTool} setTool={setActiveTool} />
           <ToolButton tool="crop" label="Crop" icon={<Crop size={24} />} currentTool={activeTool} setTool={setActiveTool} />
           <div className="w-10 h-px bg-slate-800/60 my-2"></div>
           <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center p-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-cyan-400"><Upload size={24} /><span className="text-[10px] mt-1.5 font-medium">Upload</span></button>
           <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
        <div className="flex-1 relative bg-[#0B1120] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.05),transparent_50%)] pointer-events-none"></div>
          {!uploadedImage && (
              <div className="text-center p-12 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl animate-in zoom-in duration-500">
                  <div className="bg-slate-800/50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"><ImageIcon size={40} className="text-cyan-400" /></div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Extract?</h3>
                  <p className="text-slate-400 mb-8 max-w-xs">Upload an image and let AI identify individual components instantly.</p>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-10 py-3.5 rounded-xl font-bold shadow-lg transition-all hover:scale-105">Get Started</button>
              </div>
          )}
          {uploadedImage && (
             <div className="relative shadow-2xl ring-1 ring-white/10 rounded-sm overflow-hidden" style={{ transform: `scale(${zoom/100})` }}>
                 <canvas ref={mainCanvasRef} width={canvasSize.width} height={canvasSize.height} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onClick={handleCanvasClick} className="bg-[#0f172a] cursor-crosshair transition-opacity duration-300" />
                 {processingStatus && (
                     <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl px-6 py-3 rounded-full border border-cyan-500/30 shadow-2xl flex items-center gap-3">
                         <div className="animate-spin h-3 w-3 border-2 border-cyan-500 border-t-transparent rounded-full" />
                         <span className="text-sm font-bold text-cyan-50 tracking-wide uppercase">{processingStatus}</span>
                     </div>
                 )}
                 <canvas ref={sourceCanvasRef} className="hidden" />
             </div>
          )}
          {uploadedImage && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-slate-900/80 backdrop-blur-md px-5 py-2 rounded-full border border-slate-700/50 shadow-2xl">
                <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="text-slate-400 hover:text-cyan-400 transition-colors"><Minus size={18} /></button>
                <span className="text-xs font-bold w-12 text-center text-slate-200">{zoom}%</span>
                <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="text-slate-400 hover:text-cyan-400 transition-colors"><Plus size={18} /></button>
            </div>
          )}
        </div>
        <div className="w-80 border-l border-slate-800/60 bg-[#0B1120]/90 backdrop-blur-sm flex flex-col">
            <div className="flex border-b border-slate-800/60">
                <button onClick={() => setRightPanel('layers')} className={`flex-1 p-4 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${rightPanel === 'layers' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}><LayersIcon size={14}/> Layers</button>
                <button onClick={() => setRightPanel('objects')} className={`flex-1 p-4 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${rightPanel === 'objects' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}><BoxSelect size={14}/> Settings</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
                {rightPanel === 'layers' ? (
                    <div className="space-y-3">
                        {layers.length === 0 && <p className="text-center text-slate-500 text-sm mt-10">No layers created yet</p>}
                        {layers.map(layer => (
                            <div key={layer.id} onClick={() => setSelectedLayerId(layer.id)} className={`group flex items-center p-3 rounded-xl border transition-all ${selectedLayerId === layer.id ? 'bg-cyan-500/10 border-cyan-500/40' : 'border-slate-800/50 hover:bg-slate-800/30'}`}>
                                <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden mr-3 shrink-0"><img src={layer.src} className="w-full h-full object-cover" /></div>
                                <div className="flex-1 truncate"><p className="text-sm font-bold truncate text-slate-100">{layer.name}</p><p className="text-[10px] text-slate-500 font-mono">{Math.round(layer.width)}x{Math.round(layer.height)}</p></div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }} className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors">{layer.visible ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeTool === 'select' && (
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Selection Mode</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        {id: 'ai', icon: <Sparkles size={16}/>, label: 'AI'},
                                        {id: 'lasso', icon: <Magnet size={16}/>, label: 'Lasso'},
                                        {id: 'brush', icon: <Paintbrush size={16}/>, label: 'Brush'},
                                        {id: 'color', icon: <Wand2 size={16}/>, label: 'Color'},
                                        {id: 'rect', icon: <Square size={16}/>, label: 'Rect'},
                                        {id: 'ellipse', icon: <Circle size={16}/>, label: 'Ellipse'}
                                    ].map(mode => (
                                        <button key={mode.id} onClick={() => setSelectionMode(mode.id as SelectionMode)} className={`p-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${selectionMode === mode.id ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800'}`}>{mode.icon}<span className="text-[9px] font-bold">{mode.label}</span></button>
                                    ))}
                                </div>
                                {selectionMode === 'brush' && (
                                    <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                                        <div className="flex gap-2">
                                            <button onClick={() => setBrushType('add')} className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${brushType === 'add' ? 'bg-cyan-500 border-cyan-500 text-slate-900' : 'border-slate-700 text-slate-400'}`}>Draw</button>
                                            <button onClick={() => setBrushType('subtract')} className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${brushType === 'subtract' ? 'bg-red-500 border-red-500 text-white' : 'border-slate-700 text-slate-400'}`}>Erase</button>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase"><span>Brush Size</span><span>{brushSize}px</span></div>
                                        <input type="range" min="5" max="100" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                                    </div>
                                )}
                                {selectionMode === 'color' && (
                                    <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase"><span>Tolerance</span><span>{tolerance}</span></div>
                                        <input type="range" min="1" max="100" value={tolerance} onChange={e => setTolerance(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Settings</h4>
                            <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase"><span>Feather Edges</span><span>{feather}px</span></div>
                                <input type="range" min="0" max="20" value={feather} onChange={e => setFeather(parseInt(e.target.value))} className="w-full accent-cyan-50" />
                            </div>
                        </div>
                        {selectionMode === 'ai' && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Detected Objects</h4>
                                {!hasAnalyzed ? (
                                    <button onClick={analyzeImage} className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 p-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs"><Scan size={14} /> Analyze Image</button>
                                ) : (
                                    <div className="space-y-2">
                                        {detectedObjects.map((obj, i) => (
                                            <div key={i} onMouseEnter={() => setHoveredObjectIdx(i)} onMouseLeave={() => setHoveredObjectIdx(null)} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 group hover:border-cyan-500/50 transition-all">
                                                <span className="text-xs font-bold text-slate-100">{obj.label}</span>
                                                <button onClick={() => handleQuickExtract(i)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-1.5 rounded-lg transition-all"><Scissors size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {activeTool === 'select' && selectionMask && (
                <div className="p-5 border-t border-slate-800/60 bg-slate-900/40">
                    <div className="flex gap-2">
                        <button onClick={() => finalizeExtraction()} className="flex-1 bg-cyan-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">Extract Selection</button>
                        <button onClick={() => setSelectionMask(null)} className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-colors" title="Clear"><X size={20}/></button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}