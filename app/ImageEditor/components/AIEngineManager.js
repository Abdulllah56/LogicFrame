'use client';

import { useState, useCallback } from 'react';

/**
 * AI Engine Manager
 * Coordinates all AI-powered features for the image editor
 * Step 1: Object Detection & Segmentation (SAM)
 * Step 2: Text Detection & OCR (Coming next)
 * Step 3: Background Removal (Coming next)
 * Step 4: Smart Grouping (Coming next)
 * Step 5: Depth/Layer Ordering (Coming next)
 */

export const useAIEngine = () => {
  const [engineStatus, setEngineStatus] = useState({
    objectDetection: 'ready', // ready, processing, complete, error
    textDetection: 'pending',
    backgroundRemoval: 'pending',
    smartGrouping: 'pending',
    depthOrdering: 'pending'
  });

  const [engineResults, setEngineResults] = useState({
    objects: [],
    textRegions: [],
    background: null,
    groups: [],
    layerOrder: []
  });

  const [progress, setProgress] = useState(0);

  /**
   * Step 1: Object Detection & Segmentation using SAM
   */
  const detectAndSegmentObjects = useCallback(async (imageDataUrl, onProgress) => {
    try {
      setEngineStatus(prev => ({ ...prev, objectDetection: 'processing' }));
      setProgress(0);

      if (onProgress) onProgress(10, 'Initializing SAM model...');

      const response = await fetch('/api/auto-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl })
      });

      if (onProgress) onProgress(50, 'Processing image...');

      const data = await response.json();

      if (onProgress) onProgress(90, 'Finalizing segmentation...');

      if (data.success) {
        setEngineResults(prev => ({ ...prev, objects: data.masks }));
        setEngineStatus(prev => ({ ...prev, objectDetection: 'complete' }));
        setProgress(100);

        if (onProgress) onProgress(100, `Found ${data.count} objects`);

        return {
          success: true,
          objects: data.masks,
          count: data.count
        };
      } else {
        throw new Error(data.error || 'Object detection failed');
      }
    } catch (error) {
      console.error('Object detection error:', error);
      setEngineStatus(prev => ({ ...prev, objectDetection: 'error' }));
      
      if (onProgress) onProgress(0, `Error: ${error.message}`);

      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  /**
   * Step 2: Text Detection & OCR (Using Tesseract.js)
   */
  const detectText = useCallback(async (imageDataUrl, onProgress) => {
    try {
      setEngineStatus(prev => ({ ...prev, textDetection: 'processing' }));
      
      if (onProgress) onProgress(10, 'Initializing OCR engine...');

      // Import OCR engine dynamically
      const { detectText: runOCR } = await import('../utils/ocrEngine');

      // Run OCR
      const result = await runOCR(imageDataUrl, onProgress);

      if (result.success) {
        setEngineResults(prev => ({ ...prev, textRegions: result.textRegions }));
        setEngineStatus(prev => ({ ...prev, textDetection: 'complete' }));
        
        if (onProgress) onProgress(100, `Found ${result.textRegions.length} text regions`);

        return {
          success: true,
          textRegions: result.textRegions,
          lines: result.lines,
          fullText: result.fullText,
          confidence: result.confidence
        };
      }

      throw new Error(result.error || 'Text detection failed');
    } catch (error) {
      console.error('Text detection error:', error);
      setEngineStatus(prev => ({ ...prev, textDetection: 'error' }));
      
      if (onProgress) onProgress(0, `Error: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  /**
   * Step 3: Background Removal (Using RMBG)
   */
  const removeBackground = useCallback(async (imageDataUrl, onProgress, options = {}) => {
    try {
      setEngineStatus(prev => ({ ...prev, backgroundRemoval: 'processing' }));
      
      if (onProgress) onProgress(10, 'Initializing background removal...');

      const response = await fetch('/api/background-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageDataUrl,
          edgeRefinement: options.edgeRefinement ?? true,
          feather: options.feather ?? 2
        })
      });

      if (onProgress) onProgress(50, 'Processing background...');

      const data = await response.json();

      if (onProgress) onProgress(90, 'Finalizing...');

      if (data.success) {
        setEngineResults(prev => ({ ...prev, background: data }));
        setEngineStatus(prev => ({ ...prev, backgroundRemoval: 'complete' }));
        
        if (onProgress) onProgress(100, `Background removed (${Math.round(data.stats.foregroundRatio * 100)}% foreground)`);

        return {
          success: true,
          mask: data.mask,
          alphaMask: data.alphaMask,
          bounds: data.bounds,
          stats: data.stats,
          resultImage: data.resultImage
        };
      }

      throw new Error(data.error || 'Background removal failed');
    } catch (error) {
      console.error('Background removal error:', error);
      setEngineStatus(prev => ({ ...prev, backgroundRemoval: 'error' }));
      
      if (onProgress) onProgress(0, `Error: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  /**
   * Step 4: Smart Grouping
   */
  const groupRelatedElements = useCallback(async (objects, textRegions, onProgress) => {
    try {
      setEngineStatus(prev => ({ ...prev, smartGrouping: 'processing' }));
      
      if (onProgress) onProgress(10, 'Analyzing spatial relationships...');

      // Import grouping utilities
      const { performSmartGrouping } = await import('../utils/smartGrouping');

      if (onProgress) onProgress(30, 'Detecting UI components...');

      // Perform smart grouping
      const groups = performSmartGrouping(objects, textRegions);

      if (onProgress) onProgress(70, 'Grouping similar elements...');

      // Categorize groups
      const categorized = {
        textBlocks: groups.filter(g => g.type === 'text_block'),
        buttons: groups.filter(g => g.type === 'button'),
        cards: groups.filter(g => g.type === 'card'),
        iconSets: groups.filter(g => g.type === 'icon_set'),
        proximityGroups: groups.filter(g => g.type === 'proximity'),
        similarObjects: groups.filter(g => g.type === 'similar_objects')
      };

      setEngineResults(prev => ({ ...prev, groups: groups }));
      setEngineStatus(prev => ({ ...prev, smartGrouping: 'complete' }));

      if (onProgress) onProgress(100, `Created ${groups.length} groups`);

      return {
        success: true,
        groups: groups,
        categorized: categorized,
        stats: {
          total: groups.length,
          textBlocks: categorized.textBlocks.length,
          buttons: categorized.buttons.length,
          cards: categorized.cards.length,
          iconSets: categorized.iconSets.length
        }
      };
    } catch (error) {
      console.error('Smart grouping error:', error);
      setEngineStatus(prev => ({ ...prev, smartGrouping: 'error' }));
      
      if (onProgress) onProgress(0, `Error: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  /**
   * Step 5: Depth/Layer Ordering (Placeholder)
   */
  const determineLayerOrder = useCallback((elements) => {
    setEngineStatus(prev => ({ ...prev, depthOrdering: 'processing' }));
    
    // Will implement in next step
    
    return {
      success: false,
      error: 'Not implemented yet'
    };
  }, []);

  /**
   * Run all AI engines in sequence
   */
  const runFullAnalysis = useCallback(async (imageDataUrl, onProgress) => {
    const results = {
      objects: null,
      text: null,
      background: null,
      groups: null,
      layerOrder: null
    };

    // Step 1: Object Detection
    if (onProgress) onProgress(0, 'Step 1/5: Detecting objects...');
    results.objects = await detectAndSegmentObjects(imageDataUrl, (p, msg) => {
      onProgress(p * 0.2, `Step 1/5: ${msg}`);
    });

    // Step 2: Text Detection
    if (onProgress) onProgress(20, 'Step 2/5: Detecting text...');
    results.text = await detectText(imageDataUrl, (p, msg) => {
      onProgress(20 + (p * 0.2), `Step 2/5: ${msg}`);
    });

    // Step 3: Background Removal
    if (onProgress) onProgress(40, 'Step 3/5: Removing background...');
    results.background = await removeBackground(imageDataUrl, (p, msg) => {
      onProgress(40 + (p * 0.2), `Step 3/5: ${msg}`);
    });

    // Step 4: Smart Grouping
    if (onProgress) onProgress(60, 'Step 4/5: Grouping elements...');
    if (results.objects?.success && results.text?.success) {
      results.groups = await groupRelatedElements(
        results.objects.objects,
        results.text.textRegions,
        (p, msg) => {
          onProgress(60 + (p * 0.2), `Step 4/5: ${msg}`);
        }
      );
    }

    // Step 5: Layer Ordering (when implemented)
    if (onProgress) onProgress(80, 'Step 5/5: Determining layer order...');
    // results.layerOrder = await determineLayerOrder(...);

    if (onProgress) onProgress(100, 'Analysis complete!');

    return results;
  }, [detectAndSegmentObjects]);

  return {
    // Status
    engineStatus,
    engineResults,
    progress,

    // Step 1: Object Detection & Segmentation
    detectAndSegmentObjects,

    // Step 2: Text Detection & OCR
    detectText,

    // Step 3: Background Removal
    removeBackground,

    // Step 4: Smart Grouping
    groupRelatedElements,

    // Step 5: Depth/Layer Ordering
    determineLayerOrder,

    // Run all
    runFullAnalysis
  };
};