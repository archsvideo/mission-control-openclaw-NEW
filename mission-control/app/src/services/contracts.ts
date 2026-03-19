import fs from 'node:fs';
import path from 'node:path';

/**
 * Placeholder contract loader.
 * In runtime web build, replace with static imports or fetched JSON.
 */
export function loadContract(contractFile: string) {
  const p = path.resolve(process.cwd(), 'mission-control', 'contracts', contractFile);
  const txt = fs.readFileSync(p, 'utf-8');
  return JSON.parse(txt);
}

export function validateWithContract(_schema: unknown, payload: unknown): { valid: boolean; errors?: string[] } {
  // TODO: wire Ajv/Zod real validation in web app runtime
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload is not an object'] };
  }
  return { valid: true };
}
