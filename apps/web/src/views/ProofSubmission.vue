<template>
  <div class="page">
    <TopBar
      title="Truth Trance"
      subtitle="Channel proofs like a Bene Gesserit. Bounties await."
      :help-topic="'proof'"
    >
      <template #actions>
        <button class="ghost">View crysknife playbook</button>
        <button class="cta">Claim new job</button>
      </template>
    </TopBar>

    <section class="grid two">
      <article class="card jobs">
        <header>
          <h2>Active jobs</h2>
          <div class="jobs__meta">
            <span class="pill">SLA live</span>
            <button class="ghost" @click="openHelp">Tips</button>
          </div>
        </header>
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
        <h2>Submit proof</h2>
        <p>Drop CID + hash. Keep transcript ready in case of disputes.</p>
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
            <input placeholder="0x…" />
          </label>

          <label>
            Notes
            <textarea placeholder="Optional heads-up for the squad." />
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
import TopBar from '@/components/TopBar.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { useHelpStore } from '@/stores/help';
import { fetchProofJobs } from '@/services/mockApi';

const help = useHelpStore();
const openHelp = () => help.show('proof');

const { data: proofJobs } = useQuery({
  queryKey: ['proof-jobs'],
  queryFn: fetchProofJobs
});

const jobs = computed(() => proofJobs.value ?? []);
const formatDeadline = (iso: string) => dayjs(iso).format('MMM D, HH:mm');
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

th {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.85rem;
}

.jobs {
  display: grid;
  gap: 1.5rem;
}

.jobs__meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.jobs__meta .ghost {
  padding: 0.35rem 0.8rem;
  font-size: 0.75rem;
}

.submit {
  display: grid;
  gap: 1.25rem;
}

.submit p {
  margin: 0;
  color: var(--color-text-secondary);
}

.form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.5rem;
  font-size: 0.9rem;
}

input,
select,
textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  color: inherit;
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
</style>
