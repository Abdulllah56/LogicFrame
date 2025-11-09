'use client';

import React, { useState } from 'react';
import { 
  Plus, Minus, Check, X, Brush, Eraser, PenTool, Square, Circle,
  Sliders, Eye, Info, Wand2, Target
} from 'lucide-react';

const SelectionToolbar = ({ 
  mode, 
  setMode, 
  refinementMode, 
  setRefinementMode,
  brushSettings, 
  setBrushSettings,
  magicGrabSettings, 
  setMagicGrabSettings,
  onConfirm, 
  onCancel,
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
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 mb-1">Mode</span>
          <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setMode('add')}
              className={`p-2 rounded transition-colors relative ${mode === 'add' ? 'bg-green-600' : 'hover:bg-slate-600'}`}
              title="Add to selection"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => setMode('subtract')}
              className={`p-2 rounded transition-colors relative ${mode === 'subtract' ? 'bg-red-600' : 'hover:bg-slate-600'}`}
              title="Subtract from selection"
            >
              <Minus size={18} />
            </button>
          </div>
        </div>
        
        <div className="w-px h-12 bg-slate-600" />
        
        {/* Tool Selection */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 mb-1">Selection Tools</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRefinementMode('magic')}
              className={`p-2 rounded transition-colors ${refinementMode === 'magic' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'hover:bg-slate-700'}`}
              title="Magic Grab"
            >
              <Wand2 size={18} />
            </button>
            
            <button
              onClick={() => setRefinementMode('brush')}
              className={`p-2 rounded transition-colors ${refinementMode === 'brush' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
              title="Selection Brush"
            >
              <Brush size={18} />
            </button>
            
            <button
              onClick={() => setRefinementMode('eraser')}
              className={`p-2 rounded transition-colors ${refinementMode === 'eraser' ? 'bg-orange-600' : 'hover:bg-slate-700'}`}
              title="Eraser"
            >
              <Eraser size={18} />
            </button>
            
            <button
              onClick={() => setRefinementMode('lasso')}
              className={`p-2 rounded transition-colors ${refinementMode === 'lasso' ? 'bg-purple-600' : 'hover:bg-slate-700'}`}
              title="Lasso Tool"
            >
              <PenTool size={18} />
            </button>
            
            <button
              onClick={() => setRefinementMode('rectangle')}
              className={`p-2 rounded transition-colors ${refinementMode === 'rectangle' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              title="Rectangle"
            >
              <Square size={18} />
            </button>
            
            <button
              onClick={() => setRefinementMode('ellipse')}
              className={`p-2 rounded transition-colors ${refinementMode === 'ellipse' ? 'bg-indigo-600' : 'hover:bg-slate-700'}`}
              title="Ellipse"
            >
              <Circle size={18} />
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
              title="Toggle object highlights"
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
            className="px-3 py-2 rounded-md hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
          >
            <X size={18} />
            <span className="text-sm">Cancel</span>
          </button>
          <button 
            onClick={onConfirm} 
            className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors flex items-center gap-1"
          >
            <Check size={18} />
            <span className="text-sm">Extract</span>
          </button>
        </div>
      </div>
      
      {/* Settings Panels */}
      {showBrushSettings && (refinementMode === 'brush' || refinementMode === 'eraser') && (
        <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-lg p-4 shadow-xl min-w-[280px]">
          <h4 className="text-sm font-semibold mb-3 text-gray-300">
            {refinementMode === 'eraser' ? 'Eraser Settings' : 'Brush Settings'}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 flex justify-between mb-1">
                <span>Size</span>
                <span className="text-cyan-400">{brushSettings.size}px</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={brushSettings.size}
                onChange={(e) => setBrushSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionToolbar;