import Replicate from "replicate";
import sharp from 'sharp';

/**
 * Auto-Segment API Route - Enhanced Version
 * Uses SAM (Segment Anything Model) to automatically detect and segment all objects
 * This is Step 1 of the AI-powered layer separation engine
 */

async function fetchImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function toRle(mask, width, height) {
  const rle = [];
  let lastBit = 0;
  let count = 0;
  for (let i = 0; i < width * height; i++) {
    const bit = mask[i];
    if (bit === lastBit) {
      count++;
    } else {
      rle.push(count);
      count = 1;
      lastBit = bit;
    }
  }
  rle.push(count);
  return rle;
}

function calculateBoundingBox(mask, width, height) {
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let hasPixels = false;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] > 0) {
        hasPixels = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  return hasPixels ? [minX, minY, maxX, maxY] : null;
}

function calculateArea(mask) {
  return mask.reduce((sum, val) => sum + (val > 0 ? 1 : 0), 0);
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
    
    const { image } = await request.json();
    
    if (!image) {
      return Response.json({ 
        success: false, 
        error: 'No image provided' 
      }, { status: 400 });
    }

    console.log('🎯 Starting automatic object detection & segmentation with SAM...');
    
    // Use the existing model with enhanced processing
    const output = await replicate.run(
      "pablodawson/segment-anything-automatic:288b2e267b1735382f131b82b604620a07818cf3b242a2a1812604f7070c625b",
      {
        input: {
          image: image,
          box_threshold: 0.25,
          text_threshold: 0.2,
          nms_threshold: 0.7
        }
      }
    );

    if (output && output.masks) {
      const processedMasks = [];
      
      // Process each mask to extract detailed information
      for (let i = 0; i < output.masks.length; i++) {
        try {
          const maskData = output.masks[i];
          
          // If mask is already in RLE format
          if (maskData.rle) {
            processedMasks.push({
              id: `obj_${i}`,
              rle: maskData.rle,
              box: maskData.box || [0, 0, 100, 100],
              bounds: {
                minX: maskData.box?.[0] || 0,
                minY: maskData.box?.[1] || 0,
                maxX: maskData.box?.[2] || 100,
                maxY: maskData.box?.[3] || 100
              },
              area: maskData.area || 1000,
              confidence: maskData.confidence || 0.9,
              label: maskData.label || 'object'
            });
          } else if (typeof maskData === 'string') {
            // If mask is a URL, fetch and process it
            const maskImageBuffer = await fetchImage(maskData);
            const { data, info } = await sharp(maskImageBuffer)
              .raw()
              .toBuffer({ resolveWithObject: true });
            
            const binaryMask = new Uint8Array(info.width * info.height);
            for (let j = 0; j < data.length; j += info.channels) {
              binaryMask[j / info.channels] = data[j] > 128 ? 1 : 0;
            }

            const box = calculateBoundingBox(binaryMask, info.width, info.height);
            if (!box) continue;

            const area = calculateArea(binaryMask);
            const rleMask = toRle(binaryMask, info.width, info.height);

            processedMasks.push({
              id: `obj_${i}`,
              rle: {
                counts: rleMask,
                size: [info.height, info.width]
              },
              box: box,
              bounds: {
                minX: box[0],
                minY: box[1],
                maxX: box[2],
                maxY: box[3]
              },
              area: area,
              confidence: 0.9,
              label: 'object'
            });
          }
        } catch (err) {
          console.warn(`Failed to process mask ${i}:`, err.message);
        }
      }

      // Sort by area (largest first) and filter out very small objects
      const filteredMasks = processedMasks
        .filter(m => m.area > 100)
        .sort((a, b) => b.area - a.area);

      console.log(`✅ Successfully segmented ${filteredMasks.length} objects`);

      return Response.json({ 
        success: true, 
        masks: filteredMasks,
        count: filteredMasks.length,
        engine: 'SAM (Segment Anything Model)'
      });
    } else {
      return Response.json({ 
        success: false, 
        error: 'No masks in API response'
      });
    }
    
  } catch (error) {
    console.error('❌ Auto-segmentation error:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
