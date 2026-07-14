import { Pool, PoolConfig } from 'pg';
import { config } from './config';
import { log } from './log';

export interface SqlConfig {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    [key: string]: any;
}

export type RunCallback = (sqlConfig: SqlConfig, err?: Error) => void;

let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) throw new Error('Database not connected. Call Connect() first.');
    return pool;
}

/**
 * This function checks if the database connection is active
 * 
 * @returns Promise<boolean> - Returns true if connection is active, false otherwise
 */
export const isConnected = async (): Promise<{ status: number, message: string }> => {
    try {
        const p = getPool();
        const client = await p.connect();
        try {
            await client.query('SELECT 1');
        } finally {
            client.release();
        }
        return { status: 200, message: 'OK' }
    } catch (err) {
        return { status: 500, message: 'Error: ' + String(err) }
    }
};

/**
 * This function is used to connect to the database.
 * 
 * @param sqlConfig - The PostgreSQL configuration to connect to the database
 * @param run - Optional callback function to be executed after the connection is established
 * @returns Promise<boolean> - Returns true if connection is successful, false otherwise
 */
export const connectToServer = async (sqlConfig: SqlConfig, run?: RunCallback): Promise<boolean> => {
    if (!sqlConfig || typeof sqlConfig !== 'object') {
        if (config.get.logingMode()) log('Connection', null, 'The sqlConfig parameter is not an object.');
        return false;
    }

    const required: Record<string, string> = { user: "string", password: "string", host: "string", database: "string" };
    for (const key in required) {
        if (!sqlConfig[key as keyof SqlConfig] || typeof sqlConfig[key as keyof SqlConfig] !== required[key]) {
            if (config.get.logingMode()) log('Connection', null, `The ${key} parameter is not a ${required[key]}.`);
            return false;
        }
    }

    pool = new Pool({
        user: sqlConfig.user,
        password: sqlConfig.password,
        host: sqlConfig.host,
        port: sqlConfig.port || 5432,
        database: sqlConfig.database,
    });

    const maxRetries = 3;
    const retryInterval = 2500;
    let retryCount = 0;

    const tryConnect = async (): Promise<boolean> => {
        try {
            const client = await pool!.connect();
            try {
                await client.query('SELECT 1');
            } finally {
                client.release();
            }
            if (run && typeof run === 'function') {
                run(sqlConfig);
            }
            if (config.get.logingMode()) log('Connection', null, 'Success');
            return true;
        } catch (err) {
            if (config.get.logingMode()) log('Connection', 'Attempt', `${retryCount + 1}: ${err instanceof Error ? err.message : String(err)}`);
            if (run && typeof run === 'function') {
                run(sqlConfig, err instanceof Error ? err : new Error(String(err)));
            }
            return false;
        }
    };

    while (retryCount < maxRetries) {
        const result = await tryConnect();
        if (result) return true;

        retryCount++;
        if (retryCount < maxRetries) {
            if (config.get.logingMode()) log('Connection', 'Retry', `Retrying in 2.5s... (Attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }

    if (config.get.logingMode()) log('Connection', null, `Failed after ${maxRetries} attempts`);
    return false;
};
