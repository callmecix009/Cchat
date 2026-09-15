// Client-side product photo processing.
// Downscales to ~512px JPEG/WebP so catalog payloads stay small
// (mirrors the business-logo upload pattern in settings).

export const PRODUCT_IMAGE_MIME = ["image/png", "image/jpeg", "image/webp"] as const;
export const PRODUCT_IMAGE_MAX_INPUT = 4 * 1024 * 1024; // 4 MB chosen file
const MAX_DIM = 512;

export function validateProductFile(file: File): string | null {
  if (!(PRODUCT_IMAGE_MIME as readonly string[]).includes(file.type)) {
    return "Please choose a PNG, JPG or WEBP photo.";
  }
  if (file.size > PRODUCT_IMAGE_MAX_INPUT) {
    return "That photo is too big — please choose one under 4 MB.";
  }
  return null;
}

export function processProductImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        try {
          const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
          // Small enough already — still re-encode PNGs (often huge) to JPEG/WebP
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          // JPEG has no alpha — paint white behind transparent PNGs
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const mime = file.type === "image/png" ? "image/jpeg" : file.type;
          resolve(canvas.toDataURL(mime, 0.82));
        } catch {
          resolve(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
