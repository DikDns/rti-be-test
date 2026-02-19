import { panelRepository } from '../repositories/panelRepository';
import { summaryRepository } from '../repositories/summaryRepository';
import { influxRepository } from '../repositories/influxRepository';
import { MqttPayload } from '../types';

export const dataProcessorService = {
  async process(pm_code: string, payload: MqttPayload) {
    const { data } = payload;
    const now = new Date();

    // 1. Update last_seen for panel status tracking
    await panelRepository.updateLastSeen(pm_code, now);

    // 2. Write raw metrics to InfluxDB
    try {
      await influxRepository.writeEnergyMetric(pm_code, data);
    } catch (err) {
      console.error(`[Processor] InfluxDB write error for ${pm_code}:`, err);
    }

    // 3. Daily summary logic
    const panel = await panelRepository.getByPmCode(pm_code);
    if (!panel) {
      console.warn(`[Processor] Panel not found: ${pm_code}`);
      return;
    }

    const today = now.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const kwhLatest = parseFloat(data.kWh);

    let summary = await summaryRepository.getTodaySummary(panel.id, today);

    if (!summary) {
      // First data of the day — store kWh baseline
      summary = await summaryRepository.createDailySummary(panel.id, today, kwhLatest);
      console.log(`[Processor] New daily summary for ${pm_code} (baseline: ${kwhLatest} kWh)`);
    } else {
      // Subsequent data — calculate usage and cost
      const kwhBaseline = parseFloat(summary.kwh_baseline.toString());
      const totalEnergyKwh = Math.max(0, kwhLatest - kwhBaseline);

      const pricePerKwh = await summaryRepository.getActiveRate();
      const totalCost = parseFloat((totalEnergyKwh * pricePerKwh).toFixed(2));

      await summaryRepository.updateUsageAndCost(summary.id, totalEnergyKwh, totalCost);
      console.log(
        `[Processor] ${pm_code} | kWh: ${kwhLatest} | Usage: ${totalEnergyKwh.toFixed(2)} kWh | Cost: Rp${totalCost}`
      );
    }
  },
};
