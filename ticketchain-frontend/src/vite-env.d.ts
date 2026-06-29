/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_EVENT_FACTORY_ADDRESS: string;
  readonly VITE_TICKET_NFT_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
