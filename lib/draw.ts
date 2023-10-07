import * as d3 from "d3";

// The type of an SVG node.
type SVG = d3.Selection<Element, any, any, any>;

// A 2-dimensional node, with x and y coordinates.
// It can have any number of children `Node`s.
class Node {
  // The x coordinate of the node relative to its parent
  _x = 0;

  // The y coordinate of the node relative to its parent
  _y = 0;

  // Debug
  _debug = true;

  // A list of SVG nodes, each representing a layer (from deepest to shallowest)
  layers: Record<number, SVG> = {};

  // The children of the node
  readonly children: Node[] = [];

  get x() {
    return this._x;
  }

  // Sets the local x coordinate of this node, relative to its parent
  set x(value) {
    this._x = value;
    // update this node's svgs
  }

  get y() {
    return this._y;
  }

  // Sets the local y coordinate of this node, relative to its parent
  set y(value) {
    this._y = value;
    // update this node's svgs
  }

  addChild(node: Node) {
    this.children.push(node);
  }

  // Returns the bounding box of this node and all its descendants.
  get boundingBox() {
    const boundingBox = { x0: this.x, y0: this.y, x1: this.x, y1: this.y };
    for (const child of this.children) {
      boundingBox.x0 = Math.min(boundingBox.x0, child.boundingBox.x0);
      boundingBox.y0 = Math.min(boundingBox.y0, child.boundingBox.y0);
      boundingBox.x1 = Math.max(boundingBox.x1, child.boundingBox.x1);
      boundingBox.y1 = Math.max(boundingBox.y1, child.boundingBox.y1);
    }
    return boundingBox;
  }
}

export function text(text: string): SVG {
  return (
    d3
      .create("svg:text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", theme === "light" ? "#222" : "#FFF")
      // .attr("stroke", "blue")
      // .attr("fill", "red")
      .style("font-size", "20px")
      .text(text)
  );
}

export function ..
