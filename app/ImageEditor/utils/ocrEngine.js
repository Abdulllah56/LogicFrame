'use client';

/**
 * OCR Engine - Client-Side Text Detection
 * Uses Tesseract.js for optical character recognition
 * Step 2 of AI-powered layer separation engine
 */

let tesseractWorker = null;

/**
 * Initialize Tesseract worker
 */
async function initializeTesseract() {
  if (tesseractWorker) return tesseractWorker;

  // Dynamically import Tesseract.js
  const Tesseract = await import('tesseract.js');
  
  tesseractWorker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });

  return tesseractWorker;
}

/**
 * Detect and extract text from image
 * @param {string} imageDataUrl - Base64 image data URL
 * @param {function} onProgress - Progress callback (progress, status)
 * @returns {Promise<Object>} - Text regions with bounding boxes
 */
export async function detectText(imageDataUrl, onProgress) {
  try {
    if (onProgress) onProgress(10, 'Initializing OCR engine...');

    const worker = await initializeTesseract();

    if (onProgress) onProgress(30, 'Loading image...');

    // Perform OCR
    const result = await worker.recognize(imageDataUrl);

    if (onProgress) onProgress(90, 'Processing results...');

    // Extract text regions with bounding boxes
    const textRegions = result.data.words.map((word, index) => {
      const { bbox, text, confidence } = word;
      
      return {
        id: `text_${index}`,
        text: text,
        confidence: confidence / 100, // Convert to 0-1 range
        bounds: {
          minX: bbox.x0,
          minY: bbox.y0,
          maxX: bbox.x1,
          maxY: bbox.y1
        },
        box: [bbox.x0, bbox.y0, bbox.x1, bbox.y1],
        width: bbox.x1 - bbox.x0,
        height: bbox.y1 - bbox.y0,
        baseline: word.baseline,
        fontSize: bbox.y1 - bbox.y0, // Approximate font size
        type: 'text'
      };
    });

    // Filter out low confidence detections
    const filteredRegions = textRegions.filter(region => region.confidence > 0.5);

    // Group text into lines
    const lines = groupTextIntoLines(filteredRegions);

    if (onProgress) onProgress(100, `Found ${filteredRegions.length} text regions`);

    return {
      success: true,
      textRegions: filteredRegions,
      lines: lines,
      fullText: result.data.text,
      confidence: result.data.confidence / 100
    };

  } catch (error) {
    console.error('OCR Error:', error);
    if (onProgress) onProgress(0, `Error: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      textRegions: []
    };
  }
}

/**
 * Group individual words into text lines
 * @param {Array} textRegions - Individual text regions
 * @returns {Array} - Grouped text lines
 */
function groupTextIntoLines(textRegions) {
  if (textRegions.length === 0) return [];

  // Sort by Y position
  const sorted = [...textRegions].sort((a, b) => a.bounds.minY - b.bounds.minY);

  const lines = [];
  let currentLine = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];

    // Check if current word is on the same line as previous
    const yDiff = Math.abs(current.bounds.minY - previous.bounds.minY);
    const avgHeight = (current.height + previous.height) / 2;

    if (yDiff < avgHeight * 0.5) {
      // Same line
      currentLine.push(current);
    } else {
      // New line
      lines.push(createLineFromWords(currentLine));
      currentLine = [current];
    }
  }

  // Add the last line
  if (currentLine.length > 0) {
    lines.push(createLineFromWords(currentLine));
  }

  return lines;
}

/**
 * Create a line object from words
 * @param {Array} words - Words in the line
 * @returns {Object} - Line object
 */
function createLineFromWords(words) {
  const minX = Math.min(...words.map(w => w.bounds.minX));
  const minY = Math.min(...words.map(w => w.bounds.minY));
  const maxX = Math.max(...words.map(w => w.bounds.maxX));
  const maxY = Math.max(...words.map(w => w.bounds.maxY));

  return {
    id: `line_${Date.now()}_${Math.random()}`,
    text: words.map(w => w.text).join(' '),
    words: words,
    bounds: { minX, minY, maxX, maxY },
    box: [minX, minY, maxX, maxY],
    confidence: words.reduce((sum, w) => sum + w.confidence, 0) / words.length,
    type: 'line'
  };
}

/**
 * Cleanup Tesseract worker
 */
export async function terminateTesseract() {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}

/**
 * Extract text properties (font size, color, etc.)
 * @param {HTMLCanvasElement} canvas - Canvas with image
 * @param {Object} textRegion - Text region bounds
 * @returns {Object} - Text properties
 */
export function extractTextProperties(canvas, textRegion) {
  const ctx = canvas.getContext('2d');
  const { bounds } = textRegion;
  
  // Get image data for the text region
  const imageData = ctx.getImageData(
    bounds.minX,
    bounds.minY,
    bounds.maxX - bounds.minX,
    bounds.maxY - bounds.minY
  );

  // Extract dominant color (simplified)
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    r += imageData.data[i];
    g += imageData.data[i + 1];
    b += imageData.data[i + 2];
    count++;
  }

  const avgColor = {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };

  return {
    color: `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`,
    fontSize: textRegion.height,
    fontWeight: 'normal', // Could be enhanced with ML
    fontFamily: 'Arial', // Could be enhanced with font detection
    bounds: textRegion.bounds
  };
}