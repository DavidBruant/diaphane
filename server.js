import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:8000';
const dbName = 'test';

MongoClient.connect(url)
  .then(client => {
    console.log('Connected successfully to server');

    const adminDb = client.db(dbName).admin();
    // List all the available databases
    adminDb.listDatabases(function(err, dbs) {
      console.log('DBS length', dbs.databases);
      client.close();
    });
  })
  .catch(err => console.error(err));
