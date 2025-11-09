'use client';

import React from 'react';
import { 
  Upload, MousePointer, Wand2, Scan, ZoomIn, ZoomOut,
  Undo, Redo, Download, Sun, Moon, Sparkles
} from 'lucide-react';

const ToolsPanel = ({ 
  activeTool,
  setActiveTool,
  uploadedImage,
  isAnalyzing,
  fileInputRef,
  onImageUpload,
  onAnalyze,
  zoom,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onExport,
  theme,
  setTheme,
  canUndo,
  canRedo,
  detectedObjectsCount
}) => {
  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0 z-20 fixed top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-cyan-600" />
          <h1 className="text-lg font-bold">AI Image Editor</h1>
          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-semibold">
            ✨ Magic Grab
          </span>
          {detectedObjectsCount > 0 && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
              {detectedObjectsCount} Objects Detected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onUndo} 
            disabled={!canUndo}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button 
            onClick={onRedo} 
            disabled={!canRedo}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <Redo size={20} />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-slate-600 mx-2" />
          <button 
            onClick={onExport} 
            disabled={!uploadedImage} 
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

      {/* Left Toolbar */}
      <aside className="w-20 bg-white dark:bg-slate-800 flex-shrink-0 border-r border-gray-200 dark:border-slate-700 flex flex-col items-center py-4 z-20 fixed left-0 top-16 bottom-0">
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex flex-col items-center justify-center h-16 w-16 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Upload Image"
          >
            <Upload size={24} />
            <span className="text-xs mt-1">Upload</span>
          </button>
          
          <div className="w-full h-px bg-gray-200 dark:bg-slate-700 my-2" />
          
          <ToolButton 
            icon={MousePointer} 
            label="Move" 
            tool="move" 
            activeTool={activeTool} 
            onClick={setActiveTool}
            disabled={!uploadedImage}
          />
          
          <ToolButton 
            icon={Wand2} 
            label="Magic" 
            tool="select" 
            activeTool={activeTool} 
            onClick={setActiveTool} 
            color="purple"
            disabled={!uploadedImage}
          />
          
          {uploadedImage && (
            <>
              <div className="w-full h-px bg-gray-200 dark:bg-slate-700 my-2" />
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="flex flex-col items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50"
                title="Re-analyze Image"
              >
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <Scan size={24} />
                )}
                <span className="text-xs mt-1">{isAnalyzing ? 'Scanning' : 'Scan'}</span>
              </button>
            </>
          )}
        </div>
        
        <div className="mt-auto flex flex-col gap-2">
          <button 
            onClick={onZoomIn} 
            disabled={!uploadedImage} 
            className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            onClick={onZoomOut} 
            disabled={!uploadedImage} 
            className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </aside>
    </>
  );
};

const ToolButton = ({ icon: Icon, label, tool, activeTool, onClick, color, disabled }) => {
  const isActive = activeTool === tool;
  const colorClass = color === 'purple' ? 'text-purple-500' : '';
  const activeBg = 'bg-cyan-100 dark:bg-cyan-900/50';
  
  return (
    <button 
      onClick={() => !disabled && onClick(tool)} 
      disabled={disabled} 
      className={`flex flex-col items-center justify-center h-16 w-16 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive ? activeBg : 'hover:bg-gray-100 dark:hover:bg-slate-700'
      }`} 
      title={label}
    >
      <Icon size={24} className={colorClass} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export default ToolsPanel;