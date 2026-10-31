#!/usr/bin/env node
import { writeFileSync, existsSync } from 'node:fs';
import cron from 'node-cron';
import { loadConfig, SAMPLE_CONFIG } from './config.js';
import { createProvider } from './llm.js';
import { runJob } from './runner.js';

const [command, ...rest] = process.argv.slice(2);

function flag(name: string, fallback: string): string {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] ? rest[i + 1] : fallback;
}

async function main(): Promise<void> {
  const configPath = flag('config', 'agentcron.yaml');

  switch (command) {
    case 'init': {
      if (existsSync('agentcron.yaml')) {
        console.error('agentcron.yaml already exists');
        process.exit(1);
      }
      writeFileSync('agentcron.yaml', SAMPLE_CONFIG, 'utf8');
      console.log('Wrote agentcron.yaml');
      break;
    }
    case 'list': {
      const config = loadConfig(configPath);
      for (const job of config.jobs) {
        console.log(`${job.name}\t${job.schedule ?? '(manual)'}`);
      }
      break;
    }
    case 'run': {
      const name = rest[0];
      if (!name) {
        console.error('usage: agentcron run <job-name>');
        process.exit(1);
      }
      const config = loadConfig(configPath);
      const job = config.jobs.find((j) => j.name === name);
      if (!job) {
        console.error(`no job named ${name}`);
        process.exit(1);
      }
      const provider = createProvider();
      console.error(`running ${name} with ${provider.name} backend…`);
      await runJob(job, provider);
      break;
    }
    case 'start': {
      const config = loadConfig(configPath);
      const provider = createProvider();
      const scheduled = config.jobs.filter((j) => j.schedule);
      for (const job of scheduled) {
        cron.schedule(job.schedule as string, () => {
          runJob(job, provider).catch((e) => console.error(`${job.name} failed:`, e));
        });
        console.error(`scheduled ${job.name} (${job.schedule})`);
      }
      console.error(`agentcron running ${scheduled.length} job(s) with ${provider.name}. Ctrl-C to stop.`);
      break;
    }
    default:
      console.log('agentcron <init|list|run <name>|start> [--config path]');
      if (command && command !== 'help') process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
