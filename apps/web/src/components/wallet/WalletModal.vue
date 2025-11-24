<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Connect Wallet</h2>
            <button @click="close" class="close-btn" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="connecting" class="connecting-state">
              <div class="spinner"></div>
              <p>Connecting to {{ connectingWallet }}...</p>
              <p class="hint">Check your wallet extension</p>
            </div>

            <div v-else class="wallet-list">
              <button
                v-for="wallet in wallets"
                :key="wallet.name"
                @click="handleConnect(wallet)"
                class="wallet-option"
                :class="{
                  installed: wallet.readyState === 'Installed',
                  'not-installed': wallet.readyState === 'NotDetected',
                }"
              >
                <div class="wallet-info-row">
                  <img
                    v-if="wallet.icon"
                    :src="wallet.icon"
                    :alt="wallet.name"
                    class="wallet-icon-lg"
                  />
                  <div class="wallet-details">
                    <span class="wallet-name">{{ wallet.name }}</span>
                    <span v-if="wallet.readyState === 'NotDetected'" class="wallet-status">
                      Not Installed
                    </span>
                    <span v-else-if="wallet.readyState === 'Installed'" class="wallet-status detected">
                      Detected
                    </span>
                  </div>
                </div>

                <svg
                  v-if="wallet.readyState === 'NotDetected'"
                  class="external-link"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>

                <svg
                  v-else
                  class="chevron-right"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div v-if="error" class="error-message">
              <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{{ error }}</span>
            </div>

            <div class="modal-footer">
              <p class="footer-text">
                New to Solana wallets?
                <a
                  href="https://solana.com/ecosystem/explore?categories=wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="learn-link"
                >
                  Learn more
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useWalletStore } from '../../stores/wallet';
import type { WalletAdapter } from '../../stores/wallet';

const walletStore = useWalletStore();
const wallets = inject<WalletAdapter[]>('wallets', []);

const isOpen = computed(() => walletStore.walletModalOpen);
const connecting = computed(() => walletStore.connecting);

const connectingWallet = ref<string | null>(null);
const error = ref<string | null>(null);

const close = () => {
  if (!connecting.value) {
    walletStore.closeWalletModal();
    error.value = null;
  }
};

const handleConnect = async (wallet: WalletAdapter) => {
  if (wallet.readyState === 'NotDetected') {
    // Open wallet website in new tab
    window.open(wallet.url, '_blank');
    return;
  }

  try {
    error.value = null;
    connectingWallet.value = wallet.name;
    await walletStore.connect(wallet);
  } catch (err) {
    console.error('Failed to connect:', err);
    error.value =
      err instanceof Error ? err.message : 'Failed to connect wallet. Please try again.';
    connectingWallet.value = null;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(90vh - 8rem);
  overflow-y: auto;
}

.connecting-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.connecting-state p {
  margin: 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.hint {
  font-size: 0.875rem !important;
  color: #6b7280 !important;
  font-weight: 400 !important;
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wallet-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.wallet-option:hover {
  border-color: #667eea;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.wallet-option.not-installed {
  opacity: 0.7;
}

.wallet-option.not-installed:hover {
  border-color: #9ca3af;
}

.wallet-info-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.wallet-icon-lg {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
}

.wallet-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wallet-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.wallet-status {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
}

.wallet-status.detected {
  color: #10b981;
}

.external-link,
.chevron-right {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #ef4444;
  flex-shrink: 0;
}

.error-message span {
  font-size: 0.875rem;
  color: #991b1b;
}

.modal-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.footer-text {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

.learn-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.learn-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
