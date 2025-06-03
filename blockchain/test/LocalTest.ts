import { expect } from "chai";
import {hre,ethers} from "hardhat";
import Web3 from "web3";

// 로컬 네트워크 내에서 테스트 진행 테스트 진행 시 로컬 네트워크 초기화 필요
// 기본적으로 ㅇ
describe("Lock", function () {
    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const hashStorage = await ethers.getContractAt("HashStorage", "0x5fbdb2315678afecb367f032d93f642f64180aa3");
        const web3 = new Web3();
        const hashes = [
            web3.utils.keccak256("hello"),
            web3.utils.keccak256("asdasdasfas"),
            web3.utils.keccak256("qw1g23")];
        const before = await hashStorage.getHashCount();
        const receipt = await hashStorage.addHashes(hashes);

        const storedCount = await hashStorage.getHashCount();
        expect(storedCount.toString()).equal((Number(before)+Number(hashes.length)).toString());
        const existResult = await hashStorage.getHashExist(hashes);
        expect(existResult.every(v => v === true)).to.be.true;
        console.log("ExistResult:",existResult);
        const nonExistHash = [web3.utils.keccak256("nonExist"),];
        const nonExistResult = await hashStorage.getHashExist(nonExistHash);
        expect(nonExistResult.every(v => v === false)).to.be.true;
        console.log("nonExistResult:",nonExistResult);
      });
    });
});
