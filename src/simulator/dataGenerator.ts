import { MqttPayload } from '../types';

// Simulate a monotonically increasing kWh accumulator per panel
const kWhAccumulators: Record<string, number> = {
  PANEL_LANTAI_1: 100 + Math.random() * 50,
  PANEL_LANTAI_2: 100 + Math.random() * 50,
  PANEL_LANTAI_3: 100 + Math.random() * 50,
};

function randomBetween(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

export function generatePayload(pm_code: string): MqttPayload {
  // Phase voltages 
  const v1 = randomBetween(218, 232);
  const v2 = randomBetween(218, 232);
  const v3 = randomBetween(0, 5);
  const vAvg = parseFloat(((v1 + v2) / 2).toFixed(2));

  // Phase currents 
  const i1 = randomBetween(0.1, 5.0);
  const i2 = randomBetween(0.05, 3.0);
  const i3 = randomBetween(0.01, 1.0);
  const iTotal = parseFloat((i1 + i2 + i3).toFixed(2));

  // Power calculation
  const kW = parseFloat((((v1 * i1 + v2 * i2) / 1000) * 0.85).toFixed(2));
  const kVA = parseFloat(((v1 * i1 + v2 * i2) / 1000).toFixed(2));

  // kWh is accumulative — increment by a realistic amount each minute (~kW/60)
  kWhAccumulators[pm_code] = parseFloat(
    (kWhAccumulators[pm_code] + kW / 60).toFixed(2)
  );

  const vunbal = randomBetween(0.001, 0.02, 3);
  const iunbal = randomBetween(0.01, 0.15, 3);

  const now = new Date();
  const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

  return {
    status: 'OK',
    data: {
      v: [v1, v2, v3, vAvg],
      i: [i1, i2, i3, iTotal],
      kW: kW.toString(),
      kVA: kVA.toString(),
      kWh: kWhAccumulators[pm_code].toString(),
      vunbal,
      iunbal,
      time: timeStr,
    },
  };
}
