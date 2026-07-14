"use strict";
/**
 * This object contains the SQL data types.
 * @file sql_types.ts
 * @description This file contains the SQL data types.
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlTypes = void 0;
exports.sqlTypes = {
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
        default: (value) => value !== undefined ? (' ' + `DEFAULT ${value}`) : '',
        check: (value) => value !== undefined ? (' ' + `CHECK(${value})`) : '',
        foreignKey: (table, column) => table !== undefined && column !== undefined ? (' ' + `REFERENCES ${table}(${column})`) : ''
    }
};
//# sourceMappingURL=sql_types.js.map