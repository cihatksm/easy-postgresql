"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = Table;
const data_types_1 = require("../operations/data_types");
const get_pieces_1 = require("../operations/get_pieces");
const config_1 = require("../operations/config");
const query_1 = require("./query");
const log_1 = require("../operations/log");
function TableFunctions(name) {
    async function create(scheme) {
        const isThereTable = await isThere();
        if (isThereTable)
            return false;
        if (!scheme || Object.keys(scheme).length === 0)
            return false;
        const stringScheme = Object.keys(scheme).map(m => m + ' ' + scheme[m]).join(', ');
        const queryString = `CREATE TABLE ${name} (${stringScheme})`;
        return (await (0, query_1.Query)(queryString))?.status === 200;
    }
    async function remove() {
        const isThereTable = await isThere();
        if (!isThereTable)
            return false;
        const queryString = `DROP TABLE ${name}`;
        return (await (0, query_1.Query)(queryString))?.status === 200;
    }
    async function isThere() {
        const queryString = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND LOWER(table_name) = LOWER($1)`;
        const queryOutput = await (0, query_1.Query)(queryString, [name]);
        return queryOutput?.status === 200 && (queryOutput?.data?.length ?? 0) > 0;
    }
    async function info() {
        const queryString = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND LOWER(table_name) = LOWER($1)`;
        const queryOutput = await (0, query_1.Query)(queryString, [name]);
        if (queryOutput?.status !== 200) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Table', 'Info', `Table ${name} not found.`);
            return null;
        }
        const data = queryOutput?.data?.[0] || null;
        if (!data)
            return null;
        const schema = await getSchema();
        return {
            name: data.table_name,
            type: 'Table',
            date: null,
            schema
        };
    }
    async function getAll() {
        const queryString = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        const queryOutput = await (0, query_1.Query)(queryString);
        if (queryOutput?.status !== 200) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Table', 'Get All', 'Tables not found.');
            return null;
        }
        const data = queryOutput?.data || [];
        if (!data)
            return null;
        return Promise.all(data.map(async (m) => {
            const schema = await getSchema(m.table_name);
            return {
                name: m.table_name,
                type: 'Table',
                date: null,
                schema
            };
        }));
    }
    async function getSchema(tableName = name) {
        const queryString = `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE LOWER(TABLE_NAME) = LOWER($1)`;
        const queryOutput = await (0, query_1.Query)(queryString, [tableName]);
        if (queryOutput?.status !== 200)
            return {};
        const data = queryOutput?.data || [];
        return data.reduce((acc, cur) => ({ ...acc, [cur.column_name]: cur.data_type }), {});
    }
    function updateColumn(columnName) {
        async function add(type) {
            const queryString = `ALTER TABLE ${name} ADD ${columnName} ${type}`;
            return (await (0, query_1.Query)(queryString))?.status === 200;
        }
        async function remove() {
            const queryString = `ALTER TABLE ${name} DROP COLUMN ${columnName}`;
            return (await (0, query_1.Query)(queryString))?.status === 200;
        }
        async function rename(newColumnName) {
            const queryString = `ALTER TABLE ${name} RENAME COLUMN ${columnName} TO ${newColumnName}`;
            return (await (0, query_1.Query)(queryString))?.status === 200;
        }
        async function update(type) {
            const queryString = `ALTER TABLE ${name} ALTER COLUMN ${columnName} TYPE ${type}`;
            return (await (0, query_1.Query)(queryString))?.status === 200;
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
function Table(name) {
    async function find(reference = {}, options = { limit: null, selected_keys: [], likes: {} }) {
        let table = await TableFunctions(name).info();
        if (!table) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Table', 'Find', `Table ${name} not found.`);
            return [];
        }
        const { condition, inputs } = (0, get_pieces_1.getConditionPieces)(reference, 0);
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
            columns = options.selected_keys.filter(k => (0, get_pieces_1.isValidIdentifier)(k)).join(', ');
        }
        let limitString = (typeof options.limit === 'number' && options.limit > 0) ? ` LIMIT ${options.limit}` : '';
        let queryString = `SELECT ${columns} FROM ${name} ${referenceString}${limitString}`;
        let queryOutput = await (0, query_1.Query)(queryString, inputs.length > 0 ? inputs : undefined);
        let data = queryOutput?.data || [];
        if (data.length > 0) {
            data = data.map(m => {
                let keys = Object.keys(m);
                let schemaControlled = false;
                if (options?.selected_keys && options.selected_keys.length > 0 && keys.length <= Object.keys(table?.schema || {}).length)
                    schemaControlled = true;
                if (!schemaControlled && keys.length === Object.keys(table?.schema || {}).length)
                    schemaControlled = true;
                if (!schemaControlled)
                    return null;
                let new_data = {};
                keys.forEach(key => {
                    const lowerKey = (key || '').toLowerCase();
                    const schemaKey = Object.keys(table.schema).find(k => k.toLowerCase() === lowerKey) || '';
                    const converter = data_types_1.sqlTypes[table.schema[schemaKey]];
                    new_data[key] = converter ? converter(m[key]) : m[key];
                });
                return new_data;
            }).filter(f => f !== null);
        }
        return data;
    }
    async function findOne(reference = {}, options = { selected_keys: [], likes: {} }) {
        const findOption = { limit: 1, selected_keys: options.selected_keys, likes: options.likes };
        return (await find(reference, findOption))[0] || null;
    }
    async function createOne(data) {
        const { columns, values, inputs } = (0, get_pieces_1.getInsertPieces)(data);
        const queryString = `INSERT INTO ${name} (${columns}) VALUES (${values})`;
        const queryOutput = await (0, query_1.Query)(queryString, inputs);
        return queryOutput?.status === 200;
    }
    async function updateOne(reference, data) {
        const { condition: refCondition, inputs: refInputs } = (0, get_pieces_1.getConditionPieces)(reference, 0);
        const { condition: dataCondition, inputs: dataInputs } = (0, get_pieces_1.getConditionPieces)(data, refInputs.length);
        if (!refCondition) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Table', 'Update', 'No reference provided for update');
            return false;
        }
        if (!dataCondition) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Table', 'Update', 'No data provided for update');
            return false;
        }
        const existingData = await findOne(reference);
        if (!existingData) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Table', 'Update', 'No data found for update');
            return false;
        }
        const allInputs = [...refInputs, ...dataInputs];
        const setValues = dataCondition.replace(/ AND /g, ', ');
        const queryString = `UPDATE ${name} SET ${setValues} WHERE ${refCondition}`;
        const queryOutput = await (0, query_1.Query)(queryString, allInputs);
        return queryOutput?.status === 200;
    }
    async function deleteOne(reference) {
        const deleteOperation = await _deleteOne(reference);
        if (deleteOperation === false)
            return false;
        return deleteOperation.status === 200;
    }
    async function _deleteOne(reference) {
        const { condition, inputs } = (0, get_pieces_1.getConditionPieces)(reference, 0);
        if (!condition) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Table', 'Delete', 'No reference provided for delete');
            return false;
        }
        const queryString = `DELETE FROM ${name} WHERE ${condition}`;
        return await (0, query_1.Query)(queryString, inputs);
    }
    async function deleteAll(reference) {
        const datas = await find(reference || {});
        if (datas.length === 0) {
            if (config_1.config.get.logingMode())
                (0, log_1.log)('Table', 'Delete', 'No data found for delete');
            return false;
        }
        const deletes = await Promise.all(datas.map(async (data) => {
            const _data = {};
            Object.keys(data)
                .filter(key => key !== 'created_at' && data[key] !== null)
                .forEach(key => _data[key] = data[key]);
            return await _deleteOne(_data);
        }));
        let output;
        const isCompleted = deletes.filter(f => f !== false && f.status !== 200).length === 0;
        if (!isCompleted)
            output = { status: 500, message: "An error occurred while deleting", data: null };
        else
            output = { status: 200, message: "Success", data: null };
        return output.status === 200;
    }
    async function first(reference = {}, options = {}) {
        const data = await find(reference, { ...options, limit: 1 });
        return data[0] || null;
    }
    async function firstOrDefault(reference = {}, options = {}) {
        const data = await find(reference, { ...options, limit: 1 });
        return data[0] || null;
    }
    async function single(reference = {}, options = {}) {
        const data = await find(reference, options);
        if (data.length === 0)
            throw new Error("Sequence contains no elements");
        if (data.length > 1)
            throw new Error("Sequence contains more than one element");
        return data[0];
    }
    async function singleOrDefault(reference = {}, options = {}) {
        const data = await find(reference, options);
        if (data.length > 1)
            throw new Error("Sequence contains more than one element");
        return data[0] || null;
    }
    async function last(reference = {}, options = {}) {
        const data = await find(reference, options);
        return data[data.length - 1] || null;
    }
    async function lastOrDefault(reference = {}, options = {}) {
        const data = await find(reference, options);
        return data[data.length - 1] || null;
    }
    async function count(reference = {}, options = {}) {
        const data = await find(reference, options);
        return data.length;
    }
    async function min(key, reference = {}, options = {}) {
        const data = await find(reference, options);
        if (data.length === 0)
            return null;
        return Math.min(...data.map(item => item[key]));
    }
    async function max(key, reference = {}, options = {}) {
        const data = await find(reference, options);
        if (data.length === 0)
            return null;
        return Math.max(...data.map(item => item[key]));
    }
    async function average(key, reference = {}, options = {}) {
        const data = await find(reference, options);
        if (data.length === 0)
            return null;
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
//# sourceMappingURL=table.js.map