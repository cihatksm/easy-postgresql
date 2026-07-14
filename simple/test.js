const EasyPostgresql = require('../dist/database.js');
require('colors');

console.log('\neasy-postgresql Test Suite');
console.log('========================');
console.log('Starting tests...\n');

EasyPostgresql.Config.logingMode(true);

console.log('Test 1: Testing database connection...');
console.log('Waiting for PostgreSQL to be ready...');

const sqlConfig = {
    user: 'postgres',
    password: 'DbmjAzRbdvYQPjwahRudWftWfhWSjJKG',
    host: 'yamanote.proxy.rlwy.net',
    port: 11348,
    database: 'railway'
};

EasyPostgresql.Connect(sqlConfig, async (config, err) => {
    if (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
    console.log('Connection successful\n');

    console.log('Test 2: Testing table operations...');
    try {
        const schema = {
            id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
            name: EasyPostgresql.Types.varchar(255),
            created_at: EasyPostgresql.Types.datetime()
        };

        const table = EasyPostgresql.Table('test_table');
        await table.functions.remove();

        const createResult = await table.functions.create(schema);
        if (createResult) {
            console.log('Table creation successful');
        } else {
            console.log('Table creation failed');
            throw new Error('Table creation failed');
        }

        const now = new Date();

        const insertResult = await table.createOne({
            id: 1,
            name: 'Test Record',
            created_at: now
        });
        if (insertResult) {
            console.log('Data insertion successful');
        } else {
            console.log('Data insertion failed');
            throw new Error('Data insertion failed');
        }

        const queryResult = await table.find();
        if (queryResult && queryResult.length > 0) {
            console.log('Data query successful');
        } else {
            console.log('Data query failed');
            throw new Error('Data query failed');
        }

        const removeResult = await table.functions.remove();
        if (removeResult) {
            console.log('Table cleanup successful\n');
        } else {
            console.log('Table cleanup failed\n');
            throw new Error('Table cleanup failed');
        }

        console.log('Test 3: Testing all table functions...');
        try {
            await table.functions.create(schema);
            console.log('Table recreated for comprehensive tests');

            const testRecords = [
                { id: 1, name: 'Test Record 1', created_at: now },
                { id: 2, name: 'Test Record 2', created_at: now },
                { id: 3, name: 'Test Record 3', created_at: now }
            ];

            const createOneResult = await table.createOne(testRecords[0]);
            if (createOneResult) {
                console.log('createOne test successful');
            } else {
                throw new Error('createOne test failed');
            }

            const findOneResult = await table.findOne({ id: 1 });
            if (findOneResult && findOneResult.id === 1) {
                console.log('findOne test successful');
            } else {
                throw new Error('findOne test failed');
            }

            const updateOneResult = await table.updateOne({ id: 1 }, { name: 'Updated Record' });
            if (updateOneResult) {
                console.log('updateOne test successful');
            } else {
                throw new Error('updateOne test failed');
            }

            const deleteOneResult = await table.deleteOne({ id: 1 });
            if (deleteOneResult) {
                console.log('deleteOne test successful');
            } else {
                throw new Error('deleteOne test failed');
            }

            for (const record of testRecords) {
                await table.createOne(record);
            }

            const firstResult = await table.first({ id: 1 });
            if (firstResult && firstResult.id === 1) {
                console.log('first test successful');
            } else {
                throw new Error('first test failed');
            }

            const firstOrDefaultResult = await table.firstOrDefault({ id: 999 });
            if (firstOrDefaultResult === null) {
                console.log('firstOrDefault test successful');
            } else {
                throw new Error('firstOrDefault test failed');
            }

            const singleResult = await table.single({ id: 2 });
            if (singleResult && singleResult.id === 2) {
                console.log('single test successful');
            } else {
                throw new Error('single test failed');
            }

            const singleOrDefaultResult = await table.singleOrDefault({ id: 999 });
            if (singleOrDefaultResult === null) {
                console.log('singleOrDefault test successful');
            } else {
                throw new Error('singleOrDefault test failed');
            }

            const lastResult = await table.last();
            if (lastResult && lastResult.id === 3) {
                console.log('last test successful');
            } else {
                throw new Error('last test failed');
            }

            const lastOrDefaultResult = await table.lastOrDefault({ id: 999 });
            if (lastOrDefaultResult === null) {
                console.log('lastOrDefault test successful');
            } else {
                throw new Error('lastOrDefault test failed');
            }

            const countResult = await table.count();
            if (countResult === 3) {
                console.log('count test successful');
            } else {
                throw new Error('count test failed');
            }

            const minResult = await table.min('id');
            if (minResult === 1) {
                console.log('min test successful');
            } else {
                throw new Error('min test failed');
            }

            const maxResult = await table.max('id');
            if (maxResult === 3) {
                console.log('max test successful');
            } else {
                throw new Error('max test failed');
            }

            const averageResult = await table.average('id');
            if (averageResult === 2) {
                console.log('average test successful');
            } else {
                throw new Error('average test failed');
            }

            const deleteAllWithParamResult = await table.deleteAll({ name: 'Test Record 2' });
            if (deleteAllWithParamResult) {
                console.log('deleteAll with parameter test successful');
            } else {
                throw new Error('deleteAll with parameter test failed');
            }

            const deleteAllResult = await table.deleteAll();
            if (deleteAllResult) {
                console.log('deleteAll without parameter test successful');
            } else {
                throw new Error('deleteAll without parameter test failed');
            }

            await table.functions.remove();
            console.log('All table function tests completed successfully\n');
        } catch (error) {
            console.error('Comprehensive table function tests failed:', error);
            process.exit(1);
        }
    } catch (error) {
        console.error('Table operations failed:', error);
        process.exit(1);
    }

    console.log('Test 4: Testing raw query...');
    try {
        const createProcSQL = `
            CREATE OR REPLACE FUNCTION TestProcedure(param1 INT, param2 VARCHAR)
            RETURNS TABLE(id INT, name VARCHAR) AS $$
            BEGIN
                RETURN QUERY SELECT param1 AS id, param2::VARCHAR AS name;
            END;
            $$ LANGUAGE plpgsql;
        `;

        await EasyPostgresql.Query(createProcSQL);

        const procResult = await EasyPostgresql.Procedure('TestProcedure').Execute({
            param1: 1,
            param2: 'Test'
        });

        if (procResult && procResult.status === 200) {
            console.log('Function execution test successful\n');
        } else {
            console.log('Function execution test failed\n');
            throw new Error('Function execution test failed');
        }

        const dropFunction = await EasyPostgresql.Query('DROP FUNCTION IF EXISTS TestProcedure');
        if (dropFunction) {
            console.log('Function cleanup successful\n');
        } else {
            console.log('Function cleanup failed\n');
            throw new Error('Function cleanup failed');
        }
    } catch (error) {
        console.error('Raw query test failed:', error);
        process.exit(1);
    }

    console.log('Test 5: Testing table functions (info, isThere, getAll, updateColumn)...');
    try {
        const table2 = EasyPostgresql.Table('test_table_functions');
        const schema2 = {
            id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
            name: EasyPostgresql.Types.varchar(100),
            email: EasyPostgresql.Types.varchar(100)
        };
        await table2.functions.remove();
        await table2.functions.create(schema2);

        const isThere = await table2.functions.isThere();
        if (isThere === true) {
            console.log('isThere test successful');
        } else {
            throw new Error('isThere test failed');
        }

        const info = await table2.functions.info();
        if (info && info.name === 'test_table_functions' && info.type === 'Table') {
            console.log('info test successful');
        } else {
            throw new Error('info test failed');
        }

        const allTables = await table2.functions.getAll();
        if (allTables && Array.isArray(allTables) && allTables.some(t => t.name === 'test_table_functions')) {
            console.log('getAll test successful');
        } else {
            throw new Error('getAll test failed');
        }

        const colRename = await table2.functions.updateColumn('name').rename('full_name');
        if (colRename === true) {
            console.log('updateColumn.rename test successful');
        } else {
            throw new Error('updateColumn.rename test failed');
        }

        const colAdd = await table2.functions.updateColumn('age').add('INT');
        if (colAdd === true) {
            console.log('updateColumn.add test successful');
        } else {
            throw new Error('updateColumn.add test failed');
        }

        await table2.functions.remove();
        console.log('Table functions tests completed successfully\n');
    } catch (error) {
        console.error('Table functions tests failed:', error);
        process.exit(1);
    }

    console.log('Test 6: Testing find with selected_keys and likes...');
    try {
        const table3 = EasyPostgresql.Table('test_table_options');
        const schema3 = {
            id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
            name: EasyPostgresql.Types.varchar(100),
            email: EasyPostgresql.Types.varchar(100)
        };
        await table3.functions.remove();
        await table3.functions.create(schema3);

        await table3.createOne({ id: 1, name: 'Alice', email: 'alice@test.com' });
        await table3.createOne({ id: 2, name: 'Bob', email: 'bob@test.com' });
        await table3.createOne({ id: 3, name: 'Charlie', email: 'charlie@other.com' });

        const selectedResult = await table3.find({}, { selected_keys: ['id', 'name'] });
        const firstRow = selectedResult[0];
        if (firstRow && firstRow.id !== undefined && firstRow.name !== undefined && firstRow.email === undefined) {
            console.log('find with selected_keys test successful');
        } else {
            throw new Error('find with selected_keys test failed');
        }

        const likeResult = await table3.find({}, { likes: { name: 'A?' } });
        if (likeResult && likeResult.length === 1 && likeResult[0].name === 'Alice') {
            console.log('find with likes test successful');
        } else {
            throw new Error('find with likes test failed');
        }

        await table3.functions.remove();
        console.log('find options tests completed successfully\n');
    } catch (error) {
        console.error('find options tests failed:', error);
        process.exit(1);
    }

    console.log('Test 7: Testing raw query with named parameters...');
    try {
        const rawResult = await EasyPostgresql.Query('SELECT @val1 AS col1, @val2 AS col2', { val1: 100, val2: 'hello' });
        if (rawResult && rawResult.status === 200 && rawResult.data[0].col1 === 100 && rawResult.data[0].col2 === 'hello') {
            console.log('Raw query with named params test successful');
        } else {
            throw new Error('Raw query with named params test failed');
        }
        console.log('Raw query named params test completed successfully\n');
    } catch (error) {
        console.error('Raw query named params test failed:', error);
        process.exit(1);
    }

    console.log('Test 8: Testing Procedure.Info and IsConnected...');
    try {
        const createProcSQL2 = `
            CREATE OR REPLACE FUNCTION TestProc2(x INT)
            RETURNS INT AS $$
            BEGIN
                RETURN x * 2;
            END;
            $$ LANGUAGE plpgsql;
        `;
        await EasyPostgresql.Query(createProcSQL2);

        const procInfo = await EasyPostgresql.Procedure('TestProc2').Info();
        if (procInfo && procInfo.name === 'testproc2' && procInfo.type === 'Function') {
            console.log('Procedure.Info test successful');
        } else {
            throw new Error('Procedure.Info test failed');
        }

        const allProcInfo = await EasyPostgresql.Procedure().AllInfo();
        if (allProcInfo && Array.isArray(allProcInfo) && allProcInfo.some(p => p.name === 'testproc2')) {
            console.log('Procedure.AllInfo test successful');
        } else {
            throw new Error('Procedure.AllInfo test failed');
        }

        const connected = await EasyPostgresql.IsConnected();
        if (connected && connected.status === 200) {
            console.log('IsConnected test successful');
        } else {
            throw new Error('IsConnected test failed');
        }

        await EasyPostgresql.Query('DROP FUNCTION IF EXISTS TestProc2');
        console.log('Procedure info and IsConnected tests completed successfully\n');
    } catch (error) {
        console.error('Procedure info tests failed:', error);
        process.exit(1);
    }

    console.log('All tests completed!');
    process.exit(0);
});
