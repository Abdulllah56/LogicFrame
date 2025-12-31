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

    // A generic query to detect common objects.
    const query = "person, car, truck, bus, motorcycle, bicycle, traffic light, stop sign, bench, bird, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe, backpack, umbrella, handbag, tie, suitcase, frisbee, skis, snowboard, sports ball, kite, baseball bat, baseball glove, skateboard, surfboard, tennis racket, bottle, wine glass, cup, fork, knife, spoon, bowl, banana, apple, sandwich, orange, broccoli, carrot, hot dog, pizza, donut, cake, chair, couch, potted plant, bed, dining table, toilet, tv, laptop, mouse, remote, keyboard, cell phone, microwave, oven, toaster, sink, refrigerator, book, clock, vase, scissors, teddy bear, hair drier, toothbrush";

    const output = await replicate.run(
      "adirik/grounding-dino:efd10a8ddc57ea28773327e881ce95e20cc1d734c589f7dd01d2036921ed78aa",
      {
        input: {
          image: image,
          query: query,
          box_threshold: 0.35,
          text_threshold: 0.25
        }
      }
    );
    
    // The output is expected to be in the format:
    // [[x1, y1, x2, y2, confidence, class_id], [x1, y1, x2, y2, confidence, class_id], ...]
    // and the labels are in a separate list.
    // The model page does not specify the output format, so this is a guess.
    // Let's assume the output is a list of [x, y, w, h, score, class_name]
    // The frontend expects: { id, bounds: { minX, minY, maxX, maxY }, area }

    const objects = output.map((obj, i) => {
      const [minX, minY, maxX, maxY] = obj.box;
      return {
        id: `obj_${Date.now()}_${i}`,
        bounds: {
          minX,
          minY,
          maxX,
          maxY,
        },
        area: (maxX - minX) * (maxY - minY)
      }
    });

    return Response.json({ success: true, objects: objects });

  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
