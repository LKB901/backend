// backend/src/app.ts
import express, { Router, RequestHandler } from 'express';
import cors   from 'cors';
import helmet from 'helmet';
import YAML   from 'yamljs';
import path   from 'path';
import swaggerUi from 'swagger-ui-express';

/* 개별 도메인 라우터 */
import agentRouter    from './routes/agent.routes';
import contractRouter from './routes/contract.routes';
import propertyRouter from './routes/property.routes';
import registryRouter from './routes/registry.routes';
import passRouter     from './routes/pass.routes';

export const app = express();

/* ── 공통 미들웨어 ── */
app.use(helmet());
app.use(cors());
app.use(express.json());

/* ── “/api/index” 프리픽스용 Router ── */
const router = Router();

// REST 엔드포인트
router.use('/agents',     agentRouter);
router.use('/contracts',  contractRouter);
router.use('/properties', propertyRouter);
router.use('/registry',   registryRouter);
router.use('/pass',       passRouter);

// 헬스 체크
router.get('/health', (_req, res) => res.send('OK'));

// 정적 파일(선택)  /api/index/public/…
router.use('/public', express.static('public'));

// Swagger (선택)   /api/index/api-docs
const swaggerDoc = YAML.load(path.join(__dirname, '..', 'docs', 'openapi.yaml'));
router.use(
  '/api-docs',
  ...(swaggerUi.serve as unknown as RequestHandler[]),
  swaggerUi.setup(swaggerDoc) as unknown as RequestHandler
);

/* **한 번만** 프리픽스 부여 */
app.use('/api/index', router);

/* 404 / 500 핸들러 */
app.use((_req, res) => res.status(404).json({ msg: 'not found' }));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ msg: 'internal error' });
});
