<template>
  <div class="page" v-if="market">
    <TopBar
      :title="market.question"
      :subtitle="summary"
      :help-topic="'trader'"
    >
      <template #actions>
        <button class="ghost" @click="shareMarket">Share</button>
        <button class="cta">Enter market</button>
      </template>
    </TopBar>

    <section class="grid main-grid">
      <article class="card market-overview">
        <header>
          <StatusBadge :intent="statusIntent">{{ market.state.toUpperCase() }}</StatusBadge>
          <span class="pill">Resolution deadline: {{ deadline }}</span>
        </header>

        <div class="odds-grid">
          <div v-for="outcome in market.outcomes" :key="outcome.id">
            <label>{{ outcome.label }}</label>
            <strong>{{ outcome.probability }}%</strong>
            <p>{{ outcome.price.toFixed(2) }} USDC</p>
          </div>
        </div>

        <section class="liquidity">
          <h3>Spice pool</h3>
          <div class="liquidity__grid">
            <div>
              <span>Pool size</span>
              <strong>{{ formatCurrency(market.liquidity.poolSize) }}</strong>
            </div>
            <div>
              <span>YES shares</span>
              <strong>{{ formatCurrency(market.liquidity.yesShares) }}</strong>
            </div>
            <div>
              <span>NO shares</span>
              <strong>{{ formatCurrency(market.liquidity.noShares) }}</strong>
            </div>
            <div>
              <span>LP APY</span>
              <strong>{{ market.liquidity.apy }}%</strong>
            </div>
          </div>
        </section>
      </article>

      <article class="card chart-card">
        <header>
          <h2>Price sands</h2>
          <span class="pill">24h</span>
        </header>
        <div class="chart-container">
          <SparklineChart :points="chartPoints" :height="160" />
        </div>
        <div class="chart-stats">
          <div>
            <label>YES price</label>
            <strong>{{ latestYes.toFixed(2) }} USDC</strong>
            <span :class="['delta', yesDelta >= 0 ? 'up' : 'down']">
              {{ yesDelta >= 0 ? '+' : '' }}{{ (yesDelta * 100).toFixed(1) }}%
            </span>
          </div>
          <div>
            <label>NO price</label>
            <strong>{{ latestNo.toFixed(2) }} USDC</strong>
            <span :class="['delta', noDelta >= 0 ? 'up' : 'down']">
              {{ noDelta >= 0 ? '+' : '' }}{{ (noDelta * 100).toFixed(1) }}%
            </span>
          </div>
          <div>
            <label>24h volume</label>
            <strong>{{ formatCurrency(volume24h) }}</strong>
          </div>
          <div>
            <label>Liquidity</label>
            <strong>{{ formatCurrency(latestLiquidity) }}</strong>
          </div>
        </div>
      </article>

      <article class="card resolution">
        <h2>Resolution rules</h2>
        <div class="resolution__grid">
          <section>
            <h3>Primary sources</h3>
            <ul>
              <li v-for="source in market.resolutionCriteria.primarySources" :key="source">
                {{ source }}
              </li>
            </ul>
          </section>
          <section>
            <h3>Trigger logic</h3>
            <p>{{ market.resolutionCriteria.triggerLogic }}</p>
            <h3>Fallback</h3>
            <p>{{ market.resolutionCriteria.fallbackLogic }}</p>
          </section>
          <section>
            <h3>Invalidation clause</h3>
            <p>{{ market.resolutionCriteria.invalidationClause }}</p>
          </section>
        </div>
      </article>

      <ProofTimeline
        class="proof"
        :status="market.proofStatus.status"
        :proof-sla-minutes="market.proofSlaMinutes"
        :deadline-iso="market.timeline.resolutionDeadline"
        :submitted-at-iso="market.proofStatus.submittedAt"
        :proof-hash="market.proofStatus.proofHash"
        :verifier="market.proofStatus.verifier"
      />

      <article class="card economics">
        <h2>Fee split</h2>
        <div class="economics__grid">
          <div>
            <span>Trading fee</span>
            <strong>{{ market.feeBreakdown.tradingFee }}%</strong>
            <p>LP {{ market.feeBreakdown.lpShare }}% · Creator {{ market.feeBreakdown.creatorShare }}% · Treasury {{ market.feeBreakdown.treasuryShare }}%</p>
          </div>
          <div>
            <span>Settlement fee</span>
            <strong>{{ market.feeBreakdown.settlementFee }}%</strong>
            <p>Feeds proof bounty + treasury.</p>
          </div>
          <div>
            <span>Open interest</span>
            <strong>{{ formatCurrency(market.openInterest) }}</strong>
          </div>
          <div>
            <span>24h volume</span>
            <strong>{{ formatCurrency(market.volume24h) }}</strong>
          </div>
        </div>
      </article>

      <article class="card timeline">
        <h2>Key timestamps</h2>
        <div class="timeline__grid">
          <div>
            <span>Created</span>
            <strong>{{ formatDate(market.timeline.createdAt) }}</strong>
          </div>
          <div>
            <span>Opened</span>
            <strong>{{ formatDate(market.timeline.openAt) }}</strong>
          </div>
          <div v-if="market.timeline.lockAt">
            <span>Trading lock</span>
            <strong>{{ formatDate(market.timeline.lockAt) }}</strong>
          </div>
          <div>
            <span>Resolution deadline</span>
            <strong>{{ formatDate(market.timeline.resolutionDeadline) }}</strong>
          </div>
          <div>
            <span>Dispute window</span>
            <strong>{{ market.timeline.disputeWindowHours }} hours</strong>
          </div>
        </div>
      </article>

      <article class="card rationale">
        <h2>Mentat rationale</h2>
        <p>{{ market.aiRationale }}</p>
      </article>

      <MarketSocial
        :social="market.social"
        class="social-card"
        @onBoost="onBoost"
        @onShare="shareMarket"
        @onReact="onReact"
      />
    </section>
  </div>
  <div v-else class="loading">
    Loading market…
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useRoute } from 'vue-router';
import TopBar from '@/components/TopBar.vue';
import ProofTimeline from '@/components/ProofTimeline.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import SparklineChart from '@/components/SparklineChart.vue';
import MarketSocial from '@/components/MarketSocial.vue';
import { fetchMarketDetail } from '@/services/mockApi';

