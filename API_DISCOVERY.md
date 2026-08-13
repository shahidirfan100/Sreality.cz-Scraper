# API Discovery Report

## Target
- Website: `https://www.sreality.cz/doporucene`
- Discovery date: `2026-03-20`

## Existing Actor Audit (Before Rewrite)
- Previous actor extracted Remote.co job fields and did not target Sreality.
- Existing output fields were job-specific (`title`, `company`, etc.).
- Runtime bug found: `category is not defined`.
- Dataset output for test run: empty.

## Selected API
- Endpoint: `https://www.sreality.cz/api/v1/estates/recommended`
- Method: `GET`
- Auth: none
- Pagination: `limit` + `offset`
- Key params used:
  - `include_clusters_bbox=true`
  - `lang=cs`
  - `limit=<n>`
  - `offset=<n>`

## Filtered Search API
- Endpoint: `https://www.sreality.cz/api/v1/estates/search`
- Used when the Actor receives supported search filters.
- Confirmed query parameters:
  - `description_search` for the Actor's `keyword` input
  - `locality_country_id`, `locality_entity_type`, and `locality_entity_id` for a resolved `location`
  - `category_type_cb` for `offer_type`
  - `category_main_cb` for `category_main`
  - `price_from` and `price_to` for price bounds
  - `sort` values `-date`, `price_asc`, `price_desc`, `price_m2_asc`, and `price_m2_desc`
  - `lang`, `limit`, and `offset`
- Location names are resolved through `https://www.sreality.cz/api/v1/localities/suggest` before the listing request.

## How It Was Found
- Parsed `__NEXT_DATA__` from the target page.
- Confirmed query key: `estatesRecommended` with pagination metadata.
- Confirmed endpoint path in production Next.js bundle:
  - base path `/api/v1`
  - route `/estates/recommended`

## Validation
- Test URL:
  `https://www.sreality.cz/api/v1/estates/recommended?include_clusters_bbox=true&lang=cs&limit=3&offset=0`
- HTTP status: `200`
- Response: JSON with `pagination`, `results`, and `default_clusters_bbox`.
- Rich fields available: category, pricing, locality, media flags, images, premise/agency, amenity distances, and IDs.

## Scoring
| Score Factor | Points |
|---|---:|
| Returns JSON directly | 30 |
| Has >15 unique fields | 25 |
| No auth required | 20 |
| Has pagination support | 15 |
| Matches/extents required output fields | 10 |
| **Total** | **100** |

## Result
The recommended endpoint remains the default production path. The filtered search endpoint is used only when a supported filter is present, so each input maps to a confirmed request parameter instead of being silently ignored.
