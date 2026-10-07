from PIL import Image

filepath = r'c:\Users\User\Desktop\MomenKita\Awan Larat\assets\songket\set_icon.png'
img = Image.open(filepath).convert("RGBA")

# Bounding box of the central design
left, top, right, bottom = 326, 366, 696, 657

# Crop the image
cropped = img.crop((left, top, right, bottom))
pixels = cropped.load()

# Threshold and rescale alpha to remove the background grid while preserving anti-aliasing
for y in range(cropped.height):
    for x in range(cropped.width):
        r, g, b, a = pixels[x, y]
        # Background grid alpha is around 30-60.
        # So we set anything below 100 to 0, and rescale the rest.
        if a < 100:
            new_a = 0
        else:
            new_a = int((a - 100) * 255 / 155)
        pixels[x, y] = (r, g, b, new_a)

cropped.save(filepath)
print(f"Cropped and cleaned {filepath}")
