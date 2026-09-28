import React from 'react';
import { Droplets, Wind, Gauge, Sun, Compass, Umbrella } from 'lucide-react';

export default function WeatherMetricsGrid({ weatherData, unit }) {
  if (!weatherData) return null;

  const { current, uvIndex } = weatherData;

  // Convert wind speed if unit is Fahrenheit (mph vs km/h)
  const windDisplay = unit === 'F' 
    ? `${Math.round(current.windSpeed * 0.621371)} mph` 
    : `${current.windSpeed} km/h`;

  // Get wind direction cardinal string
  const getWindDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  // UV status text
  const getUVStatus = (uv) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-400' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-yellow-400' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-400' };
    if (uv <= 10) return { text: 'Very High', color: 'text-red-400' };
    return { text: 'Extreme', color: 'text-purple-400' };
  };

  const uvInfo = getUVStatus(uvIndex);

  const metrics = [
    {
      title: 'Humidity',
      value: `${current.humidity}%`,
      subtext: current.humidity > 70 ? 'High humidity' : current.humidity < 30 ? 'Dry air' : 'Comfortable',
      icon: Droplets,
      color: 'text-sky-400',
    },
    {
      title: 'Wind Speed',
      value: windDisplay,
      subtext: `Direction: ${getWindDirection(current.windDirection)} (${current.windDirection}°)`,
      icon: Wind,
      color: 'text-teal-300',
    },
    {
      title: 'UV Index',
      value: uvIndex,
      subtext: uvInfo.text,
      subtextColor: uvInfo.color,
      icon: Sun,
      color: 'text-amber-400',
    },
    {
      title: 'Air Pressure',
      value: `${current.pressure} hPa`,
      subtext: current.pressure > 1013 ? 'High pressure (Fair)' : 'Low pressure',
      icon: Gauge,
      color: 'text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const IconComponent = m.icon;
        return (
          <div
            key={idx}
            className="glass-card glass-card-hover rounded-2xl p-4 md:p-5 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {m.title}
              </span>
              <IconComponent className={`w-5 h-5 ${m.color}`} />
            </div>

            <div>
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {m.value}
              </div>
              <p className={`text-xs mt-1 ${m.subtextColor || 'text-slate-300'}`}>
                {m.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
