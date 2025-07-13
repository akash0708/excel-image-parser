import { compressImageToUnder50KB } from "./image";
import fs from "fs";
import path from "path";
import sharp from "sharp";

describe("compressImageToUnder50KB", () => {
  it("should compress a sample image buffer to under 50KB", async () => {
    // Use a small sample image from the public directory
    const samplePath = path.join(__dirname, "../../public/vercel.svg");
    const imageBuffer = fs.readFileSync(samplePath);

    // Convert SVG to PNG buffer using sharp (since sharp can't compress SVG directly)
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();

    const compressed = await compressImageToUnder50KB(pngBuffer);
    expect(compressed.length).toBeLessThanOrEqual(50 * 1024);
  });

  it("should throw if image cannot be compressed below 50KB", async () => {
    // Create a large buffer of random data (not a real image)
    const largeBuffer = Buffer.alloc(200 * 1024, 255);
    await expect(compressImageToUnder50KB(largeBuffer)).rejects.toThrow();
  });
});
