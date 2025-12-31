import Replicate from "replicate";
import sharp from 'sharp';

/**
 * Background Removal API Route - Enhanced Version
 * Step 3 of AI-powered layer separation engine
 * Uses RMBG model for smart background detection with edge refinement
 */

async function fetchImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
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
 * Apply feathering to edges for smooth transitions
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

export async function POST(request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return Response.json({ 
        success: false, 
        error: 'REPLICATE_API_TOKEN not configured. Please add it to your environment variables.' 
      }, { status: 500 });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const { image, edgeRefinement = true, feather = 2 } = await request.json();

    if (!image) {
      return Response.json({ 
        success: false, 
        error: 'No image provided' 
      }, { status: 400 });
    }

    console.log('🎨 Starting background removal...');
    console.log(`Edge Refinement: ${edgeRefinement}, Feather: ${feather}`);

    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: image
        }
      }
    );

    if (!output) {
      throw new Error('No output from background removal model');
    }

    console.log('✅ Background removed, processing mask...');

    const resultBuffer = await fetchImage(output);
    const { data, info } = await sharp(resultBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    
    let alphaMask = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      alphaMask[i / 4] = data[i + 3];
    }

    if (edgeRefinement) {
      console.log('🔧 Refining edges...');
      alphaMask = refineEdges(alphaMask, width, height, 1);
    }

    if (feather > 0) {
      console.log('✨ Feathering edges...');
      alphaMask = featherEdges(alphaMask, width, height, feather);
    }

    const rleMask = [];
    let lastBit = alphaMask[0] > 128 ? 1 : 0;
    let count = 0;
    
    for (let i = 0; i < alphaMask.length; i++) {
      const bit = alphaMask[i] > 128 ? 1 : 0;
      if (bit === lastBit) {
        count++;
      } else {
        rleMask.push(count);
        count = 1;
        lastBit = bit;
      }
    }
    rleMask.push(count);

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let foregroundPixels = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (alphaMask[y * width + x] > 128) {
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

    console.log(`✅ Background removal complete! Foreground: ${Math.round(foregroundRatio * 100)}%`);

    return Response.json({ 
      success: true,
      mask: {
        counts: rleMask,
        size: [height, width]
      },
      alphaMask: Array.from(alphaMask),
      bounds: {
        minX,
        minY,
        maxX,
        maxY
      },
      stats: {
        foregroundPixels,
        totalPixels,
        foregroundRatio: Math.round(foregroundRatio * 100) / 100
      },
      resultImage: output,
      engine: 'RMBG v1.4'
    });

  } catch (error) {
    console.error('❌ Background removal error:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
