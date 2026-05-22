import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 12000
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = !navigator.onLine
      ? 'You appear to be offline. Reconnect and try again.'
      : error.response?.data?.message || error.message || 'Unexpected API error.';
    return Promise.reject(new Error(message));
  }
);

export const weatherApi = {
  search: (payload) => client.post('/weather', payload).then((res) => res.data.data),
  suggestions: (query) => client.get('/weather/suggestions', { params: { query } }).then((res) => res.data.data),
  historical: (payload) => client.post('/weather/historical', payload).then((res) => res.data.data),
  hourlyForecast: (payload) => client.post('/weather/hourly-forecast', payload).then((res) => res.data.data),
  history: () => client.get('/history').then((res) => res.data.data),
  searches: () => client.get('/history/searches').then((res) => res.data.data),
  deleteSearch: (id) => client.delete(`/history/searches/${id}`).then((res) => res.data.data),
  clearSearches: () => client.delete('/history/searches').then((res) => res.data.data),
  favorites: () => client.get('/favorites').then((res) => res.data.data),
  addFavorite: (favorite) => client.post('/favorites', favorite).then((res) => res.data.data),
  updateFavorite: (id, favorite) => client.put(`/favorites/${id}`, favorite).then((res) => res.data.data),
  deleteFavorite: (id) => client.delete(`/favorites/${id}`).then((res) => res.data.data),
  deleteHistory: (id) => client.delete(`/weather/${id}`).then((res) => res.data.data),
  exportHistory: (format) => `${client.defaults.baseURL}/history/export?format=${format}`
};
