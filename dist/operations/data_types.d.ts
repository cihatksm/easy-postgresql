type TypeConverter = (value: any) => any;
/**
 * This object contains the data types of PostgreSQL and their corresponding JavaScript data type converters.
 */
export declare const sqlTypes: Record<string, TypeConverter>;
export {};
