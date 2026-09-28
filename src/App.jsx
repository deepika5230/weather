import React, { useState, useEffect } from 'react';
import { CloudSun, Sparkles, RefreshCw } from 'lucide-react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherMetricsGrid from './components/WeatherMetricsGrid';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import ErrorMessage from './components/ErrorMessage';
import SkeletonLoader from './components/SkeletonLoader';
import {
  fetchWeatherByCity,
  fetchWeatherData,
  fetchWeatherByCoords,
  getWeatherInfo,
} from './services/weatherApi';

const POPULAR_CITIES = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Cairo'];

export default function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchedCity, setLastSearchedCity] = useState('London');

  // Temperature unit (°C or °F) saved in localStorage
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('weather_unit') || 'C';
  });

  // Recent searches saved in localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('weather_recent_searches');
      return saved ? JSON.parse(saved) : ['London', 'Tokyo', 'New York'];
    } catch {
      return ['London', 'Tokyo', 'New York'];
    }
  });

  const saveRecentSearch = (cityName) => {
    if (!cityName) return;
    const formatted = cityName.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== formatted.toLowerCase());
      const updated = [formatted, ...filtered].slice(0, 6);
      localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveRecent = (cityName) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== cityName);
      localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleUnit = (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('weather_unit', newUnit);
  };

  // Main search function
  const handleSearchCity = async (cityName) => {
    setIsLoading(true);
    setError(null);
    setLastSearchedCity(cityName);

    try {
      const data = await fetchWeatherByCity(cityName);
      setWeatherData(data);
      saveRecentSearch(data.location.name);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to load weather data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search by exact coordinates from dropdown suggestion
  const handleSelectCityCoords = async (lat, lon, name, country, region) => {
    setIsLoading(true);
    setError(null);
    setLastSearchedCity(name);

    try {
      const data = await fetchWeatherData(lat, lon, name, country, region);
      setWeatherData(data);
      saveRecentSearch(name);
    } catch (err) {
      setError(err.message || 'Failed to load weather data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Browser Geolocation trigger
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await fetchWeatherByCoords(latitude, longitude);
          setWeatherData(data);
          saveRecentSearch(data.location.name);
        } catch (err) {
          setError('Failed to fetch weather for your current location.');
        } finally {
          setIsLoadingLocation(false);
          setIsLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLoadingLocation(false);
        setError('Location permission denied or unavailable. Please search by city name.');
      },
      { timeout: 10000 }
    );
  };

  // Load default city on mount
  useEffect(() => {
    handleSearchCity('London');
  }, []);

  // Compute theme gradient background based on current weather condition
  const getThemeBackground = () => {
    if (!weatherData) return 'from-slate-950 via-slate-900 to-indigo-950';

    const info = getWeatherInfo(weatherData.current.weatherCode, weatherData.current.isDay);
    
    switch (info.theme) {
      case 'clear-day':
        return 'from-sky-600 via-blue-700 to-amber-900';
      case 'clear-night':
        return 'from-indigo-950 via-slate-900 to-blue-950';
      case 'partly-cloudy':
        return 'from-sky-700 via-slate-800 to-indigo-950';
      case 'partly-cloudy-night':
        return 'from-slate-950 via-indigo-950 to-blue-900';
      case 'rain':
        return 'from-slate-900 via-blue-950 to-cyan-950';
      case 'snow':
        return 'from-slate-800 via-blue-900 to-slate-950';
      case 'thunderstorm':
        return 'from-slate-950 via-purple-950 to-slate-900';
      case 'fog':
        return 'from-slate-800 via-slate-900 to-gray-950';
      default:
        return 'from-slate-950 via-slate-900 to-indigo-950';
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getThemeBackground()} text-slate-100 transition-all duration-700 px-4 py-6 md:px-8 md:py-10`}
    >
      {/* Header Bar */}
      <header className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-sky-300 shadow-lg">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SkyPulse Weather
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-300">Clean, accurate, real-time weather forecasts</p>
          </div>
        </div>

        {/* Quick popular city shortcuts */}
        <div className="flex flex-wrap justify-center gap-1.5 text-xs">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleSearchCity(city)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-200 border border-white/10 transition-all"
            >
              {city}
            </button>
          ))}
        </div>
      </header>

      {/* Search Input Bar */}
      <section className="mb-8">
        <SearchBar
          onSearchCity={handleSearchCity}
          onSelectCityCoords={handleSelectCityCoords}
          onUseLocation={handleUseLocation}
          recentSearches={recentSearches}
          onRemoveRecent={handleRemoveRecent}
          isLoadingLocation={isLoadingLocation}
        />
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto space-y-6">
        {isLoading ? (
          <SkeletonLoader />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={() => handleSearchCity(lastSearchedCity)}
            onClearSearch={() => handleSearchCity('London')}
          />
        ) : weatherData ? (
          <>
            {/* Current Weather Card */}
            <CurrentWeather
              weatherData={weatherData}
              unit={unit}
              onToggleUnit={handleToggleUnit}
            />

            {/* Weather Metrics Grid */}
            <WeatherMetricsGrid
              weatherData={weatherData}
              unit={unit}
            />

            {/* Hourly Forecast Scroll */}
            <HourlyForecast
              hourlyData={weatherData.hourly}
              unit={unit}
            />

            {/* Daily Forecast Cards */}
            <DailyForecast
              dailyData={weatherData.daily}
              unit={unit}
            />
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto mt-12 text-center text-xs text-slate-400 py-4 border-t border-white/10 space-y-1">
        <p>Powered by Open-Meteo Public API • Real-time weather metrics & 5-day forecasts</p>
        <p className="text-slate-500">Built with React, Vite & Tailwind CSS</p>
      </footer>
    </div>
  );
}
