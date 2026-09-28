import React from 'react';
import * as Icons from 'lucide-react';
import { getWeatherInfo } from '../services/weatherApi';

export default function HourlyForecast({ hourlyData, unit }) {
  if (!hourlyData || hourlyData.length === 0) return null;

  const formatTemp = (celsius) => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  const formatHour = (isoString, index) => {
    if (index === 0) return 'Now';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  return (
    <div className="glass-card rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
          <Icons.Clock className="w-5 h-5 text-sky-400" />
          Hourly Forecast (Next 24 Hours)
        </h2>
        <span className="text-xs text-slate-400">Scroll horizontally →</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 snap-x scrollbar-thin">
        {hourlyData.map((item, idx) => {
          const info = getWeatherInfo(item.weatherCode, 1);
          const IconComponent = Icons[info.icon] || Icons.Cloud;

          return (
            <div
              key={idx}
              className={`snap-start flex flex-col items-center justify-between min-w-[76px] py-3 px-2 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-sky-500/25 border-sky-400/40 shadow-lg shadow-sky-500/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-xs font-medium text-slate-200">
                {formatHour(item.time, idx)}
              </span>

              <div className="my-2 text-amber-300">
                <IconComponent className="w-7 h-7" />
              </div>

              <span className="text-sm font-bold text-white">
                {formatTemp(item.temp)}°
              </span>

              {item.pop > 10 && (
                <span className="text-[10px] font-semibold text-sky-300 mt-1 flex items-center gap-0.5">
                  <Icons.Droplets className="w-2.5 h-2.5" />
                  {item.pop}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
