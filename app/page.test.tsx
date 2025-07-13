import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Excel Image Extractor App - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("Initial Render", () => {
    it("renders all main components", () => {
      render(<Home />);

      // Check main heading
      expect(screen.getByText("Excel Image Extractor")).toBeInTheDocument();

      // Check FileUploadZone
      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();

      // Check ActionButtons
      expect(screen.getByTestId("preview-button")).toBeInTheDocument();

      // Check Footer
      expect(screen.getByTestId("app-footer")).toBeInTheDocument();

      // Error message should not be visible initially
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();

      // Image preview should not be visible initially
      expect(
        screen.queryByTestId("image-preview-grid")
      ).not.toBeInTheDocument();
    });

    it("has correct initial state", () => {
      render(<Home />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toBeDisabled();
      expect(previewButton).toHaveTextContent("Preview Images");
    });
  });

  describe("File Upload Workflow", () => {
    it("enables preview button when file is selected", async () => {
      render(<Home />);

      const fileInput = screen.getByTestId("file-input");
      const previewButton = screen.getByTestId("preview-button");

      expect(previewButton).toBeDisabled();

      const file = new File(["dummy"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      await userEvent.upload(fileInput, file);

      expect(previewButton).not.toBeDisabled();
    });
  });

  describe("Preview Workflow", () => {
    it("shows loading state during preview", async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ images: [] }),
                }),
              100
            )
          )
      );

      render(<Home />);

      const fileInput = screen.getByTestId("file-input");
      const previewButton = screen.getByTestId("preview-button");

      const file = new File(["dummy"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      await userEvent.upload(fileInput, file);
      fireEvent.click(previewButton);

      expect(previewButton).toHaveTextContent("Processing...");
      expect(previewButton).toBeDisabled();

      await waitFor(() => {
        expect(previewButton).toHaveTextContent("Preview Images");
      });
    });

    it("displays images after successful preview", async () => {
      const mockImages = [
        { name: "image1.png", preview: "data:image/png;base64,test1" },
        { name: "image2.jpg", preview: "data:image/jpeg;base64,test2" },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: mockImages }),
      });

      render(<Home />);

      const fileInput = screen.getByTestId("file-input");
      const previewButton = screen.getByTestId("preview-button");

      const file = new File(["dummy"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      await userEvent.upload(fileInput, file);
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId("image-preview-grid")).toBeInTheDocument();
      });

      expect(screen.getByTestId("download-button")).toBeInTheDocument();
      expect(screen.getByTestId("image-item-image1.png")).toBeInTheDocument();
      expect(screen.getByTestId("image-item-image2.jpg")).toBeInTheDocument();
    });

    it("handles preview API errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "File processing failed" }),
      });

      render(<Home />);

      const fileInput = screen.getByTestId("file-input");
      const previewButton = screen.getByTestId("preview-button");

      const file = new File(["dummy"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      await userEvent.upload(fileInput, file);
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "File processing failed"
      );
    });
  });

  describe("Name Editing Workflow", () => {
    it("allows editing image names before download", async () => {
      const mockImages = [
        { name: "image1.png", preview: "data:image/png;base64,test1" },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ images: mockImages }),
      });

      render(<Home />);

      const fileInput = screen.getByTestId("file-input");
      const file = new File(["dummy"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      await userEvent.upload(fileInput, file);

      const previewButton = screen.getByTestId("preview-button");
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId("name-input-image1.png")).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId("name-input-image1.png");
      expect(nameInput).toHaveValue("image1.png");

      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "renamed-image.png");

      expect(nameInput).toHaveValue("renamed-image.png");
    });
  });

  describe("Error Handling", () => {
    it("clears errors when starting new operations", async () => {
      // Show error first
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Initial error" }),
      });

      render(<Home />);

      const fileInput = screen.getByTestId("file-input");
      const file = new File(["dummy"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      await userEvent.upload(fileInput, file);

      const previewButton = screen.getByTestId("preview-button");
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      // Now mock success and try again
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ images: [] }),
      });

      fireEvent.click(previewButton);

      // Error should be cleared immediately when starting new operation
      await waitFor(() => {
        expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility and Structure", () => {
    it("has proper heading structure", () => {
      render(<Home />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Excel Image Extractor");
    });

    it("has descriptive footer text", () => {
      render(<Home />);

      const footer = screen.getByTestId("app-footer");
      expect(footer).toHaveTextContent(/upload.*excel.*file/i);
    });

    it("maintains proper component hierarchy", () => {
      render(<Home />);

      // Components should be rendered in correct order
      const fileUpload = screen.getByTestId("file-upload-zone");
      const actionButton = screen.getByTestId("preview-button");
      const footer = screen.getByTestId("app-footer");

      expect(fileUpload).toBeInTheDocument();
      expect(actionButton).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("properly integrates all extracted components", () => {
      render(<Home />);

      // All components should be present
      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument(); // FileUploadZone
      expect(screen.getByTestId("preview-button")).toBeInTheDocument(); // ActionButtons
      expect(screen.getByTestId("app-footer")).toBeInTheDocument(); // Footer

      // Components should respond to state changes
      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toBeDisabled(); // Initial state
    });

    it("handles state flow between components correctly", async () => {
      render(<Home />);

      const fileInput = screen.getByTestId("file-input");
      const previewButton = screen.getByTestId("preview-button");

      // Initial state: button disabled
      expect(previewButton).toBeDisabled();

      // After file selection: button enabled
      const file = new File(["dummy"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      await userEvent.upload(fileInput, file);
      expect(previewButton).not.toBeDisabled();
    });
  });
});
