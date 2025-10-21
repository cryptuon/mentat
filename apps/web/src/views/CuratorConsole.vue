<template>
  <div class="view-content">
    <PageHeader
      title="Curate markets"
      subtitle="Review AI drafts, check resolution criteria, and approve for launch."
    >
      <template #actions>
        <div class="header-actions">
          <select v-model="statusFilter" class="filter-select">
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
          <label class="checkbox-label">
            <input v-model="showAssignedToMe" type="checkbox" />
            <span>My drafts only</span>
          </label>
        </div>
      </template>
    </PageHeader>

    <section class="workspace card">
      <aside class="queue">
        <div class="card__title">
          <h2>Review queue</h2>
          <span class="pill">{{ totalDrafts }} drafts</span>
        </div>

        <!-- Bulk Actions Bar -->
        <div v-if="selectedDraftIds.size > 0" class="bulk-actions">
          <div class="bulk-selected">
            <span>{{ selectedDraftIds.size }} selected</span>
            <button @click="clearSelection" class="ghost small">Clear</button>
          </div>
          <div class="bulk-buttons">
            <button @click="bulkClaim" class="ghost small" :disabled="bulkActionLoading">Claim</button>
            <button @click="bulkApprove" class="cta small" :disabled="bulkActionLoading">Approve</button>
            <button @click="bulkReject" class="danger small" :disabled="bulkActionLoading">Reject</button>
          </div>
        </div>

        <!-- Draft Queue List -->
        <div v-if="isLoadingQueue" class="loading-state">
          <div class="spinner"></div>
          <p>Loading queue...</p>
        </div>

        <ul v-else-if="drafts.length > 0">
          <li
            v-for="draft in drafts"
            :key="draft.id"
            :class="{ active: draft.id === selectedDraftId }"
          >
            <div class="queue-item-content" @click="selectDraft(draft.id)">
              <div class="queue__title">
                <label class="checkbox-container" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedDraftIds.has(draft.id)"
                    @change="toggleSelection(draft.id)"
                  />
                </label>
                <strong>{{ truncate(draft.question_text, 50) }}</strong>
                <StatusBadge :intent="getStatusIntent(draft.status)">
                  {{ formatStatus(draft.status) }}
                </StatusBadge>
              </div>
              <p class="queue__meta">
                Creator: {{ draft.creator_wallet?.slice(0, 8) }}...
                <span v-if="draft.assigned_curator_name"> · Assigned to: {{ draft.assigned_curator_name }}</span>
              </p>
              <div class="queue__scores">
                <span v-if="draft.quality_score" class="score">
                  Quality: {{ Math.round(draft.quality_score * 100) }}%
                </span>
              </div>
            </div>
          </li>
        </ul>

        <div v-else class="empty-state">
          <p>No drafts in queue</p>
        </div>
      </aside>

      <!-- Draft Detail Panel -->
      <article v-if="selectedDraft && !isLoadingDetail" class="detail">
        <!-- Tabs -->
        <div class="tabs">
          <button
            :class="{ active: activeTab === 'review' }"
            @click="activeTab = 'review'"
          >
            Review
          </button>
          <button
            v-if="selectedDraft.version > 1"
            :class="{ active: activeTab === 'diff' }"
            @click="activeTab = 'diff'"
          >
            Changes
          </button>
          <button
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            History
          </button>
        </div>

        <!-- Review Tab -->
        <div v-if="activeTab === 'review'" class="tab-content">
          <header class="detail__header">
            <div>
              <h2>{{ selectedDraft.draft_data?.question_text }}</h2>
              <p v-if="selectedDraft.draft_data?.summary">{{ selectedDraft.draft_data.summary }}</p>
            </div>
            <div class="detail__actions">
              <button v-if="selectedDraft.status === 'pending'" @click="claimDraft" class="ghost">
                Claim for review
              </button>
              <button v-if="canRequestChanges" @click="showRequestChangesModal = true" class="ghost">
                Request changes
              </button>
              <button v-if="canReject" @click="showRejectModal = true" class="danger">
                Reject
              </button>
              <button v-if="canApprove" @click="showApproveModal = true" class="cta">
                Approve & launch
              </button>
            </div>
          </header>

          <!-- Validation Scores -->
          <div v-if="hasValidationScores" class="validation-scores">
            <h3>Validation Scores</h3>
            <div class="scores-grid">
              <div class="score-item">
                <span>Quality</span>
                <div class="score-bar">
                  <div
                    class="score-fill"
                    :style="{ width: `${(selectedDraft.quality_score || 0) * 100}%` }"
                  ></div>
                </div>
                <strong>{{ Math.round((selectedDraft.quality_score || 0) * 100) }}%</strong>
              </div>
              <div class="score-item">
                <span>Safety</span>
                <div class="score-bar">
                  <div
                    class="score-fill"
                    :style="{ width: `${(selectedDraft.safety_score || 0) * 100}%` }"
                  ></div>
                </div>
                <strong>{{ Math.round((selectedDraft.safety_score || 0) * 100) }}%</strong>
              </div>
              <div class="score-item">
                <span>Clarity</span>
                <div class="score-bar">
                  <div
                    class="score-fill"
                    :style="{ width: `${(selectedDraft.clarity_score || 0) * 100}%` }"
                  ></div>
                </div>
                <strong>{{ Math.round((selectedDraft.clarity_score || 0) * 100) }}%</strong>
              </div>
            </div>
          </div>

          <!-- Validation Issues -->
          <div v-if="hasValidationIssues" class="validation-issues">
            <div v-if="selectedDraft.validation_errors?.length > 0" class="issue-section errors">
              <h4>❌ Errors ({{ selectedDraft.validation_errors.length }})</h4>
              <ul>
                <li v-for="(error, i) in selectedDraft.validation_errors" :key="i">{{ error }}</li>
              </ul>
            </div>
            <div v-if="selectedDraft.validation_warnings?.length > 0" class="issue-section warnings">
              <h4>⚠️ Warnings ({{ selectedDraft.validation_warnings.length }})</h4>
              <ul>
                <li v-for="(warning, i) in selectedDraft.validation_warnings" :key="i">{{ warning }}</li>
              </ul>
            </div>
          </div>

          <!-- Draft Preview -->
          <div class="draft-preview-section">
            <h3>Draft Specification</h3>
            <DraftPreview v-if="selectedDraft.draft_data" :draft="selectedDraft.draft_data" />
          </div>

          <!-- Curator Notes -->
          <div v-if="selectedDraft.curator_notes" class="curator-notes">
            <h3>Curator Notes</h3>
            <p>{{ selectedDraft.curator_notes }}</p>
          </div>
        </div>

        <!-- Diff Tab -->
        <div v-else-if="activeTab === 'diff'" class="tab-content">
          <DiffView :draftId="selectedDraft.id" />
        </div>

        <!-- History Tab -->
        <div v-else-if="activeTab === 'history'" class="tab-content">
          <div v-if="isLoadingHistory" class="loading-state">
            <div class="spinner"></div>
            <p>Loading history...</p>
          </div>
          <div v-else-if="draftHistory.length > 0" class="history-list">
            <h3>Version History</h3>
            <ul>
              <li v-for="version in draftHistory" :key="version.id">
                <div class="version-header">
                  <strong>Version {{ version.version }}</strong>
                  <StatusBadge :intent="getStatusIntent(version.status)">
                    {{ formatStatus(version.status) }}
                  </StatusBadge>
                </div>
                <div class="version-meta">
                  <span>{{ formatDate(version.created_at) }}</span>
                  <span v-if="version.quality_score">
                    Quality: {{ Math.round(version.quality_score * 100) }}%
                  </span>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="empty-state">
            <p>No version history available</p>
          </div>
        </div>
      </article>

      <div v-else-if="isLoadingDetail" class="detail loading-state">
        <div class="spinner"></div>
        <p>Loading draft...</p>
      </div>

      <div v-else class="placeholder">
        <p>Select a draft from the queue to review details.</p>
      </div>
    </section>

    <!-- Approve Modal -->
    <div v-if="showApproveModal" class="modal-overlay" @click.self="showApproveModal = false">
      <div class="modal">
        <h3>Approve Draft</h3>
        <p>This will approve the draft and create a market ready for launch.</p>
        <label>
          Curator Notes (optional)
          <textarea v-model="approveNotes" rows="3"></textarea>
        </label>
        <label class="checkbox-label">
          <input v-model="deployImmediately" type="checkbox" />
          <span>Deploy to blockchain immediately</span>
        </label>
        <div class="modal-actions">
          <button @click="showApproveModal = false" class="ghost">Cancel</button>
          <button @click="approveDraft" class="cta">Approve</button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal">
        <h3>Reject Draft</h3>
        <p>This will permanently reject the draft.</p>
        <label>
          Reason (required)
          <textarea v-model="rejectReason" rows="3" required></textarea>
        </label>
        <div class="modal-actions">
          <button @click="showRejectModal = false" class="ghost">Cancel</button>
          <button @click="rejectDraft" class="danger" :disabled="!rejectReason">Reject</button>
        </div>
      </div>
    </div>

    <!-- Request Changes Modal -->
    <div v-if="showRequestChangesModal" class="modal-overlay" @click.self="showRequestChangesModal = false">
      <div class="modal">
        <h3>Request Changes</h3>
        <p>The creator will be notified to revise their draft.</p>
        <label>
          Requested Changes (required)
          <textarea v-model="requestedChanges" rows="4" required></textarea>
        </label>
        <label>
          Curator Notes (optional)
          <textarea v-model="changeNotes" rows="2"></textarea>
        </label>
        <div class="modal-actions">
          <button @click="showRequestChangesModal = false" class="ghost">Cancel</button>
          <button @click="requestChanges" class="cta" :disabled="!requestedChanges">Send Request</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, ref, watch } from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import DraftPreview from '@/components/DraftPreview.vue';
