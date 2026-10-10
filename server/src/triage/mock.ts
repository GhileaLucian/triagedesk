import { TriageProvider } from './types.js';
import { TriageResult, Category, Priority } from '../schemas.js';

export class MockProvider implements TriageProvider {
  async triage(t: { title: string; body: string }): Promise<TriageResult> {
    const text = `${t.title} ${t.body}`.toLowerCase();

    // 1. Category Detection Rules
    let category: Category = 'other';
    if (
      text.includes('refund') ||
      text.includes('invoice') ||
      text.includes('charge') ||
      text.includes('billing') ||
      text.includes('payment') ||
      text.includes('subscription') ||
      text.includes('credit card')
    ) {
      category = 'billing';
    } else if (
      text.includes('error') ||
      text.includes('crash') ||
      text.includes('bug') ||
      text.includes('exception') ||
      text.includes('broken') ||
      text.includes('fails') ||
      text.includes('500')
    ) {
      category = 'bug';
    } else if (
      text.includes('password') ||
      text.includes('login') ||
      text.includes('auth') ||
      text.includes('account') ||
      text.includes('reset') ||
      text.includes('2fa') ||
      text.includes('locked')
    ) {
      category = 'account';
    } else if (
      text.includes('feature') ||
      text.includes('request') ||
      text.includes('suggest') ||
      text.includes('enhancement') ||
      text.includes('would like') ||
      text.includes('please add')
    ) {
      category = 'feature_request';
    }

    // 2. Priority Detection Rules
    let priority: Priority = 'low';
    if (
      text.includes('urgent') ||
      text.includes('down') ||
      text.includes('asap') ||
      text.includes('emergency') ||
      text.includes('outage') ||
      text.includes('critical') ||
      text.includes('data loss')
    ) {
      priority = 'high';
    } else if (
      text.includes('slow') ||
      text.includes('problem') ||
      text.includes('cannot') ||
      text.includes('issue') ||
      text.includes('broken') ||
      text.includes('blocked')
    ) {
      priority = 'medium';
    }

    // 3. Summary Synthesis
    const cleanTitle = t.title.trim();
    const summary =
      cleanTitle.length > 120
        ? cleanTitle.substring(0, 117) + '...'
        : cleanTitle;

    return {
      category,
      priority,
      summary: `[Mock] ${category.toUpperCase()}: ${summary}`.slice(0, 200),
      needs_review: false,
    };
  }
}
