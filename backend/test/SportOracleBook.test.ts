import { expect } from "chai";
import hre, { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { SportOracleBook, SportOracleBook__factory } from "../types";

describe("SportOracleBook", function () {
  let deployer: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let contract: SportOracleBook;
  let contractAddress: string;

  async function buildDecryptionArtifacts(
    handles: string[],
    clearValues: bigint[],
    abiTypes: readonly string[]
  ): Promise<{ cleartexts: string; proof: string }> {
    const rawResponse = (await hre.fhevm.debugger.createDecryptionSignatures(handles, clearValues)) as unknown;
    const signatureList = Array.isArray(rawResponse)
      ? (rawResponse as string[])
      : (rawResponse as { signatures?: string[] }).signatures ?? [];

    const numSignersPacked = ethers.solidityPacked(["uint8"], [signatureList.length]);
    const signaturesPacked =
      signatureList.length > 0
        ? ethers.solidityPacked(new Array(signatureList.length).fill("bytes"), signatureList)
        : "0x";
    const extraData = ethers.solidityPacked(["uint8"], [0]);

    const proofBytes = ethers.concat([
      ethers.getBytes(numSignersPacked),
      ethers.getBytes(signaturesPacked),
      ethers.getBytes(extraData)
    ]);

    const cleartexts = ethers.AbiCoder.defaultAbiCoder().encode(abiTypes, clearValues);

    return {
      cleartexts,
      proof: ethers.hexlify(proofBytes)
    };
  }

  beforeEach(async function () {
    [deployer, alice, bob] = await ethers.getSigners();

    const factory = (await ethers.getContractFactory("SportOracleBook")) as SportOracleBook__factory;
    contract = (await factory.deploy(deployer.address, deployer.address)) as SportOracleBook;
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
  });

  async function parseEvent<T>(
    receipt: ethers.TransactionReceipt,
    eventName: string
  ): Promise<ethers.LogDescription & { args: T }> {
    for (const log of receipt.logs ?? []) {
      try {
        const parsed = contract.interface.parseLog(log) as ethers.LogDescription & { args: T };
        if (parsed.name === eventName) {
          return parsed;
        }
      } catch (error) {
        // Ignore unrelated logs
      }
    }
    throw new Error(`Event ${eventName} not found`);
  }

  it("runs the encrypted betting lifecycle", async function () {
    const latestBlock = await ethers.provider.getBlock("latest");
    const currentTime = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000);
    const startTime = currentTime + 60;
    const lockTime = currentTime + 3600;

    const createTx = await contract.connect(deployer).createMarket(101, 3, startTime, lockTime);
    await expect(createTx).to.emit(contract, "MarketCreated").withArgs(101, 3, startTime, lockTime);

    const stake = ethers.parseEther("1");
    const outcomeIndex = 1;

    const betBuilder = hre.fhevm.createEncryptedInput(contractAddress, alice.address);
    betBuilder.add32(outcomeIndex);
    betBuilder.add64(stake);
    const encryptedPayload = await betBuilder.encrypt();

    const commitment = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32", "address"],
        [encryptedPayload.handles[0], encryptedPayload.handles[1], alice.address]
      )
    );

    const betTx = await contract
      .connect(alice)
      .placeBet(101, encryptedPayload.handles[0], encryptedPayload.handles[1], encryptedPayload.inputProof, commitment, {
        value: stake
      });
    const betReceipt = await betTx.wait();
    const betEvent = await parseEvent<{
      marketId: bigint;
      ticketId: bigint;
      bettor: string;
      commitment: string;
      escrowedValue: bigint;
    }>(betReceipt, "BetPlaced");
    const ticketId = betEvent.args.ticketId;
    expect(betEvent.args.escrowedValue).to.equal(stake);

    await ethers.provider.send("evm_setNextBlockTimestamp", [lockTime + 1]);
    await ethers.provider.send("evm_mine", []);

    const settleTx = await contract.connect(deployer).settleMarket(101, outcomeIndex);
    const settleReceipt = await settleTx.wait();
    const decryptionRequests = hre.fhevm.parseDecryptionRequestEvents(settleReceipt.logs);
    expect(decryptionRequests).to.have.lengthOf(1);
    const ratioRequest = decryptionRequests[0];
    const expectedRatio = BigInt(1_000_000);
    const ratioArtifacts = await buildDecryptionArtifacts(ratioRequest.handlesBytes32Hex, [stake, stake], [
      "uint64",
      "uint64"
    ]);
    await contract
      .connect(deployer)
      .onSettlementDecrypted(ratioRequest.requestID, ratioArtifacts.cleartexts, ratioArtifacts.proof);

    const marketView = await contract.getMarket(101);
    expect(marketView.payoutRatio).to.equal(expectedRatio);
    expect(marketView.escrowBalance).to.equal(stake);

    const claimTx = await contract.connect(alice).claimPayout(ticketId, encryptedPayload.inputProof);
    const claimReceipt = await claimTx.wait();
    const payoutRequests = hre.fhevm.parseDecryptionRequestEvents(claimReceipt.logs);
    expect(payoutRequests).to.have.lengthOf(1);
    const payoutRequest = payoutRequests[0];
    const payoutArtifacts = await buildDecryptionArtifacts(payoutRequest.handlesBytes32Hex, [stake], ["uint64"]);

    await expect(
      contract
        .connect(deployer)
        .onPayoutDecrypted(payoutRequest.requestID, payoutArtifacts.cleartexts, payoutArtifacts.proof)
    ).to.emit(contract, "PayoutClaimed");

    const finalMarketView = await contract.getMarket(101);
    expect(finalMarketView.escrowBalance).to.equal(0n);
  });

  it("rejects duplicate commitments", async function () {
    const latestBlock = await ethers.provider.getBlock("latest");
    const currentTime = latestBlock?.timestamp ?? Math.floor(Date.now() / 1000);
    const startTime = currentTime + 60;
    const lockTime = currentTime + 1800;

    await contract.connect(deployer).createMarket(202, 2, startTime, lockTime);

    const stake = ethers.parseEther("0.5");
    const betBuilder = hre.fhevm.createEncryptedInput(contractAddress, alice.address);
    betBuilder.add32(0);
    betBuilder.add64(stake);
    const encryptedPayload = await betBuilder.encrypt();

    const commitment = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "bytes32", "address"],
        [encryptedPayload.handles[0], encryptedPayload.handles[1], alice.address]
      )
    );

    await contract
      .connect(alice)
      .placeBet(202, encryptedPayload.handles[0], encryptedPayload.handles[1], encryptedPayload.inputProof, commitment, {
        value: stake
      });

    await expect(
      contract
        .connect(alice)
        .placeBet(
          202,
          encryptedPayload.handles[0],
          encryptedPayload.handles[1],
          encryptedPayload.inputProof,
          commitment,
          { value: stake }
        )
    ).to.be.revertedWithCustomError(contract, "CommitmentAlreadyUsed");
  });
});
