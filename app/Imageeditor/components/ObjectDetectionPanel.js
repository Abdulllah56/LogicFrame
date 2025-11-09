'use client';

import React from 'react';
import { Target, Eye, Wand2 } from 'lucide-react';

const ObjectDetectionPanel = ({
  detectedObjects,
  showObjectHighlights,
  setShowObjectHighlights,
  onStartSelection
}) => {
  return (
    <div className="absolute top-24 left-24 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-3 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="text-purple-500" size={16} />
          <span className="text-sm font-semibold">Detected Objects</span>
        </div>
        <button
          onClick={() => setShowObjectHighlights(!showObjectHighlights)}
          className={`p-1 rounded ${showObjectHighlights ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'text-gray-400'}`}
          title="Toggle Highlights"
        >
          <Eye size={14} />
        </button>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        {detectedObjects.length} extractable object{detectedObjects.length !== 1 ? 's' : ''} found
      </p>
      <button
        onClick={onStartSelection}
        className="w-full text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-md hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-1"
      >
        <Wand2 size={12} />
        Click to start selecting
      </button>
    </div>
  );
};

export default ObjectDetectionPanel;