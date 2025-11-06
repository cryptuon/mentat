use anchor_lang::prelude::*;

use crate::errors::MarketError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
pub struct UpdateMarketState<'info> {
    /// Market creator or authorized admin
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Market account
    #[account(
        mut,
        constraint = market.creator == authority.key() @ MarketError::Unauthorized,
    )]
    pub market: Account<'info, MarketAccount>,
}

pub fn handler(ctx: Context<UpdateMarketState>, new_state: u8) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let current_state = market.state.clone();

    // Parse new state
    let new_market_state = match new_state {
        0 => MarketState::Initializing,
        1 => MarketState::Active,
        2 => MarketState::Frozen,
        3 => MarketState::Resolved,
        4 => MarketState::Settled,
        5 => MarketState::Closed,
        6 => MarketState::Disputed,
        _ => return Err(MarketError::InvalidStateTransition.into()),
    };

    // Validate state transitions
    let is_valid_transition = match (current_state, new_market_state.clone()) {
        // From Initializing
        (MarketState::Initializing, MarketState::Active) => true,
        (MarketState::Initializing, MarketState::Closed) => true,

        // From Active
        (MarketState::Active, MarketState::Frozen) => true,
        (MarketState::Active, MarketState::Resolved) => {
            // Can only resolve after deadline
            Clock::get()?.unix_timestamp >= market.resolution_deadline
        }
        (MarketState::Active, MarketState::Closed) => true,

        // From Frozen
        (MarketState::Frozen, MarketState::Active) => true,
        (MarketState::Frozen, MarketState::Resolved) => {
            Clock::get()?.unix_timestamp >= market.resolution_deadline
        }
        (MarketState::Frozen, MarketState::Closed) => true,

        // From Resolved
        (MarketState::Resolved, MarketState::Settled) => {
            // Can only settle if winning outcome is set
            market.winning_outcome < 255
        }
        (MarketState::Resolved, MarketState::Disputed) => true,

        // From Disputed
        (MarketState::Disputed, MarketState::Resolved) => true,
        (MarketState::Disputed, MarketState::Settled) => {
            market.winning_outcome < 255
        }

        // From Settled
        (MarketState::Settled, MarketState::Closed) => true,

        // Invalid transitions
        _ => false,
    };

    require!(is_valid_transition, MarketError::InvalidStateTransition);

    // Update state
    let old_state = market.state.clone();
    market.state = new_market_state;

    // Update timestamp if resolved
    if market.state == MarketState::Resolved && market.resolved_at == 0 {
        market.resolved_at = Clock::get()?.unix_timestamp;
    }

    emit!(MarketStateChanged {
        market: market.key(),
        old_state: format!("{:?}", old_state),
        new_state: format!("{:?}", market.state),
        authority: ctx.accounts.authority.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "Market state updated from {:?} to {:?}",
        old_state,
        market.state
    );

    Ok(())
}
