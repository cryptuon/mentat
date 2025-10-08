<template>
  <transition name="fade">
    <div v-if="help.open" class="overlay" @click.self="close">
      <section class="panel card">
        <header>
          <h2>Need a sietch whisper?</h2>
          <button class="ghost" @click="close">Close</button>
        </header>

        <nav class="tabs">
          <button
            v-for="item in tabs"
            :key="item.id"
            :class="['tab', { active: help.topic === item.id }]"
            @click="() => help.show(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="content">
          <component :is="tabComponent" />
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHelpStore, type HelpTopic } from '@/stores/help';

const help = useHelpStore();

const tabs: Array<{ id: HelpTopic; label: string }> = [
  { id: 'overview', label: 'Sietch primer' },
  { id: 'creator', label: 'Mentat forge' },
  { id: 'curator', label: 'Sardaukar gate' },
  { id: 'trader', label: 'Spice traders' },
  { id: 'proof', label: 'Truth trance' }
] as const;

const tabComponent = computed(() => {
  switch (help.topic) {
    case 'creator':
      return CreatorTips;
    case 'curator':
      return CuratorTips;
    case 'trader':
      return TraderTips;
    case 'proof':
      return ProofTips;
    case 'overview':
    default:
      return OverviewTips;
  }
});

const close = () => help.hide();

const OverviewTips = {
  template: `
    <ul>
      <li>Mentat mode: summon markets with AI, or scout the Arrakeen feed.</li>
      <li>Badges flash when truth-trance proofs land—green means the spice is verified.</li>
      <li>Need lore? Tabs above have you. Still stuck? Ping the sietch.</li>
    </ul>
  `
};

const CreatorTips = {
  template: `
    <ul>
      <li>Prompt like a Bene Gesserit: subject, source, deadline. AI weaves the rest.</li>
      <li>Load a proven template, tweak stake/fees, and check the crysknife-sharp preview.</li>
      <li>When it feels canon, launch—Mentat will lock the spice stake.</li>
    </ul>
  `
};

const CuratorTips = {
  template: `
    <ul>
      <li>Sardaukar queue shows hot intel first. Green = safe, amber = needs your judgement.</li>
      <li>Verify sources/fallback. If it reeks of Harkonnen spin, request changes.</li>
      <li>Approve to deploy on-chain; creator stake stays in escrow as the Water of Trust.</li>
    </ul>
  `
};

const TraderTips = {
  template: `
    <ul>
      <li>Odds tick live. Dive in for depth charts, fee splits, and proof countdown.</li>
      <li>Proof hash drops once the Truthsayer signs off—watch the badges.</li>
      <li>Share markets with your tribe; more volume means richer spice for LPs.</li>
    </ul>
  `
};

const ProofTips = {
  template: `
    <ul>
      <li>Claim runs before the hourglass hits 30 min.</li>
      <li>Post CID + hash, stash the raw transcript for any Reverend Mother disputes.</li>
      <li>Faster proofs = juicier bounties. Keep the Guild honest.</li>
    </ul>
  `
};
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 8, 15, 0.72);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 50;
}

.panel {
  width: min(680px, 100%);
  display: grid;
  gap: 1.25rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tab {
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  cursor: pointer;
  font-size: 0.85rem;
}

.tab.active {
  border-color: rgba(125, 95, 255, 0.6);
  background: rgba(125, 95, 255, 0.18);
}

.content ul {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.65rem;
  color: var(--color-text-secondary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .panel {
    padding: 1.25rem;
  }
}
</style>
