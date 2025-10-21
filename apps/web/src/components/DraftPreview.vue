<template>
  <div class="draft-preview">
    <section v-if="draft.question_text" class="section" :class="{ highlighted: isHighlighted('question_text') }">
      <h4>Question</h4>
      <p class="question">{{ draft.question_text }}</p>
    </section>

    <section v-if="draft.summary" class="section" :class="{ highlighted: isHighlighted('summary') }">
      <h4>Summary</h4>
      <p>{{ draft.summary }}</p>
    </section>

    <section v-if="draft.outcomes && draft.outcomes.length > 0" class="section" :class="{ highlighted: isHighlighted('outcomes') }">
      <h4>Outcomes</h4>
      <ul class="outcomes-list">
        <li v-for="(outcome, index) in draft.outcomes" :key="index">
          <strong>{{ outcome.label }}</strong>
          <span v-if="outcome.payout_weight" class="meta">(Weight: {{ outcome.payout_weight }})</span>
        </li>
      </ul>
    </section>

    <section v-if="draft.resolution_sources && draft.resolution_sources.length > 0" class="section" :class="{ highlighted: isHighlighted('resolution_sources') }">
      <h4>Resolution Sources</h4>
      <ul class="sources-list">
        <li v-for="(source, index) in draft.resolution_sources" :key="index">
          <div class="source-header">
            <span class="priority">Priority {{ source.priority || 0 }}</span>
            <span class="source-type">{{ source.source_type || 'api' }}</span>
          </div>
          <a :href="source.source_url" target="_blank" class="source-url">
            {{ source.source_url }}
          </a>
          <p v-if="source.expected_data_pattern" class="source-pattern">
            Pattern: <code>{{ source.expected_data_pattern }}</code>
          </p>
        </li>
      </ul>
    </section>

    <section v-if="draft.trigger_condition" class="section" :class="{ highlighted: isHighlighted('trigger_condition') }">
      <h4>Trigger Condition</h4>
      <p>{{ draft.trigger_condition }}</p>
    </section>

    <section v-if="draft.fallback_logic" class="section" :class="{ highlighted: isHighlighted('fallback_logic') }">
      <h4>Fallback Logic</h4>
      <p>{{ draft.fallback_logic }}</p>
    </section>

    <section v-if="draft.invalidation_clause" class="section" :class="{ highlighted: isHighlighted('invalidation_clause') }">
      <h4>Invalidation Clause</h4>
      <p>{{ draft.invalidation_clause }}</p>
    </section>

    <section v-if="draft.ai_rationale" class="section" :class="{ highlighted: isHighlighted('ai_rationale') }">
      <h4>AI Rationale</h4>
      <p class="rationale">{{ draft.ai_rationale }}</p>
    </section>

    <section v-if="draft.topic_tags && draft.topic_tags.length > 0" class="section" :class="{ highlighted: isHighlighted('topic_tags') }">
      <h4>Tags</h4>
      <div class="tags">
        <span v-for="tag in draft.topic_tags" :key="tag" class="pill">{{ tag }}</span>
      </div>
    </section>

    <section class="section economics" :class="{ highlighted: isHighlighted('economics') }">
      <h4>Economics</h4>
      <div class="economics-grid">
        <div v-if="draft.trading_fee_bps" class="econ-item">
          <span class="label">Trading Fee</span>
          <strong>{{ (draft.trading_fee_bps / 100).toFixed(2) }}%</strong>
        </div>
        <div v-if="draft.settlement_fee_bps" class="econ-item">
          <span class="label">Settlement Fee</span>
          <strong>{{ (draft.settlement_fee_bps / 100).toFixed(2) }}%</strong>
        </div>
        <div v-if="draft.creator_stake" class="econ-item">
          <span class="label">Creator Stake</span>
          <strong>{{ draft.creator_stake }} USDC</strong>
        </div>
        <div v-if="draft.proof_bounty" class="econ-item">
          <span class="label">Proof Bounty</span>
          <strong>{{ draft.proof_bounty }} USDC</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
interface Props {
  draft: any;
  highlightChanges?: Set<string>;
}

const props = withDefaults(defineProps<Props>(), {
  highlightChanges: () => new Set(),
});

function isHighlighted(field: string): boolean {
  return props.highlightChanges.has(field);
}
</script>

<style scoped>
.draft-preview {
  display: grid;
  gap: 1.25rem;
}

.section {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.section.highlighted {
  background: rgba(251, 146, 60, 0.05);
  border-color: #fb923c;
}

.section h4 {
  margin: 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.question {
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.5;
}

.section p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.rationale {
  font-style: italic;
  background: rgba(0, 0, 0, 0.02);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-accent);
}

.outcomes-list,
.sources-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.outcomes-list li {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.sources-list li {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-sm);
  display: grid;
  gap: 0.5rem;
}

.source-header {
  display: flex;
  gap: 0.5rem;
}

.priority,
.source-type {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.source-url {
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.9rem;
  word-break: break-all;
}

.source-url:hover {
  text-decoration: underline;
}

.source-pattern {
  margin: 0;
  font-size: 0.85rem;
}

.source-pattern code {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius-sm);
  font-family: 'Courier New', monospace;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.economics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.econ-item {
  display: grid;
  gap: 0.3rem;
}

.econ-item .label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.econ-item strong {
  font-size: 1.1rem;
  color: var(--color-text);
}
</style>
