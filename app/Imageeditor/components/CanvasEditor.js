'use client';

import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react';

const CanvasEditor = forwardRef(({ 
  uploadedImage,
  layers,
  selectedLayerId,
  activeTool,
  zoom,
  selection,
  detectedObjects,
  showObjectHighlights,
  hoveredObjectId,
  cursorPosition,
  isDrawingPath,
  currentPath,
  rectangleStart,
  refinementMode,
  brushSettings,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  transforming
}, ref) => {
  const mainCanvasRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const objectHighlightCanvasRef = useRef(null);

  const maxCanvasWidth = 1200;
  const maxCanvasHeight = 800;

  useImperativeHandle(ref, () => ({
    getMainCanvas: () => mainCanvasRef.current,
    getSelectionCanvas: () => selectionCanvasRef.current,
    getObjectHighlightCanvas: () => objectHighlightCanvasRef.current,
    renderCanvas: () => renderCanvas(),
    getCanvasCoordinates: (e) => getCanvasCoordinates(e)
  }));

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

  const renderCanvas = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw checkerboard background
    const gridSize = 20;
    for (let y = 0; y < canvas.height; y += gridSize) {
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.fillStyle = (x / gridSize + y / gridSize) % 2 === 0 ? '#ffffff' : '#e5e5e5';
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }
    
    // Draw layers
    layers.forEach(layer => {
      if (!layer.visible) return;
      
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = layer.opacity / 100;
        ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
        ctx.restore();
      };
      img.src = layer.src;
    });
    
    // Draw transform handles if in move mode
    if (activeTool === 'move' && selectedLayerId) {
      const selectedLayer = layers.find(l => l.id === selectedLayerId);
      if (selectedLayer && !selectedLayer.locked) {
        drawTransformHandles(ctx, selectedLayer);
      }
    }
  }, [layers, activeTool, selectedLayerId]);

  const drawTransformHandles = (ctx, layer) => {
    const handleSize = 8;
    
    ctx.save();
    ctx.strokeStyle = '#00c8ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
    ctx.setLineDash([]);
    
    // Corner handles
    const handles = [
      { x: layer.x - handleSize/2, y: layer.y - handleSize/2 },
      { x: layer.x + layer.width - handleSize/2, y: layer.y - handleSize/2 },
      { x: layer.x - handleSize/2, y: layer.y + layer.height - handleSize/2 },
      { x: layer.x + layer.width - handleSize/2, y: layer.y + layer.height - handleSize/2 },
      { x: layer.x + layer.width/2 - handleSize/2, y: layer.y - handleSize/2 },
      { x: layer.x + layer.width/2 - handleSize/2, y: layer.y + layer.height - handleSize/2 },
      { x: layer.x - handleSize/2, y: layer.y + layer.height/2 - handleSize/2 },
      { x: layer.x + layer.width - handleSize/2, y: layer.y + layer.height/2 - handleSize/2 }
    ];
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#00c8ff';
    ctx.lineWidth = 2;
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
    
    // Rotation handle
    const rotateHandleX = layer.x + layer.width/2 - handleSize/2;
    const rotateHandleY = layer.y - 30;
    ctx.beginPath();
    ctx.arc(rotateHandleX + handleSize/2, rotateHandleY + handleSize/2, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(layer.x + layer.width/2, layer.y);
    ctx.lineTo(rotateHandleX + handleSize/2, rotateHandleY + handleSize/2);
    ctx.strokeStyle = '#00c8ff';
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    
    ctx.restore();
  };

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
      const { minX, minY, maxX, maxY } = obj.bounds;
      const isHovered = obj.id === hoveredObjectId;
      
      // Main bounding box
      ctx.strokeStyle = isHovered 
        ? 'rgba(139, 92, 246, 0.9)' 
        : `hsla(${(index * 137.5) % 360}, 70%, 60%, 0.7)`;
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.setLineDash(isHovered ? [10, 5] : [8, 4]);
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      ctx.setLineDash([]);
      
      // Hover fill
      if (isHovered) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
      }
      
      // Corner handles
      const handleSize = isHovered ? 8 : 6;
      ctx.fillStyle = isHovered ? '#8b5cf6' : `hsla(${(index * 137.5) % 360}, 70%, 60%, 0.9)`;
      
      ctx.fillRect(minX - handleSize/2, minY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(maxX - handleSize/2, minY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(minX - handleSize/2, maxY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(maxX - handleSize/2, maxY - handleSize/2, handleSize, handleSize);
      
      // Label with object type
      const labelText = obj.type || `Object ${index + 1}`;
      ctx.font = isHovered ? 'bold 12px sans-serif' : '11px sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      
      // Label background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(minX, minY - 20, textWidth + 8, 18);
      
      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, minX + 4, minY - 6);
      
      // Confidence indicator
      if (obj.confidence && obj.confidence > 0.7) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.beginPath();
        ctx.arc(minX + textWidth + 16, minY - 11, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [detectedObjects, showObjectHighlights, hoveredObjectId]);

  const drawSelection = useCallback(() => {
    const canvas = selectionCanvasRef.current;
    if (!canvas || !selection.mask) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw selection mask
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
    
    // Draw marching ants border
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
    
    // Draw current drawing path
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
    
    // Draw cursor preview
    if (cursorPosition && (refinementMode === 'brush' || refinementMode === 'eraser')) {
      ctx.beginPath();
      ctx.arc(cursorPosition.x, cursorPosition.y, brushSettings.size / 2, 0, 2 * Math.PI);
      ctx.strokeStyle = refinementMode === 'eraser' ? 'rgba(255, 140, 0, 0.8)' : 'rgba(0, 200, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Inner hardness circle
      if (brushSettings.hardness > 0) {
        ctx.beginPath();
        const innerRadius = (brushSettings.size / 2) * (brushSettings.hardness / 100);
        ctx.arc(cursorPosition.x, cursorPosition.y, innerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = refinementMode === 'eraser' ? 'rgba(255, 140, 0, 0.4)' : 'rgba(0, 200, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    
    // Magic wand cursor
    if (cursorPosition && refinementMode === 'magic') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(cursorPosition.x, cursorPosition.y, 15, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Sparkles
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

  // Effects
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    drawObjectHighlights();
  }, [drawObjectHighlights]);

  useEffect(() => {
    if (selection.active) {
      drawSelection();
    }
  }, [selection, drawSelection]);

  const canvasCursor = () => {
    if (!uploadedImage) return 'default';
    
    if (activeTool === 'move') {
      if (transforming?.active) {
        if (transforming.type === 'move') return 'grabbing';
        if (transforming.type === 'rotate') return 'grabbing';
        if (transforming.handle) return transforming.handle.cursor;
      }
      return 'grab';
    }
    
    if (activeTool === 'select' && selection.active) {
      if (refinementMode === 'brush' || refinementMode === 'eraser' || refinementMode === 'magic') {
        return 'none';
      }
      return 'crosshair';
    }
    
    return 'default';
  };

  return (
    <div 
      className="relative shadow-lg" 
      style={{ 
        cursor: canvasCursor(),
        transform: `scale(${zoom})`,
        transformOrigin: 'center center',
        transition: 'transform 0.1s ease-out'
      }}
    >
      <canvas 
        ref={mainCanvasRef} 
        width={maxCanvasWidth} 
        height={maxCanvasHeight}
        className="block"
      />
      <canvas 
        ref={selectionCanvasRef} 
        width={maxCanvasWidth} 
        height={maxCanvasHeight} 
        className="absolute top-0 left-0 pointer-events-none" 
      />
      <canvas 
        ref={objectHighlightCanvasRef} 
        width={maxCanvasWidth} 
        height={maxCanvasHeight} 
        className="absolute top-0 left-0 pointer-events-none" 
      />
      <div 
        className="absolute top-0 left-0 w-full h-full" 
        onMouseDown={onMouseDown} 
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave} 
      />
    </div>
  );
});

CanvasEditor.displayName = 'CanvasEditor';

export default CanvasEditor;