import { extractBase64Image } from "./excel";

describe("extractBase64Image", () => {
  it("should extract image from data URI", () => {
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAUA"; // PNG header
    const dataUri = `data:image/png;base64,${base64}`;
    const result = extractBase64Image(dataUri);
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe("image/png");
    expect(result?.buffer).toBeInstanceOf(Buffer);
  });

  it("should extract image from raw base64 JPEG", () => {
    // JPEG header: ffd8
    const jpegBase64 = Buffer.from([0xff, 0xd8, 0xff, 0xe0]).toString("base64");
    const result = extractBase64Image(jpegBase64);
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe("image/jpeg");
  });

  it("should extract image from raw base64 PNG", () => {
    // PNG header: 89504e470d0a1a0a
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const pngBase64 = pngHeader.toString("base64");
    const result = extractBase64Image(pngBase64);
    expect(result).not.toBeNull();
    expect(result?.mimeType).toBe("image/png");
  });

  it("should return null for non-base64 string", () => {
    expect(extractBase64Image("not base64")).toBeNull();
  });

  it("should return null for non-string input", () => {
    expect(extractBase64Image(12345)).toBeNull();
    expect(extractBase64Image(null)).toBeNull();
    expect(extractBase64Image(undefined)).toBeNull();
  });
});
