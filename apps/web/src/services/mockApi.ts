import dayjs from 'dayjs';
import type {
  MarketSummary,
  MarketDetail,
  DraftSummary,
  DraftDetail,
  ProofJob,
  CreatorMetric
} from '@/types';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

const mockMarkets: MarketDetail[] = Array.from({ length: 12 }).map((_, idx) => {
  const createdAt = dayjs().subtract(randomInt(1, 15), 'day');
  const resolutionDeadline = createdAt.add(randomInt(3, 20), 'day');
  const state = resolutionDeadline.isBefore(dayjs())
    ? 'resolved'
    : idx % 5 === 0
      ? 'locked'
      : 'active';

  const yesPrice = randomFloat(0.35, 0.65, 2);
  const noPrice = parseFloat((1 - yesPrice).toFixed(2));

  const history = Array.from({ length: 24 }).map((__, hIdx) => {
    const ts = resolutionDeadline.subtract(24 - hIdx, 'hour');
    const yes = parseFloat((yesPrice + randomFloat(-0.08, 0.08, 2)).toFixed(2));
    const no = parseFloat((1 - yes).toFixed(2));
    return {
      timestamp: ts.toISOString(),
      yesPrice: Math.min(Math.max(yes, 0.05), 0.95),
      noPrice: Math.min(Math.max(no, 0.05), 0.95),
      volume: randomInt(1000, 12000),
      liquidity: randomInt(30000, 150000)
    };
  });

  return {
    id: `market-${idx + 1}`,
    question: `Will headline event ${idx + 1} happen before ${resolutionDeadline.format('MMM D')}?`,
    summary:
      'Assistant-drafted clause citing Reuters, Bloomberg, and the official transcript for parity across sources.',
    state,
    category: ['Politics', idx % 2 === 0 ? 'US' : 'Global'],
    creator: idx % 3 === 0 ? '0xAI343' : '0xMentat',
    volume24h: randomInt(10000, 75000),
    totalVolume: randomInt(150000, 900000),
    openInterest: randomInt(25000, 100000),
    resolutionDeadline: resolutionDeadline.toISOString(),
    proofSlaMinutes: [30, 60, 120][idx % 3],
    oddsChange: randomFloat(-8, 12, 1),
    featured: idx < 3,
    outcomes: [
      {
        id: 'yes',
        label: 'YES',
        probability: parseFloat((yesPrice * 100).toFixed(1)),
        price: yesPrice
      },
      {
        id: 'no',
        label: 'NO',
        probability: parseFloat((noPrice * 100).toFixed(1)),
        price: noPrice
      }
    ],
    aiRationale:
      'Historical disputes show phrasing matters. This question scopes the event to the official FOMC press release, requiring the exact phrase “rate cut”.',
    resolutionCriteria: {
      primarySources: ['api.reuters.com/v2/articles', 'www.federalreserve.gov/releases'],
      triggerLogic:
        'Proof resolves YES if Reuters publishes an article containing the phrase "rate cut" attributed to the FOMC by the deadline.',
      fallbackLogic:
        'If Reuters unavailable, use Bloomberg API snapshot. If both fail, mark INVALID after 24h grace.',
      invalidationClause:
        'Resolve INVALID if official domain statement contradicts Reuters article within 24h of publication.'
    },
    feeBreakdown: {
      tradingFee: 2.0,
      creatorShare: 0.25,
      treasuryShare: 0.75,
      lpShare: 1.0,
      settlementFee: 0.5
    },
    timeline: {
      createdAt: createdAt.toISOString(),
      openAt: createdAt.add(2, 'hour').toISOString(),
      lockAt: resolutionDeadline.subtract(6, 'hour').toISOString(),
      resolutionDeadline: resolutionDeadline.toISOString(),
      disputeWindowHours: 24
    },
    liquidity: {
      poolSize: randomInt(35000, 120000),
      yesShares: randomInt(10000, 65000),
      noShares: randomInt(10000, 65000),
      apy: randomFloat(8, 28, 1)
    },
    proofStatus: {
      status: state === 'resolved' ? 'verified' : 'awaiting',
      submittedAt:
        state === 'resolved'
          ? resolutionDeadline.add(1, 'hour').toISOString()
          : undefined,
      proofHash: state === 'resolved' ? `0xproof${idx}` : undefined,
      verifier: state === 'resolved' ? 'proof.ops.sol' : undefined
    },
    priceHistory: history,
    social: {
      watchers: randomInt(120, 980),
      boosts: randomInt(10, 140),
      shares: randomInt(25, 320),
      comments: randomInt(6, 42),
      topBackers: ['MacroFund', 'MarketMakers', 'SignalDesk'].slice(0, randomInt(1, 3)),
      threads: [
        {
          id: `thread-${idx}-1`,
          author: 'AtreidesDAO',
          avatar: undefined,
          body: 'Reuters keyword looks clean. Watch for post-statement corrections though.',
          postedAt: dayjs().subtract(randomInt(1, 5), 'hour').toISOString(),
          reactions: randomInt(3, 25)
        },
        {
          id: `thread-${idx}-2`,
          author: 'FremenFlow',
          avatar: undefined,
          body: 'Liquidity bots flagged a spike, ape responsibly.',
          postedAt: dayjs().subtract(randomInt(6, 18), 'hour').toISOString(),
          reactions: randomInt(1, 12)
        }
      ]
    }
  };
});

