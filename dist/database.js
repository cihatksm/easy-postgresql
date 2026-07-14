"use strict";
require("colors");
const table_1 = require("./database/table");
const procedure_1 = require("./database/procedure");
const query_1 = require("./database/query");
const sql_types_1 = require("./database/sql_types");
const connect_to_server_1 = require("./operations/connect_to_server");
const config_1 = require("./operations/config");
/**
 * This class provides all database operations.
 * @file database.ts
 * @description This file contains the database operations.
 * @module
 */
class EasyPostgresql {
    constructor() {
        this.Table = table_1.Table;
        this.Procedure = procedure_1.Procedure;
        this.Query = query_1.Query;
        this.Types = sql_types_1.sqlTypes;
        this.Connect = connect_to_server_1.connectToServer;
        this.IsConnected = connect_to_server_1.isConnected;
        this.Config = config_1.config.set;
    }
}
const easyPostgresql = new EasyPostgresql();
module.exports = easyPostgresql;
//# sourceMappingURL=database.js.map