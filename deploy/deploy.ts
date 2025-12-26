import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0]?.address;
  if (!deployer) {
    throw new Error("Missing deployer signer. Set PRIVATE_KEY in .env for sepolia deployments.");
  }
  const { deploy } = hre.deployments;

  const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });

  console.log(`FHECounter contract: `, deployedFHECounter.address);
};
export default func;
func.id = "deploy_fheCounter"; // id required to prevent reexecution
func.tags = ["FHECounter"];
