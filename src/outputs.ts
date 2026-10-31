import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface Output {
  type: string;
  [key: string]: unknown;
}

export interface DeliverContext {
  date: string;
  job: string;
}

export async function deliver(outputs: Output[], content: string, ctx: DeliverContext): Promise<void> {
  for (const out of outputs) {
    switch (out.type) {
      case 'console':
        process.stdout.write(content + '\n');
        break;
      case 'file': {
        const path = render(String(out.path ?? 'agentcron-{{job}}-{{date}}.md'), ctx);
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, content, 'utf8');
        break;
      }
      case 'webhook':
        await fetch(String(out.url), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: content, job: ctx.job, date: ctx.date }),
        });
        break;
      default:
        process.stderr.write(`[unknown output: ${out.type}]\n`);
    }
  }
}

function render(template: string, ctx: DeliverContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => (ctx as unknown as Record<string, string>)[key] ?? '');
}
