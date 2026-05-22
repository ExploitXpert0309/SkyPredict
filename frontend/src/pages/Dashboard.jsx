import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AirQualityCard from '../components/AirQualityCard.jsx';
import ComparisonPanel from '../components/ComparisonPanel.jsx';
import CurrentWeatherCard from '../components/CurrentWeatherCard.jsx';
import DateRangePanel from '../components/DateRangePanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FavoritesPanel from '../components/FavoritesPanel.jsx';
import Footer from '../components/Footer.jsx';
import ForecastGrid from '../components/ForecastGrid.jsx';
import HistoricalWeatherPanel from '../components/HistoricalWeatherPanel.jsx';
import HistoryPanel from '../components/HistoryPanel.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import MapPanel from '../components/MapPanel.jsx';
import Navbar from '../components/Navbar.jsx';
import Recommendations from '../components/Recommendations.jsx';
import TravelVideos from '../components/TravelVideos.jsx';
import WeatherSearch from '../components/WeatherSearch.jsx';
import { weatherApi } from '../services/api.js';
import { backgroundClass } from '../utils/weather.js';

const TrendCharts = lazy(() => import('../components/TrendCharts.jsx'));
const DASHBOARD_WEATHER_KEY = 'lastWeatherDashboard';

const yesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const readLastWeather = () => {
  try {
    const raw = sessionStorage.getItem(DASHBOARD_WEATHER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(readLastWeather);
  const [historical, setHistorical] = useState(null);
  const [historicalDate, setHistoricalDate] = useState(yesterday);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [historicalError, setHistoricalError] = useState('');
  const [history, setHistory] = useState([]);
  const [searches, setSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const heroClass = useMemo(() => backgroundClass(weather), [weather]);

  const refreshCollections = useCallback(async () => {
    const [historyRows, searchRows, favoriteRows] = await Promise.allSettled([
      weatherApi.history(),
      weatherApi.searches(),
      weatherApi.favorites()
    ]);
    if (historyRows.status === 'fulfilled') setHistory(historyRows.value);
    if (searchRows.status === 'fulfilled') setSearches(searchRows.value);
    if (favoriteRows.status === 'fulfilled') setFavorites(favoriteRows.value);
  }, []);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  const runSearch = useCallback(async (queryOrPayload) => {
    const payload = typeof queryOrPayload === 'string' ? { query: queryOrPayload.trim() } : queryOrPayload;
    if (!payload.query && (!Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude))) {
      setError('Enter a city, zip code, coordinates, landmark, or use current location.');
      return null;
    }

    setLoading(true);
    setError('');
    setNotice('');
    try {
      const data = await weatherApi.search(payload);
      setWeather(data);
      sessionStorage.setItem(DASHBOARD_WEATHER_KEY, JSON.stringify(data));
      setHistorical(null);
      setHistoricalError('');
      if (data.warnings?.length) setNotice(data.warnings.join(' '));
      refreshCollections();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshCollections]);

  const geolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        runSearch({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        setLoading(false);
        setError('Location access was denied. Search manually or allow location permission.');
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
    );
  };

  const addFavorite = async (cityName) => {
    try {
      setError('');
      setNotice('');
      await weatherApi.addFavorite({ cityName, country: '' });
      refreshCollections();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteFavorite = async (id) => {
    try {
      setError('');
      await weatherApi.deleteFavorite(id);
      refreshCollections();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteHistory = async (id) => {
    try {
      setError('');
      await weatherApi.deleteHistory(id);
      refreshCollections();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSearch = async (id) => {
    try {
      setError('');
      await weatherApi.deleteSearch(id);
      setSearches((current) => current.filter((search) => search.id !== id));
      refreshCollections();
    } catch (err) {
      setError(err.message);
    }
  };

  const clearSearches = async () => {
    try {
      setError('');
      await weatherApi.clearSearches();
      setSearches([]);
      refreshCollections();
    } catch (err) {
      setError(err.message);
    }
  };

  const loadHistoricalWeather = async (event) => {
    event.preventDefault();
    if (!weather) {
      setHistoricalError('Search a location before loading a past weather report.');
      return;
    }

    setHistoricalLoading(true);
    setHistoricalError('');
    try {
      const data = await weatherApi.historical({
        latitude: weather.location.lat,
        longitude: weather.location.lon,
        query: weather.location.displayName || weather.location.name,
        date: historicalDate
      });
      setHistorical(data);
    } catch (err) {
      setHistoricalError(err.message);
    } finally {
      setHistoricalLoading(false);
    }
  };

  const openForecastDay = (day) => {
    if (!weather) return;
    const payload = {
      date: day.date,
      location: [weather.location.name, weather.location.state, weather.location.country].filter(Boolean).join(', '),
      latitude: weather.location.lat,
      longitude: weather.location.lon,
      items: day.items
    };
    sessionStorage.setItem('selectedForecastDay', JSON.stringify(payload));
    navigate(`/forecast/${day.date}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <Navbar />
      <main className={`${heroClass} transition-colors duration-500`}>
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <WeatherSearch onSearch={runSearch} onGeolocate={geolocate} loading={loading} error={error} notice={notice} />
          {loading && <LoadingSkeleton />}
          {!loading && !weather && <EmptyState />}
          {weather && (
            <motion.div layout className="space-y-6">
              <CurrentWeatherCard weather={weather} />
              <HistoricalWeatherPanel
                weather={weather}
                historical={historical}
                selectedDate={historicalDate}
                onDateChange={setHistoricalDate}
                onLoad={loadHistoricalWeather}
                loading={historicalLoading}
                error={historicalError}
              />
              <ForecastGrid forecast={weather.forecast} onSelectDay={openForecastDay} />
              <DateRangePanel weather={weather} onSubmit={async (payload) => {
                const data = await weatherApi.range(payload);
                refreshCollections();
                return data;
              }} />
              <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <AirQualityCard airQuality={weather.airQuality} />
                <Recommendations recommendations={weather.recommendations} />
              </div>
              <Suspense fallback={<div className="skeleton h-80" />}>
                <TrendCharts forecast={weather.forecast} />
              </Suspense>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <MapPanel weather={weather} />
                <TravelVideos videos={weather.videos} />
              </div>
            </motion.div>
          )}

          <div className="grid gap-6 xl:grid-cols-3">
            <FavoritesPanel favorites={favorites} onAdd={addFavorite} onDelete={deleteFavorite} onSearch={runSearch} />
            <HistoryPanel history={history} searches={searches} onDelete={deleteHistory} onSearch={runSearch} onDeleteSearch={deleteSearch} onClearSearches={clearSearches} />
            <ComparisonPanel onCompare={(query) => weatherApi.search({ query })} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
