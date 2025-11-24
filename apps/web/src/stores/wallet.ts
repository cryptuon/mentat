import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export interface WalletAdapter {
  name: string;
  url: string;
  icon: string;
  readyState: 'Installed' | 'NotDetected' | 'Loadable' | 'Unsupported';
  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction?: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions?: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

export const useWalletStore = defineStore('wallet', () => {
  // State
  const wallet = ref<WalletAdapter | null>(null);
  const publicKey = ref<PublicKey | null>(null);
  const connected = ref(false);
  const connecting = ref(false);
  const disconnecting = ref(false);
  const walletModalOpen = ref(false);
  const autoConnect = ref(false);

  // Computed
  const walletName = computed(() => wallet.value?.name ?? null);
  const walletIcon = computed(() => wallet.value?.icon ?? null);
  const publicKeyBase58 = computed(() => publicKey.value?.toBase58() ?? null);
  const shortAddress = computed(() => {
    if (!publicKeyBase58.value) return null;
    const addr = publicKeyBase58.value;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  });

  // Actions
  const setWallet = (newWallet: WalletAdapter | null) => {
    wallet.value = newWallet;
    publicKey.value = newWallet?.publicKey ?? null;
    connected.value = newWallet?.connected ?? false;
  };

  const openWalletModal = () => {
    walletModalOpen.value = true;
  };

  const closeWalletModal = () => {
    walletModalOpen.value = false;
  };

  const connect = async (walletAdapter: WalletAdapter) => {
    if (connecting.value || disconnecting.value) return;

    try {
      connecting.value = true;

      await walletAdapter.connect();

      setWallet(walletAdapter);
      closeWalletModal();

      // Store preference
      if (walletAdapter.name) {
        localStorage.setItem('walletName', walletAdapter.name);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      connecting.value = false;
    }
  };

  const disconnect = async () => {
    if (!wallet.value || disconnecting.value) return;

    try {
      disconnecting.value = true;

      await wallet.value.disconnect();

      setWallet(null);
      localStorage.removeItem('walletName');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    } finally {
      disconnecting.value = false;
    }
  };

  const signTransaction = async <T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> => {
    if (!wallet.value || !wallet.value.signTransaction) {
      throw new Error('Wallet not connected or does not support signing');
    }
    return await wallet.value.signTransaction(transaction);
  };

  const signAllTransactions = async <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> => {
    if (!wallet.value || !wallet.value.signAllTransactions) {
      throw new Error('Wallet not connected or does not support signing multiple transactions');
    }
    return await wallet.value.signAllTransactions(transactions);
  };

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!wallet.value || !wallet.value.signMessage) {
      throw new Error('Wallet not connected or does not support message signing');
    }
    return await wallet.value.signMessage(message);
  };

  const setAutoConnect = (value: boolean) => {
    autoConnect.value = value;
    localStorage.setItem('autoConnect', value.toString());
  };

  // Initialize auto-connect from localStorage
  const initAutoConnect = () => {
    const stored = localStorage.getItem('autoConnect');
    if (stored !== null) {
      autoConnect.value = stored === 'true';
    }
  };

  return {
    // State
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    walletModalOpen,
    autoConnect,

    // Computed
    walletName,
    walletIcon,
    publicKeyBase58,
    shortAddress,

    // Actions
    setWallet,
    openWalletModal,
    closeWalletModal,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    signMessage,
    setAutoConnect,
    initAutoConnect,
  };
});
