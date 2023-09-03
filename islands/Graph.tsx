import { JSX } from "preact";
import { batch, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export function Graph({ theme }: { theme: "light" | "dark" }) {
  const state = useSignal<"none" | "pan">("none");
  const translate = useSignal<{ x: number; y: number }>({ x: 0, y: 0 });
  const scale = useSignal<number>(1);
  const lastPos = useSignal<{ x: number; y: number }>({ x: 0, y: 0 });

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 10;

  // Set up event listeners
  useEffect(() => {
    const graph = document.getElementById("graph")!;

    // Press group
    const press = (e: any) => {
      // console.log("press", e);
      state.value = "pan";
      if (e.type === "touchstart") {
        e.preventDefault();
        lastPos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else {
        lastPos.value = { x: e.clientX, y: e.clientY };
      }
    };
    graph.addEventListener("mousedown", press);
    graph.addEventListener("touchstart", press);

    // Release group
    const release = (e: any) => {
      // console.log("release", e);
      state.value = "none";
    };
    addEventListener("mouseup", release);
    addEventListener("touchend", release);

    // Move group
    const move = (e: any) => {
      // console.log("move", e);
      if (state.value === "pan") {
        if (e.type === "mousemove") {
          translate.value = {
            x: translate.value.x + (e.clientX - lastPos.value.x) / scale.value,
            y: translate.value.y + (e.clientY - lastPos.value.y) / scale.value,
          };
        } else if (e.type === "touchmove") {
          e.preventDefault();
          translate.value = {
            x: translate.value.x +
              (e.touches[0].clientX - lastPos.value.x) / scale.value,
            y: translate.value.y +
              (e.touches[0].clientY - lastPos.value.y) / scale.value,
          };
        }
      }

      if (e.type === "mousemove") {
        lastPos.value = { x: e.clientX, y: e.clientY };
      } else if (e.type === "touchmove") {
        lastPos.value = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    addEventListener("mousemove", move);
    addEventListener("touchmove", move, { passive: false });

    // Mouse wheel
    const wheel = (e: any) => {
      // console.log("wheel", e);
      const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
      let newScale = 1;
      if (delta > 0) {
        newScale = Math.min(scale.value * (1 + 0.001 * delta), MAX_SCALE);
      } else if (delta < 0) {
        newScale = Math.max(scale.value / (1 + 0.001 * -delta), MIN_SCALE);
      }

      const scaleDelta = 1 - newScale / scale.value;
      let rec = graph.getBoundingClientRect();
      let x = (e.clientX - rec.x) / newScale;
      let y = (e.clientY - rec.y) / newScale;

      batch(() => {
        scale.value = newScale;
        translate.value.x = translate.value.x + x * scaleDelta;
        translate.value.y = translate.value.y + y * scaleDelta;
      });
    };
    graph.addEventListener("wheel", wheel);

    // Return function to remove event listeners
    return () => {
      removeEventListener("mousedown", press);
      removeEventListener("touchstart", press);
      removeEventListener("mouseup", release);
      removeEventListener("touchend", release);
      removeEventListener("mousemove", move);
      removeEventListener("touchmove", move);
      removeEventListener("wheel", wheel);
    };
  }, []);

  return (
    <svg
      id="graph"
      class="rounded flex-1 w-full h-full bg-transparent border-1 select-none cursor-pointer"
      style={{
        borderColor: theme === "light" ? "#000D" : "#FFF6",
        backgroundColor: "inherit",
      }}
    >
      <g id="zoom" transform={`scale(${scale.value})`}>
        <g
          id="pan"
          transform={`translate(${translate.value.x}, ${translate.value.y})`}
        >
          <pattern
            id="pattern-circles"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <circle
              id="pattern-circle"
              cx="8"
              cy="8"
              r="1"
              fill={theme === "light" ? "#0004" : "#FFF3"}
            >
            </circle>
          </pattern>
          <rect
            id="background"
            x="-1000000"
            y="-1000000"
            width="2000000"
            height="2000000"
            fill="url(#pattern-circles)"
          />
          <g id="edgeGroup" />
          <g id="nodeGroup" />
        </g>
      </g>
    </svg>
  );
}
