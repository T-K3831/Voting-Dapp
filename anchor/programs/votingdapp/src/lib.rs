#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod votingdapp {
  use super::*;

  pub fn initialize_poll(ctx: Context<InitializePoll>, 
                         poll_id:u64,
                         poll_description: String,
                         poll_start: u64,
                         poll_end: u64) -> Result<()> {
          let poll = &mut ctx.accounts.poll;
          poll.poll_id = poll_id;
          poll.poll_description = poll_description;
          poll.poll_start = poll_start;
          poll.poll_end = poll_end;
          poll.candidate_amount = 0;
          msg!("Poll initialized");
    Ok(())
  }

  pub fn initialize_candidate(ctx: Context<InitializeCandidate>, 
    candidate_name: String,
    poll_id:u64,
    ) -> Result<()> {
let candidate = &mut ctx.accounts.candidate;
let poll = &mut ctx.accounts.poll;
poll.candidate_amount += 1;
candidate.candidate_name = candidate_name;
candidate.candidate_votes = 0;
msg!("Candidate initialized");
Ok(())
}

  pub fn vote(ctx: Context<Vote>, candidate_name: String, _poll_id:u64)->Result<()>{
    let candidate = &mut ctx.accounts.candidate;
    candidate.candidate_votes += 1;
    Ok(())
  }


  // pub fn decrement(ctx: Context<Update>) -> Result<()> {
  //   ctx.accounts.votingdapp.count = ctx.accounts.votingdapp.count.checked_sub(1).unwrap();
  //   Ok(())
  // }
  // pub fn increment(ctx: Context<Update>) -> Result<()> {
  //   ctx.accounts.votingdapp.count = ctx.accounts.votingdapp.count.checked_add(1).unwrap();
  //   Ok(())
  // }

  /*
    use super::*;

  pub fn close(_ctx: Context<CloseVotingdapp>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.votingdapp.count = ctx.accounts.votingdapp.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.votingdapp.count = ctx.accounts.votingdapp.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeVotingdapp>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.votingdapp.count = value.clone();
    Ok(())
  }
  */
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct Vote<'info>{
  pub payer: Signer<'info>,
  #[account(
  seeds = [&poll_id.to_le_bytes()], // Use the poll_id as a seed
  bump,
  )]
  pub poll: Account<'info, Poll>,

  #[account(mut,
  seeds = [&poll_id.to_le_bytes(), candidate_name.as_bytes()], // Use the poll_id and candidate_name as a seed
  bump,
  )]
  pub candidate: Account<'info, Candidate>,
  
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)] // To pull the poll_id from the transaction
pub struct InitializeCandidate<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,
  #[account(mut,
  seeds = [&poll_id.to_le_bytes()], // Use the poll_id as a seed
  bump,
  )]
  pub poll: Account<'info, Poll>,

  #[account(
  init, // To create a new account/initialize it
  space = 8 + Candidate::INIT_SPACE,
  payer = payer,
  seeds = [&poll_id.to_le_bytes(), candidate_name.as_bytes()], // Use the poll_id and candidate_name as a seed
  bump,
  )]
  pub candidate: Account<'info, Candidate>,
  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)] // This macro will generate the `INIT_SPACE` constant for us. Automatically calculates the size of the struct.
pub struct Candidate {
  #[max_len(80)]
  pub candidate_name: String,
  pub candidate_votes: u64,
}

// The `InitializePoll` struct is used to define the accounts required for the `initialize_poll` function.
#[derive(Accounts)]
#[instruction(poll_id: u64)] // To pull the poll_id from the transaction
pub struct InitializePoll<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,
  #[account(
  init, // To create a new account/initialize it
  space = 8 + Poll::INIT_SPACE,
  payer = payer,
  seeds = [&poll_id.to_le_bytes()], // Use the poll_id as a seed
  bump,
  )]
  pub poll: Account<'info, Poll>,
  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)] // This macro will generate the `INIT_SPACE` constant for us. Automatically calculates the size of the struct.
pub struct Poll {
  pub poll_id: u64,
  #[max_len(200)]
  pub poll_description: String,
  pub poll_start: u64,
  pub poll_end: u64,
  pub candidate_amount: u64,
}
/*
#[derive(Accounts)]
pub struct InitializeVotingdapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Votingdapp::INIT_SPACE,
  payer = payer
  )]
  pub votingdapp: Account<'info, Votingdapp>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseVotingdapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub votingdapp: Account<'info, Votingdapp>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub votingdapp: Account<'info, Votingdapp>,
}

#[account]
#[derive(InitSpace)]
pub struct Votingdapp {
  count: u8,
}
*/