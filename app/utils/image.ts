import sharp from "sharp";

/**
 * Compress an image buffer to under 50KB using JPEG format and adaptive quality.
 * Returns the compressed buffer, or throws if unable to compress below 50KB.
 * @param imageBuffer Buffer of the original image
 * @returns Promise<Buffer> Compressed image buffer
 */
export async function compressImageToUnder50KB(
  imageBuffer: Buffer
): Promise<Buffer> {
  let quality = 80;
  let compressedBuffer = await sharp(imageBuffer).jpeg({ quality }).toBuffer();

  while (compressedBuffer.length > 50 * 1024 && quality > 10) {
    quality -= 10;
    compressedBuffer = await sharp(imageBuffer).jpeg({ quality }).toBuffer();
  }

  if (compressedBuffer.length > 50 * 1024) {
    throw new Error("Unable to compress image below 50KB");
  }

  return compressedBuffer;
}

/**
 * Generate a small (80x80px) base64-encoded JPEG thumbnail from an image buffer.
 * @param imageBuffer Buffer of the original image
 * @returns Promise<string> Base64 data URL of the thumbnail
 */
export async function generateThumbnailBase64(
  imageBuffer: Buffer
): Promise<string> {
  const thumbBuffer = await sharp(imageBuffer)
    .resize(80, 80, { fit: "inside" })
    .jpeg({ quality: 60 })
    .toBuffer();
  const base64 = thumbBuffer.toString("base64");
  return `data:image/jpeg;base64,${base64}`;
}
