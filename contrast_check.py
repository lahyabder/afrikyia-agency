import re
import os

def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    if len(hex_code) == 3:
        hex_code = ''.join([c*2 for c in hex_code])
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def luminance(r, g, b):
    a = [c / 255.0 for c in (r, g, b)]
    for i in range(3):
        if a[i] <= 0.03928:
            a[i] = a[i] / 12.92
        else:
            a[i] = ((a[i] + 0.055) / 1.055) ** 2.4
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]

def contrast_ratio(hex1, hex2):
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    l1 = luminance(r1, g1, b1)
    l2 = luminance(r2, g2, b2)
    bright = max(l1, l2)
    dark = min(l1, l2)
    return (bright + 0.05) / (dark + 0.05)

bg_colors = ['#000000', '#080808']
text_colors = ['#ff0000', '#ffffff', '#E5232A'] # I saw E5232A somewhere in Hero.tsx

print("Contrast Check:")
for bg in bg_colors:
    for tc in text_colors:
        cr = contrast_ratio(tc, bg)
        print(f"{tc} on {bg}: {cr:.2f}:1")
        if cr >= 7:
            print("  -> Passes WCAG AAA (normal text)")
        elif cr >= 4.5:
            print("  -> Passes WCAG AA (normal text) / AAA (large text)")
        elif cr >= 3:
            print("  -> Passes WCAG AA (large text)")
        else:
            print("  -> FAILS")
