import { useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { artistName, type Collection } from "../lib/artworks";
import {
  browseUrl,
  detailUrl,
  readOptions,
  selectArtworks,
} from "../lib/browse";
import { FEATURED_ID } from "../data/collection";
import { ArtworkImage } from "../components/ArtworkImage";
import { Icon } from "../components/Icon";

export function CollectionPage({
  collection,
  view,
}: {
  collection: Collection;
  view: "gallery" | "list";
}) {
  const [params, setParams] = useSearchParams();
  const { search, hash } = useLocation();
  useEffect(() => {
    if (hash === "#collection") {
      document
        .getElementById("collection")
        ?.scrollIntoView({ behavior: "instant" });
    }
  }, [view, hash]);
  const options = readOptions(params);
  const results = selectArtworks(collection.artworks, options);
  const featured =
    collection.artworks.find((work) => work.id === FEATURED_ID) ||
    collection.artworks[0];
  const artists = [...new Set(collection.artworks.map(artistName))].sort();
  const isFiltered = Boolean(
    options.query || options.artist || options.movement !== "all",
  );
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }
  function reset() {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const key of ["q", "artist", "movement"]) next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  return (
    <>
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="little-line" /> A COLLECTION TO GET LOST IN
          </p>
          <h1 id="hero-title">
            A slower way
            <br />
            <em>to see.</em>
          </h1>
          <p className="hero-description">
            Fleeting light. Ordinary moments. Extraordinary ways of seeing.
            Spend a little time with the masters of Impressionism and beyond.
          </p>
          <a href="#collection" className="text-link">
            Explore the collection <Icon name="arrow" />
          </a>
          <div className="hero-footnote">
            <span>01 — 24</span>
            <span>
              Selected works from the
              <br />
              Art Institute of Chicago
            </span>
          </div>
        </div>
        <figure className="hero-art">
          <Link
            to={detailUrl(featured.id, "gallery", "")}
            aria-label={`Discover ${featured.title}`}
          >
            <ArtworkImage
              key={featured.id}
              work={featured}
              iiifUrl={collection.iiifUrl}
              eager
            />
          </Link>
          <figcaption>
            <span>
              <span className="eyebrow">
                IN FOCUS · {featured.date_display}
              </span>
              <strong>{featured.title}</strong>
              <span>{artistName(featured)}</span>
            </span>
            <Link
              to={detailUrl(featured.id, "gallery", "")}
              className="round-link"
              aria-label={`View ${featured.title}`}
            >
              <Icon name="arrow" />
            </Link>
          </figcaption>
          <span className="art-side-note">A STUDY IN STILLNESS</span>
        </figure>
      </section>
      <section
        className="collection shell"
        id="collection"
        aria-labelledby="collection-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE CURATED COLLECTION</p>
            <h2 id="collection-title">An invitation to look closer.</h2>
          </div>
          <div className="view-switch" aria-label="Collection view">
            <Link
              to={browseUrl("gallery", search)}
              className={view === "gallery" ? "selected" : ""}
              aria-current={view === "gallery" ? "page" : undefined}
            >
              <Icon name="grid" />
              Gallery
            </Link>
            <Link
              to={browseUrl("list", search)}
              className={view === "list" ? "selected" : ""}
              aria-current={view === "list" ? "page" : undefined}
            >
              <Icon name="list" />
              List
            </Link>
          </div>
        </div>
        <div className="collection-toolbar">
          <div className="search-field">
            <Icon name="search" />
            <label className="sr-only" htmlFor="art-search">
              Search the collection
            </label>
            <input
              id="art-search"
              type="search"
              placeholder="Find an artwork, artist, or moment…"
              value={options.query}
              onChange={(event) => update("q", event.target.value)}
            />
            {options.query && (
              <button aria-label="Clear search" onClick={() => update("q", "")}>
                <Icon name="close" />
              </button>
            )}
          </div>
          <div className="sort-controls">
            <label htmlFor="sort-by">Sort by</label>
            <select
              id="sort-by"
              value={options.sort}
              onChange={(event) => update("sort", event.target.value)}
            >
              <option value="curated">Curator’s selection</option>
              <option value="title">Title</option>
              <option value="date">Year created</option>
              <option value="artist">Artist</option>
            </select>
            <button
              className="order-button"
              onClick={() =>
                update("order", options.descending ? "asc" : "desc")
              }
              aria-label={
                options.descending ? "Sort ascending" : "Sort descending"
              }
              title={
                options.descending
                  ? "Change to ascending"
                  : "Change to descending"
              }
            >
              <Icon name="sort" />
              <span>{options.descending ? "Descending" : "Ascending"}</span>
            </button>
          </div>
        </div>
        <div className="filter-row">
          <div
            className="filter-chips"
            role="group"
            aria-label="Filter by movement"
          >
            {(
              [
                ["all", "All works"],
                ["impressionism", "Impressionism"],
                ["post-impressionism", "Post-Impressionism"],
                ["pointillism", "Pointillism"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                className={
                  options.movement === value
                    ? "filter-chip selected"
                    : "filter-chip"
                }
                aria-pressed={options.movement === value}
                onClick={() => update("movement", value === "all" ? "" : value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="artist-filter">
            <label className="sr-only" htmlFor="artist-filter">
              Filter by artist
            </label>
            <select
              id="artist-filter"
              value={options.artist}
              onChange={(event) => update("artist", event.target.value)}
            >
              <option value="">All artists</option>
              {artists.map((artist) => (
                <option key={artist}>{artist}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="results-meta">
          <p role="status">
            {results.length} {results.length === 1 ? "work" : "works"}
            {isFiltered
              ? ` of ${collection.artworks.length}`
              : " · A small collection, a world to discover"}
          </p>
          {isFiltered && (
            <button className="reset-button" onClick={reset}>
              Reset filters <Icon name="close" />
            </button>
          )}
        </div>
        {collection.missingCount > 0 && (
          <p className="notice">
            {collection.missingCount}{" "}
            {collection.missingCount === 1 ? "work is" : "works are"}{" "}
            temporarily unavailable from the museum.
          </p>
        )}
        {!results.length ? (
          <div className="empty-state">
            <span className="empty-flower">✳</span>
            <h3>No works in this corner.</h3>
            <p>
              Try another title or artist, or give your search a little more
              room.
            </p>
            <button className="button" onClick={reset}>
              Show all works
            </button>
          </div>
        ) : view === "gallery" ? (
          <ul className="art-grid">
            {results.map((work, index) => (
              <li key={work.id}>
                <Link
                  className="art-card"
                  to={detailUrl(work.id, view, search)}
                >
                  <div className="art-image">
                    <ArtworkImage
                      work={work}
                      iiifUrl={collection.iiifUrl}
                      eager={index < 3}
                    />
                    <span className="card-open">
                      <Icon name="arrow" />
                    </span>
                  </div>
                  <div className="card-meta">
                    <span className="artist-label">{artistName(work)}</span>
                    <span>{work.date_display}</span>
                  </div>
                  <h3>{work.title}</h3>
                  <p className="card-medium">{work.medium_display}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="art-list">
            <div className="list-labels" aria-hidden="true">
              <span>ARTWORK</span>
              <span>ARTIST</span>
              <span>YEAR</span>
              <span>MOVEMENT</span>
              <span />
            </div>
            <ul>
              {results.map((work) => (
                <li key={work.id}>
                  <Link
                    className="art-row"
                    to={detailUrl(work.id, view, search)}
                  >
                    <span className="row-art">
                      <span className="row-image">
                        <ArtworkImage
                          work={work}
                          iiifUrl={collection.iiifUrl}
                        />
                      </span>
                      <span>
                        <strong>{work.title}</strong>
                        <span className="row-medium">
                          {work.medium_display}
                        </span>
                      </span>
                    </span>
                    <span className="row-artist">{artistName(work)}</span>
                    <span className="row-year">{work.date_display}</span>
                    <span className="row-movement">
                      {work.style_title || "Not classified"}
                    </span>
                    <Icon name="arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="collection-end">
          <span /> <p>Stay a little. Look again.</p> <span />
        </div>
      </section>
      <section className="closing-note">
        <div className="shell closing-inner">
          <p className="eyebrow">A DIFFERENT KIND OF GALLERY</p>
          <h2>
            No rush.
            <br />
            <em>Just a little curiosity.</em>
          </h2>
          <div>
            <p>
              These paintings reward a second glance. A reflection in the water.
              A patch of afternoon sun. Something you didn’t notice the first
              time.
            </p>
            <Link to="/about" className="text-link">
              Our perspective <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
