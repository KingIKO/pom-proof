import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { root } from './problems';

export interface TrackFile {
  role: string;
  title: string;
  sections: Array<{ title: string; problems: string[]; questions: string[] }>;
}

/** Track files in the order the site lists them (2G's role order). */
export function discoverTracks(): TrackFile[] {
  const order = ['manual-qa', 'automation', 'sdet', 'senior'];
  const base = join(root, 'content', 'tracks');
  return readdirSync(base)
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => parse(readFileSync(join(base, file), 'utf8')) as TrackFile)
    .sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));
}
