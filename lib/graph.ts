import * as d3 from "d3";
import { Node, NodeID } from "./runtime.ts";
import { theme } from "../components/ThemeToggle.tsx";

// Constants
export const DIST_Y = 40;
export const DIST_X = 25;
export const RADIUS = 12;

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

function portOffset(port: Port, s = 1.2 * DIST_X): { x: number; y: number } {
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
) {
  svg
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("fill", theme.value === "light" ? "#FFF" : "#222")
    .attr("r", 15);
  svg
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", theme.value === "light" ? "#222" : "#FFF")
    .style("font-size", "20px")
    .text(label);
}

export function drawEdge(
  svg: d3.Selection<any, unknown, HTMLElement, any>,
  startX: number,
  startY: number,
  startPort: Port,
  endX: number,
  endY: number,
  endPort: Port,
  s?: number,
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
    endY,
  );
  svg
    .append("path")
    .attr("d", path.toString())
    .attr("stroke", theme.value === "light" ? "#222" : "#FFF")
    .attr("fill", "none");
}

export function draw(
  parentNodeGroup: d3.Selection<any, unknown, HTMLElement, any>,
  parentEdgeGroup: d3.Selection<any, unknown, HTMLElement, any>,
  graph: (Node & { drawn?: boolean })[],
  nodeId: NodeID,
  parentNodeId: NodeID,
  x: number,
  y: number,
): {
  widthRight: number;
  widthLeft: number;
  height: number;
  nodeGroup?: any;
  edgeGroup?: any;
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

  if (node.type === "abs") {
    if (node.parent === parentNodeId) {
      const { widthLeft, widthRight, height, vars } = draw(
        nodeGroup,
        edgeGroup,
        graph,
        node.body,
        nodeId,
        x,
        y + DIST_Y,
      );

      const [boundVars, freeVars] = vars.reduce(
        ([b, f]: [any[], any[]], e) =>
          e.name === node.param ? [[...b, e], f] : [b, [...f, e]],
        [[], []],
      );

      drawEdge(edgeGroup, x, y, "s", x, y + DIST_Y, "n");
      drawNode(nodeGroup, x, y, `λ${node.param}`);

      boundVars.forEach((v) => {
        const path = d3.path();
        path.moveTo(v.x, v.y);
        path.arcTo(
          v.x,
          y + (height + 1) * DIST_Y,
          x - widthLeft * DIST_X,
          y + (height + 1) * DIST_Y,
          RADIUS,
        );
        edgeGroup
          .append("path")
          .attr("d", path.toString())
          .attr("stroke", theme.value === "light" ? "#222" : "#FFF")
          .attr("fill", "none");
      });

      const maxX = boundVars.reduce((acc, v) => v.x > acc ? v.x : acc, 0);

      if (boundVars.length > 0) {
        const path = d3.path();
        path.moveTo(x, y);
        path.arcTo(
          x - widthLeft * DIST_X,
          y,
          x - widthLeft * DIST_X,
          y + (height + 1) * DIST_Y,
          RADIUS,
        );
        path.arcTo(
          x - widthLeft * DIST_X,
          y + (height + 1) * DIST_Y,
          x,
          y + (height + 1) * DIST_Y,
          RADIUS,
        );
        path.lineTo(maxX - RADIUS, y + (height + 1) * DIST_Y);
        edgeGroup
          .append("path")
          .attr("d", path.toString())
          .attr("stroke", theme.value === "light" ? "#222" : "#FFF")
          .attr("fill", "none");
      }

      const path2 = d3.path();
      path2.moveTo(x, y);
      path2.arcTo(
        x + widthRight * DIST_X,
        y,
        x + widthRight * DIST_X,
        y + (height + 1) * DIST_Y,
        RADIUS,
      );
      path2.arcTo(
        x + widthRight * DIST_X,
        y + (height + 1) * DIST_Y,
        x - widthLeft * DIST_X,
        y + (height + 1) * DIST_Y,
        RADIUS,
      );
      path2.arcTo(
        x - widthLeft * DIST_X,
        y + (height + 1) * DIST_Y,
        x - widthLeft * DIST_X,
        y,
        RADIUS,
      );
      path2.arcTo(
        x - widthLeft * DIST_X,
        y,
        x,
        y,
        RADIUS,
      );
      path2.lineTo(x, y);
      edgeGroup
        .append("path")
        .attr("d", path2.toString())
        .attr("stroke", theme.value === "light" ? "#222" : "#FFF")
        .attr("stroke-dasharray", "4,6")
        .attr("fill", "none");
      return {
        widthLeft: widthLeft + 1,
        widthRight: widthRight + 1,
        height: height + 2,
        vars: freeVars,
        nodeGroup,
        edgeGroup,
      };
    } else {
      // Variable node
      drawNode(nodeGroup, x, y, node.param);
      return {
        widthLeft: 1,
        widthRight: 1,
        height: 1,
        vars: [{ x, y, name: node.param }],
        nodeGroup,
        edgeGroup,
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
    } = draw(nodeGroup, edgeGroup, graph, node.func, nodeId, x, y + DIST_Y);
    const {
      widthLeft: widthLeftRight,
      widthRight: widthRightRight,
      height: heightRight,
      vars: varsRight,
      nodeGroup: nodeGroupRight,
      edgeGroup: edgeGroupRight,
    } = draw(nodeGroup, edgeGroup, graph, node.arg, nodeId, x, y + DIST_Y);

    const spread = (widthRightLeft + widthLeftRight) / 2;
    drawEdge(edgeGroup, x, y, "sw", x - spread * DIST_X, y + DIST_Y, "n");
    drawEdge(edgeGroup, x, y, "se", x + spread * DIST_X, y + DIST_Y, "n");
    drawNode(nodeGroup, x, y, `@`);

    nodeGroupLeft?.attr("transform", `translate(${-spread * DIST_X}, 0)`);
    edgeGroupLeft?.attr("transform", `translate(${-spread * DIST_X}, 0)`);
    varsLeft.forEach((v) => {
      v.x -= spread * DIST_X;
    });
    nodeGroupRight?.attr("transform", `translate(${spread * DIST_X}, 0)`);
    edgeGroupRight?.attr("transform", `translate(${spread * DIST_X}, 0)`);
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
    };
  }
  return {
    widthLeft: 1,
    widthRight: 1,
    height: 1,
    vars: [],
    nodeGroup,
    edgeGroup,
  };
}
