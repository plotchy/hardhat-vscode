/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  isArrayTypeName,
  isCustomErrorDefinition,
  isElementaryTypeName,
  isEventDefinition,
  isFunctionDefinition,
  isMapping,
  isUserDefinedTypeName,
  isVariableDeclaration,
} from "@analyzer/utils/typeGuards";
import { EmptyNodeType } from "@common/types";
import {
  BaseASTNode,
  CustomErrorDefinition,
  EventDefinition,
  FunctionDefinition,
  ModifierInvocation,
  UserDefinedTypeName,
  VariableDeclaration,
} from "@solidity-parser/parser/dist/src/ast-types";
import { HHLSPVars, EXPLORER_MAP } from './../HardhatLSPVars';

export function astToText(astNode: BaseASTNode | EmptyNodeType, fileUri: string): string | null {
  if (isFunctionDefinition(astNode)) {
    return functionDefinitionToText(astNode);
  }

  if (isVariableDeclaration(astNode)) {
    const _fileUri2 = fileUri;
    return variableDeclarationToText(astNode);
  }

  if (isCustomErrorDefinition(astNode)) {
    return customErrorDefinitionToText(astNode);
  }

  if (isEventDefinition(astNode)) {
    return eventDefinitionToText(astNode);
  }

  return null;
}

export function astToTextWithVars(astNode: BaseASTNode | EmptyNodeType, fileUri: string, network: string | undefined, address: string | undefined, proxiedBy: string | undefined, hhLSPVARS: HHLSPVars): { hoverText: string | null, varText: string | null} {
  if (isFunctionDefinition(astNode)) {
    return { hoverText: functionDefinitionToText(astNode), varText: null };
  }

  if (isVariableDeclaration(astNode)) {
    return variableDeclarationToTextWithVars(astNode, network, address, proxiedBy, hhLSPVARS);
  }

  if (isCustomErrorDefinition(astNode)) {
    return { hoverText: customErrorDefinitionToText(astNode), varText: null };
  }

  if (isEventDefinition(astNode)) {
    return { hoverText: eventDefinitionToText(astNode), varText: null };
  }
  return { hoverText: null, varText: null };
}

export function variableDeclarationToText(variable: VariableDeclaration) {
  if (variable.typeName === null) {
    return null;
  }

  const typeText = resolveTypeTextFromAst(variable.typeName);

  if (typeText === null) {
    return null;
  }

  const visibility =
    variable.visibility === "default" ? null : variable.visibility;

  const constant = variable.isDeclaredConst === true ? "constant" : null;

  const storageLocation = variable.storageLocation;

  const identifierName = variable.name;

  // use fileUri to get the value of the variable

  const hoverText = [
    typeText,
    visibility,
    constant,
    storageLocation,
    identifierName,
  ]
    .filter((text: string | null | undefined): text is string => Boolean(text))
    .map((text) => text.trim())
    .join(" ");

  return hoverText;
}

export function variableDeclarationToTextWithVars(variable: VariableDeclaration, network: string | undefined, address: string | undefined, proxiedBy: string | undefined, hhLSPVars: HHLSPVars): {hoverText: string | null, varText: string | null} {
  if (variable.typeName === null) {
    return { hoverText: null, varText: null };
  }

  const typeText = resolveTypeTextFromAst(variable.typeName);

  if (typeText === null) {
    return { hoverText: null, varText: null };
  }

  const visibility =
    variable.visibility === "default" ? null : variable.visibility;

  const constant = variable.isDeclaredConst === true ? "constant" : null;

  const storageLocation = variable.storageLocation;

  const identifierName = variable.name;

  
  const hoverText = [
    typeText,
    visibility,
    constant,
    storageLocation,
    identifierName,
  ]
    .filter((text: string | null | undefined): text is string => Boolean(text))
    .map((text) => text.trim())
    .join(" ");
  
  if (identifierName === null) {
    return { hoverText, varText: null };
  }

    
  // now we use hhLSPVars alongside network, address, and proxiedBy to get the value of the variable
  const cacheKey = `${network}_${address}`;
  const contractInfo = hhLSPVars[cacheKey];

  let varValue = contractInfo && contractInfo.vars && identifierName in contractInfo.vars ? contractInfo.vars[identifierName] : null;
  if (varValue === null) {
    return {hoverText, varText: null};
  }
  const explorerLink = optimisticExplorerLink(varValue, network, address, false);
  if (explorerLink !== null) {
    varValue = `${varValue} [🔗](${explorerLink})`;
  }

  // if proxiedBy is not empty, we need to get the value from the proxied contract.
  let proxiedVarValue = null;
  if (proxiedBy) {
    const proxiedCacheKey = `${network}_${proxiedBy}`;
    const proxiedContractInfo = hhLSPVars[proxiedCacheKey];
    proxiedVarValue = proxiedContractInfo && proxiedContractInfo.vars && identifierName in proxiedContractInfo.vars ? proxiedContractInfo.vars[identifierName] : null;
  }


  let varText = `\`${varValue}\``;
  if (proxiedBy && proxiedVarValue !== null) {
    const proxiedExplorerLink = optimisticExplorerLink(proxiedVarValue, network, proxiedBy, true);
    proxiedVarValue = `\`${proxiedVarValue}\``;
    if (proxiedExplorerLink !== null) {
      proxiedVarValue = `${proxiedVarValue} [🔗](${proxiedExplorerLink})`;
    }
    varText = `#### impl: ${varText}\n\n#### proxy: ${proxiedVarValue}`;
  }
  return {hoverText, varText};
}