const mockDrafts: DraftDetail[] = Array.from({ length: 6 }).map((_, idx) => {
  const createdAt = dayjs().subtract(randomInt(1, 5), 'day');
  const statusOptions: DraftDetail['status'][] = [
    'needs_review',
    'changes_requested',
    'approved'
  ];
  return {
    id: `draft-${idx + 1}`,
    topic: idx % 2 ? 'Macro' : 'Elections',
    sentiment: idx % 2 ? 'Neutral' : 'Bullish on policy shift',
    confidence: randomFloat(0.65, 0.92, 2),
    createdAt: createdAt.toISOString(),
    lastUpdated: createdAt.add(randomInt(1, 48), 'hour').toISOString(),
    status: statusOptions[idx % statusOptions.length],
    question: `Will policy update ${idx + 1} be announced before ${dayjs()
      .add(10 + idx, 'day')
      .format('MMM D')}?`,
    aiNotes:
      'Template v1.3. Sources cross-checked with past disputes to avoid ambiguity.',
    validationFindings: [
      'Resolution clause references exact press release wording.',
      'Timestamp window aligned with trading halt.',
      idx % 2 ? 'Needs fallback source for redundancy.' : 'Fallback source confirmed.'
    ],
    resolutionSuggestion:
      'Resolve YES if the official domain posts; otherwise NO at the stated deadline.',
    economics: {
      tradingFee: 2.0,
      creatorStake: 50,
      proofBounty: 175
    },
    tags: ['Politics', idx % 2 ? 'Regulation' : 'Elections', 'AI-generated'],
    timeline: {
      proposedOpen: dayjs().add(idx, 'day').toISOString(),
      resolutionDeadline: dayjs().add(10 + idx, 'day').toISOString()
    }
  };
});

const mockProofJobs: ProofJob[] = Array.from({ length: 5 }).map((_, idx) => ({
  marketId: `market-${idx + 1}`,
  question: mockMarkets[idx].question,
  deadline: dayjs().add(idx + 1, 'hour').toISOString(),
  bounty: 175,
  status: idx === 0 ? 'in_progress' : 'pending',
  source: mockMarkets[idx].resolutionCriteria.primarySources[0]
}));

const mockCreatorMetrics: CreatorMetric[] = [
  {
    title: 'Markets launched (30d)',
    value: '42',
    delta: 18,
    deltaLabel: 'vs. prior 30d'
  },
  {
    title: 'Approval rate',
    value: '76%',
    delta: 6,
    deltaLabel: 'higher than target'
  },
  {
    title: 'Avg resolution time',
    value: '42m',
    delta: -12,
    deltaLabel: 'vs. SLA'
  },
  {
    title: 'Fees earned',
    value: '9,450 USDC',
    delta: 22,
    deltaLabel: 'vs. last month'
  }
];

export function fetchFeaturedMarkets(): Promise<MarketSummary[]> {
  return Promise.resolve(mockMarkets.filter((market) => market.featured));
}

export function fetchActiveMarkets(): Promise<MarketSummary[]> {
  return Promise.resolve(
    mockMarkets.map((market) => ({
      ...market
    }))
  );
}

export function fetchMarketDetail(id: string): Promise<MarketDetail | undefined> {
  return Promise.resolve(mockMarkets.find((market) => market.id === id));
}

export function fetchDraftQueue(): Promise<DraftSummary[]> {
  return Promise.resolve(
    mockDrafts.map(
      ({ id, topic, sentiment, confidence, createdAt, lastUpdated, status }) => ({
        id,
        topic,
        sentiment,
        confidence,
        createdAt,
        lastUpdated,
        status
      })
    )
  );
}

export function fetchDraftDetail(id: string): Promise<DraftDetail | undefined> {
  return Promise.resolve(mockDrafts.find((draft) => draft.id === id));
}

export function fetchProofJobs(): Promise<ProofJob[]> {
  return Promise.resolve(mockProofJobs);
}

export function fetchCreatorMetrics(): Promise<CreatorMetric[]> {
  return Promise.resolve(mockCreatorMetrics);
}
