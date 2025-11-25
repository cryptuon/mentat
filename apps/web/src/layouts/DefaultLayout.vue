<template>
  <div class="app-shell">
    <TestnetBanner />
    <AppHeader />
    <main class="page-container">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import TestnetBanner from '@/components/TestnetBanner.vue';
import AppHeader from '@/components/AppHeader.vue';
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-container {
  flex: 1;
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 1.5rem clamp(1.5rem, 5vw, 2.5rem);
}

@media (max-width: 768px) {
  .page-container {
    padding: 1.25rem;
  }
}
</style>
