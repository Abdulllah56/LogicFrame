import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return Response.json({ success: false, error: 'No API token configured' }, { status: 500 });
    }

    const { image } = await request.json();

    const output = await replicate.run(
      "abiruyt/text-extract-ocr:dc64a34398c45a2e54858610e221c5f619909430e6384330b822543a1a32a467",
      {
        input: {
          image: image,
        }
      }
    );
    
    // The model output is a string containing the extracted text.
    // It does not provide bounding boxes.
    // For now, we will return the full text.
    // In the future, we can explore models that provide bounding boxes for each word or line.

    const objects = [
      {
        id: `text_${Date.now()}`,
        type: 'text',
        text: output,
        bounds: {
          minX: 0,
          minY: 0,
          maxX: 0,
          maxY: 0,
        },
        area: 0
      }
    ];

    return Response.json({ success: true, objects: objects });

  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
