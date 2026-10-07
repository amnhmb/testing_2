from PIL import Image

filepath = r'c:\Users\User\Desktop\MomenKita\Awan Larat\assets\songket\background_pattern.png'
img = Image.open(filepath).convert("RGBA")
pixels = img.load()

# Soft emerald green RGB: (52, 211, 153) or a bit darker like (16, 185, 129)
# Let's use (16, 185, 129) which is Tailwind's emerald-500
target_r, target_g, target_b = 16, 185, 129

for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pixels[x, y]
        if a > 0:
            pixels[x, y] = (target_r, target_g, target_b, a)

img.save(filepath)
print(f"Recolored {filepath} to soft emerald green.")
