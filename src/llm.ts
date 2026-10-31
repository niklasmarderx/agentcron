import Anthropic from '@anthropic-ai/sdk';

/** A text-in, text-out language model backend. */
export interface LlmProvider {
  readonly name: string;
  complete(prompt: string): Promise<string>;
}

/** Deterministic offline backend so jobs run without an API key. */
export class StubProvider implements LlmProvider {
  readonly name = 'stub';
  async complete(prompt: string): Promise<string> {
    const preview = prompt.replace(/\s+/g, ' ').trim().slice(0, 240);
    return `[stub summary] ${preview}${prompt.length > 240 ? ' …' : ''}\n(set ANTHROPIC_API_KEY for real LLM output)`;
  }
}

/** Real backend using Claude via the official Anthropic SDK. */
export class AnthropicProvider implements LlmProvider {
  readonly name = 'claude';
  private readonly client: Anthropic;
  constructor(apiKey: string, private readonly model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5') {
    this.client = new Anthropic({ apiKey });
  }
  async complete(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { text: string }).text)
      .join('\n');
  }
}

/** Picks Claude when ANTHROPIC_API_KEY is set, else the offline stub. */
export function createProvider(env: NodeJS.ProcessEnv = process.env): LlmProvider {
  const key = env.ANTHROPIC_API_KEY;
  return key ? new AnthropicProvider(key) : new StubProvider();
}
