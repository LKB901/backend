import { Router, Request, Response } from 'express';
import { Property } from '../models';

const router = Router();

/* 매물 등록 (주소, 건물명, 면적 등) */
router.post('/', async (req: Request, res: Response) => {
  const prop = await Property.create(req.body);
  res.status(201).json({ id: prop._id });
});

/* 매물 리스트 (선택적) */
router.get('/', async (_req, res) => {
  const list = await Property.find().sort({ createdAt: -1 });
  res.json(list);
});

export default router;
