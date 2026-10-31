import type { Job } from './config.js';
import type { LlmProvider } from './llm.js';
import { gather, type Source } from './sources.js';
import { deliver, type Output } from './outputs.js';

/** Gather a job's sources, summarize with the LLM, and deliver to its outputs. */
export async function runJob(job: Job, provider: LlmProvider): Promise<string> {
  const context = await gather(job.sources as Source[]);
  const prompt = context
    ? `${job.prompt}\n\n---\nContext:\n${context}`
    : job.prompt;
  const result = await provider.complete(prompt);
  const ctx = { date: new Date().toISOString().slice(0, 10), job: job.name };
  await deliver(job.outputs as Output[], result, ctx);
  return result;
}
