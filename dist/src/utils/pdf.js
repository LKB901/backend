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
 * 계약 ID·데이터를 받아 PDF 생성 후
 * { s3Key: 'pdfs/파일.pdf', hash: 'sha256...' } 반환
 */
async function generatePdf(id, data, templateName = 'default') {
    /* 1) 템플릿 로드 */
    const tplPath = path_1.default.join(__dirname, '..', 'templates', 'pdf', `${templateName}.hbs`);
    const fallbackPath = path_1.default.join(__dirname, '..', 'templates', 'pdf', 'default.hbs');
    const tplSrc = fs_1.default.readFileSync(fs_1.default.existsSync(tplPath) ? tplPath : fallbackPath, 'utf8');
    const content = handlebars_1.default.compile(tplSrc)(data);
    /* 2) PDF 문서·폰트 */
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    pdfDoc.registerFontkit(fontkit_1.default);
    const font = await (async () => {
        try {
            const bytes = fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'fonts', 'NotoSansKR-Regular.ttf'));
            return pdfDoc.embedFont(bytes, { subset: true });
        }
        catch {
            return pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        }
    })();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    /* 3) 텍스트 렌더링 */
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
    /* 4) 저장 + 해시 */
    const pdfBytes = await pdfDoc.save();
    const fileName = `${templateName}-${Date.now()}-${id}.pdf`;
    const outDir = path_1.default.join(process.cwd(), 'public', 'pdfs');
    if (!fs_1.default.existsSync(outDir))
        fs_1.default.mkdirSync(outDir, { recursive: true });
    fs_1.default.writeFileSync(path_1.default.join(outDir, fileName), pdfBytes);
    const hash = crypto_1.default.createHash('sha256').update(pdfBytes).digest('hex');
    return { s3Key: `pdfs/${fileName}`, hash };
}
