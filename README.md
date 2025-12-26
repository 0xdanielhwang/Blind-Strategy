# Blind Strategy Game

Blind Strategy is a privacy-first quiz game built on Zama's FHEVM. Players answer four strategy questions, submit encrypted choices on-chain, and receive encrypted points when all answers are correct. The game keeps both answers and scores confidential while still allowing verification and rewards.

## Why this project exists
Most on-chain games leak user choices and scoring logic to the public mempool and blockchain state. That makes honest play and fair rewards hard when strategies should be private. Blind Strategy uses fully homomorphic encryption so that answers, correct choices, and points remain encrypted while the contract can still compare and reward.

## Key capabilities
- Players join once and receive a private, encrypted points balance.
- Four questions with four options each; answers are submitted as encrypted values.
- Correct answers are encrypted and stored in the contract.
- Encrypted verification and reward flow: all correct gives +100 points (still encrypted).
- Frontend uses the Zama relayer to encrypt inputs before submission.

## Advantages
- Confidential gameplay: answers and scores are not exposed on-chain.
- Fair rewards: verification happens inside the contract on encrypted data.
- Clear player flow: join, answer, submit, and read your encrypted points.
- Separation of concerns: Solidity handles verification and rewards, frontend handles encryption and UX.

## Tech stack
- Smart contracts: Solidity + Hardhat + hardhat-deploy
- FHE: Zama FHEVM, @fhevm/solidity, Zama relayer SDK
- Frontend: React + Vite + RainbowKit + Viem (reads) + Ethers (writes)
- Tooling: TypeScript, ESLint, Prettier

## How it works (end-to-end)
1. Player joins the game via `joinGame()`.
2. Frontend asks four questions and collects one choice per question.
3. Answers are encrypted with the Zama relayer and submitted via `submitAnswers(...)`.
4. Contract compares encrypted answers to encrypted correct values (1, 2, 3, 4).
5. If all are correct, encrypted points increase by 100.
6. Player can read their encrypted answers and points with view calls and decrypt client-side.

## Contract behavior
Contract: `contracts/BlindStrategyGame.sol`
- Stores encrypted correct answers as `euint8`.
- Stores per-player encrypted answers and encrypted points.
- Emits events when a player joins or submits.
- View methods expose encrypted values only; no cleartext leaks.

## Repository layout
- `contracts/`: Solidity contracts
- `deploy/`: Deployment scripts (hardhat-deploy)
- `tasks/`: Hardhat tasks
- `test/`: Contract tests
- `frontend/`: React frontend (Vite)
- `deployments/`: Network deployments and generated ABIs
- `docs/`: Zama reference docs

## Prerequisites
- Node.js 20+
- npm
- A Sepolia account funded with test ETH

## Install
```bash
npm install
```

## Compile and test
```bash
npm run compile
npm run test
```

## Local development (contracts)
```bash
npm run chain
npm run deploy:localhost
```

## Sepolia deployment
1. Create `.env` with private key and Infura key (no mnemonic).
   - `PRIVATE_KEY=...`
   - `INFURA_API_KEY=...`
   - `ETHERSCAN_API_KEY=...` (optional)
2. Deploy:
```bash
npm run deploy:sepolia
```
3. Verify (optional):
```bash
npm run verify:sepolia -- <CONTRACT_ADDRESS>
```

## Frontend integration notes
- The frontend reads the ABI from `deployments/sepolia` and must use the generated ABI.
- Contract reads use Viem; writes use Ethers.
- The frontend does not use environment variables, local storage, or localhost networks.
- The frontend expects a real network (Sepolia) and wallet connection.

## Testing focus
- Join flow and single submission per player
- Encrypted answer comparisons
- Encrypted reward updates

## Problem solved
Blind Strategy demonstrates how to build a fair, privacy-preserving on-chain game. It removes the incentive for mempool snooping or chain analysis by ensuring that choices and scores are never stored in plaintext.

## Future roadmap
- Multiple rounds and question sets with encrypted rotation
- Time-limited rounds and anti-spam gates
- Encrypted leaderboards with selective disclosure
- Multi-player tournaments and team modes
- UX improvements for decryption and proof handling

## License
BSD-3-Clause-Clear
