import fetchData from './fetchData';
import loadDb from './loadDb';

const url =
  'https://data.economie.gouv.fr/api/datasets/1.0/balances-comptables-des-collectivites-et-des-etablissements-publics-locaux-avec0/attachments/balancespl_fonction_2018_juin2019_zip';

fetchData(url)
  .then(loadDb)
  .catch(err => console.error(err));
