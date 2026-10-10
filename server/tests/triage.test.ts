import { describe, it, expect, vi } from 'vitest';
import { MockProvider } from '../src/triage/mock.js';
import { ClaudeProvider } from '../src/triage/claude.js';
import { triageWithFallback, TriageProvider } from '../src/triage/index.js';

describe('AI Triage Subsystem', () => {
  describe('MockProvider (Deterministic Keyword Rules)', () => {
    const mock = new MockProvider();

    it('classifies billing tickets and urgent priority', async () => {
      const res = await mock.triage({
        title: 'Urgent refund needed for double credit card charge',
        body: 'Please review our invoice payment ASAP as the system charged twice.',
      });

      expect(res.category).toBe('billing');
      expect(res.priority).toBe('high');
      expect(res.summary).toContain('[Mock] BILLING:');
      expect(res.needs_review).toBe(false);
    });

    it('classifies bug crashes and medium priority', async () => {
      const res = await mock.triage({
        title: 'Frontend broken with 500 error exception',
        body: 'Users are experiencing an issue where the page cannot load properly.',
      });

      expect(res.category).toBe('bug');
      expect(res.priority).toBe('medium');
    });

    it('classifies account / password issues', async () => {
      const res = await mock.triage({
        title: 'Password reset link not working for login',
        body: 'I am locked out of my 2FA authentication account.',
      });

      expect(res.category).toBe('account');
    });

    it('classifies feature suggestions with low priority default', async () => {
      const res = await mock.triage({
        title: 'Feature request: Add dark mode toggle',
        body: 'We would like to suggest adding dark theme support in future updates.',
      });

      expect(res.category).toBe('feature_request');
      expect(res.priority).toBe('low');
    });

    it('falls back to other category when no keywords match', async () => {
      const res = await mock.triage({
        title: 'General inquiry about company policies',
        body: 'Where can we read the standard terms and privacy documentation?',
      });

      expect(res.category).toBe('other');
      expect(res.priority).toBe('low');
    });
  });

  describe('ClaudeProvider & TriageWithFallback (Mocking Anthropic Client)', () => {
    it('successfully parses valid JSON response from model', async () => {
      const provider = new ClaudeProvider('fake_api_key');
      // Mock messages.create
      (provider as any).client = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  category: 'bug',
                  priority: 'high',
                  summary: 'Critical server crash on database sync',
                }),
              },
            ],
          }),
        },
      };

      const result = await provider.triage({
        title: 'Database connection failed',
        body: 'Primary replica is not responding to queries.',
      });

      expect(result.category).toBe('bug');
      expect(result.priority).toBe('high');
      expect(result.summary).toBe('Critical server crash on database sync');
    });

    it('strips markdown codeblock fences from model response', async () => {
      const provider = new ClaudeProvider('fake_api_key');
      (provider as any).client = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: '```json\n{"category": "billing", "priority": "medium", "summary": "Invoice dispute"}\n```',
              },
            ],
          }),
        },
      };

      const result = await provider.triage({
        title: 'Invoice amount mismatch',
        body: 'The price on receipt does not match agreement.',
      });

      expect(result.category).toBe('billing');
      expect(result.priority).toBe('medium');
      expect(result.summary).toBe('Invoice dispute');
    });

    it('triggers fallback on model failure after retries with needs_review: true', async () => {
      const failingProvider: TriageProvider = {
        triage: vi.fn().mockRejectedValue(new Error('Anthropic API rate limit 429')),
      };

      const result = await triageWithFallback(
        { title: 'Failing ticket', body: 'Will trigger retry and fallback logic' },
        failingProvider
      );

      expect(failingProvider.triage).toHaveBeenCalledTimes(2);
      expect(result.category).toBe('other');
      expect(result.priority).toBe('medium');
      expect(result.needs_review).toBe(true);
      expect(result.summary).toContain('Automatic triage failed');
    });

    it('triggers fallback on invalid schema payload from model', async () => {
      const invalidSchemaProvider: TriageProvider = {
        triage: vi.fn().mockRejectedValue(new Error('Invalid Zod enum validation')),
      };

      const result = await triageWithFallback(
        { title: 'Malformed schema payload', body: 'Model returned unexpected category format' },
        invalidSchemaProvider
      );

      expect(result.needs_review).toBe(true);
      expect(result.category).toBe('other');
      expect(result.priority).toBe('medium');
    });
  });
});
