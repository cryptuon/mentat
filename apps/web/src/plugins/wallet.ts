import type { App } from 'vue';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import type { WalletAdapter } from '../stores/wallet';
import { useWalletStore } from '../stores/wallet';

export interface WalletPluginOptions {
  wallets?: any[];
  autoConnect?: boolean;
}

// Convert Solana wallet adapter to our interface
function adaptWallet(adapter: any): WalletAdapter {
  return {
    name: adapter.name,
    url: adapter.url,
    icon: adapter.icon,
    readyState: adapter.readyState,
    publicKey: adapter.publicKey,
    connecting: adapter.connecting,
    connected: adapter.connected,
    connect: () => adapter.connect(),
    disconnect: () => adapter.disconnect(),
    signTransaction: adapter.signTransaction?.bind(adapter),
    signAllTransactions: adapter.signAllTransactions?.bind(adapter),
    signMessage: adapter.signMessage?.bind(adapter),
  };
}

export const walletPlugin = {
  install(app: App, options: WalletPluginOptions = {}) {
    const {
      wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
      autoConnect = false,
    } = options;

    // Provide wallets list
    const adaptedWallets = wallets.map(adaptWallet);
    app.provide('wallets', adaptedWallets);

    // Auto-connect if enabled
    if (autoConnect) {
      const walletStore = useWalletStore();
      const storedWalletName = localStorage.getItem('walletName');

      if (storedWalletName) {
        const wallet = adaptedWallets.find((w) => w.name === storedWalletName);
        if (wallet && wallet.readyState === 'Installed') {
          setTimeout(() => {
            walletStore.connect(wallet).catch((error) => {
              console.error('Auto-connect failed:', error);
            });
          }, 100);
        }
      }
    }
  },
};
