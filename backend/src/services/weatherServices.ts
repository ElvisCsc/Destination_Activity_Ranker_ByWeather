import { fetchWeatherApi } from 'openmeteo';
import axios from 'axios';
import { computeRankings } from '../utils/scoring';

interface GeocodeResponse {
    lat: string;
    lon: string;
    display_name: string;
}

export async function getActivityRankings(city: string) {
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const geocodeRes = await axios.get<GeocodeResponse[]>(geocodeUrl);

    if (geocodeRes.data.length === 0) {
        throw new Error('City not found');
    }

    const { lat, lon, display_name: name } = geocodeRes.data[0];

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

    // Extract 7 days (skip if including past_days)
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

    return { city: name, rankings };

}