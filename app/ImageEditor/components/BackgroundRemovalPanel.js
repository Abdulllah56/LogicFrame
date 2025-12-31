'use client';

import React, { useState } from 'react';
import { Eraser, Loader, CheckCircle, AlertCircle, Sparkles, Settings, Eye, EyeOff, Download } from 'lucide-react';

const BackgroundRemovalPanel = ({
  image,
  onBackgroundRemoved,
  showBackgroundPreview,
  setShowBackgroundPreview,
  isAnalyzing
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [settings, setSettings] = useState({
    edgeRefinement: true,
    feather: 2
  });
  const [showSettings, setShowSettings] = useState(false);

  const runBackgroundRemoval = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      setStatus('Initializing background removal...');
      setProgress(10);

      const response = await fetch('/api/background-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image,
          edgeRefinement: settings.edgeRefinement,
          feather: settings.feather
        })
      });

      setProgress(50);
      setStatus('Processing background...');

      const data = await response.json();

      setProgress(90);
      setStatus('Finalizing...');

      if (data.success) {
        setResult(data);
        onBackgroundRemoved(data);
        setProgress(100);
        setStatus(`Background removed! ${Math.round(data.stats.foregroundRatio * 100)}% foreground detected`);
        
        setTimeout(() => {
          setStatus('');
        }, 3000);
      } else {
        throw new Error(data.error || 'Background removal failed');
      }
    } catch (error) {
      console.error('Error removing background:', error);
      setError(error.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (result?.resultImage) {
      const link = document.createElement('a');
      link.href = result.resultImage;
      link.download = 'background-removed.png';
      link.click();
    }
  };

  return (
    <div className="absolute top-[380px] left-24 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 max-w-sm border border-green-200 dark:border-green-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <Eraser className="text-white" size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold">Background Removal</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">RMBG Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button
              onClick={() => setShowBackgroundPreview(!showBackgroundPreview)}
              className={`p-2 rounded-lg transition-colors ${
                showBackgroundPreview 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle Preview"
            >
              {showBackgroundPreview ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Edge Refinement</span>
            <button
              onClick={() => setSettings(prev => ({ ...prev, edgeRefinement: !prev.edgeRefinement }))}
              className={`px-2 py-1 text-xs rounded ${
                settings.edgeRefinement 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {settings.edgeRefinement ? 'ON' : 'OFF'}
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Feather</span>
              <span className="text-xs text-gray-500">{settings.feather}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={settings.feather}
              onChange={(e) => setSettings(prev => ({ ...prev, feather: parseInt(e.target.value) }))}
              className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Loader className="animate-spin text-green-500" size={16} />
            <span>{status}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
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
            onClick={runBackgroundRemoval}
            className="w-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Retry Removal
          </button>
        </div>
      ) : result ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Background removed
              </span>
            </div>
            <button
              onClick={runBackgroundRemoval}
              className="text-xs text-green-600 dark:text-green-400 hover:underline"
            >
              Re-process
            </button>
          </div>

          {status && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {status}
            </p>
          )}

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Foreground:</span>
                <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(result.stats.foregroundRatio * 100)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Pixels:</span>
                <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">
                  {result.stats.foregroundPixels.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={downloadResult}
              className="flex-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
            >
              <Download size={12} />
              Download
            </button>
            <button
              onClick={runBackgroundRemoval}
              className="flex-1 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-md hover:from-green-600 hover:to-emerald-600 transition-colors flex items-center justify-center gap-1"
            >
              <Sparkles size={12} />
              Re-process
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={runBackgroundRemoval}
          disabled={!image || isAnalyzing}
          className="w-full text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2.5 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} />
          Remove Background
        </button>
      )}
    </div>
  );
};

export default BackgroundRemovalPanel;