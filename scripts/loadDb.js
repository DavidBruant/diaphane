import { createReadStream } from 'fs';
import { MongoClient } from 'mongodb';
import format from 'format-number';
import logUpdate from 'log-update';
import chalk from 'chalk';
import csv from 'csv-parser';

const url = 'mongodb://localhost:27017';
const dbName = 'diaphane';
const collectionNames = ['entities', 'collections'];

const BATCH_SIZE = 1000000;

let start = Date.now();
let paused = false;
let lineCount = 0;

const formatNb = format({ integerSeparator: '.', truncate: true });

function createLogger(stream) {
  let i = 0;
  return setInterval(() => {
    i = ++i % 4;

    const dots = Array(i)
      .fill('.')
      .concat(Array(4 - i).fill(' '))
      .join('');

    const lines = `${formatNb(lineCount)} lignes`;
    const info = stream.isPaused()
      ? `Intégration en base de données${dots}`
      : `Lecture des données${dots}`;

    logUpdate(`${info}\n${chalk.gray(lines)}`);
  }, 500);
}

export default function(path) {
  return MongoClient.connect(url, { useNewUrlParser: true })
    .then(async client => {
      console.log(`${chalk.green('✔')} Connecté à la base de données`);

      const db = client.db(dbName);

      const collections = await db.collections();
      const collectionsInDb = collections.map(c => c.collectionName);

      const [entityCol, operationCol] = await Promise.all(
        collectionNames.map(async name => {
          if (collectionsInDb.includes(name)) {
            await db.dropCollection(name);
          }
          return db.createCollection(name);
        }),
      );

      const siretSet = new Set();

      let entities = [];
      let operations = [];

      function populateDb() {
        // console.log('Populating Database...');

        const entitiesInsertion = entityCol.insertMany(entities);
        const operationsInsertion = operationCol.insertMany(operations);

        return Promise.all([entitiesInsertion, operationsInsertion]).then(
          () => {
            // console.log(
            //   `Reading data...\n...batching ${BATCH_SIZE} operations...`,
            // );
            entities = [];
            operations = [];
          },
        );
      }

      // console.log(`Reading data...\n...batching ${BATCH_SIZE} operations...`);
      const stream = createReadStream(path)
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

            lineCount++;

            if (operations.length === BATCH_SIZE) {
              stream.pause();

              await populateDb();
              stream.resume();
            }
          },
        )
        .on('end', async () => {
          await populateDb();
          const adminDb = db.admin();

          clearInterval(logger);
          const time = (Date.now() - start) / 1000;
          const lines = `${chalk.green('✔')} ${formatNb(
            lineCount,
          )} lignes lues en ${time}s\n`;

          logUpdate(lines);

          client.close();
        });
      const logger = createLogger(stream);
    })
    .catch(err => console.error(err));
}
