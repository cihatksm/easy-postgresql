import 'colors';
/**
 * This function is used to set the output format of the query result.
 *
 * @param mode - This parameter is used to set the output format of the query result.
 */
declare function setLogingMode(mode?: boolean): void;
/**
 * This function is used to get the current output format of the query result.
 * @file config.ts
 * @description This file contains the configuration operations.
 * @module
 */
export declare const config: {
    get: {
        logingMode: () => boolean;
    };
    set: {
        logingMode: typeof setLogingMode;
    };
};
export {};
