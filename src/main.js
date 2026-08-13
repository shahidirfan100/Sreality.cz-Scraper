import { Actor, log } from 'apify';
import { Dataset } from 'crawlee';
import { gotScraping } from 'got-scraping';

const DEFAULT_START_URL = 'https://www.sreality.cz/doporucene';
const RECOMMENDED_API_URL = 'https://www.sreality.cz/api/v1/estates/recommended';
const SEARCH_API_URL = 'https://www.sreality.cz/api/v1/estates/search';
const LOCALITIES_SUGGEST_URL = 'https://www.sreality.cz/api/v1/localities/suggest';
const API_LANG = 'cs';
const ITEMS_PER_PAGE = 24;
const INCLUDE_CLUSTERS_BBOX = true;
const PUSH_BATCH_SIZE = 100;
const PUBLIC_IMAGE_TRANSFORM = 'res,300,300,1|jpg,80';
const SUPPORTED_SORTS = new Set(['-date', 'price_asc', 'price_desc', 'price_m2_asc', 'price_m2_desc']);

const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toOptionalNonNegativeNumber = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const toOptionalText = (value) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const fetchJson = async (url, referer, description) => {
    try {
        const response = await gotScraping({
            url,
            method: 'GET',
            timeout: { request: 30_000 },
            headers: {
                accept: 'application/json, text/plain, */*',
                'accept-language': 'cs-CZ,cs;q=0.9,en-US;q=0.8,en;q=0.7',
                referer,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
            },
        });
        return JSON.parse(response.body);
    } catch (error) {
        throw new Error(`Failed to fetch or parse ${description}: ${error.message}`);
    }
};

const resolveLocation = async (location, referer) => {
    const params = new URLSearchParams({
        variant: 'phrase',
        phrase: location,
        lang: API_LANG,
        limit: '10',
    });
    const payload = await fetchJson(`${LOCALITIES_SUGGEST_URL}?${params.toString()}`, referer, 'location suggestions');
    const suggestion = payload.results?.find((entry) => entry?.userData?.entityType && entry.userData.id);

    if (!suggestion) {
        throw new Error(`No Sreality location matched "${location}".`);
    }

    const { userData } = suggestion;
    return {
        countryId: userData.country_id,
        entityType: userData.entityType,
        entityId: userData.id,
        label: userData.suggestFirstRow || location,
    };
};

const buildQuery = (input, resultsWanted, offset, resolvedLocation) => {
    const keyword = toOptionalText(input.keyword);
    const location = toOptionalText(input.location);
    const sort = toOptionalText(input.sort);
    const offerType = input.offer_type ?? input.offerType;
    const categoryMain = input.category_main ?? input.categoryMain;
    const priceFrom = toOptionalNonNegativeNumber(input.price_from ?? input.priceFrom);
    const priceTo = toOptionalNonNegativeNumber(input.price_to ?? input.priceTo);

    if (sort && !SUPPORTED_SORTS.has(sort)) {
        throw new Error(`Unsupported sort "${sort}". Use one of: ${[...SUPPORTED_SORTS].join(', ')}.`);
    }

    if (priceFrom !== undefined && priceTo !== undefined && priceFrom > priceTo) {
        throw new Error('price_from cannot be greater than price_to.');
    }

    const usesSearchFilters = Boolean(keyword || location || sort || offerType !== undefined || categoryMain !== undefined || priceFrom !== undefined || priceTo !== undefined);
    const apiUrl = usesSearchFilters ? SEARCH_API_URL : RECOMMENDED_API_URL;
    const params = new URLSearchParams({
        lang: API_LANG,
        limit: String(Math.min(ITEMS_PER_PAGE, resultsWanted)),
        offset: String(offset),
    });

    if (!usesSearchFilters) {
        params.set('include_clusters_bbox', String(Boolean(INCLUDE_CLUSTERS_BBOX)));
    } else {
        if (keyword) params.set('description_search', keyword);
        if (sort) params.set('sort', sort);
        if (offerType !== undefined) params.set('category_type_cb', String(offerType));
        if (categoryMain !== undefined) params.set('category_main_cb', String(categoryMain));
        if (priceFrom !== undefined) params.set('price_from', String(priceFrom));
        if (priceTo !== undefined) params.set('price_to', String(priceTo));

        if (location) {
            params.set('locality_country_id', String(resolvedLocation.countryId));
            params.set('locality_entity_type', resolvedLocation.entityType);
            params.set('locality_entity_id', String(resolvedLocation.entityId));
        }
    }

    return { apiUrl, apiUrlWithParams: `${apiUrl}?${params.toString()}`, usesSearchFilters };
};

