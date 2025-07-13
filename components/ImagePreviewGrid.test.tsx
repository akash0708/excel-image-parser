import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImagePreviewGrid from "./ImagePreviewGrid";

// Mock image data for testing
const mockImages = [
  { name: "image1.png", preview: "data:image/png;base64,mockdata1" },
  { name: "image2.jpg", preview: "data:image/jpeg;base64,mockdata2" },
  { name: "image3.gif", preview: "data:image/gif;base64,mockdata3" },
];

describe("ImagePreviewGrid", () => {
  const mockOnNameChange = jest.fn();
  const mockOnDownload = jest.fn();

  const defaultProps = {
    images: mockImages,
    editedNames: {},
    loading: false,
    downloadReady: true,
    isClient: true,
    onNameChange: mockOnNameChange,
    onDownload: mockOnDownload,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders image preview grid with images", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      expect(screen.getByTestId("image-preview-grid")).toBeInTheDocument();
      expect(screen.getByText("Images to be extracted:")).toBeInTheDocument();
      expect(screen.getByTestId("images-grid")).toBeInTheDocument();
      expect(screen.getByTestId("download-button")).toBeInTheDocument();
    });

    it("renders all provided images", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      mockImages.forEach((img) => {
        expect(
          screen.getByTestId(`image-item-${img.name}`)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(`image-preview-${img.name}`)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(`name-input-${img.name}`)
        ).toBeInTheDocument();
      });
    });

    it("does not render when no images provided", () => {
      render(<ImagePreviewGrid {...defaultProps} images={[]} />);

      expect(
        screen.queryByTestId("image-preview-grid")
      ).not.toBeInTheDocument();
    });

    it("does not render when images is null", () => {
      const propsWithNullImages = {
        ...defaultProps,
        images: null as unknown as typeof defaultProps.images,
      };
      render(<ImagePreviewGrid {...propsWithNullImages} />);

      expect(
        screen.queryByTestId("image-preview-grid")
      ).not.toBeInTheDocument();
    });
  });

  describe("Image Display", () => {
    it("displays images with correct src and alt attributes", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      mockImages.forEach((img) => {
        const imageElement = screen.getByTestId(`image-preview-${img.name}`);
        expect(imageElement).toHaveAttribute("src", img.preview);
        expect(imageElement).toHaveAttribute("alt", img.name);
      });
    });

    it("applies correct CSS classes to images", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      const imageElement = screen.getByTestId(
        `image-preview-${mockImages[0].name}`
      );
      expect(imageElement).toHaveClass(
        "w-16",
        "h-16",
        "object-contain",
        "rounded",
        "border",
        "border-gray-200",
        "bg-white",
        "mb-1",
        "shadow-sm"
      );
    });
  });

  describe("Name Editing", () => {
    it("displays original names in input fields", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      mockImages.forEach((img) => {
        const nameInput = screen.getByTestId(`name-input-${img.name}`);
        expect(nameInput).toHaveValue(img.name);
      });
    });

    it("displays edited names when provided", () => {
      const editedNames = {
        "image1.png": "new-name1.png",
        "image2.jpg": "new-name2.jpg",
      };

      render(<ImagePreviewGrid {...defaultProps} editedNames={editedNames} />);

      expect(screen.getByTestId("name-input-image1.png")).toHaveValue(
        "new-name1.png"
      );
      expect(screen.getByTestId("name-input-image2.jpg")).toHaveValue(
        "new-name2.jpg"
      );
      expect(screen.getByTestId("name-input-image3.gif")).toHaveValue(
        "image3.gif"
      ); // unchanged
    });

    it("calls onNameChange when input value changes", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      const nameInput = screen.getByTestId("name-input-image1.png");
      fireEvent.change(nameInput, { target: { value: "new-filename.png" } });

      expect(mockOnNameChange).toHaveBeenCalledWith(
        "image1.png",
        "new-filename.png"
      );
    });

    it("disables name inputs when loading", () => {
      render(<ImagePreviewGrid {...defaultProps} loading={true} />);

      mockImages.forEach((img) => {
        const nameInput = screen.getByTestId(`name-input-${img.name}`);
        expect(nameInput).toBeDisabled();
      });
    });

    it("has correct placeholder text", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      const nameInput = screen.getByTestId("name-input-image1.png");
      expect(nameInput).toHaveAttribute("placeholder", "Enter filename");
    });
  });

  describe("Download Button", () => {
    it("renders download button with correct text", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      const downloadButton = screen.getByTestId("download-button");
      expect(downloadButton).toHaveTextContent("Download ZIP");
    });

    it("shows downloading text when loading", () => {
      render(<ImagePreviewGrid {...defaultProps} loading={true} />);

      const downloadButton = screen.getByTestId("download-button");
      expect(downloadButton).toHaveTextContent("Downloading...");
    });

    it("calls onDownload when clicked", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      const downloadButton = screen.getByTestId("download-button");
      fireEvent.click(downloadButton);

      expect(mockOnDownload).toHaveBeenCalledTimes(1);
    });

    it("is disabled when not download ready", () => {
      render(<ImagePreviewGrid {...defaultProps} downloadReady={false} />);

      const downloadButton = screen.getByTestId("download-button");
      expect(downloadButton).toBeDisabled();
    });

    it("is disabled when loading", () => {
      render(<ImagePreviewGrid {...defaultProps} loading={true} />);

      const downloadButton = screen.getByTestId("download-button");
      expect(downloadButton).toBeDisabled();
    });

    it("is disabled when not client-side", () => {
      render(<ImagePreviewGrid {...defaultProps} isClient={false} />);

      const downloadButton = screen.getByTestId("download-button");
      expect(downloadButton).toBeDisabled();
    });

    it("is enabled when all conditions are met", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      const downloadButton = screen.getByTestId("download-button");
      expect(downloadButton).not.toBeDisabled();
    });
  });

  describe("Grid Layout", () => {
    it("applies correct CSS classes to grid container", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      const gridContainer = screen.getByTestId("images-grid");
      expect(gridContainer).toHaveClass(
        "grid",
        "grid-cols-3",
        "gap-4",
        "max-h-60",
        "overflow-y-auto"
      );
    });

    it("applies correct CSS classes to main container", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      const mainContainer = screen.getByTestId("image-preview-grid");
      expect(mainContainer).toHaveClass(
        "bg-gray-50",
        "border",
        "border-gray-300",
        "rounded-lg",
        "p-4",
        "mt-2"
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper accessibility attributes", () => {
      render(<ImagePreviewGrid {...defaultProps} />);

      // Check that images have alt text
      mockImages.forEach((img) => {
        const imageElement = screen.getByTestId(`image-preview-${img.name}`);
        expect(imageElement).toHaveAttribute("alt", img.name);
      });

      // Check that inputs have proper type
      mockImages.forEach((img) => {
        const nameInput = screen.getByTestId(`name-input-${img.name}`);
        expect(nameInput).toHaveAttribute("type", "text");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles special characters in image names", () => {
      const specialImages = [
        {
          name: "image with spaces.png",
          preview: "data:image/png;base64,test",
        },
        {
          name: "image-with-dashes.jpg",
          preview: "data:image/jpeg;base64,test",
        },
        {
          name: "image_with_underscores.gif",
          preview: "data:image/gif;base64,test",
        },
      ];

      render(<ImagePreviewGrid {...defaultProps} images={specialImages} />);

      specialImages.forEach((img) => {
        expect(
          screen.getByTestId(`image-item-${img.name}`)
        ).toBeInTheDocument();
        expect(screen.getByTestId(`name-input-${img.name}`)).toHaveValue(
          img.name
        );
      });
    });

    it("handles large number of images", () => {
      const manyImages = Array.from({ length: 20 }, (_, i) => ({
        name: `image${i + 1}.png`,
        preview: `data:image/png;base64,mockdata${i + 1}`,
      }));

      render(<ImagePreviewGrid {...defaultProps} images={manyImages} />);

      // Should render all images
      expect(screen.getAllByTestId(/^image-item-/)).toHaveLength(20);

      // Grid should have overflow scroll
      const gridContainer = screen.getByTestId("images-grid");
      expect(gridContainer).toHaveClass("overflow-y-auto");
    });
  });
});
