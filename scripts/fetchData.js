import { createWriteStream } from 'fs';
import { join } from 'path';
import logUpdate from 'log-update';
import chalk from 'chalk';
import unzipper from 'unzipper';
import fetch from 'node-fetch';

function createLogger(text) {
  let i = 0;
  return setInterval(() => {
    i = ++i % 4;

    const dots = Array(i)
      .fill('.')
      .join('');

    logUpdate(`${text}${dots}`);
  }, 500);
}

export default function(url) {
  let interval = createLogger('Téléchargement des données');

  return fetch(url)
    .then(res => {
      logUpdate(`${chalk.green('✔')} Données téléchargées`);
      logUpdate.done();
      clearInterval(interval);
      interval = createLogger('Décompression des données');

      let fileName;

      return res.body
        .pipe(unzipper.Parse())
        .on('entry', entry => {
          const { path, type } = entry;
          if (type === 'File' && path.endsWith('.csv')) {
            fileName = join(__dirname, `../data/${path}`);
            entry.pipe(createWriteStream(fileName));
          } else {
            entry.autodrain();
          }
        })
        .promise()
        .then(() => fileName);
    })
    .then(path => {
      clearInterval(interval);
      logUpdate(
        `${chalk.green('✔')} Données dézippées dans ${chalk.blue.italic(path)}`,
      );
      logUpdate.done();
      clearInterval(interval);
      return path;
    })
    .catch(err => console.error('Error:', err));
}
