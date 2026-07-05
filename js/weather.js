const $ = id => document.getElementById(id);
const WMO = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Rime fog', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Dense drizzle', '🌧️'],
  61: ['Light rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'], 66: ['Freezing rain', '🌧️'], 67: ['Freezing rain', '🌧️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '❄️'], 75: ['Heavy snow', '❄️'], 77: ['Snow grains', '🌨️'],
  80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Violent showers', '⛈️'],
  85: ['Snow showers', '🌨️'], 86: ['Snow showers', '❄️'], 95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm', '⛈️'], 99: ['Thunderstorm', '⛈️']
};
const code = c => WMO[c] || ['—', '🌡️'];

async function geocode(name) {
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en`);
  const d = await r.json();
  if (!d.results || !d.results.length) throw new Error('City not found');
  return d.results[0];
}
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
  const r = await fetch(url);
  return r.json();
}
async function show(city) {
  $('status').hidden = false; $('status').textContent = 'Loading…';
  try {
    const w = await getWeather(city.latitude, city.longitude);
    const cur = w.current, [desc, ic] = code(cur.weather_code);
    $('place').textContent = `${city.name}${city.country ? ', ' + city.country : ''}`;
    $('desc').textContent = desc;
    $('icon').textContent = ic;
    $('temp').textContent = Math.round(cur.temperature_2m);
    $('range').textContent = `${Math.round(w.daily.temperature_2m_min[0])}° / ${Math.round(w.daily.temperature_2m_max[0])}°`;
    $('hum').textContent = cur.relative_humidity_2m + '%';
    $('wind').textContent = Math.round(cur.wind_speed_10m) + ' km/h';
    $('current').hidden = false;
    $('fcTitle').hidden = false;
    $('forecast').innerHTML = w.daily.time.map((t, i) => {
      const [, di] = code(w.daily.weather_code[i]);
      const dn = i === 0 ? 'Today' : new Date(t).toLocaleDateString('en-US', { weekday: 'short' });
      return `<div class="day"><div class="dn">${dn}</div><div class="di">${di}</div>
        <div class="dt"><span class="hi">${Math.round(w.daily.temperature_2m_max[i])}°</span>
        <span class="lo"> ${Math.round(w.daily.temperature_2m_min[i])}°</span></div></div>`;
    }).join('');
    $('status').hidden = true;
    localStorage.setItem('weathernow.city', JSON.stringify(city));
  } catch (e) {
    $('status').textContent = 'Could not load weather. Try again.';
  }
}
$('form').addEventListener('submit', async e => {
  e.preventDefault();
  const q = $('q').value.trim(); if (!q) return;
  $('status').hidden = false; $('status').textContent = 'Searching…';
  try {
    const city = await geocode(q); show(city);
    if (window.UI) UI.toast(`Weather for ${city.name}${city.country ? ', ' + city.country : ''}`, 'success');
  }
  catch (err) {
    $('status').textContent = 'City not found — check the spelling.';
    if (window.UI) UI.toast('City not found — check the spelling', 'error');
  }
});
// load last or default
const saved = localStorage.getItem('weathernow.city');
if (saved) show(JSON.parse(saved));
else show({ name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 });
