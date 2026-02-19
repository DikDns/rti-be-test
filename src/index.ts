import app from './app';
import { env } from './config/env';
import { startMqttSubscriber } from './mqtt/subscriber';
import { panelRepository } from './repositories/panelRepository';
import { summaryRepository } from './repositories/summaryRepository';

async function bootstrap() {
  console.log('[Bootstrap] Starting Energy Monitoring System...');

  // 1. Seed database (idempotent — skips if data exists)
  await panelRepository.seed();
  await summaryRepository.seedRate();

  // 2. Start MQTT subscriber
  startMqttSubscriber();
  console.log('[Bootstrap] MQTT subscriber started.');

  // 3. Start HTTP server
  app.listen(env.PORT, () => {
    console.log(`[Bootstrap] REST API listening on http://localhost:${env.PORT}`);
    console.log(`[Bootstrap] Endpoints:`);
    console.log(`  GET http://localhost:${env.PORT}/api/v1/dashboard/realtime`);
    console.log(`  GET http://localhost:${env.PORT}/api/v1/dashboard/usage/today`);
    console.log(`  GET http://localhost:${env.PORT}/api/v1/dashboard/usage/monthly?year=YYYY`);
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
