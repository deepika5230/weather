/**
 * Weather API Service utilizing Open-Meteo Public API
 * No API key required.
 */

// WMO Weather Interpretation Codes (WW)
export const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: 'Sun', theme: 'clear-day' },
  1: { label: 'Mainly Clear', icon: 'SunMedium', theme: 'clear-day' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun', theme: 'partly-cloudy' },
  3: { label: 'Overcast', icon: 'Cloud', theme: 'overcast' },
  45: { label: 'Foggy', icon: 'CloudFog', theme: 'fog' },
  48: { label: 'Icy Fog', icon: 'CloudFog', theme: 'fog' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle', theme: 'rain' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', theme: 'rain' },
  55: { label: 'Dense Drizzle', icon: 'CloudDrizzle', theme: 'rain' },
  56: { label: 'Freezing Drizzle', icon: 'CloudSnow', theme: 'snow' },
  57: { label: 'Heavy Freezing Drizzle', icon: 'CloudSnow', theme: 'snow' },
  61: { label: 'Slight Rain', icon: 'CloudRain', theme: 'rain' },
  63: { label: 'Moderate Rain', icon: 'CloudRain', theme: 'rain' },
  65: { label: 'Heavy Rain', icon: 'CloudRainWind', theme: 'rain' },
  66: { label: 'Freezing Rain', icon: 'CloudSnow', theme: 'snow' },
  67: { label: 'Heavy Freezing Rain', icon: 'CloudSnow', theme: 'snow' },
  71: { label: 'Slight Snow', icon: 'CloudSnow', theme: 'snow' },
  73: { label: 'Moderate Snow', icon: 'CloudSnow', theme: 'snow' },
  75: { label: 'Heavy Snow', icon: 'Snowflake', theme: 'snow' },
  77: { label: 'Snow Grains', icon: 'Snowflake', theme: 'snow' },
  80: { label: 'Slight Rain Showers', icon: 'CloudRain', theme: 'rain' },
  81: { label: 'Moderate Rain Showers', icon: 'CloudRain', theme: 'rain' },
  82: { label: 'Violent Rain Showers', icon: 'CloudRainWind', theme: 'rain' },
  85: { label: 'Slight Snow Showers', icon: 'CloudSnow', theme: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: 'Snowflake', theme: 'snow' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', theme: 'thunderstorm' },
  96: { label: 'Thunderstorm with Slight Hail', icon: 'CloudLightning', theme: 'thunderstorm' },
  99: { label: 'Thunderstorm with Heavy Hail', icon: 'CloudLightning', theme: 'thunderstorm' },
};

/**
 * Helper to get weather info from WMO code
 */
export function getWeatherInfo(code, isDay = 1) {
  const defaultInfo = { label: 'Unknown', icon: 'Cloud', theme: 'overcast' };
  const info = WMO_WEATHER_CODES[code] || defaultInfo;
  
  if (code === 0 || code === 1) {
    if (!isDay) {
      return { ...info, label: code === 0 ? 'Clear Night' : 'Mostly Clear', icon: 'Moon', theme: 'clear-night' };
    }
  } else if (code === 2 && !isDay) {
    return { ...info, icon: 'CloudMoon', theme: 'partly-cloudy-night' };
  }
  
  return info;
}

/**
 * Search cities using Open-Meteo Geocoding API
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding server error: ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching city search results:', error);
    return [];
  }
}

/**
 * Fetch full weather data by coordinates
 */
export async function fetchWeatherData(lat, lon, locationName, countryName, adminRegion) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,wind_speed_10m_max&timezone=auto`;

  try {
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}`);
    }
    
    const data = await response.json();

    if (!data.current) {
      throw new Error('Invalid response structure received from weather service.');
    }

    // Format current weather
    const current = {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: data.current.wind_direction_10m,
      pressure: Math.round(data.current.surface_pressure),
      isDay: data.current.is_day,
      weatherCode: data.current.weather_code,
      precipitation: data.current.precipitation,
      rain: data.current.rain,
      time: data.current.time,
      timezone: data.timezone,
    };

    // Format hourly forecast (next 24 hours)
    const currentHourIndex = data.hourly.time.findIndex(t => {
      const timeDate = new Date(t);
      const nowDate = new Date(data.current.time);
      return timeDate >= nowDate;
    });
    
    const startIdx = currentHourIndex >= 0 ? currentHourIndex : 0;
    const hourly = data.hourly.time.slice(startIdx, startIdx + 24).map((t, idx) => ({
      time: t,
      temp: Math.round(data.hourly.temperature_2m[startIdx + idx]),
      weatherCode: data.hourly.weather_code[startIdx + idx],
      humidity: data.hourly.relative_humidity_2m[startIdx + idx],
      pop: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[startIdx + idx] : 0,
    }));

    // Format daily forecast (next 5-7 days)
    const daily = data.daily.time.slice(0, 7).map((t, idx) => ({
      date: t,
      weatherCode: data.daily.weather_code[idx],
      tempMax: Math.round(data.daily.temperature_2m_max[idx]),
      tempMin: Math.round(data.daily.temperature_2m_min[idx]),
      uvIndex: data.daily.uv_index_max ? Math.round(data.daily.uv_index_max[idx]) : 0,
      precipitation: data.daily.precipitation_sum ? data.daily.precipitation_sum[idx] : 0,
      windMax: Math.round(data.daily.wind_speed_10m_max[idx]),
    }));

    return {
      location: {
        name: locationName,
        country: countryName,
        region: adminRegion,
        lat,
        lon,
      },
      current,
      hourly,
      daily,
      uvIndex: daily[0]?.uvIndex || 0,
    };
  } catch (error) {
    console.error('Fetch weather data error:', error);
    throw new Error(
      error.message.includes('HTTP')
        ? `Weather server error (${error.message}). Please try again later.`
        : 'Failed to fetch weather data. Please check your internet connection.'
    );
  }
}

/**
 * Search city by name and fetch its weather directly
 */
export async function fetchWeatherByCity(cityName) {
  if (!cityName || !cityName.trim()) {
    throw new Error('Please enter a city name to search.');
  }

  const results = await searchCities(cityName);

  if (!results || results.length === 0) {
    throw new Error(`No location found matching "${cityName}". Please check spelling and try again.`);
  }

  const match = results[0];
  const fullCountry = match.country || '';
  const adminRegion = match.admin1 || match.admin2 || '';

  return await fetchWeatherData(match.latitude, match.longitude, match.name, fullCountry, adminRegion);
}

/**
 * Fetch weather using user's coordinates (from navigator.geolocation)
 */
export async function fetchWeatherByCoords(lat, lon) {
  try {
    // Attempt reverse geocoding via bigdatacloud or open-meteo fallback
    const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(geoUrl);
    let locationName = 'Your Location';
    let countryName = '';
    let adminRegion = '';

    if (res.ok) {
      const geoData = await res.json();
      locationName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Your Location';
      countryName = geoData.countryName || '';
      adminRegion = geoData.principalSubdivision || '';
    }

    return await fetchWeatherData(lat, lon, locationName, countryName, adminRegion);
  } catch (err) {
    console.warn('Reverse geocode failed, using generic name:', err);
    return await fetchWeatherData(lat, lon, 'Current Location', '', '');
  }
}
