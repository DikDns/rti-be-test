import { pgTable, serial, varchar, decimal, boolean, timestamp, date, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const panels = pgTable('panels', {
  id: serial('id').primaryKey(),
  pm_code: varchar('pm_code', { length: 50 }).notNull().unique(),
  display_name: varchar('display_name', { length: 100 }).notNull(),
  location: varchar('location', { length: 100 }),
  last_seen: timestamp('last_seen'),
  created_at: timestamp('created_at').defaultNow(),
});

export const rates = pgTable('rates', {
  id: serial('id').primaryKey(),
  price_per_kwh: decimal('price_per_kwh', { precision: 10, scale: 2 }).notNull(),
  is_active: boolean('is_active').default(true),
  effective_date: timestamp('effective_date').defaultNow(),
});

export const daily_summaries = pgTable('daily_summaries', {
  id: serial('id').primaryKey(),
  panel_id: integer('panel_id').references(() => panels.id),
  summary_date: date('summary_date').notNull(),
  kwh_baseline: decimal('kwh_baseline', { precision: 15, scale: 2 }).notNull(),
  total_energy_kwh: decimal('total_energy_kwh', { precision: 15, scale: 2 }).notNull().default('0'),
  total_cost: decimal('total_cost', { precision: 15, scale: 2 }).notNull().default('0'),
  created_at: timestamp('created_at').defaultNow(),
});

export const panelsRelations = relations(panels, ({ many }) => ({
  daily_summaries: many(daily_summaries),
}));

export const dailySummariesRelations = relations(daily_summaries, ({ one }) => ({
  panel: one(panels, {
    fields: [daily_summaries.panel_id],
    references: [panels.id],
  }),
}));
