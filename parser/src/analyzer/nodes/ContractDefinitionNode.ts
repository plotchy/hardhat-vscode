import { ContractDefinition } from "@solidity-parser/parser/dist/src/ast-types";

import { Location, FinderType, Node, Position } from "./Node";

export class ContractDefinitionNode implements Node {
    type: string;
    uri: string;
    astNode: ContractDefinition;

    nameLoc?: Location | undefined;

    expressionNode?: Node | undefined;
    declarationNode?: Node | undefined;

    connectionTypeRules: string[] = [ "UserDefinedTypeName", "FunctionCall" ];

    parent?: Node | undefined;
    children: Node[] = [];

    typeNodes: Node[] = [];

    constructor (contractDefinition: ContractDefinition, uri: string) {
        this.type = contractDefinition.type;
        this.uri = uri;
        this.astNode = contractDefinition;
        
        if (contractDefinition.loc) {
            this.nameLoc = {
                start: {
                    line: contractDefinition.loc.start.line,
                    column: contractDefinition.loc.start.column + "contract ".length
                },
                end: {
                    line: contractDefinition.loc.start.line,
                    column: contractDefinition.loc.start.column + "contract ".length + contractDefinition.name.length
                }
            };
        }

        this.addTypeNode(this);
    }

    getTypeNodes(): Node[] {
        return this.typeNodes;
    }

    addTypeNode(node: Node): void {
        this.typeNodes.push(node);
    }

    getExpressionNode(): Node | undefined {
        return this.expressionNode;
    }

    setExpressionNode(node: Node | undefined): void {
        this.expressionNode = node;
    }

    getDeclarationNode(): Node | undefined {
        return this.declarationNode;
    }

    setDeclarationNode(node: Node | undefined): void {
        this.declarationNode = node;
    }

    getDefinitionNode(): Node | undefined {
        return this;
    }

    getName(): string | undefined {
        return this.astNode.name;
    }

    addChild(child: Node): void {
        this.children.push(child);
    }

    setParent(parent: Node | undefined): void {
        this.parent = parent;
    }

    getParent(): Node | undefined {
        return this.parent;
    }

    accept(find: FinderType, orphanNodes: Node[], parent?: Node, expression?: Node): Node {
        this.setExpressionNode(expression);

        if (parent) {
            this.setParent(parent);
        }

        this.findChildren(orphanNodes);
        
        for (const subNode of this.astNode.subNodes) {
            find(subNode, this.uri).accept(find, orphanNodes, this);
        }

        parent?.addChild(this);

        return this;
    }

    private findChildren(orphanNodes: Node[]): void {
        const newOrphanNodes: Node[] = [];

        let orphanNode = orphanNodes.shift();
        while (orphanNode) {
            if (
                orphanNode.getName() === this.getName() && (
                    this.connectionTypeRules.includes(orphanNode.type) ||
                    this.connectionTypeRules.includes(orphanNode.getExpressionNode()?.type || "")
            )) {
                orphanNode.addTypeNode(this);
                this.setDeclarationNode(orphanNode);

                orphanNode.setParent(this);
                this.addChild(orphanNode);
            } else {
                newOrphanNodes.push(orphanNode);
            }

            orphanNode = orphanNodes.shift();
        }

        for (const newOrphanNode of newOrphanNodes) {
            orphanNodes.push(newOrphanNode);
        }
    }
}