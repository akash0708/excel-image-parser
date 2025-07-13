import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ErrorMessage from "./ErrorMessage";

describe("ErrorMessage", () => {
  describe("Rendering", () => {
    it("renders error message when error is provided", () => {
      const errorText = "Something went wrong";
      render(<ErrorMessage error={errorText} />);

      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(errorText);
    });

    it("does not render when error is null", () => {
      render(<ErrorMessage error={null} />);

      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });

    it("does not render when error is empty string", () => {
      render(<ErrorMessage error="" />);

      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });

    it("does not render when error is whitespace only", () => {
      render(<ErrorMessage error="   " />);

      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies correct CSS classes", () => {
      render(<ErrorMessage error="Test error" />);

      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toHaveClass(
        "text-red-600",
        "text-sm",
        "text-center",
        "font-semibold",
        "mt-2"
      );
    });

    it("maintains consistent styling regardless of error length", () => {
      const shortError = "Error";
      const longError =
        "This is a very long error message that might wrap to multiple lines and should still maintain proper styling throughout the entire message";

      const { rerender } = render(<ErrorMessage error={shortError} />);
      let errorElement = screen.getByTestId("error-message");
      expect(errorElement).toHaveClass(
        "text-red-600",
        "text-sm",
        "text-center",
        "font-semibold",
        "mt-2"
      );

      rerender(<ErrorMessage error={longError} />);
      errorElement = screen.getByTestId("error-message");
      expect(errorElement).toHaveClass(
        "text-red-600",
        "text-sm",
        "text-center",
        "font-semibold",
        "mt-2"
      );
    });
  });

  describe("Content Display", () => {
    it("displays simple error messages", () => {
      const simpleError = "File not found";
      render(<ErrorMessage error={simpleError} />);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        simpleError
      );
    });

    it("displays complex error messages", () => {
      const complexError =
        "Failed to process file: Invalid format detected in cell A1";
      render(<ErrorMessage error={complexError} />);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        complexError
      );
    });

    it("displays error messages with special characters", () => {
      const specialCharsError =
        'Error: File "test & data.xlsx" couldn\'t be processed (code: 500)';
      render(<ErrorMessage error={specialCharsError} />);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        specialCharsError
      );
    });

    it("displays error messages with HTML-like content as plain text", () => {
      const htmlLikeError = '<script>alert("test")</script> Error occurred';
      render(<ErrorMessage error={htmlLikeError} />);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        htmlLikeError
      );
    });

    it("displays multiline error messages", () => {
      const multilineError = "Line 1 error\nLine 2 error\nLine 3 error";
      render(<ErrorMessage error={multilineError} />);

      // In DOM, newlines are rendered as spaces in text content
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Line 1 error Line 2 error Line 3 error"
      );
    });
  });

  describe("State Changes", () => {
    it("shows and hides error message when error prop changes", () => {
      const { rerender } = render(<ErrorMessage error={null} />);

      // Initially no error
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();

      // Error appears
      rerender(<ErrorMessage error="New error occurred" />);
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "New error occurred"
      );

      // Error disappears
      rerender(<ErrorMessage error={null} />);
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    });

    it("updates error message content when error prop changes", () => {
      const { rerender } = render(<ErrorMessage error="First error" />);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "First error"
      );

      rerender(<ErrorMessage error="Second error" />);
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Second error"
      );

      rerender(<ErrorMessage error="Third error" />);
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Third error"
      );
    });

    it("handles rapid error state changes", () => {
      const { rerender } = render(<ErrorMessage error="Error 1" />);

      expect(screen.getByTestId("error-message")).toHaveTextContent("Error 1");

      rerender(<ErrorMessage error={null} />);
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();

      rerender(<ErrorMessage error="Error 2" />);
      expect(screen.getByTestId("error-message")).toHaveTextContent("Error 2");

      rerender(<ErrorMessage error="" />);
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();

      rerender(<ErrorMessage error="Error 3" />);
      expect(screen.getByTestId("error-message")).toHaveTextContent("Error 3");
    });
  });

  describe("Accessibility", () => {
    it("is visible and readable when displayed", () => {
      render(<ErrorMessage error="Accessibility test error" />);

      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toBeVisible();
      expect(errorElement).toHaveTextContent("Accessibility test error");
    });

    it("provides proper semantic structure", () => {
      render(<ErrorMessage error="Semantic test" />);

      const errorElement = screen.getByTestId("error-message");
      expect(errorElement.tagName).toBe("DIV");
    });

    it("uses appropriate text styling for error visibility", () => {
      render(<ErrorMessage error="Visibility test" />);

      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toHaveClass("text-red-600"); // Red color for error visibility
      expect(errorElement).toHaveClass("font-semibold"); // Bold for emphasis
      expect(errorElement).toHaveClass("text-center"); // Centered for attention
    });
  });

  describe("Edge Cases", () => {
    it("handles very long error messages", () => {
      const longError =
        "This is an extremely long error message that might be generated by a server or system that provides very detailed error information including file paths, stack traces, and detailed explanations of what went wrong during the processing of the Excel file and why the image extraction failed";

      render(<ErrorMessage error={longError} />);

      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(longError);
    });

    it("handles numeric error codes as strings", () => {
      const numericError = "404";
      render(<ErrorMessage error={numericError} />);

      expect(screen.getByTestId("error-message")).toHaveTextContent("404");
    });

    it("handles error messages with only special characters", () => {
      const specialError = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      render(<ErrorMessage error={specialError} />);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        specialError
      );
    });

    it("handles Unicode characters in error messages", () => {
      const unicodeError =
        'Error: File "测试文件.xlsx" could not be processed 🚫';
      render(<ErrorMessage error={unicodeError} />);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        unicodeError
      );
    });
  });

  describe("Component Lifecycle", () => {
    it("maintains consistency across multiple renders with same error", () => {
      const error = "Consistent error message";
      const { rerender } = render(<ErrorMessage error={error} />);

      const initialElement = screen.getByTestId("error-message");
      const initialClass = initialElement.className;
      const initialContent = initialElement.textContent;

      rerender(<ErrorMessage error={error} />);

      const rerenderedElement = screen.getByTestId("error-message");
      expect(rerenderedElement.className).toBe(initialClass);
      expect(rerenderedElement.textContent).toBe(initialContent);
    });

    it("properly unmounts when error becomes null", () => {
      const { rerender, unmount } = render(<ErrorMessage error="Test error" />);

      expect(screen.getByTestId("error-message")).toBeInTheDocument();

      rerender(<ErrorMessage error={null} />);
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });
});
