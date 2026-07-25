import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We only want to replace text colors to ensure WCAG AA (min 4.5:1 which is ~text-white/50)
    # We will upgrade the opacities.
    # text-white/30 -> text-white/50
    # text-white/40 -> text-white/60
    # text-brand-white/60 -> text-brand-white/80
    
    replacements = {
        r'text-white/30': 'text-white/50',
        r'text-white/40': 'text-white/60',
        r'text-brand-white/60': 'text-brand-white/80',
        # Optional: bump 50 to 70 for visual hierarchy if 40 went to 60
        r'text-white/50': 'text-white/70',
    }

    new_content = content
    for pattern, repl in replacements.items():
        new_content = re.sub(pattern, repl, new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            process_file(os.path.join(root, file))

print("Contrast fix complete.")
