<template>
  <div class="page">
    <TopBar
      title="Mentat Forge"
      subtitle="Shape the prophecy. Launch markets before the Imperium blinks."
      :help-topic="'creator'"
    >
      <template #actions>
        <button class="ghost">Load sietch template</button>
        <button class="cta">New prophecy</button>
      </template>
    </TopBar>

    <section class="studio card">
      <div class="studio__chat">
        <header>
          <h2>Mentat feed</h2>
          <span class="pill">Template v1.3</span>
        </header>

        <div class="chat">
          <article v-for="message in conversation" :key="message.id" :class="['bubble', message.role]">
            <span>{{ message.author }}</span>
            <p>{{ message.text }}</p>
            <time>{{ message.time }}</time>
          </article>
        </div>

        <form class="composer">
          <textarea placeholder="Ask the AI to refine resolution phrasing or adjust fees…" />
          <div class="composer__actions">
            <button type="button" class="ghost">Insert data source</button>
            <button type="submit" class="cta">Send to AI</button>
          </div>
        </form>
      </div>

      <aside class="studio__preview">
        <header>
          <h2>Structured preview</h2>
          <div class="preview-actions">
            <button class="ghost" @click="openHelp">Cheat sheet</button>
            <button class="ghost">Export JSON</button>
          </div>
        </header>

        <section class="preview-card">
          <h3>Question</h3>
          <p>Will the Fed cut rates 25 bps before Jul 31, 23:59 UTC?</p>
        </section>

        <section class="preview-card">
          <h3>Resolution hits</h3>
          <ul>
            <li>Primary: api.reuters.com/v2/articles (phrase “rate cut”)</li>
            <li>Fallback: api.bloomberg.com/news/central-bank</li>
            <li>Invalid if Fed retracts within 24h</li>
          </ul>
        </section>

        <section class="preview-grid">
          <div>
            <h4>Economics</h4>
            <p>Trading fee 2%</p>
            <p>Stake 50 USDC</p>
            <p>Proof bounty 175 USDC</p>
          </div>
          <div>
            <h4>Timeline</h4>
            <p>Open Jun 12 · Lock Jul 28</p>
            <p>Deadline Jul 31 23:59</p>
          </div>
        </section>

        <section class="preview-card">
          <h3>Discovery blurb</h3>
          <p>AI leans 62% YES. Proof links straight to Reuters with fallback.</p>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import TopBar from '@/components/TopBar.vue';

import { useHelpStore } from '@/stores/help';

const help = useHelpStore();
const openHelp = () => help.show('creator');

const conversation = [
  {
    id: 1,
    role: 'ai',
    author: 'Mentat Draft Agent',
    text: 'FOMC news is spicy. Want a July rate-cut market?',
    time: '2m ago'
  },
  {
    id: 2,
    role: 'human',
    author: 'You',
    text: 'Yep. Use Reuters + official site. Add invalid if they retract.',
    time: '1m ago'
  },
  {
    id: 3,
    role: 'ai',
    author: 'Mentat Draft Agent',
    text: 'Done. Reuters primary, Bloomberg backup, 24h invalid check. Need fee or stake tweaks?',
    time: 'Just now'
  }
];
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.studio {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2rem;
  background: var(--color-bg-card);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.studio__chat {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.studio__chat header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat {
  display: grid;
  gap: 1rem;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 0.75rem;
}

.bubble {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
}

.bubble.ai {
  border-color: rgba(125, 95, 255, 0.35);
}

.bubble span {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.bubble p {
  margin: 0;
}

.bubble time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.composer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.composer textarea {
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem;
  min-height: 120px;
  color: inherit;
  resize: vertical;
}

.composer__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.studio__preview {
  display: grid;
  gap: 1.25rem;
}

.studio__preview header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-actions {
  display: flex;
  gap: 0.6rem;
}

.preview-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: grid;
  gap: 0.75rem;
}

.preview-card ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--color-text-secondary);
  display: grid;
  gap: 0.5rem;
}

.preview-grid {
  display: grid;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.preview-grid p {
  margin: 0.25rem 0;
  color: var(--color-text-secondary);
}

@media (max-width: 1200px) {
  .studio {
    grid-template-columns: 1fr;
  }
}
</style>
