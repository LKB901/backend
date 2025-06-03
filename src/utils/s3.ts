import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import multer from 'multer';

/* ── 환경 플래그 ─────────────────────────── */
const LOCAL = process.env.LOCAL_STORAGE === 'true';

/* ── 1) multipart/form‑data 업로드 미들웨어 ─ */
let uploadForm: multer.Multer;

/* ── 2) 버퍼 업로드 함수 (PDF 등) ─────────── */
export let uploadBuffer: (
  buf: Buffer,
  key: string,
  contentType: string
) => Promise<{ key: string }>;

/* ────────────────────────────────────────── */
if (LOCAL) {
  /* 로컬 파일 시스템 저장 ------------------- */
  uploadForm = multer({
    storage: multer.diskStorage({
      destination: (_req, file, cb) => {
        const dir =
          file.fieldname === 'idImage' ? 'uploads/ids' : 'uploads/contracts';
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    })
  });

  uploadBuffer = async (buf, key) => {
    const full = path.join('uploads', key);
    const dir = path.dirname(full);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(full, buf);
    return { key: full };
  };
} else {
  /* S3 저장 ------------------------------- */
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const multerS3 = require('multer-s3');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

  const s3 = new S3Client({ region: process.env.AWS_REGION! });

  uploadForm = multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET!,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (_req: any, file: Express.Multer.File, cb: (error: Error | null, key: string) => void) => {
        const folder =
          file.fieldname === 'idImage' ? 'ids' : 'contracts';
        cb(null, `${folder}/${Date.now()}-${file.originalname}`);
      }
    })
  });

  uploadBuffer = async (buf, key, contentType) => {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buf,
        ContentType: contentType
      })
    );
    return { key };
  };
}

/* ── export ─────────────────────────────── */
export { uploadForm };
