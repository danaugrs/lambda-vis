import { AST } from "../ast.ts";


AST
    runtime

    rendering


AST -> Graph (different for each system) -> Runtime and Rendering (Different for each system), might have multiple renderers for each system.



Common Graph Rendering Primitives (used by all systems)
    GraphNode (simple, fan, fin, eraser, null)
    GraphEdge



function render(ast: AST) {
    const graph: Graph = [];
    const env: Env = {};
    parseNode(ast, env, graph, null, null);
    return graph;
}

function renderGraph(graph: Graph): void {
    // Create a root node
    const rootNode = new GraphNode("root");
    // Create a graph renderer
    const renderer = new GraphRenderer(rootNode);
    // Render the graph
    renderer.render(graph);
}

interface System {
    ast: AST;
    graph: Graph;
    renderer: GraphRenderer;
    render(): void;
}


type NaiveGraph = GraphNode[];

class Naive implements System {
    ast: AST;
    graph: Graph;
    renderer: GraphRenderer;

    constructor(ast: AST) {
        this.ast = ast;
        this.graph = astToGraph(ast);
        this.renderer = new GraphRenderer();
    }

    // Render simply mounts the SVGs to the DOM, it should not be called multiple times.
    render() {
        this.renderer.render(this.graph);
    }
}