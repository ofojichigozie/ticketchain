# TicketChain Frontend

React + Vite frontend for TicketChain.

## What it does

- Displays events, tickets, and marketplace listings
- Connects user wallets through MetaMask
- Submits purchase and resale transactions
- Consumes the TicketChain backend API
- Reads smart contract addresses and network config from environment variables

## Repo

https://github.com/ofojichigozie/ticketchain

## Prerequisites

- Node.js 20+ or compatible
- npm
- Local or deployed backend API
- Deployed smart contract addresses

## Setup

```bash
cd ticketchain-frontend
npm install
```

Copy and configure environment variables:

```bash
cp .env.example .env
```

Update `.env` with:

- `VITE_API_BASE_URL` - backend API URL (example: `http://localhost:3000/api`)
- `VITE_NETWORK` and `VITE_CHAIN_ID` for the blockchain network
- `VITE_TICKET_NFT_ADDRESS` and `VITE_EVENT_FACTORY_ADDRESS`

## Run locally

```bash
npm run dev
```

Open the URL shown by Vite in your browser.

## Build

```bash
npm run build
```

## Notes

This frontend is designed to work with the TicketChain backend and on-chain smart contracts to offer a seamless ticket buying and resale experience while enforcing anti-scalping limits.
