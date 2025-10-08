<template>
  <div class="page">
    <TopBar
      title="Sardaukar Gate"
      subtitle="Guard the canon. Only worthy markets enter the Imperium."
      :help-topic="'curator'"
    >
      <template #actions>
        <button class="ghost">Download rubric</button>
      </template>
    </TopBar>

    <section class="section card">
      <div class=" console">
        <aside class="queue">
          <header>
            <h2>Review queue</h2>
            <div class="queue__meta">
              <span class="pill">AI priority</span>
              <button class="ghost" @click="openHelp">Tips</button>
            </div>
          </header>
          <ul>
            <li
              v-for="draft in drafts"
              :key="draft.id"
              :class="{ active: draft.id === selectedId }"
              @click="() => (selectedId = draft.id)"
            >
              <div>
                <strong>{{ draft.topic }}</strong>
                <p>{{ draft.question?.slice(0, 56) ?? '—' }}...</p>
              </div>
              <span class="confidence">{{ Math.round(draft.confidence * 100) }}% Mentat match</span>
              <StatusBadge
                :intent="
                  draft.status === 'approved'
                    ? 'success'
                    : draft.status === 'changes_requested'
                      ? 'warning'
                      : 'default'
                "
              >
                {{ formatStatus(draft.status) }}
              </StatusBadge>
            </li>
          </ul>
        </aside>

        <article class="detail" v-if="selectedDraft">
          <header class="detail__header">
            <div>
              <h2>{{ selectedDraft.question }}</h2>
              <p>{{ selectedDraft.aiNotes }}</p>
              <div class="tag-row">
                <span v-for="tag in selectedDraft.tags" :key="tag" class="pill">{{ tag }}</span>
              </div>
            </div>
            <div class="detail__actions">
              <button class="ghost">Request reweave</button>
              <button class="cta">Seal on-chain</button>
            </div>
          </header>

          <div class="grid two">
            <section class="subcard">
              <h3>Resolution</h3>
              <ul>
                <li v-for="finding in selectedDraft.validationFindings" :key="finding">
                  {{ finding }}
                </li>
              </ul>
              <p class="hint">{{ selectedDraft.resolutionSuggestion }}</p>
            </section>

            <section class="subcard">
              <h3>Economics</h3>
              <div class=" economics">
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

          <section class="timeline card">
            <h3>Timeline</h3>
            <div class="timeline__grid">
              <div>
                <span>Proposed open</span>
                <strong>{{ formatDate(selectedDraft.timeline.proposedOpen) }}</strong>
              </div>
              <div>
                <span>Resolution deadline</span>
                <strong>{{ formatDate(selectedDraft.timeline.resolutionDeadline) }}</strong>
              </div>
              <div>
                <span>Mentat confidence</span>
                <strong>{{ Math.round(selectedDraft.confidence * 100) }}%</strong>
              </div>
              <div>
                <span>Last updated</span>
                <strong>{{ formatRelative(selectedDraft.lastUpdated) }}</strong>
              </div>
            </div>
          </section>
        </article>

        <div v-else class="empty">
          <p>Select a draft to review its AI proposal.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { computed, ref, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import TopBar from '@/components/TopBar.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { useHelpStore } from '@/stores/help';
import { fetchDraftQueue, fetchDraftDetail } from '@/services/mockApi';
import type { DraftSummary } from '@/types';

dayjs.extend(relativeTime);

const help = useHelpStore();
const openHelp = () => help.show('curator');

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
  queryKey: computed(() => ['draft-detail', selectedId.value]),
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
.page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section {
  padding: 0;
  background: transparent;
}

.console {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
}

.queue {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.queue header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.queue__meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.queue__meta .ghost {
  padding: 0.35rem 0.8rem;
  font-size: 0.75rem;
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
  gap: 0.5rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  cursor: pointer;
}

.queue li.active {
  border-color: rgba(125, 95, 255, 0.4);
  background: rgba(125, 95, 255, 0.12);
}

.queue strong {
  font-size: 1rem;
}

.queue p {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.confidence {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.detail {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.detail__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail__header h2 {
  margin: 0;
  font-size: 1.6rem;
}

.detail__header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.detail__actions {
  display: flex;
  gap: 0.75rem;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.subcard {
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  display: grid;
  gap: 0.75rem;
}

.subcard h3 {
  margin: 0;
}

.subcard ul {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.5rem;
  color: var(--color-text-secondary);
}

.hint {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.economics {
  display: grid;
  gap: 0.7rem;
}

.economics span {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.timeline {
  background: rgba(255, 255, 255, 0.02);
}

.timeline__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.timeline__grid span {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.empty {
  display: grid;
  place-items: center;
  color: var(--color-text-secondary);
}

@media (max-width: 1100px) {
  .console {
    grid-template-columns: 1fr;
  }

  .queue {
    flex-direction: row;
    overflow-x: auto;
  }

  .queue ul {
    grid-template-columns: repeat(4, minmax(240px, 1fr));
    min-width: 100%;
  }
}
</style>
