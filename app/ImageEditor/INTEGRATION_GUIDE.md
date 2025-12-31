# AI Engine Integration Guide

## Quick Start: Using Object Detection + Text OCR Together

### Step-by-Step Workflow

#### 1. Upload Your Image
```javascript
// The image editor automatically initializes when you upload
<input type="file" onChange={handleImageUpload} />
```

#### 2. Automatic Object Detection (SAM)
- Runs automatically on image upload
- Detects all objects in 5-15 seconds
- Highlights objects with colored overlays
- Shows count of detected objects

#### 3. Manual Text Detection (OCR)
- Click "Detect Text (OCR)" button
- Tesseract analyzes the image (10-30 seconds)
- Extracts all text with confidence scores
- Groups words into lines

#### 4. Work with Detected Elements
- **Objects:** Click to select, drag to move, resize, rotate
- **Text:** View in panel, copy to clipboard, see confidence scores
- **Both:** Toggle highlights on/off independently

---

## Component Integration

### In Your Main Editor Component

```javascript
import { useAIEngine } from './components/AIEngineManager';
import ObjectDetectionPanel from './components/ObjectDetectionPanel';
import TextDetectionPanel from './components/TextDetectionPanel';
import AIEngineStatusPanel from './components/AIEngineStatusPanel';

function ImageEditor() {
  const {
    engineStatus,
    engineResults,
    detectAndSegmentObjects,
    detectText,
    runFullAnalysis
  } = useAIEngine();

  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [detectedText, setDetectedText] = useState([]);

  // Run full AI analysis
  const analyzeImage = async () => {
    const results = await runFullAnalysis(uploadedImage, (progress, status) => {
      console.log(`${progress}%: ${status}`);
    });

    if (results.objects?.success) {
      setDetectedObjects(results.objects.objects);
    }

    if (results.text?.success) {
      setDetectedText(results.text.textRegions);
    }
  };

  return (
    <>
      <ObjectDetectionPanel
        image={uploadedImage}
        onObjectsDetected={setDetectedObjects}
        showObjectHighlights={true}
        setShowObjectHighlights={setShowObjectHighlights}
      />

      <TextDetectionPanel
        image={uploadedImage}
        detectedText={detectedText}
        onTextDetected={setDetectedText}
        showTextHighlights={true}
        setShowTextHighlights={setShowTextHighlights}
      />

      <AIEngineStatusPanel
        engineStatus={engineStatus}
        onRunFullAnalysis={analyzeImage}
      />
    </>
  );
}
```

---

## API Endpoints

### Object Detection
```javascript
POST /api/auto-segment
{
  "image": "data:image/jpeg;base64,..."
}

Response:
{
  "success": true,
  "masks": [
    {
      "id": "obj_0",
      "rle": { "counts": [...], "size": [height, width] },
      "box": [x1, y1, x2, y2],
      "bounds": { "minX": x1, "minY": y1, "maxX": x2, "maxY": y2 },
      "area": 12345,
      "confidence": 0.95
    }
  ],
  "count": 5,
  "engine": "SAM (Segment Anything Model)"
}
```

### Text Detection
```javascript
// Client-side OCR (no API call needed)
import { detectText } from './utils/ocrEngine';

const result = await detectText(imageDataUrl, (progress, status) => {
  console.log(`${progress}%: ${status}`);
});

// Result:
{
  "success": true,
  "textRegions": [
    {
      "id": "text_0",
      "text": "Hello World",
      "confidence": 0.92,
      "bounds": { "minX": 10, "minY": 20, "maxX": 100, "maxY": 40 },
      "fontSize": 20,
      "type": "text"
    }
  ],
  "lines": [...],
  "fullText": "Hello World\nMore text...",
  "confidence": 0.89
}
```

---

## Environment Setup

### Required Environment Variables

```env
# For Object Detection (SAM)
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx

# Optional: For future server-side OCR
# GOOGLE_CLOUD_API_KEY=xxxxx
```

### Get Your Replicate API Token
1. Go to https://replicate.com
2. Sign up / Log in
3. Navigate to Account → API Tokens
4. Create new token
5. Copy and add to `.env.local`

---

## Performance Optimization

### Object Detection
- **Optimize image size:** Resize to max 1920x1080 before upload
- **Use appropriate thresholds:** Adjust box_threshold and nms_threshold
- **Cache results:** Store detected objects to avoid re-processing

### Text Detection
- **Pre-process images:** Increase contrast for better OCR
- **Use appropriate language:** Load only needed Tesseract language packs
- **Batch processing:** Process multiple regions in parallel
- **Worker reuse:** Keep Tesseract worker alive between detections

---

## Troubleshooting

### Object Detection Issues

**Problem:** "No API token configured"
- **Solution:** Add `REPLICATE_API_TOKEN` to `.env.local`

**Problem:** Slow detection (>30 seconds)
- **Solution:** Image too large, resize to 1920x1080 max

**Problem:** Too many/few objects detected
- **Solution:** Adjust `box_threshold` (0.2-0.4 range)

### Text Detection Issues

**Problem:** OCR taking too long
- **Solution:** Image resolution too high, resize before OCR

**Problem:** Low accuracy on text
- **Solution:** Ensure good image quality, high contrast, clear text

**Problem:** Wrong language detected
- **Solution:** Load appropriate Tesseract language pack

---

## Advanced Usage

### Custom Object Detection Settings
```javascript
// In auto-segment API
{
  box_threshold: 0.25,    // Lower = more objects detected
  text_threshold: 0.2,    // Text detection sensitivity
  nms_threshold: 0.7      // Non-maximum suppression
}
```

### Custom OCR Settings
```javascript
// In ocrEngine.js
const worker = await Tesseract.createWorker('eng+fra', 1, {
  // Multiple languages
  logger: (m) => console.log(m)
});

// With custom parameters
await worker.setParameters({
  tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
});
```

---

## Next Steps

### Step 3: Background Removal
- Implement smart background detection
- Use Remove.bg API or U2-Net model
- Add edge refinement algorithms

### Step 4: Smart Grouping
- Group related objects automatically
- Detect UI components (buttons, cards)
- Cluster text blocks

### Step 5: Layer Ordering
- Determine depth/z-index
- Analyze occlusion
- Smart layer stacking

---

## Resources

- [SAM Model Documentation](https://segment-anything.com/)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [Replicate API Docs](https://replicate.com/docs)
- [OCR Best Practices](https://github.com/tesseract-ocr/tesseract/wiki/ImproveQuality)

---

**Need Help?** Check the main AI_ENGINE_README.md for detailed feature documentation.