import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { daily_summaries, rates } from './schema';

export const summaryRepository = {
  /**
   * Get today's summary for a panel. Returns null if not yet created today.
   */
  async getTodaySummary(panel_id: number, today: string) {
    const result = await db
      .select()
      .from(daily_summaries)
      .where(
        and(
          eq(daily_summaries.panel_id, panel_id),
          eq(daily_summaries.summary_date, today)
        )
      );
    return result[0] ?? null;
  },

  /**
   * Create the first record of the day with kWh baseline.
   * Returns the newly created row.
   */
  async createDailySummary(panel_id: number, today: string, kwh_baseline: number) {
    const result = await db
      .insert(daily_summaries)
      .values({
        panel_id,
        summary_date: today,
        kwh_baseline: kwh_baseline.toString(),
        total_energy_kwh: '0',
        total_cost: '0',
      })
      .returning();
    return result[0];
  },

  /**
   * Update usage and cost for an existing daily summary row.
   */
  async updateUsageAndCost(id: number, total_energy_kwh: number, total_cost: number) {
    await db
      .update(daily_summaries)
      .set({
        total_energy_kwh: total_energy_kwh.toString(),
        total_cost: total_cost.toString(),
      })
      .where(eq(daily_summaries.id, id));
  },

  /**
   * Get all summaries for a panel in a date range (for today endpoint).
   */
  async getTodayAllPanels(today: string) {
    return db
      .select()
      .from(daily_summaries)
      .where(eq(daily_summaries.summary_date, today));
  },

  /**
   * Aggregate daily_summaries by month for a given year (for monthly chart).
   */
  async getMonthlySummaries(year: number) {
    const result = await db.execute(
      sql`
        SELECT
          EXTRACT(MONTH FROM summary_date::date)::int AS month,
          SUM(total_energy_kwh::numeric) AS energy_kwh,
          SUM(total_cost::numeric) AS cost
        FROM daily_summaries
        WHERE EXTRACT(YEAR FROM summary_date::date) = ${year}
        GROUP BY month
        ORDER BY month ASC
      `
    );
    return result.rows as { month: number; energy_kwh: string; cost: string }[];
  },

  /**
   * Get the active rate (price_per_kwh).
   */
  async getActiveRate(): Promise<number> {
    const result = await db
      .select()
      .from(rates)
      .where(eq(rates.is_active, true));
    if (!result[0]) return 1500; // fallback default
    return parseFloat(result[0].price_per_kwh);
  },

  /**
   * Seed the rates table with default rate if empty.
   */
  async seedRate() {
    const existing = await db.select().from(rates).where(eq(rates.is_active, true));
    if (existing.length === 0) {
      await db.insert(rates).values({
        price_per_kwh: '1500',
        is_active: true,
      });
      console.log('[DB] Default rate seeded: Rp 1500/kWh');
    }
  },
};
