# Étude — A slower way to see

A React + TypeScript single-page exhibition of 36 selected Impressionist,
Post-Impressionist, and Pointillist paintings from the Art Institute of Chicago.
The design draws on Monet's muted greens, reflected light, and spacious compositions.
The original assignment README is preserved unchanged.

## Run locally

Use Node.js 20.19+ or 22.12+ (Node 24 also works).

```sh
npm ci
npm run dev
```

Open the Vite URL followed by `/mp2/`. No API key or environment file is needed.

```sh
npm run lint
npm run build
npm run preview
```

## Features and assignment checklist

| Requirement                            | Implementation                                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| React, TypeScript, React Router        | Typed components and `BrowserRouter` with the Vite base URL                                                                          |
| Axios API requests                     | `src/lib/artworks.ts`, a single batched museum request with a timeout and in-memory promise cache                                    |
| Searchable list                        | `/list`, updates on every keystroke; matches title, artist, date, movement, and medium; accents and case are normalized              |
| At least two sort properties           | Title, year created, and artist; every choice supports ascending and descending order                                                |
| Image gallery with filters             | `/`, API-derived museum images with bundled fallback copies; movement buttons and an artist selector combine with search              |
| Clicking list or gallery opens details | Both link to `/artworks/:id`                                                                                                         |
| Detail attributes                      | Title, artist, date, museum description, medium, dimensions, origin, credit, and museum link                                         |
| Previous and next                      | Cycle through the current filtered/sorted result set; wrap at either end; direct links use the complete exhibition                   |
| Shareable state                        | Query parameters store search, artist, movement, sort, order, and source view; browser back/forward works                            |
| Accessible image enlargement           | Native modal dialog with Escape, a close button, and focus restoration                                                               |
| API errors                             | Human-readable loading/error states, timeout and rate-limit handling, explicit retry, missing-work notice, and broken-image fallback |
| Styling restrictions                   | External CSS; no inline styles, inline scripts, or layout tables                                                                     |
| Responsive layout                      | Desktop, tablet, and phone layouts; keyboard focus, skip link, labels, status announcements, and reduced-motion support              |

The search is scoped to these **36 selected works**, not the entire museum catalog.
This is intentional and is stated in the interface. The initial order is curated;
artwork records and image identifiers come from the live API. Images first use
the API's `config.iiif_url` and each record's `image_id`. If that image request
fails, the image component automatically tries the credited, bundled copy for
the same artwork ID. Artwork records are not hardcoded into production. The
recorded test fixture is used only by tests.
A single-result detail disables previous/next and offers a link to the full
collection instead of suggesting that there are other works in that selection.

## Routing and GitHub Pages

- Vite asset base: `/mp2/`.
- Router basename: `import.meta.env.BASE_URL`.
- Internal page navigation uses React Router links; same-page anchors scroll to the collection.
- The Vite build emits an `index.html` inside `list/`, `about/`, and each of the
  36 supported `artworks/<id>/` directories. This allows direct detail links and
  refreshes to work on GitHub Pages, which does not support SPA rewrite rules.
- A `404.html` copy renders the app's friendly not-found view for unknown routes.
- The existing `.github/workflows/deploy.yml` is preserved. It deploys on pushes to
  `main`; a feature branch/pull request does **not** change the live site.
- In the repository, set **Settings → Pages → Source → GitHub Actions** before
  deploying, if it is not already configured. The expected URL after deployment
  is `https://zknathan.github.io/mp2/`.

The route list comes from `src/data/collection.ts`, the same source as the API
selection. If you add artworks, add their IDs there and rebuild.

## Verification

```sh
npx playwright install chromium
npm test
```

Nine Playwright scenarios exercise gallery/list search, composed filters, all
three sort properties in both directions, routed detail navigation and wrapping,
refresh, the image dialog, browser back, API failure/retry, malformed URLs,
empty/single results, unavailable images, and mobile overflow at 375 px.
The tests intercept metadata with recorded museum data, so museum uptime does not
affect interaction tests. They verify that available museum media keeps its
API-derived image URL, then block the museum image host and verify all 36 actual
fallback files decode, including gallery, detail, and enlargement views. The
production app still calls the real museum API for records. `npm test` builds
the app and starts a preview server.

