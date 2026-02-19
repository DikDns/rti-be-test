import { mqttClient } from '../config/mqtt';
import { generatePayload } from './dataGenerator';

const PANELS = ['PANEL_LANTAI_1', 'PANEL_LANTAI_2', 'PANEL_LANTAI_3'];
const INTERVAL_MS = 60_000; // 1 minute

function publishAll() {
  for (const pm_code of PANELS) {
    const payload = generatePayload(pm_code);
    const topic = `DATA/PM/${pm_code}`;
    const message = JSON.stringify(payload);

    mqttClient.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error(`[Simulator] Failed to publish ${pm_code}:`, err.message);
      } else {
        console.log(`[Simulator] Published to ${topic} | kW=${payload.data.kW} kWh=${payload.data.kWh}`);
      }
    });
  }
}

mqttClient.on('connect', () => {
  console.log('[Simulator] MQTT connected. Starting sensor simulation...');
  // Publish immediately on start
  publishAll();
  // Then publish every minute
  setInterval(publishAll, INTERVAL_MS);
});
