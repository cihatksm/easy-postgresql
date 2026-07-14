"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlTypes = void 0;
/**
 * This class is used to create an object of any data type.
 */
class Any {
    constructor(value) {
        this.value = value;
    }
}
/**
 * This function is used to check if the value is null.
 *
 * @param value - The data to be checked
 * @returns boolean - Returns true if the value is null, false otherwise
 */
const isNull = (value) => value === null;
/**
 * This object contains functions to convert values to specific data types.
 */
const types = {
    /**
     * Converts a value to a string.
     * @param value - The value to be converted
     * @returns string | null - The converted string value or null
     */
    string: (value) => {
        return isNull(value) ? null : String(value);
    },
    /**
     * Converts a value to a number.
     * @param value - The value to be converted
     * @returns number | null - The converted number value or null
     */
    number: (value) => {
        return isNull(value) ? null : Number(value);
    },
    /**
     * Converts a value to a boolean.
     * @param value - The value to be converted
     * @returns boolean | null - The converted boolean value or null
     */
    boolean: (value) => {
        return isNull(value) ? null : Boolean(value);
    },
    /**
     * Converts a value to a Date.
     * @param value - The value to be converted
     * @returns Date | null - The converted Date value or null
     */
    date: (value) => {
        return isNull(value) ? null : new Date(value);
    },
    /**
     * Converts a value to a Buffer.
     * @param value - The value to be converted
     * @returns Buffer | null - The converted Buffer value or null
     */
    buffer: (value) => {
        return isNull(value) ? null : Buffer.from(String(value));
    },
    /**
     * Converts a value to an Array.
     * @param value - The value to be converted
     * @returns any[] | null - The converted Array value or null
     */
    array: (value) => {
        return isNull(value) ? null : Array.isArray(value) ? value : [value];
    },
    /**
     * Wraps a value in an Any object.
     * @param value - The value to be wrapped
     * @returns Any | null - The wrapped value or null
     */
    any: (value) => {
        return isNull(value) ? null : new Any(value);
    }
};
/**
 * This object contains the data types of PostgreSQL and their corresponding JavaScript data type converters.
 */
exports.sqlTypes = {
    "char": types.string,
    "character": types.string,
    "varchar": types.string,
    "character varying": types.string,
    "text": types.string,
    "bytea": types.buffer,
    "bool": types.boolean,
    "boolean": types.boolean,
    "int2": types.number,
    "smallint": types.number,
    "int4": types.number,
    "integer": types.number,
    "int8": types.number,
    "bigint": types.number,
    "decimal": types.number,
    "numeric": types.number,
    "float4": types.number,
    "real": types.number,
    "float8": types.number,
    "double precision": types.number,
    "money": types.number,
    "timestamp": types.date,
    "timestamptz": types.date,
    "timestamp without time zone": types.date,
    "timestamp with time zone": types.date,
    "date": types.date,
    "time": types.string,
    "timetz": types.string,
    "time without time zone": types.string,
    "time with time zone": types.string,
    "uuid": types.string,
    "xml": types.string,
    "json": types.any,
    "jsonb": types.any,
    "ARRAY": types.array,
};
//# sourceMappingURL=data_types.js.map