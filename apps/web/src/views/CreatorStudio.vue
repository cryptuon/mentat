<template>
  <div class="view-content">
    <PageHeader
      title="Create market"
      subtitle="Work with the assistant to draft clear questions and launch in minutes."
    >
      <template #actions>
        <button class="ghost">Load template</button>
        <button class="cta">Start draft</button>
      </template>
    </PageHeader>

    <section class="studio card">
      <div class="studio__chat">
        <div class="card__title">
          <h2>Assistant conversation</h2>
          <span class="pill">Template v1.3</span>
        </div>

        <div class="chat">
          <article v-for="message in conversation" :key="message.id" :class="['bubble', message.role]">
            <span>{{ message.author }}</span>
            <p>{{ message.text }}</p>
            <time>{{ message.time }}</time>
          </article>
        </div>

        <form class="composer">
          <textarea placeholder="Ask the assistant to tighten resolution wording or adjust economics…" />
          <div class="composer__actions">
            <button type="button" class="ghost">Insert data source</button>
            <button type="submit" class="cta">Send</button>
          </div>
        </form>
      </div>

      <aside class="studio__preview">
        <div class="card__title">
          <h2>Preview</h2>
          <div class="preview-actions">
            <button class="ghost">Copy JSON</button>
            <button class="ghost">Download</button>
          </div>
        </div>

        <section class="preview-card">
          <h3>Question</h3>
          <p>Will the Federal Reserve cut rates by 25 bps before Jul 31, 23:59 UTC?</p>
        </section>

        <section class="preview-card">
          <h3>Resolution criteria</h3>
          <ul>
            <li>Primary: api.reuters.com/v2/articles (exact phrase “rate cut”)</li>
            <li>Fallback: api.bloomberg.com/news/central-bank-statements</li>
            <li>Invalid if the Fed retracts within 24h</li>
          </ul>
        </section>

        <section class="preview-grid">
          <div>
            <h4>Economics</h4>
            <p>Trading fee: 2% (LP 1%, Protocol 0.75%, Creator 0.25%)</p>
            <p>Creator stake: 50 USDC</p>
            <p>Proof bounty: 175 USDC</p>
          </div>
          <div>
            <h4>Timeline</h4>
            <p>Opens: Jun 12 · Locks: Jul 28</p>
            <p>Resolution deadline: Jul 31, 23:59 UTC</p>
          </div>
        </section>

        <section class="preview-card">
          <h3>Market summary</h3>
          <p>Assistant estimates 62% YES. Reuters coverage provides primary proof with Bloomberg backup.</p>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';

const conversation = [
  {
    id: 1,
    role: 'ai',
    author: 'Assistant',
    text: 'FOMC update detected. Want to launch a July rate-cut market?',
    time: '2m ago'
  },
  {
    id: 2,
    role: 'human',
    author: 'You',
    text: 'Yes, use Reuters as the primary proof and include the official site as fallback.',
    time: '1m ago'
  },
  {
    id: 3,
    role: 'ai',
    author: 'Assistant',
    text: 'Draft ready: Reuters primary, Bloomberg fallback, invalidation if the statement is retracted. Adjust fees or stake?',
    time: 'Just now'
  }
];
</script>

<style scoped>
.studio {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 2rem;
}

.studio__chat {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.chat {
  display: grid;
  gap: 1rem;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.bubble {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: #fff;
}

.bubble.ai {
  border-color: rgba(58, 102, 245, 0.35);
  background: rgba(58, 102, 245, 0.06);
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
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 1rem;
  min-height: 120px;
  resize: vertical;
  font-size: 0.95rem;
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

.preview-actions {
  display: flex;
  gap: 0.6rem;
}

.preview-card {
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
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
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 1.25rem;
}

.preview-grid p {
  margin: 0.25rem 0;
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .studio {
    grid-template-columns: 1fr;
  }
}
</style>
