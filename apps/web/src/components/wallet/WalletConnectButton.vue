<template>
  <div class="wallet-connect-button">
    <button
      v-if="!connected"
      @click="openModal"
      :disabled="connecting"
      class="connect-btn"
    >
      <span v-if="connecting">Connecting...</span>
      <span v-else>
        <svg class="wallet-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 18V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V6M21 6H13C11.8954 6 11 6.89543 11 8V16C11 17.1046 11.8954 18 13 18H21V6ZM17 12C17 12.5523 16.5523 13 16 13C15.4477 13 15 12.5523 15 12C15 11.4477 15.4477 11 16 11C16.5523 11 17 11.4477 17 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Connect Wallet
      </span>
    </button>

    <div v-else class="wallet-info">
      <button @click="toggleDropdown" class="wallet-button">
        <img v-if="walletIcon" :src="walletIcon" :alt="walletName" class="wallet-logo" />
        <span class="wallet-address">{{ shortAddress }}</span>
        <svg class="chevron" :class="{ open: dropdownOpen }" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <div v-if="dropdownOpen" class="wallet-dropdown">
        <div class="dropdown-item address-item">
          <span class="label">Address:</span>
          <span class="value">{{ shortAddress }}</span>
          <button @click="copyAddress" class="copy-btn" title="Copy address">
            <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>

        <div class="dropdown-item">
          <span class="label">Wallet:</span>
          <span class="value">{{ walletName }}</span>
        </div>

        <div class="dropdown-divider"></div>

        <button @click="handleDisconnect" :disabled="disconnecting" class="disconnect-btn">
          <span v-if="disconnecting">Disconnecting...</span>
          <span v-else>Disconnect</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWalletStore } from '../../stores/wallet';

const walletStore = useWalletStore();
const dropdownOpen = ref(false);
const copied = ref(false);

const connected = computed(() => walletStore.connected);
const connecting = computed(() => walletStore.connecting);
const disconnecting = computed(() => walletStore.disconnecting);
const walletName = computed(() => walletStore.walletName);
const walletIcon = computed(() => walletStore.walletIcon);
const shortAddress = computed(() => walletStore.shortAddress);
const publicKeyBase58 = computed(() => walletStore.publicKeyBase58);

const openModal = () => {
  walletStore.openWalletModal();
};

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const copyAddress = async () => {
  if (!publicKeyBase58.value) return;

  try {
    await navigator.clipboard.writeText(publicKeyBase58.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy address:', error);
  }
};

const handleDisconnect = async () => {
  dropdownOpen.value = false;
  await walletStore.disconnect();
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.wallet-info')) {
    dropdownOpen.value = false;
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClickOutside);
}
</script>

<style scoped>
.wallet-connect-button {
  position: relative;
}

.connect-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.wallet-info {
  position: relative;
}

.wallet-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.wallet-button:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.wallet-logo {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.wallet-address {
  font-weight: 600;
  color: #374151;
}

.chevron {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.wallet-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 16rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.address-item {
  gap: 0.5rem;
}

.dropdown-item .label {
  color: #6b7280;
  font-weight: 500;
}

.dropdown-item .value {
  color: #111827;
  font-weight: 600;
}

.copy-btn {
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: #667eea;
  cursor: pointer;
  transition: color 0.2s;
}

.copy-btn:hover {
  color: #764ba2;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.disconnect-btn {
  width: 100%;
  padding: 0.5rem;
  background: #fee;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.disconnect-btn:hover:not(:disabled) {
  background: #fecaca;
}

.disconnect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
