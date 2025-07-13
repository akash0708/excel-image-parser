/**
 * Extracts base64 image data from a cell value.
 * Supports data URI (e.g., 'data:image/png;base64,...') or raw base64 strings.
 * Returns { buffer, mimeType } if valid, or null if not a base64 image.
 */
export function extractBase64Image(
  cellValue: unknown
): { buffer: Buffer; mimeType: string } | null {
  if (typeof cellValue !== "string") return null;

  // Data URI pattern
  const dataUriRegex = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;
  const match = cellValue.match(dataUriRegex);
  if (match) {
    const mimeType = match[1];
    const base64 = match[2];
    try {
      const buffer = Buffer.from(base64, "base64");
      return { buffer, mimeType };
    } catch {
      return null;
    }
  }

  // Raw base64 (try to decode, assume jpeg/png)
  try {
    const buffer = Buffer.from(cellValue, "base64");
    // Heuristic: check if buffer is a valid image (starts with PNG/JPEG header)
    if (buffer.slice(0, 2).toString("hex") === "ffd8") {
      return { buffer, mimeType: "image/jpeg" };
    }
    if (buffer.slice(0, 8).toString("hex") === "89504e470d0a1a0a") {
      return { buffer, mimeType: "image/png" };
    }
  } catch {
    return null;
  }

  return null;
}
