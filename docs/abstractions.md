# Core Abstractions

## Overview

These are the fundamental building blocks that guide all implementation decisions. Every feature, UI component, smart contract, and AI agent should align with these abstractions.

## 1. The Prediction Prompt

**What It Is**: The atomic unit of user intent - a natural language statement about the future.

**Properties**:
```typescript
type PredictionPrompt = {
  text: string;                    // "Elon will tweet about Mars this week"
  context?: {                      // Optional context for AI
    urgency: "breaking" | "casual";
    scope: "global" | "local";
    expertise: "expert" | "fun";
  };
  creator: UserId;
  timestamp: Date;
}
```

**Key Insight**: Everything starts from natural language. No complex forms, no technical parameters - just "What do you think will happen?"

**Implementation Guidelines**:
- Accept any text as valid input
- AI handles all technical translation
- Support voice input and casual language
- Enable bulk prompts (paste a list of predictions)

**Examples**:
- "Trump wins 2024" → AI creates election market with proper sources
- "Bitcoin 100k by Christmas" → AI maps to price APIs with date logic
- "It'll rain tomorrow in NYC" → AI finds weather sources with location

## 2. The Market Social Object

**What It Is**: A market isn't just a financial instrument - it's a social conversation piece with embedded prediction mechanics.

**Structure**:
```typescript
type MarketSocialObject = {
  // Core prediction
  question: string;
  outcomes: Outcome[];
  resolution: ResolutionCriteria;

  // Social layer
  creator: UserProfile;
  community: {
    comments: Comment[];
    reactions: Reaction[];
    shares: Share[];
    bookmarks: Bookmark[];
  };

  // Engagement metrics
  metrics: {
    views: number;
    traders: number;
    volume: number;
    social_score: number;    // Combines all social signals
  };

  // Visual identity
  preview: {
    title: string;
    image: string;          // AI-generated or template
    description: string;
    tags: string[];
  };
}
```

**Key Behaviors**:
- **Shareable by Default**: Every market has beautiful preview cards
- **Comment-Driven**: Discussion happens directly on the market
- **Creator-Owned**: Original creator gets social credit and ongoing revenue
- **Community Events**: Resolution becomes a social moment

**Social Features**:
- Creator can "pin" their reasoning
- Top traders get highlighted
- Community can react to outcomes
- Markets can be "remixed" (create related markets)

## 3. The User Prediction Identity

**What It Is**: Your public reputation and social identity based on prediction history.

**Components**:
```typescript
type UserPredictionIdentity = {
  profile: {
    username: string;
    avatar: string;
    bio: string;
    joined: Date;
  };

  reputation: {
    prediction_score: number;     // Overall accuracy
    creation_score: number;       // Quality of markets created
    social_score: number;         // Community engagement
    expertise: ExpertiseArea[];   // "Politics", "Crypto", "Sports"
  };

  achievements: {
    badges: Badge[];              // "Nostradamus", "Market Maker"
    streaks: Streak[];            // "5 correct in a row"
    firsts: First[];              // "First to predict X"
  };

  social: {
    followers: UserId[];
    following: UserId[];
    groups: GroupId[];            // Communities joined
  };

  activity: {
    markets_created: MarketId[];
    positions: Position[];
    recent_activity: Activity[];
  };
}
```

**Key Features**:
- **Public by Default**: All prediction history visible (unless user opts out)
- **Expertise Detection**: AI identifies what you're good at predicting
- **Social Proof**: Others can see your track record before following
- **Progressive Status**: Unlock features as you build reputation

**Privacy Balance**:
- Position sizes can be hidden
- Prediction reasoning can be private until resolution
- Users control visibility of different identity aspects

## 4. The AI Creative Partner

**What It Is**: AI that makes users feel smart by handling technical complexity while amplifying their creative intent.

**Interaction Model**:
```typescript
type AIPartner = {
  capabilities: {
    understand: (prompt: string) => MarketConcept;
    suggest: (concept: MarketConcept) => MarketSuggestion[];
    create: (choice: MarketSuggestion) => Market;
    monitor: (market: Market) => ResolutionWatch;
  };

  personality: {
    tone: "helpful" | "enthusiastic" | "expert";
    confidence: number;           // How sure AI is about suggestions
    creativity: number;           // How novel vs safe suggestions are
  };

  memory: {
    user_preferences: UserPrefs;  // Learns what kinds of markets user likes
    past_interactions: History;   // Remembers previous conversations
    success_patterns: Patterns;   // What worked well before
  };
}
```

**Conversation Flow**:
```
User: "I think Tesla stock will do something crazy this month"

AI: "I can create a few different markets from that:

     🚗 'Will TSLA move >20% in either direction by Feb 28?'
        └ Most popular format, usually gets 200+ traders

     📈 'Will TSLA hit $250 before Feb 28?'
        └ You seem bullish - this has better odds

     🎯 'Will TSLA announce something major by Feb 28?'
        └ Focuses on news events, easier to resolve

     Which direction feels right?"

User: "Make it about announcements"

AI: "Perfect! Creating: 'Will Tesla announce new product/partnership by Feb 28?'
     - Sources: Tesla press releases, SEC filings, Elon's Twitter
     - Similar markets averaged $15k volume
     - You'll earn 1% of all trading fees

     Market is live! 🎉"
```

