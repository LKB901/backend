import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

import { Alert, AlertDoc } from '../models/alert.model';
import { PropertyDoc } from '../models/property.model';
import { formatAlert } from './alertFormatter';

const { USE_STUB_ALERT, MAIL_USER, MAIL_PASS, PUBLIC_ORIGIN } = process.env;
const isStub = USE_STUB_ALERT === 'true';
const logFile = path.resolve('__stubs__/alerts.log');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: MAIL_USER, pass: MAIL_PASS },
});

/** sent:false 인 Alert들을 찾아 알림 발송 → sent:true */
export async function sendUnsentAlerts(): Promise<void> {
  // property 필드를 실제 문서로 populate
  const unsent = await Alert.find({ sent: false })
    .populate<{ property: PropertyDoc }>('property')
    .exec();

  for (const a of unsent) {
    // 타입 가드: populate 실패 시 대비 (이론상 없음)
    if (typeof a.property === 'string') continue;

    /* 1️⃣ 주소 한 줄 */
    const fullAddr =
      a.property.addressBasic +
      (a.property.rentDetailPart ? ` ${a.property.rentDetailPart}` : '');

    /* 2️⃣ PDF 다운로드 URL (알림별) */
    const url = `${PUBLIC_ORIGIN}/${a.pdfPath}`;

    /* 3️⃣ 메일 본문 (txt + HTML) */
    const diffText = formatAlert(a.type, a.diff);
    const bodyText = [
      `[등기변동] ${fullAddr}`,
      diffText,
      '',
      `📄 대응 가이드: ${url}`,
    ].join('\n');

    const bodyHtml = `\n      <p><strong>[등기변동] ${fullAddr}</strong></p>\n      <pre style="font-family: Pretendard, sans-serif">${diffText}</pre>\n      <p><a href="${url}">📄 대응 가이드 PDF 다운로드</a></p>\n    `;

    /* 4️⃣ 발송 or 스텁 로깅 */
    if (isStub) {
      await fs.appendFile(logFile, bodyText + '\n');
      console.log('(stub alert)', bodyText);
    } else {
      await transporter.sendMail({
        from: MAIL_USER,
        to: a.property.subsEmail, // string | string[] OK
        subject: '부동산 등기변동 알림',
        text: bodyText,
        html: bodyHtml,
      });
    }

    /* 5️⃣ 중복 방지 플래그 */
    a.sent = true;
    await a.save();
  }
}
