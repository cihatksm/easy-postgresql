import 'colors';
import { Table } from './database/table';
import { Procedure } from './database/procedure';
import { Query } from './database/query';
import { connectToServer, isConnected } from './operations/connect_to_server';
/**
 * This class provides all database operations.
 * @file database.ts
 * @description This file contains the database operations.
 * @module
 */
declare class EasyPostgresql {
    Table: typeof Table;
    Procedure: typeof Procedure;
    Query: typeof Query;
    Types: import("./database/sql_types").SqlTypes;
    Connect: typeof connectToServer;
    IsConnected: typeof isConnected;
    Config: {
        logingMode: (mode?: boolean) => void;
    };
}
declare const easyPostgresql: EasyPostgresql;
export = easyPostgresql;
