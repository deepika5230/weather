import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* Current weather skeleton */}
      <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
        <div className="space-y-3 w-full md:w-1/2">
          <div className="h-8 bg-white/10 rounded-xl w-3/4"></div>
          <div className="h-4 bg-white/10 rounded-lg w-1/2"></div>
          <div className="h-16 bg-white/10 rounded-2xl w-2/3 mt-4"></div>
          <div className="h-4 bg-white/10 rounded-lg w-1/3"></div>
        </div>
        <div className="w-28 h-28 bg-white/10 rounded-full shrink-0 self-center md:self-auto"></div>
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-8 bg-white/10 rounded-lg w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Hourly forecast skeleton */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="h-5 bg-white/10 rounded w-1/4"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-20 h-24 bg-white/10 rounded-xl shrink-0"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
