import * as d3 from "d3";
import { Node, NodeID } from "./runtime.ts";

// Constants
export const DIST_Y = 40;
export const DIST_X = 25;
export const RADIUS = 12;
export const DEFAULT_S = 1.2 * DIST_X;

// 8 ports equally distributed around the circle
export type Port =
  | "n" // north
  | "ne" // north-east
  | "e" // east
  | "se" // south-east
  | "s" // south
  | "sw" // south-west
  | "w" // weast
  | "nw"; // north-west

// The type of an SVG node.
type SVG = d3.Selection<SVGElement, unknown, HTMLElement, unknown>;

// The type of a graph node.
// "simple" is a node with a borderless circle and a label.
// "fan" is a wide triangle with a label.
// "fin" is a narrow triangle with a label.
// "eraser" is a circle with an X.
type GraphNodeType = "simple" | "fan" | "fin" | "eraser";

class GraphNode {
  _x = 0; // The x coordinate of the node
  _y = 0; // The y coordinate of the node
  _label = ""; // The label of the node
  _svg: SVG[] = []; // A sequence of SVG nodes, each representing a layer
  readonly type: GraphNodeType | null; // The type of the node
  children: GraphNode[] = []; // The children of the node
  edges: GraphEdge[] = []; // The edges connected to this node

  constructor(type: GraphNodeType | null) {
    this.type = type;
    if (type === "simple") {
      // TODO
    } else if (type === "fan") {
      // TODO
    } else if (type === "fin") {
      // TODO
    } else if (type === "eraser") {
      // TODO
    }
  }

  get x() {
    return this._x;
  }
  set x(value) {
    this._x = value;
    // update this node's svgs.
    // loop through the edges and update the appropriate edge side of each edge.
  }

  get y() {
    return this._y;
  }
  set y(value) {
    this._y = value;
  }

  get label() {
    return this._label;
  }
  set label(value) {
    this._label = value;
  }

  get svg() {
    return this._svg;
  }
}

// A graph edge connects two nodes.
class GraphEdge {
  startNode: GraphNode;
  startOffset: { x: number; y: number } = { x: 0, y: 0 };
  startDelta: { x: number; y: number } = { x: 0, y: 0 }; // Bezier curve control point
  endNode: GraphNode;
  endOffset: { x: number; y: number } = { x: 0, y: 0 };
  endDelta: { x: number; y: number } = { x: 0, y: 0 }; // Bezier curve control point
  _svg: SVG[] = []; // A sequence of SVG nodes, each representing a layer
  //waypoints: { x: 0; y: 0 }[] = [];

  constructor(startNode: GraphNode, endNode: GraphNode) {
    this.startNode = startNode;
    this.endNode = endNode;
  }

  update() {
    const path = d3.path();
    const startX = this.startNode.x + this.startOffset.x;
    const startY = this.startNode.y + this.startOffset.y;
    const endX = this.endNode.x + this.endOffset.x;
    const endY = this.endNode.y + this.endOffset.y;
    path.moveTo(startX, startY);
    path.bezierCurveTo(
      startX + this.startDelta.x,
      startY + this.startDelta.y,
      endX + this.endDelta.x,
      endY + this.endDelta.y,
      endX,
      endY
    );
    d3.create("path")
      .attr("d", path.toString())
      .attr("stroke", /* theme === "light" ? "#222" :  */ "#FFF") // TODO: theming
      .attr("fill", "none");
    // if (highlight) {
    //   highlightSvg
    //     .append("path")
    //     .attr("d", path.toString())
    //     .attr("stroke", theme === "light" ? "#ffe00087" : "#fff60044")
    //     .attr("stroke-width", "28px")
    //     .attr("stroke-linecap", "round")
    //     .attr("fill", "none");
    // }
  }

  get svg() {
    return this._svg;
  }
}

function portOffset(port: Port, s = DEFAULT_S): { x: number; y: number } {
  if (port === "n") return { x: 0, y: -s };
  else if (port === "ne") return { x: Math.SQRT1_2 * s, y: -Math.SQRT1_2 * s };
  else if (port === "e") return { x: s, y: 0 };
  else if (port === "se") return { x: Math.SQRT1_2 * s, y: Math.SQRT1_2 * s };
  else if (port === "s") return { x: 0, y: s };
  else if (port === "sw") return { x: -Math.SQRT1_2 * s, y: Math.SQRT1_2 * s };
  else if (port === "w") return { x: -s, y: 0 };
  else if (port === "nw") return { x: -Math.SQRT1_2 * s, y: -Math.SQRT1_2 * s };
  return { x: 0, y: 0 };
}

