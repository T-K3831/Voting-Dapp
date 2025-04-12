import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Votingdapp } from '../target/types/votingdapp'
import { startAnchor} from 'solana-bankrun'
import { BankrunProvider} from 'anchor-bankrun'
const IDL = require('../target/idl/votingdapp.json')
//IDL : Interface to build/generate language specific format for calling smart contracts.
//Before running/implenting test, need to copy target/deploy/abc.so file to tests in fixtures folder(need to create it)
//So that test know what smart contract to use.
// Context + Provider allows to interact with the Smart Contract.

const votingAddress = new anchor.web3.PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");
describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  it('Initialize Poll', async () => {
    const context = await startAnchor("", [{name: "votingdapp", programId: votingAddress}], []);
	const provider = new BankrunProvider(context);
//Program Object
  const votingProgram = new Program<Votingdapp>(
		IDL,
		provider,
	)
   await votingProgram.methods
    .initializePoll(
      new anchor.BN(1),
      "Karachi vs Lahore",
      new anchor.BN(0),
      new anchor.BN(1844445454),
    ).rpc();

    const [pollAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        new anchor.BN(1).toArrayLike(Buffer, "le", 8),
      ],
      votingAddress
    );

    const pollAccount = await votingProgram.account.poll.fetch(pollAddress);
    console.log("Poll Account: ", pollAccount);

    expect(pollAccount.pollId.toString()).toEqual("1");
    expect(pollAccount.pollDescription).toEqual("Karachi vs Lahore");
    expect(pollAccount.pollStart.toNumber()).toBeLessThan(pollAccount.pollEnd.toNumber());
  })

})
