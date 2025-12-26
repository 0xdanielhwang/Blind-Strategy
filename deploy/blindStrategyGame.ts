import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0]?.address;
  if (!deployer) {
    throw new Error("Missing deployer signer. Set PRIVATE_KEY in .env for sepolia deployments.");
  }
  const { deploy } = hre.deployments;

  const deployed = await deploy("BlindStrategyGame", {
    from: deployer,
    log: true,
  });

  console.log(`BlindStrategyGame contract: `, deployed.address);
};

export default func;
func.id = "deploy_blindStrategyGame";
func.tags = ["BlindStrategyGame"];
