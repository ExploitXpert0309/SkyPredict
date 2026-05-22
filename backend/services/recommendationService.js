const mapAqi = {
  1: 'Good',
  2: 'Fair',
  3: 'Moderate',
  4: 'Poor',
  5: 'Very Poor'
};

export const buildRecommendations = ({ current, forecast, airQuality }) => {
  const temp = current.main.temp;
  const condition = current.weather?.[0]?.main?.toLowerCase() || '';
  const description = current.weather?.[0]?.description?.toLowerCase() || '';
  const wind = current.wind?.speed || 0;
  const aqi = airQuality?.list?.[0]?.main?.aqi || 1;
  const nextSlots = forecast.list?.slice(0, 8) || [];
  const nextRain = nextSlots.some((item) => item.weather?.[0]?.main?.toLowerCase().includes('rain'));
  const nextStorm = nextSlots.some((item) => item.weather?.[0]?.main?.toLowerCase().includes('thunderstorm'));
  const forecastHigh = Math.max(temp, ...nextSlots.map((item) => item.main?.temp_max ?? item.main?.temp ?? temp));
  const forecastLow = Math.min(temp, ...nextSlots.map((item) => item.main?.temp_min ?? item.main?.temp ?? temp));
  const feelsLike = current.main.feels_like ?? temp;

  const clothing = [];
  if (temp <= 10) clothing.push('Layer up with a warm jacket and closed shoes.');
  else if (temp >= 30) clothing.push('Choose breathable fabrics, sunglasses, and sunscreen.');
  else clothing.push('Light layers should keep you comfortable through the day.');
  if (nextRain || condition.includes('rain')) clothing.push('Carry an umbrella or compact rain jacket.');

  const travel = [];
  if (nextStorm || condition.includes('thunderstorm')) {
    travel.push('Avoid non-essential outdoor travel during storm windows. Choose indoor plans until lightning risk clears.');
  } else if (forecastHigh >= 42 || feelsLike >= 42) {
    travel.push('Extreme heat today. Avoid outdoor travel between late morning and late afternoon; prefer early morning, evening, or air-conditioned places.');
  } else if (forecastHigh >= 38 || feelsLike >= 38) {
    travel.push('Very hot travel conditions. Keep trips short, carry water, and plan shaded or indoor stops.');
  } else if (nextRain || condition.includes('rain')) {
    travel.push('Rain may slow travel. Carry rain protection and choose indoor attractions or covered routes.');
  } else if (forecastLow <= 12 && forecastHigh <= 24 && aqi <= 3) {
    travel.push('Cooler weather is good for relaxed sightseeing. Parks, lakesides, viewpoints, and walkable landmark areas should feel comfortable.');
  } else if (temp > 16 && temp < 30 && aqi <= 3) {
    travel.push('Great window for sightseeing and outdoor travel. Walking tours, landmarks, and open-air cafes are good options.');
  } else {
    travel.push('Travel is workable, but check the hourly forecast before long outdoor plans and keep a flexible backup.');
  }

  if (description.includes('haze') || description.includes('mist')) {
    travel.push('Visibility may be reduced in some areas. Allow extra time for road travel.');
  }
  if (aqi >= 4) travel.push('Air quality is poor. Keep windows closed and limit heavy outdoor travel.');
  if (wind > 9) travel.push('Expect breezy conditions. Plan extra time for biking or exposed roads.');

  const outdoor = [];
  if (nextRain) outdoor.push('Move longer outdoor activities earlier or keep a backup indoor plan.');
  else if (temp >= 32) outdoor.push('Schedule outdoor activities for morning or evening and hydrate often.');
  else outdoor.push('Outdoor activity conditions look workable today.');

  const warnings = [];
  if (forecastHigh >= 42 || feelsLike >= 42) warnings.push('Extreme heat risk is elevated. Heat exhaustion can happen quickly outside.');
  else if (temp >= 38) warnings.push('Heat stress risk is elevated.');
  if (temp <= 2) warnings.push('Freezing conditions may affect roads and exposed plumbing.');
  if (wind >= 14) warnings.push('High winds may impact outdoor plans.');
  if (aqi >= 4) warnings.push(`AQI is ${mapAqi[aqi]}. Sensitive groups should reduce outdoor exposure.`);
  if (!warnings.length) warnings.push('No major weather warnings detected from the current data.');

  return { clothing, travel, outdoor, warnings };
};
