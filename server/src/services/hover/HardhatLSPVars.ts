/* eslint-disable @typescript-eslint/naming-convention */
export interface Var {
  [key: string]: string;
}

export interface ContractInfo {
  network: string;
  address: string;
  proxied_by: string;
  vars: Var;
}

export interface HHLSPVars {
  [key: string]: ContractInfo;
}

interface ExplorerDetails {
  env_var: string;
  chain: string;
  rpc: string;
  api: string;
}

export const EXPLORER_MAP: Record<string, ExplorerDetails> = {
  "etherscan.io": {
    env_var: "ETHERSCAN_API_KEY",
    chain: "mainnet",
    rpc: "https://rpc.ankr.com/eth",
    api: "https://api.etherscan.io/api",
  },
  "bscscan.com": {
    env_var: "BSCSCAN_API_KEY",
    chain: "bsc",
    rpc: "https://binance.llamarpc.com",
    api: "https://api.bscscan.com/api",
  },
  "arbiscan.io": {
    env_var: "ARBISCAN_API_KEY",
    chain: "arbitrum",
    rpc: "https://arbitrum.llamarpc.com",
    api: "https://api.arbiscan.io/api",
  },
  "optimistic.etherscan.io": {
    env_var: "OPTISCAN_API_KEY",
    chain: "optimism",
    rpc: "https://rpc.ankr.com/optimism",
    api: "https://api-optimistic.etherscan.io/api",
  },
  "basescan.org": {
    env_var: "BASESCAN_API_KEY",
    chain: "base",
    rpc: "https://rpc.ankr.com/base",
    api: "https://api.basescan.org/api",
  },
  "polygonscan.com": {
    env_var: "POLYSCAN_API_KEY",
    chain: "polygon",
    rpc: "https://rpc.ankr.com/polygon",
    api: "https://api.polygonscan.com/api",
  },
  "ftmscan.com": {
    env_var: "FTMSCAN_API_KEY",
    chain: "fantom",
    rpc: "https://rpc.ankr.com/fantom",
    api: "https://api.ftmscan.com/api",
  },
  "cronoscan.com": {
    env_var: "CRONOSCAN_API_KEY",
    chain: "cronos",
    rpc: "https://cronos-evm.publicnode.com",
    api: "https://api.cronoscan.com/api",
  },
  "snowtrace.io": {
    env_var: "SNOWTRACE_API_KEY",
    chain: "avalanche",
    rpc: "https://rpc.ankr.com/avalanche",
    api: "https://api.snowtrace.io/api",
  },
  "moonscan.io": {
    env_var: "MOONSCAN_API_KEY",
    chain: "moonbeam",
    rpc: "https://rpc.ankr.com/moonbeam",
    api: "https://api.moonbeam.network/api",
  },
  "moonriver.moonscan.io": {
    env_var: "MOONSCAN_API_KEY",
    chain: "moonriver",
    rpc: "https://rpc.api.moonriver.moonbeam.network",
    api: "https://api.moonriver.moonbeam.network/api",
  },
  "blockexplorer.boba.network": {
    env_var: "BOBA_API_KEY",
    chain: "boba",
    rpc: "https://gateway.tenderly.co/public/boba-ethereum",
    api: "https://blockexplorer.boba.network/api",
  },
};