export function drawNode(
  svg: d3.Selection<any, unknown, HTMLElement, any>,
  x: number,
  y: number,
  label: string,
  theme: "light" | "dark"
) {
  svg
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("fill", theme === "light" ? "#FFF" : "#1A1A1A")
    .attr("r", 15);
  svg
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", theme === "light" ? "#222" : "#FFF")
    .style("font-size", "20px")
    .text(label);
}

export function drawEdge(
  svg: d3.Selection<any, unknown, HTMLElement, any>,
  highlightSvg: d3.Selection<any, unknown, HTMLElement, any>,
  startX: number,
  startY: number,
  startPort: Port,
  endX: number,
  endY: number,
  endPort: Port,
  theme: "light" | "dark",
  s?: number,
  highlight = false
) {
  const path = d3.path();
  path.moveTo(startX, startY);
  const { x: deltaStartX, y: deltaStartY } = portOffset(startPort, s);
  const { x: deltaEndX, y: deltaEndY } = portOffset(endPort, s);
  path.bezierCurveTo(
    startX + deltaStartX,
    startY + deltaStartY,
    endX + deltaEndX,
    endY + deltaEndY,
    endX,
    endY
  );
  svg
    .append("path")
    .attr("d", path.toString())
    .attr("stroke", theme === "light" ? "#222" : "#FFF")
    .attr("fill", "none");
  if (highlight) {
    highlightSvg
      .append("path")
      .attr("d", path.toString())
      .attr("stroke", theme === "light" ? "#ffe00087" : "#fff60044")
      .attr("stroke-width", "28px")
      .attr("stroke-linecap", "round")
      .attr("fill", "none");
  }
}

