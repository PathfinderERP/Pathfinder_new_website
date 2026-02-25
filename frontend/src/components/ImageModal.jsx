// components/ImageModal.jsx
import React from "react";

const ImageModal = ({ imageUrl, alt, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition duration-200 z-10"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="bg-white rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={alt || "Image preview"}
            className="max-w-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
          />
        </div>

        {/* Download Button for Data URLs */}
        {imageUrl.startsWith("data:image") && (
          <div className="absolute bottom-4 right-4">
            <a
              href={imageUrl}
              download={`${alt || "image"}.jpg`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
