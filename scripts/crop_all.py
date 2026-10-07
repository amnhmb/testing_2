import os
from PIL import Image

folder = r'c:\Users\User\Desktop\MomenKita\Awan Larat\assets\songket'

for filename in os.listdir(folder):
    if not filename.endswith(".png"):
        continue
    
    filepath = os.path.join(folder, filename)
    img = Image.open(filepath).convert("RGBA")
    
    pixels = img.load()
    
    # 1. First pass: clean background grid (petak-petak) if present
    # Assume grid has low alpha (e.g. < 100). We set it to 0, and rescale the rest
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if a < 100:
                pixels[x, y] = (r, g, b, 0)
            else:
                new_a = int((a - 100) * 255 / 155)
                pixels[x, y] = (r, g, b, new_a)

    # 2. Second pass: find bounding box of non-transparent pixels
    min_x, min_y, max_x, max_y = img.width, img.height, 0, 0
    has_pixels = False
    
    for y in range(img.height):
        for x in range(img.width):
            if pixels[x, y][3] > 10:
                has_pixels = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
                
    if has_pixels:
        # Add 2 pixels padding
        min_x = max(0, min_x - 2)
        min_y = max(0, min_y - 2)
        max_x = min(img.width, max_x + 3)
        max_y = min(img.height, max_y + 3)
        
        cropped = img.crop((min_x, min_y, max_x, max_y))
        cropped.save(filepath)
        print(f"Cropped {filename} to {max_x - min_x}x{max_y - min_y}")
    else:
        print(f"Skipped {filename} - empty")

