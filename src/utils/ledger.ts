export const sendToLedger = async ({
  contractId,
  hash
}: {
  contractId: string;
  hash: string;
}) => {
  // TODO: 실제 블록 생성 & 트랜잭션 전송 로직
  console.log(`[LEDGER TX] contract=${contractId}, hash=${hash}`);
};
