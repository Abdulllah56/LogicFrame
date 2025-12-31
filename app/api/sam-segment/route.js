import Replicate from "replicate";
import sharp from 'sharp';

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

export async function POST(request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return Response.json({ 
        success: false, 
        error: 'No API token configured' 
      }, { status: 500 });
    }
    
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    const { image, point, box } = await request.json();
    
    const output = await replicate.run(
      "cjwbw/segment-anything-box-and-point:b1c31566fde24a82b25238855379a364f05683c5328e24493583623c451e4579",
      {
        input: {
          image: image,
          points: JSON.stringify([[point.x, point.y, 1]]),
          boxes: JSON.stringify([box])
        }
      }
    );

    if (output) {
      const maskImageBuffer = await fetchImage(output);
      const { data, info } = await sharp(maskImageBuffer).raw().toBuffer({ resolveWithObject: true });
      
      const binaryMask = new Uint8Array(info.width * info.height);
      for (let i = 0; i < data.length; i += info.channels) {
        binaryMask[i / info.channels] = data[i] > 128 ? 1 : 0;
      }

      const rleMask = toRle(binaryMask, info.width, info.height);

      return Response.json({ 
        success: true, 
        mask: {
          counts: rleMask,
          size: [info.height, info.width]
        }
      });
    } else {
      return Response.json({ 
        success: false, 
        error: 'No mask in API response'
      });
    }
    
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message
    }, { status: 500 });
  }
}