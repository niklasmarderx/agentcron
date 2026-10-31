import { describe, it, expect } from 'vitest';
import { runJob } from './runner.js';
import { StubProvider } from './llm.js';
import type { Job } from './config.js';

describe('runJob', () => {
  it('feeds static context into the prompt and returns the stub summary', async () => {
    const job: Job = {
      name: 'test',
      prompt: 'summarize',
      sources: [{ type: 'static', text: 'the-secret-marker' }],
      outputs: [],
    };
    const result = await runJob(job, new StubProvider());
    expect(result).toContain('stub summary');
    expect(result).toContain('the-secret-marker');
  });
});
