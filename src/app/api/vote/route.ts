import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"
import { Connection, PublicKey, Transaction, TransactionResponse, VersionedTransaction, VoteProgram } from "@solana/web3.js";

const IDL = require("../../../../anchor/target/idl/votingdapp.json");
import { Votingdapp } from "../../../../anchor/target/types/votingdapp";

import { headers } from "next/headers";
import { AnchorError, Program, BN } from "@coral-xyz/anchor";
export const OPTIONS = optionsHandler;

async function optionsHandler(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      ...ACTIONS_CORS_HEADERS,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Max-Age": "86400", // 24 hours
      "Access-Control-Allow-Private": "true"
    },
  });
}

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const actionMetadata: ActionGetResponse = {
      icon: "https://www.india.com/wp-content/uploads/2016/02/kk-vs-lq.jpg", 
      title: "Who will win, Karachi or Lahore?",
      description: "Support your city by voting for it, and win a chance to get a free ticket to the PSL match.",
      label: "Vote Now",
      links: {
        actions : [
          {
            label: "Vote for Karachi",
            href: `${baseUrl}/api/vote?team=karachi`,
            type: "transaction"
          },
          {
            label: "Vote for Lahore",
            href: `${baseUrl}/api/vote?team=lahore`,
            type: "transaction"
          },
        ],  
      }
  };
  return Response.json(actionMetadata, {headers: {
    ...ACTIONS_CORS_HEADERS,
    "Access-Control-Allow-Origin": "*", // Allow all origins
  },});
}

export async function POST(request: Request) {
  if (request.method === "OPTIONS") {
    return optionsHandler(request);
  }
  const url = new URL(request.url);
  const team = url.searchParams.get("team");

  console.log("url and Team: ", team , url);

  if (team !== "karachi" && team !== "lahore") {
    return new Response("Invalid team", { status: 400, headers: {
      ...ACTIONS_CORS_HEADERS,
      "Access-Control-Allow-Origin": "*", // Allow all origins
    }, });
  }

  
  const body: ActionPostRequest = await request.json();

  if (!body.account) {
    return new Response("Missing account field in request body", {
      status: 400,
      headers: {
        ...ACTIONS_CORS_HEADERS,
        "Access-Control-Allow-Origin": "*", // Allow all origins
      },
    });
  }
  let vote;

  try {
    vote = new PublicKey(body.account);
  } catch (error) {
    console.error("Invalid PublicKey: ", error);
    return new Response("Invalid Account", { status: 400, headers: {
      ...ACTIONS_CORS_HEADERS,
      "Access-Control-Allow-Origin": "*", // Allow all origins
    }, });
  }

  try {
      const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  //const provider = { connection, publicKey: new PublicKey(IDL.metadata.address) };
  const program: Program<Votingdapp> = new Program(
    IDL,
    {connection}
  );
  console.log("Calling program.methods.vote with team: ", team);
  try {
    const instruction = await program.methods.vote(team, new BN(1))
  .accounts({
    payer: vote,
  }).instruction();

  const blockhash = await connection.getLatestBlockhash();
  console.log("Blockhash: ", blockhash);
  const transaction =  new Transaction({
    feePayer: vote,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);
  console.log("Transaction object: ", transaction);
  const response= await createPostResponse({
    fields:{
      type: "transaction",
      transaction: transaction,
    }
  });

  return Response.json(response, {headers: {
    ...ACTIONS_CORS_HEADERS,
    "Access-Control-Allow-Origin": "*", // Allow all origins
  },});
  } catch (error) {
    console.error("Error creating blockhash, instruction, transaction: ", error);
    return new Response(`Error creating blockhash, instruction, transaction:`, { 
      status: 500, 
      headers: {
        ...ACTIONS_CORS_HEADERS,
        "Access-Control-Allow-Origin": "*", // Allow all origins
      }, 
    });
  }
    
  } catch (error) {
    console.error("Error in transaction: ", error);
    return new Response(`Error creating transaction:`, { 
      status: 500, 
      headers: {
        ...ACTIONS_CORS_HEADERS,
        "Access-Control-Allow-Origin": "*", // Allow all origins
      }, 
    });
  }
}
