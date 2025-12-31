'use client';

import React, { useState, useEffect } from 'react';
import { Target, Eye, Wand2, Loader, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const ObjectDetectionPanel = ({
  image,
  onObjectsDetected,
  showObjectHighlights,
  setShowObjectHighlights,
  onStartSelection
}) => {
  const [loading, setLoading] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  const runAutoSegmentation = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      setStatus('Initializing SAM model...');
      setProgress(10);

      const response = await fetch('/api/auto-segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });

      setProgress(50);
      setStatus('Processing image...');

      const data = await response.json();

      setProgress(90);
      setStatus('Finalizing...');

      if (data.success) {
        setDetectedObjects(data.masks);
        onObjectsDetected(data.masks);
        setProgress(100);
        setStatus(`Found ${data.count} objects using ${data.engine}`);
        
        setTimeout(() => {
          setStatus('');
        }, 3000);
      } else {
        throw new Error(data.error || 'Object detection failed');
      }
    } catch (error) {
      console.error('Error running auto-segmentation:', error);
      setError(error.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (image) {
      runAutoSegmentation();
    }
  }, [image]);

  return (
    <div className="absolute top-24 left-24 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 max-w-sm border border-purple-200 dark:border-purple-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Target className="text-white" size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold">AI Object Detection</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">SAM Engine</p>
          </div>
        </div>
        <button
          onClick={() => setShowObjectHighlights(!showObjectHighlights)}
          className={`p-2 rounded-lg transition-colors ${
            showObjectHighlights 
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' 
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Toggle Highlights"
        >
          <Eye size={16} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Loader className="animate-spin text-purple-500" size={16} />
            <span>{status}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : error ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            <span>Error: {error}</span>
          </div>
          <button
            onClick={runAutoSegmentation}
            className="w-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Retry Detection
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {detectedObjects.length} object{detectedObjects.length !== 1 ? 's' : ''} detected
              </span>
            </div>
            <button
              onClick={runAutoSegmentation}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Re-analyze
            </button>
          </div>

          {status && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {status}
            </p>
          )}

          <button
            onClick={onStartSelection}
            className="w-full text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
          >
            <Sparkles size={16} />
            Magic Grab Tool
          </button>
        </div>
      )}
    </div>
  );
};

export default ObjectDetectionPanel;