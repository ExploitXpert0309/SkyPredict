import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ForecastDay from './pages/ForecastDay.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="forecast/:date" element={<ForecastDay />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
