import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, History, Loader2 } from 'lucide-react';
import { searchCities } from '../services/weatherApi';

export default function SearchBar({
  onSearchCity,
  onSelectCityCoords,
  onUseLocation,
  recentSearches = [],
  onRemoveRecent,
  isLoadingLocation,
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced city autocomplete search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const results = await searchCities(query);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearchCity(query.trim());
    }
  };

  const handleSelectSuggestion = (city) => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    onSelectCityCoords(city.latitude, city.longitude, city.name, city.country || '', city.admin1 || '');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 relative z-30" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative w-full flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search city, e.g. London, Tokyo, New York..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl glass-input text-white placeholder-slate-400 focus:outline-none transition-all text-sm md:text-base shadow-lg"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-24 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={onUseLocation}
              disabled={isLoadingLocation}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all"
              title="Use current location"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              ) : (
                <MapPin className="w-4 h-4 text-sky-400" />
              )}
            </button>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-medium text-xs md:text-sm transition-all shadow-md"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Autocomplete & Recent Searches Dropdown */}
      {showDropdown && (query.trim().length >= 2 || recentSearches.length > 0) && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl glass-card bg-slate-900/90 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden z-50">
          {isSearchingSuggestions ? (
            <div className="p-4 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              Searching cities...
            </div>
          ) : query.trim().length >= 2 ? (
            suggestions.length > 0 ? (
              <div className="py-2 divide-y divide-white/5">
                {suggestions.map((city) => (
                  <button
                    key={`${city.id}-${city.latitude}-${city.longitude}`}
                    onClick={() => handleSelectSuggestion(city)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="font-medium text-white group-hover:text-sky-300 transition-colors">
                        {city.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    <MapPin className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">
                No matching cities found. Try another query.
              </div>
            )
          ) : (
            recentSearches.length > 0 && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-sky-400" />
                    Recent Searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {recentSearches.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium cursor-pointer transition-all border border-white/10 group"
                    >
                      <span onClick={() => {
                        setQuery('');
                        setShowDropdown(false);
                        onSearchCity(name);
                      }}>
                        {name}
                      </span>
                      {onRemoveRecent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveRecent(name);
                          }}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
