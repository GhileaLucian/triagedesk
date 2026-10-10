import { TriageProvider } from './types.js';
import { MockProvider } from './mock.js';
import { ClaudeProvider } from './claude.js';
import { TriageResult } from '../schemas.js';
import { config } from '../config.js';

export function getTriageProvider(overrideProvider?: 'mock' | 'claude'): TriageProvider {
  const providerType = overrideProvider || config.TRIAGE_PROVIDER;

  if (providerType === 'claude' && config.ANTHROPIC_API_KEY) {
    return new ClaudeProvider();
  }

  return new MockProvider();
}

export async function triageWithFallback(
  ticket: { title: string; body: string },
  provider: TriageProvider = getTriageProvider()
): Promise<TriageResult> {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await provider.triage(ticket);
      return result;
    } catch (err) {
      if (attempt === maxAttempts) {
        // Fallback after 2 failed attempts
        return {
          category: 'other',
          priority: 'medium',
          summary: `Automatic triage failed (${err instanceof Error ? err.message : 'Unknown error'}). Flagged for human review.`.slice(0, 200),
          needs_review: true,
        };
      }
    }
  }

  return {
    category: 'other',
    priority: 'medium',
    summary: 'Automated fallback: Review required',
    needs_review: true,
  };
}

export * from './types.js';
export * from './mock.js';
export * from './claude.js';
