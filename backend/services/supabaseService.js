import { Parser } from '@json2csv/plainjs';
import PDFDocument from 'pdfkit';
import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const toXml = (rows) => {
  const items = rows.map((row) => {
    const fields = Object.entries(row)
      .map(([key, value]) => {
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
        return `    <${safeKey}>${escapeXml(text)}</${safeKey}>`;
      })
      .join('\n');
    return `  <record>\n${fields}\n  </record>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<weatherHistory count="${rows.length}">\n${items}\n</weatherHistory>\n`;
};

const toMarkdown = (rows) => {
  if (!rows.length) return '# Weather History\n\n_No records found._\n';
  const header = '| Date | Location | Country | Temp °C | Condition | Humidity | Wind |\n|---|---|---|---|---|---|---|';
  const body = rows.map((row) => {
    const date = row.searched_at ? new Date(row.searched_at).toISOString().slice(0, 10) : '';
    return `| ${date} | ${row.location ?? ''} | ${row.country ?? ''} | ${row.temperature ?? ''} | ${row.weather_condition ?? ''} | ${row.humidity ?? ''} | ${row.wind_speed ?? ''} |`;
  }).join('\n');
  return `# Weather History Export\n\nGenerated: ${new Date().toISOString()}\nRecords: ${rows.length}\n\n${header}\n${body}\n`;
};

const toPdfBuffer = (rows) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  doc.fontSize(18).text('Weather History Export', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('gray').text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
  doc.fontSize(10).text(`Records: ${rows.length}`, { align: 'center' });
  doc.moveDown();

  doc.fillColor('black').fontSize(11);
  rows.forEach((row, index) => {
    const date = row.searched_at ? new Date(row.searched_at).toLocaleString() : '';
    doc.font('Helvetica-Bold').text(`${index + 1}. ${row.location || 'Unknown'}${row.country ? ', ' + row.country : ''}`);
    doc.font('Helvetica').fontSize(10).fillColor('#444')
      .text(`   ${date}`)
      .text(`   ${row.weather_condition || ''} · ${row.temperature ?? '?'}°C · Humidity ${row.humidity ?? '?'}% · Wind ${row.wind_speed ?? '?'} m/s`);
    doc.moveDown(0.4).fillColor('black').fontSize(11);
    if (doc.y > 760) doc.addPage();
  });

  doc.end();
});

const ensureSupabase = () => {
  if (!supabase) {
    throw new ApiError(500, 'Supabase is not configured.');
  }
};

const run = async (operation) => {
  ensureSupabase();
  const { data, error } = await operation();
  if (error) {
    const isPolicyError = error.code === '42501' || /row-level security|permission|policy/i.test(error.message);
    throw new ApiError(
      isPolicyError ? 403 : 500,
      isPolicyError
        ? 'Supabase permission blocked this action. Run the latest SQL policy update in supabase/fix-user-search-delete-policy.sql.'
        : error.message,
      error
    );
  }
  return data;
};

export const saveSearch = async ({ query, searchType }) => run(() =>
  supabase.from('user_searches').insert({ query, search_type: searchType }).select().single()
);

export const saveWeatherHistory = async ({ bundle, recommendations }) => {
  const current = bundle.current;
  return run(() =>
    supabase.from('weather_history').insert({
      location: bundle.location.name,
      country: bundle.location.country,
      latitude: bundle.location.lat,
      longitude: bundle.location.lon,
      temperature: current.main.temp,
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      wind_speed: current.wind?.speed ?? 0,
      weather_condition: current.weather?.[0]?.description || 'Unknown',
      forecast_data: {
        displayName: bundle.location.displayName,
        current,
        forecast: bundle.forecast,
        airQuality: bundle.airQuality,
        uvIndex: bundle.uvIndex,
        timezone: bundle.timezone,
        recommendations
      }
    }).select().single()
  );
};

export const getHistory = async ({ limit = 25, offset = 0 } = {}) => run(() =>
  supabase
    .from('weather_history')
    .select('*')
    .order('searched_at', { ascending: false })
    .range(offset, offset + limit - 1)
);

export const updateHistory = async (id, updates) => run(() =>
  supabase.from('weather_history').update(updates).eq('id', id).select().single()
);

export const deleteHistory = async (id) => run(() =>
  supabase.from('weather_history').delete().eq('id', id).select().single()
);

export const getSearches = async () => run(() =>
  supabase.from('user_searches').select('*').order('created_at', { ascending: false }).limit(25)
);

export const deleteSearch = async (id) => run(() =>
  supabase.from('user_searches').delete().eq('id', id).select().single()
);

export const clearSearches = async () => run(() =>
  supabase.from('user_searches').delete().not('id', 'is', null).select()
);

export const getFavorites = async () => run(() =>
  supabase.from('favorite_locations').select('*').order('created_at', { ascending: false })
);

export const createFavorite = async ({ cityName, country }) => run(() =>
  supabase.from('favorite_locations').insert({ city_name: cityName, country }).select().single()
);

export const updateFavorite = async (id, updates) => run(() =>
  supabase.from('favorite_locations').update(updates).eq('id', id).select().single()
);

export const deleteFavorite = async (id) => run(() =>
  supabase.from('favorite_locations').delete().eq('id', id).select().single()
);

export const saveWeatherRange = async ({ location, days }) => {
  ensureSupabase();
  if (!days?.length) return [];

  const rows = days.map((day) => ({
    location: location.name,
    country: location.country,
    latitude: location.lat,
    longitude: location.lon,
    temperature: day.temperatureMean ?? day.temperatureMax ?? 0,
    humidity: 0,
    pressure: 0,
    wind_speed: day.windSpeedMax ?? 0,
    weather_condition: day.condition || 'Historical range',
    forecast_data: {
      kind: 'range_day',
      displayName: location.displayName,
      date: day.date,
      ...day
    }
  }));

  const { data, error } = await supabase.from('weather_history').insert(rows).select();
  if (error) {
    const isPolicyError = error.code === '42501' || /row-level security|permission|policy/i.test(error.message);
    throw new ApiError(
      isPolicyError ? 403 : 500,
      isPolicyError
        ? 'Supabase permission blocked this action. Run the latest SQL policy update in supabase/fix-user-search-delete-policy.sql.'
        : error.message,
      error
    );
  }
  return data;
};

export const exportHistory = async (format = 'json') => {
  const rows = await getHistory({ limit: 500, offset: 0 });
  switch (format) {
    case 'csv': {
      const parser = new Parser();
      return { contentType: 'text/csv', body: parser.parse(rows), extension: 'csv' };
    }
    case 'xml':
      return { contentType: 'application/xml', body: toXml(rows), extension: 'xml' };
    case 'md':
    case 'markdown':
      return { contentType: 'text/markdown', body: toMarkdown(rows), extension: 'md' };
    case 'pdf':
      return { contentType: 'application/pdf', body: await toPdfBuffer(rows), extension: 'pdf' };
    case 'json':
    default:
      return { contentType: 'application/json', body: JSON.stringify(rows, null, 2), extension: 'json' };
  }
};
