# Sreality.cz Recommended Listings Scraper

Extract recommended property listings from Sreality.cz in a structured dataset. Collect pricing, location, category, media, agency, and nearby amenities data for each listing. This scraper is built for fast recurring collection and reliable market monitoring.

## Features

- **Recommended listings extraction** - Collects data from `https://www.sreality.cz/doporucene`.
- **Rich property attributes** - Includes categories, offer type, pricing, and location fields.
- **Media coverage** - Returns primary image, full image list, and media flags.
- **Embeddable image URLs** - Uses the same public transformed image URLs that Sreality serves on-page, avoiding blocked raw CDN links.
- **Agency and seller context** - Captures agency identifiers, branding, and seller ID fields.
- **Clean output quality** - Removes null and empty values before saving records.
- **Pagination support** - Collects multiple pages until the requested result count is reached.

## Use Cases

### Property Market Research
Track what kinds of homes and commercial listings are currently promoted as recommended. Use this to identify active categories, price bands, and regional distribution.

### Lead Intelligence
Build a fresh list of agencies and promoted listings for prospecting, outreach, or CRM enrichment.

### Pricing Analysis
Monitor recommended listing prices by city, district, and category to benchmark current market positioning.

### Media and Content Audits
Analyze how many photos listings include and where video or virtual-tour style media is present.

### Local Opportunity Discovery
Use nearby amenity distance fields to filter listings by transportation, schools, shops, and services.

---

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startUrl` | String | No | `"https://www.sreality.cz/doporucene"` | Source page for recommended listings. |
| `results_wanted` | Integer | No | `20` | Maximum number of listings to save. |
| `max_pages` | Integer | No | `10` | Safety cap for paginated requests. |
| `proxyConfiguration` | Object | No | `{ "useApifyProxy": false }` | Optional proxy setup for stable large runs. |

---

## Output Data

Each dataset item can contain the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `estate_id` | Integer | Unique listing ID. |
| `title` | String | Listing headline. |
| `offer_type` | String | Offer type (for example sale or rent). |
| `category_main` | String | Main listing category. |
| `category_sub` | String | Listing sub-category. |
| `locality_text` | String | Combined city, district, region, and country text. |
| `location_city` | String | City name. |
| `location_district` | String | District name. |
| `location_region` | String | Region name. |
| `location_country` | String | Country name. |
| `location_latitude` | Number | Latitude coordinate. |
| `location_longitude` | Number | Longitude coordinate. |
| `price_czk` | Number | Total listing price in CZK. |
| `price_czk_m2` | Number | Price per m2 in CZK. |
| `price_currency` | String | Price currency symbol/name. |
| `price_unit` | String | Price unit text. |
| `has_video` | Boolean | Listing has video media. |
| `has_matterport` | Boolean | Listing has virtual-tour media flag. |
| `agency_id` | Integer | Agency identifier. |
| `agency_slug` | String | Agency slug value. |
| `agency_logo_url` | String | Agency logo URL. |
| `image_urls` | Array[String] | Cleaned image URLs as a JSON array. |
| `images_count` | Integer | Number of image URLs available for the listing. |
| `primary_image_url` | String | First image URL. |
| `poi_*_distance_m` | Number | Distance to nearby amenities in meters. |
| `source_url` | String | Input source URL. |
| `scraped_at` | String | ISO timestamp of extraction. |

---

## Usage Examples

### Basic Run

Collect the first 20 recommended listings.

```json
{
  "startUrl": "https://www.sreality.cz/doporucene",
  "results_wanted": 20
}
```

### Expanded Collection

Collect more data across additional pages.

```json
{
  "startUrl": "https://www.sreality.cz/doporucene",
  "results_wanted": 120,
  "max_pages": 10
}
```

### Proxy-Enabled Run

Use Apify Proxy for large-scale recurring jobs.

```json
{
  "startUrl": "https://www.sreality.cz/doporucene",
  "results_wanted": 100,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

---

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
  "agency_logo_url": "https://d48-a.sdn.cz/d_48/c_img_QQ_b/lfCE3.png",
  "primary_image_url": "https://d18-a.sdn.cz/d_18/c_img_p9_A/kcHp2YdDtDgLT0unF8i3ga/98f6.jpeg",
  "images_count": 3,
  "image_urls": [
    "https://d18-a.sdn.cz/d_18/c_img_p9_A/kcHp2YdDtDgLT0unF8i3ga/98f6.jpeg",
    "https://d18-a.sdn.cz/d_18/c_img_p9_A/kcHp2YdDtEBMvIyEF8i3hB/94ad.jpeg",
    "https://d18-a.sdn.cz/d_18/c_img_p9_A/kcHp2YdDtEDuRm2HF8i3hn/32ba.jpeg"
  ],
  "poi_bus_public_transport_distance_m": 261,
  "poi_school_distance_m": 36,
  "source_url": "https://www.sreality.cz/doporucene",
  "scraped_at": "2026-03-20T06:45:00.000Z"
}
```

---

## Tips for Best Results

### Start with QA-Friendly Limits
- Use `results_wanted: 20` for quick test runs.
- Increase limits only after confirming output quality.

### Balance Throughput and Stability
- The actor uses an internal safe page size for stable collection.
- Use `max_pages` to prevent unexpectedly long runs.

### Use Proxies for Scale
- Enable proxies for frequent scheduled runs.
- Prefer residential pools in stricter network environments.

### Filter by Useful Fields Post-Run
- Use `category_main`, `category_sub`, and price fields for segmentation.
- Use amenity distance fields to prioritize practical locations.

---

## Integrations

Connect your data with:

- **Google Sheets** - Build quick dashboards for listing trends.
- **Airtable** - Maintain searchable property datasets.
- **Make** - Automate post-processing and notifications.
- **Zapier** - Trigger downstream workflows from fresh runs.
- **Webhooks** - Send data to custom systems.

### Export Formats

- **JSON** - Full structured records.
- **CSV** - Spreadsheet-friendly analysis.
- **Excel** - Business reporting and sharing.
- **XML** - Legacy system integration.

---

## Frequently Asked Questions

### How many listings can I collect?
You can collect as many as are available, bounded by your `results_wanted`, `max_pages`, and platform limits.

### Does the actor remove empty fields?
Yes. Null and empty values are removed before each record is saved.

### Can I run this on a schedule?
Yes. It is suitable for scheduled runs and recurring market tracking.

### What if the website structure changes?
If source responses change, output fields may change. Re-run validation and update mapping when needed.

### Is proxy required?
Not always. For higher-volume or repetitive usage, proxy configuration is recommended.

---

## Support

For issues or feature requests, open the actor in Apify Console and use the Issues or support workflow.

### Resources

- [Apify Documentation](https://docs.apify.com/)
- [Apify API Reference](https://docs.apify.com/api/v2)
- [Apify Scheduling](https://docs.apify.com/platform/schedules)

---

## Legal Notice

This actor is intended for legitimate data collection use cases. You are responsible for compliance with Sreality terms, applicable laws, and responsible data usage policies.
