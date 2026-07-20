import 'colors';
/**
 * This function is used to set the output format of the query result.
 *
 * @param mode - This parameter is used to set the output format of the query result.
 */
declare function setLogingMode(mode?: boolean): void;
/**
 * This function is used to set the prefix for log output.
 *
 * @param prefix - The prefix string to prepend to log messages. Defaults to empty string.
 */
declare function setPrefix(prefix?: string): void;
/**
 * This function is used to get the current output format of the query result.
 * @file config.ts
 * @description This file contains the configuration operations.
 * @module
 */
export declare const config: {
    get: {
        logingMode: () => boolean;
        prefix: () => string;
    };
    set: {
        logingMode: typeof setLogingMode;
        prefix: typeof setPrefix;
    };
};
export {};
