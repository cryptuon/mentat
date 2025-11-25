<template>
  <div v-if="network.isTestnet" class="network-indicator" :style="{ '--network-color': network.color }">
    <span class="network-indicator__icon">⚠️</span>
    <span class="network-indicator__text">{{ network.displayName }}</span>
  </div>
</template>

<script setup lang="ts">
import { CURRENT_NETWORK } from '@/config/network';

const network = CURRENT_NETWORK;
</script>

<style scoped>
.network-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: var(--network-color);
  background: linear-gradient(135deg, var(--network-color) 0%, color-mix(in srgb, var(--network-color) 80%, black) 100%);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.network-indicator__icon {
  font-size: 0.9rem;
  line-height: 1;
}

.network-indicator__text {
  line-height: 1;
}

/* Pulse animation for attention */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.network-indicator {
  animation: pulse 2s ease-in-out infinite;
}

/* Responsive */
@media (max-width: 480px) {
  .network-indicator {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }

  .network-indicator__icon {
    font-size: 0.8rem;
  }
}
</style>
