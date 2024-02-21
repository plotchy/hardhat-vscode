import { MarkupKind } from "vscode-languageserver/node";

export function textToHover(hoverText: string | null) {
  if (hoverText === null) {
    return null;
  }

  const markdownHoverText = [
    "```solidity",
    hoverText,
    "```",
  ].join("\n");

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: markdownHoverText,
    },
  };
}


export function textToHoverWithVars(hoverText: string | null, varText: string | null) {
  if (hoverText === null) {
    return null;
  }
  if (varText === null) {
    return textToHover(hoverText);
  }

  const markdownHoverText = [
    "```solidity",
    hoverText,
    "```",
    "\n---\n",
    varText,
  ].join("\n");

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: markdownHoverText,
    },
  };
}
