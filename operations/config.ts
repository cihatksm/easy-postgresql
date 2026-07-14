import 'colors';

let logingMode = false;

/**
 * This function is used to set the output format of the query result.
 * 
 * @param mode - This parameter is used to set the output format of the query result.
 */
function setLogingMode(mode = false): void {
    if (typeof mode !== 'boolean') throw new Error('Invalid parameter type. Expected boolean.');
    logingMode = mode;
}

/**
 * This function is used to get the current output format of the query result.
 * @file config.ts
 * @description This file contains the configuration operations.
 * @module
 */
export const config = {
    get: {
        logingMode: (): boolean => logingMode,
    },
    set: {
        logingMode: setLogingMode
    }
}; 