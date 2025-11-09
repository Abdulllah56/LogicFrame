import Replicate from "replicate";

// Simplified version using RMBG for testing
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
    
    const { image } = await request.json();
    
    // Using RMBG - very reliable background remover
    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: image
        }
      }
    );
    
    return Response.json({ 
      success: true, 
      mask: output 
    });
    
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message
    }, { status: 500 });
  }
}