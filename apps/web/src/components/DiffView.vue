<template>
  <div class="diff-view">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading comparison...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="diffData" class="diff-container">
      <!-- Header -->
      <div class="diff-header">
        <div class="version-info">
          <div>
            <span class="label">Previous Version</span>
            <strong>v{{ diffData.previous_version }}</strong>
          </div>
          <div class="arrow">→</div>
          <div>
            <span class="label">Current Version</span>
            <strong>v{{ diffData.current_version }}</strong>
          </div>
        </div>
        <div class="changes-summary">
          <span v-if="diffData.changes.length === 0" class="pill success">No changes</span>
          <span v-else class="pill warning">{{ diffData.changes.length }} changes</span>
        </div>
      </div>

      <!-- Changes List -->
      <div v-if="diffData.changes.length > 0" class="changes-list">
        <h3>Changes Summary</h3>
        <ul>
          <li
            v-for="(change, index) in diffData.changes"
            :key="index"
            :class="`change-item ${change.change_type}`"
          >
            <div class="change-header">
              <span class="change-type-badge">{{ formatChangeType(change.change_type) }}</span>
              <code class="field-name">{{ change.field }}</code>
            </div>
            <div class="change-details">
              <div v-if="change.change_type !== 'added'" class="old-value">
                <span class="value-label">Old:</span>
                <pre>{{ formatValue(change.old_value) }}</pre>
              </div>
              <div v-if="change.change_type !== 'removed'" class="new-value">
                <span class="value-label">New:</span>
                <pre>{{ formatValue(change.new_value) }}</pre>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Side-by-Side Comparison -->
      <div class="side-by-side">
        <div class="side previous">
          <h3>Previous Draft</h3>
          <div class="draft-content">
            <DraftPreview :draft="diffData.previous" :highlightChanges="changedFields" />
          </div>
        </div>
        <div class="side current">
          <h3>Current Draft</h3>
          <div class="draft-content">
            <DraftPreview :draft="diffData.current" :highlightChanges="changedFields" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="placeholder">
      <p>No comparison data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DraftPreview from './DraftPreview.vue';

interface DraftChange {
  field: string;
  old_value: any;
  new_value: any;
  change_type: 'added' | 'modified' | 'removed';
}

interface DiffData {
  current_draft_id: string;
  previous_draft_id: string;
  current_version: number;
  previous_version: number;
  current: any;
  previous: any;
  changes: DraftChange[];
}

interface Props {
  draftId: string;
  compareToId?: string;
}

const props = defineProps<Props>();

const loading = ref(false);
const error = ref<string | null>(null);
const diffData = ref<DiffData | null>(null);

const changedFields = computed(() => {
  if (!diffData.value) return new Set<string>();
  return new Set(diffData.value.changes.map(c => c.field));
});

watch(
  () => [props.draftId, props.compareToId],
  async () => {
    await loadDiff();
  },
  { immediate: true }
);

async function loadDiff() {
  loading.value = true;
  error.value = null;

  try {
    // Fetch diff using native fetch (apiClient doesn't handle diff format well)
    const params = new URLSearchParams();
    if (props.compareToId) {
      params.append('compare_to', props.compareToId);
    }

    const response = await fetch(`/api/v1/curator/${props.draftId}/diff?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load diff');
    }

    diffData.value = await response.json();
  } catch (e: any) {
    error.value = e.message || 'Failed to load comparison';
    console.error('Diff load error:', e);
  } finally {
    loading.value = false;
  }
}

function formatChangeType(type: string): string {
  switch (type) {
    case 'added':
      return '+ Added';
    case 'modified':
      return '~ Modified';
    case 'removed':
      return '- Removed';
    default:
      return type;
  }
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '(none)';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}
</script>

<style scoped>
.diff-view {
  display: grid;
  gap: 1.5rem;
}

.loading,
.error,
.placeholder {
  display: grid;
  place-items: center;
  padding: 3rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.6);
}

.loading {
  gap: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  color: var(--color-error, #dc2626);
  background: rgba(239, 68, 68, 0.05);
}

.diff-container {
  display: grid;
  gap: 1.5rem;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.version-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.version-info .label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.version-info strong {
  font-size: 1.1rem;
  color: var(--color-text);
}

.arrow {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
}

.changes-summary .pill {
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
}

.changes-summary .pill.success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.changes-summary .pill.warning {
  background: rgba(251, 146, 60, 0.1);
  color: #ea580c;
}

.changes-list {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.changes-list h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.changes-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.change-item {
  padding: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.change-item.added {
  background: rgba(34, 197, 94, 0.03);
  border-left: 3px solid #22c55e;
}

.change-item.modified {
  background: rgba(251, 146, 60, 0.03);
  border-left: 3px solid #fb923c;
}

.change-item.removed {
  background: rgba(239, 68, 68, 0.03);
  border-left: 3px solid #ef4444;
}

.change-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.change-type-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.change-item.added .change-type-badge {
  background: #22c55e;
  color: white;
}

.change-item.modified .change-type-badge {
  background: #fb923c;
  color: white;
}

.change-item.removed .change-type-badge {
  background: #ef4444;
  color: white;
}

.field-name {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  padding: 0.2rem 0.4rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
}

.change-details {
  display: grid;
  gap: 0.75rem;
}

.old-value,
.new-value {
  display: grid;
  gap: 0.3rem;
}

.value-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.change-details pre {
  margin: 0;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.side {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.side h3 {
  margin: 0;
  padding: 1rem 1.25rem;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--color-border);
  font-size: 1rem;
}

.draft-content {
  padding: 1.25rem;
  max-height: 600px;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .side-by-side {
    grid-template-columns: 1fr;
  }
}
</style>
