from PIL import Image
import os

folder = r"c:\Users\User\Desktop\MomenKita\Awan Larat\assets\songket"
gold_color = (212, 175, 55)

for filename in os.listdir(folder):
    if filename.endswith(".png"):
        filepath = os.path.join(folder, filename)
        img = Image.open(filepath).convert("RGBA")
        
        new_data = []
        for item in img.getdata():
            # Get grayscale value using luminosity method
            g = int(item[0] * 0.299 + item[1] * 0.587 + item[2] * 0.114)
            
            # Alpha based on darkness (white=0, black=255)
            # If the image already has some transparency, we factor it in
            # Some images might already be transparent with black pixels
            # Let's check original alpha
            orig_alpha = item[3]
            
            # If it's already a transparent background image, we just colorize the opaque parts
            # If it's white background, orig_alpha is 255, but g is 255. So new alpha is 0.
            
            alpha_from_color = 255 - g
            
            # Final alpha takes the minimum or product to handle both cases (white bg or transparent bg)
            # If orig_alpha is 0 (transparent), final alpha is 0
            # If it's black on white, orig_alpha=255, alpha_from_color=255 -> final_alpha=255
            # If it's white on white, orig_alpha=255, alpha_from_color=0 -> final_alpha=0
            final_alpha = int(alpha_from_color * (orig_alpha / 255.0))
            
            new_data.append((gold_color[0], gold_color[1], gold_color[2], final_alpha))
            
        img.putdata(new_data)
        img.save(filepath)
        print(f"Processed {filename}")
