<template>
  <div v-if="network.isTestnet" class="testnet-banner" :style="{ '--network-color': network.color }">
    <div class="testnet-banner__content">
      <span class="testnet-banner__icon">🧪</span>
      <p class="testnet-banner__text">
        <strong>{{ network.displayName }} Environment:</strong>
        This is a test network. No real funds are used.
        <span v-if="network.type === 'devnet'">
          You can get free test SOL from a faucet.
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CURRENT_NETWORK } from '@/config/network';

const network = CURRENT_NETWORK;
</script>

<style scoped>
.testnet-banner {
  background: linear-gradient(135deg, var(--network-color) 0%, color-mix(in srgb, var(--network-color) 85%, black) 100%);
  border-bottom: 2px solid color-mix(in srgb, var(--network-color) 70%, black);
  color: white;
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 25;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.testnet-banner__content {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.testnet-banner__icon {
  font-size: 1.5rem;
  line-height: 1;
  flex-shrink: 0;
}

.testnet-banner__text {
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  font-weight: 500;
}

.testnet-banner__text strong {
  font-weight: 700;
  margin-right: 0.3rem;
}

/* Responsive */
@media (max-width: 768px) {
  .testnet-banner {
    padding: 0.6rem 1rem;
  }

  .testnet-banner__icon {
    font-size: 1.25rem;
  }

  .testnet-banner__text {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .testnet-banner__content {
    gap: 0.5rem;
  }

  .testnet-banner__icon {
    font-size: 1.1rem;
  }

  .testnet-banner__text {
    font-size: 0.8rem;
  }
}
</style>
