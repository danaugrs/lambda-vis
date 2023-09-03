import { signal } from "@preact/signals";

const storedTheme = localStorage.getItem("theme");
export const theme = signal<"light" | "dark">(
  (storedTheme as "light" | "dark") || "dark",
);

export function ThemeToggle() {
  return (
    <button
      class="h-8 w-8 flex items-center justify-center rounded border-1"
      style={{ borderColor: theme.value === "light" ? "#000D" : "#FFF6" }}
      onClick={() => {
        if (theme.value === "light") {
          theme.value = "dark";
          localStorage.setItem("theme", "dark");
        } else {
          theme.value = "light";
          localStorage.setItem("theme", "light");
        }
      }}
    >
      {theme.value === "light" ? <DarkThemeIcon /> : <LightThemeIcon />}
    </button>
  );
}

const DarkThemeIcon = () => (
  <svg
    fill="none"
    viewBox="2 2 20 20"
    width="12"
    height="12"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      fill="currentColor"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    >
    </path>
  </svg>
);

const LightThemeIcon = () => (
  <svg
    fill="none"
    viewBox="3 3 18 18"
    width="12"
    height="12"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      fill="currentColor"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    >
    </path>
  </svg>
);
