import { AlertType } from '../models/alert.model';

const PDF_URL = 'http://localhost:3000/public/auction-advice.pdf';


export function formatAlert(type: AlertType, diff: any): string {
  switch (type) {
    case 'OWNER_CHANGE':
      return `소유자 변경: ${diff.lhs} → ${diff.rhs}`;

    case 'LIEN_ADD':
      return `새 근저당 설정: ${diff.item.rhs.creditor} / ${diff.item.rhs.amt}`;

    case 'LIEN_EDIT': {
      const field = diff.path.at(-1);
      if (field === 'amt')
        return `근저당 금액 변경: ${diff.lhs} → ${diff.rhs}`;
      return `근저당 ${field} 변경: ${diff.lhs} → ${diff.rhs}`;
    }

    case 'LIEN_REMOVE':
      return `근저당 말소: ${diff.item.lhs.creditor} / ${diff.item.lhs.amt} 해제`;

    case 'AUCTION_START':
      return [
        '경매 개시(매각 절차) 등록',
        '',
        '📄 대응 가이드 PDF 다운로드:',
        '',
        PDF_URL,
      ].join('\n');

    case 'AUCTION_END':
      return '경매 절차 종료(말소)';

    case 'LEASE_ADD':
      return `새 임차권 설정: 세입자 ${diff.item.rhs.tenant} / 보증금 ${formatMoney(diff.item.rhs.deposit)}`;
    case 'LEASE_EDIT': {
            const field = diff.path.at(-1);
            if (field === 'deposit')
            return `임차권 보증금 변경: ${formatMoney(diff.lhs)} → ${formatMoney(diff.rhs)}`;
            if (field === 'term')
            return `임차권 기간 변경: ${diff.lhs.from}~${diff.lhs.to} → ${diff.rhs.from}~${diff.rhs.to}`;
            return '임차권 정보 수정';
            }
    case 'LEASE_REMOVE':
            return `임차권 말소: ${diff.item.lhs.tenant} / ${formatMoney(diff.item.lhs.deposit)}`;  

    default:
      return '등기부 변동 감지 (상세 미분류)';
  }
}

//임차권 등기 만들어야함

function formatMoney(n: string | number) {
  const num = typeof n === 'number' ? n : Number(String(n).replace(/[^0-9]/g, ''));
  return num ? num.toLocaleString('ko-KR') + '원' : String(n);
}