import DiffView from '@/components/DiffView.vue';
import apiClient from '@/lib/apiClient';

interface DraftListItem {
  id: string;
  creator_wallet: string;
  question_text: string;
  status: string;
  assigned_curator_name?: string;
  quality_score?: number;
  version: number;
  created_at: string;
  submitted_at?: string;
}

interface DraftDetail {
  id: string;
  creator_id: string;
  creator_wallet: string;
  draft_data: any;
  status: string;
  assigned_curator_id?: string;
  assigned_curator_name?: string;
  quality_score?: number;
  safety_score?: number;
  clarity_score?: number;
  validation_errors?: string[];
  validation_warnings?: string[];
  curator_notes?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

interface VersionHistoryItem {
  id: string;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
  quality_score?: number;
}

// State
const drafts = ref<DraftListItem[]>([]);
const selectedDraftId = ref<string | null>(null);
const selectedDraft = ref<DraftDetail | null>(null);
const draftHistory = ref<VersionHistoryItem[]>([]);
const selectedDraftIds = ref<Set<string>>(new Set());

const statusFilter = ref('pending');
const showAssignedToMe = ref(false);
const activeTab = ref<'review' | 'diff' | 'history'>('review');

const isLoadingQueue = ref(false);
const isLoadingDetail = ref(false);
const isLoadingHistory = ref(false);
const bulkActionLoading = ref(false);

// Modals
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const showRequestChangesModal = ref(false);
const approveNotes = ref('');
const deployImmediately = ref(false);
const rejectReason = ref('');
const requestedChanges = ref('');
const changeNotes = ref('');

// Computed
const totalDrafts = computed(() => drafts.value.length);

const hasValidationScores = computed(() => {
  return selectedDraft.value && (
    selectedDraft.value.quality_score ||
    selectedDraft.value.safety_score ||
    selectedDraft.value.clarity_score
  );
});

const hasValidationIssues = computed(() => {
  return selectedDraft.value && (
    (selectedDraft.value.validation_errors?.length || 0) > 0 ||
    (selectedDraft.value.validation_warnings?.length || 0) > 0
  );
});

const canApprove = computed(() => {
  return selectedDraft.value?.status === 'in_review';
});

const canReject = computed(() => {
  return selectedDraft.value?.status === 'in_review' || selectedDraft.value?.status === 'pending';
});

const canRequestChanges = computed(() => {
  return selectedDraft.value?.status === 'in_review';
});

// Watch filters
watch([statusFilter, showAssignedToMe], () => {
  loadQueue();
});

watch(selectedDraftId, async (newId) => {
  if (newId) {
    await loadDraftDetail(newId);
    if (activeTab.value === 'history') {
      await loadHistory(newId);
    }
  }
});

watch(activeTab, async (newTab) => {
  if (newTab === 'history' && selectedDraftId.value) {
    await loadHistory(selectedDraftId.value);
  }
});

// Methods
async function loadQueue() {
  isLoadingQueue.value = true;
  try {
    const params = new URLSearchParams();
    if (statusFilter.value) {
      params.append('status', statusFilter.value);
    }
    if (showAssignedToMe.value) {
      params.append('assigned_to_me', 'true');
    }

    const response = await apiClient.get<DraftListItem[]>(`/api/v1/curator/queue?${params}`);
    drafts.value = response.data;

    // Auto-select first draft if none selected
    if (drafts.value.length > 0 && !selectedDraftId.value) {
      selectedDraftId.value = drafts.value[0].id;
    }
  } catch (error) {
    console.error('Failed to load queue:', error);
  } finally {
    isLoadingQueue.value = false;
  }
}

async function loadDraftDetail(draftId: string) {
  isLoadingDetail.value = true;
  try {
    // For now, we'll construct the detail from the queue item + fetch full detail
    // In a real app, there would be a GET /curator/{id} endpoint
    const queueItem = drafts.value.find(d => d.id === draftId);
    if (queueItem) {
      // Mock detail for now - in production, fetch from API
      selectedDraft.value = {
        ...queueItem,
        creator_id: 'mock-creator-id',
        draft_data: {
          question_text: queueItem.question_text,
          summary: 'Mock summary - replace with API data',
          outcomes: [],
          resolution_sources: [],
        },
        updated_at: queueItem.created_at,
      } as DraftDetail;
    }
  } catch (error) {
    console.error('Failed to load draft detail:', error);
  } finally {
    isLoadingDetail.value = false;
  }
}

async function loadHistory(draftId: string) {
  isLoadingHistory.value = true;
  try {
    const response = await apiClient.get<VersionHistoryItem[]>(`/api/v1/curator/${draftId}/history`);
    draftHistory.value = response.data;
  } catch (error) {
    console.error('Failed to load history:', error);
    draftHistory.value = [];
  } finally {
    isLoadingHistory.value = false;
  }
}

function selectDraft(draftId: string) {
  selectedDraftId.value = draftId;
  activeTab.value = 'review';
}

function toggleSelection(draftId: string) {
  if (selectedDraftIds.value.has(draftId)) {
    selectedDraftIds.value.delete(draftId);
  } else {
    selectedDraftIds.value.add(draftId);
  }
  selectedDraftIds.value = new Set(selectedDraftIds.value);
}

function clearSelection() {
  selectedDraftIds.value.clear();
  selectedDraftIds.value = new Set();
}

async function claimDraft() {
  if (!selectedDraftId.value) return;

  try {
    await apiClient.post(`/api/v1/curator/${selectedDraftId.value}/claim`);
    await loadQueue();
    await loadDraftDetail(selectedDraftId.value);
  } catch (error: any) {
    console.error('Failed to claim draft:', error);
    alert(error.response?.data?.detail || 'Failed to claim draft');
  }
}

async function approveDraft() {
  if (!selectedDraftId.value) return;

  try {
    await apiClient.post(`/api/v1/curator/${selectedDraftId.value}/approve`, {
      curator_notes: approveNotes.value,
      deploy_immediately: deployImmediately.value,
    });

    showApproveModal.value = false;
    approveNotes.value = '';
    deployImmediately.value = false;

    await loadQueue();
    await loadDraftDetail(selectedDraftId.value);
  } catch (error: any) {
    console.error('Failed to approve draft:', error);
    alert(error.response?.data?.detail || 'Failed to approve draft');
  }
}

async function rejectDraft() {
  if (!selectedDraftId.value || !rejectReason.value) return;

  try {
    await apiClient.post(`/api/v1/curator/${selectedDraftId.value}/reject`, {
      reason: rejectReason.value,
    });

    showRejectModal.value = false;
    rejectReason.value = '';

    await loadQueue();
    await loadDraftDetail(selectedDraftId.value);
  } catch (error: any) {
    console.error('Failed to reject draft:', error);
    alert(error.response?.data?.detail || 'Failed to reject draft');
  }
}

async function requestChanges() {
  if (!selectedDraftId.value || !requestedChanges.value) return;

  try {
    await apiClient.post(`/api/v1/curator/${selectedDraftId.value}/request-changes`, {
      requested_changes: { description: requestedChanges.value },
      curator_notes: changeNotes.value,
    });

    showRequestChangesModal.value = false;
    requestedChanges.value = '';
    changeNotes.value = '';

    await loadQueue();
    await loadDraftDetail(selectedDraftId.value);
  } catch (error: any) {
    console.error('Failed to request changes:', error);
    alert(error.response?.data?.detail || 'Failed to request changes');
  }
}

async function bulkClaim() {
  if (selectedDraftIds.value.size === 0) return;

  bulkActionLoading.value = true;
  try {
    const response = await apiClient.post('/api/v1/curator/bulk/claim', {
      draft_ids: Array.from(selectedDraftIds.value),
    });

    console.log('Bulk claim result:', response.data);
    clearSelection();
    await loadQueue();
  } catch (error: any) {
    console.error('Failed to bulk claim:', error);
    alert(error.response?.data?.detail || 'Failed to bulk claim');
  } finally {
    bulkActionLoading.value = false;
  }
}

async function bulkApprove() {
  if (selectedDraftIds.value.size === 0) return;

  const notes = prompt('Enter curator notes (optional):');
  if (notes === null) return; // User cancelled

  bulkActionLoading.value = true;
  try {
    const response = await apiClient.post('/api/v1/curator/bulk/approve', {
      draft_ids: Array.from(selectedDraftIds.value),
      curator_notes: notes || undefined,
    });

    console.log('Bulk approve result:', response.data);
    clearSelection();
    await loadQueue();
  } catch (error: any) {
    console.error('Failed to bulk approve:', error);
    alert(error.response?.data?.detail || 'Failed to bulk approve');
  } finally {
    bulkActionLoading.value = false;
  }
}

async function bulkReject() {
  if (selectedDraftIds.value.size === 0) return;

  const reason = prompt('Enter rejection reason:');
  if (!reason) return;

  bulkActionLoading.value = true;
  try {
    const response = await apiClient.post('/api/v1/curator/bulk/reject', {
      draft_ids: Array.from(selectedDraftIds.value),
      reason,
    });

    console.log('Bulk reject result:', response.data);
    clearSelection();
    await loadQueue();
  } catch (error: any) {
    console.error('Failed to bulk reject:', error);
    alert(error.response?.data?.detail || 'Failed to bulk reject');
  } finally {
    bulkActionLoading.value = false;
  }
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Needs review',
    'in_review': 'In review',
    'changes_requested': 'Changes requested',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'deployed': 'Deployed',
  };
  return statusMap[status] || status;
}

