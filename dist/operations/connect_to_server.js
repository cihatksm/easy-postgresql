"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToServer = exports.isConnected = void 0;
exports.getPool = getPool;
const pg_1 = require("pg");
const config_1 = require("./config");
const log_1 = require("./log");
let pool = null;
function getPool() {
    if (!pool)
        throw new Error('Database not connected. Call Connect() first.');
    return pool;
}
/**
 * This function checks if the database connection is active
 *
 * @returns Promise<boolean> - Returns true if connection is active, false otherwise
 */
const isConnected = async () => {
    try {
        const p = getPool();
        const client = await p.connect();
        try {
            await client.query('SELECT 1');
        }
        finally {
            client.release();
        }
        return { status: 200, message: 'OK' };
    }
    catch (err) {
        return { status: 500, message: 'Error: ' + String(err) };
    }
};
exports.isConnected = isConnected;
/**
 * This function is used to connect to the database.
 *
 * @param sqlConfig - The PostgreSQL configuration to connect to the database
 * @param run - Optional callback function to be executed after the connection is established
 * @returns Promise<boolean> - Returns true if connection is successful, false otherwise
 */
const connectToServer = async (sqlConfig, run) => {
    if (!sqlConfig || typeof sqlConfig !== 'object') {
        if (config_1.config.get.logingMode())
            (0, log_1.log)('Connection', null, 'The sqlConfig parameter is not an object.');
        return false;
    }
    const required = { user: "string", password: "string", host: "string", database: "string" };
    for (const key in required) {
        if (!sqlConfig[key] || typeof sqlConfig[key] !== required[key]) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Connection', null, `The ${key} parameter is not a ${required[key]}.`);
            return false;
        }
    }
    pool = new pg_1.Pool({
        user: sqlConfig.user,
        password: sqlConfig.password,
        host: sqlConfig.host,
        port: sqlConfig.port || 5432,
        database: sqlConfig.database,
    });
    const maxRetries = 3;
    const retryInterval = 2500;
    let retryCount = 0;
    const tryConnect = async () => {
        try {
            const client = await pool.connect();
            try {
                await client.query('SELECT 1');
            }
            finally {
                client.release();
            }
            if (run && typeof run === 'function') {
                run(sqlConfig);
            }
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Connection', null, 'Success');
            return true;
        }
        catch (err) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Connection', 'Attempt', `${retryCount + 1}: ${err instanceof Error ? err.message : String(err)}`);
            if (run && typeof run === 'function') {
                run(sqlConfig, err instanceof Error ? err : new Error(String(err)));
            }
            return false;
        }
    };
    while (retryCount < maxRetries) {
        const result = await tryConnect();
        if (result)
            return true;
        retryCount++;
        if (retryCount < maxRetries) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Connection', 'Retry', `Retrying in 2.5s... (Attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }
    if (config_1.config.get.logingMode())
        (0, log_1.log)('Connection', null, `Failed after ${maxRetries} attempts`);
    return false;
};
exports.connectToServer = connectToServer;
//# sourceMappingURL=connect_to_server.js.map