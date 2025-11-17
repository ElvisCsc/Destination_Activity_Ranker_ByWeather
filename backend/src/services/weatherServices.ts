import { fetchWeatherApi } from 'openmeteo';
import axios from 'axios';
import { computeRankings } from '../utils/scoring';
import NodeCache from 'node-cache';
import { GeocodeResponse, ActivityRankings } from '../types/weather';
import { GraphQLError } from 'graphql';

// --- Caching Setup ---
// Cache for 1 hour (3600 seconds) for geocoding
const geoCache = new NodeCache({ stdTTL: 3600 });
// Cache for 15 minutes (900 seconds) for weather
const weatherCache = new NodeCache({ stdTTL: 900 });

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

async function geocodeCity(city: string): Promise<GeocodeResponse> {
    const cacheKey = `geocode:${city.toLowerCase()}`;
    const cachedData = geoCache.get<GeocodeResponse>(cacheKey);

    if (cachedData) {
        console.log(`[Cache] HIT: Geocoding for ${city}`);
        return cachedData;
    }

    console.log(`[Cache] MISS: Geocoding for ${city}`);
    const geocodeUrl = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(city)}&format=json&limit=1`;

    try {
        const geocodeRes = await axios.get<GeocodeResponse[]>(geocodeUrl);

        if (geocodeRes.data.length === 0) {
            throw new GraphQLError('City not found', {
                extensions: { code: 'CITY_NOT_FOUND' },
            });
        }

        const location = geocodeRes.data[0];
        geoCache.set(cacheKey, location);
        return location;
    } catch (error) {
        if (error instanceof GraphQLError) {
            throw error;
        }
        console.error('Geocoding API error:', error);
        throw new GraphQLError('Failed to fetch geocoding data', {
            extensions: { code: 'GEOCODING_API_ERROR' },
        });
    }

}

export async function getActivityRankings(city: string) {
    try {
        const location = await geocodeCity(city);
        const { lat, lon, display_name: name } = location;

        const cacheKey = `weather:${lat}:${lon}`;
        const cachedData = weatherCache.get<ActivityRankings>(cacheKey);

        if (cachedData) {
            console.log(`[Cache] HIT: Weather for ${name}`);
            return { ...cachedData, city: name };
        }

        console.log(`[Cache] MISS: Weather for ${name}`);

        const params = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            daily: ['temperature_2m_max', 'rain_sum', 'snowfall_sum', 'wind_speed_10m_max', 'weather_code'],
            timezone: 'auto',
            forecast_days: 7,
        };

        const url = 'https://api.open-meteo.com/v1/forecast';
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];

        const daily = response.daily()!;
        const dailyData = {
            time: Array.from(
                { length: (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval() },
                (_, i) => new Date(Number(daily.time()) + i * daily.interval() * 1000)
            ),
            temperature_2m_max: daily.variables(0)!.valuesArray()!,
            rain_sum: daily.variables(1)!.valuesArray()!,
            snowfall_sum: daily.variables(2)!.valuesArray()!,
            wind_speed_10m_max: daily.variables(3)!.valuesArray()!,
            weather_code: daily.variables(4)!.valuesArray()!,
        };

        const forecastDaily = Array.from({ length: 7 }, (_, i) => ({
            dt: dailyData.time[i].getTime() / 1000,
            temp: { max: dailyData.temperature_2m_max[i] },
            rain: dailyData.rain_sum[i],
            snow: dailyData.snowfall_sum[i],
            wind_speed: dailyData.wind_speed_10m_max[i],
            weather: [{ id: dailyData.weather_code[i] }],
        }));

        // Compute rankings
        const rankings = computeRankings(forecastDaily, name);
        const result: ActivityRankings = { city: name, rankings };

        // Save the computed rankings to the cache
        weatherCache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Weather service error:', error);
        throw new Error('Failed to fetch rankings');
    }
}
