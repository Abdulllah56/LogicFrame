'use client';

import React, { useState } from 'react';
import { 
  Layers, X, Eye, EyeOff, Lock, Unlock, Settings, 
  Copy, ChevronUp, ChevronDown, Trash2, ChevronsLeft
} from 'lucide-react';

const LayersPanel = ({
  layers,
  selectedLayerId,
  setSelectedLayerId,
  updateLayer,
  deleteLayer,
  duplicateLayer,
  moveLayer,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  return (
    <>
      <aside className={`fixed right-0 top-16 bottom-0 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 transition-all duration-300 z-20 ${isSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-600" />
                <h3 className="font-semibold">Layers</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">({layers.length})</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
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
                    canMoveUp={index > 0}
                    canMoveDown={index < layers.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
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
    </>
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
  canMoveUp,
  canMoveDown 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div 
      className={`group relative p-2 rounded-lg transition-all cursor-pointer ${
        isSelected 
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
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{layer.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{Math.round(layer.width)}×{Math.round(layer.height)}</span>
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
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;