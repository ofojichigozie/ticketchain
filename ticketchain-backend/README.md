# TicketChain Backend

NestJS API server for the TicketChain decentralized ticketing platform.

## What it does

- Handles wallet-based authentication and JWT sessions
- Manages users, events, tickets, marketplace listings, and transactions
- Uses PostgreSQL via Drizzle ORM for off-chain state and metadata
- Verifies blockchain state in read-only mode with Ethers.js
- Acts as the API layer between the frontend and smart contracts

## Repo

https://github.com/ofojichigozie/ticketchain

## Prerequisites

- Node.js 20+ or compatible
- npm
- PostgreSQL database
- `.env` variables configured

## Setup

```bash
cd ticketchain-backend
npm install
```

Copy the environment templates and configure values:

```bash
cp .env.example .env
```

Update `.env` with your database connection and any required service settings.

## Run locally

```bash
npm run start:dev
```

The backend runs on `http://localhost:3000` by default.

## Database commands

- `npm run db:generate` - generate Drizzle schema files
- `npm run db:migrate` - run database migrations
- `npm run db:reset` - reset and seed the local development database
- `npm run db:studio` - start Drizzle Studio
- `npm run db:seed` - seed initial data

## Notes

The backend expects the frontend to call the API at `/api` and relies on a deployed or local smart contract instance for ticket verification and on-chain reads.
