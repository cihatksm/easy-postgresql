"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("colors");
let logingMode = false;
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
 * This function is used to get the current output format of the query result.
 * @file config.ts
 * @description This file contains the configuration operations.
 * @module
 */
exports.config = {
    get: {
        logingMode: () => logingMode,
    },
    set: {
        logingMode: setLogingMode
    }
};
//# sourceMappingURL=config.js.map