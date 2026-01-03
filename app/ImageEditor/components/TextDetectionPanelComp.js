'use client';

import React, { useState } from 'react';
import { Type, Eye, EyeOff, Loader, CheckCircle, AlertCircle, Copy, Download, Sparkles } from 'lucide-react';

const TextDetectionPanel = ({
  image,
  detectedText,
  onTextDetected,
  showTextHighlights,
  setShowTextHighlights,
  isAnalyzing,
  onStartAnalysis
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [fullText, setFullText] = useState('');

  const runTextDetection = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      setStatus('Initializing OCR engine...');
      setProgress(10);

      // Import OCR engine
      const { detectText } = await import('../utils/ocrEngine');

      // Run OCR
      const result = await detectText(image, (p, msg) => {
        setProgress(p);
        setStatus(msg);
      });

      if (result.success) {
        onTextDetected(result.textRegions);
        setFullText(result.fullText);
        setProgress(100);
        setStatus(`Found ${result.textRegions.length} text regions (${Math.round(result.confidence * 100)}% confidence)`);
        
        setTimeout(() => {
          setStatus('');
        }, 3000);
      } else {
        throw new Error(result.error || 'Text detection failed');
      }
    } catch (error) {
      console.error('Error running text detection:', error);
      setError(error.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (fullText) {
      navigator.clipboard.writeText(fullText);
    }
  };

  if (!detectedText || detectedText.length === 0) {
    return (
      <div className="absolute top-[200px] left-24 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 max-w-sm border border-blue-200 dark:border-blue-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Type className="text-white" size={16} />
            </div>
            <div>
              <span className="text-sm font-semibold">AI Text Detection</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tesseract OCR</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader className="animate-spin text-blue-500" size={16} />
              <span>{status}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300 rounded-full"
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
              onClick={runTextDetection}
              className="w-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Retry Detection
            </button>
          </div>
        ) : (
          <button
            onClick={runTextDetection}
            disabled={!image}
            className="w-full text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2.5 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            Detect Text (OCR)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="absolute top-[200px] left-24 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 max-w-sm border border-blue-200 dark:border-blue-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Type className="text-white" size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold">Detected Text</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">{detectedText.length} regions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTextHighlights(!showTextHighlights)}
            className={`p-2 rounded-lg transition-colors ${
              showTextHighlights 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' 
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle Highlights"
          >
            {showTextHighlights ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={16} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {detectedText.length} text region{detectedText.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={runTextDetection}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Re-analyze
          </button>
        </div>

        {status && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            {status}
          </p>
        )}

        <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          {detectedText.map((textObj) => (
            <div 
              key={textObj.id}
              className="text-xs text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
            >
              <span className="font-mono">{textObj.text}</span>
              <span className="text-gray-400 ml-2">({Math.round(textObj.confidence * 100)}%)</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="flex-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
          >
            <Copy size={12} />
            Copy All
          </button>
          <button
            onClick={runTextDetection}
            className="flex-1 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-md hover:from-blue-600 hover:to-cyan-600 transition-colors flex items-center justify-center gap-1"
          >
            <Sparkles size={12} />
            Re-scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextDetectionPanel;
