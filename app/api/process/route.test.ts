// TODO: Implement proper tests for the API route
// import { POST } from "./route";
// import { NextRequest } from "next/server";

describe("API Route: /api/process", () => {
  it("should return a ZIP file for a valid .xlsx upload", async () => {
    // TODO: Mock a valid .xlsx file upload with images
    // const req = ...
    // const res = await POST(req);
    // expect(res.status).toBe(200);
    // expect(res.headers.get('content-type')).toBe('application/zip');
  });

  it("should return 400 for invalid file type", async () => {
    // TODO: Mock an invalid file type upload
    // const req = ...
    // const res = await POST(req);
    // expect(res.status).toBe(400);
  });

  it("should return 422 if no images are found in the file", async () => {
    // TODO: Mock a valid .xlsx file with no images
    // const req = ...
    // const res = await POST(req);
    // expect(res.status).toBe(422);
  });
});
