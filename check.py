def luminance(r, g, b):
    a = [c / 255.0 for c in (r, g, b)]
    for i in range(3):
        if a[i] <= 0.03928:
            a[i] = a[i] / 12.92
        else:
            a[i] = ((a[i] + 0.055) / 1.055) ** 2.4
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]

def contrast_ratio(r1, g1, b1, r2, g2, b2):
    l1 = luminance(r1, g1, b1)
    l2 = luminance(r2, g2, b2)
    bright = max(l1, l2)
    dark = min(l1, l2)
    return (bright + 0.05) / (dark + 0.05)
print(contrast_ratio(232, 43, 50, 8, 8, 8)) # E82B32
print(contrast_ratio(235, 47, 54, 8, 8, 8)) # EB2F36
