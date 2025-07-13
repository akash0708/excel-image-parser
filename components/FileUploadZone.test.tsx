import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUploadZone from "./FileUploadZone";

// Mock file for testing
const createMockFile = (
  name: string,
  type: string = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
) => {
  return new File(["mock content"], name, { type });
};

describe("FileUploadZone", () => {
  const mockOnFileSelect = jest.fn();
  const mockOnError = jest.fn();

  const defaultProps = {
    file: null,
    loading: false,
    onFileSelect: mockOnFileSelect,
    onError: mockOnError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("renders upload zone with initial state", () => {
      render(<FileUploadZone {...defaultProps} />);

      expect(screen.getByTestId("file-upload-zone")).toBeInTheDocument();
      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
      expect(screen.getByTestId("upload-text")).toHaveTextContent(
        "Drag & drop your Excel file here"
      );
      expect(
        screen.getByText("or click to select (.xlsx files only)")
      ).toBeInTheDocument();
    });

    it("has correct accessibility attributes", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveAttribute(
        "aria-label",
        "Upload Excel file by clicking or dragging and dropping"
      );
      expect(uploadZone).toHaveAttribute("type", "button");
    });
  });

  describe("File Selection via Click", () => {
    it("opens file dialog when clicked", () => {
      const mockClick = jest.fn();
      render(<FileUploadZone {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      fileInput.click = mockClick;

      fireEvent.click(screen.getByTestId("file-upload-zone"));
      expect(mockClick).toHaveBeenCalled();
    });

    it("calls onFileSelect with valid .xlsx file", () => {
      render(<FileUploadZone {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      const validFile = createMockFile("test.xlsx");

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
      expect(mockOnError).toHaveBeenCalledWith(""); // Clear errors
    });

    it("calls onError with invalid file type", () => {
      render(<FileUploadZone {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      const invalidFile = createMockFile("test.pdf", "application/pdf");

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(
        "Please select a valid .xlsx file"
      );
    });
  });

  describe("Drag and Drop", () => {
    it("shows dragging state when file is dragged over", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");

      fireEvent.dragEnter(uploadZone);

      expect(screen.getByTestId("dragging-icon")).toBeInTheDocument();
      expect(screen.getByTestId("drop-text")).toHaveTextContent(
        "Drop your Excel file here"
      );
    });

    it("handles drag over event", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");

      // Just test that drag over doesn't cause any errors
      expect(() => {
        fireEvent.dragOver(uploadZone);
      }).not.toThrow();
    });

    it("handles drag leave event", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");

      fireEvent.dragEnter(uploadZone);
      expect(screen.getByTestId("dragging-icon")).toBeInTheDocument();

      fireEvent.dragLeave(uploadZone);
      expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
    });

    it("handles drop with valid file", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      const validFile = createMockFile("test.xlsx");

      fireEvent.dragEnter(uploadZone);
      fireEvent.drop(uploadZone, {
        dataTransfer: {
          files: [validFile],
        },
      });

      expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
      expect(mockOnError).toHaveBeenCalledWith("");
    });

    it("handles drop with invalid file", () => {
      render(<FileUploadZone {...defaultProps} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      const invalidFile = createMockFile("test.pdf");

      fireEvent.drop(uploadZone, {
        dataTransfer: {
          files: [invalidFile],
        },
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(
        "Please select a valid .xlsx file"
      );
    });
  });

  describe("File Selected State", () => {
    const selectedFile = createMockFile("selected-file.xlsx");

    it("shows file selected state", () => {
      render(<FileUploadZone {...defaultProps} file={selectedFile} />);

      expect(screen.getByTestId("success-icon")).toBeInTheDocument();
      expect(screen.getByTestId("file-name")).toHaveTextContent(
        "selected-file.xlsx"
      );
      expect(screen.getByText("Click to change file")).toBeInTheDocument();
    });

    it("allows changing file when one is already selected", () => {
      render(<FileUploadZone {...defaultProps} file={selectedFile} />);

      const fileInput = screen.getByTestId("file-input");
      const newFile = createMockFile("new-file.xlsx");

      fireEvent.change(fileInput, { target: { files: [newFile] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(newFile);
    });
  });

  describe("Loading State", () => {
    it("disables interaction when loading", () => {
      render(<FileUploadZone {...defaultProps} loading={true} />);

      const uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toBeDisabled();
      expect(uploadZone).toHaveClass("pointer-events-none", "opacity-50");
    });

    it("disables file input when loading", () => {
      render(<FileUploadZone {...defaultProps} loading={true} />);

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toBeDisabled();
    });
  });

  describe("Styling", () => {
    it("applies correct styles for different states", () => {
      const { rerender } = render(<FileUploadZone {...defaultProps} />);

      // Default state
      let uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveClass("border-gray-300", "bg-gray-50");

      // Dragging state - need to trigger drag enter first
      fireEvent.dragEnter(uploadZone);
      expect(uploadZone).toHaveClass("border-blue-500", "bg-blue-50");

      // Reset dragging state
      fireEvent.dragLeave(uploadZone);

      // File selected state
      const selectedFile = createMockFile("test.xlsx");
      rerender(<FileUploadZone {...defaultProps} file={selectedFile} />);
      uploadZone = screen.getByTestId("file-upload-zone");
      expect(uploadZone).toHaveClass("border-green-500", "bg-green-50");
    });
  });
});
