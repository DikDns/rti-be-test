import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { ApiResponse } from '../types';

function ok<T>(res: Response, data: T, message = '') {
  const body: ApiResponse<T> = { status: 'OK', message, data };
  res.json(body);
}

function err(res: Response, message: string, statusCode = 500) {
  const body: ApiResponse<null> = { status: 'ERROR', message, data: null };
  res.status(statusCode).json(body);
}

export const dashboardController = {
  async realtime(req: Request, res: Response) {
    try {
      const data = await dashboardService.getRealtimeData();
      ok(res, { panels: data });
    } catch (e: any) {
      err(res, e.message ?? 'Internal server error');
    }
  },

  async usageToday(req: Request, res: Response) {
    try {
      const data = await dashboardService.getTodayUsage();
      ok(res, data);
    } catch (e: any) {
      err(res, e.message ?? 'Internal server error');
    }
  },

  async usageMonthly(req: Request, res: Response) {
    try {
      const yearParam = req.query.year;
      const year = yearParam ? parseInt(yearParam as string, 10) : new Date().getFullYear();

      if (isNaN(year) || year < 2000 || year > 2100) {
        return err(res, 'Invalid year parameter. Use ?year=YYYY', 400);
      }

      const data = await dashboardService.getMonthlyUsage(year);
      ok(res, data);
    } catch (e: any) {
      err(res, e.message ?? 'Internal server error');
    }
  },
};
