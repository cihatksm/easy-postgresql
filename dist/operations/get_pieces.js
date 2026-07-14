"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidIdentifier = exports.getInsertPieces = exports.getConditionPieces = void 0;
/**
 * Converts an object into a parameterized WHERE/SET condition string.
 * Generates $1, $2... positional placeholders to prevent SQL injection.
 *
 * @param data - The key/value pairs to parameterize
 * @param startIndex - Starting positional index for parameters (default: 0, meaning first param is $1)
 * @returns Parameterized condition and ordered input values array
 */
const getConditionPieces = (data = {}, startIndex = 0) => {
    const keys = Object.keys(data).filter(key => (0, exports.isValidIdentifier)(key));
    const condition = keys.map((key, i) => `${key} = $${startIndex + i + 1}`).join(' AND ');
    const inputs = keys.map(key => sanitizeValue(data[key]));
    return { condition, inputs };
};
exports.getConditionPieces = getConditionPieces;
/**
 * Converts an object into a parameterized INSERT fragment.
 *
 * @param data - The key/value pairs to insert
 * @returns Column names, positional placeholders ($1, $2...), and ordered input values
 */
const getInsertPieces = (data = {}) => {
    const keys = Object.keys(data).filter(key => (0, exports.isValidIdentifier)(key));
    const columns = keys.join(', ');
    const values = keys.map((_, i) => `$${i + 1}`).join(', ');
    const inputs = keys.map(key => sanitizeValue(data[key]));
    return { columns, values, inputs };
};
exports.getInsertPieces = getInsertPieces;
/**
 * Validates that a SQL identifier (table/column name) contains only safe characters.
 */
const isValidIdentifier = (name) => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
};
exports.isValidIdentifier = isValidIdentifier;
/**
 * Sanitizes a value for use as a SQL parameter.
 * Converts undefined/NaN to null, booleans to true/false, bigint to string.
 */
function sanitizeValue(value) {
    if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) {
        return null;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}
//# sourceMappingURL=get_pieces.js.map