import { describe, it, expect } from 'vitest';
import { parseConfig } from './config.js';

describe('config', () => {
  it('parses jobs with defaults', () => {
    const cfg = parseConfig(`
jobs:
  - name: hello
    prompt: say hi
`);
    expect(cfg.jobs).toHaveLength(1);
    expect(cfg.jobs[0].name).toBe('hello');
    expect(cfg.jobs[0].outputs).toEqual([{ type: 'console' }]);
    expect(cfg.jobs[0].sources).toEqual([]);
  });

  it('rejects a job without a prompt', () => {
    expect(() => parseConfig('jobs:\n  - name: bad\n')).toThrow();
  });
});
