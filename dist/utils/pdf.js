"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = generatePdf;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const pdf_lib_1 = require("pdf-lib");
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
const handlebars_1 = __importDefault(require("handlebars"));
/**
 * 템플릿 이름과 데이터 객체를 받아 PDF를 생성한 뒤
 * `public/pdfs` 폴더에 저장하고 { s3Key, hash }를 반환한다.
 *
 * @param template   pdf 템플릿(.hbs) 파일 이름 (확장자 제외)
 * @param data       템플릿에 주입할 데이터 객체
 */
async function generatePdf(template, data) {
    /* 1) 템플릿 로드 */
    const tplDir = path_1.default.join(__dirname, '..', 'templates', 'pdf');
    const tplPath = path_1.default.join(tplDir, `${template}.hbs`);
    const defaultPath = path_1.default.join(tplDir, 'default.hbs');
    const tplSrc = fs_1.default.readFileSync(fs_1.default.existsSync(tplPath) ? tplPath : defaultPath, 'utf8');
    const content = handlebars_1.default.compile(tplSrc)(data);
    /* 2) PDF 문서 · 폰트 준비 */
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    pdfDoc.registerFontkit(fontkit_1.default);
    const notoPath = path_1.default.join(process.cwd(), 'fonts', 'NotoSansKR-Regular.ttf');
    const font = fs_1.default.existsSync(notoPath)
        ? await pdfDoc.embedFont(fs_1.default.readFileSync(notoPath), { subset: true })
        : await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    /* 3) 본문 렌더링 */
    const fontSize = 11;
    const lineGap = 4;
    let y = height - 40;
    for (const line of content.split('\n')) {
        page.drawText(line, { x: 40, y, size: fontSize, font });
        y -= fontSize + lineGap;
        if (y < 40) {
            y = height - 40;
            pdfDoc.addPage();
        }
    }
    /* 4) 파일 저장 */
    const pdfBytes = await pdfDoc.save();
    const fileName = `${template}-${Date.now()}.pdf`;
    const outDir = path_1.default.join(process.cwd(), 'public', 'pdfs');
    if (!fs_1.default.existsSync(outDir))
        fs_1.default.mkdirSync(outDir, { recursive: true });
    fs_1.default.writeFileSync(path_1.default.join(outDir, fileName), pdfBytes);
    /* 5) SHA‑256 해시 */
    const hash = crypto_1.default.createHash('sha256').update(pdfBytes).digest('hex');
    return { s3Key: `pdfs/${fileName}`, hash };
}
