import { eq, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { panels } from './schema';

export const panelRepository = {
  async getAll() {
    return db.select().from(panels);
  },

  async getByPmCode(pm_code: string) {
    const result = await db.select().from(panels).where(eq(panels.pm_code, pm_code));
    return result[0] ?? null;
  },

  async updateLastSeen(pm_code: string, timestamp: Date) {
    await db
      .update(panels)
      .set({ last_seen: timestamp })
      .where(eq(panels.pm_code, pm_code));
  },

  async seed() {
    const panelData = [
      { pm_code: 'PANEL_LANTAI_1', display_name: 'Panel Lantai 1', location: 'Lantai 1' },
      { pm_code: 'PANEL_LANTAI_2', display_name: 'Panel Lantai 2', location: 'Lantai 2' },
      { pm_code: 'PANEL_LANTAI_3', display_name: 'Panel Lantai 3', location: 'Lantai 3' },
    ];

    for (const panel of panelData) {
      await db
        .insert(panels)
        .values(panel)
        .onConflictDoNothing();
    }
    console.log('[DB] Panels seeded.');
  },
};
