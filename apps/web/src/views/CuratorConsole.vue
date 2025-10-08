<template>
  <div class="view-content">
    <PageHeader
      title="Curate markets"
      subtitle="Review AI drafts, check resolution criteria, and approve for launch."
    >
      <template #actions>
        <button class="ghost">Download checklist</button>
      </template>
    </PageHeader>

    <section class="workspace card">
      <aside class="queue">
        <div class="card__title">
          <h2>Review queue</h2>
          <span class="pill">AI priority</span>
        </div>
        <ul>
          <li
            v-for="draft in drafts"
            :key="draft.id"
            :class="{ active: draft.id === selectedId }"
            @click="() => (selectedId = draft.id)"
          >
            <div class="queue__title">
              <strong>{{ draft.topic }}</strong>
              <StatusBadge
                :intent="draft.status === 'approved' ? 'success' : draft.status === 'changes_requested' ? 'warning' : 'default'"
              >
                {{ formatStatus(draft.status) }}
              </StatusBadge>
            </div>
            <p>{{ draft.question?.slice(0, 70) ?? '—' }}…</p>
            <span class="queue__confidence">Confidence · {{ Math.round(draft.confidence * 100) }}%</span>
          </li>
        </ul>
      </aside>

      <article v-if="selectedDraft" class="detail">
        <header class="detail__header">
          <div>
            <h2>{{ selectedDraft.question }}</h2>
            <p>{{ selectedDraft.aiNotes }}</p>
          </div>
          <div class="detail__actions">
            <button class="ghost">Request changes</button>
            <button class="cta">Approve & launch</button>
          </div>
        </header>

        <div class="tag-row">
          <span class="pill" v-for="tag in selectedDraft.tags" :key="tag">{{ tag }}</span>
        </div>

        <div class="detail__grid">
          <section>
            <h3>Resolution checks</h3>
            <ul>
              <li v-for="finding in selectedDraft.validationFindings" :key="finding">{{ finding }}</li>
            </ul>
            <p class="note">{{ selectedDraft.resolutionSuggestion }}</p>
          </section>

          <section>
            <h3>Economics</h3>
            <div class="economics">
              <div>
                <span>Trading fee</span>
                <strong>{{ selectedDraft.economics.tradingFee }}%</strong>
              </div>
              <div>
                <span>Creator stake</span>
                <strong>{{ selectedDraft.economics.creatorStake }} USDC</strong>
              </div>
              <div>
                <span>Proof bounty</span>
                <strong>{{ selectedDraft.economics.proofBounty }} USDC</strong>
              </div>
            </div>
          </section>
        </div>

        <section class="timeline">
          <h3>Timeline</h3>
          <div class="timeline__grid">
            <div>
              <span>Opens</span>
              <strong>{{ formatDate(selectedDraft.timeline.proposedOpen) }}</strong>
            </div>
            <div>
              <span>Resolution deadline</span>
              <strong>{{ formatDate(selectedDraft.timeline.resolutionDeadline) }}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{{ Math.round(selectedDraft.confidence * 100) }}%</strong>
            </div>
            <div>
              <span>Last updated</span>
              <strong>{{ formatRelative(selectedDraft.lastUpdated) }}</strong>
            </div>
          </div>
        </section>
      </article>

      <div v-else class="placeholder">
        <p>Select a draft from the queue to review details.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { computed, ref, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import PageHeader from '@/components/PageHeader.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { fetchDraftQueue, fetchDraftDetail } from '@/services/mockApi';
import type { DraftSummary } from '@/types';

dayjs.extend(relativeTime);

const { data: draftQueue } = useQuery({
  queryKey: ['draft-queue'],
  queryFn: fetchDraftQueue
});

const selectedId = ref<string | null>(null);

watch(
  () => draftQueue.value,
  (queue) => {
    if (queue && queue.length && !selectedId.value) {
      selectedId.value = queue[0].id;
    }
  },
  { immediate: true }
);

const { data: draftDetail } = useQuery({
  queryKey: ['draft-detail', selectedId],
  queryFn: ({ queryKey }) => {
    const [, id] = queryKey as [string, string | null];
    return id ? fetchDraftDetail(id) : Promise.resolve(undefined);
  },
  enabled: computed(() => Boolean(selectedId.value))
});

const drafts = computed(() =>
  (draftQueue.value ?? []).map((draft: DraftSummary & { question?: string }) => {
    const detail = draftDetail.value;
    return draft.id === detail?.id ? { ...draft, question: detail.question } : draft;
  })
);

const selectedDraft = computed(() => draftDetail.value);

function formatStatus(status: DraftSummary['status']) {
  switch (status) {
    case 'needs_review':
      return 'Needs review';
    case 'changes_requested':
      return 'Changes requested';
    case 'approved':
      return 'Approved';
    default:
      return status;
  }
}

const formatDate = (iso: string) => dayjs(iso).format('MMM D, YYYY HH:mm');
const formatRelative = (iso: string) => dayjs(iso).fromNow();
</script>

<style scoped>
.workspace {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
}

.queue {
  display: grid;
  gap: 1rem;
}

.queue ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.queue li {
  display: grid;
  gap: 0.6rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: #fff;
  cursor: pointer;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.queue li.active {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-soft);
}

.queue__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.queue p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.queue__confidence {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.detail {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.8rem;
  display: grid;
  gap: 1.5rem;
}

.detail__header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.detail__header h2 {
  margin: 0;
  font-size: 1.4rem;
}

.detail__header p {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
  max-width: 580px;
}

.detail__actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.detail__grid section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  background: #fff;
  display: grid;
  gap: 0.75rem;
}

.detail__grid ul {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.4rem;
  color: var(--color-text-secondary);
}

.economics {
  display: grid;
  gap: 0.75rem;
}

.economics span {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

.note {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.timeline {
  display: grid;
  gap: 0.9rem;
}

.timeline__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.timeline__grid span {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timeline__grid strong {
  font-size: 1.05rem;
}

.placeholder {
  display: grid;
  place-items: center;
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.6);
}

@media (max-width: 1024px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .queue {
    grid-template-columns: 1fr;
    overflow-x: unset;
  }
}
</style>
