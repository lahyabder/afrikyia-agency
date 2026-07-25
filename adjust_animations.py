import os
import re

sections_dir = 'src/components/sections'
files = [f for f in os.listdir(sections_dir) if f.endswith('.tsx')]

for filename in files:
    filepath = os.path.join(sections_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # Adjust viewport to have a margin that ensures it triggers
    # e.g., viewport={{ once: true }} -> viewport={{ once: true, margin: "0px 0px -100px 0px" }}
    content = re.sub(r'viewport=\{\{\s*once:\s*true\s*\}\}', r'viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}', content)

    # If they already have viewport config, let's just make sure amount is small
    # Actually most are just viewport={{ once: true }}

    with open(filepath, 'w') as f:
        f.write(content)

print("Animations adjusted in sections.")