export function customErrorDefinitionToText(
  customErrorDefinition: CustomErrorDefinition
): string | null {
  const params = parameterListToText(customErrorDefinition.parameters);

  return `error ${customErrorDefinition.name}${params ?? "()"}`;
}

export function eventDefinitionToText(
  eventDefinition: EventDefinition
): string | null {
  const params = parameterListToText(eventDefinition.parameters);

  return `event ${eventDefinition.name}${params ?? "()"}`;
}

export function functionDefinitionToText(
  astFunctionDef: FunctionDefinition
): string | null {
  const introKeyword = astFunctionDef.isConstructor
    ? "constructor"
    : "function";

  const functionName = astFunctionDef.name;
  const params = parameterListToText(astFunctionDef.parameters);
  const paramsList = `${functionName}${params ?? "()"}`;

  const visibility =
    astFunctionDef.visibility === "default" ? null : astFunctionDef.visibility;

  const mutability = astFunctionDef.stateMutability;

  const virtual = astFunctionDef.isVirtual ? "virtual" : null;

  const override = overrideToText(astFunctionDef.override);

  const modifierList = astFunctionDef.modifiers.map((m) =>
    modifierInvocationToText(m)
  );

  const returns = parameterListToText(astFunctionDef.returnParameters);
  const returnsList = returns === null ? null : `returns ${returns}`;

  const hoverText = [
    introKeyword, // what about constructor
    paramsList,
    visibility,
    mutability,
    virtual,
    override,
    ...modifierList,
    returnsList,
  ]
    .filter(
      (text: string | null | undefined): text is string =>
        text !== null && text !== undefined
    )
    .map((text) => (text === " " ? " " : text.trim()))
    .join(" ");

  return hoverText;
}

function overrideToText(overrides: UserDefinedTypeName[] | null) {
  if (overrides === null) {
    return null;
  }

  if (overrides.length === 0) {
    return "override";
  }

  const names = overrides.map((o) => o.namePath);

  return `override(${names.join(", ")})`;
}

function modifierInvocationToText(
  invocation: ModifierInvocation
): string | null {
  if (invocation.arguments === null) {
    return invocation.name;
  }

  // TODO: display the arguments
  return invocation.name;
}

function parameterListToText(parameterList: VariableDeclaration[] | null) {
  if (parameterList === null || parameterList.length === 0) {
    return null;
  }

  const params = parameterList.map((p) => variableDeclarationToText(p));

  return `(${params.join(", ")})`;
}

function optimisticExplorerLink(varValue: string, network: string | undefined, address: string | undefined, isProxy: boolean) {
  if (network === null) {
    return null;
  }
  if (address === null) {
    return null;
  }
  // optimistically assume varValue is of form "123 (0x123)"
  // split it into "123" and "0x123"
  let [, possibleAddress] = varValue.split(" ");
  if (possibleAddress === undefined) {
    return null;
  }
  // check if possibleAddress is surrounded by parentheses, and if so, remove them
  if (possibleAddress[0] === "(" && possibleAddress[possibleAddress.length - 1] === ")") {
    possibleAddress = possibleAddress.slice(1, -1);
  }

  // check if possibleAddress is 0x followed by about 40 hex characters
  if (!/^0x[0-9a-fA-F]{38,40}$/.test(possibleAddress)) {
    return null;
  }

  // seems like a valid address, so let's assume it is
  // temporarily remove the leading 0x and padStart with 0s to 40 characters
  possibleAddress = possibleAddress.slice(2).padStart(40, "0");
  // add back the 0x
  possibleAddress = `0x${possibleAddress}`;


  // search EXPLORER_MAP for which key has a matching "chain": network
  const explorer = Object.entries(EXPLORER_MAP).find(
    ([, details]) => details.chain === network
  )?.[0];
  if (explorer === undefined) {
    return null;
  }

  if (isProxy) {
    return `https://${explorer}/address/${possibleAddress}#readProxyContract`;
  } else {
    return `https://${explorer}/address/${possibleAddress}#readContract`;
  }
}

export function resolveTypeTextFromAst(
  typeAstNode: BaseASTNode | EmptyNodeType
): string | null {
  if (isElementaryTypeName(typeAstNode)) {
    return typeAstNode.name ?? null;
  }

  if (isUserDefinedTypeName(typeAstNode)) {
    return typeAstNode.namePath ?? null;
  }

  if (isArrayTypeName(typeAstNode)) {
    const baseTypeText = resolveTypeTextFromAst(typeAstNode.baseTypeName);
    return `${baseTypeText}[]`;
  }

  if (isMapping(typeAstNode)) {
    const keyText = resolveTypeTextFromAst(typeAstNode.keyType);
    const valueText = resolveTypeTextFromAst(typeAstNode.valueType);

    if (keyText === null || valueText === null) {
      return "mapping";
    }

    return `mapping(${keyText} => ${valueText})`;
  }

  return null;
}
