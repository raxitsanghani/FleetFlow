/**
 * Generates a human-readable unique identifier with a prefix.
 * Format: PREFIX-XXXX (e.g., VEH-A1B2)
 * @param {string} prefix 
 * @returns {string}
 */
const generateUID = (prefix) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let random = '';
    for (let i = 0; i < 4; i++) {
        random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${random}`;
};

module.exports = { generateUID };
