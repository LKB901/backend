import 'dotenv/config';   // .env 자동 로드 (backend/.env)
import path from 'path';
import fs   from 'fs';
import Web3 from 'web3';

/* ── 1. ABI + 주소 JSON 경로 계산 ─────────────────────────── */
/*  • dist/services → ../../blockchain/...  (빌드)
    • src/services  → ../blockchain/...     (개발, ts-node-dev) */

const artifactPath =
  process.env.CONTRACT_ARTIFACT ??
  path.resolve(
    __dirname,
    __dirname.includes(path.sep + 'dist' + path.sep) ? '../../../' : '../../',
    'blockchain',
    'ignition',
    'deployments',
    'chain-11155111',
    'artifacts',
    'HashStorageModule#HashStorage.json'
  );

if (!fs.existsSync(artifactPath)) {
  throw new Error(`❌ Contract artifact not found at: ${artifactPath}`);
}

const { abi, address: deployedAddress } = JSON.parse(
  fs.readFileSync(artifactPath, 'utf8')
);

/* ── 2. Web3 초기화 ────────────────────────────────────────── */
const rpcUrl  = process.env.SEPOLIA_RPC_URL;
const privKey = process.env.PRIVATE_KEY;
const ctrAddr = process.env.ETH_ACCOUNT_ADDR ?? deployedAddress;

if (!rpcUrl)  throw new Error('❌ SEPOLIA_RPC_URL env var not set');
if (!privKey) throw new Error('❌ PRIVATE_KEY env var not set');
if (!ctrAddr) throw new Error('❌ ETH_ACCOUNT_ADDR env var not set');

const web3     = new Web3(new Web3.providers.HttpProvider(rpcUrl));
const contract = new web3.eth.Contract(abi, ctrAddr);

/* ── 3. 체인 연동 함수 ────────────────────────────────────── */
export async function addHashesAtchain(
  hashes: string[]
): Promise<string[]> {
  const exists = (await contract.methods.getHashExist(hashes).call()) as boolean[];

  const newOnes = hashes.filter((_, i) => !exists[i]);
  const skipped = hashes.filter((_, i) =>  exists[i]);
  if (newOnes.length === 0) return skipped;

  const tx = {
    to  : ctrAddr,
    data: contract.methods.addHashes(newOnes).encodeABI(),
    gas : 2_000_000,
    gasPrice: await web3.eth.getGasPrice(),
  };

  const signed = await web3.eth.accounts.signTransaction(
    tx,
    privKey as `0x${string}`
  );
  if (!signed.rawTransaction)
    throw new Error('❌ Failed to sign transaction');

  await web3.eth.sendSignedTransaction(signed.rawTransaction);
  return skipped;
}

export async function getHashExist(hash: string): Promise<boolean> {
  const [exists] = (await contract.methods.getHashExist([hash]).call()) as boolean[];
  return exists;
}
