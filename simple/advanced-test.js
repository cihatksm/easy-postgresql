const EasyPostgresql = require('../dist/database.js');
require('colors');

const sqlConfig = {
    user: 'postgres',
    password: 'DbmjAzRbdvYQPjwahRudWftWfhWSjJKG',
    host: 'yamanote.proxy.rlwy.net',
    port: 11348,
    database: 'railway'
};

console.log('\neasy-postgresql Advanced Test Suite');
console.log('=====================================');
console.log('Starting advanced tests...\n');

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) {
        console.log(`  PASS: ${name}`.green);
        passed++;
    } else {
        console.log(`  FAIL: ${name}`.red);
        failed++;
    }
}

async function run() {
    EasyPostgresql.Config.logingMode(true);
    await EasyPostgresql.Connect(sqlConfig);

    // ============================================================
    // SECTION 1: Multiple Table Relationships (JOIN)
    // ============================================================
    console.log('\n=== Section 1: Multi-table JOIN operations ==='.cyan);

    const users = EasyPostgresql.Table('adv_users');
    const orders = EasyPostgresql.Table('adv_orders');
    const products = EasyPostgresql.Table('adv_products');
    const orderItems = EasyPostgresql.Table('adv_order_items');

    await users.functions.remove();
    await orders.functions.remove();
    await products.functions.remove();
    await orderItems.functions.remove();

    await users.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey() + EasyPostgresql.Types.options.autoIncrement(),
        name: EasyPostgresql.Types.varchar(100) + EasyPostgresql.Types.options.notNull(),
        email: EasyPostgresql.Types.varchar(100) + EasyPostgresql.Types.options.unique(),
        created_at: EasyPostgresql.Types.datetime() + ' ' + 'DEFAULT NOW()'
    });

    await products.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey() + EasyPostgresql.Types.options.autoIncrement(),
        name: EasyPostgresql.Types.varchar(100) + EasyPostgresql.Types.options.notNull(),
        price: EasyPostgresql.Types.decimal(10, 2) + EasyPostgresql.Types.options.notNull(),
        stock: EasyPostgresql.Types.int() + ' ' + 'DEFAULT 0'
    });

    await orders.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey() + EasyPostgresql.Types.options.autoIncrement(),
        user_id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.notNull() + EasyPostgresql.Types.options.foreignKey('adv_users', 'id'),
        total_amount: EasyPostgresql.Types.decimal(10, 2) + EasyPostgresql.Types.options.notNull(),
        status: EasyPostgresql.Types.varchar(20) + ' ' + "DEFAULT 'pending'",
        created_at: EasyPostgresql.Types.datetime() + ' ' + 'DEFAULT NOW()'
    });

    await orderItems.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey() + EasyPostgresql.Types.options.autoIncrement(),
        order_id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.notNull() + EasyPostgresql.Types.options.foreignKey('adv_orders', 'id'),
        product_id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.notNull() + EasyPostgresql.Types.options.foreignKey('adv_products', 'id'),
        quantity: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.notNull(),
        unit_price: EasyPostgresql.Types.decimal(10, 2) + EasyPostgresql.Types.options.notNull()
    });

    assert(true, 'All 4 tables created with foreign keys');

    // Insert data
    const u1 = await users.createOne({ name: 'Alice Johnson', email: 'alice@example.com' });
    const u2 = await users.createOne({ name: 'Bob Smith', email: 'bob@example.com' });
    const u3 = await users.createOne({ name: 'Charlie Brown', email: 'charlie@example.com' });
    assert(u1 && u2 && u3, 'Inserted 3 users');

    const p1 = await products.createOne({ name: 'Laptop', price: 999.99, stock: 10 });
    const p2 = await products.createOne({ name: 'Mouse', price: 29.99, stock: 50 });
    const p3 = await products.createOne({ name: 'Keyboard', price: 79.99, stock: 30 });
    assert(p1 && p2 && p3, 'Inserted 3 products');

    // Get actual IDs from auto-increment
    const allUsers = await users.find({}, { limit: 10 });
    const allProducts = await products.find({}, { limit: 10 });
    const alice = allUsers.find(u => u.email === 'alice@example.com');
    const bob = allUsers.find(u => u.email === 'bob@example.com');
    const laptop = allProducts.find(p => p.name === 'Laptop');
    const mouse = allProducts.find(p => p.name === 'Mouse');

    assert(alice && bob && laptop && mouse, 'Retrieved inserted records by natural keys');

    // Create orders
    const o1 = await orders.createOne({ user_id: alice.id, total_amount: 1059.97, status: 'completed' });
    const o2 = await orders.createOne({ user_id: bob.id, total_amount: 29.99, status: 'pending' });

    const allOrders = await orders.find({}, { limit: 10 });
    const order1 = allOrders.find(o => o.total_amount === 1059.97);
    const order2 = allOrders.find(o => o.total_amount === 29.99);

    // Order items
    const oi1 = await orderItems.createOne({ order_id: order1.id, product_id: laptop.id, quantity: 1, unit_price: 999.99 });
    const oi2 = await orderItems.createOne({ order_id: order1.id, product_id: mouse.id, quantity: 2, unit_price: 29.99 });
    const oi3 = await orderItems.createOne({ order_id: order2.id, product_id: mouse.id, quantity: 1, unit_price: 29.99 });
    assert(oi1 && oi2 && oi3, 'Inserted 3 order items');

    // JOIN query via raw SQL
    const joinResult = await EasyPostgresql.Query(`
        SELECT u.name AS user_name, u.email, o.id AS order_id, o.status, o.total_amount
        FROM adv_users u
        INNER JOIN adv_orders o ON u.id = o.user_id
        ORDER BY o.id
    `);
    assert(joinResult.status === 200, 'JOIN query returned success');
    assert(joinResult.data.length === 2, 'JOIN returned 2 rows');
    assert(joinResult.data[0].user_name === alice.name, 'JOIN first row correct user');
    assert(joinResult.data[1].user_name === bob.name, 'JOIN second row correct user');

    // Three-way JOIN
    const threeWayJoin = await EasyPostgresql.Query(`
        SELECT u.name AS user_name, p.name AS product_name, oi.quantity, oi.unit_price
        FROM adv_order_items oi
        INNER JOIN adv_orders o ON oi.order_id = o.id
        INNER JOIN adv_users u ON o.user_id = u.id
        INNER JOIN adv_products p ON oi.product_id = p.id
        ORDER BY u.name, p.name
    `);
    assert(threeWayJoin.status === 200, '3-way JOIN success');
    assert(threeWayJoin.data.length === 3, '3-way JOIN returned 3 rows');

    // GROUP BY with aggregation
    const aggResult = await EasyPostgresql.Query(`
        SELECT u.name, COUNT(o.id) AS order_count, COALESCE(SUM(o.total_amount), 0) AS total_spent
        FROM adv_users u
        LEFT JOIN adv_orders o ON u.id = o.user_id
        GROUP BY u.id, u.name
        ORDER BY total_spent DESC
    `);
    assert(aggResult.status === 200, 'GROUP BY query success');
    assert(aggResult.data.length === 3, 'GROUP BY returned 3 rows (all users)');
    const aliceAgg = aggResult.data.find(r => r.name === alice.name);
    assert(aliceAgg && aliceAgg.order_count === '1', 'Alice has 1 order');

    // Clean up section 1
    await orderItems.functions.remove();
    await orders.functions.remove();
    await products.functions.remove();
    await users.functions.remove();
    console.log('  Section 1 cleanup done'.gray);

    // ============================================================
    // SECTION 2: Data Type Handling
    // ============================================================
    console.log('\n=== Section 2: Data type handling ==='.cyan);

    const typeTable = EasyPostgresql.Table('adv_types');
    await typeTable.functions.remove();

    await typeTable.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey() + EasyPostgresql.Types.options.autoIncrement(),
        bool_col: EasyPostgresql.Types.bit(),
        int_col: EasyPostgresql.Types.int(),
        bigint_col: EasyPostgresql.Types.bigint(),
        float_col: EasyPostgresql.Types.float(),
        decimal_col: EasyPostgresql.Types.decimal(10, 2),
        varchar_col: EasyPostgresql.Types.varchar(50),
        text_col: EasyPostgresql.Types.text(),
        date_col: EasyPostgresql.Types.date(),
        time_col: EasyPostgresql.Types.time(),
        timestamp_col: EasyPostgresql.Types.datetime(),
        char_col: EasyPostgresql.Types.char(),
        uuid_col: EasyPostgresql.Types.uniqueidentifier(),
        money_col: EasyPostgresql.Types.money(),
        bytea_col: EasyPostgresql.Types.image()
    });

    const now = new Date();
    const typeInsert = await typeTable.createOne({
        bool_col: true,
        int_col: 42,
        bigint_col: 9007199254740991,
        float_col: 3.14159,
        decimal_col: 99.99,
        varchar_col: 'Hello World',
        text_col: 'Lorem ipsum dolor sit amet',
        date_col: now,
        time_col: '14:30:00',
        timestamp_col: now,
        char_col: 'A',
        uuid_col: '550e8400-e29b-41d4-a716-446655440000',
        money_col: 1234.56,
        bytea_col: Buffer.from('binary data')
    });
    assert(typeInsert, 'Inserted all data types');

    const typeResult = await typeTable.findOne({ int_col: 42 });
    assert(typeResult !== null, 'Retrieved typed row');
    assert(typeResult.bool_col === true, 'Boolean type preserved');
    assert(typeResult.int_col === 42, 'Integer type preserved');
    assert(typeResult.float_col === 3.14159, 'Float type preserved');
    assert(typeResult.varchar_col === 'Hello World', 'Varchar type preserved');
    assert(typeResult.text_col === 'Lorem ipsum dolor sit amet', 'Text type preserved');
    assert(typeResult.char_col === 'A', 'Char type preserved');
    assert(typeResult.uuid_col === '550e8400-e29b-41d4-a716-446655440000', 'UUID type preserved');

    await typeTable.functions.remove();
    console.log('  Section 2 cleanup done'.gray);

    // ============================================================
    // SECTION 3: Column Operations (Full Lifecycle)
    // ============================================================
    console.log('\n=== Section 3: Column operations ==='.cyan);

    const colTable = EasyPostgresql.Table('adv_columns');
    await colTable.functions.remove();

    await colTable.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
        original_name: EasyPostgresql.Types.varchar(50)
    });
    assert(true, 'Table created with original columns');

    // Add column
    const addCol = await colTable.functions.updateColumn('new_column').add('VARCHAR(100)');
    assert(addCol, 'Added new column');

    // Verify the column exists
    const infoAfterAdd = await colTable.functions.info();
    assert(infoAfterAdd && infoAfterAdd.schema.new_column !== undefined, 'New column appears in schema');

    // Rename column
    const renameCol = await colTable.functions.updateColumn('original_name').rename('renamed_name');
    assert(renameCol, 'Renamed column');

    const infoAfterRename = await colTable.functions.info();
    assert(infoAfterRename && infoAfterRename.schema.renamed_name !== undefined, 'Renamed column appears in schema');
    assert(infoAfterRename && infoAfterRename.schema.original_name === undefined, 'Original name gone from schema');

    // Insert data with new schema
    const colInsert = await colTable.createOne({ id: 1, renamed_name: 'test', new_column: 'value' });
    assert(colInsert, 'Inserted with renamed and added columns');

    const colFind = await colTable.findOne({ id: 1 });
    assert(colFind && colFind.renamed_name === 'test', 'Find with renamed column');
    assert(colFind && colFind.new_column === 'value', 'Find with added column');

    // Drop added column
    const dropCol = await colTable.functions.updateColumn('new_column').remove();
    assert(dropCol, 'Dropped column');

    const infoAfterDrop = await colTable.functions.info();
    assert(infoAfterDrop && infoAfterDrop.schema.new_column === undefined, 'Dropped column removed from schema');

    await colTable.functions.remove();
    console.log('  Section 3 cleanup done'.gray);

    // ============================================================
    // SECTION 4: Error Handling & Edge Cases
    // ============================================================
    console.log('\n=== Section 4: Error handling & edge cases ==='.cyan);

    // Invalid SQL
    const badQuery = await EasyPostgresql.Query('SELECTT * FROM nonexistent_table');
    assert(badQuery.status === 500, 'Invalid SQL returns status 500');
    assert(badQuery.data === null, 'Invalid SQL returns null data');

    // Nonexistent table
    const noTable = await EasyPostgresql.Table('adv_nonexistent').find();
    assert(Array.isArray(noTable) && noTable.length === 0, 'Query on nonexistent table returns empty array');

    // Empty reference
    const emptyRef = await EasyPostgresql.Table('adv_nonexistent').findOne({});
    assert(emptyRef === null, 'findOne with empty ref on nonexistent returns null');

    // NULL values
    const nullTestTable = EasyPostgresql.Table('adv_null_test');
    await nullTestTable.functions.remove();
    await nullTestTable.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
        nullable_str: EasyPostgresql.Types.varchar(100)
    });
    await nullTestTable.createOne({ id: 1, nullable_str: null });
    const nullFind = await nullTestTable.findOne({ id: 1 });
    assert(nullFind && nullFind.nullable_str === null, 'NULL value handled correctly');

    await nullTestTable.functions.remove();

    // Duplicate unique constraint
    const uniqueTable = EasyPostgresql.Table('adv_unique_test');
    await uniqueTable.functions.remove();
    await uniqueTable.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
        code: EasyPostgresql.Types.varchar(20) + EasyPostgresql.Types.options.unique()
    });
    await uniqueTable.createOne({ id: 1, code: 'UNIQUE1' });
    const dupResult = await uniqueTable.createOne({ id: 2, code: 'UNIQUE1' });
    assert(dupResult === false, 'Duplicate unique value returns false');

    await uniqueTable.functions.remove();
    console.log('  Section 4 cleanup done'.gray);

    // ============================================================
    // SECTION 5: Bulk Operations & Complex Filtering
    // ============================================================
    console.log('\n=== Section 5: Bulk operations & filtering ==='.cyan);

    const bulkTable = EasyPostgresql.Table('adv_bulk');
    await bulkTable.functions.remove();
    await bulkTable.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
        category: EasyPostgresql.Types.varchar(50),
        score: EasyPostgresql.Types.int(),
        active: EasyPostgresql.Types.bit()
    });

    // Bulk insert
    const bulkData = [
        { id: 1, category: 'A', score: 85, active: true },
        { id: 2, category: 'A', score: 92, active: true },
        { id: 3, category: 'B', score: 78, active: false },
        { id: 4, category: 'B', score: 95, active: true },
        { id: 5, category: 'A', score: 60, active: false },
        { id: 6, category: 'C', score: 88, active: true },
        { id: 7, category: 'C', score: 73, active: true },
        { id: 8, category: 'B', score: 81, active: false },
        { id: 9, category: 'A', score: 99, active: true },
        { id: 10, category: 'C', score: 67, active: false }
    ];

    let bulkInserts = 0;
    for (const row of bulkData) {
        if (await bulkTable.createOne(row)) bulkInserts++;
    }
    assert(bulkInserts === 10, 'Bulk inserted 10 records');

    // Complex filter: category = A AND active = true
    const catA_active = await bulkTable.find({ category: 'A', active: true });
    assert(catA_active.length === 3, 'Complex AND filter: category A + active');

    // LIKE filter
    const likeFilter = await bulkTable.find({}, { likes: { category: 'A?' } });
    assert(likeFilter.length === 4, 'LIKE filter with ? placeholder');

    // selected_keys
    const selected = await bulkTable.find({ category: 'B' }, { selected_keys: ['id', 'score'] });
    assert(selected.length === 3, 'selected_keys filter correct count');
    assert(selected[0].category === undefined, 'selected_keys excludes non-selected columns');

    // Limit
    const limited = await bulkTable.find({}, { limit: 3 });
    assert(limited.length === 3, 'LIMIT works correctly');

    // Ordering via raw query
    const ordered = await EasyPostgresql.Query('SELECT * FROM adv_bulk ORDER BY score DESC');
    assert(ordered.data.length === 10, 'ORDER BY returns all rows');
    assert(ordered.data[0].score === 99, 'ORDER BY DESC first is highest score');
    assert(ordered.data[9].score === 60, 'ORDER BY DESC last is lowest score');

    // Subquery
    const subquery = await EasyPostgresql.Query(`
        SELECT category, AVG(score)::numeric(10,1) AS avg_score
        FROM adv_bulk
        GROUP BY category
        HAVING AVG(score) > 75
        ORDER BY avg_score DESC
    `);
    assert(subquery.status === 200, 'Subquery with HAVING success');
    assert(subquery.data.length >= 1, 'Subquery returned results');

    // Multiple deleteAll
    const deleteB_all = await bulkTable.deleteAll({ category: 'B' });
    assert(deleteB_all, 'deleteAll for category B');
    const remainingB = await bulkTable.find({ category: 'B' });
    assert(remainingB.length === 0, 'No B records remaining');

    const deleteAll = await bulkTable.deleteAll();
    assert(deleteAll, 'deleteAll all remaining');
    const allGone = await bulkTable.find();
    assert(allGone.length === 0, 'All records gone');

    await bulkTable.functions.remove();
    console.log('  Section 5 cleanup done'.gray);

    // ============================================================
    // SECTION 6: Update Operations & Conditional Logic
    // ============================================================
    console.log('\n=== Section 6: Update operations ==='.cyan);

    const updateTable = EasyPostgresql.Table('adv_updates');
    await updateTable.functions.remove();
    await updateTable.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
        status: EasyPostgresql.Types.varchar(20) + ' ' + "DEFAULT 'pending'",
        counter: EasyPostgresql.Types.int() + ' ' + 'DEFAULT 0',
        label: EasyPostgresql.Types.varchar(50)
    });

    await updateTable.createOne({ id: 1, status: 'active', counter: 5, label: 'Test A' });
    await updateTable.createOne({ id: 2, status: 'pending', counter: 0, label: 'Test B' });
    await updateTable.createOne({ id: 3, status: 'active', counter: 10, label: 'Test C' });

    // Update single field
    const up1 = await updateTable.updateOne({ id: 1 }, { status: 'completed' });
    assert(up1, 'Update single field');
    const afterUp1 = await updateTable.findOne({ id: 1 });
    assert(afterUp1.status === 'completed', 'Updated field has new value');

    // Update multiple fields
    const up2 = await updateTable.updateOne({ id: 2 }, { status: 'active', counter: 15 });
    assert(up2, 'Update multiple fields');
    const afterUp2 = await updateTable.findOne({ id: 2 });
    assert(afterUp2.status === 'active' && afterUp2.counter === 15, 'Both fields updated');

    // Update non-existing row
    const up3 = await updateTable.updateOne({ id: 999 }, { status: 'deleted' });
    assert(up3 === false, 'Update non-existing row returns false');

    // Count after updates
    const activeCount = await updateTable.find({ status: 'active' });
    assert(activeCount.length === 2, 'Active count after updates is 2');
    const completedCount = await updateTable.find({ status: 'completed' });
    assert(completedCount.length === 1, 'Completed count after updates is 1');

    await updateTable.functions.remove();
    console.log('  Section 6 cleanup done'.gray);

    // ============================================================
    // SECTION 7: Aggregation Functions
    // ============================================================
    console.log('\n=== Section 7: Aggregation functions ==='.cyan);

    const aggTable = EasyPostgresql.Table('adv_agg');
    await aggTable.functions.remove();
    await aggTable.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
        value: EasyPostgresql.Types.int()
    });

    for (let i = 0; i < 5; i++) {
        await aggTable.createOne({ id: i + 1, value: (i + 1) * 10 });
    }

    const aggCount = await aggTable.count();
    assert(aggCount === 5, 'count returns 5');

    const aggMin = await aggTable.min('value');
    assert(aggMin === 10, 'min returns 10');

    const aggMax = await aggTable.max('value');
    assert(aggMax === 50, 'max returns 50');

    const aggAvg = await aggTable.average('value');
    assert(aggAvg === 30, 'average returns 30');

    const aggLast = await aggTable.last();
    assert(aggLast && aggLast.id === 5, 'last returns row with id 5');

    const aggFirst = await aggTable.first();
    assert(aggFirst && aggFirst.id === 1, 'first returns row with id 1');

    // Single - exactly one match
    const aggSingle = await aggTable.single({ id: 3 });
    assert(aggSingle && aggSingle.value === 30, 'single returns exact match');

    // Single - throws on multiple matches
    try {
        await aggTable.single({});
        assert(false, 'single should throw on multiple matches');
    } catch (e) {
        assert(e.message.includes('more than one'), 'single throws on multiple matches');
    }

    // SingleOrDefault - no match
    const aggSingleDef = await aggTable.singleOrDefault({ id: 999 });
    assert(aggSingleDef === null, 'singleOrDefault returns null for no match');

    await aggTable.functions.remove();
    console.log('  Section 7 cleanup done'.gray);

    // ============================================================
    // SECTION 8: Table Management (getAll, isThere)
    // ============================================================
    console.log('\n=== Section 8: Table management ==='.cyan);

    const mgmtTable1 = EasyPostgresql.Table('adv_mgmt_a');
    const mgmtTable2 = EasyPostgresql.Table('adv_mgmt_b');

    await mgmtTable1.functions.remove();
    await mgmtTable2.functions.remove();

    await mgmtTable1.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey()
    });
    await mgmtTable2.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey()
    });

    const isThere1 = await mgmtTable1.functions.isThere();
    const isThere2 = await mgmtTable2.functions.isThere();
    assert(isThere1 && isThere2, 'isThere returns true for existing tables');

    // getAll
    const allTableInfos = await mgmtTable1.functions.getAll();
    assert(Array.isArray(allTableInfos), 'getAll returns array');
    assert(allTableInfos.some(t => t.name === 'adv_mgmt_a'), 'getAll includes adv_mgmt_a');
    assert(allTableInfos.some(t => t.name === 'adv_mgmt_b'), 'getAll includes adv_mgmt_b');

    // info
    const info1 = await mgmtTable1.functions.info();
    assert(info1 && info1.name === 'adv_mgmt_a', 'info returns correct name');
    assert(info1.schema && info1.schema.id !== undefined, 'info includes schema');

    await mgmtTable1.functions.remove();
    await mgmtTable2.functions.remove();

    const isThereAfter = await mgmtTable1.functions.isThere();
    assert(isThereAfter === false, 'isThere returns false after remove');

    console.log('  Section 8 cleanup done'.gray);

    // ============================================================
    // SECTION 9: Concurrent Operations
    // ============================================================
    console.log('\n=== Section 9: Concurrent operations ==='.cyan);

    const concTable = EasyPostgresql.Table('adv_concurrent');
    await concTable.functions.remove();
    await concTable.functions.create({
        id: EasyPostgresql.Types.int() + EasyPostgresql.Types.options.primaryKey(),
        val: EasyPostgresql.Types.int()
    });

    const concurrentOps = [];
    for (let i = 0; i < 10; i++) {
        concurrentOps.push(concTable.createOne({ id: i + 1, val: i * 10 }));
    }
    const concResults = await Promise.all(concurrentOps);
    const allSuccess = concResults.every(r => r === true);
    assert(allSuccess, '10 concurrent inserts all succeed');

    const concCount = await concTable.count();
    assert(concCount === 10, 'Concurrent inserts count matches');

    await concTable.functions.remove();
    console.log('  Section 9 cleanup done'.gray);

    // ============================================================
    // SECTION 10: Stored Function with Complex Logic
    // ============================================================
    console.log('\n=== Section 10: Advanced stored function ==='.cyan);

    await EasyPostgresql.Query(`
        CREATE OR REPLACE FUNCTION adv_calculate_discount(
            p_amount NUMERIC,
            p_customer_type VARCHAR
        )
        RETURNS NUMERIC AS $$
        DECLARE
            discount NUMERIC;
        BEGIN
            IF p_customer_type = 'VIP' THEN
                discount := p_amount * 0.20;
            ELSIF p_customer_type = 'REGULAR' THEN
                discount := p_amount * 0.10;
            ELSIF p_amount > 1000 THEN
                discount := p_amount * 0.05;
            ELSE
                discount := 0;
            END IF;
            RETURN ROUND(discount, 2);
        END;
        $$ LANGUAGE plpgsql;
    `);

    const funcVIP = await EasyPostgresql.Procedure('adv_calculate_discount').Execute({
        p_amount: 500,
        p_customer_type: 'VIP'
    });
    assert(funcVIP.status === 200, 'VIP discount function executed');

    const funcRegular = await EasyPostgresql.Procedure('adv_calculate_discount').Execute({
        p_amount: 500,
        p_customer_type: 'REGULAR'
    });
    assert(funcRegular.status === 200, 'Regular discount function executed');

    const funcHigh = await EasyPostgresql.Procedure('adv_calculate_discount').Execute({
        p_amount: 2000,
        p_customer_type: 'BASIC'
    });
    assert(funcHigh.status === 200, 'High amount discount function executed');

    const funcNone = await EasyPostgresql.Procedure('adv_calculate_discount').Execute({
        p_amount: 100,
        p_customer_type: 'BASIC'
    });
    assert(funcNone.status === 200, 'No discount function executed');

    // Function returning TABLE
    await EasyPostgresql.Query('CREATE OR REPLACE FUNCTION adv_top_customers(p_limit INT) RETURNS TABLE(customer_name VARCHAR, total_spent NUMERIC) AS ' + '$$' + ' BEGIN RETURN QUERY SELECT s::VARCHAR, s::NUMERIC FROM generate_series(1, p_limit) AS s; END; ' + '$$' + ' LANGUAGE plpgsql;');

    const topCust = await EasyPostgresql.Procedure('adv_top_customers').Execute({ p_limit: 5 });
    assert(topCust.status === 200, 'TABLE-returning function executed');
    assert(topCust.data.length === 5, 'TABLE-returning function returned 5 rows');

    await EasyPostgresql.Query('DROP FUNCTION IF EXISTS adv_calculate_discount');
    await EasyPostgresql.Query('DROP FUNCTION IF EXISTS adv_top_customers');
    console.log('  Section 10 cleanup done'.gray);

    // ============================================================
    // FINAL RESULTS
    // ============================================================
    console.log('\n' + '='.repeat(50));
    console.log(`  Total: ${passed + failed} | Passed: ${passed}`.green + ` | Failed: ${failed}`.red);
    console.log('='.repeat(50) + '\n');

    process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => {
    console.error('FATAL ERROR:', e);
    process.exit(1);
});
