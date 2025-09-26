# Quality Scoring Framework

## Overview

The Quality Scoring Framework ensures market quality while maintaining true permissionlessness. Markets below threshold are marked but never censored - users can still trade with full transparency about quality concerns.

## Core Quality Dimensions

### 1. Ambiguity Score (0-100)

**Purpose**: Measure resolution criteria clarity

#### Scoring Factors
- **Precision of Language**: Specific vs. vague terms
- **Measurable Outcomes**: Quantifiable vs. subjective criteria
- **Temporal Clarity**: Clear deadlines and time windows
- **Source Specificity**: Explicit zkTLS sources defined
- **Edge Case Handling**: Coverage of boundary conditions

#### Examples

**High Ambiguity (Score: 20)**
```
"Will the economy be better next year?"
Issues:
- "better" is subjective
- No specific metrics
- No zkTLS source
- Timeline unclear
```

**Medium Ambiguity (Score: 60)**
```
"Will Bitcoin price be above $50k on Dec 31, 2024?"
Issues:
- Price at what time on Dec 31?
- Which exchange/source?
Better: "Will CoinGecko API show BTC > $50k at 11:59 PM UTC on Dec 31, 2024?"
```

**Low Ambiguity (Score: 95)**
```
"Will Reuters publish headline containing exact phrase 'Federal Reserve raises rates' before March 1, 2024 11:59 PM UTC?"
Strengths:
- Exact phrase specified
- Clear source (Reuters)
- Precise deadline
- zkTLS verifiable
```

### 2. Relevance Score (0-100)

**Purpose**: Measure market importance and interest potential

#### Scoring Factors
- **Topic Popularity**: Trending keywords, search volume
- **Stakeholder Impact**: Number of people affected
- **Media Coverage**: Existing news coverage
- **Financial Significance**: Economic implications
- **Time Sensitivity**: Urgency of resolution

#### Relevance Categories

| Category | Examples | Base Score |
|----------|----------|------------|
| Global Events | Elections, wars, economic policy | 80-100 |
| Financial Markets | Stock prices, crypto, commodities | 70-90 |
| Technology | Product launches, AI breakthroughs | 60-80 |
| Sports | Major leagues, championships | 50-70 |
| Entertainment | Awards, celebrity news | 30-50 |
| Local/Niche | Community events, obscure topics | 10-30 |

#### Dynamic Adjustments
- **Trending Boost**: +20 points for trending topics
- **Recency Penalty**: -10 points for outdated events
- **Duplicate Penalty**: -30 points for similar existing markets
- **Seasonal Boost**: +10 points for timely events

### 3. Intent Score (0-100)

**Purpose**: Detect malicious, spam, or manipulative markets

#### Red Flags (Negative Scoring)
- **Assassination Markets**: -100 (automatic rejection)
- **Illegal Activity**: -100 (automatic rejection)
- **Market Manipulation**: Markets designed to be gamed
- **Spam Patterns**: Repetitive, low-effort markets
- **Offensive Content**: Harassment, discrimination
- **Copyright Issues**: Using protected content inappropriately

#### Spam Detection
```
Spam Indicators:
├── Repetitive Markets (same creator, similar topics)
├── Low-Effort Templates ("Will X happen?")
├── Gibberish Text (random characters, nonsense)
├── Excessive Markets (>10 per hour from same creator)
└── Bot-like Patterns (identical timing, format)
```

#### Intent Classification

| Intent Type | Score Range | Action |
|-------------|-------------|---------|
| Educational/Informative | 80-100 | Promote |
| Entertainment | 60-79 | Standard |
| Commercial | 40-59 | Mark as commercial |
| Spam/Low Quality | 20-39 | Mark as spam |
| Malicious | 0-19 | Strong warning |
| Illegal | -100 | Block (only exception to permissionless) |

### 4. Source Reliability (0-100)

**Purpose**: Evaluate zkTLS source quality and availability

#### Source Tier Classification

**Tier 1 (90-100 points): Premium Sources**
- Reuters, AP, Bloomberg, BBC
- Government APIs (SEC, Federal Reserve)
- Major exchange APIs (Coinbase, Binance)
- Established data providers

**Tier 2 (70-89 points): Reliable Sources**
- Major newspapers (NYT, WSJ, Guardian)
- Corporate websites (press releases)
- Verified social media accounts
- Industry-specific sources

**Tier 3 (50-69 points): Standard Sources**
- General news sites
- Public APIs
- Social media platforms
- Community sources

**Tier 4 (30-49 points): Questionable Sources**
- Blogs, personal websites
- Unverified social accounts
- New/unknown sources
- Historically unreliable

**Tier 5 (0-29 points): Poor Sources**
- Known misinformation sources
- Frequently hacked sites
- Temporary/unstable sources
- Single-source claims

#### Technical Reliability Factors
- **zkTLS Compatibility**: Source works with proof systems
- **Historical Uptime**: Source availability track record
- **Data Consistency**: Source provides stable data format
- **Update Frequency**: How often source updates
- **Correction Policy**: How source handles errors

### 5. Uniqueness Score (0-100)

**Purpose**: Prevent duplicate and overly similar markets