function getStatusIntent(status: string): 'success' | 'warning' | 'danger' | 'default' {
  const intentMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    'approved': 'success',
    'deployed': 'success',
    'changes_requested': 'warning',
    'rejected': 'danger',
    'in_review': 'default',
    'pending': 'default',
  };
  return intentMap[status] || 'default';
}

function formatDate(iso: string): string {
  return dayjs(iso).format('MMM D, YYYY HH:mm');
}

function truncate(text: string, length: number): string {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
}

// Initialize
loadQueue();
</script>

<style scoped>
.workspace {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.queue {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.bulk-actions {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  display: grid;
  gap: 0.75rem;
}

.bulk-selected {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
}

.bulk-buttons {
  display: flex;
  gap: 0.5rem;
}

button.small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

button.danger {
  background: #dc2626;
  color: white;
  border: none;
}

button.danger:hover:not(:disabled) {
  background: #b91c1c;
}

.queue ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.queue li {
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

.queue-item-content {
  padding: 1rem;
  display: grid;
  gap: 0.6rem;
}

.queue__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-container input {
  cursor: pointer;
}

.queue__meta,
.queue__scores {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.score {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
}

.loading-state,
.empty-state {
  display: grid;
  place-items: center;
  padding: 2rem;
  gap: 0.75rem;
  color: var(--color-text-secondary);
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
  to { transform: rotate(360deg); }
}

.detail {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.02);
}

.tabs button {
  flex: 1;
  padding: 0.9rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.tabs button.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  background: white;
}

.tab-content {
  padding: 1.8rem;
  display: grid;
  gap: 1.5rem;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
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
  align-items: flex-start;
}

.validation-scores,
.validation-issues,
.draft-preview-section,
.curator-notes {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.validation-scores h3,
.validation-issues h4,
.draft-preview-section h3,
.curator-notes h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
}

.scores-grid {
  display: grid;
  gap: 1rem;
}

.score-item {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 0.75rem;
}

.score-item span {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.score-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #3b82f6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.validation-issues {
  display: grid;
  gap: 1rem;
}

.issue-section ul {
  margin: 0.5rem 0 0;
  padding-left: 1.5rem;
}

.issue-section.errors {
  color: #dc2626;
}

.issue-section.warnings {
  color: #ea580c;
}

.history-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.history-list li {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.version-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.placeholder {
  display: grid;
  place-items: center;
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.6);
  min-height: 400px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  display: grid;
  gap: 1.25rem;
}

.modal h3 {
  margin: 0;
}

.modal label {
  display: grid;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
