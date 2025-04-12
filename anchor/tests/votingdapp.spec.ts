import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Votingdapp } from '../target/types/votingdapp'
import { startAnchor} from 'solana-bankrun'
import { BankrunProvider} from 'anchor-bankrun'
import { utf8 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
const IDL = require('../target/idl/votingdapp.json')
//IDL : Interface to build/generate language specific format for calling smart contracts.
//Before running/implenting test, need to copy target/deploy/abc.so file to tests in fixtures folder(need to create it)
//So that test know what smart contract to use.
// Context + Provider allows to interact with the Smart Contract.

const votingAddress = new anchor.web3.PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");
describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  let context;
  let provider;
  let votingProgram: anchor.Program<Votingdapp>;
  beforeAll(async () => {
     context = await startAnchor("", [{name: "votingdapp", programId: votingAddress}], []);
	   provider = new BankrunProvider(context);
//Program Object
     votingProgram = new Program<Votingdapp>(
		IDL,
		provider,
	)
  });
  it('Initialize Poll', async () => {
    
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
  });

  it("Initialize Candidate", async () => {
    await votingProgram.methods
      .initializeCandidate(
        "Karachi",
        new anchor.BN(1),
      ).rpc();

    await votingProgram.methods
      .initializeCandidate(
        "Lahore",
        new anchor.BN(1),
      ).rpc();
      
      const [KarachiAddress] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          new anchor.BN(1).toArrayLike(Buffer, "le", 8),
          Buffer.from("Karachi"),
        ],
        votingAddress
      );
      const [LahoreAddress] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          new anchor.BN(1).toArrayLike(Buffer, "le", 8),
          Buffer.from("Lahore"),
        ],
        votingAddress
      );
      console.log("Karachi Address: ", KarachiAddress.toString());
      console.log("Lahore Address: ", LahoreAddress.toString());
      const KarachiCandidate = await votingProgram.account.candidate.fetch(KarachiAddress);
      const LahoreCandidate = await votingProgram.account.candidate.fetch(LahoreAddress);
      console.log("Karachi Candidate Account: ", KarachiCandidate);
      console.log("Lahore Candidate Account: ", LahoreCandidate);
      expect(KarachiCandidate.candidateName).toEqual("Karachi");
      expect(LahoreCandidate.candidateName).toEqual("Lahore");
      

  });

  it("Vote", async () => {
    await votingProgram.methods
    .vote(
      "Lahore",
        new anchor.BN(1),
    )
    .rpc();
    const [LahoreAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        new anchor.BN(1).toArrayLike(Buffer, "le", 8),
        Buffer.from("Lahore"),
      ],
      votingAddress
    );
    const LahoreCandidate = await votingProgram.account.candidate.fetch(LahoreAddress);
    console.log("Lahore : {}", LahoreCandidate);
    expect(LahoreCandidate.candidateVotes.toNumber()).toEqual(1);
  });

})
