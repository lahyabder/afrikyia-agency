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

# Target: >= 4.5
# current E5232A is 229, 35, 42
for i in range(229, 256):
    for j in range(35, 100):
        for k in range(42, 100):
            if contrast_ratio(i, j, k, 8, 8, 8) >= 4.5:
                print(f"Brighter red: #{i:02X}{j:02X}{k:02X} -> {contrast_ratio(i, j, k, 8, 8, 8):.2f}:1")
                exit(0)
