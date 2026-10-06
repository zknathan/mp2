import { Link } from "react-router-dom";
import { LilyMark, Icon } from "../components/Icon";
import { COLLECTION_IDS } from "../data/collection";
export function AboutPage() {
  return (
    <section className="about shell">
      <p className="eyebrow">OUR PERSPECTIVE</p>
      <h1>
        Less scrolling.
        <br />
        <em>More seeing.</em>
      </h1>
      <div className="about-body">
        <LilyMark />
        <div>
          <p className="about-lead">
            Étude is a small, independent space for spending time with art.
          </p>
          <p>
            Our selection brings together {COLLECTION_IDS.length} works from the
            Art Institute of Chicago, beginning with the shifting light of
            Claude Monet and extending to the vivid worlds of his
            contemporaries.
          </p>
          <p>
            Browse by feeling, search for an old favorite, or follow one
            painting into the next. The collection is intentionally small. There
            is no right order, and no need to see everything at once.
          </p>
          <h2>A note on the collection</h2>
          <p>
            Artwork records are provided by the{" "}
            <a
              href="https://api.artic.edu/docs/"
              target="_blank"
              rel="noreferrer"
            >
              Art Institute of Chicago’s public API
            </a>
            . This is an independent student project, not an official museum
            website. The selection focuses on Impressionism, Post-Impressionism,
            and Pointillism; it does not represent the museum’s entire
            collection.
          </p>
          <p>
            The selected artworks are marked public domain by the museum. Images
            come from the museum, with copies from Wikimedia Commons available
            when the museum’s image service cannot load; their
            sources and individual reproduction licenses are linked below each
            painting. Artwork descriptions are credited to the Art Institute of
            Chicago under{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 4.0
            </a>
            ; HTML formatting is converted to plain paragraphs. Other collection
            metadata is made available under CC0.
          </p>
          <Link className="text-link" to="/">
            Find your next favorite <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
