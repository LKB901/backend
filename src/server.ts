import 'dotenv/config';
import { app } from './app';
import { connectMongo } from './config/mongo';
import { startRegistryCron } from './services/registrySync';
import { startAlertCron }    from './services/alertCron';

(async () => {
  await connectMongo();
  console.log('[DB] Mongo connected');

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => console.log(`API up at :${PORT}`));

  startRegistryCron();
  startAlertCron();
})();
