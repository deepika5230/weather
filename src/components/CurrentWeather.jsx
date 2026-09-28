import React from 'react';
import * as Icons from 'lucide-react';
import { getWeatherInfo } from '../services/weatherApi';

export default function CurrentWeather({ weatherData, unit, onToggleUnit }) {
  if (!weatherData) return null;

  const { location, current, daily } = weatherData;
  const weatherInfo = getWeatherInfo(current.weatherCode, current.isDay);
  const IconComponent = Icons[weatherInfo.icon] || Icons.Cloud;

  // Temperature conversion helper
  const formatTemp = (celsius) => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  const todayMin = daily[0]?.tempMin ?? current.temp;
  const todayMax = daily[0]?.tempMax ?? current.temp;

  // Format local date string
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all duration-300">
      {/* Background ambient lighting glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        {/* Left column: Location & Temperature */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {location.name}
              </h1>
              {location.country && (
                <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-sky-200">
                  {location.country}
                </span>
              )}
            </div>
            <p className="text-slate-300 text-sm mt-1">
              {[location.region, formattedDate].filter(Boolean).join(' • ')}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="flex items-start">
              <span className="text-6xl md:text-7xl font-extrabold tracking-tighter text-white">
                {formatTemp(current.temp)}
              </span>
              <span className="text-3xl font-semibold text-slate-300 ml-1">°</span>
            </div>

            {/* °C / °F Unit Toggle Button */}
            <div className="flex bg-white/10 p-1 rounded-xl border border-white/15 backdrop-blur-md">
              <button
                onClick={() => onToggleUnit('C')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  unit === 'C'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => onToggleUnit('F')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  unit === 'F'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Feels like & Range */}
          <div className="flex items-center gap-4 text-xs md:text-sm text-slate-200">
            <span>
              Feels like <strong className="text-white font-semibold">{formatTemp(current.feelsLike)}°{unit}</strong>
            </span>
            <span className="text-white/30">•</span>
            <span>
              H: <strong className="text-white font-semibold">{formatTemp(todayMax)}°</strong> L: <strong className="text-white font-semibold">{formatTemp(todayMin)}°</strong>
            </span>
          </div>
        </div>

        {/* Right column: Icon & Condition badge */}
        <div className="flex flex-col items-center md:items-end justify-center self-center md:self-auto space-y-2">
          <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center text-amber-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] animate-pulse duration-1000">
            <IconComponent className="w-full h-full stroke-[1.5]" />
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white font-semibold text-sm backdrop-blur-md">
            {weatherInfo.label}
          </div>
        </div>
      </div>
    </div>
  );
}
