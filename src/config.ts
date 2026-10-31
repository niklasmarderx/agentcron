import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { z } from 'zod';

const SourceSchema = z.object({ type: z.string() }).catchall(z.unknown());
const OutputSchema = z.object({ type: z.string() }).catchall(z.unknown());

const JobSchema = z.object({
  name: z.string(),
  schedule: z.string().optional(),
  prompt: z.string(),
  sources: z.array(SourceSchema).default([]),
  outputs: z.array(OutputSchema).default([{ type: 'console' }]),
});

const ConfigSchema = z.object({ jobs: z.array(JobSchema) });

export type Job = z.infer<typeof JobSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export function parseConfig(text: string): Config {
  return ConfigSchema.parse(parse(text));
}

export function loadConfig(path: string): Config {
  return parseConfig(readFileSync(path, 'utf8'));
}

export const SAMPLE_CONFIG = `# agentcron jobs
jobs:
  - name: daily-github-digest
    schedule: "7 8 * * *"   # every day at 08:07
    sources:
      - type: github
        user: niklasmarderx
    prompt: |
      You are my morning assistant. Summarize the activity across these
      repositories into a short, friendly digest. Call out repos with open
      issues and anything pushed recently.
    outputs:
      - type: console
      - type: file
        path: ./digests/{{date}}.md
`;
