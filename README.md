## What does Sreality.cz Scraper do?

Sreality.cz Scraper collects structured Czech real-estate listings from Sreality.cz. A basic run collects recommended listings, while optional keyword, location, category, price, and sorting inputs let you create a more focused property dataset.

The dataset includes listing titles, sale or rental information, categories, prices in CZK, locality details, coordinates, agency information, images, media flags, and distances to nearby amenities. Use the results for property market research, price monitoring, agency lead generation, investment analysis, or recurring listing reports.

## Why use Sreality.cz Scraper?

- **Property market research** - Compare current listings by location, category, price, and offer type.
- **Focused collection** - Search for a keyword or resolve a Czech location such as Brno or Praha.
- **Price analysis** - Collect total prices and price-per-square-meter values for benchmarking.
- **Agency research** - Identify agencies, agency pages, logos, and seller IDs connected with listings.
- **Media review** - Check image counts and whether video or Matterport media is available.
- **Automation-ready data** - Export the dataset as JSON, CSV, Excel, XML, or connect it to downstream workflows.

## What data can you extract from Sreality.cz?

| Field | Description |
|-------|-------------|
| `estate_id` | Unique Sreality listing identifier |
| `title` | Listing headline |
| `offer_type` | Sale or rental offer label |
| `category_main` | Main property category |
| `category_sub` | Property sub-category |
| `locality_text` | Combined locality text |
| `location_city` | City or municipality |
| `location_district` | District |
| `location_region` | Region |
| `location_latitude` | Latitude when published by Sreality |
| `location_longitude` | Longitude when published by Sreality |
| `price_czk` | Total price in Czech koruna |
| `price_czk_m2` | Price per square meter in Czech koruna |
| `price_summary` | Display price summary |
| `price_currency` | Currency label |
| `agency_id` | Agency identifier |
| `agency_slug` | Agency page slug |
| `has_video` | Whether the listing has video |
| `has_matterport` | Whether Matterport-style media is available |
| `primary_image_url` | First available listing image |
| `image_urls` | All cleaned listing image URLs |
| `images_count` | Number of available images |
| `poi_*_distance_m` | Distance to a nearby service in meters |
| `source_url` | Input Sreality page URL |
| `scraped_at` | ISO timestamp for the saved record |

## How to use Sreality.cz Scraper

1. Open the Actor in Apify Console.
2. Keep the default start URL for recommended listings, or add supported filters.
3. Set the maximum results and page limit.
4. Run the Actor and review the dataset preview.
5. Download the results or connect the dataset to your workflow.

When `keyword`, `location`, `sort`, offer type, category, or price is provided, the Actor collects matching searchable listings. Without those inputs, it keeps the recommended-listings workflow.

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startUrl` | String | No | `https://www.sreality.cz/doporucene` | Sreality page used as the source reference. |
| `results_wanted` | Integer | No | `20` | Maximum number of listings to save. |
| `max_pages` | Integer | No | `10` | Maximum number of result pages to process. |
| `keyword` | String | No | - | Text to search in Sreality listings. |
| `location` | String | No | - | Czech location name, such as `Brno` or `Praha`. |
| `sort` | String | No | - | `-date`, `price_asc`, `price_desc`, `price_m2_asc`, or `price_m2_desc`. |
| `offer_type` | Integer | No | - | `1` for sale or `2` for rent. |
| `category_main` | Integer | No | - | Sreality main category ID. |
| `price_from` | Number | No | - | Minimum price, normally in CZK. |
| `price_to` | Number | No | - | Maximum price, normally in CZK. |

## Usage Examples

### Basic Recommended Listings

Collect the first 20 recommended listings from Sreality.cz.

```json
{
  "startUrl": "https://www.sreality.cz/doporucene",
  "results_wanted": 20
}
```

### Keyword and Location Search

Collect listings matching a keyword in a resolved Czech location.

```json
{
  "keyword": "rodinný dům",
  "location": "Brno",
  "results_wanted": 50,
  "max_pages": 5
}
```

### Price and Sorting Filters

Collect sale listings within a price range, ordered from the lowest price.

