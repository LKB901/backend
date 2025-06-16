import cron from 'node-cron';
import { sendUnsentAlerts } from '../utils/sendAlert';

// ────────────────────────────────────────────────
export function startAlertCron() {
  const rule = process.env.ALERT_CRON ?? '* * * * *';
  console.log('[CRON] preparing alert cron on rule', rule);

  try {
    cron.schedule(rule, sendUnsentAlerts, { timezone: 'Asia/Seoul' });
    console.log('[CRON] alert cron scheduled ✓');
  } catch (err) {
    console.error('[CRON] alert schedule FAILED →', err);
  }
}
