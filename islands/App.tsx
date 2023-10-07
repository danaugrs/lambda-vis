import { useEffect } from "preact/hooks";
import { DIST_X, DIST_Y, draw } from "../lib/graph.ts";
import { parse, ParseResult } from "../lib/parser.gen.ts";
import { useSignal } from "@preact/signals";
import { Graph, parseNode } from "../lib/runtime.ts";
import * as d3 from "d3";
import { ThemeToggle } from "../components/ThemeToggle.tsx";
import { Graph as LambdaGraph } from "./Graph.tsx";
import { Head, IS_BROWSER } from "$fresh/runtime.ts";
import { parseExpr } from "../lib/ast.ts";
import IconArrowLeft from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/arrow-left.tsx";
import IconArrowRight from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/arrow-right.tsx";

const title = "Interactive Visualization of λ-Calculi Graph Reduction";

const prettifyExpr = (expr: string) => expr.replaceAll("\\", "λ");
const cleanExpr = (expr: string) =>
  expr
    .replace(/\(\s+/g, "(") // remove spaces to the right of "("
    .replace(/\s+\)/g, ")") // remove spaces to the left of ")"
    .replace(/(?<!(\())\(/g, " (") // add spaces to the left of a sequence of "("
    .replace(/\)(?!(\)))/g, ") ") // add spaces to the right of a sequence of ")"
    .replace(/\.\s+/g, ".") // remove spaces to the right of "."
    .replace(/\s+\./g, ".") // remove spaces to the left of "."
    .replace(/\s\s+/g, " ") // combine adjacent spaces
    .trim();

enum ReductionMethod {
  NaiveCopyingTree = "Naive Copying (Tree)",
  NaiveCopyingGraph = "Naive Copying (Graph)",
  MaximalFreeSubgraphSharing = "Maximal Free Subgraph Sharing",
  BracketsAndCroissants = "Brackets & Croissants",
  Lambdascope = "Lambdascope",
  LambdaNets = "λ-Nets",
  FNets = "ƒ-Nets",
}

