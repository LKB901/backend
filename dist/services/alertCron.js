"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAlertCron = startAlertCron;
const node_cron_1 = __importDefault(require("node-cron"));
const sendAlert_1 = require("../utils/sendAlert");
function startAlertCron() {
    const rule = process.env.ALERT_CRON ?? '*/10 * * * * *';
    console.log('[CRON] preparing alert cron on rule', rule);
    node_cron_1.default.schedule(rule, async () => {
        console.log('[ALERT-CRON] tick', new Date().toLocaleTimeString());
        await (0, sendAlert_1.sendUnsentAlerts)();
    }, { timezone: 'Asia/Seoul' });
    console.log('[CRON] alert cron scheduled ✓');
}
