import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { chartData } from '../utils/weather.js';

export default function TrendCharts({ forecast }) {
  const data = chartData(forecast);

  return (
    <section id="charts" className="panel p-5">
      <div>
        <p className="text-sm font-bold uppercase text-aqua">Charts & Analytics</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Next 48 hours</h2>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="h-72 rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="temp" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#ff7058" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#ff7058" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="temp" name="Temp °C" stroke="#ff7058" fill="url(#temp)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72 rounded-lg border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#10b8c7" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="wind" name="Wind m/s" stroke="#2fbf71" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

