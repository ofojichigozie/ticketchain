# TicketChain

A decentralized event ticketing platform with an anti-scalping mechanism.

TicketChain uses blockchain NFTs, a NestJS backend, and a React/Vite frontend to deliver secure event ticket sales, managed resale pricing, and transparent ownership.

GitHub: https://github.com/ofojichigozie/ticketchain

## What is TicketChain?

TicketChain mints every ticket as a unique ERC-721 NFT and enforces resale limits on-chain. Organizers define event supply, base price, resale caps, and wallet purchase limits. The smart contracts prevent scalpers from selling tickets above the allowed resale price, while the backend and frontend provide user-friendly event browsing, purchases, and secondary market listings.

## Key Features

- NFT ticket minting with on-chain ownership
- Anti-scalping resale cap enforced by smart contract logic
- Frontend wallet integration with MetaMask
- Backend user and event management with NestJS and PostgreSQL
- Secondary ticket marketplace with controlled resale pricing
- Local and testnet deployment support via Hardhat

## Repository Layout

- `ticketchain-backend/` - NestJS REST API service
- `ticketchain-frontend/` - React + Vite user interface
- `ticketchain-smart-contract/` - Hardhat smart contract package

## Clone and Open

```bash
git clone https://github.com/ofojichigozie/ticketchain.git
cd ticketchain
```

## Setup Overview

1. Install each package:
   - `cd ticketchain-backend && npm install`
   - `cd ticketchain-frontend && npm install`
   - `cd ticketchain-smart-contract && npm install`

2. Configure environment variables in each package using the existing `.env*` files.
3. Start a local blockchain, deploy contracts, run the backend API, and open the frontend.

## Packages

### `ticketchain-backend`

NestJS API for authentication, events, tickets, marketplace listings, and read-only blockchain verification.

### `ticketchain-frontend`

React frontend with wallet login, event browsing, ticket purchasing, and resale flows.

### `ticketchain-smart-contract`

Hardhat contracts for event creation, ticket minting, and anti-scalping resale enforcement.

## Recommended Workflow

1. Start a local blockchain with Hardhat in `ticketchain-smart-contract`
2. Deploy contracts and update frontend environment settings
3. Run the backend API and open the frontend app

## Notes

This repository is organized as a monorepo-style project with separate package folders for backend, frontend, and smart contracts. Each package contains its own README with more detailed setup steps.
