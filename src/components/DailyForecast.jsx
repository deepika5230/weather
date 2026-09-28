import React from 'react';
import * as Icons from 'lucide-react';
import { getWeatherInfo } from '../services/weatherApi';

export default function DailyForecast({ dailyData, unit }) {
  if (!dailyData || dailyData.length === 0) return null;

  const daysToShow = dailyData.slice(0, 5); // 5-day forecast

  const formatTemp = (celsius) => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  const getDayName = (dateString, idx) => {
    if (idx === 0) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Find min and max temp across the entire 5 days to calculate range bar widths
  const allMin = Math.min(...daysToShow.map((d) => d.tempMin));
  const allMax = Math.max(...daysToShow.map((d) => d.tempMax));
  const totalRange = Math.max(allMax - allMin, 1);

  return (
    <div className="glass-card rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
      <h2 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
        <Icons.Calendar className="w-5 h-5 text-sky-400" />
        5-Day Weather Forecast
      </h2>

      <div className="divide-y divide-white/10">
        {daysToShow.map((day, idx) => {
          const info = getWeatherInfo(day.weatherCode, 1);
          const IconComponent = Icons[info.icon] || Icons.Cloud;

          // Calculate temperature indicator bar position
          const leftPercent = ((day.tempMin - allMin) / totalRange) * 100;
          const barWidthPercent = Math.max(((day.tempMax - day.tempMin) / totalRange) * 100, 10);

          return (
            <div
              key={idx}
              className="py-3.5 flex items-center justify-between gap-3 text-xs md:text-sm hover:bg-white/5 px-2 rounded-xl transition-colors"
            >
              {/* Day name */}
              <div className="w-20 font-semibold text-white">
                {getDayName(day.date, idx)}
              </div>

              {/* Weather icon & label */}
              <div className="flex items-center gap-2 w-36">
                <IconComponent className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="text-slate-300 text-xs truncate">
                  {info.label}
                </span>
              </div>

              {/* Temperature Bar & Min/Max values */}
              <div className="flex items-center gap-3 flex-1 justify-end max-w-xs">
                <span className="w-8 text-right font-medium text-slate-300">
                  {formatTemp(day.tempMin)}°
                </span>

                {/* Range bar background */}
                <div className="hidden sm:block flex-1 h-2 bg-white/10 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-teal-300 to-amber-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidthPercent}%`,
                    }}
                  ></div>
                </div>

                <span className="w-8 text-right font-bold text-white">
                  {formatTemp(day.tempMax)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
