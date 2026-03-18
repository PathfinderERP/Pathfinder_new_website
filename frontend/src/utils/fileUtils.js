/**
 * Converts a File object to a Base64 string.
 * This is useful for sending images to the backend in a single JSON request.
 * 
 * @param {File} file - The file to convert
 * @returns {Promise<string>} A promise that resolves to the Base64 string
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};
