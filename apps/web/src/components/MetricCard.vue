<template>
  <article class="card metric">
    <header>
      <p>{{ title }}</p>
      <StatusBadge :intent="delta >= 0 ? 'success' : 'danger'">
        {{ delta >= 0 ? '▲' : '▼' }} {{ Math.abs(delta) }}%
      </StatusBadge>
    </header>
    <strong>{{ value }}</strong>
    <span>{{ deltaLabel }}</span>
  </article>
</template>

<script setup lang="ts">
import StatusBadge from './StatusBadge.vue';

defineProps<{
  title: string;
  value: string;
  delta: number;
  deltaLabel: string;
}>();
</script>

<style scoped>
.metric {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

strong {
  font-size: 2.2rem;
  letter-spacing: 0.04em;
}

span {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}
</style>