export default function App() {
  // Expression
  const storedExpr = IS_BROWSER && window.localStorage.getItem("expr");
  const expression = useSignal<string>(storedExpr || "λx.λf.f (f x)");

  // Reduction method
  const method = useSignal<ReductionMethod>(ReductionMethod.NaiveCopying);

  // Theme
  const storedTheme = IS_BROWSER && window.localStorage.getItem("theme");
  const theme = useSignal<"light" | "dark">(
    (storedTheme as "light" | "dark") || "dark",
  );

  // AST
  const ast = useSignal<ParseResult | null>(null);

  const onInput = (e: any) => {
    // Save current selection
    const caretStart = e.target.selectionStart;
    const caretEnd = e.target.selectionEnd;
    // Prettify, save previous expression, and update
    const expr = prettifyExpr(e.target.value);
    const prevExpr = expression.value;
    expression.value = expr;
    window.localStorage.setItem("expr", expr);
    // Defer an update to the selection range
    setTimeout(
      () =>
        e.target.setSelectionRange &&
        e.target.setSelectionRange(caretStart, caretEnd),
      0,
    );
    // Parse expression
    const exprForParsing = cleanExpr(expr);
    if (exprForParsing.length === 0) {
      // Clear graph
      const nodeGroup = d3.select("#nodeGroup");
      const edgeGroup = d3.select("#edgeGroup");
      const highlightGroup = d3.select("#highlightGroup");
      nodeGroup.selectAll("*").remove(); // Clear existing graph
      edgeGroup.selectAll("*").remove(); // Clear existing graph
      highlightGroup.selectAll("*").remove(); // Clear existing graph
      return;
    }
    const newAst = parse(exprForParsing);
    const NEW_AST = parseExpr(exprForParsing);
    console.log("NEW_AST", NEW_AST);
    // Update AST
    ast.value = newAst;
    if (newAst.errs.length) {
      if (exprForParsing !== cleanExpr(prevExpr)) {
        // Show parsing errors in the console if any (only if expression changed)
        console.log("Parsing Error(s):", newAst.errs);
      }
    } else {
      const nodeGroup = d3.select("#nodeGroup");
      const edgeGroup = d3.select("#edgeGroup");
      const highlightGroup = d3.select("#highlightGroup");
      nodeGroup.selectAll("*").remove(); // Clear existing graph
      edgeGroup.selectAll("*").remove(); // Clear existing graph
      highlightGroup.selectAll("*").remove(); // Clear existing graph
      const graph: Graph = [];
      parseNode(newAst.ast!, {}, graph, "root", null);
      console.log("Graph: ", graph);
      const { widthLeft, widthRight, height } = draw(
        nodeGroup,
        edgeGroup,
        highlightGroup,
        graph,
        0,
        "root",
        0,
        DIST_Y,
        theme.value,
      );
      const width = widthLeft + widthRight;

      // Center graph
      const graphEl = document.getElementById("graph")!;
      const rect = graphEl.getBoundingClientRect();
      const scale = Math.min(
        rect.width / (width * DIST_X),
        rect.height / ((height + 1) * DIST_Y),
      );
      nodeGroup?.attr(
        "transform",
        `translate(${widthLeft * 25 * scale}, 0) scale(${scale})`,
      );
      edgeGroup?.attr(
        "transform",
        `translate(${widthLeft * 25 * scale}, 0) scale(${scale})`,
      );
      highlightGroup?.attr(
        "transform",
        `translate(${widthLeft * 25 * scale}, 0) scale(${scale})`,
      );
    }
  };

  // Trigger a redraw when the theme changes
  useEffect(() => {
    onInput({
      target: { value: expression.value, selectionStart: 0, selectionEnd: 0 },
    });
  }, [theme.value]);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div
        id="main"
        class="w-screen h-screen p-2 flex flex-col"
        style={{
          color: theme.value === "light" ? "#000D" : "#FFFD",
          background: theme.value === "light" ? "#FAFAFA" : "#222",
          fontFamily:
            "Optima, Candara, 'Noto Sans', source-sans-pro, sans-serif",
        }}
      >
        <div class="flex flex-row justify-between w-full space-x-1">
          <p class="mb-2 text-xl">
            {title} (<a href="#" class="underline">read the paper</a>)
          </p>
          <div class="flex flex-row align-center space-x-1">
            <a
              class="h-8 w-8 flex items-center justify-center rounded border-1"
              style={{
                borderColor: theme.value === "light" ? "#000D" : "#FFF6",
              }}
              href="https://github.com/danaugrs/lambda-vis"
              target={"_blank"}
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </a>
            <ThemeToggle theme={theme} />
          </div>
        </div>
        <p class="mb-2">
          Type a λ-calculi expression below (backslash = λ). Click on
          highlighted nodes to reduce them.
        </p>
        <div class="flex gap-2 w-full flex-col flex-1 bg-inherit">
          <div class="flex flex-col md:flex-row justify-between bg-inherit gap-2">
            <input
              placeholder="Type a λ-calculi expression"
              onBlur={() => {
                expression.value = cleanExpr(expression.value);
              }}
              class="border-1 w-full rounded p-2 text-xl h-[42px]"
              style={{
                borderColor: theme.value === "light" ? "#000D" : "#FFF6",
                background: theme.value === "light" ? "white" : "#1A1A1A",
                color: expression.value.length && ast.value?.errs.length
                  ? "red"
                  : "inherit",
              }}
              value={expression.value}
              onInput={onInput}
            />
            <div class="flex flex-col sm:flex-row gap-2">
              <select
                onChange={(e) => {
                  method.value = (e?.target as HTMLSelectElement)
                    .value as ReductionMethod;
                }}
                value={method.value}
                class="border-1 rounded p-2 text-xl h-[42px] bg-inherit flex-1"
                style={{
                  borderColor: theme.value === "light" ? "#000D" : "#FFF6",
                  background: theme.value === "light" ? "white" : "#1A1A1A",
                }}
              >
                <optgroup label="Optimal">
                  <option value={ReductionMethod.FNets}>
                    ƒ-Nets (2023, mine)
                  </option>
                  <option value={ReductionMethod.LambdaNets}>
                    λ-Nets (2023, mine)
                  </option>
                </optgroup>
                <optgroup label="Beta-Optimal">
                  <option value={ReductionMethod.Lambdascope}>
                    Lambdascope (2004)
                  </option>
                  <option value={ReductionMethod.BracketsAndCroissants}>
                    Brackets & Croissants (1992)
                  </option>
                </optgroup>
                <optgroup label="Suboptimal">
                  <option
                    value={ReductionMethod.MaximalFreeSubgraphSharing}
                    selected
                  >
                    Maximal Free Subgraph Sharing (1971)
                  </option>
                  <option value={ReductionMethod.NaiveCopyingGraph} selected>
                    Naive Copying (Graph)
                  </option>
                  <option value={ReductionMethod.NaiveCopyingTree} selected>
                    Naive Copying (Tree)
                  </option>
                </optgroup>
              </select>
              <div class="flex flex-row gap-2">
                <button
                  class="border-1 rounded p-2 text-xl h-[42px] bg-inherit flex-1 sm:flex-none flex flex-row justify-center"
                  style={{
                    borderColor: theme.value === "light" ? "#000D" : "#FFF6",
                    background: theme.value === "light" ? "white" : "#1A1A1A",
                  }}
                >
                  <IconArrowLeft />
                </button>
                <div
                  class="border-1 rounded p-2 text-xl h-[42px] bg-inherit"
                  style={{
                    borderColor: theme.value === "light" ? "#000D" : "#FFF6",
                    background: theme.value === "light" ? "white" : "#1A1A1A",
                  }}
                >
                  3/32
                </div>
                <button
                  disabled
                  class="border-1 rounded p-2 text-xl h-[42px] bg-inherit flex-1 sm:flex-none flex flex-row justify-center"
                  style={{
                    borderColor: theme.value === "light" ? "#000D" : "#FFF6",
                    background: theme.value === "light" ? "white" : "#1A1A1A",
                  }}
                >
                  <IconArrowRight color="gray" />
                </button>
              </div>
            </div>
          </div>
          <LambdaGraph theme={theme.value} />
        </div>
      </div>
    </>
  );
}