const toImageUrl = (value) => {
    if (!value || typeof value !== 'string') return undefined;
    const normalized = value.startsWith('//') ? `https:${value}` : value;

    try {
        const parsed = new URL(normalized);
        parsed.hash = '';

        if (parsed.hostname.includes('sdn.cz')) {
            // Public d_18 image URLs work with this conservative fl preset.
            if (parsed.pathname.startsWith('/d_18/')) {
                parsed.searchParams.set('fl', PUBLIC_IMAGE_TRANSFORM);
                return parsed.toString();
            }

            // Logos and non d_18 assets are more reliable without transforms.
            parsed.search = '';
            return parsed.toString();
        }

        return parsed.toString();
    } catch {
        return normalized;
    }
};

const pruneValue = (value) => {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    if (Array.isArray(value)) {
        const cleanedArray = value
            .map((entry) => pruneValue(entry))
            .filter((entry) => entry !== undefined);
        return cleanedArray.length > 0 ? cleanedArray : undefined;
    }

    if (typeof value === 'object') {
        const cleanedObject = {};
        for (const [key, entry] of Object.entries(value)) {
            const cleaned = pruneValue(entry);
            if (cleaned !== undefined) cleanedObject[key] = cleaned;
        }
        return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
    }

    return value;
};

const collectImageUrls = (estate) => {
    const allCandidates = [];

    if (Array.isArray(estate.advert_images_all)) {
        for (const image of estate.advert_images_all) {
            const url = toImageUrl(image?.advert_image_sdn_url);
            if (url) allCandidates.push(url);
        }
    }

    if (Array.isArray(estate.advert_images)) {
        for (const image of estate.advert_images) {
            const url = toImageUrl(image);
            if (url) allCandidates.push(url);
        }
    }

    if (allCandidates.length === 0) return undefined;
    return [...new Set(allCandidates)];
};

