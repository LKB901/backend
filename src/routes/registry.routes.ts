import { Router, Response, NextFunction } from 'express';
import { Registry } from '../models/registry.model';
import { RegistryEvent } from '../models/registryEvent.model';
import { authGuard, AuthReq } from '../middleware/auth.guard';
import { fetchRegistry } from '../utils/registryApi';
import { fetchRegistryStub } from '../utils/registryStub';

const router = Router();

/* ───────── 최신 스냅샷 조회 ─────────  GET /registry/:propId */
router.get(
  '/:propId',
  authGuard,
  async (req: AuthReq, res: Response, next: NextFunction) => {
    try {
      const snap = await Registry
        .findOne({ property: req.params.propId })
        .sort({ fetchedAt: -1 })
        .lean();

      if (!snap) return void res.status(404).json({ msg: 'no snapshot' });
      res.json(snap);
    } catch (err) {
      next(err);
    }
  },
);

/* ───────── 변동 이력 조회 ─────────  GET /registry/:propId/events */
router.get(
  '/:propId/events',
  authGuard,
  async (req: AuthReq, res: Response, next: NextFunction) => {
    try {
      const list = await RegistryEvent
        .find({ property: req.params.propId })
        .sort({ detectedAt: -1 })
        .lean();

      res.json(list);
    } catch (err) {
      next(err);
    }
  },
);

/* ───────── 수동 갱신(디버그) ─────────  POST /registry/:propId/refresh */
router.post(
  '/:propId/refresh',
  authGuard,
  async (req: AuthReq, res: Response, next: NextFunction) => {
    try {
      // 1) id로 문서를 찾고 populate
      const propDoc = await Registry
        .findById(req.params.propId)
        .populate<{ property: { addressBasic: string } }>('property');

      if (!propDoc) return void res.status(404).json({ msg: 'property not found' });

      // 2) 주소 꺼내기
      const { addressBasic } = propDoc.property;

      // 3) 실 API vs 스텁
      const data = process.env.REGISTRY_API_KEY
        ? await fetchRegistry(addressBasic)
        : await fetchRegistryStub(addressBasic);

      // TODO: 새 스냅샷 저장 로직이 있다면 추가

      res.json({ fetched: data.hash });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
