import 'colors';
/**
 * This function is used to display logs in the console.
 *
 * @param title - The title of the log.
 * @param alt - The alternative title of the log.
 * @param description - The description of the log.
 * @param file - The file of the log.
     */
declare function Log(title: string | null, alt: string | null, description: string | null, file?: string | null): void;
export declare const log: typeof Log;
export {};
