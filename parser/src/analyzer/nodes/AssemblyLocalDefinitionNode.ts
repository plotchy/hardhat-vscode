import { AssemblyLocalDefinition } from "@solidity-parser/parser/dist/ast-types";

import { Location, FinderType, Node } from "./Node";

export class AssemblyLocalDefinitionNode implements Node {
    type: string;
    uri: string;
    astNode: AssemblyLocalDefinition;

    nameLoc?: Location | undefined;

    parent?: Node | undefined;
    children: Node[] = [];

    typeNodes: Node[] = [];

    constructor (assemblyLocalDefinition: AssemblyLocalDefinition, uri: string) {
        this.type = assemblyLocalDefinition.type;
        this.uri = uri;
        this.astNode = assemblyLocalDefinition;
        // TO-DO: Implement name location for rename
    }

    getTypeNodes(): Node[] {
        return [];
    }

    getName(): string | undefined {
        return undefined;
    }

    addChild(child: Node): void {
        this.children.push(child);
    }

    setParent(parent: Node): void {
        this.parent = parent;
    }

    accept(find: FinderType, orphanNodes: Node[], parent?: Node): Node {
        // TO-DO: Method not implemented
        return this;
    }
}
