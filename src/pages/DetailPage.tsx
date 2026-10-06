import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArtworkImage } from "../components/ArtworkImage";
import { Icon } from "../components/Icon";
import {
  artistName,
  descriptionParagraphs,
  imageSource,
  type Collection,
} from "../lib/artworks";
import {
  browseUrl,
  detailUrl,
  readOptions,
  selectArtworks,
} from "../lib/browse";

export function DetailPage({ collection }: { collection: Collection }) {
  const { id } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const view = params.get("from") === "list" ? "list" : "gallery";
  const work = collection.artworks.find((item) => String(item.id) === id);
  const filtered = selectArtworks(collection.artworks, readOptions(params));
  // A direct URL remains useful even if it contains filters that exclude the artwork.
  const inResults = filtered.some((item) => item.id === work?.id);
  const sequence = inResults ? filtered : collection.artworks;
  const position = sequence.findIndex((item) => item.id === work?.id);
  const previous = sequence[(position - 1 + sequence.length) % sequence.length];
  const next = sequence[(position + 1) % sequence.length];
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    document.title = work
      ? `${work.title} — Étude`
      : "Artwork not found — Étude";
    return () => {
      document.title = "Étude — A slower way to see";
    };
  }, [work]);
  if (!work)
    return (
      <section className="empty-state shell">
        <p className="eyebrow">AN EMPTY WALL</p>
        <h1>This work isn’t in our collection.</h1>
        <p>
          The link may be incorrect, or this artwork may be temporarily
          unavailable.
        </p>
        <Link to="/" className="button">
          Return to the collection
        </Link>
      </section>
    );
  const paragraphs = descriptionParagraphs(work.description);
  const source = imageSource(work);
  const destination = (artworkId: number) =>
    detailUrl(artworkId, view, inResults ? search : "");
  return (
    <article className="detail shell">
      <div className="detail-top">
        <Link className="text-link" to={browseUrl(view, search)}>
          <Icon name="back" /> Back to {view}
        </Link>
        <span className="eyebrow">
          {String(position + 1).padStart(2, "0")} /{" "}
          {String(sequence.length).padStart(2, "0")} ·{" "}
          {inResults && sequence.length < collection.artworks.length
            ? "YOUR SELECTION"
            : "THE COLLECTION"}
        </span>
      </div>
      <div className="detail-layout">
        <div className="detail-visual">
          <button
            className="painting-button"
            onClick={() => dialog.current?.showModal()}
            aria-label={`Enlarge ${work.title}`}
          >
            <ArtworkImage
              key={work.id}
              work={work}
              iiifUrl={collection.iiifUrl}
              eager
            />
            <span className="enlarge-label">
              <Icon name="expand" /> Take a closer look
            </span>
          </button>
          <p className="image-credit">
            Art Institute of Chicago collection
            {source && (
              <>
                <br />
                <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                  Fallback image via Wikimedia Commons
                </a>
                {" · "}
                <a href={source.licenseUrl} target="_blank" rel="noreferrer">
                  {source.license}
                </a>
                {source.license.startsWith("CC BY") && (
                  <>
                    <br />
                    {source.credit} · Resized and converted to WebP
                  </>
                )}
              </>
            )}
          </p>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{work.style_title || "FROM THE COLLECTION"}</p>
          <h1>{work.title}</h1>
          <p className="detail-artist">{artistName(work)}</p>
          <p className="detail-date">{work.date_display}</p>
          <div className="detail-description">
            {paragraphs.length ? (
              paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>
                A work from the Art Institute of Chicago’s collection. Explore
                its material, scale, and origins below, or visit the museum’s
                record for more information.
              </p>
            )}
          </div>
          <dl className="artwork-facts">
            {[
              ["Medium", work.medium_display],
              ["Dimensions", work.dimensions],
              ["Origin", work.place_of_origin],
              ["Credit", work.credit_line],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "Not recorded"}</dd>
              </div>
            ))}
          </dl>
          <a
            className="text-link museum-link"
            href={`https://www.artic.edu/artworks/${work.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Visit the museum’s artwork page <Icon name="external" />
          </a>
          <p className="description-credit">
            Collection text: Art Institute of Chicago,{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 4.0
            </a>
            . Formatting adapted.
          </p>
        </div>
      </div>
      <nav className="detail-navigation" aria-label="Browse artworks">
        {sequence.length > 1 ? (
          <>
            <Link to={destination(previous.id)}>
              <Icon name="back" />
              <span>
                <span className="eyebrow">PREVIOUS WORK</span>
                <strong>{previous.title}</strong>
              </span>
            </Link>
            <Link
              className="back-grid"
              to={browseUrl(view, search)}
              aria-label={`Return to ${view}`}
            >
              <Icon name={view === "gallery" ? "grid" : "list"} />
            </Link>
            <Link to={destination(next.id)}>
              <span>
                <span className="eyebrow">NEXT WORK</span>
                <strong>{next.title}</strong>
              </span>
              <Icon name="arrow" />
            </Link>
          </>
        ) : (
          <>
            <button disabled className="disabled-navigation">
              <Icon name="back" /> Previous work
            </button>
            <Link
              className="back-grid"
              to={browseUrl(view, search)}
              aria-label={`Return to ${view}`}
            >
              <Icon name={view === "gallery" ? "grid" : "list"} />
            </Link>
            <button disabled className="disabled-navigation">
              Next work <Icon name="arrow" />
            </button>
            <p className="single-result-note">
              One work in this selection.{" "}
              <Link to="/">Explore the full collection</Link>
            </p>
          </>
        )}
      </nav>
      <dialog
        className="image-dialog"
        ref={dialog}
        aria-label={`Enlarged artwork: ${work.title}`}
      >
        <div className="dialog-heading">
          <span>
            {work.title} · {artistName(work)}
          </span>
          <button
            className="dialog-close"
            onClick={() => dialog.current?.close()}
            aria-label="Close enlarged artwork"
            autoFocus
          >
            <Icon name="close" />
          </button>
        </div>
        <ArtworkImage
          key={`large-${work.id}`}
          work={work}
          iiifUrl={collection.iiifUrl}
          eager
        />
      </dialog>
    </article>
  );
}
