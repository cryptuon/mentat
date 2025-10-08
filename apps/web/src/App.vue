<template>
  <div class="app-shell">
    <AppNavigation />
    <main class="content">
      <RouterView />
    </main>
    <AppHelp />
  </div>
</template>

<script setup lang="ts">
import AppNavigation from './components/AppNavigation.vue';
import AppHelp from './components/AppHelp.vue';
</script>

<style scoped>
.content {
  padding: 2.5rem clamp(1.5rem, 3vw, 3rem);
  background: linear-gradient(180deg, rgba(20, 24, 34, 0.85), rgba(6, 8, 15, 0.95));
}

@media (max-width: 960px) {
  .content {
    padding: 1.5rem;
  }
}
</style>
