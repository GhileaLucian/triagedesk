import { createApp } from './app.js';
import { config } from './config.js';

const { app } = createApp();

app.listen(config.PORT, () => {
  console.log(`🚀 TriageDesk API server running on http://localhost:${config.PORT}`);
  console.log(`🤖 Triage Provider: ${config.TRIAGE_PROVIDER.toUpperCase()} (Model: ${config.CLAUDE_MODEL})`);
  console.log(`📁 Database: ${config.DATABASE_PATH}`);
});
