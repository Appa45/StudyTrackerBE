import { getDashboardOverview } from '../services/dashboard.service.js';

export async function overview(req, res) {
  const data = await getDashboardOverview(req.userId);
  res.json({ success: true, data });
}
