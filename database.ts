import 'colors';
import { Table } from './database/table';
import { Procedure } from './database/procedure';
import { Query } from './database/query';
import { sqlTypes } from './database/sql_types';
import { connectToServer, isConnected } from './operations/connect_to_server';
import { config } from './operations/config';

/**
 * This class provides all database operations.
 * @file database.ts
 * @description This file contains the database operations.
 * @module
 */
class EasyPostgresql {
    Table = Table;
    Procedure = Procedure;
    Query = Query;
    Types = sqlTypes;
    Connect = connectToServer;
    IsConnected = isConnected;
    Config = config.set;
}

const easyPostgresql = new EasyPostgresql();
export = easyPostgresql;
