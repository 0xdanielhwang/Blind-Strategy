import { useMemo, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Contract } from 'ethers';
import { Header } from './Header';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import '../styles/GameApp.css';
import { Quiz } from './Quiz';
import { ScoreCard } from './ScoreCard';

export type Answers = {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
};

const initialAnswers: Answers = { q1: null, q2: null, q3: null, q4: null };

export function GameApp() {
  const { address } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();
  const isConfigured = true

  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [writeStatus, setWriteStatus] = useState<string>('');
  const [isWriting, setIsWriting] = useState(false);

  const canSubmit = useMemo(() => {
    return answers.q1 && answers.q2 && answers.q3 && answers.q4;
  }, [answers]);

  const { data: joined } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasJoined',
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address },
  });

  const { data: submitted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasSubmitted',
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address && !!joined },
  });

  const joinGame = async () => {
    if (!isConfigured) return;
    if (!signerPromise) return;
    setIsWriting(true);
    setWriteStatus('Confirm the transaction in your wallet…');
    try {
      const signer = await signerPromise;
      if (!signer) throw new Error('Signer not available');
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.joinGame();
      setWriteStatus('Waiting for confirmation…');
      await tx.wait();
      setWriteStatus('Joined successfully.');
    } catch (err) {
      console.error(err);
      setWriteStatus(err instanceof Error ? err.message : 'Join failed');
    } finally {
      setIsWriting(false);
    }
  };

  const submitAnswers = async () => {
    if (!isConfigured) return;
    if (!instance || !address || !signerPromise) return;
    if (!canSubmit) {
      setWriteStatus('Please answer all 4 questions.');
      return;
    }

    setIsWriting(true);
    setWriteStatus('Encrypting your answers…');
    try {
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.add8(answers.q1 as number);
      input.add8(answers.q2 as number);
      input.add8(answers.q3 as number);
      input.add8(answers.q4 as number);
      const encrypted = await input.encrypt();

      const signer = await signerPromise;
      if (!signer) throw new Error('Signer not available');
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setWriteStatus('Submitting to the blockchain…');
      const tx = await contract.submitAnswers(
        encrypted.handles[0],
        encrypted.handles[1],
        encrypted.handles[2],
        encrypted.handles[3],
        encrypted.inputProof
      );
      setWriteStatus('Waiting for confirmation…');
      await tx.wait();
      setWriteStatus('Submission confirmed.');
    } catch (err) {
      console.error(err);
      setWriteStatus(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="game-app">
      <Header />
      <main className="game-main">
        <section className="card">
          <h2 className="card-title">Play</h2>

          {!isConfigured && (
            <p className="error">
              Contract is not configured. Deploy to Sepolia, then run{' '}
              <code className="mono">npx ts-node ./scripts/sync-frontend-contracts.ts sepolia</code>.
            </p>
          )}

          {!address && (
            <p className="muted">
              Connect your wallet to join the game, encrypt your answers, and submit them on-chain.
            </p>
          )}

          {address && (
            <div className="status-row">
              <div className="status-pill">
                <span className="status-label">Joined</span>
                <span className="status-value">{joined ? 'Yes' : 'No'}</span>
              </div>
              <div className="status-pill">
                <span className="status-label">Submitted</span>
                <span className="status-value">{submitted ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}

          {address && !joined && (
            <div className="actions">
              <button className="primary" disabled={!isConfigured || isWriting} onClick={joinGame}>
                {isWriting ? 'Joining…' : 'Join Game'}
              </button>
              <p className="muted small">Joining initializes your encrypted points on-chain.</p>
            </div>
          )}

          {address && joined && (
            <>
              <Quiz answers={answers} onChange={setAnswers} disabled={!!submitted || isWriting} />
              <div className="actions">
                <button
                  className="primary"
                  disabled={!isConfigured || !!submitted || isWriting || zamaLoading || !canSubmit || !!zamaError}
                  onClick={submitAnswers}
                >
                  {submitted ? 'Already submitted' : isWriting ? 'Submitting…' : 'Encrypt & Submit'}
                </button>
                {zamaError && <p className="error">{zamaError}</p>}
                {writeStatus && <p className="muted">{writeStatus}</p>}
              </div>
            </>
          )}
        </section>

        <ScoreCard joined={!!joined} submitted={!!submitted} isConfigured={isConfigured} />
      </main>
    </div>
  );
}
