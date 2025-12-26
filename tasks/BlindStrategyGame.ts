import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("game:address", "Prints the BlindStrategyGame address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;
  const deployment = await deployments.get("BlindStrategyGame");
  console.log("BlindStrategyGame address is " + deployment.address);
});

task("game:join", "Calls joinGame()").addOptionalParam("address", "Optionally specify the BlindStrategyGame address").setAction(
  async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get("BlindStrategyGame");
    const [signer] = await ethers.getSigners();
    const game = await ethers.getContractAt("BlindStrategyGame", deployment.address);
    const tx = await game.connect(signer).joinGame();
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  },
);

task("game:submit", "Submits 4 encrypted answers")
  .addOptionalParam("address", "Optionally specify the BlindStrategyGame address")
  .addParam("a1", "Answer 1 (1-4)")
  .addParam("a2", "Answer 2 (1-4)")
  .addParam("a3", "Answer 3 (1-4)")
  .addParam("a4", "Answer 4 (1-4)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get("BlindStrategyGame");
    const [signer] = await ethers.getSigners();
    const game = await ethers.getContractAt("BlindStrategyGame", deployment.address);

    const answers = [taskArguments.a1, taskArguments.a2, taskArguments.a3, taskArguments.a4].map((x: string) => parseInt(x, 10));
    if (answers.some((x) => !Number.isInteger(x) || x < 1 || x > 4)) {
      throw new Error("Answers must be integers in range 1..4");
    }

    const encrypted = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add8(answers[0])
      .add8(answers[1])
      .add8(answers[2])
      .add8(answers[3])
      .encrypt();

    const tx = await game
      .connect(signer)
      .submitAnswers(encrypted.handles[0], encrypted.handles[1], encrypted.handles[2], encrypted.handles[3], encrypted.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);
  });

task("game:decrypt-points", "Decrypts your encrypted points (mock only)")
  .addOptionalParam("address", "Optionally specify the BlindStrategyGame address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    if (!fhevm.isMock) {
      throw new Error("This task is intended for the local mock environment only.");
    }

    const deployment = taskArguments.address ? { address: taskArguments.address } : await deployments.get("BlindStrategyGame");
    const [signer] = await ethers.getSigners();
    const game = await ethers.getContractAt("BlindStrategyGame", deployment.address);

    const encryptedPoints = await game.getEncryptedPoints(signer.address);
    if (encryptedPoints === ethers.ZeroHash) {
      console.log("Encrypted points: 0x0 (uninitialized)");
      console.log("Clear points    : 0");
      return;
    }

    const clearPoints = await fhevm.userDecryptEuint(FhevmType.euint32, encryptedPoints, deployment.address, signer);
    console.log(`Encrypted points: ${encryptedPoints}`);
    console.log(`Clear points    : ${clearPoints}`);
  });

