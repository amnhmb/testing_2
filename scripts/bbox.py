from PIL import Image

img = Image.open(r'c:\Users\User\Desktop\MomenKita\Awan Larat\assets\songket\set_icon.png')
pixels = img.load()
min_x, min_y, max_x, max_y = img.width, img.height, 0, 0

for y in range(img.height):
    for x in range(img.width):
        if pixels[x, y][3] > 180:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

print(f'BBox: {min_x}, {min_y}, {max_x}, {max_y}')
