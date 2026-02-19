import { mqttClient } from '../config/mqtt';
import { dataProcessorService } from '../services/dataProcessorService';
import { MqttPayload } from '../types';
import { env } from '../config/env';

function doSubscribe() {
  mqttClient.subscribe(env.MQTT_TOPIC_PATTERN, { qos: 1 }, (err) => {
    if (err) {
      console.error('[Subscriber] Subscribe error:', err.message);
    } else {
      console.log(`[Subscriber] Subscribed to topic: ${env.MQTT_TOPIC_PATTERN}`);
    }
  });
}

export function startMqttSubscriber() {
  // Register message handler once (outside connect)
  mqttClient.on('message', async (topic: string, messageBuffer: Buffer) => {
    const pm_code = topic.split('/').pop(); // Extract from "DATA/PM/PANEL_LANTAI_1"

    if (!pm_code) {
      console.warn(`[Subscriber] Cannot extract pm_code from topic: ${topic}`);
      return;
    }

    let payload: MqttPayload;
    try {
      payload = JSON.parse(messageBuffer.toString()) as MqttPayload;
    } catch {
      console.error(`[Subscriber] Invalid JSON from topic ${topic}`);
      return;
    }

    if (payload.status !== 'OK' || !payload.data) {
      console.warn(`[Subscriber] Skipping payload with status: ${payload.status}`);
      return;
    }

    try {
      await dataProcessorService.process(pm_code, payload);
    } catch (err) {
      console.error(`[Subscriber] Processing error for ${pm_code}:`, err);
    }
  });

  // Subscribe: immediately if already connected, otherwise wait for connect event
  if (mqttClient.connected) {
    console.log('[Subscriber] MQTT already connected — subscribing now.');
    doSubscribe();
  } else {
    mqttClient.once('connect', () => {
      console.log('[Subscriber] MQTT connected — subscribing now.');
      doSubscribe();
    });
  }
}
