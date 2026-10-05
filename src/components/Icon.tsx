type IconName =
  | "arrow"
  | "back"
  | "search"
  | "grid"
  | "list"
  | "close"
  | "expand"
  | "sort"
  | "external";
const paths: Record<IconName, string> = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  back: "M20 12H4m6-6-6 6 6 6",
  search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  grid: "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z",
  list: "M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01",
  close: "m6 6 12 12M6 18 18 6",
  expand: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  sort: "M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4",
  external: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
};
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function LilyMark() {
  return (
    <svg
      className="lily-mark"
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
    >
      <path d="M22 6c-7 8-8 16 0 25 8-9 7-17 0-25Z" stroke="currentColor" />
      <path
        d="M8 14c-2 10 2 17 14 17-1-11-6-16-14-17Zm28 0c2 10-2 17-14 17 1-11 6-16 14-17ZM5 27c10 13 24 13 34 0"
        stroke="currentColor"
      />
    </svg>
  );
}
