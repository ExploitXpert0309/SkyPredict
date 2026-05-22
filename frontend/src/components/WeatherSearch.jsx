import { Crosshair, Loader2, MapPin, Mic, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce.js';
import { weatherApi } from '../services/api.js';

export default function WeatherSearch({ onSearch, onGeolocate, loading, error, notice }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggesting, setSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const isReady = useMemo(() => debouncedQuery.trim().length >= 2 || /^-?\d+(\.\d+)?\s*,/.test(debouncedQuery), [debouncedQuery]);

  useEffect(() => {
    const term = debouncedQuery.trim();
    const looksLikeCoordinates = /^-?\d+(\.\d+)?\s*,/.test(term) || /\d+\s*[NS]\s*,?\s*\d+\s*[EW]/i.test(term);

    if (term.length < 2 || looksLikeCoordinates || term === selectedQuery) {
      setSuggestions([]);
      setSuggesting(false);
      setShowSuggestions(false);
      return undefined;
    }

    let active = true;
    setSuggesting(true);

    weatherApi.suggestions(term)
      .then((items) => {
        if (!active) return;
        setSuggestions(items || []);
        setShowSuggestions((items || []).length > 0);
      })
      .catch(() => {
        if (active) setSuggestions([]);
      })
      .finally(() => {
        if (active) setSuggesting(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, selectedQuery]);

  const submit = (event) => {
    event.preventDefault();
    setSelectedQuery(query.trim());
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(query);
  };

  const selectSuggestion = (suggestion) => {
    const nextQuery = suggestion.query || suggestion.description;
    setQuery(nextQuery);
    setSelectedQuery(nextQuery.trim());
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(nextQuery);
  };

  const voiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onSearch(query || 'New York');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setQuery(spoken);
      onSearch(spoken);
    };
    recognition.start();
  };

  return (
    <motion.section id="top" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <p className="eyebrow">PM Accelerator AI Engineer Assessment</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[3.4rem]">
          Plan the day with live weather, air quality, and local context.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Search a city, PIN code, address, landmark, or coordinates to see the forecast, map, travel ideas, and practical recommendations in one place.
        </p>
      </div>

      <form onSubmit={submit} className="panel p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <label htmlFor="weather-search" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Search location</label>
          <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">City, address, landmark, or coordinates</span>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              id="weather-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedQuery('');
              }}
              onFocus={() => setShowSuggestions(query.trim() !== selectedQuery && suggestions.length > 0)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 140)}
              placeholder="Hyderabad, 10001, Eiffel Tower, 17.38,78.48"
              autoComplete="off"
              className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-aqua focus:ring-4 focus:ring-aqua/15 dark:border-white/10 dark:bg-slate-900 dark:text-white"
            />
            {suggesting && <Loader2 className="pointer-events-none absolute right-3 top-3.5 animate-spin text-slate-400" size={18} />}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.source}-${suggestion.id}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                    className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <MapPin className="mt-0.5 shrink-0 text-aqua" size={17} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{suggestion.label}</span>
                      <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">{suggestion.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="primary-btn h-12" type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            Search
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="muted-btn py-2" type="button" onClick={onGeolocate} disabled={loading}>
            <Crosshair size={17} />
            Current location
          </button>
          <button className="muted-btn py-2" type="button" onClick={voiceSearch} disabled={loading}>
            <Mic size={17} />
            Voice
          </button>
          <span className={`rounded-lg px-3 py-2 text-xs font-semibold ${isReady ? 'bg-meadow/10 text-meadow' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'}`}>
            {isReady ? 'Ready to search' : 'Try Hyderabad or 17.38,78.48'}
          </span>
        </div>

        {error && <p className="mt-4 rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-coral">{error}</p>}
        {notice && !error && <p className="mt-4 rounded-lg border border-amberline/30 bg-amberline/10 px-4 py-3 text-sm font-medium text-slate-700 dark:text-amberline">{notice}</p>}
      </form>
    </motion.section>
  );
}
