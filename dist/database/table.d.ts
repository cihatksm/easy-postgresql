interface TableOptions {
    limit?: number | null;
    selected_keys?: string[];
    likes?: Record<string, string>;
}
interface TableSchema {
    [key: string]: string;
}
interface TableInfo {
    name: string;
    type: string;
    date: string | null;
    schema: TableSchema;
}
interface TableReference {
    [key: string]: any;
}
interface TableData {
    [key: string]: any;
}
interface TableFunctions {
    create: (scheme: TableSchema) => Promise<boolean>;
    remove: () => Promise<boolean>;
    isThere: () => Promise<boolean>;
    info: () => Promise<TableInfo | null>;
    getAll: () => Promise<TableInfo[] | null>;
    updateColumn: (columnName: string) => {
        add: (type: string) => Promise<boolean>;
        remove: () => Promise<boolean>;
        rename: (newColumnName: string) => Promise<boolean>;
        update: (type: string) => Promise<boolean>;
    };
}
declare function TableFunctions(name: string): TableFunctions;
export declare function Table(name: string): {
    find: (reference?: TableReference, options?: TableOptions) => Promise<any[]>;
    findOne: (reference?: TableReference, options?: TableOptions) => Promise<any | null>;
    createOne: (data: TableData) => Promise<boolean>;
    updateOne: (reference: TableReference, data: TableData) => Promise<boolean>;
    deleteOne: (reference: TableReference) => Promise<boolean>;
    deleteAll: (reference?: TableReference) => Promise<boolean>;
    first: (reference?: TableReference, options?: TableOptions) => Promise<any | null>;
    firstOrDefault: (reference?: TableReference, options?: TableOptions) => Promise<any | null>;
    single: (reference?: TableReference, options?: TableOptions) => Promise<any>;
    singleOrDefault: (reference?: TableReference, options?: TableOptions) => Promise<any | null>;
    last: (reference?: TableReference, options?: TableOptions) => Promise<any | null>;
    lastOrDefault: (reference?: TableReference, options?: TableOptions) => Promise<any | null>;
    count: (reference?: TableReference, options?: TableOptions) => Promise<number>;
    min: (key: string, reference?: TableReference, options?: TableOptions) => Promise<number | null>;
    max: (key: string, reference?: TableReference, options?: TableOptions) => Promise<number | null>;
    average: (key: string, reference?: TableReference, options?: TableOptions) => Promise<number | null>;
    functions: TableFunctions;
};
export {};
