"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Icon } from "@/components/icons";

type Props = {
  imageSrc: string;
  mime: string;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
};

async function getCroppedDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  mime: string
): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("load failed"));
  });

  const canvas = document.createElement("canvas");
  const maxSize = 1024;
  // pixelCrop is in original image pixels; output size is cropped area clamped to maxSize
  const outW = Math.min(maxSize, Math.round(pixelCrop.width));
  const outH = Math.min(maxSize, Math.round(pixelCrop.height));
  // force square 512-1024 for logo consistency — use smallest side
  const size = Math.min(outW, outH);
  canvas.width = Math.max(1, size);
  canvas.height = Math.max(1, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // For JPEG, fill white behind transparent
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (mime === "image/png") {
    return canvas.toDataURL("image/png");
  }
  if (mime === "image/webp") {
    return canvas.toDataURL("image/webp", 0.92);
  }
  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function LogoCropDialog({ imageSrc, mime, onClose, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_a: Area, pa: Area) => {
    setCroppedArea(pa);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setBusy(true);
    try {
      const url = await getCroppedDataUrl(imageSrc, croppedArea, mime);
      onConfirm(url);
    } catch {
      // fallback to original if crop fails
      onConfirm(imageSrc);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div id="modalRoot" style={{ position: "static" }}>
      <div className="mback" onClick={onClose} />
      <div className="mpanel wide" style={{ width: 520 }}>
        <div className="mhead">
          <h3>Crop your logo</h3>
          <button className="mx" onClick={onClose} aria-label="Close">
            <Icon name="x" size={17} />
          </button>
        </div>
        <div className="mbody p-0">
          <div className="relative bg-[#111] overflow-hidden" style={{ height: 380 }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid={false}
              objectFit="contain"
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              style={{
                containerStyle: { background: "#0F0F0F" },
                cropAreaStyle: { border: "2px solid #fff", borderRadius: 12, boxShadow: "0 0 0 9999px rgba(0,0,0,.55)" },
              }}
            />
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Icon name="search" size={14} />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="range flex-1"
                style={{ ["--fill" as any]: `${((zoom - 1) / 2) * 100}%` }}
                aria-label="Zoom"
              />
              <span className="mono text-[12px] text-muted w-10 text-right">{Math.round(zoom * 100)}%</span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted">
              Drag to reposition, pinch or use slider to zoom. Square crop stays sharp and keeps transparency for PNG.
            </p>
          </div>
        </div>
        <div className="mfoot">
          <button className="btn ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn grn" onClick={handleConfirm} disabled={busy || !croppedArea}>
            <Icon name="check" size={14} /> {busy ? "Cropping…" : "Apply crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
