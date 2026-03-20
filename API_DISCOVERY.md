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
Selected endpoint score is `100` (>= 50 threshold), so API-based extraction is used as the production strategy.
