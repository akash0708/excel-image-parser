import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "./Footer";

describe("Footer", () => {
  describe("Rendering", () => {
    it("renders footer with correct text", () => {
      render(<Footer />);

      const footer = screen.getByTestId("app-footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveTextContent(
        "Upload an Excel (.xlsx) file with images in cells or embedded. Images will be extracted, compressed, and returned as a ZIP."
      );
    });

    it("is always visible", () => {
      render(<Footer />);

      const footer = screen.getByTestId("app-footer");
      expect(footer).toBeVisible();
    });
  });

  describe("Styling", () => {
    it("applies correct CSS classes", () => {
      render(<Footer />);

      const footer = screen.getByTestId("app-footer");
      expect(footer).toHaveClass(
        "text-xs",
        "text-gray-500",
        "mt-2",
        "text-center"
      );
    });
  });

  describe("Accessibility", () => {
    it("provides informative content", () => {
      render(<Footer />);

      const footer = screen.getByTestId("app-footer");
      expect(footer).toHaveTextContent(/upload.*excel/i);
      expect(footer).toHaveTextContent(/images.*extracted/i);
      expect(footer).toHaveTextContent(/zip/i);
    });

    it("has proper semantic structure", () => {
      render(<Footer />);

      const footer = screen.getByTestId("app-footer");
      expect(footer.tagName).toBe("DIV");
    });
  });

  describe("Content", () => {
    it("mentions supported file format", () => {
      render(<Footer />);

      const footer = screen.getByTestId("app-footer");
      expect(footer).toHaveTextContent(".xlsx");
    });

    it("explains the extraction process", () => {
      render(<Footer />);

      const footer = screen.getByTestId("app-footer");
      expect(footer).toHaveTextContent("extracted");
      expect(footer).toHaveTextContent("compressed");
    });

    it("mentions output format", () => {
      render(<Footer />);

      const footer = screen.getByTestId("app-footer");
      expect(footer).toHaveTextContent("ZIP");
    });
  });

  describe("Consistency", () => {
    it("renders consistently across multiple renders", () => {
      const { rerender } = render(<Footer />);

      const initialFooter = screen.getByTestId("app-footer");
      const initialText = initialFooter.textContent;
      const initialClasses = initialFooter.className;

      rerender(<Footer />);

      const rerenderedFooter = screen.getByTestId("app-footer");
      expect(rerenderedFooter.textContent).toBe(initialText);
      expect(rerenderedFooter.className).toBe(initialClasses);
    });
  });
});
