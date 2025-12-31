'use client';

/**
 * Background Removal Utilities
 * Client-side fallback and helper functions for background removal
 * Step 3 of AI-powered layer separation engine
 */

/**
 * Client-side background removal using color similarity
 * This is a fallback when API is not available
 */
export function clientSideBackgroundRemoval(canvas, options = {}) {
  const {
    tolerance = 30,
    sampleCorners = true,
    edgeRefinement = true,
    feather = 2
  } = options;

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  
  // Sample background color from corners
  let bgR = 0, bgG = 0, bgB = 0;
  
  if (sampleCorners) {
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1]
    ];
    
    corners.forEach(([x, y]) => {
      const idx = (y * width + x) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    });
    
    bgR /= corners.length;
    bgG /= corners.length;
    bgB /= corners.length;
  }
  
  // Create alpha mask
  const mask = new Uint8ClampedArray(width * height);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const dist = Math.sqrt(
      Math.pow(r - bgR, 2) +
      Math.pow(g - bgG, 2) +
      Math.pow(b - bgB, 2)
    );
    
    mask[i / 4] = dist > tolerance ? 255 : 0;
  }
  
  // Apply edge refinement if requested
  let refinedMask = mask;
  if (edgeRefinement) {
    refinedMask = refineEdges(mask, width, height);
  }
  
  // Apply feathering if requested
  if (feather > 0) {
    refinedMask = featherEdges(refinedMask, width, height, feather);
  }
  
  return {
    mask: refinedMask,
    width,
    height,
    backgroundColor: { r: Math.round(bgR), g: Math.round(bgG), b: Math.round(bgB) }
  };
}

/**
 * Magic wand selection (flood fill from point)
 */
export function magicWandSelection(canvas, x, y, tolerance = 30) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  
  const mask = new Uint8ClampedArray(width * height);
  const visited = new Uint8Array(width * height);
  
  const startIdx = (y * width + x) * 4;
  const seedR = data[startIdx];
  const seedG = data[startIdx + 1];
  const seedB = data[startIdx + 2];
  
  const queue = [[x, y]];
  visited[y * width + x] = 1;
  
  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    const idx = (cy * width + cx) * 4;
    
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    const colorDist = Math.sqrt(
      Math.pow(r - seedR, 2) +
      Math.pow(g - seedG, 2) +
      Math.pow(b - seedB, 2)
    );
    
    if (colorDist <= tolerance) {
      mask[cy * width + cx] = 255;
      
      const neighbors = [
        [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
      ];
      
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (!visited[nIdx]) {
            visited[nIdx] = 1;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }
  
  return mask;
}

/**
 * Invert mask (swap foreground/background)
 */
export function invertMask(mask) {
  const inverted = new Uint8ClampedArray(mask.length);
  for (let i = 0; i < mask.length; i++) {
    inverted[i] = 255 - mask[i];
  }
  return inverted;
}

/**
 * Refine edges using morphological operations
 */
function refineEdges(mask, width, height, iterations = 1) {
  let refined = new Uint8ClampedArray(mask);
  
  for (let iter = 0; iter < iterations; iter++) {
    const temp = new Uint8ClampedArray(width * height);
    
    // Erosion
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let minVal = 255;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            minVal = Math.min(minVal, refined[(y + dy) * width + (x + dx)]);
          }
        }
        temp[y * width + x] = minVal;
      }
    }
    
    // Dilation
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let maxVal = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            maxVal = Math.max(maxVal, temp[(y + dy) * width + (x + dx)]);
          }
        }
        refined[y * width + x] = maxVal;
      }
    }
  }
  
  return refined;
}

/**
 * Apply feathering to edges
 */
function featherEdges(mask, width, height, featherRadius = 2) {
  const feathered = new Uint8ClampedArray(mask);
  const kernel = [];
  const sigma = featherRadius / 2;
  
  for (let i = -featherRadius; i <= featherRadius; i++) {
    const val = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(val);
  }
  
  const sum = kernel.reduce((a, b) => a + b, 0);
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= sum;
  }
  
  const temp = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let i = -featherRadius; i <= featherRadius; i++) {
        const nx = Math.max(0, Math.min(width - 1, x + i));
        sum += mask[y * width + nx] * kernel[i + featherRadius];
      }
      temp[y * width + x] = sum;
    }
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let i = -featherRadius; i <= featherRadius; i++) {
        const ny = Math.max(0, Math.min(height - 1, y + i));
        sum += temp[ny * width + x] * kernel[i + featherRadius];
      }
      feathered[y * width + x] = Math.round(sum);
    }
  }
  
  return feathered;
}

/**
 * Apply mask to image data
 */
export function applyMaskToImage(imageData, mask) {
  const { data, width, height } = imageData;
  const result = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    const alpha = mask[pixelIndex];
    
    result.data[i] = data[i];
    result.data[i + 1] = data[i + 1];
    result.data[i + 2] = data[i + 2];
    result.data[i + 3] = alpha;
  }
  
  return result;
}

/**
 * Calculate mask statistics
 */
export function calculateMaskStats(mask, width, height) {
  let foregroundPixels = 0;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] > 128) {
        foregroundPixels++;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  const totalPixels = width * height;
  const foregroundRatio = foregroundPixels / totalPixels;
  
  return {
    foregroundPixels,
    totalPixels,
    foregroundRatio,
    bounds: { minX, minY, maxX, maxY }
  };
}