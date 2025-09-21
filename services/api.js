// Simple API client for uploading an image and receiving analysis
// BASE_URL selection rules (overridden by EXPO_PUBLIC_API_URL if set):
//  - Android emulator: http://10.0.2.2:8000
//  - iOS simulator / web: http://127.0.0.1:8000
//  - Physical device (Expo Go): http://<your_lan_ip>:8000
import { Platform } from 'react-native';

const DEFAULT_PORT = 8000;

function getDefaultBaseUrl() {
  if (Platform.OS === 'android') {
    // Works on Android emulator
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }
  // iOS simulator or web dev
  return `http://127.0.0.1:${DEFAULT_PORT}`;
}

let BASE_URL = (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL)
  ? process.env.EXPO_PUBLIC_API_URL
  : getDefaultBaseUrl();

export { BASE_URL };

export function setBaseUrl(url) {
  BASE_URL = url;
}

function fetchWithTimeout(resource, options = {}, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
    fetch(resource, options)
      .then((res) => {
        clearTimeout(timeoutId);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

function normalizeAnalysis(json) {
  return {
    details: {
      Breed: json.breed ?? 'Unknown',
      'Body Length': json.bodyLengthCm != null ? `${json.bodyLengthCm} cm` : '—',
      'Chest Width': json.chestWidthCm != null ? `${json.chestWidthCm} cm` : '—',
      'Rump Angle': json.rumpAngleDeg != null ? `${json.rumpAngleDeg}°` : '—',
      Score: json.score != null ? `${json.score} / 10` : '—',
    },
    raw: json,
  };
}

export async function analyzeImage(uri) {
  const form = new FormData();
  const name = uri.split('/').pop() || 'upload.jpg';
  const fileType = name.includes('.') ? name.split('.').pop() : 'jpg';
  const mime = fileType === 'png' ? 'image/png' : 'image/jpeg';

  form.append('image', {
    uri,
    name,
    type: mime,
  });

  const res = await fetchWithTimeout(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      // NOTE: Do NOT set 'Content-Type' for multipart; let fetch set the boundary
    },
    body: form,
  }, 20000);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return normalizeAnalysis(json);
}

export async function healthCheck(timeoutMs = 3500) {
  const url = `${BASE_URL}/health`;
  const res = await fetchWithTimeout(url, { method: 'GET' }, timeoutMs).catch((e) => {
    throw new Error(`Cannot reach backend at ${BASE_URL}. ${e.message}`);
  });
  if (!res.ok) {
    throw new Error(`Health check failed: HTTP ${res.status}`);
  }
  return true;
}
