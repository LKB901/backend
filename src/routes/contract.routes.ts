/* ────────────────────────────────────────────────────────────────
   contracts.routes.ts ─ 리팩터 완료본
   * Express 4.x 타입 체계에 맞춤
   * generatePdf() 시그니처(id, data, templateName?)에 호환
   * ObjectId·nullable signedAt 등 모델 불일치 해결
   * 모든 early-return 에서 Response 객체를 반환하지 않도록 수정
──────────────────────────────────────────────────────────────── */

import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';                  // ← ObjectId
import { authGuard, AuthReq } from '../middleware/auth.guard';
import { Contract, AuditLog } from '../models';
import { uploadForm } from '../utils/s3';
import { generatePdf } from '../utils/pdf';
import { sendToLedger } from '../utils/ledger';

const router = Router();

/* ---------- 1. 초안(DRAFT) 생성 ---------- */
router.post('/', authGuard, async (req: AuthReq, res: Response): Promise<void> => {
  const contract = await Contract.create({
    agent: req.agentId,
    ...req.body,
  });
  res.status(201).json({ id: contract._id });
});

/* ---------- 2. 계약서 PDF 생성 ---------- */
router.post('/:id/pdf', authGuard, async (req: AuthReq, res: Response): Promise<void> => {
  try {
    const { s3Key, hash } = await generatePdf(req.params.id, req.body); // 템플릿명 생략 시 default

    await Contract.findByIdAndUpdate(req.params.id, { pdfPath: s3Key });

    await AuditLog.create({ contract: req.params.id, action: 'PDF_CREATED', hash });

    res.json({ pdf: s3Key, hash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'pdf error' });
  }
});

/* ---------- 3. 참가자 초대 ---------- */
router.patch('/:id/invite', authGuard, async (req: AuthReq, res: Response): Promise<void> => {
  const { email, role } = req.body;

  const contract = await Contract.findById(req.params.id);
  if (!contract) {
    res.status(404).json({ msg: 'not found' });
    return;
  }

  if (!contract.participants.some(p => p.email === email)) {
    contract.participants.push({
      email,
      role,
      _id: new Types.ObjectId(),  // ObjectId() 호출
      name: '',
      phoneNum: '',
      verified: false,
      tokenUsed: false,
      ciHash: '',
      signedAt: null,            // 모델에서 nullable 로 정의
    });
  }

  const token = jwt.sign(
    { cid: contract._id, email },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );

  await contract.save();
  res.json({ link: `http://localhost:3000/contracts/sign?token=${token}` });
});

/* ---------- 4. 간이 본인확인 ---------- */
router.post(
  '/verify',
  uploadForm.single('idImage'),
  async (req: any, res: Response): Promise<void> => {
    const { token, code, name, phone } = req.body;
    if (code !== '0000') {
      res.status(400).json({ msg: 'bad code (stub)' });
      return;
    }

    const { cid, email } = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const contract = await Contract.findById(cid);
    const p = contract?.participants.find((pp: any) => pp.email === email);
    if (!p) {
      res.status(400).json({ msg: 'no participant' });
      return;
    }

    Object.assign(p, {
      name,
      phone,
      verified: true,
      idImage: req.file?.key,
    });

    await contract!.save();
    res.json({ msg: 'verified' });
  },
);

/* ---------- 5. 전자서명 ---------- */
router.get('/sign', async (req, res): Promise<void> => {
  try {
    const { cid, email } = jwt.verify(req.query.token as string, process.env.JWT_SECRET!) as any;

    const contract = await Contract.findById(cid);
    const p = contract?.participants.find(px => px.email === email);
    if (!p || p.tokenUsed) {
      res.status(400).send('invalid');
      return;
    }
    if (!p.verified) {
      res.status(400).send('not verified');
      return;
    }

    p.signedAt = new Date();
    p.tokenUsed = true;

    /* 모든 서명 완료 */
    if (contract!.participants.every(px => px.signedAt)) {
      contract!.state = 'signed';

      await AuditLog.create({
        contract: cid,
        action: 'SIGNED',
        hash: '', // 필요 시 PDF SHA-256
      });

      await sendToLedger({ contractId: cid, hash: '' });
    }

    await contract!.save();
    res.send('서명 완료');
  } catch {
    res.status(400).send('bad token');
  }
});

/* ---------- 6. 계약 상세 조회 ---------- */
router.get('/:id', authGuard, async (req: AuthReq, res: Response): Promise<void> => {
  const contract = await Contract.findById(req.params.id)
    .populate('property')
    .populate('agent', 'email')
    .lean();

  if (!contract) {
    res.status(404).json({ msg: 'contract not found' });
    return;
  }
  res.json({ contract });
});

export default router;
