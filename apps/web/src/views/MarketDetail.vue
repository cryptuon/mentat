<template>
  <div v-if="market" class="view-content">
    <PageHeader
      :title="market.question"
      :subtitle="summary"
    >
      <template #actions>
        <button class="ghost" @click="shareMarket">Share</button>
        <button class="cta">Trade</button>
      </template>
    </PageHeader>

    <div class="detail-layout">
      <!-- Left Column: Main info -->
      <div class="detail-left">
        <article class="card market-overview">
          <div class="market-overview__visual">
            <div class="visual-placeholder">
              <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#3a66f5;stop-opacity:0.1" />
                    <stop offset="100%" style="stop-color:#3a66f5;stop-opacity:0.05" />
                  </linearGradient>
                </defs>
                <rect width="200" height="120" fill="url(#bgGradient)" />
                <path
                  :d="`M 0,${120 - (market.outcomes[0].probability * 1.2)} ${chartPath}`"
                  fill="none"
                  stroke="#3a66f5"
                  stroke-width="2.5"
                  opacity="0.7"
                />
                <circle
                  :cx="200"
                  :cy="120 - (market.outcomes[0].probability * 1.2)"
                  r="4"
                  fill="#3a66f5"
                />
              </svg>
            </div>
            <div class="market-overview__header">
              <StatusBadge :intent="statusIntent">{{ market.state.toUpperCase() }}</StatusBadge>
              <span class="pill">{{ deadline }}</span>
            </div>
          </div>

          <div class="odds-grid">
            <div v-for="outcome in market.outcomes" :key="outcome.id" class="odds-card">
              <label>{{ outcome.label }}</label>
              <strong>{{ outcome.probability }}%</strong>
              <p>{{ outcome.price.toFixed(2) }} USDC</p>
            </div>
          </div>
        </article>

        <article class="card chart-card">
        <div class="card__title">
          <h2>Price history</h2>
          <span class="pill">24h</span>
        </div>
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

        <article class="card rationale">
          <h2>Market rationale</h2>
          <p>{{ market.aiRationale }}</p>
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

        <MarketSocial
          :social="market.social"
          class="social-card"
          @onBoost="onBoost"
          @onShare="shareMarket"
          @onReact="onReact"
        />
      </div>

      <!-- Right Sidebar: Stats & Info -->
      <aside class="detail-sidebar">
        <article class="card liquidity">
          <h3>Liquidity</h3>
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
        </article>

        <ProofTimeline
          class="proof-widget"
          :status="market.proofStatus.status"
          :proof-sla-minutes="market.proofSlaMinutes"
          :deadline-iso="market.timeline.resolutionDeadline"
          :submitted-at-iso="market.proofStatus.submittedAt"
          :proof-hash="market.proofStatus.proofHash"
          :verifier="market.proofStatus.verifier"
        />

        <article class="card economics">
          <h2>Fee breakdown</h2>
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
          <h2>Timeline</h2>
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
      </aside>
    </div>
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
import PageHeader from '@/components/PageHeader.vue';
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

const chartPath = computed(() => {
  if (!market.value) return '';
  const prob = market.value.outcomes[0].probability;
  const points = [
    `L 50,${120 - (prob * 0.8)}`,
    `L 100,${120 - (prob * 1.0)}`,
    `L 150,${120 - (prob * 1.1)}`,
    `L 200,${120 - (prob * 1.2)}`
  ];
  return points.join(' ');
});

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
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
  align-items: start;
}

.detail-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 1rem;
}

.market-overview {
  display: grid;
  gap: 1.5rem;
  overflow: hidden;
}

.market-overview__visual {
  position: relative;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.visual-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.visual-placeholder svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.market-overview__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem;
  margin: -1.5rem -1.5rem 0;
  background: linear-gradient(to bottom, rgba(255,255,255,0.95), transparent);
}

.odds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-top: -1rem;
}

.odds-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.odds-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-accent);
}

.odds-grid label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.odds-grid strong {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-accent) 0%, #5080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.odds-grid p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.liquidity {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.liquidity h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.liquidity__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.liquidity__grid > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.liquidity__grid span {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.liquidity__grid strong {
  font-size: 1.1rem;
}

.chart-card {
  display: grid;
  gap: 1rem;
}

.chart-container {
  width: 100%;
  height: 200px;
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
  display: grid;
  gap: 1rem;
}

.resolution h2 {
  margin: 0;
  font-size: 1.15rem;
}

.resolution__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.resolution__grid section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.resolution__grid h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.resolution__grid ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--color-text-secondary);
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
}

.resolution__grid p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.proof-widget {
  /* Inherits from ProofTimeline component */
}

.economics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.economics h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.economics__grid {
  display: grid;
  gap: 0.75rem;
}

.economics__grid > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.economics__grid span {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.economics__grid strong {
  font-size: 1.1rem;
}

.economics__grid p {
  margin: 0.2rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.timeline h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.timeline__grid {
  display: grid;
  gap: 0.75rem;
}

.timeline__grid > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeline__grid span {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.timeline__grid strong {
  font-size: 0.9rem;
}

.rationale {
  /* Inherits card styling */
}

.rationale h2 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
}

.rationale p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.social-card {
  /* Inherits from MarketSocial component */
}

.loading {
  padding: 4rem;
  text-align: center;
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .chart-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .odds-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .liquidity__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .odds-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 160px;
  }
}
</style>
