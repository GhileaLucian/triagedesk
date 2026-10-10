import { TriageResult } from '../schemas.js';

export interface TriageProvider {
  triage(t: { title: string; body: string }): Promise<TriageResult>;
}
