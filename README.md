# easy-postgresql

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

Simple and easy to use PostgreSQL library for Node.js.

## Installation

```bash
npm install easy-postgresql
```

## Quick Start

```js
const { Connect, Table, Query, Procedure, Types } = require('easy-postgresql');

// PostgreSQL connection config
const sqlConfig = {
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'test'
};

// Connect to database
Connect(sqlConfig);

// Optional: enable logging
Config.logingMode(true);

// Check connection status
const status = await IsConnected();
// { status: 200, message: 'OK' }
```

## API Reference

### `Connect(config, callback?)`

Connects to a PostgreSQL database. Creates a connection pool internally.

```js
await Connect({
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'mydb'
});

// With callback
Connect(sqlConfig, (config, err) => {
    if (err) console.error('Connection failed:', err.message);
    else console.log('Connected!');
});
```

### `IsConnected()`

Checks if the database connection is active.

```js
const result = await IsConnected();
console.log(result.status); // 200 if connected
```

### `Table(name)`

Provides CRUD operations and table management for a specific table.

```js
const users = Table('users');

// Find all users
const all = await users.find();

// Find with conditions
const admins = await users.find({ role: 'admin' });

// Find with options
const result = await users.find(
    { active: true },
    { limit: 10, selected_keys: ['id', 'name'], likes: { name: 'A%' } }
);

// Find one
const user = await users.findOne({ id: 1 });

// Create
await users.createOne({ name: 'John', email: 'john@test.com' });

// Update
await users.updateOne({ id: 1 }, { name: 'Jane' });

// Delete
await users.deleteOne({ id: 1 });
await users.deleteAll({ role: 'inactive' });

// Aggregation
const count = await users.count();
const minAge = await users.min('age');
const maxAge = await users.max('age');
const avgAge = await users.average('age');

// LINQ-style methods
const first = await users.first({ active: true });
const last = await users.last({ active: true });
const single = await users.single({ id: 1 });            // throws if 0 or >1
const result = await users.singleOrDefault({ id: 1 });   // null if 0, throws if >1
```

#### Table Management

```js
const table = Table('products');

// Check if table exists
const exists = await table.functions.isThere();

// Get table info (name, type, schema)
const info = await table.functions.info();
// { name: 'products', type: 'Table', date: null, schema: { id: 'integer', ... } }

// Get all tables
const allTables = await table.functions.getAll();

// Create table with schema
const schema = {
    id: Types.int() + Types.options.primaryKey() + Types.options.autoIncrement(),
    name: Types.varchar(100) + Types.options.notNull(),
    price: Types.decimal(10, 2),
    created_at: Types.datetime() + ' DEFAULT NOW()'
};
await table.functions.create(schema);

// Drop table
await table.functions.remove();

// Column operations
await table.functions.updateColumn('email').add('VARCHAR(255)');       // Add
await table.functions.updateColumn('email').remove();                  // Drop
await table.functions.updateColumn('name').rename('full_name');        // Rename
await table.functions.updateColumn('price').update('DECIMAL(12,2)');   // Alter type
```

### `Query(sql, inputs?)`

Executes raw SQL queries. Supports both named parameters (`@paramName`) and positional arrays.

```js
// Simple query
const result = await Query('SELECT * FROM users WHERE active = true');
// { status: 200, message: 'Success', data: [...] }

// With named parameters
const user = await Query(
    'SELECT * FROM users WHERE id = @userId AND role = @role',
    { userId: 1, role: 'admin' }
);

// With positional parameters ($1, $2...)
const result = await Query(
    'SELECT * FROM users WHERE score > $1 AND age < $2',
    [100, 30]
);

// INSERT/UPDATE/DELETE
await Query("INSERT INTO users (name) VALUES (@name)", { name: 'Alice' });
```

### `Procedure(name?)`

Executes and manages PostgreSQL stored functions.

```js
// Execute a stored function
const result = await Procedure('calculate_total').Execute({
    amount: 100,
    tax_rate: 0.18
});
// { status: 200, message: 'Success', data: [...] }

// Get procedure info
const info = await Procedure('calculate_total').Info();
// { name: 'calculate_total', type: 'Function', date: null }

// Get all functions
const allFuncs = await Procedure().AllInfo();

// Get output schema (returns empty for now)
const schema = await Procedure('calculate_total').SimpleOutput();
```

### `Types`

SQL type builders for creating table schemas.

```js
Types.int()                    // INT
Types.bigint()                 // BIGINT
Types.smallint()               // SMALLINT
Types.varchar(255)             // VARCHAR(255)
Types.text()                   // TEXT
Types.bit()                    // BOOLEAN
Types.float()                  // FLOAT
Types.decimal(10, 2)           // DECIMAL(10, 2)
Types.date()                   // DATE
Types.time()                   // TIME
Types.datetime()               // TIMESTAMP
Types.char()                   // CHAR
Types.uuid()                   // UUID (uniqueidentifier)
Types.money()                  // NUMERIC(19,4)
Types.image()                  // BYTEA
Types.xml()                    // XML

// Column options
Types.options.notNull()        // NOT NULL
Types.options.primaryKey()     // PRIMARY KEY
Types.options.unique()         // UNIQUE
Types.options.autoIncrement()  // GENERATED ALWAYS AS IDENTITY
Types.options.default(42)      // DEFAULT 42
Types.options.check('age > 0') // CHECK(age > 0)
Types.options.foreignKey('users', 'id') // REFERENCES users(id)
```

### `Config`

```js
Config.logingMode(true);  // Enable query logging
Config.logingMode(false); // Disable query logging
```

## Error Handling

All operations return a consistent result format:

```js
// Success
{ status: 200, message: 'Success', data: [...] }

// Error
{ status: 500, message: 'Error message', data: null }
```

## Complete Example

```js
const { Connect, Table, Query, Types, Config } = require('easy-postgresql');

Connect({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'test'
});

Config.logingMode(true);

const schema = {
    id: Types.int() + Types.options.primaryKey() + Types.options.autoIncrement(),
    name: Types.varchar(100) + Types.options.notNull(),
    email: Types.varchar(100) + Types.options.unique(),
    age: Types.int(),
    created_at: Types.datetime() + ' DEFAULT NOW()'
};

const users = Table('users');

// Create table
if (!(await users.functions.isThere())) {
    await users.functions.create(schema);
}

// Insert
await users.createOne({ name: 'John Doe', email: 'john@test.com', age: 30 });
await users.createOne({ name: 'Jane Doe', email: 'jane@test.com', age: 25 });

// Query
const allUsers = await users.find();
const john = await users.findOne({ email: 'john@test.com' });
const adults = await users.find({}, { likes: { name: 'J%' } });

// Update
await users.updateOne({ id: john.id }, { age: 31 });

// Delete
await users.deleteOne({ id: john.id });

// Raw query
const stats = await Query(
    'SELECT AVG(age)::numeric(10,1) AS avg_age, COUNT(*) AS total FROM users'
);

// Clean up
await users.functions.remove();
```

## License

MIT

## Feedback

**E-mail:** me@cihatksm.com
