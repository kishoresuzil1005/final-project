// frontend/ec2/js/common.js

/**
 * Displays a custom alert/modal message.
 * For simplicity, we're using window.alert() for now, but in a real app,
 * this would be replaced with a more sophisticated custom modal UI.
 * @param {string} message - The message to display.
 */
function showMessage(message) {
    alert(message);
}

/**
 * Displays a custom confirmation modal.
 * For simplicity, we're using window.confirm() for now, but in a real app,
 * this would be replaced with a more sophisticated custom modal UI.
 * @param {string} message - The confirmation message.
 * @returns {Promise<boolean>} - Resolves with true if confirmed, false otherwise.
 */
function showConfirm(message) {
    // Returns a Promise for consistency, even with synchronous confirm()
    return Promise.resolve(confirm(message));
}

/**
 * Handles API calls to the backend.
 * @param {string} url - The API endpoint URL.
 * @param {object} options - Fetch API options (method, headers, body, etc.).
 * @returns {Promise<object>} - The JSON response data from the API.
 * @throws {Error} - Throws an error if the API call fails or returns an error.
 */
async function callApi(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json(); // Always try to parse JSON to get error details

        if (!response.ok) {
            // Backend might return an 'error' field or a 'message' field for errors
            throw new Error(data.error || data.message || `API call failed with status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        // Re-throw to allow specific error handling in the calling function
        throw error;
    }
}
