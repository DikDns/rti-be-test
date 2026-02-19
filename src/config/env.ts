import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  INFLUX_URL: requireEnv('INFLUX_URL'),
  INFLUX_TOKEN: requireEnv('INFLUX_TOKEN'),
  INFLUX_DB: requireEnv('INFLUX_DB'),
  MQTT_BROKER_URL: requireEnv('MQTT_BROKER_URL'),
  MQTT_TOPIC_PATTERN: process.env.MQTT_TOPIC_PATTERN ?? 'DATA/PM/+',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
};
