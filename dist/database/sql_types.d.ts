/**
 * This object contains the SQL data types.
 * @file sql_types.ts
 * @description This file contains the SQL data types.
 * @module
 */
export interface SqlTypeOptions {
    notNull: () => string;
    primaryKey: () => string;
    unique: () => string;
    autoIncrement: () => string;
    default: (value?: any) => string;
    check: (value?: any) => string;
    foreignKey: (table?: string, column?: string) => string;
}
export interface SqlTypes {
    varchar: (length?: number) => string;
    nvarchar: (length?: number) => string;
    int: () => string;
    bigint: () => string;
    smallint: () => string;
    tinyint: () => string;
    bit: () => string;
    float: () => string;
    real: () => string;
    decimal: (precision?: number, scale?: number) => string;
    numeric: () => string;
    money: () => string;
    smallmoney: () => string;
    date: () => string;
    time: () => string;
    datetime: () => string;
    datetime2: () => string;
    smalldatetime: () => string;
    timestamp: () => string;
    char: () => string;
    nchar: () => string;
    text: () => string;
    ntext: () => string;
    binary: () => string;
    varbinary: () => string;
    image: () => string;
    uniqueidentifier: () => string;
    sql_variant: () => string;
    xml: () => string;
    options: SqlTypeOptions;
}
export declare const sqlTypes: SqlTypes;
