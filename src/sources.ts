/** A source gathers context text that gets fed to the LLM before a job runs. */
export interface Source {
  type: string;
  [key: string]: unknown;
}

const MAX_CHARS = 8000;

export async function gather(sources: Source[]): Promise<string> {
  const parts: string[] = [];
  for (const source of sources) {
    try {
      parts.push(await gatherOne(source));
    } catch (e) {
      parts.push(`[source ${source.type} failed: ${(e as Error).message}]`);
    }
  }
  return parts.join('\n\n');
}

async function gatherOne(source: Source): Promise<string> {
  switch (source.type) {
    case 'static':
      return String(source.text ?? '');
    case 'http':
      return `# ${source.url}\n${(await fetchText(String(source.url))).slice(0, MAX_CHARS)}`;
    case 'github':
      return githubActivity(String(source.user), source.repos as string[] | undefined);
    default:
      return `[unknown source: ${source.type}]`;
  }
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'agentcron' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function githubActivity(user: string, only?: string[]): Promise<string> {
  const headers: Record<string, string> = {
    'User-Agent': 'agentcron',
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=20`, { headers });
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);
  const repos = (await res.json()) as Array<{
    name: string;
    description: string | null;
    pushed_at: string;
    open_issues_count: number;
  }>;
  const rows = repos
    .filter((r) => !only || only.includes(r.name))
    .map((r) => `- ${r.name} (pushed ${r.pushed_at.slice(0, 10)}, ${r.open_issues_count} open issues): ${r.description ?? ''}`);
  return `# GitHub activity for ${user}\n${rows.join('\n')}`;
}
