<template>
  <div class="timeline card">
    <header>
      <h4>Proof timeline</h4>
      <StatusBadge :intent="badgeIntent">{{ statusLabel }}</StatusBadge>
    </header>

    <div class="timeline__body">
      <div class="timeline__row">
        <span>Expected SLA</span>
        <strong>{{ proofSlaMinutes }} minutes</strong>
      </div>
      <div class="timeline__row">
        <span>Deadline</span>
        <strong>{{ deadline }}</strong>
      </div>
      <div class="timeline__row" v-if="submittedAt">
        <span>Submitted</span>
        <strong>{{ submittedAt }}</strong>
      </div>
      <div class="timeline__row" v-if="proofHash">
        <span>Proof hash</span>
        <code>{{ proofHash }}</code>
      </div>
      <div class="timeline__row" v-if="verifier">
        <span>Verifier</span>
        <strong>{{ verifier }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import StatusBadge from './StatusBadge.vue';

dayjs.extend(relativeTime);

type ProofStatus = 'awaiting' | 'submitted' | 'verified' | 'disputed';

const props = defineProps<{
  status: ProofStatus;
  proofSlaMinutes: number;
  deadlineIso: string;
  submittedAtIso?: string;
  proofHash?: string;
  verifier?: string;
}>();

const statusLabelMap: Record<ProofStatus, string> = {
  awaiting: 'Awaiting proof',
  submitted: 'Submitted',
  verified: 'Verified',
  disputed: 'Disputed'
};

const statusIntentMap: Record<ProofStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  awaiting: 'default',
  submitted: 'warning',
  verified: 'success',
  disputed: 'danger'
};

const statusLabel = statusLabelMap[props.status];
const badgeIntent = statusIntentMap[props.status];
const deadline = dayjs(props.deadlineIso).format('MMM D, HH:mm');
const submittedAt = props.submittedAtIso
  ? dayjs(props.submittedAtIso).format('MMM D, HH:mm')
  : undefined;
const proofHash = props.proofHash;
const verifier = props.verifier;
</script>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h4 {
  margin: 0;
}

.timeline__body {
  display: grid;
  gap: 0.75rem;
}

.timeline__row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.timeline__row span {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

code {
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  background: #f0f2f9;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.84rem;
}
</style>
