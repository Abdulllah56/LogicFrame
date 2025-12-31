'use client';

import React, { useState } from 'react';
import { Grid3x3, Loader, CheckCircle, AlertCircle, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';

const SmartGroupingPanel = ({
  detectedObjects,
  detectedText,
  onGroupsDetected,
  isAnalyzing
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({
    textBlocks: true,
    buttons: true,
    cards: true,
    iconSets: true
  });

  const runSmartGrouping = async () => {
    if (!detectedObjects || !detectedText) {
      setError('Please run object detection and text detection first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      setStatus('Analyzing spatial relationships...');
      setProgress(10);

      // Import grouping utilities
      const { performSmartGrouping } = await import('../utils/smartGrouping');

      setProgress(30);
      setStatus('Detecting UI components...');

      // Perform smart grouping
      const detectedGroups = performSmartGrouping(detectedObjects, detectedText);

      setProgress(70);
      setStatus('Grouping similar elements...');

      // Categorize groups
      const categorized = {
        textBlocks: detectedGroups.filter(g => g.type === 'text_block'),
        buttons: detectedGroups.filter(g => g.type === 'button'),
        cards: detectedGroups.filter(g => g.type === 'card'),
        iconSets: detectedGroups.filter(g => g.type === 'icon_set'),
        proximityGroups: detectedGroups.filter(g => g.type === 'proximity'),
        similarObjects: detectedGroups.filter(g => g.type === 'similar_objects')
      };

      setGroups(categorized);
      onGroupsDetected(detectedGroups);
      setProgress(100);
      setStatus(`Created ${detectedGroups.length} groups`);
      
      setTimeout(() => {
        setStatus('');
      }, 3000);
    } catch (error) {
      console.error('Error in smart grouping:', error);
      setError(error.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      textBlocks: '📝',
      buttons: '🔘',
      cards: '🃏',
      iconSets: '🎨',
      proximityGroups: '📍',
      similarObjects: '🔄'
    };
    return icons[category] || '📦';
  };

  const getCategoryName = (category) => {
    const names = {
      textBlocks: 'Text Blocks',
      buttons: 'Buttons',
      cards: 'Cards',
      iconSets: 'Icon Sets',
      proximityGroups: 'Proximity Groups',
      similarObjects: 'Similar Objects'
    };
    return names[category] || category;
  };

  return (
    <div className="absolute top-[560px] left-24 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 max-w-sm border border-orange-200 dark:border-orange-900">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
            <Grid3x3 className="text-white" size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold">Smart Grouping</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI Clustering</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Loader className="animate-spin text-orange-500" size={16} />
            <span>{status}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300 rounded-full"
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
            onClick={runSmartGrouping}
            className="w-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Retry Grouping
          </button>
        </div>
      ) : groups ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Object.values(groups).flat().length} groups created
              </span>
            </div>
            <button
              onClick={runSmartGrouping}
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
            >
              Re-group
            </button>
          </div>

          {status && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {status}
            </p>
          )}

          <div className="max-h-64 overflow-y-auto space-y-2">
            {Object.entries(groups).map(([category, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getCategoryIcon(category)}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {getCategoryName(category)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({items.length})
                      </span>
                    </div>
                    {expandedCategories[category] ? (
                      <ChevronDown size={14} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-500" />
                    )}
                  </button>

                  {expandedCategories[category] && (
                    <div className="p-2 space-y-1 bg-white dark:bg-gray-800">
                      {items.map((group, index) => (
                        <div
                          key={group.id}
                          className="text-xs p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {group.type === 'text_block' && group.text ? (
                                group.text.substring(0, 30) + (group.text.length > 30 ? '...' : '')
                              ) : group.type === 'button' && group.label ? (
                                `Button: ${group.label}`
                              ) : (
                                `Group ${index + 1}`
                              )}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {group.elements?.length || group.count || 0} items
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={runSmartGrouping}
          disabled={!detectedObjects || !detectedText || isAnalyzing}
          className="w-full text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} />
          Group Elements
        </button>
      )}
    </div>
  );
};

export default SmartGroupingPanel;