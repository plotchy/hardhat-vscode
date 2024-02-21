import * as fs from 'fs';
import * as yaml from 'js-yaml';
import {
  isIdentifierNode,
  isMemberAccessNode,
} from "@analyzer/utils/typeGuards";
import { getParserPositionFromVSCodePosition } from "@common/utils";
import { HoverParams, Hover } from "vscode-languageserver/node";
import { ISolFileEntry, IdentifierNode, MemberAccessNode } from "@common/types";
import { onCommand } from "@utils/onCommand";
import { ServerState } from "../../types";
import { astToText, astToTextWithVars } from "./utils/astToText";
import { textToHover, textToHoverWithVars } from "./utils/textTohover";
import { HHLSPVars, EXPLORER_MAP } from './HardhatLSPVars';


export function onHover(serverState: ServerState) {
  return (params: HoverParams): Hover | null => {
    try {
      return onCommand(
        serverState,
        "onHover",
        params.textDocument.uri,
        (documentAnalyzer) =>
          findHoverForNodeAtPosition(serverState, documentAnalyzer, params)
      );
    } catch (err) {
      serverState.logger.error(err);

      return null;
    }
  };
}

function findHoverForNodeAtPosition(
  serverState: ServerState,
  documentAnalyzer: ISolFileEntry,
  params: HoverParams
) {
  // check if we have a root folder for the project
  let hhLSPVars: HHLSPVars | null = null;

  // we'll set hhLSPVars if if we find and load the yaml file
  if (serverState.indexedWorkspaceFolders.length > 0) {
    const rootProjectUri = serverState.indexedWorkspaceFolders[0].uri.replace('file://', '');
    // see if there is a hardhat_lsp_vars.yaml file in the root project
    const hardhatLspVarsPath = `${rootProjectUri}/hardhat_lsp_vars.yaml`;
    const hardhatLspVarsExists = fs.existsSync(hardhatLspVarsPath);
    if (hardhatLspVarsExists) {
      try {
        const yamlStr = fs.readFileSync(hardhatLspVarsPath, 'utf8');
        hhLSPVars = yaml.load(yamlStr) as HHLSPVars;
      // eslint-disable-next-line no-empty
      } catch (err) {}
    }
  }

  const node = documentAnalyzer.searcher.findNodeByPosition(
    documentAnalyzer.uri,
    getParserPositionFromVSCodePosition(params.position),
    documentAnalyzer.analyzerTree.tree
  );

  if (node === undefined) {
    return null;
  }
  
  if (!isIdentifierNode(node) && !isMemberAccessNode(node)) {
    return null;
  }

  let hover: Hover | null = null;
  if (hhLSPVars) {
    hover = convertNodeToHoverWithVars(node, documentAnalyzer.uri, hhLSPVars, documentAnalyzer.text);
  } else {
    hover = convertNodeToHover(node, documentAnalyzer.uri);
  }
  
  return hover;
}

export function convertNodeToHover(
  node: IdentifierNode | MemberAccessNode,
  fileUri: string
): Hover | null {
  const typeNode = node.typeNodes[0];

  if (typeNode === undefined) {
    return null;
  }

  const hoverText = astToText(typeNode.astNode, fileUri);

  return textToHover(hoverText);
}

export function convertNodeToHoverWithVars(
  node: IdentifierNode | MemberAccessNode,
  fileUri: string,
  hhLSPVars: HHLSPVars,
  contractText: string | undefined
): Hover | null {
  const typeNode = node.typeNodes[0];

  if (typeNode === undefined) {
    return null;
  }
  if (contractText === undefined) {
    return null;
  }
  const { network, address, proxiedBy } = extractNetworkAndAddress(contractText);

  const {hoverText, varText} = astToTextWithVars(typeNode.astNode, fileUri, network, address, proxiedBy, hhLSPVars);

  return textToHoverWithVars(hoverText, varText);
}


function extractNetworkAndAddress(contractText: string): { network?: string; address?: string; proxiedBy?: string } {
  const sourceRegex = /\/\/ @bu-meta source: ([^\n]+)/;
  const proxiedByRegex = /\/\/ @bu-meta proxied-by: ([^\n]+)/;

  const sourceMatch = contractText.match(sourceRegex);
  const proxiedByMatch = contractText.match(proxiedByRegex);

  if (!sourceMatch) {
    return {};
  }

  const sourceUrl = new URL(sourceMatch[1]);
  const address = sourceUrl.pathname.split('/').pop() ?? "";

  let network: string | undefined;
  for (const [domain, data] of Object.entries(EXPLORER_MAP)) {
    if (sourceUrl.hostname.includes(domain)) {
      network = data.chain;
      break;
    }
  }

  if (network === null) {
    return { address };
  } else if (network === "") {
    return { address };
  }

  const proxiedBy = proxiedByMatch ? new URL(proxiedByMatch[1]).pathname.split('/').pop() : "";

  return { network, address, proxiedBy };
}
