import vtracer
import sys

if len(sys.argv) < 2:
    print("Usage: python vectorize.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]

# Process the image and get SVG string
svg_string = vtracer.convert_image_to_svg_string(image_path)

print(svg_string)
