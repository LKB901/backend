"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const mongo_1 = require("./config/mongo");
const registrySync_1 = require("./services/registrySync");
const alertCron_1 = require("./services/alertCron");
(async () => {
    await (0, mongo_1.connectMongo)();
    console.log('[DB] Mongo connected');
    const PORT = Number(process.env.PORT) || 3000;
    app_1.app.listen(PORT, () => console.log(`API up at :${PORT}`));
    (0, registrySync_1.startRegistryCron)();
    (0, alertCron_1.startAlertCron)();
})();
