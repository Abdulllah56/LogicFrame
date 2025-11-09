// 'use client';

// import { useCallback } from 'react';

// export const useImageProcessor = () => {
//   // Morphological operations
//   const dilate = useCallback((mask, width, height, radius = 1) => {
//     const result = new Uint8ClampedArray(mask.length);
//     for (let y = 0; y < height; y++) {
//       for (let x = 0; x < width; x++) {
//         let maxVal = 0;
//         for (let dy = -radius; dy <= radius; dy++) {
//           for (let dx = -radius; dx <= radius; dx++) {
//             const nx = x + dx;
//             const ny = y + dy;
//             if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
//               maxVal = Math.max(maxVal, mask[ny * width + nx]);
//             }
//           }
//         }
//         result[y * width + x] = maxVal;
//       }
//     }
//     return result;
//   }, []);

//   const erode = useCallback((mask, width, height, radius = 1) => {
//     const result = new Uint8ClampedArray(mask.length);
//     for (let y = 0; y < height; y++) {
//       for (let x = 0; x < width; x++) {
//         let minVal = 255;
//         for (let dy = -radius; dy <= radius; dy++) {
//           for (let dx = -radius; dx <= radius; dx++) {
//             const nx = x + dx;
//             const ny = y + dy;
//             if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
//               minVal = Math.min(minVal, mask[ny * width + nx]);
//             }
//           }
//         }
//         result[y * width + x] = minVal;
//       }
//     }
//     return result;
//   }, []);

//   const gaussianBlur = useCallback((mask, width, height, radius) => {
//     if (radius === 0) return mask;
    
//     const result = new Uint8ClampedArray(mask.length);
//     const kernel = [];
//     const sigma = radius / 2;
//     let kernelSum = 0;
    
//     for (let i = -radius; i <= radius; i++) {
//       const val = Math.exp(-(i * i) / (2 * sigma * sigma));
//       kernel.push(val);
//       kernelSum += val;
//     }
    
//     for (let i = 0; i < kernel.length; i++) {
//       kernel[i] /= kernelSum;
//     }
    
//     const temp = new Float32Array(mask.length);
//     for (let y = 0; y < height; y++) {
//       for (let x = 0; x < width; x++) {
//         let sum = 0;
//         for (let i = -radius; i <= radius; i++) {
//           const nx = Math.max(0, Math.min(width - 1, x + i));
//           sum += mask[y * width + nx] * kernel[i + radius];
//         }
//         temp[y * width + x] = sum;
//       }
//     }
    
//     for (let y = 0; y < height; y++) {
//       for (let x = 0; x < width; x++) {
//         let sum = 0;
//         for (let i = -radius; i <= radius; i++) {
//           const ny = Math.max(0, Math.min(height - 1, y + i));
//           sum += temp[ny * width + x] * kernel[i + radius];
//         }
//         result[y * width + x] = Math.round(sum);
//       }
//     }
    
//     return result;
//   }, []);

//   const calculateSelectionBounds = useCallback((mask, width, height) => {
//     let minX = width, minY = height, maxX = 0, maxY = 0;
//     let hasSelection = false;
    
//     for (let y = 0; y < height; y++) {
//       for (let x = 0; x < width; x++) {
//         if (mask[y * width + x] > 128) {
//           hasSelection = true;
//           minX = Math.min(minX, x);
//           minY = Math.min(minY, y);
//           maxX = Math.max(maxX, x);
//           maxY = Math.max(maxY, y);
//         }
//       }
//     }
    
//     return hasSelection ? { minX, minY, maxX, maxY } : null;
//   }, []);

//   const improvedFloodFill = useCallback((startX, startY, imageData, tolerance = 32) => {
//     const { width, height, data } = imageData;
//     const mask = new Uint8ClampedArray(width * height);
//     const visited = new Uint8Array(width * height);
    
//     const startIdx = (startY * width + startX) * 4;
//     const seedR = data[startIdx];
//     const seedG = data[startIdx + 1];
//     const seedB = data[startIdx + 2];
    
//     const queue = [[startX, startY]];
//     visited[startY * width + startX] = 1;
    
//     while (queue.length > 0) {
//       const [x, y] = queue.shift();
//       const idx = y * width + x;
//       const pixelIdx = idx * 4;
      
//       const r = data[pixelIdx];
//       const g = data[pixelIdx + 1];
//       const b = data[pixelIdx + 2];
      
//       const colorDist = Math.sqrt(
//         Math.pow(r - seedR, 2) +
//         Math.pow(g - seedG, 2) +
//         Math.pow(b - seedB, 2)
//       );
      
//       if (colorDist <= tolerance) {
//         mask[idx] = 255;
        
//         const neighbors = [
//           [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
//         ];
        
//         for (const [nx, ny] of neighbors) {
//           if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
//             const nIdx = ny * width + nx;
//             if (!visited[nIdx]) {
//               visited[nIdx] = 1;
//               queue.push([nx, ny]);
//             }
//           }
//         }
//       }
//     }
    
//     return mask;
//   }, []);

//   return {
//     dilate,
//     erode,
//     gaussianBlur,
//     calculateSelectionBounds,
//     improvedFloodFill
//   };
// };