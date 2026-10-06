import { LilyMark } from "./Icon";
export function CollectionState({
  error,
  retry,
}: {
  error?: string;
  retry: () => void;
}) {
  return (
    <section className="collection-state shell" aria-live="polite">
      <LilyMark />
      <p className="eyebrow">
        {error ? "A MOMENTARY PAUSE" : "OPENING THE COLLECTION"}
      </p>
      <h1>
        {error
          ? "The gallery will be here."
          : "Good things invite a little patience."}
      </h1>
      <p>{error || "Gathering paintings from the Art Institute of Chicago…"}</p>
      {error ? (
        <button className="button" onClick={retry}>
          Try again
        </button>
      ) : (
        <span className="loading-line" />
      )}
    </section>
  );
}
