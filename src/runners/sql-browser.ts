import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url&no-inline';
import { createSqlRunner } from './sql';

let sqlite: ReturnType<typeof initSqlJs> | undefined;

export const sqlRunner = createSqlRunner(() => {
  sqlite ??= initSqlJs({ locateFile: () => wasmUrl }).catch((error) => {
    sqlite = undefined;
    throw error;
  });
  return sqlite;
});
