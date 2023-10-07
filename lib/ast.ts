import {
  abstraction,
  ASTKinds,
  ASTNodeIntf,
  group,
  main_1,
  parse,
  start,
  SyntaxErr,
  term_2,
} from "./parser.gen.ts";

// An AST is a list of `Node`s.
export type AST = Node[];

// A `Node` is either an `Abstraction`, an `Application` or a `Variable`.
export type Node = Abstraction | Application | Variable;

// A `NodeID` is either the `Node`'s index in `AST`, or "root".
export type NodeID = number | "root";

// An abstraction is a parameter name and a body.
export type Abstraction = {
  type: "abs";
  name: string;
  body: NodeID;
};

// An application of a function to an argument.
export type Application = {
  type: "app";
  func: NodeID;
  arg: NodeID;
};

// A variable is a node with a name.
export type Variable = {
  type: "var";
  name: string;
};

// Parses a lambda calculi expression into an `AST`.
// Returns an array of `SyntaxErr` instead if there are parsing errors.
export function parseExpr(expr: string): AST | SyntaxErr[] {
  const rawAst = parse(expr);
  if (rawAst.errs.length > 0) {
    return rawAst.errs;
  }
  const ast: AST = [];
  const firstRawNode = rawAst.ast!;
  parseRawNode(firstRawNode, ast);
  return ast;
}

// Parses a raw AST node, updating the AST in place.
// Returns the index of the newly inserted node.
function parseRawNode(astNode: ASTNodeIntf, ast: AST): NodeID {
  if (astNode.kind === ASTKinds.start) {
    // Root (simply pass through)
    return parseRawNode((astNode as start).main, ast);
  } else if (
    astNode.kind === ASTKinds.application ||
    astNode.kind === ASTKinds.main_1
  ) {
    // Application
    const node: Application = {
      type: "app",
      func: parseRawNode((astNode as main_1).func, ast),
      arg: parseRawNode((astNode as main_1).arg, ast),
    };
    return ast.push(node) - 1;
  } else if (astNode.kind === ASTKinds.term_2) {
    // Variable
    const node: Variable = {
      type: "var",
      name: (astNode as term_2).identifier,
    };
    return ast.push(node) - 1;
  } else if (astNode.kind === ASTKinds.abstraction) {
    // Abstraction
    const node: Abstraction = {
      type: "abs",
      name: (astNode as abstraction).parameter,
      body: parseRawNode((astNode as abstraction).body, ast),
    };
    return ast.push(node) - 1;
  } else if (astNode.kind === ASTKinds.group) {
    // Group (simply pass through)
    return parseRawNode((astNode as group).group, ast);
  } else {
    /*Could be any of (
      astNode.kind === ASTKinds.main_2 ||
      astNode.kind === ASTKinds.term_1 ||
      astNode.kind === ASTKinds.term_3 ||
      astNode.kind === ASTKinds.identifier ||
      astNode.kind === ASTKinds.$EOF
      )*/
    throw `Unreachable (${astNode.kind})`;
  }
}
