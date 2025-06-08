"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadForm = exports.uploadBuffer = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
/* ── 환경 플래그 ─────────────────────────── */
const LOCAL = process.env.LOCAL_STORAGE === 'true';
/* ── 1) multipart/form‑data 업로드 미들웨어 ─ */
let uploadForm;
/* ────────────────────────────────────────── */
if (LOCAL) {
    /* 로컬 파일 시스템 저장 ------------------- */
    exports.uploadForm = uploadForm = (0, multer_1.default)({
        storage: multer_1.default.diskStorage({
            destination: (_req, file, cb) => {
                const dir = file.fieldname === 'idImage' ? 'uploads/ids' : 'uploads/contracts';
                if (!(0, fs_1.existsSync)(dir))
                    (0, fs_1.mkdirSync)(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (_req, file, cb) => {
                cb(null, `${Date.now()}-${file.originalname}`);
            }
        })
    });
    exports.uploadBuffer = async (buf, key) => {
        const full = path_1.default.join('uploads', key);
        const dir = path_1.default.dirname(full);
        if (!(0, fs_1.existsSync)(dir))
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        (0, fs_1.writeFileSync)(full, buf);
        return { key: full };
    };
}
else {
    /* S3 저장 ------------------------------- */
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const multerS3 = require('multer-s3');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const s3 = new S3Client({ region: process.env.AWS_REGION });
    exports.uploadForm = uploadForm = (0, multer_1.default)({
        storage: multerS3({
            s3,
            bucket: process.env.S3_BUCKET,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (_req, file, cb) => {
                const folder = file.fieldname === 'idImage' ? 'ids' : 'contracts';
                cb(null, `${folder}/${Date.now()}-${file.originalname}`);
            }
        })
    });
    exports.uploadBuffer = async (buf, key, contentType) => {
        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: buf,
            ContentType: contentType
        }));
        return { key };
    };
}
