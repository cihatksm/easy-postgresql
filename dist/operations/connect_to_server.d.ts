import { Pool } from 'pg';
export interface SqlConfig {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    [key: string]: any;
}
export type RunCallback = (sqlConfig: SqlConfig, err?: Error) => void;
export declare function getPool(): Pool;
/**
 * This function checks if the database connection is active
 *
 * @returns Promise<boolean> - Returns true if connection is active, false otherwise
 */
export declare const isConnected: () => Promise<{
    status: number;
    message: string;
}>;
/**
 * This function is used to connect to the database.
 *
 * @param sqlConfig - The PostgreSQL configuration to connect to the database
 * @param run - Optional callback function to be executed after the connection is established
 * @returns Promise<boolean> - Returns true if connection is successful, false otherwise
 */
export declare const connectToServer: (sqlConfig: SqlConfig, run?: RunCallback) => Promise<boolean>;
