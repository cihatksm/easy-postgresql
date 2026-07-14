#### Module Download

```bash
  npm install easy-postgresql
```

#### Simple Usage
```js
const config = require('./config');

const { Connect, Table, Request } = require('easy-postgresql');

const date = () => new Date();
console.log(date(), 'System opened!');

Connect(config.sql);

setTimeout(async () => {
    // const user = await Table('company').findOne({ id: 1 });
    // console.log(user);

    // const info = await Table('company').functions.info();
    // console.log(info); 

    // const procedure = await Request.procedure('GetCompany', { companyId: 1 });
    // console.log(procedure);

    // const query = await Request.query('SELECT * FROM company');
    // console.log(query);

    // const simple_scheme = require('./simple_scheme');
    // const createdTable = await Table('company').functions.create(simple_scheme.dataTypes);
    // console.log(createdTable);

    // const removedTable = await Table('company').functions.remove();
    // console.log(removedTable);
}, 1000);

```

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

#### Feedback

**E-mail:** me@cihatksm.com
