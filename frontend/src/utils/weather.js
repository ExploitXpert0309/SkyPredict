export const iconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

export const getCondition = (weather) => weather?.current?.weather?.[0]?.main?.toLowerCase() || '';

export const backgroundClass = (weather) => {
  const condition = getCondition(weather);
  const hour = new Date().getHours();
  if (hour >= 19 || hour <= 5) return 'weather-night';
  if (condition.includes('rain') || condition.includes('storm') || condition.includes('drizzle')) return 'weather-rain';
  if (condition.includes('cloud') || condition.includes('mist') || condition.includes('haze')) return 'weather-clouds';
  return 'weather-sunny';
};

const localForecastDate = (item, timezoneOffset = 0) => {
  const timestamp = item.dt ? item.dt + timezoneOffset : Date.parse(item.dt_txt) / 1000;
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
};

const localForecastHour = (item, timezoneOffset = 0) => {
  const timestamp = item.dt ? item.dt + timezoneOffset : Date.parse(item.dt_txt) / 1000;
  return new Date(timestamp * 1000).getUTCHours();
};

const localForecastTime = (item, timezoneOffset = 0) => {
  const timestamp = item.dt ? item.dt + timezoneOffset : Date.parse(item.dt_txt) / 1000;
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

export const buildDailyForecast = (forecast) => {
  const grouped = new Map();
  const timezoneOffset = forecast?.city?.timezone || 0;

  (forecast?.list || []).forEach((item) => {
    const date = localForecastDate(item, timezoneOffset);
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date).push(item);
  });

  return [...grouped.entries()].slice(0, 5).map(([date, items]) => {
    const lows = items.map((item) => item.main.temp_min ?? item.main.temp);
    const highs = items.map((item) => item.main.temp_max ?? item.main.temp);
    const noon = items.reduce((closest, item) => {
      const currentDistance = Math.abs(localForecastHour(item, timezoneOffset) - 12);
      const closestDistance = Math.abs(localForecastHour(closest, timezoneOffset) - 12);
      return currentDistance < closestDistance ? item : closest;
    }, items[Math.floor(items.length / 2)]);

    return {
      date,
      min: Math.round(Math.min(...lows)),
      max: Math.round(Math.max(...highs)),
      humidity: Math.round(items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length),
      wind: Number((items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length).toFixed(1)),
      icon: noon.weather?.[0]?.icon,
      description: noon.weather?.[0]?.description || '',
      items: items.map((item) => ({
        time: item.dt_txt,
        hour: localForecastTime(item, timezoneOffset),
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        wind: Number(item.wind.speed.toFixed(1)),
        visibility: item.visibility,
        icon: item.weather?.[0]?.icon,
        description: item.weather?.[0]?.description || ''
      }))
    };
  });
};

export const chartData = (forecast) => (forecast?.list || []).slice(0, 16).map((item) => ({
  time: new Date(item.dt_txt).toLocaleString([], { weekday: 'short', hour: 'numeric' }),
  temp: Math.round(item.main.temp),
  humidity: item.main.humidity,
  wind: Number(item.wind.speed.toFixed(1))
}));

export const formatTime = (seconds, timezoneOffset = 0) => {
  const date = new Date((seconds + timezoneOffset) * 1000);
  return date.toUTCString().slice(17, 22);
};

export const aqiLabel = (aqi) => ({
  1: ['Good', 'text-meadow'],
  2: ['Fair', 'text-aqua'],
  3: ['Moderate', 'text-amberline'],
  4: ['Poor', 'text-coral'],
  5: ['Very Poor', 'text-red-600']
}[aqi] || ['Unknown', 'text-slate-500']);

export const visibilityKm = (meters) => `${((meters || 0) / 1000).toFixed(1)} km`;
