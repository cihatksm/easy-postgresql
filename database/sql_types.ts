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

export const sqlTypes: SqlTypes = {
    varchar: (length = 255) => typeof length === 'number' ? `VARCHAR(${length})` : 'VARCHAR(255)',
    nvarchar: (length = 255) => typeof length === 'number' ? `VARCHAR(${length})` : 'VARCHAR(255)',
    int: () => 'INT',
    bigint: () => 'BIGINT',
    smallint: () => 'SMALLINT',
    tinyint: () => 'SMALLINT',
    bit: () => 'BOOLEAN',
    float: () => 'FLOAT',
    real: () => 'REAL',
    decimal: (precision = 18, scale = 0) => typeof precision === 'number' && typeof scale === 'number' ? `DECIMAL(${precision}, ${scale})` : 'DECIMAL(18, 0)',
    numeric: () => 'NUMERIC',
    money: () => 'NUMERIC(19,4)',
    smallmoney: () => 'NUMERIC(10,4)',
    date: () => 'DATE',
    time: () => 'TIME',
    datetime: () => 'TIMESTAMP',
    datetime2: () => 'TIMESTAMP',
    smalldatetime: () => 'TIMESTAMP',
    timestamp: () => 'BYTEA',
    char: () => 'CHAR',
    nchar: () => 'CHAR',
    text: () => 'TEXT',
    ntext: () => 'TEXT',
    binary: () => 'BYTEA',
    varbinary: () => 'BYTEA',
    image: () => 'BYTEA',
    uniqueidentifier: () => 'UUID',
    sql_variant: () => 'TEXT',
    xml: () => 'XML',
    options: {
        notNull: () => ' ' + 'NOT NULL',
        primaryKey: () => ' ' + 'PRIMARY KEY',
        unique: () => ' ' + 'UNIQUE',
        autoIncrement: () => ' ' + 'GENERATED ALWAYS AS IDENTITY',
        default: (value?: any) => value !== undefined ? (' ' + `DEFAULT ${value}`) : '',
        check: (value?: any) => value !== undefined ? (' ' + `CHECK(${value})`) : '',
        foreignKey: (table?: string, column?: string) => table !== undefined && column !== undefined ? (' ' + `REFERENCES ${table}(${column})`) : ''
    }
};
