/// <reference types="astro/client" />
/// <reference types="vite/client" />

declare module 'sql.js' {
  type SqlValue = number | string | Uint8Array | null;
  interface QueryResult {
    columns: string[];
    values: SqlValue[][];
  }
  interface Database {
    exec(sql: string): QueryResult[];
    close(): void;
  }
  export default function initSqlJs(options: {
    locateFile: (file: string) => string;
  }): Promise<{ Database: new () => Database }>;
}
