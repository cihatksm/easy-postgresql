"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("colors");
let logingMode = false;
let prefixValue = '';
/**
 * This function is used to set the output format of the query result.
 *
 * @param mode - This parameter is used to set the output format of the query result.
 */
function setLogingMode(mode = false) {
    if (typeof mode !== 'boolean')
        throw new Error('Invalid parameter type. Expected boolean.');
    logingMode = mode;
}
/**
 * This function is used to set the prefix for log output.
 *
 * @param prefix - The prefix string to prepend to log messages. Defaults to empty string.
 */
function setPrefix(prefix = '') {
    if (typeof prefix !== 'string')
        throw new Error('Invalid parameter type. Expected string.');
    prefixValue = prefix;
}
/**
 * This function is used to get the current output format of the query result.
 * @file config.ts
 * @description This file contains the configuration operations.
 * @module
 */
exports.config = {
    get: {
        logingMode: () => logingMode,
        prefix: () => prefixValue,
    },
    set: {
        logingMode: setLogingMode,
        prefix: setPrefix
    }
};
//# sourceMappingURL=config.js.map