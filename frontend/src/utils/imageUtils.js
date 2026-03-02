const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "";

/**
 * Resolves an image source to a full URL.
 * If VITE_IMAGE_BASE_URL is set in .env, it prepends it to local paths.
 * 
 * @param {string} src - The image source path
 * @returns {string} The final resolved URL
 */
export const getImageUrl = (src) => {
    if (!src) return src;

    // Don't modify absolute URLs or data URLs
    if (src.startsWith("http") || src.startsWith("data:")) {
        return src;
    }

    // If no CDN URL is configured, use local path as-is
    if (!IMAGE_BASE_URL) {
        return src;
    }

    // Ensure clean joining of base URL and path
    const cleanBase = IMAGE_BASE_URL.replace(/\/$/, "");
    const cleanPath = src.replace(/^\//, "");

    return `${cleanBase}/${cleanPath}`;
};
