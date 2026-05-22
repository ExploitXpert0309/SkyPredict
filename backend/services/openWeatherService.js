import axios from 'axios';
import { env, providerStatus } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { getOrSetCache } from '../utils/cache.js';

const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org',
  timeout: env.apiTimeoutMs
});

const googleClient = axios.create({
  baseURL: 'https://maps.googleapis.com',
  timeout: env.apiTimeoutMs
});

const googlePlacesClient = axios.create({
  baseURL: 'https://places.googleapis.com',
  timeout: env.apiTimeoutMs
});

const isValidCoordinatePair = ({ lat, lon }) =>
  Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

const toCoordinatePair = (lat, lon) => {
  const coordinates = { lat: Number(lat), lon: Number(lon) };
  return isValidCoordinatePair(coordinates) ? coordinates : null;
};

const normalizeCoordinateQuery = (query) => {
  const trimmed = query?.trim();
  if (!trimmed) return null;

  const plainPair = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (plainPair) return toCoordinatePair(plainPair[1], plainPair[2]);

  const compact = trimmed
    .replace(/[°º?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cardinalPair = compact.match(/^(\d+(?:\.\d+)?)\s*([NS])\s*,?\s*(\d+(?:\.\d+)?)\s*([EW])$/i);
  if (cardinalPair) {
    const lat = cardinalPair[2].toUpperCase() === 'S' ? -Number(cardinalPair[1]) : Number(cardinalPair[1]);
    const lon = cardinalPair[4].toUpperCase() === 'W' ? -Number(cardinalPair[3]) : Number(cardinalPair[3]);
    return toCoordinatePair(lat, lon);
  }

  const spacedCardinalPair = compact
    .replace(/([NSEW])/gi, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*([NS])\s+(\d+(?:\.\d+)?)\s*([EW])$/i);

  if (spacedCardinalPair) {
    const lat = spacedCardinalPair[2].toUpperCase() === 'S' ? -Number(spacedCardinalPair[1]) : Number(spacedCardinalPair[1]);
    const lon = spacedCardinalPair[4].toUpperCase() === 'W' ? -Number(spacedCardinalPair[3]) : Number(spacedCardinalPair[3]);
    return toCoordinatePair(lat, lon);
  }

  return null;
};

const detectSearchType = (query) => {
  if (normalizeCoordinateQuery(query)) return 'coordinates';
  if (/^\d{5}(?:-\d{4})?$/.test(query.trim())) return 'zip';
  if (/^\d{6}$/.test(query.trim())) return 'postal';
  if (/\d/.test(query) && /[a-z]/i.test(query)) return 'postal';
  return 'city_or_landmark';
};

const isAddressLikeQuery = (query) => {
  const trimmed = query.trim();
  return trimmed.includes(',') || /\b(?:district|mandal|colony|street|road|lane|nagar|india)\b/i.test(trimmed) || /\b\d{6}\b/.test(trimmed);
};

const normalizeAddressQuery = (query) => query
  .trim()
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/\bAndhrapradesh\b/gi, 'Andhra Pradesh')
  .replace(/\bNewYork\b/gi, 'New York')
  .replace(/\bLosAngeles\b/gi, 'Los Angeles')
  .replace(/\bSanFrancisco\b/gi, 'San Francisco')
  .replace(/\bVijaywada\b/gi, 'Vijayawada')
  .replace(/\bMandal\b/gi, '')
  .replace(/\bDistrict\b/gi, '')
  .replace(/\s+,/g, ',')
  .replace(/\s{2,}/g, ' ');

const getQueryCandidates = (query) => {
  const normalized = normalizeAddressQuery(query);
  const noCamel = query.trim().replace(/([a-z])([A-Z])/g, '$1 $2');
  const withIndia = /india/i.test(normalized) ? normalized : `${normalized}, India`;
  return [...new Set([query.trim(), normalized, noCamel, withIndia].filter(Boolean))];
};

const resolveWithGoogle = async (query, searchType, { throwOnDenied = false } = {}) => {
  if (!providerStatus.googleMaps) return null;

  try {
    for (const address of getQueryCandidates(query)) {
      const { data: googleData } = await googleClient.get('/maps/api/geocode/json', {
        params: {
          address,
          key: env.googleMapsApiKey,
          region: 'in'
        }
      });

      if (googleData?.status === 'REQUEST_DENIED') {
        if (throwOnDenied) {
          throw new ApiError(502, googleData.error_message || 'Google Geocoding rejected the request. Check API key, API restrictions, and billing.');
        }
        return null;
      }

      const result = googleData?.results?.[0];
      if (googleData?.status !== 'OK' || !result?.geometry?.location) continue;

      const country = result.address_components?.find((part) => part.types.includes('country'))?.short_name || '';
      const state = result.address_components?.find((part) => part.types.includes('administrative_area_level_1'))?.long_name || '';
      const city = result.address_components?.find((part) =>
        part.types.some((type) => ['locality', 'postal_town', 'administrative_area_level_2', 'sublocality', 'sublocality_level_1'].includes(type))
      )?.long_name;

      return {
        name: city || result.formatted_address,
        displayName: result.formatted_address,
        country,
        state,
        lat: result.geometry.location.lat,
        lon: result.geometry.location.lng,
        searchType
      };
    }

    return null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return null;
  }
};

const suggestionLabel = (parts) => parts.filter(Boolean).join(', ');

const mapGooglePlaceSuggestion = (suggestion) => {
  const prediction = suggestion.placePrediction;
  if (!prediction) return null;

  const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text;
  const secondaryText = prediction.structuredFormat?.secondaryText?.text || '';
  const description = prediction.text?.text || suggestionLabel([mainText, secondaryText]);

  if (!description) return null;

  return {
    id: prediction.placeId || description,
    label: mainText || description,
    description,
    query: description,
    source: 'google_places'
  };
};

export const getLocationSuggestions = async (query) => {
  const trimmed = normalizeAddressQuery(query || '');
  if (trimmed.length < 2 || normalizeCoordinateQuery(trimmed)) return [];

  const cacheKey = `suggestions:${trimmed.toLowerCase()}`;
  return getOrSetCache(cacheKey, 600, async () => {
    if (providerStatus.googleMaps) {
      try {
        const { data } = await googlePlacesClient.post('/v1/places:autocomplete', {
          input: trimmed,
          languageCode: 'en'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': env.googleMapsApiKey,
            'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat'
          }
        });

        const suggestions = data?.suggestions
          ?.map(mapGooglePlaceSuggestion)
          .filter(Boolean)
          .slice(0, 6);

        if (suggestions?.length) return suggestions;
      } catch {
        // Fall back to OpenWeather geocoding suggestions if Places autocomplete is unavailable.
      }
    }

    const { data } = await weatherClient.get('/geo/1.0/direct', {
      params: { q: trimmed, limit: 6, appid: env.openWeatherApiKey }
    }).catch(() => ({ data: [] }));

    return [...new Map((data || []).map((item) => {
      const description = suggestionLabel([item.name, item.state, item.country]);
      return [description, {
        id: `${item.lat},${item.lon}`,
        label: item.name,
        description,
        query: description,
        source: 'openweather'
      }];
    })).values()];
  });
};

