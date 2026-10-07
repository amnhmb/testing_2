from PIL import Image

img = Image.open(r'c:\Users\User\Desktop\MomenKita\Awan Larat\assets\songket\set_icon.png')
img.thumbnail((64, 64))
pixels = img.load()
chars = ' .:-=+*#%@'
text = ''
for y in range(img.height):
    for x in range(img.width):
        a = pixels[x, y][3]  # Get alpha channel
        idx = int(a / 255 * 9)
        text += chars[idx] * 2
    text += '\n'

with open('debug_img.txt', 'w') as f:
    f.write(text)
