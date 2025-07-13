import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ActionButtons from "./ActionButtons";

describe("ActionButtons", () => {
  const mockOnPreview = jest.fn();

  const defaultProps = {
    file: new File(["dummy"], "test.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    loading: false,
    onPreview: mockOnPreview,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders preview button", () => {
      render(<ActionButtons {...defaultProps} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toBeInTheDocument();
      expect(previewButton).toHaveTextContent("Preview Images");
    });

    it("has correct button role and type", () => {
      render(<ActionButtons {...defaultProps} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toHaveAttribute("type", "button");
      expect(previewButton.tagName).toBe("BUTTON");
    });
  });

  describe("Button States", () => {
    it("is enabled when file is selected and not loading", () => {
      render(<ActionButtons {...defaultProps} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).not.toBeDisabled();
    });

    it("is disabled when no file is selected", () => {
      render(<ActionButtons {...defaultProps} file={null} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toBeDisabled();
    });

    it("is disabled when loading", () => {
      render(<ActionButtons {...defaultProps} loading={true} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toBeDisabled();
    });

    it("is disabled when both no file and loading", () => {
      render(<ActionButtons {...defaultProps} file={null} loading={true} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toBeDisabled();
    });
  });

  describe("Button Text", () => {
    it('shows "Preview Images" when not loading', () => {
      render(<ActionButtons {...defaultProps} loading={false} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toHaveTextContent("Preview Images");
    });

    it('shows "Processing..." when loading', () => {
      render(<ActionButtons {...defaultProps} loading={true} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toHaveTextContent("Processing...");
    });

    it("shows loading text even when no file selected", () => {
      render(<ActionButtons {...defaultProps} file={null} loading={true} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toHaveTextContent("Processing...");
    });
  });

  describe("Click Handling", () => {
    it("calls onPreview when clicked and enabled", () => {
      render(<ActionButtons {...defaultProps} />);

      const previewButton = screen.getByTestId("preview-button");
      fireEvent.click(previewButton);

      expect(mockOnPreview).toHaveBeenCalledTimes(1);
    });

    it("does not call onPreview when disabled due to no file", () => {
      render(<ActionButtons {...defaultProps} file={null} />);

      const previewButton = screen.getByTestId("preview-button");
      fireEvent.click(previewButton);

      expect(mockOnPreview).not.toHaveBeenCalled();
    });

    it("does not call onPreview when disabled due to loading", () => {
      render(<ActionButtons {...defaultProps} loading={true} />);

      const previewButton = screen.getByTestId("preview-button");
      fireEvent.click(previewButton);

      expect(mockOnPreview).not.toHaveBeenCalled();
    });

    it("allows multiple clicks when enabled", () => {
      render(<ActionButtons {...defaultProps} />);

      const previewButton = screen.getByTestId("preview-button");
      fireEvent.click(previewButton);
      fireEvent.click(previewButton);
      fireEvent.click(previewButton);

      expect(mockOnPreview).toHaveBeenCalledTimes(3);
    });
  });

  describe("Styling", () => {
    it("applies correct CSS classes", () => {
      render(<ActionButtons {...defaultProps} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toHaveClass(
        "bg-blue-600",
        "text-white",
        "text-base",
        "font-semibold",
        "px-4",
        "py-2",
        "rounded-lg",
        "hover:bg-blue-700",
        "transition",
        "disabled:opacity-50",
        "w-full",
        "shadow"
      );
    });

    it("maintains styling when disabled", () => {
      render(<ActionButtons {...defaultProps} file={null} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toHaveClass(
        "bg-blue-600",
        "text-white",
        "text-base",
        "font-semibold",
        "px-4",
        "py-2",
        "rounded-lg",
        "hover:bg-blue-700",
        "transition",
        "disabled:opacity-50",
        "w-full",
        "shadow"
      );
    });

    it("maintains styling when loading", () => {
      render(<ActionButtons {...defaultProps} loading={true} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toHaveClass(
        "bg-blue-600",
        "text-white",
        "text-base",
        "font-semibold",
        "px-4",
        "py-2",
        "rounded-lg",
        "hover:bg-blue-700",
        "transition",
        "disabled:opacity-50",
        "w-full",
        "shadow"
      );
    });
  });

  describe("File Types", () => {
    it("works with different file types", () => {
      const xlsxFile = new File(["dummy"], "test.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const xlsFile = new File(["dummy"], "test.xls", {
        type: "application/vnd.ms-excel",
      });

      const { rerender } = render(
        <ActionButtons {...defaultProps} file={xlsxFile} />
      );
      expect(screen.getByTestId("preview-button")).not.toBeDisabled();

      rerender(<ActionButtons {...defaultProps} file={xlsFile} />);
      expect(screen.getByTestId("preview-button")).not.toBeDisabled();
    });

    it("handles files with different names", () => {
      const files = [
        new File(["dummy"], "test-file.xlsx", {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        new File(["dummy"], "another_file.xlsx", {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        new File(["dummy"], "file with spaces.xlsx", {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      ];

      files.forEach((file) => {
        const { rerender } = render(
          <ActionButtons {...defaultProps} file={file} />
        );
        expect(screen.getByTestId("preview-button")).not.toBeDisabled();
        rerender(<div />); // Clear render
      });
    });
  });

  describe("Accessibility", () => {
    it("is keyboard accessible", () => {
      render(<ActionButtons {...defaultProps} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toBeVisible();

      // Button should be focusable
      previewButton.focus();
      expect(previewButton).toHaveFocus();
    });

    it("has proper button semantics", () => {
      render(<ActionButtons {...defaultProps} />);

      const previewButton = screen.getByTestId("preview-button");
      expect(previewButton).toHaveAttribute("type", "button");
      expect(previewButton.tagName).toBe("BUTTON");
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid state changes", () => {
      const { rerender } = render(
        <ActionButtons {...defaultProps} loading={false} />
      );

      // Should be enabled initially
      expect(screen.getByTestId("preview-button")).not.toBeDisabled();

      // Quick toggle to loading
      rerender(<ActionButtons {...defaultProps} loading={true} />);
      expect(screen.getByTestId("preview-button")).toBeDisabled();
      expect(screen.getByTestId("preview-button")).toHaveTextContent(
        "Processing..."
      );

      // Quick toggle back
      rerender(<ActionButtons {...defaultProps} loading={false} />);
      expect(screen.getByTestId("preview-button")).not.toBeDisabled();
      expect(screen.getByTestId("preview-button")).toHaveTextContent(
        "Preview Images"
      );
    });

    it("maintains functionality after multiple prop changes", () => {
      const { rerender } = render(<ActionButtons {...defaultProps} />);

      // Initial state
      fireEvent.click(screen.getByTestId("preview-button"));
      expect(mockOnPreview).toHaveBeenCalledTimes(1);

      // Change to loading
      rerender(<ActionButtons {...defaultProps} loading={true} />);
      fireEvent.click(screen.getByTestId("preview-button"));
      expect(mockOnPreview).toHaveBeenCalledTimes(1); // Should not increase

      // Change back to enabled
      rerender(<ActionButtons {...defaultProps} loading={false} />);
      fireEvent.click(screen.getByTestId("preview-button"));
      expect(mockOnPreview).toHaveBeenCalledTimes(2); // Should increase
    });
  });
});
