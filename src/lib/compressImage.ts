// Shrinks a photo in the browser before upload, so large screenshots and camera
// pictures fit the upload limit. Small files, GIFs and SVGs are sent unchanged.

const MAX_SIDE = 1920;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // the hosting platform refuses bodies above ~4.5 MB

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('ImageLoad'));
        };
        img.src = url;
    });
}

export async function compressImage(file: File, maxSide = MAX_SIDE): Promise<File> {
    if (!file.type.startsWith('image/') || /gif|svg/.test(file.type)) return file;
    if (file.size <= 500 * 1024) return file;
    try {
        const img = await loadImage(file);
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return file;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        for (const quality of [0.85, 0.72, 0.6]) {
            const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/webp', quality));
            if (blob && blob.type === 'image/webp' && (blob.size <= MAX_UPLOAD_BYTES || quality === 0.6)) {
                if (blob.size >= file.size) return file;
                return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
            }
            if (!blob || blob.type !== 'image/webp') break; // browser without WebP export
        }
        const jpeg = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.82));
        if (jpeg && jpeg.size < file.size) return new File([jpeg], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
        return file;
    } catch {
        return file;
    }
}
