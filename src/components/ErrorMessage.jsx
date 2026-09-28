import React from 'react';
import { AlertTriangle, RefreshCw, SearchX, WifiOff } from 'lucide-react';

export default function ErrorMessage({ message, onRetry, onClearSearch }) {
  const isNotFound = message?.toLowerCase().includes('no location found') || message?.toLowerCase().includes('check spelling');
  const isNetwork = message?.toLowerCase().includes('connection') || message?.toLowerCase().includes('server');

  return (
    <div className="w-full max-w-xl mx-auto my-8 glass-card rounded-3xl p-6 md:p-8 border border-red-500/30 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
        {isNotFound ? (
          <SearchX className="w-8 h-8" />
        ) : isNetwork ? (
          <WifiOff className="w-8 h-8" />
        ) : (
          <AlertTriangle className="w-8 h-8" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">
          {isNotFound ? 'City Not Found' : 'Something Went Wrong'}
        </h3>
        <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
          {message || 'An unexpected error occurred while fetching weather data.'}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-5 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600/80 active:bg-indigo-600 text-white font-medium text-sm transition-all shadow-sm"
          >
            Try Popular Cities
          </button>
        )}
      </div>
    </div>
  );
}
