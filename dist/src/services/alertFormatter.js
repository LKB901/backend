"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAlert = formatAlert;
const PDF_URL = 'http://localhost:3000/public/auction-advice.pdf';
function formatAlert(type, diff) {
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
        default:
            return '등기부 변동 감지 (상세 미분류)';
    }
}
function formatMoney(n) {
    const num = typeof n === 'number' ? n : Number(String(n).replace(/[^0-9]/g, ''));
    return num ? num.toLocaleString('ko-KR') + '원' : String(n);
}
