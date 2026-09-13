import { env } from '@core/config/env';
import { z } from 'zod';

const mcpEnvelopeSchema = z.object({
  result: z
    .object({
      content: z.array(z.object({ type: z.string(), text: z.string() })).optional(),
      isError: z.boolean().optional(),
    })
    .optional(),
  error: z.object({ message: z.string() }).optional(),
});

const searchResultsSchema = z.array(
  z.object({
    title: z.string().default('Tanpa judul'),
    content: z.string().default(''),
    link: z.string().default(''),
    publish_date: z.string().optional(),
  })
);

interface McpResponse {
  sessionId: string | null;
  message: unknown;
}

export class WebSearchService {
  public async search(query: string, apiKey: string): Promise<string> {
    const session = await this.post(apiKey, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'stream-oracle', version: '1.0.0' },
      },
    });
    if (!session.sessionId) throw new Error('Web search MCP session was not created');

    await this.post(
      apiKey,
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      session.sessionId
    );
    const response = await this.post(
      apiKey,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'web_search_prime',
          arguments: {
            search_query: query,
            search_recency_filter: 'noLimit',
            content_size: 'medium',
            location: 'us',
          },
        },
      },
      session.sessionId
    );
    return this.formatResults(this.readResults(response.message));
  }

  private async post(
    apiKey: string,
    payload: Record<string, unknown>,
    sessionId?: string
  ): Promise<McpResponse> {
    const response = await fetch(env.PI_WEB_SEARCH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(sessionId ? { 'Mcp-Session-Id': sessionId } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`Web search MCP request failed (${response.status})`);
    return { sessionId: response.headers.get('mcp-session-id'), message: this.parseMessage(body) };
  }

  private parseMessage(body: string): unknown {
    const dataLine = body
      .split('\n')
      .find((line) => line.startsWith('data:'))
      ?.slice('data:'.length)
      .trim();
    const json = dataLine || body.trim();
    return json ? JSON.parse(json) : null;
  }

  private readResults(message: unknown) {
    const parsed = mcpEnvelopeSchema.safeParse(message);
    if (!parsed.success) throw new Error('Web search MCP returned an invalid response');
    if (parsed.data.error) throw new Error(parsed.data.error.message);
    if (parsed.data.result?.isError) throw new Error('Web search MCP tool failed');

    const text = parsed.data.result?.content?.map((item) => item.text).join('\n') || '[]';
    const decoded = JSON.parse(text);
    const json = typeof decoded === 'string' ? JSON.parse(decoded) : decoded;
    const results = searchResultsSchema.safeParse(json);
    if (!results.success) throw new Error('Web search MCP returned invalid results');
    return results.data;
  }

  private formatResults(
    results: Array<{ title: string; content: string; link: string; publish_date?: string }>
  ): string {
    const formatted = results.map((item, index) => {
      const date = item.publish_date ? ` | ${item.publish_date}` : '';
      return `${index + 1}. ${item.title}${date}\n${item.content.slice(0, 700)}\n${item.link}`;
    });
    return formatted.join('\n\n').slice(0, 3_000) || 'Tidak ada hasil pencarian yang relevan.';
  }
}

export const webSearchService = new WebSearchService();
