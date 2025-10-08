<template>
  <span class="status" :class="`status--${intent}`">
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  intent?: 'default' | 'success' | 'warning' | 'danger';
}>();

const intent = props.intent ?? 'default';
</script>

<style scoped>
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text-secondary);
}

.status--success {
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.35);
  background: rgba(46, 204, 113, 0.12);
}

.status--warning {
  color: #f5a623;
  border-color: rgba(245, 166, 35, 0.3);
  background: rgba(245, 166, 35, 0.12);
}

.status--danger {
  color: #ff7675;
  border-color: rgba(255, 118, 117, 0.3);
  background: rgba(255, 118, 117, 0.12);
}
</style>
