import { useState } from "react";
import { imageUrl, type Artwork } from "../lib/artworks";
export function ArtworkImage({
  work,
  iiifUrl,
  eager = false,
}: {
  work: Artwork;
  iiifUrl: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="image-unavailable">
      Image temporarily unavailable<span>{work.title}</span>
    </span>
  ) : (
    <img
      src={imageUrl(work, iiifUrl)}
      alt={
        work.thumbnail?.alt_text ||
        `${work.title}, by ${work.artist_title || "an unknown artist"}`
      }
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      width={work.thumbnail?.width || 843}
      height={work.thumbnail?.height || 650}
    />
  );
}
