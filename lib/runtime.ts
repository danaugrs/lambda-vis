import {
  abstraction,
  ASTKinds,
  ASTNodeIntf,
  group,
  main_1,
  start,
  term_2,
} from "./parser.gen.ts";

// NodeID is the node index or "root" or `null`.
export type NodeID = number | "root" | null;

export type Abstraction = {
  type: "abs";
  parent: NodeID;
  body: NodeID;
  param: string; // The name of the bound variable
};

export type Application = {
  type: "app";
  parent: NodeID;
  func: NodeID;
  arg: NodeID;
};

export type Node = Abstraction | Application;
export type NodeType = Node["type"];

export type Env = Record<string, NodeID>;
export type Graph = Node[];

// Traverses an AST node and returns the index of the newly inserted node
export function parseNode(
  astNode: ASTNodeIntf,
  env: Env,
  graph: Graph,
  parent: NodeID,
  parentPort: string | null,
): number {
  if (astNode.kind === ASTKinds.start) {
    // Root (simply pass through)
    return parseNode((astNode as start).main, env, graph, parent, parentPort);
  } else if (
    astNode.kind === ASTKinds.application ||
    astNode.kind === ASTKinds.main_1
  ) {
    // Application
    const node: Node = {
      type: "app",
      parent: null,
      func: null,
      arg: null,
    };
    const nodeId = graph.push(node) - 1;
    node.func = parseNode((astNode as main_1).func, env, graph, nodeId, "func");
    node.arg = parseNode(
      (astNode as main_1).arg,
      { ...env },
      graph,
      nodeId,
      "arg",
    ); // copy env
    return nodeId;
  } else if (astNode.kind === ASTKinds.term_2) {
    // Identifier
    if ((astNode as term_2).identifier in env) {
      // Get existing abstraction
      const absId = env[(astNode as term_2).identifier] as number;
      // Return the abstraction
      return absId;
    } else {
      // Create abstraction reached by its variable port (with null parent and null body)
      const node: Node = {
        type: "abs",
        parent: null,
        body: null,
        param: (astNode as term_2).identifier,
      };
      const nodeId = graph.push(node) - 1;
      // Store node in env
      env[(astNode as term_2).identifier] = nodeId;
      return nodeId;
    }
  } else if (astNode.kind === ASTKinds.abstraction) {
    // Abstraction
    const node: Node = {
      type: "abs",
      parent: parent,
      body: null,
      param: (astNode as abstraction).parameter,
    };
    const nodeId = graph.push(node) - 1;
    // Store parameter in env
    env[(astNode as abstraction).parameter] = nodeId;
    node.body = parseNode(
      (astNode as abstraction).body,
      env,
      graph,
      nodeId,
      "body",
    );
    // Clear parameter from env
    delete env[(astNode as abstraction).parameter];
    return nodeId;
  } else if (astNode.kind === ASTKinds.group) {
    // Group (simply pass through)
    return parseNode((astNode as group).group, env, graph, parent, parentPort);
  } else {
    /*if (
    astNode.kind === ASTKinds.main_2 ||
    astNode.kind === ASTKinds.term_1 ||
    astNode.kind === ASTKinds.term_3 ||
    astNode.kind === ASTKinds.identifier ||
    astNode.kind === ASTKinds.$EOF
    )*/
    throw `Unreachable (${astNode.kind})`;
  }
}
