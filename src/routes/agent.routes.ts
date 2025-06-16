// src/routes/agent.routes.ts
import {Response, Router} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Agent } from "../models";
import { uploadForm } from "../utils/s3";
import {authGuard, AuthReq} from "../middleware/auth.guard";
import {getsha256HashStr} from "../utils/crypt";

const LOCAL  = process.env.LOCAL_STORAGE === "true";
const SECRET = process.env.JWT_SECRET!;  // 환경변수 검증은 별도에서!

const router = Router();

/* ───────── 공인중개사 가입 ───────── */
router.post(
  "/",
  uploadForm.single("idImage"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ msg: "idImage missing" });
      return;
    }

    const { email, password, brokerNo } = req.body as {
      email: string;
      password: string;
      brokerNo: string;
    };

    const pwHash     = await bcrypt.hash(password, 10);
    const idImageKey = LOCAL ? req.file.path : (req.file as any).key;

    const agent = await Agent.create({
      email,
      pwHash,
      brokerNo,
      idImage: idImageKey,
    });

    res.status(201).json({ id: agent._id, msg: "wait for approval" });
  }
);

/* ───────── 관리자 승인 ───────── */
router.patch("/:id/approve", async (req, res) => {
  await Agent.findByIdAndUpdate(req.params.id, { approved: true });
  res.json({ msg: "approved" });
});

/* ───────── 로그인 ───────── */
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const agent = await Agent.findOne({ email, approved: true }).select('_id pwHash');
  if (!agent) {
    res.status(401).json({ msg: "no account or not approved" });
    return;
  }
  const ok = await bcrypt.compare(password,agent.pwHash);
  if (!ok) {
    res.status(401).json({ msg: "bad pw" });
    return;
  }

  const token = jwt.sign({ sub: agent }, SECRET, { expiresIn: "8h" });
  console.log(agent);
  res.json({ token:token, id:agent._id });
});

router.get('/agentInfo/:id', authGuard, async (req: AuthReq, res: Response): Promise<void> => {
    const id = req.agentId;
    console.log(id);
    // console.log(req.params.id);
    if(req.params.id!=id){
        res.status(401).json({msg:'other agent'})
        return;
    }
    const agentInfo =
        await Agent.findById(id).select('name manageProperties');
    console.log(agentInfo);
    res.json(agentInfo);
});

export default router;
