const fs = require('fs');

const types = ['SourceUnit', 'PragmaDirective', 'ImportDirective', 'ContractDefinition', 'InheritanceSpecifier', 'StateVariableDeclaration', 'UsingForDeclaration', 'StructDefinition', 'ModifierDefinition', 'ModifierInvocation', 'FunctionDefinition', 'EventDefinition', 'EnumValue', 'EnumDefinition', 'VariableDeclaration', 'UserDefinedTypeName', 'ArrayTypeName', 'Mapping', 'ElementaryTypeName', 'FunctionTypeName', 'Block', 'ExpressionStatement', 'IfStatement', 'UncheckedStatement', 'WhileStatement', 'ForStatement', 'InlineAssemblyStatement', 'DoWhileStatement', 'ContinueStatement', 'Break', 'Continue', 'BreakStatement', 'ReturnStatement', 'EmitStatement', 'ThrowStatement', 'VariableDeclarationStatement', 'FunctionCall', 'AssemblyBlock', 'AssemblyCall', 'AssemblyLocalDefinition', 'AssemblyAssignment', 'AssemblyStackAssignment', 'LabelDefinition', 'AssemblySwitch', 'AssemblyCase', 'AssemblyFunctionDefinition', 'AssemblyFunctionReturns', 'AssemblyFor', 'AssemblyIf', 'AssemblyLiteral', 'SubAssembly', 'NewExpression', 'TupleExpression', 'TypeNameExpression', 'NameValueExpression', 'NumberLiteral', 'BooleanLiteral', 'HexLiteral', 'StringLiteral', 'Identifier', 'BinaryOperation', 'UnaryOperation', 'Conditional', 'IndexAccess', 'IndexRangeAccess', 'MemberAccess', 'HexNumber', 'DecimalNumber'];

for (const type of types) {
    let argName = type.charAt(0).toLowerCase() + type.slice(1);

    if (['break', 'continue'].indexOf(argName) !== -1) {
        argName = `ast${type}`;
    }

    fs.writeFileSync(`${__dirname}/${type}Node.ts`,
`import { AST, ${type} } from "@solidity-parser/parser/dist/ast-types";

import { Location, Node } from "./Node";

export class ${type}Node implements Node {
    type: string;

    uri: string;

    name?: string | undefined;
    nameLoc?: Location | undefined;
    loc?: Location | undefined;

    parent?: Node | undefined;
    children: Node[] = [];

    constructor (${argName}: ${type}, uri: string) {
        this.type = ${argName}.type;

        this.uri = uri;
        // TO-DO: Implement name location for rename

        // this.name = sourceUnit.name;
        // this.loc = sourceUnit.loc;
    }

    addChild(child: Node): void {
        this.children.push(child);
    }

    setParent(parent: Node): void {
        this.parent = parent;
    }

    accept(find: (ast: AST, uri: string) => Node, orphanNodes: Node[], parent?: Node): void {
        // TO-DO: Method not implemented
    }
}
`);
}