import type { Artwork } from "./artworks";
import { artistName } from "./artworks";
export type SortKey = "curated" | "title" | "date" | "artist";
export type Movement =
  "all" | "impressionism" | "post-impressionism" | "pointillism";
export interface BrowseOptions {
  query: string;
  artist: string;
  movement: Movement;
  sort: SortKey;
  descending: boolean;
}
const movements: Movement[] = [
  "all",
  "impressionism",
  "post-impressionism",
  "pointillism",
];
const sorts: SortKey[] = ["curated", "title", "date", "artist"];
export function readOptions(params: URLSearchParams): BrowseOptions {
  const movement = params.get("movement") as Movement;
  const sort = params.get("sort") as SortKey;
  return {
    query: params.get("q") || "",
    artist: params.get("artist") || "",
    movement: movements.includes(movement) ? movement : "all",
    sort: sorts.includes(sort) ? sort : "curated",
    descending: params.get("order") === "desc",
  };
}
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function selectArtworks(artworks: Artwork[], options: BrowseOptions) {
  const terms = normalize(options.query).trim().split(/\s+/).filter(Boolean);
  const result = artworks.filter((work) => {
    const searchable = normalize(
      [
        work.title,
        artistName(work),
        work.date_display,
        work.style_title,
        work.medium_display,
      ].join(" "),
    );
    return (
      terms.every((term) => searchable.includes(term)) &&
      (!options.artist || work.artist_title === options.artist) &&
      (options.movement === "all" ||
        work.style_title?.toLowerCase() === options.movement)
    );
  });
  if (options.sort !== "curated")
    result.sort((a, b) => {
      if (options.sort === "date") {
        if (a.date_start === null)
          return b.date_start === null ? a.id - b.id : 1;
        if (b.date_start === null) return -1;
        return a.date_start - b.date_start || a.title.localeCompare(b.title);
      }
      const value =
        options.sort === "artist" ? artistName : (work: Artwork) => work.title;
      return value(a).localeCompare(value(b)) || a.id - b.id;
    });
  return options.descending ? result.reverse() : result;
}
export function browseUrl(view: "gallery" | "list", search: string) {
  const params = new URLSearchParams(search);
  params.delete("from");
  const query = params.toString();
  return `${view === "list" ? "/list" : "/"}${query ? `?${query}` : ""}#collection`;
}
export function detailUrl(
  id: number,
  view: "gallery" | "list",
  search: string,
) {
  const params = new URLSearchParams(search);
  params.set("from", view);
  return `/artworks/${id}?${params.toString()}`;
}
