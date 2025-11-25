import { ref, onMounted, onUnmounted } from 'vue';
import { Connection, PublicKey } from '@solana/web3.js';
import type { Commitment, ConnectionConfig } from '@solana/web3.js';
import { CURRENT_NETWORK } from '@/config/network';

export interface UseSolanaOptions {
  endpoint?: string;
  commitment?: Commitment;
  config?: ConnectionConfig;
}

export function useSolana(options: UseSolanaOptions = {}) {
  const {
    endpoint = CURRENT_NETWORK.endpoint,
    commitment = 'confirmed',
    config = {},
  } = options;

  const connection = ref<Connection | null>(null);
  const slot = ref<number>(0);
  const blockHeight = ref<number>(0);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  let slotSubscription: number | undefined;

  const initConnection = () => {
    try {
      connection.value = new Connection(endpoint, {
        commitment,
        ...config,
      });
      loading.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to initialize connection');
      loading.value = false;
    }
  };

  const subscribeToSlot = () => {
    if (!connection.value) return;

    slotSubscription = connection.value.onSlotChange((slotInfo) => {
      slot.value = slotInfo.slot;
    });
  };

  const updateBlockHeight = async () => {
    if (!connection.value) return;

    try {
      const height = await connection.value.getBlockHeight();
      blockHeight.value = height;
    } catch (err) {
      console.error('Failed to get block height:', err);
    }
  };

  const getBalance = async (publicKey: PublicKey): Promise<number> => {
    if (!connection.value) {
      throw new Error('Connection not initialized');
    }
    return await connection.value.getBalance(publicKey);
  };

  const getBalanceInSOL = async (publicKey: PublicKey): Promise<number> => {
    const lamports = await getBalance(publicKey);
    return lamports / 1e9; // Convert lamports to SOL
  };

  const requestAirdrop = async (publicKey: PublicKey, lamports: number): Promise<string> => {
    if (!connection.value) {
      throw new Error('Connection not initialized');
    }
    return await connection.value.requestAirdrop(publicKey, lamports);
  };

  const confirmTransaction = async (signature: string): Promise<void> => {
    if (!connection.value) {
      throw new Error('Connection not initialized');
    }
    const latestBlockhash = await connection.value.getLatestBlockhash();
    await connection.value.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
  };

  onMounted(() => {
    initConnection();
    subscribeToSlot();
    updateBlockHeight();

    // Update block height every 30 seconds
    const interval = setInterval(updateBlockHeight, 30000);

    onUnmounted(() => {
      clearInterval(interval);

      if (slotSubscription !== undefined && connection.value) {
        connection.value.removeSlotChangeListener(slotSubscription);
      }
    });
  });

  return {
    connection,
    slot,
    blockHeight,
    loading,
    error,
    getBalance,
    getBalanceInSOL,
    requestAirdrop,
    confirmTransaction,
  };
}