```json
{
  "offer_type": 1,
  "price_from": 2000000,
  "price_to": 8000000,
  "sort": "price_asc",
  "results_wanted": 100,
  "max_pages": 10
}
```

## Sample Output

```json
{
  "estate_id": 3843384140,
  "title": "Prodej rodinného domu 153 m², pozemek 475 m²",
  "offer_type": "Prodej",
  "offer_type_id": 1,
  "category_main": "Domy",
  "category_sub": "Rodinný",
  "locality_text": "Lipová, Prostějov, Olomoucký kraj, Česká republika",
  "location_city": "Lipová",
  "location_district": "Prostějov",
  "location_region": "Olomoucký kraj",
  "location_country": "Česká republika",
  "location_latitude": 49.520441,
  "location_longitude": 16.86507,
  "price_czk": 7777250,
  "price_czk_m2": 50832,
  "price_currency": "Kč",
  "price_unit": "za nemovitost",
  "has_video": true,
  "has_matterport": false,
  "agency_id": 34573,
  "agency_slug": "ostrov-realit",
  "primary_image_url": "https://d18-a.sdn.cz/d_18/c_img_p9_A/kcHp2YdDtDgLT0unF8i3ga/98f6.jpeg",
  "images_count": 3,
  "image_urls": [
    "https://d18-a.sdn.cz/d_18/c_img_p9_A/kcHp2YdDtDgLT0unF8i3ga/98f6.jpeg"
  ],
  "poi_school_distance_m": 36,
  "source_url": "https://www.sreality.cz/doporucene",
  "scraped_at": "2026-03-20T06:45:00.000Z"
}
```

## Tips for Best Results

- Start with `results_wanted: 20` to confirm the selected filters and output quality.
- Use a specific location name for more focused results. The Actor stops with a clear error if Sreality cannot resolve the location.
- Use the exact sort values listed in the input table.
- Keep `price_from` lower than or equal to `price_to`.
- Use `max_pages` as a safety limit for larger scheduled runs.
- Some fields are empty when the original listing does not publish that information.

## Integrations and Export Formats

- **Apify API** - Read datasets programmatically after a run.
- **Google Sheets** - Review prices and locations in a spreadsheet.
- **Airtable** - Maintain a searchable property table.
- **Make or Zapier** - Trigger notifications and downstream workflows.
- **Webhooks** - Send run completion events to your own systems.

Apify datasets can be downloaded as JSON, CSV, Excel, XML, and other supported formats.

## Frequently Asked Questions

### Can I collect only sale or rental listings?

Yes. Set `offer_type` to `1` for sale or `2` for rent.

### Can I filter listings by location?

Yes. Enter a Czech location name in `location`, such as `Brno` or `Praha`. The Actor resolves the name and applies it to the listing search.

### Which sorting values are supported?

The supported values are `-date`, `price_asc`, `price_desc`, `price_m2_asc`, and `price_m2_desc`.

### Can I run this Actor on a schedule?

Yes. Schedule recurring runs in Apify Console for property monitoring, price tracking, or regular dataset refreshes.

### Can I export Sreality data to CSV or Excel?

Yes. Download the dataset in CSV, Excel, JSON, XML, or another Apify-supported format.

### Is it legal to collect Sreality data?

You are responsible for complying with Sreality terms, applicable laws, privacy requirements, and any restrictions that apply to your use of the collected data.

## Related Actors

- [Housing.com Property Scraper](https://apify.com/shahidirfan/housing-com-property-scraper) - Collect property listings from Housing.com.
- [Otodom.pl Property Scraper](https://apify.com/shahidirfan/otodom-pl-property-scraper) - Collect Polish property listings from Otodom.pl.
- [Flatfox.ch Property Scraper](https://apify.com/shahidirfan/flatfox-ch-property-scraper) - Collect property listings from Flatfox.ch.

## Support

For issues or feature requests, use the Issues tab on the Actor page and include the input, run ID, and a short description of the observed result.

## Legal Notice

This Actor is intended for legitimate collection of publicly available real-estate information. Users are responsible for responsible use of the output and compliance with Sreality terms and applicable laws.
