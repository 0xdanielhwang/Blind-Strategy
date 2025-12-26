import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import '../styles/ScoreCard.css';

type Props = {
  joined: boolean;
  submitted: boolean;
  isConfigured: boolean;
};

export function ScoreCard({ joined, submitted, isConfigured }: Props) {
  const { address } = useAccount();
  const { instance } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [points, setPoints] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const { data: encryptedPoints } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getEncryptedPoints',
    args: address ? [address] : undefined,
    query: { enabled: isConfigured && !!address && joined },
  });

  const decryptPoints = async () => {
    if (!instance || !address || !signerPromise || !encryptedPoints) return;
    setIsDecrypting(true);
    setStatus('Signing a decryption request…');
    try {
      const keypair = instance.generateKeypair();
      const handleContractPairs = [{ handle: encryptedPoints, contractAddress: CONTRACT_ADDRESS }];
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
      const signer = await signerPromise;
      if (!signer) throw new Error('Signer not available');

      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      setStatus('Decrypting via the relayer…');
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      const decrypted = result[encryptedPoints as string];
      const asNumber = typeof decrypted === 'string' ? parseInt(decrypted, 10) : Number(decrypted);
      setPoints(Number.isFinite(asNumber) ? asNumber : null);
      setStatus('');
    } catch (err) {
      console.error(err);
      setStatus(err instanceof Error ? err.message : 'Decryption failed');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <section className="card">
      <h2 className="card-title">My Points</h2>

      {!address && <p className="muted">Connect your wallet to view your encrypted points.</p>}

      {address && !isConfigured && <p className="error">Contract is not configured for Sepolia.</p>}

      {address && !joined && <p className="muted">Join the game first to initialize your encrypted points.</p>}

      {address && isConfigured && joined && (
        <>
          <div className="points-row">
            <div className="points-value">{points === null ? '***' : points}</div>
            <button className="secondary" disabled={isDecrypting || !submitted} onClick={decryptPoints}>
              {submitted ? (isDecrypting ? 'Decrypting…' : 'Decrypt My Points') : 'Submit answers first'}
            </button>
          </div>
          {encryptedPoints && (
            <p className="muted small">
              Encrypted handle: <code className="mono">{String(encryptedPoints).slice(0, 18)}…</code>
            </p>
          )}
          {status && <p className={status.includes('failed') ? 'error' : 'muted'}>{status}</p>}
        </>
      )}
    </section>
  );
}
