import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

// GET /api/v1/dashboard/realtime
router.get('/realtime', dashboardController.realtime);

// GET /api/v1/dashboard/usage/today
router.get('/usage/today', dashboardController.usageToday);

// GET /api/v1/dashboard/usage/monthly?year=YYYY
router.get('/usage/monthly', dashboardController.usageMonthly);

export default router;
