export const CONTRACT_ADDRESS = '0xaFe912F8755a144D795EfE3ff6104f278e7f4845' as const;

export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'player', type: 'address' }],
    name: 'AnswersSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'player', type: 'address' }],
    name: 'PlayerJoined',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getEncryptedAnswers',
    outputs: [
      { internalType: 'euint8', name: '', type: 'bytes32' },
      { internalType: 'euint8', name: '', type: 'bytes32' },
      { internalType: 'euint8', name: '', type: 'bytes32' },
      { internalType: 'euint8', name: '', type: 'bytes32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getEncryptedPoints',
    outputs: [{ internalType: 'euint32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'hasJoined',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'hasSubmitted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'joinGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'joinedAt',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'externalEuint8', name: 'a1', type: 'bytes32' },
      { internalType: 'externalEuint8', name: 'a2', type: 'bytes32' },
      { internalType: 'externalEuint8', name: 'a3', type: 'bytes32' },
      { internalType: 'externalEuint8', name: 'a4', type: 'bytes32' },
      { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
    ],
    name: 'submitAnswers',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

