import { createReadStream } from 'fs';
import { MongoClient } from 'mongodb';
import csv from 'csv-parser';

const data = './data/BalanceSPL_Fonction_2018_Juin2019.csv';

const url = 'mongodb://localhost:27017';
const dbName = 'diaphane';

const BATCH_SIZE = 1000000;

let start = Date.now();
let localStart = start;
let duration;

let lineCount = 0;

function checkDuration() {
  duration = (Date.now() - localStart) / 1000;
  localStart = Date.now();

  console.log(`...done in ${duration}s`);
}

MongoClient.connect(url)
  .then(async client => {
    console.log('Connected successfully to server');

    const db = client.db(dbName);

    // await db.dropCollection('entities');
    // await db.dropCollection('operations');

    const entityCol = await db.createCollection('entities');
    const operationCol = await db.createCollection('operations');

    const siretSet = new Set();

    let entities = [];
    let operations = [];

    function populateDb() {
      console.log('Populating Database...');

      const entitiesInsertion = entityCol.insertMany(entities);
      const operationsInsertion = operationCol.insertMany(operations);

      return Promise.all([entitiesInsertion, operationsInsertion]).then(() => {
        checkDuration();
        console.log(`Reading data...\n...batching ${BATCH_SIZE} operations...`);
        entities = [];
        operations = [];
      });
    }

    console.log(`Reading data...\n...batching ${BATCH_SIZE} operations...`);
    const stream = createReadStream(data)
      .pipe(csv({ separator: ';' }))
      .on(
        'data',
        async ({
          siren,
          IDENT,
          NDEPT,
          INSEE,
          CTYPE,
          CSTYP,
          NOMEN,
          CREGI,
          CACTI,
          SECTEUR,
          FINESS,
          CATEG,
          CODBUD1,
          ...rest
        }) => {
          if (!siretSet.has(IDENT)) {
            siretSet.add(IDENT);

            entities.push({
              _id: IDENT,
              siren,
              IDENT,
              NDEPT,
              INSEE,
              CTYPE,
              CSTYP,
              NOMEN,
              CREGI,
              CACTI,
              SECTEUR,
              FINESS,
              CATEG,
              CODBUD1,
            });
          }

          operations.push({
            IDENT,
            ...rest,
          });

          if (operations.length === BATCH_SIZE) {
            stream.pause();
            checkDuration();
            await populateDb();
            stream.resume();
          }

          lineCount++;
        },
      )
      .on('end', async () => {
        await populateDb();
        const adminDb = db.admin();

        const dbs = await adminDb.listDatabases();
        const diaphaneDb = dbs.databases.filter(db => db.name === dbName);

        client.close();

        duration = (Date.now() - start) / 1000;
        console.log(`Read and processed ${lineCount} lines in ${duration}s`);
        console.log(`${dbName} populated with`, diaphaneDb);
      });
  })
  .catch(err => console.error(err));
