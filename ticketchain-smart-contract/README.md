# TicketChain Smart Contracts

Hardhat package for TicketChain smart contracts.

## What it does

- Deploys `TicketNFT` and `EventFactory` contracts
- Enforces anti-scalping rules on resale price
- Mints NFT tickets with metadata for event and resale cap
- Supports local deployment on Hardhat or testnet deployment

## Repo

https://github.com/ofojichigozie/ticketchain

## Prerequisites

- Node.js 20+ or compatible
- npm
- Hardhat and dependencies installed
- `.env` configured for network RPC keys if needed

## Setup

```bash
cd ticketchain-smart-contract
npm install
```

Copy the environment template:

```bash
cp .env.example .env
```

Update `.env` if deploying to BSC testnet or other network RPC endpoints.

## Run locally

Start a local Hardhat node:

```bash
npm run node
```

Compile contracts:

```bash
npm run compile
```

Run tests:

```bash
npm run test
```

Deploy locally:

```bash
npm run deploy:local
```

## Anti-Scalping Behavior

`EventFactory` stores a per-event `maxResaleMultiplierBps` value. When a ticket is purchased, `maxResalePrice` is calculated and stored in the NFT.

The backend also prevents resellers from listing a ticket above the allowed resale price, while the contract serves as the blockchain enforcement layer.

`TicketNFT.buyResaleTicket(...)` reverts if the resale price exceeds `maxResalePrice`, so the blockchain enforces the cap even if an off-chain check is bypassed.

## Notes

The smart contract package is the on-chain foundation of the TicketChain system. Use it to deploy contracts before connecting the backend and frontend.
