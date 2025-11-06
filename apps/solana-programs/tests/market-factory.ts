import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MarketFactory } from "../target/types/market_factory";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { assert } from "chai";

describe("Market Factory", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MarketFactory as Program<MarketFactory>;

  // Test accounts
  const creator = provider.wallet as anchor.Wallet;
  let marketId: anchor.BN;
  let marketPDA: PublicKey;
  let liquidityPoolPDA: PublicKey;
  let feeVaultPDA: PublicKey;
  let positionPDA: PublicKey;
  let lpPositionPDA: PublicKey;

  // Test data
  const questionText = "Will Bitcoin reach $100k by end of 2025?";
  const outcomes = ["Yes", "No"];
  const tradingFeeBps = 300; // 3%
  const initialLiquidity = new anchor.BN(10_000_000_000); // 10 SOL
  let resolutionDeadline: anchor.BN;

  before(async () => {
    // Set resolution deadline to 30 days from now
    const currentTime = Math.floor(Date.now() / 1000);
    resolutionDeadline = new anchor.BN(currentTime + 30 * 24 * 60 * 60);

    // Generate unique market ID
    marketId = new anchor.BN(Date.now());
  });

  describe("Initialize Market", () => {
    it("Creates a new prediction market", async () => {
      // Derive PDAs
      [marketPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), marketId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      [liquidityPoolPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), marketPDA.toBuffer()],
        program.programId
      );

      [feeVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("fee_vault"), marketPDA.toBuffer()],
        program.programId
      );

      // Initialize market
      const tx = await program.methods
        .initializeMarket(
          marketId,
          questionText,
          outcomes,
          tradingFeeBps,
          resolutionDeadline,
          initialLiquidity
        )
        .accounts({
          creator: creator.publicKey,
          market: marketPDA,
          liquidityPool: liquidityPoolPDA,
          feeVault: feeVaultPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Market initialized:", tx);

      // Verify market account
      const marketAccount = await program.account.marketAccount.fetch(marketPDA);
      assert.equal(marketAccount.marketId.toNumber(), marketId.toNumber());
      assert.equal(marketAccount.creator.toBase58(), creator.publicKey.toBase58());
      assert.equal(marketAccount.questionText, questionText);
      assert.equal(marketAccount.numOutcomes, outcomes.length);
      assert.equal(marketAccount.tradingFeeBps, tradingFeeBps);
      assert.equal(marketAccount.state.active !== undefined, true);

      // Verify liquidity pool
      const poolAccount = await program.account.liquidityPoolAccount.fetch(liquidityPoolPDA);
      assert.equal(poolAccount.market.toBase58(), marketPDA.toBase58());
      assert.equal(poolAccount.reserves.length, outcomes.length);
      assert.equal(poolAccount.lpTokenSupply.toNumber(), initialLiquidity.toNumber());
    });

    it("Rejects market with invalid parameters", async () => {
      const invalidMarketId = new anchor.BN(Date.now() + 1);
      const [invalidMarketPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("market"), invalidMarketId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [invalidPoolPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), invalidMarketPDA.toBuffer()],
        program.programId
      );

      const [invalidFeeVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("fee_vault"), invalidMarketPDA.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .initializeMarket(
            invalidMarketId,
            questionText,
            ["Only one outcome"], // Invalid: less than 2 outcomes
            tradingFeeBps,
            resolutionDeadline,
            initialLiquidity
          )
          .accounts({
            creator: creator.publicKey,
            market: invalidMarketPDA,
            liquidityPool: invalidPoolPDA,
            feeVault: invalidFeeVaultPDA,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        assert.fail("Should have thrown error for invalid outcomes");
      } catch (err) {
        assert.include(err.toString(), "InvalidNumberOfOutcomes");
      }
    });
  });

  describe("Add Liquidity", () => {
    it("Allows LP to add liquidity", async () => {
      const liquidityAmount = new anchor.BN(5_000_000_000); // 5 SOL

      [lpPositionPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("lp_position"),
          liquidityPoolPDA.toBuffer(),
          creator.publicKey.toBuffer(),
        ],
        program.programId
      );

      const poolBefore = await program.account.liquidityPoolAccount.fetch(liquidityPoolPDA);
      const supplyBefore = poolBefore.lpTokenSupply;

      const tx = await program.methods
        .addLiquidity(liquidityAmount)
        .accounts({
          provider: creator.publicKey,
          market: marketPDA,
          liquidityPool: liquidityPoolPDA,
          lpPosition: lpPositionPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Liquidity added:", tx);

      // Verify pool supply increased
      const poolAfter = await program.account.liquidityPoolAccount.fetch(liquidityPoolPDA);
      assert(poolAfter.lpTokenSupply.gt(supplyBefore));

      // Verify LP position created
      const lpPosition = await program.account.lpPositionAccount.fetch(lpPositionPDA);
      assert.equal(lpPosition.owner.toBase58(), creator.publicKey.toBase58());
      assert(lpPosition.lpTokens.gt(new anchor.BN(0)));
    });

    it("Rejects liquidity below minimum", async () => {
      const tooSmallAmount = new anchor.BN(100); // Too small

      try {
        await program.methods
          .addLiquidity(tooSmallAmount)
          .accounts({
            provider: creator.publicKey,
            market: marketPDA,
            liquidityPool: liquidityPoolPDA,
            lpPosition: lpPositionPDA,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        assert.fail("Should have thrown error for insufficient liquidity");
      } catch (err) {
        assert.include(err.toString(), "InsufficientLiquidity");
      }
    });
  });

  describe("Execute Trade", () => {
    const trader = Keypair.generate();

    before(async () => {
      // Airdrop SOL to trader
      const signature = await provider.connection.requestAirdrop(
        trader.publicKey,
        10_000_000_000 // 10 SOL
      );
      await provider.connection.confirmTransaction(signature);
    });

    it("Executes a buy trade", async () => {
      [positionPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("position"),
          marketPDA.toBuffer(),
          trader.publicKey.toBuffer(),
        ],
        program.programId
      );

      const tradeAmount = new anchor.BN(1_000_000_000); // 1 SOL
      const outcomeIndex = 0; // Buy "Yes"
      const maxSlippageBps = 1000; // 10%

      const tx = await program.methods
        .executeTrade(outcomeIndex, tradeAmount, true, maxSlippageBps)
        .accounts({
          trader: trader.publicKey,
          market: marketPDA,
          liquidityPool: liquidityPoolPDA,
          feeVault: feeVaultPDA,
          position: positionPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([trader])
        .rpc();

      console.log("Buy trade executed:", tx);

      // Verify position created
      const position = await program.account.positionAccount.fetch(positionPDA);
      assert.equal(position.owner.toBase58(), trader.publicKey.toBase58());
      assert(position.shares[outcomeIndex].gt(new anchor.BN(0)));
      assert.equal(position.totalInvested.toNumber(), tradeAmount.toNumber());

      // Verify market stats updated
      const market = await program.account.marketAccount.fetch(marketPDA);
      assert.equal(market.totalTrades.toNumber(), 1);
      assert(market.totalVolume.gte(tradeAmount));
    });

    it("Executes a sell trade", async () => {
      // First, verify trader has shares to sell
      const positionBefore = await program.account.positionAccount.fetch(positionPDA);
      const sharesHeld = positionBefore.shares[0];
      assert(sharesHeld.gt(new anchor.BN(0)), "Trader should have shares from previous buy");

      const sellAmount = sharesHeld.div(new anchor.BN(2)); // Sell half
      const outcomeIndex = 0;
      const maxSlippageBps = 1000; // 10%

      const tx = await program.methods
        .executeTrade(outcomeIndex, sellAmount, false, maxSlippageBps)
        .accounts({
          trader: trader.publicKey,
          market: marketPDA,
          liquidityPool: liquidityPoolPDA,
          feeVault: feeVaultPDA,
          position: positionPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([trader])
        .rpc();

      console.log("Sell trade executed:", tx);

      // Verify shares decreased
      const positionAfter = await program.account.positionAccount.fetch(positionPDA);
      assert(positionAfter.shares[0].lt(sharesHeld));
    });

    it("Rejects trade with zero amount", async () => {
      try {
        await program.methods
          .executeTrade(0, new anchor.BN(0), true, 1000)
          .accounts({
            trader: trader.publicKey,
            market: marketPDA,
            liquidityPool: liquidityPoolPDA,
            feeVault: feeVaultPDA,
            position: positionPDA,
            systemProgram: SystemProgram.programId,
          })
          .signers([trader])
          .rpc();

        assert.fail("Should have thrown error for zero amount");
      } catch (err) {
        assert.include(err.toString(), "InvalidAmount");
      }
    });

    it("Rejects trade with invalid outcome", async () => {
      try {
        await program.methods
          .executeTrade(99, new anchor.BN(1_000_000), true, 1000)
          .accounts({
            trader: trader.publicKey,
            market: marketPDA,
            liquidityPool: liquidityPoolPDA,
            feeVault: feeVaultPDA,
            position: positionPDA,
            systemProgram: SystemProgram.programId,
          })
          .signers([trader])
          .rpc();

        assert.fail("Should have thrown error for invalid outcome");
      } catch (err) {
        assert.include(err.toString(), "InvalidOutcomeIndex");
      }
    });
  });

  describe("Remove Liquidity", () => {
    it("Allows LP to remove liquidity", async () => {
      const lpPosition = await program.account.lpPositionAccount.fetch(lpPositionPDA);
      const lpTokensToRemove = lpPosition.lpTokens.div(new anchor.BN(4)); // Remove 25%

      const poolBefore = await program.account.liquidityPoolAccount.fetch(liquidityPoolPDA);
      const supplyBefore = poolBefore.lpTokenSupply;

      const tx = await program.methods
        .removeLiquidity(lpTokensToRemove)
        .accounts({
          provider: creator.publicKey,
          market: marketPDA,
          liquidityPool: liquidityPoolPDA,
          lpPosition: lpPositionPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Liquidity removed:", tx);

      // Verify pool supply decreased
      const poolAfter = await program.account.liquidityPoolAccount.fetch(liquidityPoolPDA);
      assert(poolAfter.lpTokenSupply.lt(supplyBefore));

      // Verify LP position updated
      const lpPositionAfter = await program.account.lpPositionAccount.fetch(lpPositionPDA);
      assert(lpPositionAfter.lpTokens.lt(lpPosition.lpTokens));
    });

    it("Rejects removing more LP tokens than owned", async () => {
      const lpPosition = await program.account.lpPositionAccount.fetch(lpPositionPDA);
      const tooManyTokens = lpPosition.lpTokens.mul(new anchor.BN(2)); // Try to remove 2x owned

      try {
        await program.methods
          .removeLiquidity(tooManyTokens)
          .accounts({
            provider: creator.publicKey,
            market: marketPDA,
            liquidityPool: liquidityPoolPDA,
            lpPosition: lpPositionPDA,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        assert.fail("Should have thrown error for insufficient LP tokens");
      } catch (err) {
        assert.include(err.toString(), "InvalidLPTokens");
      }
    });
  });

  describe("Update Market State", () => {
    it("Allows creator to freeze market", async () => {
      const tx = await program.methods
        .updateMarketState(2) // Frozen state
        .accounts({
          authority: creator.publicKey,
          market: marketPDA,
        })
        .rpc();

      console.log("Market frozen:", tx);

      const market = await program.account.marketAccount.fetch(marketPDA);
      assert.equal(market.state.frozen !== undefined, true);
    });

    it("Rejects state update from non-creator", async () => {
      const nonCreator = Keypair.generate();

      // Airdrop SOL to non-creator
      const signature = await provider.connection.requestAirdrop(
        nonCreator.publicKey,
        1_000_000_000
      );
      await provider.connection.confirmTransaction(signature);

      try {
        await program.methods
          .updateMarketState(1) // Try to activate
          .accounts({
            authority: nonCreator.publicKey,
            market: marketPDA,
          })
          .signers([nonCreator])
          .rpc();

        assert.fail("Should have thrown error for unauthorized");
      } catch (err) {
        assert.include(err.toString(), "Unauthorized");
      }
    });

    it("Allows creator to reactivate market", async () => {
      const tx = await program.methods
        .updateMarketState(1) // Active state
        .accounts({
          authority: creator.publicKey,
          market: marketPDA,
        })
        .rpc();

      console.log("Market reactivated:", tx);

      const market = await program.account.marketAccount.fetch(marketPDA);
      assert.equal(market.state.active !== undefined, true);
    });
  });

  describe("Close Market", () => {
    it("Rejects closing market that is not settled", async () => {
      try {
        await program.methods
          .closeMarket()
          .accounts({
            creator: creator.publicKey,
            market: marketPDA,
            liquidityPool: liquidityPoolPDA,
            feeVault: feeVaultPDA,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        assert.fail("Should have thrown error for market not settled");
      } catch (err) {
        assert.include(err.toString(), "MarketNotSettled");
      }
    });

    // Note: Full close market test would require resolving and settling the market first
    // This requires the Market Settlement program to be implemented
  });
});