**Key Principles**:
- **Co-creation, Not Automation**: User maintains creative control
- **Smart Defaults**: AI picks the most likely successful parameters
- **Learning Loop**: Gets better by observing what works for each user
- **Transparent Reasoning**: Always explains why it suggests certain options

## 5. The Quality Signal System

**What It Is**: A way to surface the best markets without gatekeeping, using quality as a discovery tool rather than a filter.

**Signal Types**:
```typescript
type QualitySignals = {
  algorithmic: {
    clarity_score: number;        // How clear is the resolution?
    source_reliability: number;   // How good are the zkTLS sources?
    uniqueness: number;           // Is this a duplicate?
    timeliness: number;           // Is this timely/relevant?
  };

  social: {
    creator_reputation: number;   // Track record of creator
    community_interest: number;   // Early trading activity
    expert_validation: number;    // Domain experts' opinions
    viral_potential: number;      // Social sharing activity
  };

  economic: {
    trading_activity: number;     // Volume and trader count
    position_diversity: number;   // Not just one-sided
    stake_amount: number;         // Creator skin in the game
    fee_earnings: number;         // Successful market metric
  };
}
```

**Discovery Algorithm**:
```
Market Ranking = (
  Quality Score * 0.4 +
  Social Score * 0.3 +
  Recency Score * 0.2 +
  Personal Relevance * 0.1
)
```

**User Controls**:
- **Quality Filter Slider**: "Show me only high-quality markets"
- **Discovery Preferences**: "I want to see experimental markets"
- **Creator Following**: "Show me markets from creators I follow"
- **Topic Interests**: "More crypto, less politics"

**Key Insight**: Quality isn't binary - it's a spectrum that helps users find what they want.

## 6. The Social Feed Architecture

**What It Is**: The primary discovery interface that combines social signals with algorithmic curation.

**Feed Types**:
```typescript
type FeedTypes = {
  "For You": AlgorithmicFeed;     // Personalized recommendations
  "Following": SocialFeed;        // People you follow
  "Trending": TrendingFeed;       // Popular right now
  "New": ChronologicalFeed;       // Recently created
  "Resolving": ResolutionFeed;    // About to resolve
  "Local": GeographicFeed;        // Location-relevant
}
```

**Content Mix Strategy**:
```
Feed Content = [
  40% Markets you might trade (high personal relevance)
  20% Markets from people you follow
  20% Trending/viral markets
  10% Educational/high-quality markets
  10% Serendipitous discovery
]
```

**Engagement Patterns**:
- **Scroll to Discover**: TikTok-style infinite scroll
- **Quick Actions**: Swipe gestures for trade/bookmark/share
- **Social Context**: "3 people you follow are trading this"
- **Smart Notifications**: "Market you're watching is about to resolve"

## 7. The Economic Game Loop

**What It Is**: The progression system that makes economic participation feel like leveling up in a game.

**Progression Stages**:
```typescript
type GameProgression = {
  stages: {
    "Novice": {
      features: ["Basic binary markets", "Follow suggestions"];
      limits: { max_stake: 100, markets_per_day: 5 };
      rewards: ["Welcome bonus", "First trade bonus"];
    };

    "Trader": {
      features: ["Multi-outcome markets", "Advanced charts"];
      limits: { max_stake: 1000, markets_per_day: 20 };
      rewards: ["Accuracy streaks", "Volume bonuses"];
    };

    "Creator": {
      features: ["Market creation", "Quality analytics"];
      limits: { max_stake: 10000, markets_per_day: 50 };
      rewards: ["Creator fees", "Quality bonuses"];
    };

    "Expert": {
      features: ["Advanced markets", "AI training data"];
      limits: "unlimited";
      rewards: ["Expert badges", "Platform governance"];
    };
  }
}
```

**Reward Mechanics**:
- **Immediate**: Dopamine hits for successful trades
- **Short-term**: Daily/weekly achievements and streaks
- **Medium-term**: Monthly leaderboards and contests
- **Long-term**: Reputation building and status advancement

**Social Competition**:
- **Leaderboards**: Various categories (accuracy, volume, creativity)
- **Challenges**: "Predict 5 sports outcomes this week"
- **Tournaments**: Seasonal prediction competitions
- **Collaborative**: Group predictions and shared outcomes

## Implementation Guidelines

### For Frontend Teams
- Every component should map to one of these abstractions
- User flows should follow the natural progression through abstractions
- Social features are first-class citizens, not add-ons

### For Backend Teams
- API design should expose these abstractions cleanly
- Database schemas should reflect these object structures
- Performance optimization should prioritize social feed speed

### For AI Teams
- AI models should understand and work within these abstractions
- Training data should reflect the quality signals system
- AI personality should align with the creative partner model

### For Smart Contract Teams
- On-chain state should store the essential elements of each abstraction
- Economic mechanisms should support the game loop progression
- Settlement logic should preserve social context

## Success Criteria

**These Abstractions Are Working When**:
- New features naturally fit into existing abstractions
- User behavior matches the intended interaction patterns
- Technical teams can work independently while maintaining coherence
- Community feedback aligns with the social object design
- Economic metrics follow the game loop progression

**Red Flags That Indicate Abstraction Issues**:
- Features feel "bolted on" rather than integrated
- User confusion about how things work
- Technical debt from misaligned implementations
- Social features that nobody uses
- Economic incentives that create perverse behaviors