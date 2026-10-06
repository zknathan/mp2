import axios from "axios";
import { COLLECTION_IDS } from "../data/collection";
import imageManifest from "../data/artwork-images.json";

export interface ArtworkImageSource {
  file: string;
  width: number;
  height: number;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  credit: string;
  changes: string;
}
const artworkImages: Record<string, ArtworkImageSource> = imageManifest;

export function imageSource(work: Artwork) {
  return artworkImages[String(work.id)];
}

export interface Artwork {
  id: number;
  title: string;
  artist_title: string | null;
  date_display: string;
  date_start: number | null;
  medium_display: string;
  dimensions: string;
  credit_line: string;
  place_of_origin: string | null;
  style_title: string | null;
  classification_title: string | null;
  image_id: string | null;
  is_public_domain: boolean;
  thumbnail: { alt_text: string | null; width: number; height: number } | null;
  description: string | null;
}
export interface Collection {
  artworks: Artwork[];
  iiifUrl: string;
  missingCount: number;
}
interface ApiResponse {
  data: Artwork[];
  config: { iiif_url: string };
}
const fields =
  "id,title,artist_title,date_display,date_start,medium_display,dimensions,credit_line,place_of_origin,style_title,classification_title,image_id,is_public_domain,thumbnail,description";
const client = axios.create({
  baseURL: "https://api.artic.edu/api/v1",
  timeout: 18000,
});
let collectionRequest: Promise<Collection> | undefined;

// Reuse the same promise across views (and StrictMode mounts); failed requests can be retried.
export function getCollection(): Promise<Collection> {
  if (!collectionRequest) {
    collectionRequest = client
      .get<ApiResponse>("/artworks", {
        params: { ids: COLLECTION_IDS.join(","), fields, limit: 100 },
      })
      .then(({ data }) => {
        if (!Array.isArray(data.data) || !data.config?.iiif_url) {
          throw new Error(
            "The museum returned an unexpected response. Please try again.",
          );
        }
        const artworks = COLLECTION_IDS.flatMap((id) => {
          const work = data.data.find(
            (item) => item.id === id && item.is_public_domain && item.image_id,
          );
          return work ? [work] : [];
        });
        if (!artworks.length)
          throw new Error(
            "These works are temporarily unavailable. Please try again.",
          );
        return {
          artworks,
          iiifUrl: data.config.iiif_url,
          missingCount: COLLECTION_IDS.length - artworks.length,
        };
      })
      .catch((error: unknown) => {
        collectionRequest = undefined;
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 429)
            throw new Error(
              "The museum is receiving too many requests. Please wait a moment, then try again.",
            );
          throw new Error(
            "We couldn’t reach the museum. Check your connection and try again.",
          );
        }
        throw error;
      });
  }
  return collectionRequest;
}
export function imageUrl(
  work: Artwork,
  iiifUrl: string,
  size: 400 | 843 = 843,
) {
  // The museum API supplies both the IIIF base URL and the image identifier.
  return `${iiifUrl}/${work.image_id}/full/${size},/0/default.jpg`;
}
export function fallbackImageUrl(work: Artwork) {
  const source = imageSource(work);
  return source ? `${import.meta.env.BASE_URL}${source.file}` : undefined;
}
export function artistName(work: Artwork) {
  return work.artist_title || "Unknown artist";
}
// Render museum descriptions as text, never as injected HTML.
export function descriptionParagraphs(html: string | null) {
  if (!html) return [];
  const document = new DOMParser().parseFromString(html, "text/html");
  document
    .querySelectorAll("script, style")
    .forEach((element) => element.remove());
  const paragraphs = [...document.querySelectorAll("p")]
    .map((paragraph) => paragraph.textContent?.trim() || "")
    .filter(Boolean);
  return paragraphs.length
    ? paragraphs
    : [document.body.textContent?.trim() || ""].filter(Boolean);
}
