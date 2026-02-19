import { InfluxDBClient } from '@influxdata/influxdb3-client';
import { env } from './env';

export const influxClient = new InfluxDBClient({
  host: env.INFLUX_URL,
  token: env.INFLUX_TOKEN,
  database: env.INFLUX_DB,
});
