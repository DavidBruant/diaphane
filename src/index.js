import express, { Router } from 'express';
import { Server } from 'http';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const network = process.env.NODE_ENV === 'development' ? 'localhost' : 'mongo';

const url = `mongodb://${network}:27017`;
const dbName = 'diaphane';

const PORT = 4000;

const app = express();
var http = Server(app);

app.use(bodyParser.json());

const api = Router();

MongoClient.connect(url).then(async client => {
  console.log('Connected successfully to server');
  const db = client.db(dbName);

  const entityCol = db.collection('entities');
  const operationCol = db.collection('operations');

  api.get('/entities', (req, res) => {
    entityCol
      .find({})
      .toArray()
      .then(entities => res.send(entities));
  });

  api.get('/operations', (req, res) => {
    operationCol
      .find({})
      .limit(3)
      .toArray()
      .then(operations => res.send(operations));
  });

  api.get('/operations/:siret', (req, res) => {
    const siret = req.params.siret;
    const year = req.query.year;

    const query = year
      ? {
          IDENT: siret,
          EXER: year,
        }
      : {
          IDENT: siret,
        };

    operationCol
      .find(query)
      .toArray()
      .then(operations => {
        if (!operations.length)
          res.status(404).send(`SIRET ${siret} does not exist`);
        res.send(operations);
      });
  });

  app.use('/', api);
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
