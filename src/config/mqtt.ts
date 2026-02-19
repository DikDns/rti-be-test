import mqtt from 'mqtt';
import { env } from './env';

export const mqttClient = mqtt.connect(env.MQTT_BROKER_URL, {
  reconnectPeriod: 3000,
  connectTimeout: 10000,
});

mqttClient.on('connect', () => {
  console.log(`[MQTT] Connected to broker: ${env.MQTT_BROKER_URL}`);
});

mqttClient.on('error', (err) => {
  console.error('[MQTT] Connection error:', err.message);
});

mqttClient.on('reconnect', () => {
  console.log('[MQTT] Reconnecting...');
});
