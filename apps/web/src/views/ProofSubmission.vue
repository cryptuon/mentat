<template>
  <div class="view-content">
    <PageHeader
      title="Proof operations"
      subtitle="Claim zkTLS jobs, submit artifacts, and keep resolutions on schedule."
    >
      <template #actions>
        <button class="ghost">Playbook</button>
        <button class="cta">Claim job</button>
      </template>
    </PageHeader>

    <section class="grid two">
      <article class="card jobs">
        <div class="card__title">
          <h2>Active jobs</h2>
          <span class="pill">SLA live</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Market</th>
              <th>Deadline</th>
              <th>Source</th>
              <th>Status</th>
              <th>Bounty</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.marketId">
              <td>{{ job.question.slice(0, 48) }}…</td>
              <td>{{ formatDeadline(job.deadline) }}</td>
              <td>{{ job.source }}</td>
              <td>
                <StatusBadge :intent="job.status === 'pending' ? 'warning' : 'success'">
                  {{ job.status }}
                </StatusBadge>
              </td>
              <td>{{ job.bounty }} USDC</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="card submit">
        <div class="card__title">
          <h2>Submit proof</h2>
        </div>
        <p>Fill in the proof artifact and TLS hash. Keep transcripts handy in case of disputes.</p>
        <form class="form">
          <label>
            Market
            <select>
              <option v-for="job in jobs" :key="job.marketId" :value="job.marketId">
                {{ job.marketId }} • {{ job.question.slice(0, 32) }}…
              </option>
            </select>
          </label>

          <label>
            Proof artifact (CID or URL)
            <input placeholder="ipfs://..." />
          </label>

          <label>
            TLS transcript hash
            <input placeholder="0x..." />
          </label>

          <label>
            Notes
            <textarea placeholder="Optional context for reviewers" />
          </label>

          <div class="actions">
            <button type="button" class="ghost">Save draft</button>
            <button type="submit" class="cta">Submit proof</button>
          </div>
        </form>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import PageHeader from '@/components/PageHeader.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { fetchProofJobs } from '@/services/mockApi';

const { data: proofJobs } = useQuery({
  queryKey: ['proof-jobs'],
  queryFn: fetchProofJobs
});

const jobs = computed(() => proofJobs.value ?? []);
const formatDeadline = (iso: string) => dayjs(iso).format('MMM D, HH:mm');
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  overflow-x: auto;
  display: block;
}

thead,
tbody,
tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

th,
td {
  padding: 0.65rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.jobs,
.submit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.jobs .card__title {
  margin-bottom: 0.5rem;
}

.submit .card__title {
  margin-bottom: 0;
}

.submit p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.45rem;
  font-size: 0.9rem;
}

input,
select,
textarea {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-size: 0.95rem;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .grid.two {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  table {
    font-size: 0.8rem;
  }

  th,
  td {
    padding: 0.5rem 0.35rem;
  }

  th:first-child,
  td:first-child {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
