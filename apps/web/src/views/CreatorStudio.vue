<template>
  <div class="view-content">
    <PageHeader
      title="Create market"
      subtitle="Work with AI to draft clear questions and launch in minutes."
    >
      <template #actions>
        <button v-if="currentDraft" class="ghost" @click="resetStudio">New draft</button>
        <button
          v-if="currentDraft && !isGenerating"
          class="cta"
          @click="submitDraft"
          :disabled="!isValidDraft"
        >
          Submit for review
        </button>
      </template>
    </PageHeader>

    <!-- Initial Topic Input (if no draft yet) -->
    <section v-if="!currentDraft && !isGenerating" class="topic-input card">
      <div class="card__title">
        <h2>What market do you want to create?</h2>
        <span class="pill">AI-Assisted</span>
      </div>

      <form @submit.prevent="startGeneration" class="topic-form">
        <label>
          Category
          <select v-model="topicForm.category" required>
            <option value="">Select category...</option>
            <option value="Crypto">Crypto</option>
            <option value="Politics">Politics</option>
            <option value="Tech">Tech</option>
            <option value="Sports">Sports</option>
            <option value="Economy">Economy</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Keywords (comma-separated)
          <input
            v-model="topicForm.keywordsInput"
            type="text"
            placeholder="Bitcoin, price, $100k"
            required
          />
          <small>Key terms related to your market</small>
        </label>

        <label>
          Describe your market idea
          <textarea
            v-model="topicForm.context"
            placeholder="Will Bitcoin reach $100,000 by the end of 2025?"
            rows="4"
            required
          />
          <small>Describe what you want to predict. Be specific about timeframes and conditions.</small>
        </label>

        <label>
          Resolution deadline
          <input v-model="topicForm.deadlineDays" type="number" min="1" max="365" required />
          <small>Days from now until market resolution</small>
        </label>

        <div class="form-actions">
          <button type="submit" class="cta">
            Generate market with AI
          </button>
        </div>
      </form>
    </section>

    <!-- Generation Progress -->
    <section v-if="isGenerating" class="progress-view card">
      <div class="progress-header">
        <h2>AI is creating your market...</h2>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${agentProgress.progress}%` }"></div>
        </div>
      </div>

      <div class="progress-steps">
        <div
          v-for="step in progressSteps"
          :key="step.name"
          :class="['progress-step', { active: step.name === agentProgress.step, complete: step.complete }]"
        >
          <div class="step-icon">
            <span v-if="step.complete">✓</span>
            <span v-else-if="step.name === agentProgress.step" class="spinner"></span>
            <span v-else>{{ step.order }}</span>
          </div>
          <div class="step-content">
            <h4>{{ step.label }}</h4>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>

      <p class="progress-message">{{ agentProgress.message }}</p>
    </section>

    <!-- Studio (when draft exists) -->
    <section v-if="currentDraft && !isGenerating" class="studio card">
      <div class="studio__chat">
        <div class="card__title">
          <h2>Refine with AI</h2>
          <span class="pill">{{ conversationMessages.length }} messages</span>
        </div>

        <div class="chat">
          <article
            v-for="message in conversationMessages"
            :key="message.id"
            :class="['bubble', message.role]"
          >
            <span>{{ message.author }}</span>
            <p v-html="formatMessage(message.text)"></p>
            <time>{{ message.time }}</time>
          </article>
        </div>

        <form @submit.prevent="sendMessage" class="composer">
          <textarea
            v-model="userMessage"
            placeholder="Ask AI to refine the question, adjust economics, or add fallback sources..."
            :disabled="isRefining"
            @keydown.meta.enter="sendMessage"
            @keydown.ctrl.enter="sendMessage"
          />
          <div class="composer__actions">
            <button type="button" class="ghost" @click="showSuggestions" :disabled="isRefining">
              Suggestions
            </button>
            <button type="submit" class="cta" :disabled="!userMessage.trim() || isRefining">
              {{ isRefining ? 'Refining...' : 'Send' }}
            </button>
          </div>
        </form>
      </div>

      <aside class="studio__preview">
        <div class="card__title">
          <h2>Draft preview</h2>
          <div class="preview-actions">
            <button class="ghost" @click="copyDraftJSON">Copy JSON</button>
            <button class="ghost" @click="downloadDraft">Download</button>
          </div>
        </div>

        <!-- Validation Status -->
        <section v-if="validation" class="validation-card">
          <div class="validation-header">
            <h3>
              <span v-if="validation.is_valid" class="status-icon success">✓</span>
              <span v-else class="status-icon error">✗</span>
              Validation {{ validation.is_valid ? 'Passed' : 'Failed' }}
            </h3>
          </div>

          <div class="validation-scores">
            <div class="score">
              <label>Quality</label>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${validation.quality_score * 100}%` }"></div>
              </div>
              <span>{{ (validation.quality_score * 100).toFixed(0) }}%</span>
            </div>
            <div class="score">
              <label>Safety</label>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${validation.safety_score * 100}%` }"></div>
              </div>
              <span>{{ (validation.safety_score * 100).toFixed(0) }}%</span>
            </div>
            <div class="score">
              <label>Clarity</label>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${validation.clarity_score * 100}%` }"></div>
              </div>
              <span>{{ (validation.clarity_score * 100).toFixed(0) }}%</span>
            </div>
          </div>

          <div v-if="validation.errors.length" class="validation-issues errors">
            <h4>❌ Errors</h4>
            <ul>
              <li v-for="(error, i) in validation.errors" :key="i">{{ error }}</li>
            </ul>
          </div>

          <div v-if="validation.warnings.length" class="validation-issues warnings">
            <h4>⚠️ Warnings</h4>
            <ul>
              <li v-for="(warning, i) in validation.warnings" :key="i">{{ warning }}</li>
            </ul>
          </div>

          <div v-if="validation.suggestions.length" class="validation-issues suggestions">
            <h4>💡 Suggestions</h4>
            <ul>
              <li v-for="(suggestion, i) in validation.suggestions" :key="i">{{ suggestion }}</li>
            </ul>
          </div>
        </section>

        <!-- Question -->
        <section class="preview-card">
          <h3>Question</h3>
          <p>{{ currentDraft.question_text }}</p>
        </section>

        <!-- Summary -->
        <section class="preview-card">
          <h3>Summary</h3>
          <p>{{ currentDraft.summary }}</p>
        </section>

        <!-- Outcomes -->
        <section class="preview-card">
          <h3>Outcomes</h3>
          <div class="outcomes">
            <div v-for="outcome in currentDraft.outcomes" :key="outcome.label" class="outcome">
              <strong>{{ outcome.label }}</strong>
              <span>{{ outcome.payout_weight === 1 ? '1.0' : '0.0' }}</span>
            </div>
          </div>
        </section>

        <!-- Resolution Criteria -->
        <section class="preview-card">
          <h3>Resolution criteria</h3>
          <ul>
            <li><strong>Trigger:</strong> {{ currentDraft.trigger_condition }}</li>
            <li v-if="currentDraft.fallback_logic">
              <strong>Fallback:</strong> {{ currentDraft.fallback_logic }}
            </li>
            <li v-if="currentDraft.invalidation_clause">
              <strong>Invalidation:</strong> {{ currentDraft.invalidation_clause }}
            </li>
          </ul>
          <div class="sources" v-if="currentDraft.primary_sources.length">
            <h4>Data Sources</h4>
            <ul>
              <li v-for="(source, i) in currentDraft.primary_sources" :key="i">{{ source }}</li>
            </ul>
          </div>
        </section>

        <!-- Economics & Timeline -->
        <section class="preview-grid">
          <div>
            <h4>Economics</h4>
            <p>Trading fee: {{ currentDraft.trading_fee_bps / 100 }}%</p>
            <p>Settlement fee: {{ currentDraft.settlement_fee_bps / 100 }}%</p>
            <p>Proof bounty: {{ currentDraft.proof_bounty || 0 }} USDC</p>
          </div>
          <div>
            <h4>Timeline</h4>
            <p>Resolution: {{ formatDate(currentDraft.resolution_deadline) }}</p>
            <p>Dispute window: {{ currentDraft.dispute_window_hours || 72 }}h</p>
          </div>
        </section>

        <!-- AI Rationale -->
        <section class="preview-card rationale" v-if="currentDraft.ai_rationale">
          <h3>AI Rationale</h3>
          <p>{{ currentDraft.ai_rationale }}</p>
        </section>
      </aside>
    </section>

    <!-- Error Display -->
    <div v-if="error" class="error-banner">
      <p>❌ {{ error }}</p>
      <button @click="error = null" class="ghost">Dismiss</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/PageHeader.vue';
