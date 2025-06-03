import fs from 'fs';
const txt = fs.readFileSync(process.argv[2], 'utf-8');

// 1) 소유자(갑구 순위1 소유권이전)
const owner = /소유자\s+([가-힣]+)/.exec(txt)?.[1] ?? '';

// 2) 을구 근저당권 rows
const lienRe = /근저당권설정[\s\S]+?채권최고액\s+금([0-9,]+)원[\s\S]+?근저당권자\s+([^\n]+)/g;
const liens = [];
let m;
while ((m = lienRe.exec(txt))) {
  liens.push({ bank: m[2].trim(), amount: +m[1].replace(/,/g, '') });
}

// 3) 가압류·경매
const auction = /임의경매신청/.test(txt);

const snapshot = { owner, liens, auction };
fs.writeFileSync('snapshot.json', JSON.stringify(snapshot, null, 2));
console.log('✓ snapshot.json generated');
