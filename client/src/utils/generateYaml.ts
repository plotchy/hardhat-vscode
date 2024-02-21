/* eslint-disable @typescript-eslint/naming-convention */
// HardhatLSPVars.ts

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import * as yaml from 'js-yaml';

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

class StorageLine {
  public name: string;
  public ty: string;
  public slot: string;
  public offset: string;
  public bytes: string;
  public value: string;
  public hexValue: string;
  public contract: string;

  constructor(
    ...args: string[]
  ) {
    this.name = args[0];
    this.ty = args[1];
    this.slot = args[2];
    this.offset = args[3];
    this.bytes = args[4];
    this.value = args[5];
    this.hexValue = args[6];
    this.contract = args[7];
  }
}

function parseStorageLines(data: string): StorageLine[] {
  const contractLines = data.trim().split('\n');
  const storageVec: StorageLine[] = [];
  for (const line of contractLines) {
    if (!line.startsWith('// @bu-meta storage:')) continue;
    const values = line.split('|').slice(1).map(v => v.trim()).filter(v => v && !/^[-]+$/g.test(v));
    if (values.length === 8) {
      const entry = new StorageLine(...values);
      storageVec.push(entry);
    }
  }
  return storageVec;
}

export async function generateYamlForSolidityFiles(workspaceRoot: string, absPaths: string[] = ['src', 'lib']): Promise<void> {
  let yamlStrFull = `# \`Solidity-Patched\` looks at this file to find variable values
#
# if a solidity file contains:
# // @bu-meta source: <explorer_url>
# and optionally:
# // @bu-meta proxied-by:  <explorer_url>
#
# Then each time a variable is hovered in that file, the LSP will read this yaml and look for the combination of
#     \`<network>_<address>\` as a key for both the source and the optional proxy.
# 
# notably there isn't really anything smart going on with the variable matching, its just by name and everything is treated as a string.
# so you can change the value of a variable to anything you want to show. 
#     ie: for a large number \`100000000000000000000000\`, you could adjust it or add \`100_000 eth\` for better readability.

`;

  for (const absPath of absPaths) {
    const dirPath = path.resolve(absPath);
    if (!fs.existsSync(dirPath)) {
      process.exit(1);
    }

    const solFiles = findSolFiles(dirPath);

    for (const solFile of solFiles) {
      const filePath = solFile;
      const inputData = fs.readFileSync(filePath, { encoding: 'utf-8' });

      const sourceLineMatch = inputData.match(/\/\/ @bu-meta source: ([^\n]+)/);
      if (!sourceLineMatch) {
        continue;
      }
      const sourceUrl = new URL(sourceLineMatch[1]);
      let network: string | undefined;
      Object.entries(EXPLORER_MAP).forEach(([domain, { chain }]) => {
        if (sourceUrl.hostname.includes(domain)) {
          network = chain;
        }
      });
      if (network === null || network === undefined) {
        continue;
      }
      if (sourceUrl.pathname === null || sourceUrl.pathname === undefined) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const address = sourceUrl.pathname.split('/').pop() || '';
      if (address === null || address === undefined) {
        continue;
      }

      if (yamlStrFull.includes(`${network}_${address}`)) {
        continue;
      }

      const proxiedLineMatch = inputData.match(/\/\/ @bu-meta proxied-by: ([^\n]+)/);
      const proxiedByUrl = proxiedLineMatch ? new URL(proxiedLineMatch[1]) : undefined;
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const proxiedAddress = proxiedByUrl ? proxiedByUrl.pathname.split('/').pop() || '' : '';
      

      const storageVec = parseStorageLines(inputData);
      const varsDict: Record<string, string> = {};
      storageVec.forEach(entry => {
        if (!Number.isInteger(Number(entry.value))) {
          return;
        }
        const hexValue = BigInt(entry.value).toString(16);
        varsDict[entry.name] = `${entry.value} (0x${hexValue})`;
      });

      const yamlData: HHLSPVars = {
        [`${network}_${address}`]: {
          network,
          address,
          proxied_by: proxiedAddress,
          vars: varsDict,
        },
      };

      const yamlStr = yaml.dump(yamlData, { noRefs: true, skipInvalid: true });
      // eslint-disable-next-line prefer-template
      yamlStrFull += yamlStr + '\n';
    }
  }
  // write the file to workspaceRoot/hardhat_lsp_vars.yaml
  const yamlPath = path.join(workspaceRoot, 'hardhat_lsp_vars.yaml');
  fs.writeFileSync(yamlPath, yamlStrFull);
}


function findSolFiles(dirPath: string): string[] {
  let solFiles: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      solFiles = solFiles.concat(findSolFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.sol')) {
      solFiles.push(fullPath);
    }
  }

  return solFiles;
}