import { generateMarketDraft, refineDraft, type MarketTopic, type AgentProgress } from '@/services/aiAgents';
import { submitDraft as apiSubmitDraft } from '@/services/api';
import dayjs from 'dayjs';

const router = useRouter();
const authStore = useAuthStore();

// State
const topicForm = reactive({
  category: '',
  keywordsInput: '',
  context: '',
  deadlineDays: 30,
});

const currentDraft = ref<any>(null);
const validation = ref<any>(null);
const isGenerating = ref(false);
const isRefining = ref(false);
const error = ref<string | null>(null);

const agentProgress = reactive<AgentProgress>({
  step: 'idle',
  message: '',
  progress: 0,
});

interface ConversationMessage {
  id: number;
  role: 'ai' | 'human';
  author: string;
  text: string;
  time: string;
}

const conversationMessages = ref<ConversationMessage[]>([]);
const userMessage = ref('');
let messageIdCounter = 0;

// Progress steps
const progressSteps = computed(() => [
  {
    name: 'scout',
    order: 1,
    label: 'Scout Agent',
    description: 'Researching zkTLS-verifiable data sources',
    complete: ['draft', 'validate', 'complete'].includes(agentProgress.step),
  },
  {
    name: 'draft',
    order: 2,
    label: 'Draft Agent',
    description: 'Generating market question and resolution criteria',
    complete: ['validate', 'complete'].includes(agentProgress.step),
  },
  {
    name: 'validate',
    order: 3,
    label: 'Validator Agent',
    description: 'Checking quality, safety, and compliance',
    complete: agentProgress.step === 'complete',
  },
]);

