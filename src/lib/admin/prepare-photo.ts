/**
 * Readies a photo in the browser before upload: turned upright, at most 2400px on its long side,
 * re-encoded as JPEG, which also drops its metadata (phones store the GPS location there), plus a
 * 16px copy for the blurred placeholder. A 12-megapixel phone photo ends up around 600KB.
 */
export async function preparePhoto(file: File, longSide = 2400) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, longSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't encode the photo"))), "image/jpeg", 0.86),
    );

    const tiny = document.createElement("canvas");
    tiny.width = 16;
    tiny.height = Math.max(1, Math.round((16 * height) / width));
    tiny.getContext("2d")!.drawImage(bitmap, 0, 0, tiny.width, tiny.height);
    const blurDataURL = tiny.toDataURL("image/jpeg", 0.7);

    return { blob, width, height, blurDataURL };
  } finally {
    bitmap.close();
  }
}
