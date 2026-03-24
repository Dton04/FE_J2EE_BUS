export interface TripSearchParams {
  origin_id?: number | string;
  destination_id?: number | string;
  origin?: string;
  destination?: string;
  from?: string;
  to?: string;
  originName?: string;
  destinationName?: string;
  origin_name?: string;
  destination_name?: string;
  date?: string;
  departureDate?: string;
  departure_date?: string;
  max_legs?: number;
  min_layover_minutes?: number;
}

export interface Trip {
  price?: number | string;
  availableSeats?: number | string;
  busCompanyName?: string;
  departureTime?: string;
  arrivalTime?: string;
  originName?: string;
  destinationName?: string;
  [key: string]: unknown;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

type StationLike = {
  id?: number | string;
  name?: string;
  city?: string;
  address?: string;
};

let stationCache: StationLike[] | null = null;

function buildUrl(params: TripSearchParams): URL {
  const url = new URL(`${API_BASE}/api/v1/trips`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
  return url;
}

function normalizeError(status: number, body: unknown): string {
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
    if (typeof obj.error === 'string' && obj.error.trim()) return obj.error;
    const nested = obj.data;
    if (nested && typeof nested === 'object') {
      const nestedObj = nested as Record<string, unknown>;
      if (typeof nestedObj.message === 'string' && nestedObj.message.trim()) return nestedObj.message;
      if (typeof nestedObj.error === 'string' && nestedObj.error.trim()) return nestedObj.error;
    }
  }
  return `API error ${status}`;
}

function isNumericLike(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function toPlaceId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    if (isNumericLike(value)) return Number(value);
  }
  return null;
}

function toStationId(station: StationLike): number | null {
  if (typeof station.id === 'number' && Number.isFinite(station.id)) return station.id;
  if (typeof station.id === 'string' && isNumericLike(station.id)) return Number(station.id);
  return null;
}

function asStationArray(payload: unknown): StationLike[] {
  if (Array.isArray(payload)) return payload as StationLike[];
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.content)) return obj.content as StationLike[];
  if (obj.data && typeof obj.data === 'object') {
    const data = obj.data as Record<string, unknown>;
    if (Array.isArray(data.content)) return data.content as StationLike[];
    if (Array.isArray(data.items)) return data.items as StationLike[];
    if (Array.isArray(data.stations)) return data.stations as StationLike[];
  }
  if (Array.isArray(obj.items)) return obj.items as StationLike[];
  if (Array.isArray(obj.stations)) return obj.stations as StationLike[];

  return [];
}

async function getStations(): Promise<StationLike[]> {
  if (stationCache) return stationCache;

  try {
    const res = await fetch(`${API_BASE}/api/v1/stations`, { headers: { accept: 'application/json' } });
    if (!res.ok) return [];
    const body = await res.json().catch(() => null);
    const stations = asStationArray(body);
    stationCache = stations;
    return stations;
  } catch {
    return [];
  }
}

async function resolvePlaceId(value: unknown): Promise<number | null> {
  const directId = toPlaceId(value);
  if (directId) return directId;
  if (typeof value !== 'string' || !value.trim()) return null;

  const keyword = normalizeText(value);
  const stations = await getStations();
  if (!stations.length) return null;

  for (const station of stations) {
    const stationId = toStationId(station);
    if (!stationId) continue;

    const candidates = [station.name, station.city, station.address]
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .map(normalizeText);

    if (candidates.some((v) => v === keyword || v.includes(keyword) || keyword.includes(v))) {
      return stationId;
    }
  }

  return null;
}

function pickFirst(...values: Array<unknown>): unknown {
  return values.find((v) => v !== undefined && v !== null && v !== '');
}

function toIsoDate(value: string | undefined): string {
  if (value && value.trim()) return value;
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export async function searchTrips(params: TripSearchParams): Promise<unknown> {
  const originCandidate = pickFirst(params.origin_id, params.origin, params.from, params.originName, params.origin_name);
  const destinationCandidate = pickFirst(params.destination_id, params.destination, params.to, params.destinationName, params.destination_name);

  const originId = await resolvePlaceId(originCandidate);
  const destinationId = await resolvePlaceId(destinationCandidate);

  if (!originId || !destinationId) {
    throw new Error('Không thể ánh xạ nơi đi/nơi đến sang ID. Vui lòng nhập đúng tên bến xe hoặc chọn từ danh sách gợi ý.');
  }

  const strictParams: TripSearchParams = {
    origin_id: originId,
    destination_id: destinationId,
    date: toIsoDate(params.date),
    max_legs: params.max_legs,
    min_layover_minutes: params.min_layover_minutes,
  };

  const url = buildUrl(strictParams);
  const res = await fetch(url.toString(), { headers: { accept: 'application/json' } });
  const body = await res.json().catch(() => null);
  if (res.ok) return body;

  throw new Error(normalizeError(res.status, body));
}
