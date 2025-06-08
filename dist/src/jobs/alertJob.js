"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAlertCron = startAlertCron;
const node_cron_1 = __importDefault(require("node-cron"));
const alertSender_1 = require("../services/alertSender");
// ────────────────────────────────────────────────
function startAlertCron() {
    const rule = process.env.ALERT_CRON ?? '* * * * *';
    console.log('[CRON] preparing alert cron on rule', rule);
    try {
        node_cron_1.default.schedule(rule, alertSender_1.sendUnsentAlerts, { timezone: 'Asia/Seoul' });
        console.log('[CRON] alert cron scheduled ✓');
    }
    catch (err) {
        console.error('[CRON] alert schedule FAILED →', err);
    }
}
