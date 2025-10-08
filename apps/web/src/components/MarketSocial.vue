<template>
  <section class="card social">
    <header>
      <h2>Spice signals</h2>
      <div class="actions">
        <button class="ghost" @click="$emit('onBoost')">Boost market</button>
        <button class="ghost" @click="$emit('onShare')">Share</button>
      </div>
    </header>

    <div class="stats">
      <div>
        <label>Watchers</label>
        <strong>{{ social.watchers }}</strong>
      </div>
      <div>
        <label>Boosts</label>
        <strong>{{ social.boosts }}</strong>
      </div>
      <div>
        <label>Shares</label>
        <strong>{{ social.shares }}</strong>
      </div>
      <div>
        <label>Comments</label>
        <strong>{{ social.comments }}</strong>
      </div>
    </div>

    <div class="backers" v-if="social.topBackers.length">
      <span>Top backers:</span>
      <div class="chips">
        <span class="pill" v-for="alias in social.topBackers" :key="alias">{{ alias }}</span>
      </div>
    </div>

    <div class="threads" v-if="social.threads.length">
      <article v-for="thread in social.threads" :key="thread.id" class="thread">
        <header>
          <strong>{{ thread.author }}</strong>
          <span>{{ formatRelative(thread.postedAt) }}</span>
        </header>
        <p>{{ thread.body }}</p>
        <footer>
          <button class="ghost" @click="$emit('onReact', thread.id)">▲ {{ thread.reactions }}</button>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

defineProps<{
  social: {
    watchers: number;
    boosts: number;
    shares: number;
    comments: number;
    topBackers: string[];
    threads: Array<{
      id: string;
      author: string;
      avatar?: string;
      body: string;
      postedAt: string;
      reactions: number;
    }>;
  };
}>();

const emit = defineEmits<{ (e: 'onBoost'): void; (e: 'onShare'): void; (e: 'onReact', id: string): void }>();

const formatRelative = (iso: string) => dayjs(iso).fromNow();
</script>

<style scoped>
.social {
  display: grid;
  gap: 1.5rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 0.6rem;
}

.actions .ghost {
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stats label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.stats strong {
  font-size: 1.4rem;
}

.backers {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.threads {
  display: grid;
  gap: 1rem;
}

.thread {
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: grid;
  gap: 0.6rem;
}

.thread header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.thread p {
  margin: 0;
}

.thread footer {
  display: flex;
  justify-content: flex-end;
}

.thread footer .ghost {
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