const mapEstate = (estate, sourceUrl) => {
    const imageUrls = collectImageUrls(estate);
    const imageUrl = imageUrls?.[0];

    const locationParts = [
        estate.locality?.city,
        estate.locality?.district,
        estate.locality?.region,
        estate.locality?.country,
    ].filter(Boolean);

    return pruneValue({
        estate_id: estate.hash_id,
        title: estate.advert_name,
        offer_type: estate.category_type_cb?.name,
        offer_type_id: estate.category_type_cb?.value,
        category_main: estate.category_main_cb?.name,
        category_main_id: estate.category_main_cb?.value,
        category_sub: estate.category_sub_cb?.name,
        category_sub_id: estate.category_sub_cb?.value,
        locality_text: locationParts.join(', '),
        location_city: estate.locality?.city,
        location_district: estate.locality?.district,
        location_region: estate.locality?.region,
        location_country: estate.locality?.country,
        location_latitude: estate.locality?.gps_lat,
        location_longitude: estate.locality?.gps_lon,
        location_geohash: estate.locality?.geohash,
        price: estate.price,
        price_czk: estate.price_czk,
        price_czk_m2: estate.price_czk_m2,
        price_summary: estate.price_summary,
        price_summary_czk: estate.price_summary_czk,
        price_summary_czk_m2: estate.price_summary_czk_m2,
        price_currency: estate.price_currency_cb?.name,
        price_currency_id: estate.price_currency_cb?.value,
        price_unit: estate.price_unit_cb?.name,
        price_unit_id: estate.price_unit_cb?.value,
        price_summary_unit: estate.price_summary_unit_cb?.name,
        price_summary_unit_id: estate.price_summary_unit_cb?.value,
        has_video: estate.has_video,
        has_matterport: estate.has_matterport_url,
        discount: estate.discount_show,
        agency_id: estate.premise_id,
        agency_slug: estate.premise?.seo_name,
        agency_logo_url: toImageUrl(estate.premise_logo),
        seller_user_id: estate.user_id,
        poi_atm_distance_m: estate.poi_atm_distance,
        poi_bus_public_transport_distance_m: estate.poi_bus_public_transport_distance,
        poi_kindergarten_distance_m: estate.poi_kindergarten_distance,
        poi_medic_distance_m: estate.poi_medic_distance,
        poi_metro_distance_m: estate.poi_metro_distance,
        poi_playground_distance_m: estate.poi_playground_distance,
        poi_post_office_distance_m: estate.poi_post_office_distance,
        poi_restaurant_distance_m: estate.poi_restaurant_distance,
        poi_school_distance_m: estate.poi_school_distance,
        poi_shop_distance_m: estate.poi_shop_distance,
        poi_small_shop_distance_m: estate.poi_small_shop_distance,
        poi_train_distance_m: estate.poi_train_distance,
        poi_vet_distance_m: estate.poi_vet_distance,
        primary_image_url: imageUrl,
        image_urls: imageUrls,
        images_count: imageUrls?.length,
        source_url: sourceUrl,
        scraped_at: new Date().toISOString(),
    });
};

await Actor.init();

try {
    const input = (await Actor.getInput()) || {};
    const sourceUrl = input.startUrl || input.start_url || DEFAULT_START_URL;
    const resultsWanted = toPositiveInt(input.results_wanted ?? input.resultsWanted, 20);
    const maxPages = toPositiveInt(input.max_pages ?? input.maxPages, 10);
    const location = toOptionalText(input.location);
    const resolvedLocation = location ? await resolveLocation(location, sourceUrl) : undefined;
    if (resolvedLocation) log.info(`Using Sreality location: ${resolvedLocation.label}.`);

    const seenEstateIds = new Set();
    const bufferedItems = [];
    let page = 0;
    let offset = 0;

    while (bufferedItems.length < resultsWanted && page < maxPages) {
        page += 1;
        const limit = Math.min(ITEMS_PER_PAGE, resultsWanted - bufferedItems.length);
        const { apiUrlWithParams } = buildQuery(input, limit, offset, resolvedLocation);

        log.info(`Processing page ${page}`);
        const payload = await fetchJson(apiUrlWithParams, sourceUrl, `listing response on page ${page}`);

        const estates = Array.isArray(payload.results) ? payload.results : [];
        if (estates.length === 0) {
            log.info('No more estates returned. Stopping collection.');
            break;
        }

        let addedFromPage = 0;
        for (const estate of estates) {
            const estateId = estate.hash_id ? String(estate.hash_id) : undefined;
            if (estateId && seenEstateIds.has(estateId)) continue;
            if (estateId) seenEstateIds.add(estateId);

            const mapped = mapEstate(estate, sourceUrl);
            if (!mapped) continue;

            bufferedItems.push(mapped);
            addedFromPage += 1;
            if (bufferedItems.length >= resultsWanted) break;
        }

        log.info(`Collected ${addedFromPage} listings from page ${page}.`);

        if (estates.length < limit) break;
        offset += limit;
    }

    if (bufferedItems.length === 0) {
        throw new Error('No listings were extracted. API may have changed or access may be blocked.');
    }

    for (let i = 0; i < bufferedItems.length; i += PUSH_BATCH_SIZE) {
        const batch = bufferedItems.slice(i, i + PUSH_BATCH_SIZE);
        await Dataset.pushData(batch);
    }

    log.info(`Finished successfully. Total listings saved: ${bufferedItems.length}`);
} finally {
    await Actor.exit();
}
