import { Point } from '@influxdata/influxdb3-client';
import { influxClient } from '../config/influx';
import { env } from '../config/env';
import { MqttPayload } from '../types';

const MEASUREMENT = 'energy_metrics';

export const influxRepository = {
  /**
   * Write a new energy data point to InfluxDB.
   * Writes with second precision to match MQTT payload time format.
   */
  async writeEnergyMetric(pm_code: string, data: MqttPayload['data']) {
    const timestampSeconds = Math.floor(new Date(data.time).getTime() / 1000);

    const point = Point.measurement(MEASUREMENT)
      .setTag('pm_code', pm_code)
      .setFloatField('v1', data.v[0])
      .setFloatField('v2', data.v[1])
      .setFloatField('v3', data.v[2])
      .setFloatField('v4', data.v[3])
      .setFloatField('i1', data.i[0])
      .setFloatField('i2', data.i[1])
      .setFloatField('i3', data.i[2])
      .setFloatField('i4', data.i[3])
      .setFloatField('kw', parseFloat(data.kW))
      .setFloatField('kva', parseFloat(data.kVA))
      .setFloatField('kwh', parseFloat(data.kWh))
      .setFloatField('vunbal', data.vunbal)
      .setFloatField('iunbal', data.iunbal)
      .setTimestamp(timestampSeconds);

    await influxClient.write([point], env.INFLUX_DB, '', { precision: 's' });
  },

  /**
   * Query the latest single metric row for a given panel from InfluxDB.
   */
  async getLatestMetric(pm_code: string) {
    const query = `
      SELECT *
      FROM energy_metrics
      WHERE pm_code = '${pm_code}'
      ORDER BY time DESC
      LIMIT 1
    `;

    const result: Record<string, unknown>[] = [];
    for await (const row of influxClient.query(query, env.INFLUX_DB)) {
      result.push(row as Record<string, unknown>);
    }
    return result[0] ?? null;
  },
};