export const resolveLocation = async ({ query, latitude, longitude }) => {
  if (!providerStatus.openWeather) {
    throw new ApiError(500, 'OpenWeather API key is not configured.');
  }

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const { data } = await weatherClient.get('/geo/1.0/reverse', {
      params: { lat: latitude, lon: longitude, limit: 1, appid: env.openWeatherApiKey }
    });

    return {
      name: data?.[0]?.name || 'Current Location',
      country: data?.[0]?.country || '',
      state: data?.[0]?.state || '',
      lat: latitude,
      lon: longitude,
      searchType: 'geolocation'
    };
  }

  if (!query?.trim()) {
    throw new ApiError(400, 'Search query is required.');
  }

  const coordinateQuery = normalizeCoordinateQuery(query);
  if (coordinateQuery) {
    const { data } = await weatherClient.get('/geo/1.0/reverse', {
      params: { ...coordinateQuery, limit: 1, appid: env.openWeatherApiKey }
    });

    return {
      name: data?.[0]?.name || query,
      country: data?.[0]?.country || '',
      state: data?.[0]?.state || '',
      ...coordinateQuery,
      searchType: 'coordinates'
    };
  }

  const searchType = detectSearchType(query);
  const cacheKey = `geo:${normalizeAddressQuery(query).toLowerCase()}`;
  return getOrSetCache(cacheKey, 3600, async () => {
    if (providerStatus.googleMaps && searchType !== 'zip') {
      const googleLocation = await resolveWithGoogle(query, searchType, { throwOnDenied: isAddressLikeQuery(query) });
      if (googleLocation) return googleLocation;
    }

    if (searchType === 'zip') {
      try {
        const { data: zipData } = await weatherClient.get('/geo/1.0/zip', {
          params: { zip: query.trim(), appid: env.openWeatherApiKey }
        });

        if (zipData?.lat && zipData?.lon) {
          return {
            name: zipData.name || query,
            country: zipData.country || '',
            state: '',
            lat: zipData.lat,
            lon: zipData.lon,
            searchType
          };
        }
      } catch {
        // Continue to direct geocoding below for postal formats the zip endpoint cannot resolve.
      }
    }

    for (const candidate of getQueryCandidates(query)) {
      const { data } = await weatherClient.get('/geo/1.0/direct', {
        params: { q: candidate, limit: 1, appid: env.openWeatherApiKey }
      }).catch(() => ({ data: [] }));

      if (data?.length) {
        return {
          name: data[0].name,
          country: data[0].country || '',
          state: data[0].state || '',
          lat: data[0].lat,
          lon: data[0].lon,
          searchType
        };
      }
    }

    const googleLocation = await resolveWithGoogle(query, 'city_or_landmark');
    if (googleLocation) return googleLocation;

    throw new ApiError(404, `No location found for "${query}". Try a city, zip code, landmark, or coordinates.`);
  });
};

export const getWeatherBundle = async (location) => {
  const key = `weather:${location.lat}:${location.lon}`;
  return getOrSetCache(key, 240, async () => {
    const params = {
      lat: location.lat,
      lon: location.lon,
      appid: env.openWeatherApiKey,
      units: 'metric'
    };

    const [current, forecast, air, uv] = await Promise.all([
      weatherClient.get('/data/2.5/weather', { params }),
      weatherClient.get('/data/2.5/forecast', { params }),
      weatherClient.get('/data/2.5/air_pollution', { params }),
      weatherClient.get('/data/2.5/uvi', { params }).catch(() => ({ data: null }))
    ]);

    return {
      location,
      current: current.data,
      forecast: forecast.data,
      airQuality: air.data,
      uvIndex: uv.data
    };
  });
};