For containers with a separately installed Chromium, the optional
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` variable selects that binary.

## Architecture

- `src/data/collection.ts`: selected artwork IDs and featured work.
- `src/lib/artworks.ts`: typed API client, image URLs, text-only description parsing.
- `src/lib/browse.ts`: URL state, search/filter/sort, and navigation destinations.
- `src/components/`: shared layout, artwork imagery, icons, loading and error UI.
- `src/pages/`: collection, detail, and project information views.
- `src/App.css` and `src/index.css`: responsive design and global foundations.
- `tests/`: deterministic browser checks with recorded public museum metadata.

## Sources and attribution

- Assignment requirements: the repository's original `README.md` and supplied
  `devlab_mp2_26.pdf`.
- Art Institute of Chicago API documentation: <https://api.artic.edu/docs/>.
  Used for batched artwork records, field selection, IIIF image construction,
  image sizes, caching guidance, and public-domain filtering.
- Artwork metadata and descriptions: <https://api.artic.edu/api/v1/artworks>.
  Metadata is CC0; descriptions are credited to the Art Institute of Chicago under
  CC BY 4.0 and converted from HTML to text paragraphs. Every detail page credits
  the museum and links to its canonical artwork record. Only records with
  `is_public_domain: true` and an image are displayed.
- Image fallbacks: credited Wikimedia Commons copies are bundled as WebP assets under
  `public/artworks/`, served from the same origin as the app. Each copy was matched
  to its museum artwork ID through Wikidata property P4610. See
  `src/data/artwork-images.json` and [IMAGE_CREDITS.md](IMAGE_CREDITS.md) for file
  sources, individual reproduction licenses, and conversion notes. Two
  photographic reproductions are CC BY-SA 4.0, with source attribution and
  license links displayed under the corresponding paintings. Those converted
  image files retain that license.
- Image-loading root cause: the museum's IIIF host returned HTTP 403 with
  `Cf-Mitigated: challenge` and `Cross-Origin-Resource-Policy: same-origin`.
  An image element cannot display the resulting Cloudflare HTML challenge. The
  curated collection now automatically falls back to same-origin files when
  the museum image request fails; it uses no third-party image proxies. Museum
  metadata and Google Fonts still require network access.
- React Router documentation: <https://reactrouter.com/start/declarative/installation>.
- Axios documentation: <https://axios-http.com/docs/intro> and
  <https://axios-http.com/docs/cancellation>.
- Typography: DM Sans and Playfair Display via <https://fonts.google.com/>.
- Original project-specific code, layout, copy, and simple SVG icons were developed
  with OpenAI ChatGPT/Codex assistance. No third-party site template was copied.

## Course submission reminder

### Requirements recheck (October 6, 2026)

The original README and supplied PDF both require API content, Axios, TypeScript,
React Router, a searchable/sortable list, a filterable image gallery, and routed
details with previous/next navigation. The checklist above maps each to its
implementation. The image repair preserves the API as the primary image source
and uses bundled reproductions only after an image-loading error. The README
explicitly allows local responses during API outages and client-side search and
sorting. The PDF introduces no additional mandatory package beyond those used.
Source inspection confirms no inline styling, inline script bodies, or layout
tables; the external Vite module script remains required. The original README,
deployment workflow, lockfile, Vite base, and router basename are preserved.

Deployment and course submission are separate from implementation: the feature
branch must be merged and GitHub Pages deployed, then the required demo video,
source code, chat logs, and grading form must be submitted by the student.

The assignment explicitly permits LLM-generated code and requires submitting the
chat logs with the source code and answering the LLM-use survey in the grading
form. Include this conversation. Source credits above do not replace the chat log.
Record and submit the required demo separately; this implementation does not submit
coursework, email anyone, or create a demo recording.