const GitHubIcon = () => {
  return (
    <svg width="24" height="24" fill="currentColor" viewBox="3 3 18 18">
      <title>GitHub</title>
      <path d="M12 3C7.0275 3 3 7.12937 3 12.2276C3 16.3109 5.57625 19.7597 9.15374 20.9824C9.60374 21.0631 9.77249 20.7863 9.77249 20.5441C9.77249 20.3249 9.76125 19.5982 9.76125 18.8254C7.5 19.2522 6.915 18.2602 6.735 17.7412C6.63375 17.4759 6.19499 16.6569 5.8125 16.4378C5.4975 16.2647 5.0475 15.838 5.80124 15.8264C6.51 15.8149 7.01625 16.4954 7.18499 16.7723C7.99499 18.1679 9.28875 17.7758 9.80625 17.5335C9.885 16.9337 10.1212 16.53 10.38 16.2993C8.3775 16.0687 6.285 15.2728 6.285 11.7432C6.285 10.7397 6.63375 9.9092 7.20749 9.26326C7.1175 9.03257 6.8025 8.08674 7.2975 6.81794C7.2975 6.81794 8.05125 6.57571 9.77249 7.76377C10.4925 7.55615 11.2575 7.45234 12.0225 7.45234C12.7875 7.45234 13.5525 7.55615 14.2725 7.76377C15.9937 6.56418 16.7475 6.81794 16.7475 6.81794C17.2424 8.08674 16.9275 9.03257 16.8375 9.26326C17.4113 9.9092 17.76 10.7281 17.76 11.7432C17.76 15.2843 15.6563 16.0687 13.6537 16.2993C13.98 16.5877 14.2613 17.1414 14.2613 18.0065C14.2613 19.2407 14.25 20.2326 14.25 20.5441C14.25 20.7863 14.4188 21.0746 14.8688 20.9824C16.6554 20.364 18.2079 19.1866 19.3078 17.6162C20.4077 16.0457 20.9995 14.1611 21 12.2276C21 7.12937 16.9725 3 12 3Z">
      </path>
    </svg>
  );
};
