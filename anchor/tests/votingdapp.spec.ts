import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Votingdapp } from '../target/types/votingdapp'

describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  it('Initialize Votingdapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        votingdapp: votingdappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([votingdappKeypair])
      .rpc()

    const currentCount = await program.account.votingdapp.fetch(votingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

})
