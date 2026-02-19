import { panelRepository } from '../repositories/panelRepository';
import { summaryRepository } from '../repositories/summaryRepository';
import { influxRepository } from '../repositories/influxRepository';
import { PanelStatus } from '../types';

const OFFLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

function getPanelStatus(last_seen: Date | null): PanelStatus {
  if (!last_seen) return 'OFFLINE';
  return Date.now() - last_seen.getTime() <= OFFLINE_THRESHOLD_MS ? 'ONLINE' : 'OFFLINE';
}

export const dashboardService = {
  /**
   * GET /api/v1/dashboard/realtime
   * Returns status, kW, Ampere (i4), Voltage (v avg) for each panel.
   */
  async getRealtimeData() {
    const panels = await panelRepository.getAll();

    const result = await Promise.all(
      panels.map(async (panel) => {
        const status = getPanelStatus(panel.last_seen);
        let kw: number | null = null;
        let ampere: number | null = null;
        let voltage: number | null = null;

        if (status === 'ONLINE') {
          const metric = await influxRepository.getLatestMetric(panel.pm_code);
          if (metric) {
            kw = typeof metric.kw === 'number' ? parseFloat(metric.kw.toFixed(2)) : null;
            ampere = typeof metric.i4 === 'number' ? parseFloat(metric.i4.toFixed(2)) : null;
            // Average of v1 and v2 (active phases)
            const v1 = typeof metric.v1 === 'number' ? metric.v1 : 0;
            const v2 = typeof metric.v2 === 'number' ? metric.v2 : 0;
            voltage = v1 > 0 && v2 > 0 ? parseFloat(((v1 + v2) / 2).toFixed(1)) : (v1 || null);
          }
        }

        return {
          pm_code: panel.pm_code,
          display_name: panel.display_name,
          status,
          kw,
          ampere,
          voltage,
          last_seen: panel.last_seen ? panel.last_seen.toISOString() : null,
        };
      })
    );

    return result;
  },

  /**
   * GET /api/v1/dashboard/usage/today
   * Returns today's kWh usage and cost per panel + building total.
   */
  async getTodayUsage() {
    const panels = await panelRepository.getAll();
    const today = new Date().toISOString().split('T')[0];
    const todaySummaries = await summaryRepository.getTodayAllPanels(today);

    // Map summary by panel_id
    const summaryMap = new Map(todaySummaries.map((s) => [s.panel_id, s]));

    let totalEnergyKwh = 0;
    let totalCost = 0;

    const panelResult = panels.map((panel) => {
      const summary = summaryMap.get(panel.id);
      const energy_kwh = summary ? parseFloat(summary.total_energy_kwh.toString()) : 0;
      const cost = summary ? parseFloat(summary.total_cost.toString()) : 0;
      totalEnergyKwh += energy_kwh;
      totalCost += cost;

      return {
        pm_code: panel.pm_code,
        display_name: panel.display_name,
        energy_kwh: parseFloat(energy_kwh.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
      };
    });

    return {
      date: today,
      panels: panelResult,
      total: {
        energy_kwh: parseFloat(totalEnergyKwh.toFixed(2)),
        cost: parseFloat(totalCost.toFixed(2)),
      },
    };
  },

  /**
   * GET /api/v1/dashboard/usage/monthly?year=YYYY
   * Returns per-month aggregated energy and cost for the given year.
   */
  async getMonthlyUsage(year: number) {
    const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const rows = await summaryRepository.getMonthlySummaries(year);

    // Build full 12-month array (fill 0 for months with no data)
    const monthMap = new Map(rows.map((r) => [r.month, r]));
    let totalEnergyKwh = 0;
    let totalCost = 0;

    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const row = monthMap.get(month);
      const energy_kwh = row ? parseFloat(parseFloat(row.energy_kwh).toFixed(2)) : 0;
      const cost = row ? parseFloat(parseFloat(row.cost).toFixed(2)) : 0;
      totalEnergyKwh += energy_kwh;
      totalCost += cost;
      return { month, month_label: MONTH_LABELS[i], energy_kwh, cost };
    });

    return {
      year,
      months,
      total: {
        energy_kwh: parseFloat(totalEnergyKwh.toFixed(2)),
        cost: parseFloat(totalCost.toFixed(2)),
      },
    };
  },
};