const isValidDraft = computed(() => {
  return validation.value?.is_valid === true;
});

// Start AI generation
async function startGeneration() {
  if (!authStore.isAuthenticated) {
    error.value = 'Please sign in to create markets';
    return;
  }

  isGenerating.value = true;
  error.value = null;

  try {
    const topic: MarketTopic = {
      category: topicForm.category,
      keywords: topicForm.keywordsInput.split(',').map(k => k.trim()),
      context: topicForm.context,
    };

    const result = await generateMarketDraft(topic, topicForm.deadlineDays, (progress) => {
      agentProgress.step = progress.step;
      agentProgress.message = progress.message;
      agentProgress.progress = progress.progress;
    });

    if (result.success && result.draft) {
      currentDraft.value = result.draft;
      validation.value = result.validation;

      // Add initial AI message
      conversationMessages.value.push({
        id: messageIdCounter++,
        role: 'ai',
        author: 'AI Assistant',
        text: `I've created a market draft based on your topic. ${validation.value?.is_valid ? 'The draft passes all validation checks!' : 'Please review the validation feedback and let me know if you want any changes.'}`,
        time: 'Just now',
      });
    } else {
      error.value = result.errors.join(', ') || 'Failed to generate draft';
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to generate draft';
  } finally {
    isGenerating.value = false;
  }
}

// Send message to refine draft
async function sendMessage() {
  if (!userMessage.value.trim() || isRefining.value) return;

  const message = userMessage.value.trim();
  userMessage.value = '';

  // Add user message
  conversationMessages.value.push({
    id: messageIdCounter++,
    role: 'human',
    author: 'You',
    text: message,
    time: 'Just now',
  });

  isRefining.value = true;

  try {
    // Call AI refinement API
    const result = await refineDraft(generationResult.value!, message);

    conversationMessages.value.push({
      id: messageIdCounter++,
      role: 'ai',
      author: 'AI Assistant',
      text: result.message || 'Draft has been refined based on your feedback.',
      time: 'Just now',
    });

    // Update generation result with refined draft
    if (result.refined_draft) {
      generationResult.value = result.refined_draft;
    }
  } catch (err: any) {
    error.value = 'Failed to refine draft';
  } finally {
    isRefining.value = false;
  }
}

// Show AI suggestions
function showSuggestions() {
  if (!validation.value?.suggestions.length) {
    conversationMessages.value.push({
      id: messageIdCounter++,
      role: 'ai',
      author: 'AI Assistant',
      text: 'No suggestions at this time. Your draft looks good!',
      time: 'Just now',
    });
    return;
  }

  const suggestionsText = 'Here are some suggestions to improve your market:\n\n' +
    validation.value.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');

  conversationMessages.value.push({
    id: messageIdCounter++,
    role: 'ai',
    author: 'AI Assistant',
    text: suggestionsText,
    time: 'Just now',
  });
}

// Submit draft for curator review
async function submitDraft() {
  if (!isValidDraft.value) {
    error.value = 'Please fix validation errors before submitting';
    return;
  }

  try {
    await apiSubmitDraft(currentDraft.value.id);
    router.push('/account'); // Navigate to user dashboard
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to submit draft';
  }
}

// Reset studio
function resetStudio() {
  currentDraft.value = null;
  validation.value = null;
  conversationMessages.value = [];
  error.value = null;
  topicForm.category = '';
  topicForm.keywordsInput = '';
  topicForm.context = '';
  topicForm.deadlineDays = 30;
}

// Utilities
function formatMessage(text: string): string {
  return text.replace(/\n/g, '<br>');
}

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return 'Not set';
  return dayjs(isoString).format('MMM D, YYYY');
}

