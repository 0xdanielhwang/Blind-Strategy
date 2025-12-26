import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { BlindStrategyGame, BlindStrategyGame__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("BlindStrategyGame")) as BlindStrategyGame__factory;
  const game = (await factory.deploy()) as BlindStrategyGame;
  const address = await game.getAddress();
  return { game, address };
}

describe("BlindStrategyGame", function () {
  let signers: Signers;
  let game: BlindStrategyGame;
  let gameAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ game, address: gameAddress } = await deployFixture());
  });

  it("requires join before submitting", async function () {
    const encrypted = await fhevm
      .createEncryptedInput(gameAddress, signers.alice.address)
      .add8(1)
      .add8(2)
      .add8(3)
      .add8(4)
      .encrypt();

    await expect(
      game
        .connect(signers.alice)
        .submitAnswers(encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], encrypted.inputProof),
    ).to.be.revertedWith("Player not joined");
  });

  it("awards 100 points for correct answers", async function () {
    await (await game.connect(signers.alice).joinGame()).wait();

    const encrypted = await fhevm
      .createEncryptedInput(gameAddress, signers.alice.address)
      .add8(1)
      .add8(2)
      .add8(3)
      .add8(4)
      .encrypt();

    await (
      await game
        .connect(signers.alice)
        .submitAnswers(encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], encrypted.inputProof)
    ).wait();

    const encryptedPoints = await game.getEncryptedPoints(signers.alice.address);
    const clearPoints = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedPoints, gameAddress, signers.alice);
    expect(clearPoints).to.eq(100);
  });

  it("does not award points for incorrect answers", async function () {
    await (await game.connect(signers.alice).joinGame()).wait();

    const encrypted = await fhevm
      .createEncryptedInput(gameAddress, signers.alice.address)
      .add8(1)
      .add8(2)
      .add8(3)
      .add8(1)
      .encrypt();

    await (
      await game
        .connect(signers.alice)
        .submitAnswers(encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], encrypted.inputProof)
    ).wait();

    const encryptedPoints = await game.getEncryptedPoints(signers.alice.address);
    const clearPoints = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedPoints, gameAddress, signers.alice);
    expect(clearPoints).to.eq(0);
  });

  it("prevents multiple submissions", async function () {
    await (await game.connect(signers.alice).joinGame()).wait();

    const encrypted = await fhevm
      .createEncryptedInput(gameAddress, signers.alice.address)
      .add8(1)
      .add8(2)
      .add8(3)
      .add8(4)
      .encrypt();

    await (
      await game
        .connect(signers.alice)
        .submitAnswers(encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], encrypted.inputProof)
    ).wait();

    await expect(
      game
        .connect(signers.alice)
        .submitAnswers(encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], encrypted.inputProof),
    ).to.be.revertedWith("Already submitted");
  });

  it("tracks join and submit flags via view functions", async function () {
    expect(await game.hasJoined(signers.bob.address)).to.eq(false);
    expect(await game.hasSubmitted(signers.bob.address)).to.eq(false);

    await (await game.connect(signers.bob).joinGame()).wait();

    expect(await game.hasJoined(signers.bob.address)).to.eq(true);
    expect(await game.hasSubmitted(signers.bob.address)).to.eq(false);

    const encrypted = await fhevm
      .createEncryptedInput(gameAddress, signers.bob.address)
      .add8(1)
      .add8(2)
      .add8(3)
      .add8(4)
      .encrypt();

    await (
      await game
        .connect(signers.bob)
        .submitAnswers(encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], encrypted.inputProof)
    ).wait();

    expect(await game.hasSubmitted(signers.bob.address)).to.eq(true);
  });
});

