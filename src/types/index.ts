// TypeScript interfaces for the Energy Monitoring System

export interface MqttPayload {
  status: string;
  data: {
    v: [number, number, number, number]; // Phase 1, 2, 3, Neutral/Average
    i: [number, number, number, number]; // Phase 1, 2, 3, Total
    kW: string;
    kVA: string;
    kWh: string;
    vunbal: number;
    iunbal: number;
    time: string;
  };
}

export interface Panel {
  id: number;
  pm_code: string;
  display_name: string;
  location: string | null;
  last_seen: Date | null;
  created_at: Date | null;
}

export type PanelStatus = 'ONLINE' | 'OFFLINE';

export interface PanelWithStatus extends Panel {
  status: PanelStatus;
  kw: number | null;
  ampere: number | null;
  voltage: number | null;
}

export interface DailySummary {
  id: number;
  panel_id: number;
  summary_date: string;
  kwh_baseline: number;
  total_energy_kwh: number;
  total_cost: number;
  created_at: Date | null;
}

export interface ApiResponse<T> {
  status: 'OK' | 'ERROR';
  message: string;
  data: T;
}
