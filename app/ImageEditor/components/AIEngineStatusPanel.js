'use client';

import React from 'react';
import { 
  Target, Type, Eraser, Grid3x3, Layers, 
  CheckCircle2, Clock, Loader, XCircle, Sparkles 
} from 'lucide-react';

const AIEngineStatusPanel = ({ engineStatus, onRunFullAnalysis, isAnalyzing }) => {
  const engines = [
    {
      id: 'objectDetection',
      name: 'Object Detection',
      description: 'SAM (Segment Anything Model)',
      icon: Target,
      status: engineStatus.objectDetection,
      color: 'purple'
    },
    {
      id: 'textDetection',
      name: 'Text Detection & OCR',
      description: 'Tesseract / PaddleOCR',
      icon: Type,
      status: engineStatus.textDetection,
      color: 'blue'
    },
    {
      id: 'backgroundRemoval',
      name: 'Background Removal',
      description: 'Smart edge detection',
      icon: Eraser,
      status: engineStatus.backgroundRemoval,
      color: 'green'
    },
    {
      id: 'smartGrouping',
      name: 'Smart Grouping',
      description: 'Related elements',
      icon: Grid3x3,
      status: engineStatus.smartGrouping,
      color: 'orange'
    },
    {
      id: 'depthOrdering',
      name: 'Layer Ordering',
      description: 'Depth analysis',
      icon: Layers,
      status: engineStatus.depthOrdering,
      color: 'pink'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="text-green-500" size={16} />;
      case 'processing':
        return <Loader className="text-blue-500 animate-spin" size={16} />;
      case 'error':
        return <XCircle className="text-red-500" size={16} />;
      case 'pending':
        return <Clock className="text-gray-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'processing':
        return 'Processing...';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Pending';
      case 'ready':
        return 'Ready';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="absolute top-24 right-6 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 w-80 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">AI Engine Status</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Layer Separation System</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {engines.map((engine) => {
          const Icon = engine.icon;
          return (
            <div
              key={engine.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-1.5 rounded-lg bg-${engine.color}-100 dark:bg-${engine.color}-900/30`}>
                  <Icon className={`text-${engine.color}-600 dark:text-${engine.color}-400`} size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {engine.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {engine.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(engine.status)}
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {getStatusText(engine.status)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onRunFullAnalysis}
        disabled={isAnalyzing}
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <>
            <Loader className="animate-spin" size={18} />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Run Full Analysis
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
        Powered by SAM, Tesseract, and advanced AI
      </p>
    </div>
  );
};

export default AIEngineStatusPanel;