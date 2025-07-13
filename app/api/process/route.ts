import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import {
  compressImageToUnder50KB,
  generateThumbnailBase64,
} from "../../utils/image";
import { extractBase64Image } from "../../utils/excel";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  let fileName = "";
  try {
    console.log("[API] POST /api/process - start");
    const url = new URL(req.url);
    const isPreview = url.searchParams.get("preview") === "1";
    // 1. Parse upload using formData
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      console.log("[API] No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    fileName =
      typeof (file as File & { name?: string })?.name === "string"
        ? (file as File & { name?: string }).name!
        : "uploaded.xlsx";
    if (!fileName.endsWith(".xlsx")) {
      console.log("[API] Invalid file type");
      return NextResponse.json(
        { error: "Only .xlsx files are supported." },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    console.log("[API] File read, size:", fileBuffer.length);

    // Parse name mapping if present
    let nameMapping: Record<string, string> = {};
    const nameMappingRaw = formData.get("nameMapping");
    if (typeof nameMappingRaw === "string") {
      try {
        nameMapping = JSON.parse(nameMappingRaw);
      } catch {}
    }

    // 2. Read workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer); // Use ArrayBuffer directly
    console.log("[API] Workbook loaded");
    const zip = new JSZip();
    const imageNames: string[] = [];
    const imagePreviews: { name: string; preview: string }[] = [];
    // Track used names to handle duplicates
    const usedNames = new Map<string, number>();
    function getUniqueName(base: string): string {
      const extMatch = base.match(/(.*)(\.[^.]+)$/);
      let name = base;
      if (extMatch) {
        const [, baseName, ext] = extMatch;
        const count = usedNames.get(baseName) || 0;
        if (count > 0) {
          name = `${baseName}_${count + 1}${ext}`;
        }
        usedNames.set(baseName, count + 1);
      } else {
        const count = usedNames.get(base) || 0;
        if (count > 0) {
          name = `${base}_${count + 1}`;
        }
        usedNames.set(base, count + 1);
      }
      return name;
    }

    // 3. Extract embedded images
    for (const sheet of workbook.worksheets) {
      // Find column indices for 'Name' or 'Emp Name'
      const headerRow = sheet.getRow(1);
      let empNameColIdx: number | null = null;
      let nameColIdx: number | null = null;
      headerRow.eachCell((cell, colIdx) => {
        const header = cell.text.toLowerCase();
        console.log(`[API] Header: ${header}`);
        if (header === "emp name") empNameColIdx = colIdx;
        if (header === "name") nameColIdx = colIdx;
      });
      console.log(
        `[API] Sheet: ${sheet.name} - EmpNameColIdx: ${empNameColIdx}, NameColIdx: ${nameColIdx}`
      );
      for (const img of sheet.getImages()) {
        const imageId =
          typeof img.imageId === "string"
            ? parseInt(img.imageId, 10)
            : img.imageId;
        const excelImg = workbook.getImage(imageId);

        let buffer: Buffer | undefined;
        const ext = "jpg";

        if (excelImg.buffer) {
          buffer = excelImg.buffer as unknown as Buffer;
        } else if (excelImg.base64) {
          buffer = Buffer.from(excelImg.base64, "base64");
        }

        if (!buffer) continue;

        // Get the row number where the image is visually placed (ExcelJS is 0-based, getRow is 1-based)
        const rowNum = (img.range?.tl?.row ?? 1) + 1;
        let baseName: string | null = null;

        if (rowNum > 1) {
          const row = sheet.getRow(rowNum);

          if (empNameColIdx && empNameColIdx > 0) {
            const val = row.getCell(empNameColIdx).value;
            if (val && String(val).trim()) {
              baseName = String(val).trim();
              console.log(
                `[API] Embedded image Row ${rowNum}: Emp Name: ${baseName}`
              );
            }
          }

          if (!baseName && nameColIdx && nameColIdx > 0) {
            const val = row.getCell(nameColIdx).value;
            if (val && String(val).trim()) {
              baseName = String(val).trim();
              console.log(
                `[API] Embedded image Row ${rowNum}: Name: ${baseName}`
              );
            }
          }
        }

        // Fallback to row-based name if no "Emp Name" found
        const defaultName = baseName
          ? `${baseName}.${ext}`
          : `row_${rowNum || "x"}.${ext}`;
        const name = getUniqueName(defaultName);

        imageNames.push(name);

        if (!isPreview) {
          try {
            const compressed = await compressImageToUnder50KB(buffer);
            zip.file(name, compressed);
          } catch (e) {
            console.error("[API] Error compressing embedded image:", e);
          }
        } else {
          try {
            const preview = await generateThumbnailBase64(buffer);
            imagePreviews.push({ name, preview });
          } catch (e) {
            console.error("[API] Error generating embedded image preview:", e);
          }
        }
      }
      // 4. Extract base64 images from cells
      const cellPreviewPromises: Promise<void>[] = [];
      // Iterate over each row in the worksheet
      sheet.eachRow((row, rowNum) => {
        // Iterate over each cell in the current row
        row.eachCell((cell: ExcelJS.Cell, colNum: number) => {
          // Get the header (column name) for the current column, from the first row
          const header = sheet
            .getRow(1)
            .getCell(Number(colNum))
            .text.toLowerCase();

          // Check if the header indicates this column contains image data
          if (header.includes("photo") || header.includes("image")) {
            // Try to extract a base64 image from the cell value
            const result = extractBase64Image(cell.value);
            console.log(`[API] Row ${rowNum}: Found result: ${result}`);

            if (result) {
              // Compose the original default name for the image (e.g., cell_2_3.jpg)
              const origName = `cell_${rowNum}_${colNum}.${
                result.mimeType.split("/")[1]
              }`;

              // Log the Emp Name column index for debugging
              console.log(
                `[API] Row ${rowNum}: Found Emp Name: ${empNameColIdx}`
              );

              // Try to get the value from the 'Emp Name' or 'Name' column in this row, if it exists
              let baseName = null;
              if (empNameColIdx && empNameColIdx > 0) {
                const val = row.getCell(empNameColIdx).value;
                if (val && String(val).trim()) {
                  baseName = String(val).trim();
                  console.log(
                    `[API] Row ${rowNum}: Found Emp Name: ${baseName}`
                  );
                }
              }
              if (!baseName && nameColIdx && nameColIdx > 0) {
                const val = row.getCell(nameColIdx).value;
                if (val && String(val).trim()) {
                  baseName = String(val).trim();
                  console.log(`[API] Row ${rowNum}: Found Name: ${baseName}`);
                }
              }

              // Determine the file extension from the MIME type
              const ext = result.mimeType.split("/")[1];

              // If a base name was found, use it as the default name; otherwise, use the original name
              const defaultName = baseName ? `${baseName}.${ext}` : origName;

              // Use the name mapping if provided, otherwise use the default name, and ensure uniqueness
              const name = getUniqueName(
                nameMapping[origName]?.trim() || defaultName
              );
              console.log(`[API] Row ${rowNum}: Final image name: ${name}`);

              // Add the name to the list of image names
              imageNames.push(name);

              if (!isPreview) {
                // If not in preview mode, compress the image and add it to the ZIP archive
                cellPreviewPromises.push(
                  compressImageToUnder50KB(result.buffer as Buffer)
                    .then((compressed) => {
                      zip.file(name, compressed);
                    })
                    .catch((e) => {
                      console.error("[API] Error compressing cell image:", e);
                    })
                );
              } else {
                // If in preview mode, generate a thumbnail and add it to the preview list
                cellPreviewPromises.push(
                  generateThumbnailBase64(result.buffer as Buffer)
                    .then((preview) => {
                      imagePreviews.push({ name, preview });
                    })
                    .catch((e) => {
                      console.error(
                        "[API] Error generating cell image preview:",
                        e
                      );
                    })
                );
              }
            }
          }
        });
      });
      await Promise.all(cellPreviewPromises);
    }

    if (imageNames.length === 0) {
      console.log("[API] No images found");
      return NextResponse.json(
        { error: "No images found in the uploaded file." },
        { status: 422 }
      );
    }

    if (isPreview) {
      return NextResponse.json({ images: imagePreviews }, { status: 200 });
    }

    // 5. Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    console.log("[API] ZIP generated, size:", zipBuffer.length);
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=images.zip",
      },
    });
  } catch (err: unknown) {
    console.error("[API] Error in POST /api/process:", err);
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message || "Processing failed" },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