#### Similarity Detection
- **Exact Duplicates**: 0 points (identical markets)
- **Near Duplicates**: 10-30 points (very similar)
- **Related Markets**: 50-70 points (same topic, different angle)
- **Novel Markets**: 80-100 points (unique concept)

#### Deduplication Algorithm
```python
def calculate_similarity(new_market, existing_markets):
    for market in existing_markets:
        # Text similarity (embeddings)
        text_sim = cosine_similarity(new_market.embedding, market.embedding)

        # Source overlap
        source_overlap = len(new_market.sources & market.sources) / len(new_market.sources | market.sources)

        # Timeline overlap
        time_overlap = calculate_time_overlap(new_market.deadline, market.deadline)

        combined_similarity = (text_sim * 0.5) + (source_overlap * 0.3) + (time_overlap * 0.2)

        if combined_similarity > 0.8:
            return 0  # Duplicate
        elif combined_similarity > 0.6:
            return 30  # Very similar

    return 100  # Unique
```

## Composite Quality Score

### Weighted Scoring Formula

```
Quality Score = (
    Ambiguity * 0.30 +
    Relevance * 0.25 +
    Intent * 0.25 +
    Source_Reliability * 0.15 +
    Uniqueness * 0.05
)
```

### Quality Thresholds

| Score Range | Classification | Market Status | UI Treatment |
|-------------|---------------|---------------|--------------|
| 80-100 | Excellent | Featured | Green badge, promoted |
| 60-79 | Good | Standard | No special marking |
| 40-59 | Fair | Marked | Yellow badge, "Fair Quality" |
| 20-39 | Poor | Marked | Orange badge, "Low Quality" |
| 0-19 | Very Poor | Marked | Red badge, "Very Low Quality" |

### Dynamic Adjustments

#### Boost Conditions (+10 to +20 points)
- First market in new category
- High initial trading volume
- Community upvotes
- Creator with high reputation
- Timely/breaking news topic

#### Penalty Conditions (-5 to -15 points)
- Creator with poor track record
- Market lacks trading volume after 24h
- Community flags/complaints
- Source reliability issues discovered
- Resolution disputes on creator's past markets

## Configuration Management

### Governance Parameters

All scoring weights and thresholds are configurable via governance:

```json
{
  "weights": {
    "ambiguity": 0.30,
    "relevance": 0.25,
    "intent": 0.25,
    "source_reliability": 0.15,
    "uniqueness": 0.05
  },
  "thresholds": {
    "excellent": 80,
    "good": 60,
    "fair": 40,
    "poor": 20
  },
  "boosts": {
    "trending_topic": 20,
    "first_in_category": 15,
    "high_volume": 10
  },
  "penalties": {
    "duplicate_similar": -30,
    "poor_creator_history": -15,
    "low_volume": -10
  }
}
```

### A/B Testing Framework

Different user segments can see different scoring configurations:

- **Conservative**: Higher quality thresholds, stricter filtering
- **Standard**: Default configuration
- **Experimental**: Lower thresholds, more permissive

## Quality Monitoring

### Real-Time Quality Tracking

```
Quality Metrics Dashboard:
├── Average Quality Score by Time
├── Distribution of Markets by Quality Band
├── Creator Quality Score Trends
├── Source Reliability Changes
└── Community Feedback Integration
```

### Quality Improvement Feedback Loop

1. **Market Performance Tracking**: Monitor which quality scores correlate with trading success
2. **User Feedback**: Allow traders to rate market quality
3. **Resolution Analysis**: Track which markets have resolution disputes
4. **Model Updates**: Retrain quality models based on performance data
5. **Parameter Tuning**: Adjust weights and thresholds based on outcomes

## Edge Cases & Special Handling

### Breaking News Markets
- **Fast-Track Scoring**: Reduced validation time for urgent markets
- **Relevance Boost**: Extra points for breaking news topics
- **Source Flexibility**: Accept lower-tier sources if they're first to report

### Seasonal/Event-Driven Markets
- **Context Awareness**: Adjust relevance for seasonal topics (elections, sports)
- **Batch Validation**: Efficient processing of many similar markets
- **Duplicate Tolerance**: Allow more similar markets during major events

### Cross-Language Markets
- **Translation Quality**: Score quality of translation accuracy
- **Source Diversity**: Encourage markets with sources in multiple languages
- **Cultural Relevance**: Adjust relevance scores for regional topics

### Technical Failure Scenarios
- **Source Downtime**: Graceful degradation when sources unavailable
- **zkTLS Issues**: Alternative scoring when proof generation fails
- **AI Model Issues**: Fallback to simpler heuristics if ML models fail

## Implementation Notes

### Performance Optimization
- **Caching**: Cache quality scores for similar market patterns
- **Batch Processing**: Score multiple markets together for efficiency
- **Incremental Updates**: Only recalculate changed components
- **Parallel Processing**: Score different dimensions simultaneously

### Privacy Considerations
- **Data Minimization**: Only collect necessary data for scoring
- **User Consent**: Clear consent for quality improvement data collection
- **Anonymization**: Remove PII from quality scoring datasets
- **Right to Deletion**: Allow creators to request scoring data deletion