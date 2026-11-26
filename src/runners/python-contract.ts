import type { CodeReply, CodeRequest } from './code-evaluate';

export type PythonRequest = Omit<CodeRequest, 'language'>;
export type PythonRunner = (request: PythonRequest) => Promise<CodeReply>;

export type PythonCommand = { type: 'load' } | { type: 'run'; request: PythonRequest };
export type PythonMessage =
  | { type: 'ready' }
  | { type: 'load-error' }
  | { type: 'run-error'; message: string }
  | { type: 'result'; reply: CodeReply };

export function pythonName(exportName: string): string {
  return exportName.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}
