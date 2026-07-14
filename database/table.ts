import { sqlTypes } from '../operations/data_types';
import { getConditionPieces, getInsertPieces, isValidIdentifier } from '../operations/get_pieces';
import { config } from '../operations/config';
import { Query } from './query';
import { log } from '../operations/log';

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

interface TableResult {
    status: number;
    message: string;
    data: any[] | null;
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

function TableFunctions(name: string): TableFunctions {
    async function create(scheme: TableSchema): Promise<boolean> {
        const isThereTable = await isThere();
        if (isThereTable) return false;

        if (!scheme || Object.keys(scheme).length === 0) return false;
        const stringScheme = Object.keys(scheme).map(m => m + ' ' + scheme[m]).join(', ');

        const queryString = `CREATE TABLE ${name} (${stringScheme})`;
        return (await Query(queryString))?.status === 200;
    }

    async function remove(): Promise<boolean> {
        const isThereTable = await isThere();
        if (!isThereTable) return false;

        const queryString = `DROP TABLE ${name}`;
        return (await Query(queryString))?.status === 200;
    }

    async function isThere(): Promise<boolean> {
        const queryString = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND LOWER(table_name) = LOWER($1)`;
        const queryOutput = await Query(queryString, [name]);
        return queryOutput?.status === 200 && (queryOutput?.data?.length ?? 0) > 0;
    }

    async function info(): Promise<TableInfo | null> {
        const queryString = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND LOWER(table_name) = LOWER($1)`;
        const queryOutput = await Query(queryString, [name]);
        if (queryOutput?.status !== 200) {
            if (config.get.logingMode()) log('Table', 'Info', `Table ${name} not found.`);
            return null;
        }

        const data = queryOutput?.data?.[0] || null;
        if (!data) return null;

        const schema = await getSchema();
        return {
            name: data.table_name,
            type: 'Table',
            date: null,
            schema
        };
    }

    async function getAll(): Promise<TableInfo[] | null> {
        const queryString = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        const queryOutput = await Query(queryString);
        if (queryOutput?.status !== 200) {
            if (config.get.logingMode()) log('Table', 'Get All', 'Tables not found.');
            return null;
        }

        const data = queryOutput?.data || [];
        if (!data) return null;

        return Promise.all(data.map(async (m: any) => {
            const schema = await getSchema(m.table_name);
            return {
                name: m.table_name,
                type: 'Table',
                date: null,
                schema
            };
        }));
    }

    async function getSchema(tableName: string = name): Promise<TableSchema> {
        const queryString = `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE LOWER(TABLE_NAME) = LOWER($1)`;
        const queryOutput = await Query(queryString, [tableName]);
        if (queryOutput?.status !== 200) return {};

        const data = queryOutput?.data || [];
        return data.reduce((acc: Record<string, string>, cur: any) => ({ ...acc, [cur.column_name]: cur.data_type }), {});
    }

    function updateColumn(columnName: string) {
        async function add(type: string): Promise<boolean> {
            const queryString = `ALTER TABLE ${name} ADD ${columnName} ${type}`;
            return (await Query(queryString))?.status === 200;
        }

        async function remove(): Promise<boolean> {
            const queryString = `ALTER TABLE ${name} DROP COLUMN ${columnName}`;
            return (await Query(queryString))?.status === 200;
        }

        async function rename(newColumnName: string): Promise<boolean> {
            const queryString = `ALTER TABLE ${name} RENAME COLUMN ${columnName} TO ${newColumnName}`;
            return (await Query(queryString))?.status === 200;
        }

        async function update(type: string): Promise<boolean> {
            const queryString = `ALTER TABLE ${name} ALTER COLUMN ${columnName} TYPE ${type}`;
            return (await Query(queryString))?.status === 200;
        }

        return {
            add,
            remove,
            rename,
            update
        };
    }

    return {
        create,
        remove,
        isThere,
        info,
        getAll,
        updateColumn
    };
}

export function Table(name: string) {
    async function find(reference: TableReference = {}, options: TableOptions = { limit: null, selected_keys: [], likes: {} }): Promise<any[]> {
        let table = await TableFunctions(name).info();
        if (!table) {
            if (config.get.logingMode()) log('Table', 'Find', `Table ${name} not found.`);
            return [];
        }

        const { condition, inputs } = getConditionPieces(reference, 0);
        let referenceString = condition ? `WHERE ${condition}` : '';

        if (Object.keys(options.likes || {}).length > 0) {
            let likeKeys = Object.keys(options.likes || {});
            let startIdx = inputs.length;
            let likes = likeKeys.map((m, i) => `${m} LIKE $${startIdx + i + 1}`);
            referenceString += referenceString ? ` AND ${likes.join(' AND ')}` : `WHERE ${likes.join(' AND ')}`;
            for (const key of likeKeys) {
                inputs.push((options.likes?.[key] || '').replaceAll('?', '%').replaceAll('.', '_'));
            }
        }

        let columns = '*';
        if (Array.isArray(options.selected_keys) && options.selected_keys && options.selected_keys?.length > 0) {
            columns = options.selected_keys.filter(k => isValidIdentifier(k)).join(', ');
        }

        let limitString = (typeof options.limit === 'number' && options.limit > 0) ? ` LIMIT ${options.limit}` : '';
        let queryString = `SELECT ${columns} FROM ${name} ${referenceString}${limitString}`;

        let queryOutput = await Query(queryString, inputs.length > 0 ? inputs : undefined);
        let data = queryOutput?.data || [];

        if (data.length > 0) {
            data = data.map(m => {
                let keys = Object.keys(m);
                let schemaControlled = false;
                if (options?.selected_keys && options.selected_keys.length > 0 && keys.length <= Object.keys(table?.schema || {}).length) schemaControlled = true;
                if (!schemaControlled && keys.length === Object.keys(table?.schema || {}).length) schemaControlled = true;
                if (!schemaControlled) return null;

                let new_data: Record<string, any> = {};
                keys.forEach(key => {
                    const lowerKey = (key || '').toLowerCase();
                    const schemaKey = Object.keys(table!.schema).find(k => k.toLowerCase() === lowerKey) || '';
                    const converter = sqlTypes[table!.schema[schemaKey]];
                    new_data[key] = converter ? converter(m[key]) : m[key];
                });
                return new_data;
            }).filter(f => f !== null);
        }

        return data;
    }

    async function findOne(reference: TableReference = {}, options: TableOptions = { selected_keys: [], likes: {} }): Promise<any | null> {
        const findOption = { limit: 1, selected_keys: options.selected_keys, likes: options.likes };
        return (await find(reference, findOption))[0] || null;
    }

    async function createOne(data: TableData): Promise<boolean> {
        const { columns, values, inputs } = getInsertPieces(data);
        const queryString = `INSERT INTO ${name} (${columns}) VALUES (${values})`;
        const queryOutput = await Query(queryString, inputs);
        return queryOutput?.status === 200;
    }

    async function updateOne(reference: TableReference, data: TableData): Promise<boolean> {
        const { condition: refCondition, inputs: refInputs } = getConditionPieces(reference, 0);
        const { condition: dataCondition, inputs: dataInputs } = getConditionPieces(data, refInputs.length);

        if (!refCondition) {
            if (config.get.logingMode()) log('Table', 'Update', 'No reference provided for update');
            return false;
        }
        if (!dataCondition) {
            if (config.get.logingMode()) log('Table', 'Update', 'No data provided for update');
            return false;
        }

        const existingData = await findOne(reference);
        if (!existingData) {
            if (config.get.logingMode()) log('Table', 'Update', 'No data found for update');
            return false;
        }

        const allInputs = [...refInputs, ...dataInputs];

        const setValues = dataCondition.replace(/ AND /g, ', ');

        const queryString = `UPDATE ${name} SET ${setValues} WHERE ${refCondition}`;
        const queryOutput = await Query(queryString, allInputs);
        return queryOutput?.status === 200;
    }

    async function deleteOne(reference: TableReference): Promise<boolean> {
        const deleteOperation = await _deleteOne(reference);
        if (deleteOperation === false) return false;
        return deleteOperation.status === 200;
    }

    async function _deleteOne(reference: TableReference): Promise<TableResult | false> {
        const { condition, inputs } = getConditionPieces(reference, 0);
        if (!condition) {
            if (config.get.logingMode()) log('Table', 'Delete', 'No reference provided for delete');
            return false;
        }

        const queryString = `DELETE FROM ${name} WHERE ${condition}`;
        return await Query(queryString, inputs);
    }

    async function deleteAll(reference?: TableReference): Promise<boolean> {
        const datas = await find(reference || {});
        if (datas.length === 0) {
            if (config.get.logingMode()) log('Table', 'Delete', 'No data found for delete');
            return false;
        }

        const deletes = await Promise.all(datas.map(async data => {
            const _data: Record<string, any> = {};
            Object.keys(data)
                .filter(key => key !== 'created_at' && data[key] !== null)
                .forEach(key => _data[key] = data[key]);
            return await _deleteOne(_data);
        }));

        let output: TableResult;
        const isCompleted = deletes.filter(f => f !== false && f.status !== 200).length === 0;
        if (!isCompleted) output = { status: 500, message: "An error occurred while deleting", data: null };
        else output = { status: 200, message: "Success", data: null };

        return output.status === 200;
    }

    async function first(reference: TableReference = {}, options: TableOptions = {}): Promise<any | null> {
        const data = await find(reference, { ...options, limit: 1 });
        return data[0] || null;
    }

    async function firstOrDefault(reference: TableReference = {}, options: TableOptions = {}): Promise<any | null> {
        const data = await find(reference, { ...options, limit: 1 });
        return data[0] || null;
    }

    async function single(reference: TableReference = {}, options: TableOptions = {}): Promise<any> {
        const data = await find(reference, options);
        if (data.length === 0) throw new Error("Sequence contains no elements");
        if (data.length > 1) throw new Error("Sequence contains more than one element");
        return data[0];
    }

    async function singleOrDefault(reference: TableReference = {}, options: TableOptions = {}): Promise<any | null> {
        const data = await find(reference, options);
        if (data.length > 1) throw new Error("Sequence contains more than one element");
        return data[0] || null;
    }

    async function last(reference: TableReference = {}, options: TableOptions = {}): Promise<any | null> {
        const data = await find(reference, options);
        return data[data.length - 1] || null;
    }

    async function lastOrDefault(reference: TableReference = {}, options: TableOptions = {}): Promise<any | null> {
        const data = await find(reference, options);
        return data[data.length - 1] || null;
    }

    async function count(reference: TableReference = {}, options: TableOptions = {}): Promise<number> {
        const data = await find(reference, options);
        return data.length;
    }

    async function min(key: string, reference: TableReference = {}, options: TableOptions = {}): Promise<number | null> {
        const data = await find(reference, options);
        if (data.length === 0) return null;
        return Math.min(...data.map(item => item[key]));
    }

    async function max(key: string, reference: TableReference = {}, options: TableOptions = {}): Promise<number | null> {
        const data = await find(reference, options);
        if (data.length === 0) return null;
        return Math.max(...data.map(item => item[key]));
    }

    async function average(key: string, reference: TableReference = {}, options: TableOptions = {}): Promise<number | null> {
        const data = await find(reference, options);
        if (data.length === 0) return null;
        const sum = data.reduce((acc, item) => acc + item[key], 0);
        return sum / data.length;
    }

    return {
        find,
        findOne,
        createOne,
        updateOne,
        deleteOne,
        deleteAll,
        first,
        firstOrDefault,
        single,
        singleOrDefault,
        last,
        lastOrDefault,
        count,
        min,
        max,
        average,
        functions: TableFunctions(name)
    };
}
