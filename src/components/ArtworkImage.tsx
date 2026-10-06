import { useState } from "react";
import {
  fallbackImageUrl,
  imageSource,
  imageUrl,
  type Artwork,
} from "../lib/artworks";
export function ArtworkImage({
  work,
  iiifUrl,
  eager = false,
}: {
  work: Artwork;
  iiifUrl: string;
  eager?: boolean;
}) {
  const primary = imageUrl(work, iiifUrl);
  const source = imageSource(work);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const src = failedSources.includes(primary) ? fallbackImageUrl(work) : primary;
  return !src || failedSources.includes(src) ? (
    <span className="image-unavailable">
      Image temporarily unavailable<span>{work.title}</span>
    </span>
  ) : (
    <img
      src={src}
      alt={
        work.thumbnail?.alt_text ||
        `${work.title}, by ${work.artist_title || "an unknown artist"}`
      }
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedSources((previous) => [...previous, src])}
      width={source?.width || work.thumbnail?.width || 843}
      height={source?.height || work.thumbnail?.height || 650}
    />
  );
}
