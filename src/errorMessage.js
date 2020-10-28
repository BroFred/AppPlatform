// TODO This add custom error message
import { startsWith, split } from 'ramda';

const pathComponents = split('/');
const DATA_SOURCE = "dataSource";
const TOKEN = "token";

const getMesage = (dataPath) => {
  const isDataSource = startsWith(DATA_SOURCE,split(dataPath));
}