const route = useRoute();

const { data: market } = useQuery({
  queryKey: ['market-detail', route.params.id],
  queryFn: () => fetchMarketDetail(route.params.id as string)
});

const statusIntent = computed<'default' | 'success' | 'warning' | 'danger'>(() => {
  if (!market.value) return 'default';
  if (market.value.state === 'resolved') return 'success';
  if (market.value.state === 'locked') return 'warning';
  if (market.value.state === 'invalid' || market.value.state === 'disputed') return 'danger';
  return 'default';
});

const deadline = computed(() =>
  market.value ? dayjs(market.value.timeline.resolutionDeadline).format('MMM D, YYYY HH:mm') : ''
);

const summary = computed(() => {
  const text = market.value?.summary ?? '';
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
});

const history = computed(() => market.value?.priceHistory ?? []);
const chartPoints = computed(() =>
  history.value.map((point) => ({
    timestamp: point.timestamp,
    value: point.yesPrice
  }))
);

const latestPoint = computed(() => history.value.at(-1));
const firstPoint = computed(() => history.value[0]);
const latestYes = computed(() => latestPoint.value?.yesPrice ?? 0);
const latestNo = computed(() => latestPoint.value?.noPrice ?? 0);
const yesDelta = computed(() =>
  latestPoint.value && firstPoint.value
    ? (latestPoint.value.yesPrice - firstPoint.value.yesPrice) / firstPoint.value.yesPrice
    : 0
);
const noDelta = computed(() =>
  latestPoint.value && firstPoint.value
    ? (latestPoint.value.noPrice - firstPoint.value.noPrice) / firstPoint.value.noPrice
    : 0
);
const volume24h = computed(() =>
  history.value.slice(-24).reduce((sum, point) => sum + point.volume, 0)
);
const latestLiquidity = computed(() => latestPoint.value?.liquidity ?? market.value?.liquidity.poolSize ?? 0);

const formatCurrency = (amount: number) => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M USDC`;
  }
  return `${(amount / 1000).toFixed(1)}k USDC`;
};
const formatDate = (iso: string) => dayjs(iso).format('MMM D, YYYY HH:mm');

function shareMarket() {
  if (!market.value) return;
  if (typeof window === 'undefined') return;
  const shareUrl = `${window.location.origin}/market/${market.value.id}`;
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (!nav) return;
  if ('share' in nav) {
    (nav as Navigator).share({ title: market.value.question, url: shareUrl }).catch(() => null);
    return;
  }
  nav.clipboard?.writeText(shareUrl).catch(() => null);
}

function onBoost() {
  // placeholder for boost interaction
}

function onReact(_id: string) {
  // placeholder for reaction hook
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.main-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.market-overview {
  grid-column: span 2;
  display: grid;
  gap: 1.5rem;
}

.market-overview header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.odds-grid div {
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.odds-grid label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.odds-grid strong {
  font-size: 1.8rem;
}

.odds-grid p {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
}

.liquidity {
  display: grid;
  gap: 1rem;
}

.liquidity__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.liquidity__grid span {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.chart-card {
  display: grid;
  gap: 1.25rem;
  grid-column: span 2;
}

.chart-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 180px;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.chart-stats label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.chart-stats strong {
  font-size: 1.4rem;
}

.delta {
  font-size: 0.85rem;
  display: inline-block;
  margin-top: 0.25rem;
}

.delta.up {
  color: #2ecc71;
}

.delta.down {
  color: #ff7675;
}

.resolution {
  grid-column: span 2;
  display: grid;
  gap: 1.25rem;
}

.resolution__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.resolution__grid ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--color-text-secondary);
  display: grid;
  gap: 0.5rem;
}

.proof {
  grid-column: span 1;
}

.economics {
  display: grid;
  gap: 1.5rem;
}

.economics__grid {
  display: grid;
  gap: 1rem;
}

.economics__grid span {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.economics__grid p {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.timeline {
  display: grid;
  gap: 1rem;
}

.timeline__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.timeline__grid span {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.rationale {
  grid-column: span 2;
}

.social-card {
  grid-column: span 2;
}

.loading {
  padding: 4rem;
  text-align: center;
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .market-overview,
  .chart-card,
  .resolution,
  .rationale,
  .social-card {
    grid-column: span 1;
  }
}

@media (max-width: 900px) {
  .main-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .market-overview header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .chart-stats {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

@media (max-width: 640px) {
  .main-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .odds-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .liquidity__grid,
  .timeline__grid,
  .chart-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .resolution__grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-wrap: wrap;
  }
}

@media (max-width: 460px) {
  .odds-grid {
    grid-template-columns: 1fr;
  }

  .liquidity__grid,
  .chart-stats,
  .timeline__grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 140px;
  }
}
</style>
