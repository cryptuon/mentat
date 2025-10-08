<template>
  <header class="page-header">
    <div class="page-header__content">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.page-header__content h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: 0.01em;
  font-weight: 700;
}

.page-header__content p {
  margin: 0.2rem 0 0;
  color: var(--color-text-secondary);
  max-width: 540px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .page-header__actions {
    order: 3;
    flex-wrap: wrap;
  }
}
</style>
