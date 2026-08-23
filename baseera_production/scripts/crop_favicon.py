import sys
import os
try:
    from PIL import Image, ImageChops
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageChops

def crop_favicon():
    img_path = r"c:\Users\meeea\Desktop\baseera - Copy 1\baseera - Copy\dashboard\static\dashboard\img\logo.png"
    out_path = r"c:\Users\meeea\Desktop\baseera - Copy 1\baseera - Copy\dashboard\static\dashboard\img\favicon.png"
    
    if not os.path.exists(img_path):
        print(f"Image not found at {img_path}")
        return
        
    img = Image.open(img_path).convert("RGBA")
    
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        # Crop the image to the bounding box
        img_cropped = img.crop(bbox)
        
        # We can also try to crop the white background if they just want the inner blue logo, but the user's drawing was around the white circle. So cropping to the white circle is correct.
        
        # Make it square
        width, height = img_cropped.size
        size = max(width, height)
        
        # Create a new square transparent image
        new_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        # Paste the cropped image into the center
        new_img.paste(img_cropped, ((size - width) // 2, (size - height) // 2))
        
        # Resize for a good favicon size (e.g., 128x128 or 256x256)
        new_img = new_img.resize((256, 256), Image.Resampling.LANCZOS)
        
        new_img.save(out_path, format="PNG")
        print(f"Successfully cropped and saved to {out_path}")
    else:
        print("Could not find bounding box.")

if __name__ == "__main__":
    crop_favicon()
