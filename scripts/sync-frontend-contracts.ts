import * as fs from "fs";
import * as path from "path";

type Deployment = {
  address: string;
  abi: unknown;
};

function assertIsObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function main() {
  const network = process.argv[2] || "sepolia";
  const repoRoot = path.resolve(__dirname, "..");
  const deploymentPath = path.join(repoRoot, "deployments", network, "BlindStrategyGame.json");
  const frontendContractsPath = path.join(repoRoot, "frontend", "src", "config", "contracts.ts");

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Missing deployment file: ${deploymentPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(deploymentPath, "utf8")) as unknown;
  if (!assertIsObject(parsed)) throw new Error("Invalid deployment JSON");

  const deployment: Deployment = {
    address: String(parsed.address ?? ""),
    abi: parsed.abi,
  };

  if (!deployment.address || !deployment.address.startsWith("0x") || deployment.address.length !== 42) {
    throw new Error(`Invalid deployment address: ${deployment.address}`);
  }
  if (!deployment.abi) {
    throw new Error("Missing deployment ABI");
  }

  const content =
    `export const CONTRACT_ADDRESS = '${deployment.address}' as const;\n\n` +
    `export const CONTRACT_ABI = ${JSON.stringify(deployment.abi, null, 2)} as const;\n`;

  fs.mkdirSync(path.dirname(frontendContractsPath), { recursive: true });
  fs.writeFileSync(frontendContractsPath, content, "utf8");

  console.log(`Updated ${path.relative(repoRoot, frontendContractsPath)} from ${path.relative(repoRoot, deploymentPath)}`);
}

main();
