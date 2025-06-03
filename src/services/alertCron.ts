import cron from 'node-cron';
import { sendUnsentAlerts } from '../utils/sendAlert';

export function startAlertCron() {
  const rule = process.env.ALERT_CRON ?? '*/10 * * * * *';
  console.log('[CRON] preparing alert cron on rule', rule);

  cron.schedule(
    rule,
    async () => {
      console.log('[ALERT-CRON] tick', new Date().toLocaleTimeString());
      await sendUnsentAlerts();
    },
    { timezone: 'Asia/Seoul' }
  );
  console.log('[CRON] alert cron scheduled ✓');
}