function copyDraftJSON() {
  navigator.clipboard.writeText(JSON.stringify(currentDraft.value, null, 2));
}

function downloadDraft() {
  const blob = new Blob([JSON.stringify(currentDraft.value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'market-draft.json';
  a.click();
}
</script>

<style scoped>
/* Topic Input Form */
.topic-input {
  max-width: 720px;
  margin: 0 auto;
}

.topic-form {
  display: grid;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.topic-form label {
  display: grid;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
}

.topic-form input,
.topic-form select,
.topic-form textarea {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-size: 0.95rem;
}

.topic-form textarea {
  resize: vertical;
}

.topic-form small {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 400;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

/* Progress View */
.progress-view {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
}

.progress-header {
  text-align: center;
  margin-bottom: 2rem;
}

.progress-header h2 {
  margin: 0 0 1rem;
}

.progress-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.progress-steps {
  display: grid;
  gap: 1.5rem;
  margin: 2rem 0;
}

.progress-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  opacity: 0.5;
}

.progress-step.active {
  opacity: 1;
}

.progress-step.complete {
  opacity: 0.7;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.progress-step.active .step-icon {
  background: var(--color-accent);
  color: white;
}

.progress-step.complete .step-icon {
  background: var(--color-positive);
  color: white;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.step-content h4 {
  margin: 0;
  font-size: 1rem;
}

.step-content p {
  margin: 0.25rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.progress-message {
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* Studio Layout */
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
  line-height: 1.5;
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
  min-height: 100px;
  resize: vertical;
  font-size: 0.95rem;
}

.composer__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Preview */
.studio__preview {
  display: grid;
  gap: 1.25rem;
  max-height: 85vh;
  overflow-y: auto;
  padding-right: 0.5rem;
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

.preview-card h3,
.preview-card h4 {
  margin: 0;
  font-size: 1rem;
}

.preview-card ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--color-text-secondary);
  display: grid;
  gap: 0.5rem;
}

.preview-card .sources {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.outcomes {
  display: grid;
  gap: 0.75rem;
}

.outcome {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
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

.rationale p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Validation Card */
.validation-card {
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.validation-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.status-icon.success {
  background: var(--color-positive);
  color: white;
}

.status-icon.error {
  background: var(--color-negative);
  color: white;
}

.validation-scores {
  display: grid;
  gap: 0.75rem;
}

.score {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: 0.75rem;
}

.score label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.score-bar {
  height: 8px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--color-positive);
}

.score span {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: right;
}

.validation-issues {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
}

.validation-issues h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.validation-issues ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
}

.validation-issues.errors {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.validation-issues.warnings {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.validation-issues.suggestions {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* Error Banner */
.error-banner {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--color-negative);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.error-banner p {
  margin: 0;
}

.error-banner button {
  color: white;
  border-color: white;
}

/* Responsive */
@media (max-width: 1024px) {
  .studio {
    grid-template-columns: 1fr;
  }

  .studio__preview {
    max-height: none;
  }
}
</style>
