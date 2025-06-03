import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import Handlebars from 'handlebars';

/**
 * PDF 생성 결과
 */
export interface GeneratedPdf {
  s3Key: string;
  hash: string;
}

/**
 * 템플릿 이름과 데이터 객체를 받아 PDF를 생성한 뒤
 * `public/pdfs` 폴더에 저장하고 { s3Key, hash }를 반환한다.
 *
 * @param template   pdf 템플릿(.hbs) 파일 이름 (확장자 제외)
 * @param data       템플릿에 주입할 데이터 객체
 */
export async function generatePdf(
  template: string,
  data: Record<string, any>
): Promise<GeneratedPdf> {
  /* 1) 템플릿 로드 */
  const tplDir = path.join(__dirname, '..', 'templates', 'pdf');
  const tplPath = path.join(tplDir, `${template}.hbs`);
  const defaultPath = path.join(tplDir, 'default.hbs');
  const tplSrc = fs.readFileSync(fs.existsSync(tplPath) ? tplPath : defaultPath, 'utf8');
  const content = Handlebars.compile(tplSrc)(data);

  /* 2) PDF 문서 · 폰트 준비 */
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const notoPath = path.join(process.cwd(), 'fonts', 'NotoSansKR-Regular.ttf');
  const font = fs.existsSync(notoPath)
    ? await pdfDoc.embedFont(fs.readFileSync(notoPath), { subset: true })
    : await pdfDoc.embedFont(StandardFonts.Helvetica);

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
  const outDir = path.join(process.cwd(), 'public', 'pdfs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, fileName), pdfBytes);

  /* 5) SHA‑256 해시 */
  const hash = crypto.createHash('sha256').update(pdfBytes).digest('hex');

  return { s3Key: `pdfs/${fileName}`, hash };
}