export function draw(
  parentNodeGroup: d3.Selection<any, unknown, HTMLElement, any>,
  parentEdgeGroup: d3.Selection<any, unknown, HTMLElement, any>,
  parentHighlightGroup: d3.Selection<any, unknown, HTMLElement, any>,
  graph: (Node & { drawn?: boolean })[],
  nodeId: NodeID,
  parentNodeId: NodeID,
  x: number,
  y: number,
  theme: "light" | "dark"
): {
  widthRight: number;
  widthLeft: number;
  height: number;
  nodeGroup?: any;
  edgeGroup?: any;
  highlightGroup?: any;
  vars: { x: number; y: number; name: string }[];
} {
  if (nodeId === null || nodeId === "root") {
    return { widthLeft: 0, widthRight: 0, height: 0, vars: [] };
  }

  const node = graph[nodeId];

  const nodeGroup = parentNodeGroup.append("g");
  nodeGroup.attr("id", nodeId);
  const edgeGroup = parentEdgeGroup.append("g");
  edgeGroup.attr("id", nodeId);
  const highlightGroup = parentHighlightGroup.append("g");
  highlightGroup.attr("id", nodeId);

  if (node.type === "abs") {
    if (node.parent === parentNodeId) {
      const { widthLeft, widthRight, height, vars } = draw(
        nodeGroup,
        edgeGroup,
        highlightGroup,
        graph,
        node.body,
        nodeId,
        x,
        y + DIST_Y,
        theme
      );

      const [boundVars, freeVars] = vars.reduce(
        ([b, f]: [any[], any[]], e) =>
          e.name === node.param ? [[...b, e], f] : [b, [...f, e]],
        [[], []]
      );

      drawEdge(edgeGroup, highlightGroup, x, y, "s", x, y + DIST_Y, "n", theme);
      drawNode(nodeGroup, x, y, `λ${node.param}`, theme);

      boundVars.forEach((v) => {
        const path = d3.path();
        path.moveTo(v.x, v.y);
        path.arcTo(
          v.x,
          y + (height + 1) * DIST_Y,
          x - widthLeft * DIST_X,
          y + (height + 1) * DIST_Y,
          RADIUS
        );
        edgeGroup
          .append("path")
          .attr("d", path.toString())
          .attr("stroke", theme === "light" ? "#222" : "#FFF")
          .attr("fill", "none");
      });

      const maxX = boundVars.reduce(
        (acc, v) => (v.x > acc ? v.x : acc),
        -Infinity
      );

      if (boundVars.length > 0) {
        const path = d3.path();
        path.moveTo(x, y);
        path.arcTo(
          x - widthLeft * DIST_X,
          y,
          x - widthLeft * DIST_X,
          y + (height + 1) * DIST_Y,
          RADIUS
        );
        path.arcTo(
          x - widthLeft * DIST_X,
          y + (height + 1) * DIST_Y,
          x,
          y + (height + 1) * DIST_Y,
          RADIUS
        );
        path.lineTo(maxX - RADIUS, y + (height + 1) * DIST_Y);
        edgeGroup
          .append("path")
          .attr("d", path.toString())
          .attr("stroke", theme === "light" ? "#222" : "#FFF")
          .attr("fill", "none");
      }

      const path2 = d3.path();
      path2.moveTo(x, y);
      path2.arcTo(
        x + widthRight * DIST_X,
        y,
        x + widthRight * DIST_X,
        y + (height + 1) * DIST_Y,
        RADIUS
      );
      path2.arcTo(
        x + widthRight * DIST_X,
        y + (height + 1) * DIST_Y,
        x - widthLeft * DIST_X,
        y + (height + 1) * DIST_Y,
        RADIUS
      );
      path2.arcTo(
        x - widthLeft * DIST_X,
        y + (height + 1) * DIST_Y,
        x - widthLeft * DIST_X,
        y,
        RADIUS
      );
      path2.arcTo(x - widthLeft * DIST_X, y, x, y, RADIUS);
      path2.lineTo(x, y);
      edgeGroup
        .append("path")
        .attr("d", path2.toString())
        .attr("stroke", theme === "light" ? "#222" : "#FFF")
        .attr("stroke-dasharray", "4,6")
        .attr("fill", "none");
      return {
        widthLeft: widthLeft + 0.5,
        widthRight: widthRight + 0.5,
        height: height + 2,
        vars: freeVars,
        nodeGroup,
        edgeGroup,
        highlightGroup,
      };
    } else {
      // Variable node
      drawNode(nodeGroup, x, y, node.param, theme);
      return {
        widthLeft: 1,
        widthRight: 1,
        height: 1,
        vars: [{ x, y, name: node.param }],
        nodeGroup,
        edgeGroup,
        highlightGroup,
      };
    }
  } else if (node.type === "app") {
    const {
      widthLeft: widthLeftLeft,
      widthRight: widthRightLeft,
      height: heightLeft,
      vars: varsLeft,
      nodeGroup: nodeGroupLeft,
      edgeGroup: edgeGroupLeft,
      highlightGroup: highlightGroupLeft,
    } = draw(
      nodeGroup,
      edgeGroup,
      highlightGroup,
      graph,
      node.func,
      nodeId,
      x,
      y + DIST_Y,
      theme
    );
    const {
      widthLeft: widthLeftRight,
      widthRight: widthRightRight,
      height: heightRight,
      vars: varsRight,
      nodeGroup: nodeGroupRight,
      edgeGroup: edgeGroupRight,
      highlightGroup: highlightGroupRight,
    } = draw(
      nodeGroup,
      edgeGroup,
      highlightGroup,
      graph,
      node.arg,
      nodeId,
      x,
      y + DIST_Y,
      theme
    );

    const spread = (widthRightLeft + widthLeftRight) / 2;
    const highlightEdge =
      node.func !== null &&
      node.func !== "root" &&
      graph[node.func].type === "abs" &&
      graph[node.func].parent === nodeId;
    drawEdge(
      edgeGroup,
      highlightGroup,
      x,
      y,
      "sw",
      x - spread * DIST_X,
      y + DIST_Y,
      "n",
      theme,
      DEFAULT_S,
      highlightEdge
    );
    drawEdge(
      edgeGroup,
      highlightGroup,
      x,
      y,
      "se",
      x + spread * DIST_X,
      y + DIST_Y,
      "n",
      theme
    );
    drawNode(nodeGroup, x, y, `@`, theme);

    nodeGroupLeft?.attr("transform", `translate(${-spread * DIST_X}, 0)`);
    edgeGroupLeft?.attr("transform", `translate(${-spread * DIST_X}, 0)`);
    highlightGroupLeft?.attr("transform", `translate(${-spread * DIST_X}, 0)`);
    varsLeft.forEach((v) => {
      v.x -= spread * DIST_X;
    });
    nodeGroupRight?.attr("transform", `translate(${spread * DIST_X}, 0)`);
    edgeGroupRight?.attr("transform", `translate(${spread * DIST_X}, 0)`);
    highlightGroupRight?.attr("transform", `translate(${spread * DIST_X}, 0)`);
    varsRight.forEach((v) => {
      v.x += spread * DIST_X;
    });

    return {
      widthLeft: widthLeftLeft + spread,
      widthRight: spread + widthRightRight,
      height: Math.max(heightLeft, heightRight) + 1,
      vars: [...varsLeft, ...varsRight],
      nodeGroup,
      edgeGroup,
      highlightGroup,
    };
  }
  return {
    widthLeft: 1,
    widthRight: 1,
    height: 1,
    vars: [],
    nodeGroup,
    edgeGroup,
    highlightGroup,
  };
}
