<template>
  <header class="topbar">
    <div class="topbar__left">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <div class="topbar__actions">
      <button class="ghost icon" @click="openHelp" aria-label="Open help">
        <span>?</span>
      </button>
      <slot name="actions" />
      <button class="ghost">Switch Realm</button>
      <button class="cta">Link Wallet</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useHelpStore, type HelpTopic } from '@/stores/help';

const props = defineProps<{
  title: string;
  subtitle: string;
  helpTopic?: HelpTopic;
}>();

const help = useHelpStore();

const openHelp = () => help.toggle(props.helpTopic ?? 'overview');
</script>

<style scoped>
.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.topbar h1 {
  margin: 0;
  font-size: 2rem;
  letter-spacing: 0.02em;
}

.topbar p {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
  max-width: 420px;
  font-size: 0.95rem;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  width: 36px;
  height: 36px;
  padding: 0;
  display: grid;
  place-content: center;
  font-weight: 600;
}

@media (max-width: 768px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar__actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
