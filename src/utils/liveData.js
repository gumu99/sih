// Real, browser-backed data lookups JARVIS can use in conversation.
// Each function resolves to a spoken sentence, or throws/rejects if unavailable.

const WEATHER_CODES = {
  0: 'clear sky', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'foggy with frost', 51: 'light drizzle', 53: 'drizzle',
  55: 'heavy drizzle', 61: 'light rain', 63: 'rain', 65: 'heavy rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow', 80: 'light showers',
  81: 'showers', 82: 'violent showers', 95: 'a thunderstorm',
};

function getCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('no geolocation')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 8000 }
    );
  });
}

export async function getWeatherReport() {
  const { lat, lon } = await getCoords();
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
  if (!res.ok) throw new Error('weather fetch failed');
  const data = await res.json();
  const cw = data.current_weather;
  const desc = WEATHER_CODES[cw.weathercode] || 'unclear conditions';
  return `Current conditions near you: ${desc}, with a temperature of ${Math.round(cw.temperature)} degrees Celsius and wind speed of ${Math.round(cw.windspeed)} kilometers per hour.`;
}

export function getLocationReport() {
  return getCoords().then(({ lat, lon }) =>
    `Your approximate coordinates are ${lat.toFixed(3)} latitude, ${lon.toFixed(3)} longitude.`
  );
}

export function getBatteryReport() {
  if (!navigator.getBattery) return Promise.reject(new Error('battery API unsupported'));
  return navigator.getBattery().then((battery) => {
    const pct = Math.round(battery.level * 100);
    const charging = battery.charging ? 'and currently charging' : 'and not currently charging';
    return `Battery level is at ${pct} percent, ${charging}.`;
  });
}

export function getStorageReport() {
  if (!navigator.storage || !navigator.storage.estimate) return Promise.reject(new Error('storage API unsupported'));
  return navigator.storage.estimate().then((est) => {
    const usedMB = Math.round((est.usage || 0) / (1024 * 1024));
    const quotaMB = Math.round((est.quota || 0) / (1024 * 1024));
    return `This browser profile is using approximately ${usedMB} megabytes out of ${quotaMB} available.`;
  });
}

export async function getBitcoinPrice() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  if (!res.ok) throw new Error('price fetch failed');
  const data = await res.json();
  const price = data?.bitcoin?.usd;
  if (!price) throw new Error('no price');
  return `Bitcoin is currently trading at approximately ${price.toLocaleString()} US dollars.`;
}

export async function getUsdInrRate() {
  const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  if (!res.ok) throw new Error('rate fetch failed');
  const data = await res.json();
  const rate = data?.rates?.INR;
  if (!rate) throw new Error('no rate');
  return `The current exchange rate is approximately ${rate.toFixed(2)} rupees per US dollar.`;
}

export function getSystemInfoReport() {
  const mem = navigator.deviceMemory ? `at least ${navigator.deviceMemory} gigabytes of memory` : 'an undetermined amount of memory';
  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} processor cores` : 'an undetermined number of cores';
  const ua = navigator.userAgent;
  let os = 'an unidentified operating system';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';
  return `You're running ${os}, with ${cores} and ${mem} available to this browser.`;
}
