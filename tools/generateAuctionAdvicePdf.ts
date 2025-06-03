import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public');
const OUT     = path.join(OUT_DIR, 'auction-advice.pdf');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const FONT = path.resolve('fonts', 'NotoSansKR-Regular.ttf');   // ★ 폰트 경로

const doc = new PDFDocument({ size: 'A4', margin: 50 });

doc.registerFont('noto', FONT);   // ★ 폰트 등록
doc.font('noto');                 // 이후 기본 글꼴

doc.pipe(fs.createWriteStream(OUT));

doc.fontSize(18).text('경매 개시 대응 가이드', { align: 'center' });
doc.moveDown();

doc.fontSize(12).text(`1. 즉시 확인해야 할 서류
• 등기부등본 – 말소기준·순위 확인
• 집행문·송달내역 – 기한 검토`);

doc.moveDown().text(`2. 대응 전략
① 채무 변제(경매취하) vs ② 경매 절차 대응
• 비용·기한·이해관계자 비교`);

doc.moveDown().text(`3. 필수 신고 & 일정
• 배당요구종기: 경매개시결정등본 송달일 + 2개월
• 임차권등기 인가 신청: 종기 전까지`);

doc.moveDown().text(`4. 필요 서류 목록
- 배당요구신청서
- 임차권등기명령신청서
- 확정일자부 임대차계약서 사본`);

doc.moveDown().text(`⚖️  문의
부동산전문 법무사 홍길동 02-123-4567 / law@sample.com`);

doc.end();
console.log('PDF generated at', OUT);
